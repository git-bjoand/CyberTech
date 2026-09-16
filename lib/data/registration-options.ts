export interface JurusanOption {
  id: string;
  name: string;
  prodi: string[];
}

export const JURUSAN_LIST: JurusanOption[] = [
  {
    id: 'ti',
    name: 'Teknologi Informasi',
    prodi: [
      'D4 Teknologi Rekayasa Perangkat Lunak',
      'D4 Animasi',
      'D3 Teknik Komputer',
      'D3 Manajemen Informatika',
    ],
  },
  {
    id: 'an',
    name: 'Administrasi Niaga',
    prodi: [
      'D3 Administrasi Bisnis',
      'D4 Bisnis Digital',
      'D4 Usaha Perjalanan Wisata',
      'D4 Destinasi Pariwisata',
      'D4 Logistik Perdagangan Internasional',
    ],
  },
  {
    id: 'elektro',
    name: 'Teknik Elektro',
    prodi: [
      'D3 Teknik Listrik',
      'D3 Teknik Elektronika',
      'D3 Teknik Telekomunikasi',
      'D4 Teknologi Rekayasa Instalasi Listrik',
      'D4 Teknik Elektronika Industri',
      'D4 Teknik Telekomunikasi',
      'D4 Teknologi Rekayasa Internet',
    ],
  },
  {
    id: 'bi',
    name: 'Bahasa Inggris',
    prodi: [
      'D3 Bahasa Inggris',
      'D4 Bahasa Inggris untuk Komunikasi Bisnis dan Profesional',
    ],
  },
  {
    id: 'mesin',
    name: 'Teknik Mesin',
    prodi: [
      'D3 Teknik Mesin',
      'D3 Teknik Alat Berat',
      'D4 Teknik Manufaktur',
      'D4 Rekayasa Perancangan Mekanik',
    ],
  },
  {
    id: 'akuntansi',
    name: 'Akuntansi',
    prodi: [
      'D3 Akuntansi',
      'D4 Akuntansi',
    ],
  },
  {
    id: 'sipil',
    name: 'Teknik Sipil',
    prodi: [
      'D4 Teknik Perencanaan Irigasi dan Rawa',
      'D4 Manajemen Rekayasa Konstruksi',
      'D4 Perancangan Jalan dan Jembatan',
    ],
  },
];

export const DIVISI_LIST = [
  {
    id: 'programming',
    name: 'Programming',
    desc: 'Web Dev, Mobile Dev, Software Engineering, AI & Machine Learning',
    badge: 'Code & Build',
  },
  {
    id: 'networking',
    name: 'Networking',
    desc: 'MikroTik, Cisco, Cloud Infrastructure, Cyber Security & Sysadmin',
    badge: 'Network & Security',
  },
  {
    id: 'multimedia',
    name: 'Multimedia',
    desc: 'UI/UX Design, Graphic Design, Motion Graphics, Video & Content Creation',
    badge: 'Design & Creative',
  },
];
