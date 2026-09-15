import { NextResponse } from 'next/server';
import { getEventsFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getEventsFromDb();
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
