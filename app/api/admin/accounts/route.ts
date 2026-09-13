import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminAccountsFromDb,
  createAdminAccountInDb,
  deleteAdminAccountFromDb,
  updateAdminAccountInDb,
  getAdminAccountByUsername,
} from '@/lib/db';

async function verifyAuth(req: NextRequest): Promise<boolean> {
  const secret = req.headers.get('x-admin-secret') || new URL(req.url).searchParams.get('secret');
  if (process.env.ADMIN_SECRET_KEY && secret === process.env.ADMIN_SECRET_KEY) {
    return true;
  }

  const requester = req.headers.get('x-admin-username') || new URL(req.url).searchParams.get('requester');
  if (requester) {
    const user = await getAdminAccountByUsername(requester);
    if (user) return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  try {
    const authorized = await verifyAuth(req);
    if (!authorized) {
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
    const authorized = await verifyAuth(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Pembuatan akun hanya dapat dilakukan di portal admin yang sah.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { username, password, fullName, role } = body;

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Username, Password, dan Nama Lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    const success = await createAdminAccountInDb(username, password, fullName, role || 'admin');

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
    const body = await req.json();
    const { id, username, newUsername, fullName, role, newPassword, requesterUsername } = body;

    const requester = requesterUsername || req.headers.get('x-admin-username');
    if (!requester) {
      return NextResponse.json(
        { success: false, error: 'Identitas pemohon wajib disertakan.' },
        { status: 401 }
      );
    }

    const reqUser = await getAdminAccountByUsername(requester);
    if (!reqUser) {
      return NextResponse.json(
        { success: false, error: 'Sesi pemohon tidak valid.' },
        { status: 401 }
      );
    }

    const isSuperAdmin = reqUser.role === 'superadmin' || reqUser.username.toLowerCase() === 'admin';
    const isTargetSelf = username && reqUser.username.toLowerCase() === username.toLowerCase();

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
    const authorized = await verifyAuth(req);
    if (!authorized) {
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
