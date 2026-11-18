import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Transaction, FinancialSummary } from '@/lib/types';
import { CATEGORY_COLORS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = getDatabase();

    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [user.id];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY date ASC';

    const transactions = db.prepare(sql).all(...params) as Transaction[];

    let totalIncome = 0;
    let totalExpense = 0;
    const incomeMap: Record<string, number> = {};
    const expenseMap: Record<string, number> = {};
    const dailyMap: Record<string, { income: number; expense: number }> = {};
    const monthlyMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((tx) => {
      const amount = tx.amount;
      const day = tx.date; // YYYY-MM-DD
      const month = tx.date.substring(0, 7); // YYYY-MM

      if (!dailyMap[day]) {
        dailyMap[day] = { income: 0, expense: 0 };
      }
      if (!monthlyMap[month]) {
        monthlyMap[month] = { income: 0, expense: 0 };
      }

      if (tx.type === 'income') {
        totalIncome += amount;
        incomeMap[tx.category] = (incomeMap[tx.category] || 0) + amount;
        dailyMap[day].income += amount;
        monthlyMap[month].income += amount;
      } else {
        totalExpense += amount;
        expenseMap[tx.category] = (expenseMap[tx.category] || 0) + amount;
        dailyMap[day].expense += amount;
        monthlyMap[month].expense += amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

    const incomeCategories = Object.entries(incomeMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
        color: CATEGORY_COLORS[name] || '#10b981',
      }))
      .sort((a, b) => b.amount - a.amount);

    const expenseCategories = Object.entries(expenseMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: CATEGORY_COLORS[name] || '#ef4444',
      }))
      .sort((a, b) => b.amount - a.amount);

    const dailyTrends = Object.entries(dailyMap).map(([date, values]) => ({
      date,
      income: values.income,
      expense: values.expense,
    }));

    const monthlyTrends = Object.entries(monthlyMap).map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
      net: values.income - values.expense,
    }));

    // Recent 5 transactions
    const recent = [...transactions].reverse().slice(0, 5);

    const summary: FinancialSummary = {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      transactionCount: transactions.length,
      incomeCategories,
      expenseCategories,
      dailyTrends,
      monthlyTrends,
      recentTransactions: recent,
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('Reports GET error:', err);
    return NextResponse.json({ error: 'Lỗi tạo báo cáo tài chính' }, { status: 500 });
  }
}
