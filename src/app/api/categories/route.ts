import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const db = getDatabase();
    const categories = db.prepare('SELECT * FROM categories WHERE user_id = ?').all(user.id) as Category[];

    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi tải danh mục' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { name, type, icon, color } = await req.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Tên danh mục và loại là bắt buộc' }, { status: 400 });
    }

    const db = getDatabase();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO categories (id, user_id, name, type, icon, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, user.id, name, type, icon || 'Tag', color || '#64748b');

    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category;
    return NextResponse.json({ category: cat }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lỗi tạo danh mục' }, { status: 500 });
  }
}
