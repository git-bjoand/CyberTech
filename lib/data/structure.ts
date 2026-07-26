export interface Member {
  id: number;
  name: string;
  role: string;
  photo: string; // primary portrait/logo
  photo2?: string; // hover swap photo
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
  photo2: '/images/primary/maskot.png',
  level: 'ketua',
};

export const level2: Member[] = [
  {
    id: 2,
    name: 'Dhannisya',
    role: 'Sekretaris Umum',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/maskot.png',
    level: 'sekretaris_bendahara',
  },
  {
    id: 3,
    name: 'Farel Al Furqan',
    role: 'Wakil Ketua Umum',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/maskot.png',
    level: 'wakil',
  },
  {
    id: 4,
    name: 'Sukra Sriwita',
    role: 'Bendahara Umum',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/maskot.png',
    level: 'sekretaris_bendahara',
  },
];

export const level3: Member[] = [
  {
    id: 5,
    name: 'Rayfo Huda',
    role: 'Kepala Departemen HRD',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/maskot.png',
    level: 'departemen',
  },
  {
    id: 6,
    name: 'Muhammad Raihan Pramana Wiguna',
    role: 'Kepala Departemen PR',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/maskot.png',
    level: 'departemen',
  },
  {
    id: 7,
    name: 'Muhammad Hafizh Boyensa',
    role: 'Kepala Departemen CIM',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/maskot.png',
    level: 'departemen',
  },
  {
    id: 8,
    name: 'Muhammad Rofiqul Islamy',
    role: 'Kepala Departemen IT',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/programming.png',
    level: 'departemen',
  },
];

export const level4: Member[] = [
  {
    id: 9,
    name: 'Muhammad Luthfi',
    role: 'Kepala Divisi Networking',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/networking.png',
    level: 'divisi',
  },
  {
    id: 10,
    name: 'Bagastio Putra Joandri',
    role: 'Kepala Divisi Programming',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/programming.png',
    level: 'divisi',
  },
  {
    id: 11,
    name: 'Zahwa Rahmadhania',
    role: 'Kepala Divisi Multimedia',
    photo: '/images/primary/cyberlogo.png',
    photo2: '/images/primary/multimedia.png',
    level: 'divisi',
  },
];
