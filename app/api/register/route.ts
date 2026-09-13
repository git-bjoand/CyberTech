import { NextRequest, NextResponse } from 'next/server';
import { saveRegistrationRecord, getRegistrationStatusFromDb } from '@/lib/db';

// Simple in-memory IP rate limiter
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 submissions per IP per 30 minutes

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter timestamps within current window
  const validTimestamps = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - validTimestamps.length };
}

export async function GET() {
  try {
    const settings = await getRegistrationStatusFromDb();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil status pendaftaran.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const regStatus = await getRegistrationStatusFromDb();
    if (!regStatus.isOpen) {
      return NextResponse.json(
        {
          success: false,
          error: regStatus.message || 'Pendaftaran anggota baru UKM Cybertech PNP saat ini telah resmi ditutup.',
        },
        { status: 403 }
      );
    }

    const ip = getClientIp(req);
    
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Terlalu banyak percobaan pendaftaran dari IP Anda. Demi keamanan dan mencegah spam, silakan coba lagi dalam 30 menit.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      nama,
      noHp,
      jurusan,
      prodi,
      divisi1,
      divisi2,
      buktiPembayaran,
      alasan,
      harapan,
      hp_website,
      form_start_time,
    } = body;

    // 2. Honeypot check (bot trap)
    if (hp_website && hp_website.trim() !== '') {
      // Fake success or drop silent error for bots
      return NextResponse.json(
        { success: false, error: 'Permintaan tidak dapat diproses.' },
        { status: 400 }
      );
    }

    // 3. Minimum submission time check (bots submit instantaneously)
    if (form_start_time) {
      const elapsed = Date.now() - Number(form_start_time);
      if (elapsed < 2000) {
        return NextResponse.json(
          { success: false, error: 'Pengisian form terlalu cepat. Silakan periksa kembali data Anda.' },
          { status: 400 }
        );
      }
    }

    // 4. Input validation
    if (!nama || !nama.trim()) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }
    if (nama.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Nama minimal 3 karakter.' }, { status: 400 });
    }

    if (!noHp || !noHp.trim()) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp / Handphone wajib diisi.' }, { status: 400 });
    }

    if (!jurusan || !jurusan.trim()) {
      return NextResponse.json({ success: false, error: 'Jurusan wajib dipilih.' }, { status: 400 });
    }

    if (!prodi || !prodi.trim()) {
      return NextResponse.json({ success: false, error: 'Program Studi (Prodi) wajib dipilih.' }, { status: 400 });
    }

    if (!divisi1 || !divisi1.trim()) {
      return NextResponse.json({ success: false, error: 'Divisi Pilihan 1 wajib dipilih.' }, { status: 400 });
    }

    if (!buktiPembayaran || typeof buktiPembayaran !== 'string') {
      return NextResponse.json({ success: false, error: 'Bukti pembayaran pendaftaran wajib diunggah.' }, { status: 400 });
    }

    // Check image format & size approximation
    if (!buktiPembayaran.startsWith('data:image/')) {
      return NextResponse.json({ success: false, error: 'File bukti pembayaran harus berupa gambar (JPG, PNG, WebP).' }, { status: 400 });
    }

    // Approx 6MB in base64 string length (~8 million chars)
    if (buktiPembayaran.length > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Ukuran file bukti pembayaran terlalu besar (maksimal 5MB).' }, { status: 400 });
    }

    if (!alasan || alasan.trim().length < 15) {
      return NextResponse.json({ success: false, error: 'Alasan masuk wajib diisi minimal 15 karakter.' }, { status: 400 });
    }

    if (!harapan || harapan.trim().length < 15) {
      return NextResponse.json({ success: false, error: 'Harapan wajib diisi minimal 15 karakter.' }, { status: 400 });
    }

    // 5. Generate Registration Code
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const registrationId = `REG-CYBER-${randomSuffix}`;
    const timestamp = new Date().toISOString();

    // Save registration record to PostgreSQL Database
    await saveRegistrationRecord({
      registrationId,
      nama: nama.trim(),
      noHp: noHp.trim(),
      jurusan: jurusan.trim(),
      prodi: prodi.trim(),
      divisi1: divisi1.trim(),
      divisi2: divisi2 ? divisi2.trim() : 'Tidak ada',
      buktiPembayaran,
      alasan: alasan.trim(),
      harapan: harapan.trim(),
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      registrationId,
      message: 'Pendaftaran Anda berhasil dikirim! Silakan simpan nomor pendaftaran Anda.',
      data: {
        nama: nama.trim(),
        divisi1: divisi1.trim(),
        registrationId,
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('Error on registration endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}
