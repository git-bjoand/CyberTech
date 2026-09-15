import fs from 'fs';
import path from 'path';
import {
  getPositionsFromDb,
  savePositionToDb,
  deletePositionFromDb,
  getOfficersFromDb,
  saveOfficerToDb,
  deleteOfficerFromDb,
  getDphStructureFromDb,
} from '@/lib/db';

export interface PositionNode {
  id: string;
  title: string;
  description: string;
  level: number; // 0: Pembina, 1: Ketum, 2: BPH/Komisi, 3: Dept, 4: Divisi
  parentId: string | null;
}

export interface OfficerNode {
  id: string;
  name: string;
  positionId: string; // References PositionNode.id
  photo: string;
  photo2?: string; // Hover swap photo
  period: string;
}

export interface StructureNode {
  id: string;
  name: string;
  role: string;
  description?: string;
  level: number;
  parentId?: string | null;
  positionId?: string;
  photo?: string;
  photo2?: string;
  period?: string;
}

export const DEFAULT_POSITIONS: PositionNode[] = [
  { id: 'pos-0', title: 'Pembina UKM CyberTech', description: 'Membimbing dan memberikan arahan strategis organisasi serta koordinasi dengan pihak Kampus.', level: 0, parentId: null },
  { id: 'pos-1', title: 'Ketua Umum', description: 'Pemimpin tertinggi organisasi, penanggung jawab utama seluruh program kerja dan kebijakan strategis.', level: 1, parentId: 'pos-0' },
  { id: 'pos-2', title: 'Wakil Ketua Umum', description: 'Mendampingi Ketua Umum, mengoordinasikan internal departemen/divisi, dan mewakili Ketua Umum jika berhalangan.', level: 2, parentId: 'pos-1' },
  { id: 'pos-3', title: 'Sekretaris Umum', description: 'Mengelola administrasi organisasi, pengarsipan berkas, persuratan internal/eksternal, dan notulensi rapat.', level: 2, parentId: 'pos-1' },
  { id: 'pos-4', title: 'Bendahara Umum', description: 'Mengelola keuangan organisasi, penyusunan anggaran kas, rekap pendaftaran, dan laporan pertanggungjawaban dana.', level: 2, parentId: 'pos-1' },
  { id: 'pos-komdis', title: 'Komisi Disiplin (Komdis)', description: 'Pengawasan tata tertib, penegakan kedisiplinan pengurus & anggota, serta evaluasi etika organisasi.', level: 2, parentId: 'pos-1' },
  { id: 'pos-5', title: 'Kepala Departemen HRD', description: 'Mengelola pengembangan sumber daya anggota, kaderisasi, pelatihan internal, dan evaluasi keaktifan pengurus.', level: 3, parentId: 'pos-1' },
  { id: 'pos-6', title: 'Kepala Departemen PR', description: 'Penanggung jawab hubungan masyarakat, kerjasama eksternal, kemitraan sponsorship, dan komunikasi publik.', level: 3, parentId: 'pos-1' },
  { id: 'pos-7', title: 'Kepala Departemen CIM', description: 'Mengelola informasi publik, media kreatif, publikasi sosial media, dan dokumentasi visual kegiatan UKM.', level: 3, parentId: 'pos-1' },
  { id: 'pos-8', title: 'Kepala Departemen IT', description: 'Mengendalikan infrastruktur IT, pengembangan teknologi internal, serta pembina teknis Divisi Programming & Networking.', level: 3, parentId: 'pos-1' },
  { id: 'pos-9', title: 'PLT Divisi Programming', description: 'Mengkoordinasikan anggota divisi programming, pelatihan web/mobile app, mini project, dan persiapan lomba coding.', level: 4, parentId: 'pos-8' },
  { id: 'pos-10', title: 'Kepala Divisi Networking', description: 'Pelatihan bidang jaringan komputer, MikroTik, Cisco, cybersecurity, dan pengelolaan infrastruktur lab/server.', level: 4, parentId: 'pos-8' },
  { id: 'pos-11', title: 'Kepala Divisi Multimedia', description: 'Pelatihan bidang UI/UX design, videografi, motion graphic, dan desain materi publikasi visual UKM CyberTech.', level: 4, parentId: 'pos-7' },
];

