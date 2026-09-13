import { NextRequest, NextResponse } from 'next/server';
import {
  getPositionsList,
  savePositionsList,
  getOfficersList,
  saveOfficersList,
  getStructureListAsync,
  PositionNode,
  OfficerNode,
} from '@/lib/data/structure-store';
import { getAdminAccountByUsername } from '@/lib/db';

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
    const positions = getPositionsList();
    const officers = getOfficersList();
    const combined = await getStructureListAsync();

    return NextResponse.json({
      success: true,
      positions,
      officers,
      combined,
      data: combined,
    });
  } catch (error) {
    console.error('Error fetching structure data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data struktur organisasi.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorized = await verifyAuth(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { targetType } = body;

    // 1. TAMBAH MASTER JABATAN
    if (targetType === 'position') {
      const { title, description, level, parentId } = body;
      if (!title || !title.trim()) {
        return NextResponse.json(
          { success: false, error: 'Nama Jabatan wajib diisi.' },
          { status: 400 }
        );
      }

      const positions = getPositionsList();
      const newPos: PositionNode = {
        id: `pos-${Date.now()}`,
        title: title.trim(),
        description: description ? description.trim() : '',
        level: Number(level ?? 2),
        parentId: parentId || null,
      };

      positions.push(newPos);
      savePositionsList(positions);

      return NextResponse.json({
        success: true,
        message: `Struktur Jabatan "${newPos.title}" berhasil ditambahkan.`,
        data: newPos,
      });
    }

    // 2. ASSIGN / TAMBAH PEJABAT PENGURUS
    const { name, positionId, photo, period } = body;
    if (!name || !name.trim() || !positionId) {
      return NextResponse.json(
        { success: false, error: 'Nama Pejabat dan Pilihan Jabatan wajib diisi.' },
        { status: 400 }
      );
    }

    const officers = getOfficersList();
    const newOfficer: OfficerNode = {
      id: `off-${Date.now()}`,
      name: name.trim(),
      positionId,
      photo: photo || '/images/primary/cyberlogo.png',
      period: period || '2025/2026',
    };

    officers.push(newOfficer);
    saveOfficersList(officers);

    return NextResponse.json({
      success: true,
      message: `Pejabat "${newOfficer.name}" berhasil ditambahkan.`,
      data: newOfficer,
    });
  } catch (error) {
    console.error('Error adding structure node:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan data struktur.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authorized = await verifyAuth(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { targetType, id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID data wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. UPDATE MASTER JABATAN
    if (targetType === 'position') {
      const { title, description, level, parentId } = body;
      let positions = getPositionsList();
      const idx = positions.findIndex((p) => p.id === id);

      if (idx === -1) {
        return NextResponse.json(
          { success: false, error: 'Struktur Jabatan tidak ditemukan.' },
          { status: 404 }
        );
      }

      positions[idx] = {
        ...positions[idx],
        title: title ? title.trim() : positions[idx].title,
        description: description !== undefined ? description.trim() : positions[idx].description,
        level: level !== undefined ? Number(level) : positions[idx].level,
        parentId: parentId !== undefined ? parentId : positions[idx].parentId,
      };

      savePositionsList(positions);

      return NextResponse.json({
        success: true,
        message: `Struktur Jabatan "${positions[idx].title}" berhasil diperbarui.`,
        data: positions[idx],
      });
    }

    // 2. UPDATE PEJABAT PENGURUS
    const { name, positionId, photo, period } = body;
    let officers = getOfficersList();
    const idx = officers.findIndex((o) => o.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: 'Data Pejabat tidak ditemukan.' },
        { status: 404 }
      );
    }

    officers[idx] = {
      ...officers[idx],
      name: name ? name.trim() : officers[idx].name,
      positionId: positionId || officers[idx].positionId,
      photo: photo || officers[idx].photo,
      period: period || officers[idx].period,
    };

    saveOfficersList(officers);

    return NextResponse.json({
      success: true,
      message: `Data Pejabat "${officers[idx].name}" berhasil diperbarui.`,
      data: officers[idx],
    });
  } catch (error) {
    console.error('Error updating structure data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data struktur.' },
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
    const id = searchParams.get('id');
    const targetType = searchParams.get('targetType') || 'officer';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID data wajib diisi.' },
        { status: 400 }
      );
    }

    if (targetType === 'position') {
      let positions = getPositionsList();
      const filtered = positions.filter((p) => p.id !== id);
      savePositionsList(filtered);

      return NextResponse.json({
        success: true,
        message: 'Struktur Jabatan berhasil dihapus.',
      });
    }

    let officers = getOfficersList();
    const filtered = officers.filter((o) => o.id !== id);
    saveOfficersList(filtered);

    return NextResponse.json({
      success: true,
      message: 'Data Pejabat berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting structure data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data.' },
      { status: 500 }
    );
  }
}
