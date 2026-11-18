import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST() {
  try {
    const db = getDatabase();
    const demoUser = db.prepare('SELECT * FROM users WHERE id = ?').get('demo-user') as User;

    if (!demoUser) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản trải nghiệm' }, { status: 404 });
    }

    const sessionToken = await createSessionToken({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      avatar: demoUser.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user: demoUser,
      message: 'Chuyển sang chế độ Demo thành công',
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Guest Auth Error:', err);
    return NextResponse.json({ error: 'Lỗi đăng nhập khách' }, { status: 500 });
  }
}