export const DEFAULT_OFFICERS: OfficerNode[] = [
  { id: 'off-0', name: 'Fazrol Rozi, M.Cs.', positionId: 'pos-0', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-1', name: 'Rayhan Ramadhan', positionId: 'pos-1', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-2', name: 'Farel Al Furqan', positionId: 'pos-2', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-3', name: 'Dhannisya', positionId: 'pos-3', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-4', name: 'Sukra Sriwita', positionId: 'pos-4', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-5', name: 'Rayfo Huda', positionId: 'pos-5', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-6', name: 'Muhammad Raihan Pramana Wiguna', positionId: 'pos-6', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-7', name: 'Muhammad Hafizh Boyensa', positionId: 'pos-7', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/maskot.png', period: '2025/2026' },
  { id: 'off-8', name: 'Muhammad Rofiqul Islamy', positionId: 'pos-8', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/programming.png', period: '2025/2026' },
  { id: 'off-9', name: 'Bagastio Putra Joandri', positionId: 'pos-9', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/programming.png', period: '2025/2026' },
  { id: 'off-10', name: 'Muhammad Luthfi', positionId: 'pos-10', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/networking.png', period: '2025/2026' },
  { id: 'off-11', name: 'Zahwa Rahmadhania', positionId: 'pos-11', photo: '/images/primary/cyberlogo.png', photo2: '/images/primary/multimedia.png', period: '2025/2026' },
];

function getPositionsFilePath(): string {
  return path.join(process.cwd(), 'lib', 'data', 'positions.json');
}

function getOfficersFilePath(): string {
  return path.join(process.cwd(), 'lib', 'data', 'officers.json');
}

// Position Handlers
export function getPositionsList(): PositionNode[] {
  try {
    const fp = getPositionsFilePath();
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, 'utf8');
      if (content.trim()) return JSON.parse(content);
    }
  } catch (err) {}
  return DEFAULT_POSITIONS;
}

export async function getPositionsListAsync(): Promise<PositionNode[]> {
  try {
    const fromDb = await getPositionsFromDb();
    if (fromDb && fromDb.length > 0) return fromDb;
  } catch (err) {}
  return getPositionsList();
}

export function savePositionsList(list: PositionNode[]): boolean {
  try {
    const dataDir = path.join(process.cwd(), 'lib', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(getPositionsFilePath(), JSON.stringify(list, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

// Officer Handlers
export function getOfficersList(): OfficerNode[] {
  try {
    const fp = getOfficersFilePath();
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, 'utf8');
      if (content.trim()) return JSON.parse(content);
    }
  } catch (err) {}
  return DEFAULT_OFFICERS;
}

export async function getOfficersListAsync(): Promise<OfficerNode[]> {
  try {
    const fromDb = await getOfficersFromDb();
    if (fromDb && fromDb.length > 0) return fromDb;
  } catch (err) {}
  return getOfficersList();
}

export function saveOfficersList(list: OfficerNode[]): boolean {
  try {
    const dataDir = path.join(process.cwd(), 'lib', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(getOfficersFilePath(), JSON.stringify(list, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

// Merged Async Getters (reads direct from DB for zero latency & dynamic rendering)
export async function getStructureListAsync(): Promise<StructureNode[]> {
  try {
    const fromDb = await getDphStructureFromDb();
    if (fromDb && fromDb.length > 0) {
      return fromDb.map((node: any) => ({
        id: node.id,
        name: node.name,
        role: node.role,
        description: node.description,
        level: Number(node.level),
        parentId: node.parentId,
        positionId: node.positionId || node.id,
        photo: node.photo || '/images/primary/cyberlogo.png',
        photo2: node.photo2 || node.photo || '/images/primary/maskot.png',
        period: node.period || '2025/2026',
      }));
    }
  } catch (err) {
    console.error('getStructureListAsync DB fetch error:', err);
  }

  // Fallback to local files
  const positions = getPositionsList();
  const officers = getOfficersList();

  return officers.map((off) => {
    const pos = positions.find((p) => p.id === off.positionId) || {
      id: off.positionId,
      title: 'Jabatan Umum',
      description: '',
      level: 2,
      parentId: null,
    };

    return {
      id: off.id,
      name: off.name,
      role: pos.title,
      description: pos.description,
      level: pos.level,
      parentId: pos.parentId,
      positionId: pos.id,
      photo: off.photo,
      photo2: off.photo2 || off.photo,
      period: off.period,
    };
  });
}

export async function saveStructureListAsync(list: StructureNode[]): Promise<boolean> {
  return true;
}

export function getStructureList(): StructureNode[] {
  const positions = getPositionsList();
  const officers = getOfficersList();
  return officers.map((off) => {
    const pos = positions.find((p) => p.id === off.positionId) || {
      id: off.positionId,
      title: 'Jabatan Umum',
      description: '',
      level: 2,
      parentId: null,
    };
    return {
      id: off.id,
      name: off.name,
      role: pos.title,
      description: pos.description,
      level: pos.level,
      parentId: pos.parentId,
      positionId: pos.id,
      photo: off.photo,
      photo2: off.photo2 || off.photo,
      period: off.period,
    };
  });
}

export function saveStructureList(list: StructureNode[]): boolean {
  return true;
}

