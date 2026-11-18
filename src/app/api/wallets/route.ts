import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Wallet } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const db = getDatabase();
    const wallets = db.prepare('SELECT * FROM wallets WHERE user_id = ?').all(user.id) as Wallet[];

    return NextResponse.json({ wallets });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi tải danh sách ví' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { name, type, balance } = await req.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Tên ví và loại là bắt buộc' }, { status: 400 });
    }

    const db = getDatabase();
    const id = `wal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO wallets (id, user_id, name, type, balance)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, user.id, name, type, parseFloat(balance) || 0);

    const wallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(id) as Wallet;
    return NextResponse.json({ wallet }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi tạo ví mới' }, { status: 500 });
  }
}
