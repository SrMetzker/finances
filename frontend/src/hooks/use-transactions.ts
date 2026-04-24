'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TransactionType } from '@/services/api.types';

type AppTransaction = {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  accountName: string;
  categoryName: string;
  isPaid: boolean;
};

const STORAGE_KEY = 'finances.transactions.v1';
const TRANSACTIONS_EVENT = 'finances:transactions:changed';

export type CreateTransactionInput = {
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  accountName: string;
  categoryName: string;
  isPaid: boolean;
};

function readTransactions(): AppTransaction[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as AppTransaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTransactions(transactions: AppTransaction[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  window.dispatchEvent(new Event(TRANSACTIONS_EVENT));
}

function createTransaction(input: CreateTransactionInput): AppTransaction {
  const transaction: AppTransaction = {
    id: `t${Date.now()}`,
    amount: input.amount,
    type: input.type,
    date: input.date,
    description: input.description,
    accountName: input.accountName,
    categoryName: input.categoryName,
    isPaid: input.isPaid,
  };

  const next = [transaction, ...readTransactions()];
  writeTransactions(next);
  return transaction;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<AppTransaction[]>([]);

  useEffect(() => {
    const sync = () => setTransactions(readTransactions());
    sync();

    window.addEventListener(TRANSACTIONS_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(TRANSACTIONS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addTransaction = useCallback((input: CreateTransactionInput) => {
    const created = createTransaction(input);
    setTransactions(readTransactions());
    return created;
  }, []);

  return { transactions, addTransaction };
}
