export type TransactionType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';

export const MOCK_ACCOUNTS = [
  { id: 'a1', name: 'Nubank', initialBalance: 0, currentBalance: 3200.5 },
  { id: 'a2', name: 'Bradesco', initialBalance: 1000, currentBalance: 740.0 },
  { id: 'a3', name: 'Carteira', initialBalance: 200, currentBalance: 95.0 },
];

export const MOCK_CARDS = [
  { id: 'c1', name: 'Nubank Roxinho', limit: 5000, closingDay: 8, dueDay: 15 },
  { id: 'c2', name: 'Itaú Platinum', limit: 9000, closingDay: 20, dueDay: 27 },
];

export const MOCK_CATEGORIES = [
  { id: 'cat1', name: 'Salário', type: 'ENTRADA' as const },
  { id: 'cat2', name: 'Freelance', type: 'ENTRADA' as const },
  { id: 'cat3', name: 'Alimentação', type: 'SAIDA' as const },
  { id: 'cat4', name: 'Transporte', type: 'SAIDA' as const },
  { id: 'cat5', name: 'Lazer', type: 'SAIDA' as const },
  { id: 'cat6', name: 'Saúde', type: 'SAIDA' as const },
  { id: 'cat7', name: 'Transferência', type: 'TRANSFERENCIA' as const },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 't1',
    amount: 4200,
    type: 'ENTRADA' as TransactionType,
    date: '2026-04-05',
    description: 'Salário abril',
    accountName: 'Nubank',
    categoryName: 'Salário',
    isPaid: true,
  },
  {
    id: 't2',
    amount: 850,
    type: 'SAIDA' as TransactionType,
    date: '2026-04-08',
    description: 'Supermercado',
    accountName: 'Bradesco',
    categoryName: 'Alimentação',
    isPaid: true,
  },
  {
    id: 't3',
    amount: 200,
    type: 'TRANSFERENCIA' as TransactionType,
    date: '2026-04-10',
    description: 'Para carteira',
    accountName: 'Nubank',
    categoryName: 'Transferência',
    isPaid: true,
  },
  {
    id: 't4',
    amount: 320,
    type: 'SAIDA' as TransactionType,
    date: '2026-04-12',
    description: 'Uber / transporte',
    accountName: 'Nubank',
    categoryName: 'Transporte',
    isPaid: true,
  },
  {
    id: 't5',
    amount: 480,
    type: 'SAIDA' as TransactionType,
    date: '2026-04-15',
    description: 'Academia + lazer',
    accountName: 'Nubank',
    categoryName: 'Lazer',
    isPaid: false,
  },
];

export const MOCK_CATEGORY_CHART = [
  { category: 'Alimentação', total: 850, color: '#34d399' },
  { category: 'Transporte', total: 320, color: '#60a5fa' },
  { category: 'Lazer', total: 480, color: '#f472b6' },
  { category: 'Saúde', total: 120, color: '#fb923c' },
];
