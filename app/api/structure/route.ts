import { NextResponse } from 'next/server';
import { getStructureListAsync } from '@/lib/data/structure-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getStructureListAsync();
    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error in public /api/structure:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data struktur DPH.' },
      { status: 500 }
    );
  }
}
