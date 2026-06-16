export type TransactionType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';
export type CategoryType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';

export type Account = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  color: string;
  showOnDashboard: boolean;
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
  parentCategoryId?: string | null;
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
  avatarUrl?: string | null;
  phone?: string | null;
  marketingConsent?: boolean;
  lastWorkspaceId?: string | null;
};

export type UpdateProfileDto = {
  name?: string;
  avatarUrl?: string;
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

export type DeleteAccountDto = {
  password: string;
};

export type Workspace = {
  id: string;
  name: string;
  currency: 'EUR' | 'USD' | 'BRL' | 'GBP';
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
  phone?: string;
  marketingConsent?: boolean;
  leadSource?: string;
  leadCampaign?: string;
};

export type SupabaseExchangeDto = {
  accessToken: string;
  name?: string;
  workspaceName?: string;
  phone?: string;
  marketingConsent?: boolean;
  leadSource?: string;
  leadCampaign?: string;
};

export type MigrateLocalUserDto = {
  email: string;
  password: string;
  phone?: string;
  marketingConsent?: boolean;
  leadSource?: string;
  leadCampaign?: string;
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
  categoryId?: string;
};

export type CreateAccountDto = {
  name: string;
  initialBalance: number;
  icon: string;
  color: string;
  showOnDashboard?: boolean;
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
  parentCategoryId?: string;
};

export type CreateWorkspaceDto = {
  name: string;
  currency?: 'EUR' | 'USD' | 'BRL' | 'GBP';
};

export type UpdateWorkspaceDto = Partial<CreateWorkspaceDto>;

export type ReportCategorySlice = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  rootCategoryId: string;
  subCategoryId?: string;
  total: number;
};

export type ReportAccountSlice = {
  accountId: string;
  accountName: string;
  accountColor: string;
  accountIcon: string;
  total: number;
};

export type ReportDailyFlowPoint = {
  date: string;
  income: number;
  expense: number;
};

export type ReportAnalytics = {
  month: number;
  year: number;
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
  expensesByCategory: ReportCategorySlice[];
  incomesByCategory: ReportCategorySlice[];
  expensesByAccount: ReportAccountSlice[];
  incomesByAccount: ReportAccountSlice[];
  dailyFlow: ReportDailyFlowPoint[];
};
