import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, ensureUserSetup } from '@/lib/db';
import { createSessionToken, parseGoogleIdToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ error: 'Thiếu thông tin xác thực Google' }, { status: 400 });
    }

    const payload = parseGoogleIdToken(credential);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Token Google không hợp lệ' }, { status: 400 });
    }

    const db = getDatabase();
    const now = new Date().toISOString();

    // Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(payload.email) as User | undefined;

    if (!user) {
      const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      db.prepare(`
        INSERT INTO users (id, email, name, avatar, google_id, currency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newUserId,
        payload.email,
        payload.name || payload.email.split('@')[0],
        payload.picture || '',
        payload.sub,
        'VND',
        now,
        now
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId) as User;
      ensureUserSetup(newUserId);
    } else {
      // Update avatar or name if changed
      db.prepare(`
        UPDATE users 
        SET name = ?, avatar = ?, google_id = ?, updated_at = ?
        WHERE id = ?
      `).run(
        payload.name || user.name,
        payload.picture || user.avatar,
        payload.sub,
        now,
        user.id
      );
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as User;
    }

    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Đăng nhập Google thành công',
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra khi xác thực Google' }, { status: 500 });
  }
}
