import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, ensureUserSetup } from '@/lib/db';
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Vui lòng nhập địa chỉ email hợp lệ' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Địa chỉ email không đúng định dạng' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải chứa ít nhất 6 ký tự' }, { status: 400 });
    }

    const displayName = (name && typeof name === 'string' && name.trim()) 
      ? name.trim() 
      : trimmedEmail.split('@')[0];

    const db = getDatabase();

    // Check if user with this email already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(trimmedEmail) as User | undefined;
    if (existing) {
      if (existing.password_hash) {
        return NextResponse.json({ 
          error: 'Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.' 
        }, { status: 400 });
      } else {
        // User previously logged in with Google but hasn't set a password
        const passwordHash = hashPassword(password);
        const now = new Date().toISOString();
        db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
          .run(passwordHash, now, existing.id);

        const sessionToken = await createSessionToken({
          userId: existing.id,
          email: existing.email,
          name: existing.name,
          avatar: existing.avatar,
        });

        const safeUser = { ...existing, password_hash: undefined };
        const response = NextResponse.json({
          success: true,
          user: safeUser,
          message: 'Đã cập nhật mật khẩu cho tài khoản của bạn',
        });

        response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60,
        });

        return response;
      }
    }

    // Create new user
    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, name, avatar, google_id, password_hash, currency, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newUserId,
      trimmedEmail,
      displayName,
      avatar,
      null,
      passwordHash,
      'VND',
      now,
      now
    );

    // Seed default categories, wallets, welcome note
    ensureUserSetup(newUserId);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId) as User;
    const safeUser = { ...newUser, password_hash: undefined };

    const sessionToken = await createSessionToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      avatar: safeUser.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Đăng ký tài khoản thành công',
    }, { status: 201 });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra trong quá trình đăng ký' }, { status: 500 });
  }
}
