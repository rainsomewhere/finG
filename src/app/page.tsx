'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { ReportsView } from '@/components/ReportsView';
import { NotesView } from '@/components/NotesView';
import { AuthModal } from '@/components/AuthModal';
import { User, Transaction, FinancialNote, Category, Wallet } from '@/lib/types';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<'transactions' | 'reports' | 'notes'>('transactions');
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notes, setNotes] = useState<FinancialNote[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('fing_dark') === 'true' || 
      (!('fing_dark' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('fing_dark', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch current user
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setIsDemo(data.isDemo);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  // Fetch all core data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [txRes, notesRes, catRes, walRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/notes'),
        fetch('/api/categories'),
        fetch('/api/wallets'),
      ]);

      const [txData, notesData, catData, walData] = await Promise.all([
        txRes.json(),
        notesRes.json(),
        catRes.json(),
        walRes.json(),
      ]);

      if (txData.transactions) setTransactions(txData.transactions);
      if (notesData.notes) setNotes(notesData.notes);
      if (catData.categories) setCategories(catData.categories);
      if (walData.wallets) setWallets(walData.wallets);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchData();
  }, [fetchData]);

  // Global keyboard shortcut 'N' for quick add transaction (Desktop PC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'n' &&
        !['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName?.toLowerCase()) &&
        !isTxModalOpen &&
        !isAuthModalOpen
      ) {
        e.preventDefault();
        setEditingTx(null);
        setIsTxModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTxModalOpen, isAuthModalOpen]);

  // Transactions handlers
  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    if (editingTx) {
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Cập nhật giao dịch thất bại');
    } else {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Thêm giao dịch thất bại');
    }
    await fetchData();
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  // Notes handlers
  const handleCreateNote = async (data: Partial<FinancialNote>) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { note } = await res.json();
      setNotes((prev) => [note, ...prev]);
    }
  };

  const handleUpdateNote = async (id: string, data: Partial<FinancialNote>) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { note } = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === id ? note : n)));
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  // Auth handlers
  const handleGoogleSuccess = async (credential: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) throw new Error('Đăng nhập Google thất bại');
    await fetchUser();
    await fetchData();
  };

  const handleGuestLogin = async () => {
    const res = await fetch('/api/auth/guest', { method: 'POST' });
    if (!res.ok) throw new Error('Chuyển sang chế độ khách thất bại');
    await fetchUser();
    await fetchData();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await fetchUser();
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Navbar: Clean & compact */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        user={user}
        isDemo={isDemo}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area: pb-24 on mobile for bottom bar safe margin, pb-10 on PC */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-10">
        {loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Đang tải FinG...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'transactions' && (
              <TransactionList
                transactions={transactions}
                onEdit={(tx) => {
                  setEditingTx(tx);
                  setIsTxModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
                onOpenNew={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
                categories={categories}
                wallets={wallets}
              />
            )}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'notes' && (
              <NotesView
                notes={notes}
                onCreateNote={handleCreateNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Dock) */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
      />

      {/* Transaction Modal (Bottom-sheet on mobile, centered modal on PC) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTx}
        categories={categories}
        wallets={wallets}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleSuccess={handleGoogleSuccess}
        onGuestLogin={handleGuestLogin}
        onAuthSuccess={async () => {
          await fetchUser();
          await fetchData();
        }}
        isDemo={isDemo}
      />
    </div>
  );
}
