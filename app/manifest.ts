import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UKM Cybertech Politeknik Negeri Padang',
    short_name: 'Cybertech PNP',
    description:
      'Unit Kegiatan Mahasiswa di bidang Teknologi Informasi Politeknik Negeri Padang (Programming, Networking, Multimedia)',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#090d16',
    icons: [
      {
        src: '/images/primary/cyberlogo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/primary/cyberlogo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
