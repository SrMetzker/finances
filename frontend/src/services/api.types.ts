export type TransactionType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';
export type CategoryType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';

export type Account = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  color: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  note?: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;
  receiptUrl?: string;
  workspaceId: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  account?: Account;
  destinationAccount?: Account | null;
  category?: Category;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
  workspace?: Workspace;
};

export type RegisterDto = {
  name: string;
  email: string;
  password: string;
  workspaceName?: string;
};

export type CreateTransactionDto = {
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  note?: string;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId: string;
};

export type CreateAccountDto = {
  name: string;
  initialBalance: number;
  icon: string;
  color: string;
};

export type CreateCardDto = {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
};

export type CreateCategoryDto = {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
};
