import { NextResponse } from 'next/server';
import {
  getEventsFromDb,
  saveEventToDb,
  deleteEventFromDb,
  getPortfoliosFromDb,
  savePortfolioToDb,
  deletePortfolioFromDb,
  getGalleryPhotosFromDb,
  saveGalleryPhotoToDb,
  deleteGalleryPhotoFromDb,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [events, portfolios, gallery] = await Promise.all([
      getEventsFromDb(),
      getPortfoliosFromDb(),
      getGalleryPhotosFromDb(),
    ]);
    return NextResponse.json({
      success: true,
      data: { events, portfolios, gallery },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'event') {
      const ok = await saveEventToDb(data);
      return NextResponse.json({ success: ok });
    } else if (type === 'portfolio') {
      const ok = await savePortfolioToDb(data);
      return NextResponse.json({ success: ok });
    } else if (type === 'gallery') {
      const ok = await saveGalleryPhotoToDb(data);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'event') {
      const ok = await saveEventToDb(data);
      return NextResponse.json({ success: ok });
    } else if (type === 'portfolio') {
      const ok = await savePortfolioToDb(data);
      return NextResponse.json({ success: ok });
    } else if (type === 'gallery') {
      const ok = await saveGalleryPhotoToDb(data);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Missing type or id' }, { status: 400 });
    }

    if (type === 'event') {
      const ok = await deleteEventFromDb(id);
      return NextResponse.json({ success: ok });
    } else if (type === 'portfolio') {
      const ok = await deletePortfolioFromDb(id);
      return NextResponse.json({ success: ok });
    } else if (type === 'gallery') {
      const ok = await deleteGalleryPhotoFromDb(id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
