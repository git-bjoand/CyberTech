import type { Metadata } from 'next';
import Chatbot from '@/components/Chatbot';
import WorkshopGuide from '@/components/WorkshopGuide';

export const metadata: Metadata = {
  title: 'Panduan Instalasi Workshop — Full-Stack & AI-Assisted Programming',
  description:
    'Panduan lengkap instalasi alat untuk persiapan Workshop Full-Stack Development, Architecture & AI-Assisted Programming: GitHub, Git, Node.js 22, VS Code, Docker, 9Router, OpenCode, dan OpenSpec.',
  openGraph: {
    title: 'Panduan Instalasi Workshop — Full-Stack & AI-Assisted Programming',
    description:
      'Siapkan laptopmu di rumah sebelum hari-H. Ikuti urutan instalasi alat untuk workshop Full-Stack & AI-Assisted Programming.',
    siteName: 'UKM Cybertech PNP',
  },
};

export default function PanduanPage() {
  return (
    <>
      <WorkshopGuide />
      <Chatbot />
    </>
  );
}
