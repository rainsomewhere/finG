'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, Wallet as WalletIcon, Tag, AlignLeft } from 'lucide-react';
import { Transaction, TransactionType, Category, Wallet } from '@/lib/types';
import { getTodayString } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Partial<Transaction>) => Promise<void>;
  initialData?: Transaction | null;
  categories: Category[];
  wallets: Wallet[];
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  wallets,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [wallet, setWallet] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setWallet(initialData.wallet);
      setDate(initialData.date);
      setNote(initialData.note || '');
    } else {
      setType('expense');
      setAmount('');
      setDate(getTodayString());
      setNote('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      if (defaultCat) setCategory(defaultCat.name);
      if (wallets.length > 0) setWallet(wallets[0].name);
    }
    setError(null);
  }, [initialData, isOpen, categories, wallets]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstMatching = categories.find((c) => c.type === newType);
    if (firstMatching) {
      setCategory(firstMatching.name);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!category) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    if (!wallet) {
      setError('Vui lòng chọn nguồn tiền / ví');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        type,
        amount: num,
        category,
        wallet,
        date,
        note,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPresetAmount = (preset: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + preset).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 pb-safe sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {initialData ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50">
              {error}
            </div>
          )}

          {/* Type Toggle: Chi tiêu / Thu nhập */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                type === 'expense'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Chi tiêu</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Thu nhập</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Số tiền (VNĐ)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl sm:text-3xl font-bold px-4 py-2.5 sm:py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm sm:text-base font-semibold text-zinc-400">
                ₫
              </span>
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50000, 100000, 200000, 500000, 1000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPresetAmount(preset)}
                  className="text-xs px-2.5 py-1.5 sm:py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-transform"
                >
                  +{preset >= 1000000 ? `${preset / 1000000}tr` : `${preset / 1000}k`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="text-xs px-2 py-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-auto active:scale-95"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* Category & Wallet Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Danh mục</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                <WalletIcon className="w-3.5 h-3.5" />
                <span>Nguồn tiền / Ví</span>
              </label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Ngày giao dịch</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Ghi chú (tùy chọn)</span>
              </label>
              <input
                type="text"
                placeholder="VD: Cà phê sáng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
