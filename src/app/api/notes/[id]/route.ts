import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { FinancialNote } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, content, is_pinned, color, tags } = body;

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(id, user.id) as FinancialNote | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Ghi chú không tồn tại' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const newTitle = title !== undefined ? title : existing.title;
    const newContent = content !== undefined ? content : existing.content;
    const newPinned = is_pinned !== undefined ? (is_pinned ? 1 : 0) : existing.is_pinned;
    const newColor = color !== undefined ? color : existing.color;
    const newTags = tags !== undefined ? tags : existing.tags;

    db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, is_pinned = ?, color = ?, tags = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(newTitle, newContent, newPinned, newColor, newTags, now, id, user.id);

    const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as FinancialNote;

    return NextResponse.json({ success: true, note: updated });
  } catch (err: any) {
    console.error('Notes PUT error:', err);
    return NextResponse.json({ error: 'Lỗi cập nhật ghi chú' }, { status: 500 });
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

    const existing = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Ghi chú không tồn tại' }, { status: 404 });
    }

    db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, user.id);

    return NextResponse.json({ success: true, message: 'Đã xóa ghi chú' });
  } catch (err: any) {
    console.error('Notes DELETE error:', err);
    return NextResponse.json({ error: 'Lỗi xóa ghi chú' }, { status: 500 });
  }
}
