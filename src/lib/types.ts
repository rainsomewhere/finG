export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  google_id?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  wallet: string;
  note: string;
  date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface FinancialNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  color: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'e-wallet';
  balance: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  incomeCategories: { name: string; amount: number; percentage: number; color?: string }[];
  expenseCategories: { name: string; amount: number; percentage: number; color?: string }[];
  dailyTrends: { date: string; income: number; expense: number }[];
  monthlyTrends: { month: string; income: number; expense: number; net: number }[];
  recentTransactions: Transaction[];
}
