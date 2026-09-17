import { NextRequest, NextResponse } from 'next/server';
import { getAllRegistrations, getRegistrationById, deleteRegistrationRecord } from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Sesi admin tidak valid atau tidak ditemukan.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get('registrationId');

    if (registrationId) {
      const item = await getRegistrationById(registrationId);
      if (!item) {
        return NextResponse.json({ success: false, error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: item });
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
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Sesi admin tidak valid atau tidak ditemukan.' },
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
