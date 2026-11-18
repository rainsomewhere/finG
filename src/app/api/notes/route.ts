import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { FinancialNote } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    const params: any[] = [user.id];

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY is_pinned DESC, updated_at DESC';

    const db = getDatabase();
    const notes = db.prepare(sql).all(...params) as FinancialNote[];

    return NextResponse.json({ notes });
  } catch (err: any) {
    console.error('Notes GET error:', err);
    return NextResponse.json({ error: 'Lỗi tải danh sách ghi chú' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, is_pinned, color, tags } = body;

    if (!title && !content) {
      return NextResponse.json({ error: 'Tiêu đề hoặc nội dung không được để trống' }, { status: 400 });
    }

    const db = getDatabase();
    const id = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO notes (id, user_id, title, content, is_pinned, color, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      user.id,
      title || 'Ghi chú không tên',
      content || '',
      is_pinned ? 1 : 0,
      color || 'default',
      tags || '',
      now,
      now
    );

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as FinancialNote;

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (err: any) {
    console.error('Notes POST error:', err);
    return NextResponse.json({ error: 'Lỗi tạo ghi chú' }, { status: 500 });
  }
}
