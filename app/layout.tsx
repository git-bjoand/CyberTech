import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { LangProvider } from '@/lib/context/LangContext';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UKM Cybertech PNP — Technology Can Unite Anything',
  description:
    'UKM Cybertech adalah Unit Kegiatan Mahasiswa di bidang Teknologi Informasi Politeknik Negeri Padang. Berdiri sejak 2009, kami mengembangkan minat dan bakat mahasiswa di bidang Programming, Networking, dan Multimedia.',
  keywords: [
    'Cybertech PNP',
    'UKM Cybertech',
    'Politeknik Negeri Padang',
    'Teknologi Informasi',
    'Hackathon',
    'Programming',
    'Networking',
    'Multimedia',
  ],
  openGraph: {
    title: 'UKM Cybertech PNP',
    description: 'Technology Can Unite Anything — UKM TI Politeknik Negeri Padang',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme="dark"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
