export interface Member {
  id: number;
  name: string;
  role: string;
  photo: string; // primary portrait
  photo2?: string; // full photo for glitch hover/tap swap
  level: 'ketua' | 'wakil' | 'sekretaris_bendahara' | 'departemen' | 'divisi';
}

// DPH Tree structure for rendering
// Level 1: Ketua Umum
// Level 2: Sekretaris Umum, Wakil Ketua Umum, Bendahara Umum
// Level 3: 4 Kepala Departemen (under Wakil)
// Level 4: 3 Kepala Divisi (under Ka. Dept IT)

export const ketuaUmum: Member = {
  id: 1,
  name: 'Rayhan Ramadhan',
  role: 'Ketua Umum',
  photo: '/images/primary/cyberlogo.png',
  photo2: '/images/primary/cyberlogo.png',
  level: 'ketua',
};

export const level2: Member[] = [
  {
    id: 2,
    name: 'Dhannisya',
    role: 'Sekretaris Umum',
    photo: '',
    level: 'sekretaris_bendahara',
  },
  {
    id: 3,
    name: 'Farel Al Furqan',
    role: 'Wakil Ketua Umum',
    photo: '',
    level: 'wakil',
  },
  {
    id: 4,
    name: 'Sukra Sriwita',
    role: 'Bendahara Umum',
    photo: '',
    level: 'sekretaris_bendahara',
  },
];

export const level3: Member[] = [
  {
    id: 5,
    name: 'Rayfo Huda',
    role: 'Kepala Departemen HRD',
    photo: '',
    level: 'departemen',
  },
  {
    id: 6,
    name: 'Muhammad Raihan Pramana Wiguna',
    role: 'Kepala Departemen PR',
    photo: '',
    level: 'departemen',
  },
  {
    id: 7,
    name: 'Muhammad Hafizh Boyensa',
    role: 'Kepala Departemen CIM',
    photo: '',
    level: 'departemen',
  },
  {
    id: 8,
    name: 'Muhammad Rofiqul Islamy',
    role: 'Kepala Departemen IT',
    photo: '',
    level: 'departemen',
  },
];

export const level4: Member[] = [
  {
    id: 9,
    name: 'Muhammad Luthfi',
    role: 'Kepala Divisi Networking',
    photo: '',
    level: 'divisi',
  },
  {
    id: 10,
    name: 'Bagastio Putra Joandri',
    role: 'Kepala Divisi Programming',
    photo: '',
    level: 'divisi',
  },
  {
    id: 11,
    name: 'Zahwa Rahmadhania',
    role: 'Kepala Divisi Multimedia',
    photo: '',
    level: 'divisi',
  },
];
