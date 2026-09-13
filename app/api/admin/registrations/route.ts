import { NextRequest, NextResponse } from 'next/server';
import { getAllRegistrations, deleteRegistrationRecord, getAdminAccountByUsername } from '@/lib/db';

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

    const data = await getAllRegistrations();

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pendaftaran.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authorized = await verifyAuth(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'ID registrasi wajib disertakan.' },
        { status: 400 }
      );
    }

    const success = await deleteRegistrationRecord(registrationId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Gagal menghapus data pendaftaran.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pendaftaran ${registrationId} berhasil dihapus.`,
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus data.' },
      { status: 500 }
    );
  }
}
