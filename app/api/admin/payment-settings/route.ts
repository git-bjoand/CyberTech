import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSettingsFromDb, savePaymentSettingsToDb } from '@/lib/db';
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

    const paymentSettings = await getPaymentSettingsFromDb();
    return NextResponse.json({
      success: true,
      paymentSettings,
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil pengaturan pembayaran.' },
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

    const { bankName, accountNumber, accountHolder, notes } = body || {};

    if (!bankName || !accountNumber || !accountHolder) {
      return NextResponse.json(
        { success: false, error: 'Nama bank, nomor rekening, dan atas nama wajib diisi.' },
        { status: 400 }
      );
    }

    const updated = await savePaymentSettingsToDb({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      notes: notes !== undefined ? notes.trim() : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Gagal menyimpan pengaturan pembayaran.' },
        { status: 500 }
      );
    }

    const paymentSettings = await getPaymentSettingsFromDb();

    return NextResponse.json({
      success: true,
      message: 'Pengaturan rekening pembayaran berhasil diperbarui.',
      paymentSettings,
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server saat memperbarui pengaturan pembayaran.' },
      { status: 500 }
    );
  }
}
