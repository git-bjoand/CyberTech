export type EventType = 'annual' | 'workshop' | 'seminar' | 'webinar' | 'collaboration';
export type EventStatus = 'upcoming' | 'past';

export interface Event {
  id: number;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  year?: number;
  date?: string;
  image: string;
  instagram?: string;
  isFeatured: boolean;
  tags: string[];
}

export const events: Event[] = [
  {
    id: 1,
    title: 'Hackathon Nasional CyberTech',
    description: 'Event tahunan bergengsi berupa live coding selama 24 jam non-stop untuk membangun sebuah software inovatif. Terbuka untuk seluruh mahasiswa se-Indonesia.',
    type: 'annual',
    status: 'upcoming',
    year: 2026,
    image: '/images/primary/programming.png',
    instagram: '@hackathon_cybertech',
    isFeatured: true,
    tags: ['24 Jam', 'Nasional', 'Live Coding', 'Tahunan'],
  },
  {
    id: 2,
    title: 'Workshop Web Development',
    description: 'Workshop intensif pengembangan web modern menggunakan teknologi terkini untuk anggota dan umum.',
    type: 'workshop',
    status: 'past',
    year: 2025,
    image: '/images/primary/programming.png',
    isFeatured: false,
    tags: ['Workshop', 'Web Dev', 'Intensif'],
  },
  {
    id: 3,
    title: 'Seminar Cyber Security',
    description: 'Seminar tentang keamanan siber, etika hacking, dan pentingnya perlindungan data digital.',
    type: 'seminar',
    status: 'past',
    year: 2025,
    image: '/images/primary/networking.png',
    isFeatured: false,
    tags: ['Seminar', 'Cybersecurity', 'Awareness'],
  },
  {
    id: 4,
    title: 'Webinar Literasi Digital — Bank Indonesia',
    description: 'Webinar edukasi literasi digital bersama Bank Indonesia untuk mahasiswa dan masyarakat umum Sumatera Barat.',
    type: 'collaboration',
    status: 'past',
    year: 2024,
    image: '/images/primary/cyberlogo.png',
    isFeatured: false,
    tags: ['Webinar', 'Kolaborasi', 'Bank Indonesia', 'Fintech'],
  },
  {
    id: 5,
    title: 'Workshop IoT — Telkomsel',
    description: 'Workshop Internet of Things bersama Telkomsel, memperkenalkan teknologi IoT dan implementasinya di dunia nyata.',
    type: 'collaboration',
    status: 'past',
    year: 2024,
    image: '/images/primary/multimedia.png',
    isFeatured: false,
    tags: ['Workshop', 'IoT', 'Telkomsel', 'Kolaborasi'],
  },
];
