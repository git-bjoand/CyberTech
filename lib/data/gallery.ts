export type GalleryCategory = 'all' | 'hackathon' | 'workshop' | 'internal';

export interface GalleryPhoto {
  id: number;
  src: string;   // path in /public, empty = placeholder slot
  alt: string;
  category: Exclude<GalleryCategory, 'all'>;
  year?: number;
}

// Placeholder slots — replace src with actual photo paths when ready
export const photos: GalleryPhoto[] = [
  { id: 1, src: '', alt: 'Hackathon CyberTech 2025', category: 'hackathon', year: 2025 },
  { id: 2, src: '', alt: 'Hackathon CyberTech 2025 — Tim Pemenang', category: 'hackathon', year: 2025 },
  { id: 3, src: '', alt: 'Hackathon CyberTech 2024', category: 'hackathon', year: 2024 },
  { id: 4, src: '', alt: 'Hackathon CyberTech 2024 — Presentasi', category: 'hackathon', year: 2024 },
  { id: 5, src: '', alt: 'Workshop Web Development 2025', category: 'workshop', year: 2025 },
  { id: 6, src: '', alt: 'Workshop Cyber Security 2025', category: 'workshop', year: 2025 },
  { id: 7, src: '', alt: 'Workshop IoT — Telkomsel', category: 'workshop', year: 2024 },
  { id: 8, src: '', alt: 'Webinar Literasi Digital — BI', category: 'workshop', year: 2024 },
  { id: 9, src: '', alt: 'Kegiatan Internal CyberTech 2026', category: 'internal', year: 2026 },
  { id: 10, src: '', alt: 'Pelantikan Pengurus 2026/2027', category: 'internal', year: 2026 },
  { id: 11, src: '', alt: 'Rapat Koordinasi Divisi', category: 'internal', year: 2025 },
  { id: 12, src: '', alt: 'Foto Bersama UKM CyberTech', category: 'internal', year: 2025 },
];
