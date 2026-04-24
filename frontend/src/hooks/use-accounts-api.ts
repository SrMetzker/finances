'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/services/api.client';
import { WORKSPACE_CHANGED_EVENT } from '@/services/auth.context';
import type { Account, CreateAccountDto } from '@/services/api.types';

const TRANSACTIONS_CHANGED_EVENT = 'finances:transactions-changed';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar contas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAccounts();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchAccounts]);

  useEffect(() => {
    const handleTransactionsChanged = () => {
      void fetchAccounts();
    };

    const handleWorkspaceChanged = () => {
      void fetchAccounts();
    };

    window.addEventListener(TRANSACTIONS_CHANGED_EVENT, handleTransactionsChanged);
    window.addEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);

    return () => {
      window.removeEventListener(TRANSACTIONS_CHANGED_EVENT, handleTransactionsChanged);
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged);
    };
  }, [fetchAccounts]);

  const createAccount = useCallback(async (input: CreateAccountDto) => {
    try {
      setIsLoading(true);
      const newAccount = await apiClient.createAccount(input);
      setAccounts((prev) => [...prev, newAccount]);
      return newAccount;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (id: string, input: Partial<CreateAccountDto>) => {
    try {
      const updated = await apiClient.updateAccount(id, input);
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...updated,
                currentBalance: a.currentBalance,
              }
            : a,
        ),
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar conta';
      setError(message);
      throw err;
    }
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await apiClient.deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar conta';
      setError(message);
      throw err;
    }
  }, []);

  return {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
}
