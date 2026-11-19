import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập email và mật khẩu' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(trimmedEmail) as User | undefined;
    if (!user) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    if (!user.password_hash) {
      if (user.google_id) {
        return NextResponse.json({ 
          error: 'Tài khoản này được tạo bằng Google. Vui lòng chọn "Tiếp tục với Google" hoặc sang tab Đăng ký để đặt mật khẩu.' 
        }, { status: 400 });
      }
      return NextResponse.json({ error: 'Tài khoản chưa thiết lập mật khẩu' }, { status: 400 });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không chính xác' }, { status: 401 });
    }

    const safeUser = { ...user, password_hash: undefined };

    const sessionToken = await createSessionToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      avatar: safeUser.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Đăng nhập thành công',
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
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra trong quá trình đăng nhập' }, { status: 500 });
  }
}
