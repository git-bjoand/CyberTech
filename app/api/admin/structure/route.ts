import { NextRequest, NextResponse } from 'next/server';
import {
  getPositionsList,
  getPositionsListAsync,
  savePositionsList,
  getOfficersList,
  getOfficersListAsync,
  saveOfficersList,
  getStructureListAsync,
  PositionNode,
  OfficerNode,
} from '@/lib/data/structure-store';
import {
  savePositionToDb,
  deletePositionFromDb,
  saveOfficerToDb,
  deleteOfficerFromDb,
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const positions = await getPositionsListAsync();
    const officers = await getOfficersListAsync();
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
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
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

      const newPos: PositionNode = {
        id: `pos-${Date.now()}`,
        title: title.trim(),
        description: description ? description.trim() : '',
        level: Number(level ?? 2),
        parentId: parentId || null,
      };

      // Simpan ke PostgreSQL DB (bekerja di Vercel)
      await savePositionToDb(newPos);

      // Sinkronisasi JSON lokal jika ada
      const positions = getPositionsList();
      positions.push(newPos);
      savePositionsList(positions);

      return NextResponse.json({
        success: true,
        message: `Struktur Jabatan "${newPos.title}" berhasil ditambahkan.`,
        data: newPos,
      });
    }

    // 2. ASSIGN / TAMBAH PEJABAT PENGURUS
    const { name, positionId, photo, photo2, period } = body;
    if (!name || !name.trim() || !positionId) {
      return NextResponse.json(
        { success: false, error: 'Nama Pejabat dan Pilihan Jabatan wajib diisi.' },
        { status: 400 }
      );
    }

    const newOfficer: OfficerNode = {
      id: `off-${Date.now()}`,
      name: name.trim(),
      positionId,
      photo: photo || '/images/primary/cyberlogo.png',
      photo2: photo2 || photo || '/images/primary/maskot.png',
      period: period || '2025/2026',
    };

    // Simpan ke PostgreSQL DB (bekerja di Vercel)
    await saveOfficerToDb(newOfficer);

    // Sinkronisasi JSON lokal jika ada
    const officers = getOfficersList();
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
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
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

    // 1. UPDATE MASTER JABATAN (Memperbaiki tombol edit struktur di Vercel)
    if (targetType === 'position') {
      const { title, description, level, parentId } = body;
      const positions = await getPositionsListAsync();
      const existing = positions.find((p) => p.id === id);

      const updatedPos: PositionNode = {
        id,
        title: title ? title.trim() : (existing?.title || 'Jabatan'),
        description: description !== undefined ? description.trim() : (existing?.description || ''),
        level: level !== undefined ? Number(level) : (existing?.level ?? 2),
        parentId: parentId !== undefined ? parentId : (existing?.parentId || null),
      };

      // Simpan langsung ke PostgreSQL DB
      await savePositionToDb(updatedPos);

      // Update file cadangan JSON lokal jika ada
      const localList = getPositionsList();
      const idx = localList.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localList[idx] = updatedPos;
        savePositionsList(localList);
      }

      return NextResponse.json({
        success: true,
        message: `Struktur Jabatan "${updatedPos.title}" berhasil diperbarui.`,
        data: updatedPos,
      });
    }

    // 2. UPDATE PEJABAT PENGURUS (dengan photo & photo2)
    const { name, positionId, photo, photo2, period } = body;
    const officers = await getOfficersListAsync();
    const existing = officers.find((o) => o.id === id);

    const updatedOfficer: OfficerNode = {
      id,
      name: name ? name.trim() : (existing?.name || ''),
      positionId: positionId || existing?.positionId || '',
      photo: photo || existing?.photo || '/images/primary/cyberlogo.png',
      photo2: photo2 !== undefined ? photo2 : (existing?.photo2 || existing?.photo || '/images/primary/maskot.png'),
      period: period || existing?.period || '2025/2026',
    };

    // Simpan langsung ke PostgreSQL DB
    await saveOfficerToDb(updatedOfficer);

    // Update file cadangan JSON lokal jika ada
    const localOfficers = getOfficersList();
    const idx = localOfficers.findIndex((o) => o.id === id);
    if (idx !== -1) {
      localOfficers[idx] = updatedOfficer;
      saveOfficersList(localOfficers);
    }

    return NextResponse.json({
      success: true,
      message: `Data Pejabat "${updatedOfficer.name}" berhasil diperbarui.`,
      data: updatedOfficer,
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
    const adminUser = await verifyAdminSession(req);
    if (!adminUser) {
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
      await deletePositionFromDb(id);

      const positions = getPositionsList();
      const filtered = positions.filter((p) => p.id !== id);
      savePositionsList(filtered);

      return NextResponse.json({
        success: true,
        message: 'Struktur Jabatan berhasil dihapus.',
      });
    }

    await deleteOfficerFromDb(id);

    const officers = getOfficersList();
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
