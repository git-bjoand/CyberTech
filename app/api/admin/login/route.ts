import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccountInDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await verifyAdminAccountInDb(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau Password Administrator salah.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      user,
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses login admin.' },
      { status: 500 }
    );
  }
}
