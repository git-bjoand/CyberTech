import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

async function handleVerification(req: NextRequest) {
  try {
    const user = await verifyAdminSession(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesi admin tidak valid atau telah berakhir.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sesi tidak valid.' },
      { status: 401 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleVerification(req);
}

export async function POST(req: NextRequest) {
  return handleVerification(req);
}
