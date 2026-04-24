'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/services/api.client';
import { WORKSPACE_CHANGED_EVENT } from '@/services/auth.context';
import type { Transaction, CreateTransactionDto } from '@/services/api.types';

const TRANSACTIONS_CHANGED_EVENT = 'finances:transactions-changed';

export function useTransactions(month?: number, year?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getTransactions(month, year);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar transações');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTransactions();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchTransactions]);

  useEffect(() => {
    const handleTransactionsChanged = () => {
      void fetchTransactions();
    };

    const handleWorkspaceChanged = () => {
      void fetchTransactions();
    };

    window.addEventListener(TRANSACTIONS_CHANGED_EVENT, handleTransactionsChanged);
    window.addEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);

    return () => {
      window.removeEventListener(TRANSACTIONS_CHANGED_EVENT, handleTransactionsChanged);
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);
    };
  }, [fetchTransactions]);

  const createTransaction = useCallback(
    async (input: CreateTransactionDto) => {
      try {
        setIsLoading(true);
        const newTransaction = await apiClient.createTransaction(input);
        setTransactions((prev) => [newTransaction, ...prev]);
        window.dispatchEvent(new Event(TRANSACTIONS_CHANGED_EVENT));
        return newTransaction;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar transação';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateTransaction = useCallback(async (id: string, input: Partial<CreateTransactionDto>) => {
    try {
      const updated = await apiClient.updateTransaction(id, input);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      window.dispatchEvent(new Event(TRANSACTIONS_CHANGED_EVENT));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar transação';
      setError(message);
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await apiClient.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new Event(TRANSACTIONS_CHANGED_EVENT));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar transação';
      setError(message);
      throw err;
    }
  }, []);

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
