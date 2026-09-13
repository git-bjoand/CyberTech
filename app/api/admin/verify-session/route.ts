import { NextRequest, NextResponse } from 'next/server';
import { getAdminAccountByUsername } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await getAdminAccountByUsername(username);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesi tidak valid atau akun tidak ditemukan di database.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memverifikasi sesi admin.' },
      { status: 500 }
    );
  }
}
