'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  Download, 
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Wallet as WalletIcon,
  Landmark,
  CreditCard,
  Smartphone,
  Banknote,
  SlidersHorizontal
} from 'lucide-react';
import { Transaction, Category, Wallet } from '@/lib/types';
import { formatCurrency, formatDateVietnamese, CATEGORY_COLORS } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenNew: () => void;
  categories: Category[];
  wallets: Wallet[];
  onOpenWalletManagement: () => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onOpenNew,
  categories,
  wallets,
  onOpenWalletManagement,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      if (walletFilter !== 'all' && tx.wallet !== walletFilter) return false;
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesNote = tx.note.toLowerCase().includes(query);
        const matchesCategory = tx.category.toLowerCase().includes(query);
        const matchesWallet = tx.wallet.toLowerCase().includes(query);
        if (!matchesNote && !matchesCategory && !matchesWallet) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, walletFilter, searchTerm]);

  // Aggregate totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filtered.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [filtered]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Transaction[]; dailyTotal: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filtered.forEach((tx) => {
      const current = dateMap.get(tx.date) || [];
      current.push(tx);
      dateMap.set(tx.date, current);
    });

    dateMap.forEach((items, date) => {
      const dailyTotal = items.reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
      }, 0);
      groups.push({ date, items, dailyTotal });
    });

    return groups.sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [filtered]);

  // Export CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Ngày', 'Loại', 'Danh mục', 'Nguồn tiền', 'Số tiền', 'Ghi chú'];
    const rows = filtered.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
      `"${tx.category}"`,
      `"${tx.wallet}"`,
      tx.amount,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinG_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Overview Metric Cards: 3-column responsive layout */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Total Income */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
              Thu nhập
            </span>
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2 text-xs sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
            +{formatCurrency(totals.income)}
          </div>
        </div>

        {/* Total Expense */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
              Chi tiêu
            </span>
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2 text-xs sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 truncate">
            -{formatCurrency(totals.expense)}
          </div>
        </div>

        {/* Net Savings */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
              Chênh lệch
            </span>
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className={`mt-1 sm:mt-2 text-xs sm:text-2xl font-bold tracking-tight truncate ${
            totals.balance >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500'
          }`}>
            {totals.balance >= 0 ? '+' : ''}{formatCurrency(totals.balance)}
          </div>
        </div>
      </div>

      {/* Wallets & Payment Sources Ribbon */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Nguồn tiền & Ví ({wallets.length})
            </h3>
          </div>
          <button
            onClick={onOpenWalletManagement}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm / Quản lý ví</span>
          </button>
        </div>

        {/* Horizontal scrollable wallet badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {wallets.map((w) => {
            const isSelected = walletFilter === w.name;
            return (
              <button
                key={w.id}
                onClick={() => setWalletFilter(isSelected ? 'all' : w.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/70 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
                }`}
                title="Bấm để lọc theo nguồn tiền này"
              >
                <div className={`p-1 rounded-lg ${
                  isSelected ? 'bg-white/20 dark:bg-black/20' : 'bg-white dark:bg-zinc-900 shadow-xs'
                }`}>
                  {w.type === 'bank' && <Landmark className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-zinc-950' : 'text-blue-500'}`} />}
                  {w.type === 'e-wallet' && <Smartphone className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-zinc-950' : 'text-pink-500'}`} />}
                  {w.type === 'card' && <CreditCard className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-zinc-950' : 'text-purple-500'}`} />}
                  {w.type === 'cash' && <Banknote className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-zinc-950' : 'text-emerald-500'}`} />}
                </div>
                <div>
                  <div className="text-[11px] font-semibold leading-none truncate max-w-[130px]">
                    {w.name}
                  </div>
                  <div className={`text-[10px] mt-1 font-medium ${
                    isSelected ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {formatCurrency(w.balance)}
                  </div>
                </div>
              </button>
            );
          })}

          <button
            onClick={onOpenWalletManagement}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 text-zinc-500 dark:text-zinc-400 text-xs shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm ví</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2.5 sm:space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ghi chú, danh mục, ví..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-3 sm:flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
            <button
              onClick={() => setTypeFilter('all')}
              className={`py-1.5 sm:px-3 rounded-lg text-center transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`py-1.5 sm:px-3 rounded-lg text-center transition-all ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Chi tiêu
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`py-1.5 sm:px-3 rounded-lg text-center transition-all ${
                typeFilter === 'income'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Thu nhập
            </button>
          </div>

          {/* Export CSV button (Desktop & Mobile) */}
          <button
            onClick={handleExportCSV}
            title="Xuất dữ liệu CSV"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="inline">Xuất CSV</span>
          </button>
        </div>

        {/* Category & Wallet Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3 h-3" />
            <span>Lọc:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 sm:flex-initial text-xs px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            className="flex-1 sm:flex-initial text-xs px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">Tất cả nguồn tiền</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>

          {(categoryFilter !== 'all' || walletFilter !== 'all' || searchTerm !== '' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setWalletFilter('all');
                setSearchTerm('');
                setTypeFilter('all');
              }}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-auto py-1"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Transaction Groups */}
      <div className="space-y-3 sm:space-y-4">
        {groupedByDate.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Không tìm thấy giao dịch nào
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Hãy thêm giao dịch đầu tiên hoặc thử xóa bộ lọc tìm kiếm.
            </p>
            <button
              onClick={onOpenNew}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium shadow-sm transition-transform active:scale-95"
            >
              + Thêm giao dịch mới
            </button>
          </div>
        ) : (
          groupedByDate.map((group) => (
            <div
              key={group.date}
              className="rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm overflow-hidden"
            >
              {/* Daily Header */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-zinc-50/70 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatDateVietnamese(group.date)}</span>
                </div>
                <div className="font-semibold text-zinc-600 dark:text-zinc-400">
                  {group.dailyTotal > 0 ? '+' : ''}
                  {formatCurrency(group.dailyTotal)}
                </div>
              </div>

              {/* Transactions in this Day */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {group.items.map((tx) => (
                  <div
                    key={tx.id}
                    className="group flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Left Info */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[tx.category] ||
                            (tx.type === 'income' ? '#10b981' : '#ef4444'),
                        }}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {tx.category}
                          </span>
                          <span className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                            {tx.wallet}
                          </span>
                        </div>
                        {tx.note && (
                          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {tx.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Amount & Actions (Mobile & Desktop friendly) */}
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                      <span
                        className={`text-xs sm:text-base font-bold tracking-tight text-right ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>

                      {/* Touch-friendly actions: subtle on mobile, hover-expand on desktop */}
                      <div className="flex items-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Sửa"
                          aria-label="Sửa giao dịch"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
                              onDelete(tx.id);
                            }
                          }}
                          className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Xóa"
                          aria-label="Xóa giao dịch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
