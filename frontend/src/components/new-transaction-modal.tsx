'use client';

import { TransactionFormModal } from '@/components/transaction-form-modal';
import type { CreateTransactionDto, TransactionType } from '@/services/api.types';

export function NewTransactionModal({
  isOpen,
  type,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  type: TransactionType;
  onClose: () => void;
  onSubmit: (payload: CreateTransactionDto) => Promise<void> | void;
}) {
  return (
    <TransactionFormModal
      isOpen={isOpen}
      mode="create"
      type={type}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
