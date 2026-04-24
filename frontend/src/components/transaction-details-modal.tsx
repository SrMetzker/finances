'use client';

import { TransactionFormModal } from '@/components/transaction-form-modal';
import type { CreateTransactionDto, Transaction } from '@/services/api.types';

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionId: string, payload: CreateTransactionDto) => Promise<void>;
  onDelete: (transactionId: string) => Promise<void>;
}) {
  if (!transaction) return null;

  return (
    <TransactionFormModal
      isOpen={isOpen}
      mode="edit"
      type={transaction.type}
      initialValues={{
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        isPaid: transaction.isPaid,
        isRecurring: transaction.isRecurring,
        accountId: transaction.accountId,
        destinationAccountId: transaction.destinationAccountId,
        categoryId: transaction.categoryId,
      }}
      onClose={onClose}
      onSubmit={(payload) => onSave(transaction.id, payload)}
      onDelete={() => onDelete(transaction.id)}
    />
  );
}
