'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Wallet as WalletIcon, 
  Landmark, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Trash2, 
  Edit2, 
  Check, 
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Wallet } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface WalletManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onAddWallet: (data: { name: string; type: Wallet['type']; balance: number }) => Promise<void>;
  onUpdateWallet: (id: string, data: { name: string; type: Wallet['type']; balance: number }) => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
}

// Popular Vietnamese banks and e-wallets presets
const PRESET_WALLETS = [
  { name: 'Tài khoản Vietcombank', type: 'bank' as const, label: 'Vietcombank' },
  { name: 'Tài khoản MB Bank', type: 'bank' as const, label: 'MB Bank' },
  { name: 'Tài khoản BIDV', type: 'bank' as const, label: 'BIDV' },
  { name: 'Tài khoản VPBank', type: 'bank' as const, label: 'VPBank' },
  { name: 'Tài khoản ACB', type: 'bank' as const, label: 'ACB' },
  { name: 'Tài khoản TPBank', type: 'bank' as const, label: 'TPBank' },
  { name: 'Tài khoản VietinBank', type: 'bank' as const, label: 'VietinBank' },
  { name: 'Tài khoản Techcombank', type: 'bank' as const, label: 'Techcombank' },
  { name: 'Ví ZaloPay', type: 'e-wallet' as const, label: 'ZaloPay' },
  { name: 'Ví ShopeePay', type: 'e-wallet' as const, label: 'ShopeePay' },
  { name: 'Ví Viettel Money', type: 'e-wallet' as const, label: 'Viettel Money' },
  { name: 'Ví Apple Pay', type: 'e-wallet' as const, label: 'Apple Pay' },
  { name: 'Thẻ tín dụng', type: 'card' as const, label: 'Thẻ tín dụng' },
  { name: 'Sổ tiết kiệm', type: 'bank' as const, label: 'Sổ tiết kiệm' },
  { name: 'Tiền mặt dự phòng', type: 'cash' as const, label: 'Tiền mặt' },
];

export function WalletManagementModal({
  isOpen,
  onClose,
  wallets,
  onAddWallet,
  onUpdateWallet,
  onDeleteWallet,
}: WalletManagementModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<Wallet['type']>('bank');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  const resetForm = () => {
    setName('');
    setType('bank');
    setBalance('');
    setIsAdding(false);
    setEditingId(null);
    setError(null);
  };

  const handleStartEdit = (w: Wallet) => {
    setEditingId(w.id);
    setName(w.name);
    setType(w.type);
    setBalance(w.balance.toString());
    setIsAdding(false);
    setError(null);
  };

  const handleSelectPreset = (preset: typeof PRESET_WALLETS[0]) => {
    setName(preset.name);
    setType(preset.type);
    if (!balance) setBalance('0');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên nguồn tiền');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const numBalance = parseFloat(balance) || 0;

      if (editingId) {
        await onUpdateWallet(editingId, { name: name.trim(), type, balance: numBalance });
      } else {
        await onAddWallet({ name: name.trim(), type, balance: numBalance });
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu nguồn tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, walletName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nguồn tiền "${walletName}"?`)) {
      try {
        await onDeleteWallet(id);
      } catch (err: any) {
        alert(err.message || 'Lỗi xóa nguồn tiền');
      }
    }
  };

  const getWalletIcon = (wType: Wallet['type']) => {
    switch (wType) {
      case 'bank':
        return <Landmark className="w-4 h-4 text-blue-500" />;
      case 'e-wallet':
        return <Smartphone className="w-4 h-4 text-pink-500" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'cash':
      default:
        return <Banknote className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getWalletTypeLabel = (wType: Wallet['type']) => {
    switch (wType) {
      case 'bank':
        return 'Tài khoản ngân hàng';
      case 'e-wallet':
        return 'Ví điện tử';
      case 'card':
        return 'Thẻ tín dụng / ghi nợ';
      case 'cash':
      default:
        return 'Tiền mặt';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 p-5 sm:p-7 pb-safe sm:pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mb-2 sm:hidden shrink-0" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <WalletIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                Quản lý Nguồn tiền & Ví
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Tài khoản ngân hàng, ví điện tử, thẻ và tiền mặt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Assets Card */}
        <div className="my-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Tổng số dư các nguồn
            </span>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
              {formatCurrency(totalBalance)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              {wallets.length} nguồn tiền
            </span>
          </div>
        </div>

        {/* Content Body: Scrollable */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add or Edit Form */}
          {(isAdding || editingId) ? (
            <form onSubmit={handleSave} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingId ? 'Chỉnh sửa nguồn tiền' : 'Thêm nguồn tiền mới'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Hủy
                </button>
              </div>

              {/* Preset buttons (for new wallet) */}
              {!editingId && (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Gợi ý ngân hàng & ví phổ biến:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {PRESET_WALLETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          name === preset.name
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Tên nguồn tiền
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tài khoản MB Bank, Ví ZaloPay..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Loại nguồn tiền
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Wallet['type'])}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  >
                    <option value="bank">Tài khoản Ngân hàng</option>
                    <option value="e-wallet">Ví điện tử</option>
                    <option value="card">Thẻ tín dụng / ghi nợ</option>
                    <option value="cash">Tiền mặt</option>
                  </select>
                </div>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Số dư hiện tại (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full text-sm font-semibold px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
                    ₫
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm nguồn tiền'}
                </button>
              </div>
            </form>
          ) : (
            /* Button to expand Add Form */
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nguồn tiền mới (Ngân hàng, Ví điện tử, Thẻ...)</span>
            </button>
          )}

          {/* Wallets List */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">
              Danh sách nguồn tiền ({wallets.length})
            </h3>

            {wallets.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                Chưa có nguồn tiền nào. Hãy bấm thêm nguồn tiền mới phía trên.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
                {wallets.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        {getWalletIcon(w.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {w.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {getWalletTypeLabel(w.type)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`text-xs sm:text-sm font-bold tracking-tight ${
                          w.balance < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {formatCurrency(w.balance)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pl-1">
                        <button
                          onClick={() => handleStartEdit(w)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Sửa số dư hoặc tên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.name)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Xóa nguồn tiền"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
