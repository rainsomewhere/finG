'use client';

import React, { useState } from 'react';
import { 
  WalletCards, 
  BarChart3, 
  StickyNote, 
  Plus, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { User } from '@/lib/types';

interface NavbarProps {
  currentTab: 'transactions' | 'reports' | 'notes';
  onTabChange: (tab: 'transactions' | 'reports' | 'notes') => void;
  onOpenNewTransaction: () => void;
  user: User | null;
  isDemo: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({
  currentTab,
  onTabChange,
  onOpenNewTransaction,
  user,
  isDemo,
  onOpenAuthModal,
  onLogout,
  darkMode,
  onToggleDarkMode,
}: NavbarProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onTabChange('transactions')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-base sm:text-lg tracking-tight shadow-sm group-hover:scale-105 transition-transform">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                  FinG
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                  minimal
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Desktop only) */}
          <nav className="hidden md:flex items-center ml-4 p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <button
              onClick={() => onTabChange('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                currentTab === 'transactions'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <WalletCards className="w-4 h-4" />
              <span>Thu & Chi</span>
            </button>

            <button
              onClick={() => onTabChange('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                currentTab === 'reports'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Báo cáo</span>
            </button>

            <button
              onClick={() => onTabChange('notes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                currentTab === 'notes'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              <span>Sổ ghi chú</span>
            </button>
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Add Button (Desktop only, mobile has bottom bar FAB) */}
          <button
            onClick={onOpenNewTransaction}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs lg:text-sm shadow-sm transition-transform active:scale-95"
            title="Nhấn 'N' để thêm nhanh"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thu chi</span>
            <kbd className="hidden lg:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 font-mono">
              N
            </kbd>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            title={darkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Đổi giao diện sáng/tối"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Google Sign-in */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  {isDemo && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-none">
                      Chế độ Khách
                    </span>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 p-2 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-xs sm:text-sm">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                      {isDemo && (
                        <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/50">
                          Bạn đang dùng tài khoản Demo. Kết nối tài khoản Google để lưu trữ an toàn trên đám mây.
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      {isDemo ? (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAuthModal();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          Đăng nhập với Google
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAuthModal();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          Đổi tài khoản
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Đăng nhập
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
