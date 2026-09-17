import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminAccountsFromDb,
  createAdminAccountInDb,
  deleteAdminAccountFromDb,
  updateAdminAccountInDb,
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }

    const accounts = await getAdminAccountsFromDb();
    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('Error fetching admin accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data akun admin.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Pembuatan akun hanya dapat dilakukan di portal admin yang sah.' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Body permintaan tidak valid.' }, { status: 400 });
    }

    const { username, password, fullName, role } = body || {};

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Username, Password, dan Nama Lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    const success = await createAdminAccountInDb(username.trim(), password, fullName.trim(), role || 'admin');

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Gagal membuat akun admin. Username mungkin sudah terdaftar.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Akun admin @${username} berhasil dibuat!`,
    });
  } catch (error) {
    console.error('Error creating admin account:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat akun admin.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Body permintaan tidak valid.' }, { status: 400 });
    }

    const { id, username, newUsername, fullName, role, newPassword } = body || {};

    const isSuperAdmin = adminUser.role === 'superadmin' || adminUser.username.toLowerCase() === 'admin';
    const isTargetSelf = username && adminUser.username.toLowerCase() === username.toLowerCase();

    if (!isSuperAdmin && !isTargetSelf) {
      return NextResponse.json(
        { success: false, error: 'Hanya Super Admin (@admin) atau pemilik akun yang dapat mengedit akun ini.' },
        { status: 403 }
      );
    }

    if (newPassword && newPassword.trim().length > 0 && newPassword.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal 4 karakter.' },
        { status: 400 }
      );
    }

    const targetId = id || username;
    const success = await updateAdminAccountInDb(targetId, newUsername, fullName, isSuperAdmin ? role : undefined, newPassword);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Gagal mengupdate akun admin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Data akun @${newUsername || username || 'admin'} berhasil diperbarui!`,
    });
  } catch (error) {
    console.error('Error updating admin account:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate akun admin.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json(
        { success: false, error: 'ID akun wajib disertakan.' },
        { status: 400 }
      );
    }

    const success = await deleteAdminAccountFromDb(Number(idStr));

    return NextResponse.json({
      success,
      message: success ? 'Akun admin berhasil dihapus.' : 'Gagal menghapus akun admin.',
    });
  } catch (error) {
    console.error('Error deleting admin account:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus akun admin.' },
      { status: 500 }
    );
  }
}
