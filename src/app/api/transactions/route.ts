import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Transaction } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const wallet = searchParams.get('wallet');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [user.id];

    if (type && (type === 'income' || type === 'expense')) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (wallet) {
      sql += ' AND wallet = ?';
      params.push(wallet);
    }
    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (search) {
      sql += ' AND (note LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY date DESC, created_at DESC LIMIT ?';
    params.push(limit);

    const db = getDatabase();
    const transactions = db.prepare(sql).all(...params) as Transaction[];

    return NextResponse.json({ transactions });
  } catch (err: any) {
    console.error('Transactions GET Error:', err);
    return NextResponse.json({ error: 'Lỗi tải danh sách giao dịch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, category, wallet, note, date } = body;

    if (!type || !amount || !category || !wallet || !date) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }, { status: 400 });
    }

    const numericAmount = Math.abs(parseFloat(amount));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Số tiền không hợp lệ' }, { status: 400 });
    }

    const db = getDatabase();
    const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, category, wallet, note, date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      user.id,
      type,
      numericAmount,
      category,
      wallet,
      note || '',
      date,
      now,
      now
    );

    // Also update wallet balance
    const walletBalanceChange = type === 'income' ? numericAmount : -numericAmount;
    db.prepare(`
      UPDATE wallets 
      SET balance = balance + ?
      WHERE user_id = ? AND name = ?
    `).run(walletBalanceChange, user.id, wallet);

    const newTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction;

    return NextResponse.json({ success: true, transaction: newTx }, { status: 201 });
  } catch (err: any) {
    console.error('Transactions POST Error:', err);
    return NextResponse.json({ error: 'Lỗi tạo giao dịch mới' }, { status: 500 });
  }
}
