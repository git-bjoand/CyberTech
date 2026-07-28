import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { LangProvider } from '@/lib/context/LangContext';
import JsonLd from '@/components/JsonLd';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cybertechpnp.org';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'UKM Cybertech PNP — Technology Can Unite Anything',
    template: '%s | UKM Cybertech Politeknik Negeri Padang',
  },
  description:
    'UKM Cybertech adalah Unit Kegiatan Mahasiswa resmi bidang Teknologi Informasi Politeknik Negeri Padang (PNP). Berdiri sejak 2009, kami wadah inovasi bidang Programming, Networking, dan Multimedia.',
  keywords: [
    'Cybertech PNP',
    'UKM Cybertech',
    'UKM Cybertech Politeknik Negeri Padang',
    'Politeknik Negeri Padang',
    'PNP Padang',
    'Teknologi Informasi PNP',
    'Organisasi Teknologi',
    'Organisasi IT Politeknik Negeri Padang',
    'Hackathon PNP',
    'Hackathon Sumbar',
    'Hackathon Nasional Cybertech',
    'Programming PNP',
    'Networking Mikrotik Cisco Padang',
    'Multimedia UI UX Padang',
    'Ormawa PNP',
    'Komunitas IT Sumatera Barat',
    'Unit Kegiatan Mahasiswa TI',
  ],
  authors: [{ name: 'UKM Cybertech PNP', url: siteUrl }],
  creator: 'UKM Cybertech PNP',
  publisher: 'UKM Cybertech Politeknik Negeri Padang',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'id-ID': '/',
      'en-US': '/',
    },
  },
  icons: {
    icon: [
      { url: '/images/primary/cyberlogo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/images/primary/cyberlogo.png',
    apple: '/images/primary/cyberlogo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'UKM Cybertech PNP — Technology Can Unite Anything',
    description:
      'Unit Kegiatan Mahasiswa TI Politeknik Negeri Padang. Mengembangkan bakat mahasiswa di bidang Programming, Networking, dan Multimedia sejak 2009.',
    url: siteUrl,
    siteName: 'UKM Cybertech PNP',
    locale: 'id_ID',
    alternateLocale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/images/primary/cyberlogo.png`,
        width: 1200,
        height: 630,
        alt: 'Logo UKM Cybertech Politeknik Negeri Padang',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UKM Cybertech PNP — Technology Can Unite Anything',
    description:
      'Unit Kegiatan Mahasiswa TI Politeknik Negeri Padang. Wadah inovasi & kompetensi bidang Programming, Networking, & Multimedia.',
    images: [`${siteUrl}/images/primary/cyberlogo.png`],
    creator: '@cybertech_pnp',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '4n0dwgcjPAitPLa1cI3TjFL1X2x5z1Sl1ofzelDXc7c',
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
      <head>
        <JsonLd />
      </head>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <ThemeProvider>
          <LangProvider>{children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

