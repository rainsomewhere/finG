import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Transaction } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { type, amount, category, wallet, note, date } = body;

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, user.id) as Transaction | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Giao dịch không tồn tại' }, { status: 404 });
    }

    const numericAmount = Math.abs(parseFloat(amount || existing.amount));
    const newType = type || existing.type;
    const newCategory = category || existing.category;
    const newWallet = wallet || existing.wallet;
    const newNote = note !== undefined ? note : existing.note;
    const newDate = date || existing.date;
    const now = new Date().toISOString();

    // Revert old wallet balance
    const oldDiff = existing.type === 'income' ? -existing.amount : existing.amount;
    db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND name = ?')
      .run(oldDiff, user.id, existing.wallet);

    // Apply new wallet balance
    const newDiff = newType === 'income' ? numericAmount : -numericAmount;
    db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND name = ?')
      .run(newDiff, user.id, newWallet);

    db.prepare(`
      UPDATE transactions
      SET type = ?, amount = ?, category = ?, wallet = ?, note = ?, date = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(newType, numericAmount, newCategory, newWallet, newNote, newDate, now, id, user.id);

    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction;

    return NextResponse.json({ success: true, transaction: updated });
  } catch (err: any) {
    console.error('Transaction PUT error:', err);
    return NextResponse.json({ error: 'Lỗi cập nhật giao dịch' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, user.id) as Transaction | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Giao dịch không tồn tại' }, { status: 404 });
    }

    // Adjust wallet balance
    const diff = existing.type === 'income' ? -existing.amount : existing.amount;
    db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND name = ?')
      .run(diff, user.id, existing.wallet);

    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, user.id);

    return NextResponse.json({ success: true, message: 'Đã xóa giao dịch' });
  } catch (err: any) {
    console.error('Transaction DELETE error:', err);
    return NextResponse.json({ error: 'Lỗi xóa giao dịch' }, { status: 500 });
  }
}
