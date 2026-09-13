import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import RegisterForm from '@/components/RegisterForm';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

export const metadata: Metadata = {
  title: 'Pendaftaran Anggota UKM Cybertech PNP 2026',
  description:
    'Formulir pendaftaran resmi calon anggota baru UKM Cybertech Politeknik Negeri Padang. Pilih divisi Programming, Networking, atau Multimedia.',
  openGraph: {
    title: 'Pendaftaran Anggota UKM Cybertech PNP 2026',
    description:
      'Bergabunglah bersama UKM Cybertech Politeknik Negeri Padang. Kembangkan bakat IT kamu di bidang Programming, Networking, dan Multimedia.',
    siteName: 'UKM Cybertech PNP',
  },
};

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)' }}>
        <RegisterForm />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
