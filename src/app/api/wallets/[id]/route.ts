import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Wallet } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;
    const { name, type, balance } = await req.json();

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM wallets WHERE id = ? AND user_id = ?').get(id, user.id) as Wallet | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Nguồn tiền không tồn tại' }, { status: 404 });
    }

    const newName = name || existing.name;
    const newType = type || existing.type;
    const newBalance = balance !== undefined ? parseFloat(balance) : existing.balance;

    db.prepare(`
      UPDATE wallets
      SET name = ?, type = ?, balance = ?
      WHERE id = ? AND user_id = ?
    `).run(newName, newType, newBalance, id, user.id);

    const updated = db.prepare('SELECT * FROM wallets WHERE id = ?').get(id) as Wallet;
    return NextResponse.json({ success: true, wallet: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi cập nhật nguồn tiền' }, { status: 500 });
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

    const existing = db.prepare('SELECT * FROM wallets WHERE id = ? AND user_id = ?').get(id, user.id) as Wallet | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Nguồn tiền không tồn tại' }, { status: 404 });
    }

    // Check if there are transactions associated with this wallet
    const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND wallet = ?')
      .get(user.id, existing.name) as { count: number };

    db.prepare('DELETE FROM wallets WHERE id = ? AND user_id = ?').run(id, user.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Đã xóa nguồn tiền',
      transactionCount: txCount.count 
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi xóa nguồn tiền' }, { status: 500 });
  }
}
