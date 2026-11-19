import crypto from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getDatabase } from './db';
import { User } from './types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fing-super-secret-key-for-jwt-session-2026'
);

const SESSION_COOKIE_NAME = 'fing_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  exp?: number;
}

export async function createSessionToken(payload: { userId: string; email: string; name: string; avatar?: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<User | null> {
  let token: string | undefined;

  if (req) {
    const cookieHeader = req.cookies.get(SESSION_COOKIE_NAME);
    token = cookieHeader?.value;
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      token = undefined;
    }
  }

  // If no token found, check if demo mode header or query is active, or default to demo-user for seamless testing
  if (!token) {
    // Return demo-user by default so the user can immediately experience the app without friction
    const db = getDatabase();
    const demoUser = db.prepare('SELECT * FROM users WHERE id = ?').get('demo-user') as User | undefined;
    return demoUser || null;
  }

  const session = await verifySessionToken(token);
  if (!session) {
    // If token is invalid, fallback to demo user
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE id = ?').get('demo-user') as User || null;
  }

  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as User | undefined;
  return user || null;
}

export function parseGoogleIdToken(idToken: string): { email: string; name: string; picture: string; sub: string } | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson);
    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
      sub: payload.sub,
    };
  } catch (err) {
    console.error('Failed to parse Google ID token:', err);
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME };
