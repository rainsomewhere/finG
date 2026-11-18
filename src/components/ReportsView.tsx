'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Percent
} from 'lucide-react';
import { FinancialSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function ReportsView() {
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'last_30_days' | 'this_year'>('this_month');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const getDateRange = (selectedPeriod: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (selectedPeriod === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (selectedPeriod === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (selectedPeriod === 'last_30_days') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
    } else if (selectedPeriod === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    }

    const toStr = (d: Date) => d.toISOString().split('T')[0];
    return { startDate: toStr(start), endDate: toStr(end) };
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(period);
      const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header and Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Báo cáo Tài chính
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Dòng tiền, cơ cấu chi tiêu & xu hướng tiết kiệm
          </p>
        </div>

        {/* Period Selector Tabs: Horizontal scroll on mobile */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium overflow-x-auto max-w-full">
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              period === 'this_month'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setPeriod('last_month')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              period === 'last_month'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Tháng trước
          </button>
          <button
            onClick={() => setPeriod('last_30_days')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              period === 'last_30_days'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            30 ngày qua
          </button>
          <button
            onClick={() => setPeriod('this_year')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              period === 'this_year'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Năm nay
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-400">
          Đang tải dữ liệu báo cáo...
        </div>
      ) : summary ? (
        <>
          {/* Summary Cards: 2x2 grid on mobile, 4-col on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  Tổng Thu
                </span>
                <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-base sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
                {formatCurrency(summary.totalIncome)}
              </div>
            </div>

            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  Tổng Chi
                </span>
                <span className="p-1 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                  <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-base sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 truncate">
                {formatCurrency(summary.totalExpense)}
              </div>
            </div>

            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  Tiết kiệm Ròng
                </span>
                <span className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <div className={`mt-1.5 sm:mt-2 text-base sm:text-2xl font-bold tracking-tight truncate ${
                summary.netSavings >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500'
              }`}>
                {summary.netSavings >= 0 ? '+' : ''}{formatCurrency(summary.netSavings)}
              </div>
            </div>

            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  Tỷ lệ Tiết kiệm
                </span>
                <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-base sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {summary.savingsRate}%
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Thu vs Chi Trend Bar Chart */}
            <div className="lg:col-span-2 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Biến động Thu & Chi
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6">
                So sánh dòng tiền vào và dòng tiền ra
              </p>

              <div className="h-60 sm:h-72 w-full">
                {summary.dailyTrends.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                    Chưa có giao dịch trong kỳ này
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={summary.dailyTrends}
                      margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.25} />
                      <XAxis 
                        dataKey="date" 
                        fontSize={10} 
                        tickFormatter={(v) => v.split('-').slice(1).join('/')}
                        stroke="#71717a" 
                      />
                      <YAxis 
                        fontSize={10} 
                        stroke="#71717a" 
                        tickFormatter={(val) => `${val >= 1000000 ? (val / 1000000).toFixed(0) + 'tr' : val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                      />
                      <Tooltip 
                        formatter={(val: any) => formatCurrency(Number(val))}
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Chi tiêu" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Expense Breakdown Donut Chart */}
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Cơ cấu Chi tiêu
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  Tỷ trọng các nhóm chi tiêu
                </p>

                <div className="h-44 sm:h-52 w-full">
                  {summary.expenseCategories.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                      Không có chi tiêu
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.expenseCategories}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={68}
                          paddingAngle={3}
                        >
                          {summary.expenseCategories.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color || COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(val: any) => formatCurrency(Number(val))}
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top Categories mini list */}
              <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {summary.expenseCategories.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }} 
                      />
                      <span className="text-zinc-700 dark:text-zinc-300 truncate font-medium">
                        {cat.name}
                      </span>
                    </div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 shrink-0 ml-2">
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Details breakdown table */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sm:shadow-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Các khoản chi lớn nhất
            </h3>

            {summary.recentTransactions.filter(t => t.type === 'expense').length === 0 ? (
              <p className="text-xs text-zinc-400">Không có dữ liệu chi tiêu</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-[11px] sm:text-xs">
                {summary.recentTransactions
                  .filter((t) => t.type === 'expense')
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {t.category}
                        </span>
                        {t.note && (
                          <span className="text-zinc-500 dark:text-zinc-400 ml-1.5">
                            — {t.note}
                          </span>
                        )}
                        <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 hidden sm:inline">
                          ({t.date})
                        </span>
                      </div>
                      <span className="font-bold text-red-600 dark:text-red-400 shrink-0">
                        -{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-xs text-zinc-400">
          Không thể tải dữ liệu báo cáo
        </div>
      )}
    </div>
  );
}
