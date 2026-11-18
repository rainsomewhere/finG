'use client';

import React from 'react';
import { WalletCards, BarChart3, StickyNote, Plus } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'transactions' | 'reports' | 'notes';
  onTabChange: (tab: 'transactions' | 'reports' | 'notes') => void;
  onOpenNewTransaction: () => void;
}

export function BottomNav({
  currentTab,
  onTabChange,
  onOpenNewTransaction,
}: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2 relative">
        
        {/* Tab 1: Thu Chi */}
        <button
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentTab === 'transactions'
              ? 'text-zinc-900 dark:text-zinc-50 font-semibold'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'transactions' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
            <WalletCards className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Thu chi</span>
        </button>

        {/* Tab 2: Báo cáo */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentTab === 'reports'
              ? 'text-zinc-900 dark:text-zinc-50 font-semibold'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'reports' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Báo cáo</span>
        </button>

        {/* Tab 3: Sổ ghi chú */}
        <button
          onClick={() => onTabChange('notes')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentTab === 'notes'
              ? 'text-zinc-900 dark:text-zinc-50 font-semibold'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'notes' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
            <StickyNote className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Ghi chú</span>
        </button>

        {/* Action: Quick Add FAB */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-md shadow-zinc-900/20 active:scale-95 transition-transform"
            aria-label="Thêm giao dịch mới"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
}
