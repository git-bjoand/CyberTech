import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminAccountByUsername } from '@/lib/db';

export interface AdminSessionUser {
  id: number | string;
  username: string;
  fullName: string;
  role: string;
}

interface SessionPayload extends AdminSessionUser {
  exp: number; // Unix timestamp in ms
}

export const ADMIN_COOKIE_NAME = 'cybertech_admin_session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    'cybertech_secure_session_salt_2026_x89a_prod'
  );
}

/**
 * Sign an admin session payload into a cryptographically secured token (HMAC-SHA256)
 */
export function signAdminToken(user: AdminSessionUser): string {
  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    exp: Date.now() + SESSION_EXPIRY_MS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify HMAC signature and token expiration using constant-time comparison
 */
export function verifyAdminToken(token: string): AdminSessionUser | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  if (!payloadBase64 || !signature) return null;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', getSecretKey())
      .update(payloadBase64)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    // Constant-time comparison prevents timing attacks
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    if (!payload.username) return null;

    return {
      id: payload.id,
      username: payload.username,
      fullName: payload.fullName || payload.username,
      role: payload.role || 'admin',
    };
  } catch (err) {
    return null;
  }
}

/**
 * Verify request authentication using HttpOnly cookie or Authorization Bearer header,
 * or optional server-to-server secret key (X-Admin-Secret).
 *
 * NOTE: Insecure headers like X-Admin-Username or query parameters are STRICTLY IGNORED.
 */
export async function verifyAdminSession(req: NextRequest): Promise<AdminSessionUser | null> {
  // 1. Programmatic/Server-to-Server access via configured secret key
  const serverSecret = req.headers.get('x-admin-secret');
  if (process.env.ADMIN_SECRET_KEY && serverSecret && serverSecret === process.env.ADMIN_SECRET_KEY) {
    return {
      id: 1,
      username: 'admin',
      fullName: 'Super Admin (System Secret)',
      role: 'superadmin',
    };
  }

  // 2. Token from HttpOnly Cookie
  let token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // 3. Fallback: Token from Authorization Bearer Header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  // 4. Verify cryptographic signature & expiration
  const sessionUser = verifyAdminToken(token);
  if (!sessionUser) {
    return null;
  }

  // 5. Verify the user account still exists in the database
  try {
    const dbUser = await getAdminAccountByUsername(sessionUser.username);
    if (!dbUser && sessionUser.username.toLowerCase() !== 'admin') {
      return null;
    }
    if (dbUser) {
      return {
        id: dbUser.id,
        username: dbUser.username,
        fullName: dbUser.fullName || sessionUser.fullName,
        role: dbUser.role || sessionUser.role,
      };
    }
  } catch (e) {
    // If DB check fails due to transient connection issue, rely on valid token
    console.warn('[AdminAuth] DB check error, relying on signed session:', e);
  }

  return sessionUser;
}

/**
 * Helper to attach HttpOnly session cookie to NextResponse
 */
export function setAdminSessionCookie(res: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

/**
 * Helper to delete HttpOnly session cookie
 */
export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
