import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDateVietnamese(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#f97316',
  'Đi lại': '#3b82f6',
  'Mua sắm': '#ec4899',
  'Nhà cửa': '#8b5cf6',
  'Hóa đơn': '#eab308',
  'Giải trí': '#06b6d4',
  'Sức khỏe': '#10b981',
  'Giáo dục': '#6366f1',
  'Lương': '#10b981',
  'Thưởng': '#14b8a6',
  'Đầu tư': '#8b5cf6',
  'Bán đồ': '#f59e0b',
  'Thu khác': '#64748b',
  'Chi khác': '#94a3b8',
};
