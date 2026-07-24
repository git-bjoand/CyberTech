export type Division = 'programming' | 'networking' | 'multimedia' | 'partnership';

export interface Portfolio {
  id: number;
  title: string;
  description: string;
  division: Division;
  year: number;
  image: string; // path to image, empty string = show placeholder
  tags: string[];
  isPartnership: boolean;
  partner?: string;
  link?: string;
}

export const portfolios: Portfolio[] = [
  {
    id: 1,
    title: 'Hackathon App — CyberTech 2025',
    description: 'Aplikasi manajemen event hackathon yang dibangun selama 24 jam live coding.',
    division: 'programming',
    year: 2025,
    image: '',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    isPartnership: false,
  },
  {
    id: 2,
    title: 'Konfigurasi Jaringan Kampus',
    description: 'Perancangan dan implementasi topologi jaringan untuk area kampus PNP.',
    division: 'networking',
    year: 2024,
    image: '',
    tags: ['Cisco', 'VLAN', 'Routing'],
    isPartnership: false,
  },
  {
    id: 3,
    title: 'Brand Identity CyberTech',
    description: 'Redesain identitas visual lengkap UKM CyberTech termasuk logo, maskot, dan panduan merek.',
    division: 'multimedia',
    year: 2025,
    image: '',
    tags: ['Illustrator', 'Brand Design', 'Motion'],
    isPartnership: false,
  },
  {
    id: 4,
    title: 'Workshop Literasi Digital — Bank Indonesia',
    description: 'Program edukasi literasi digital bersama Bank Indonesia untuk masyarakat Sumatera Barat.',
    division: 'partnership',
    year: 2024,
    image: '',
    tags: ['Edukasi', 'Fintech', 'Literasi Digital'],
    isPartnership: true,
    partner: 'Bank Indonesia',
  },
  {
    id: 5,
    title: 'Inovasi Digital — Telkomsel',
    description: 'Kolaborasi pengembangan solusi teknologi bersama Telkomsel untuk mahasiswa PNP.',
    division: 'partnership',
    year: 2024,
    image: '',
    tags: ['Telco', 'IoT', 'Digital Innovation'],
    isPartnership: true,
    partner: 'Telkomsel',
  },
  {
    id: 6,
    title: 'Mobile App — Student Portal',
    description: 'Aplikasi mobile untuk memudahkan mahasiswa mengakses informasi akademik PNP.',
    division: 'programming',
    year: 2024,
    image: '',
    tags: ['Flutter', 'Dart', 'REST API'],
    isPartnership: false,
  },
];
