import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationStatusFromDb, saveRegistrationStatusToDb } from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getRegistrationStatusFromDb();
    return NextResponse.json({
      success: true,
      settings,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching registration status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil status pendaftaran.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        { success: false, error: 'Format body JSON tidak valid.' },
        { status: 400 }
      );
    }

    const { isOpen, title, message } = body || {};

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Status isOpen wajib berupa boolean (true/false).' },
        { status: 400 }
      );
    }

    const updated = await saveRegistrationStatusToDb({
      isOpen,
      title: title !== undefined ? title : undefined,
      message: message !== undefined ? message : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Gagal menyimpan status pendaftaran.' },
        { status: 500 }
      );
    }

    const settings = await getRegistrationStatusFromDb();

    return NextResponse.json({
      success: true,
      message: `Status pendaftaran berhasil diubah menjadi ${isOpen ? 'DIBUKA 🟢' : 'DITUTUP 🔴'}.`,
      settings,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server saat memperbarui status pendaftaran.' },
      { status: 500 }
    );
  }
}
