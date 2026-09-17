import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccountInDb } from '@/lib/db';
import {
  getClientIp,
  checkLoginLockout,
  checkLoginRateLimit,
  recordLoginAttempt,
} from '@/lib/rate-limiter';
import { signAdminToken, setAdminSessionCookie } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Rapid Flood Protection (Anti-DoS)
  const floodCheck = checkLoginRateLimit(ip);
  if (!floodCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak permintaan cepat. Silakan tunggu ${floodCheck.retryAfterSeconds} detik lagi.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': floodCheck.retryAfterSeconds.toString() },
      }
    );
  }

  // 2. Safe Request Body Parsing (Never crash with 500 on empty/malformed payload)
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Format permintaan tidak valid atau body kosong.' },
      { status: 400 }
    );
  }

  const { username, password } = body || {};

  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Username dan Password wajib diisi.' },
      { status: 400 }
    );
  }

  // 3. Brute-force Lockout Check
  const lockout = checkLoginLockout(ip, username);
  if (lockout.locked) {
    const minutes = Math.ceil(lockout.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak percobaan login gagal. Akses diblokir sementara demi keamanan sistem. Silakan coba lagi dalam ${minutes} menit.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': lockout.retryAfterSeconds.toString() },
      }
    );
  }

  // 4. Uniform Timing Delay (Prevents side-channel timing analysis)
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    // 5. Verify credentials against DB / master secret
    const user = await verifyAdminAccountInDb(username.trim(), password);

    if (!user) {
      recordLoginAttempt(ip, username, false);
      // Uniform error message prevents username enumeration
      return NextResponse.json(
        { success: false, error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // 6. Login Success
    recordLoginAttempt(ip, username, true);

    const token = signAdminToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      role: user.role || 'admin',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    });

    // Attach HttpOnly cookie for transparent browser session handling
    setAdminSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error('Error during admin login process:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses login admin. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}
