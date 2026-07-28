export default function JsonLd() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cyber-tech-eosin.vercel.app').replace(/\/$/, '');

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'Organization'],
    '@id': `${baseUrl}/#organization`,
    name: 'UKM Cybertech Politeknik Negeri Padang',
    alternateName: ['Cybertech PNP', 'UKM Cybertech', 'CyberTech'],
    url: baseUrl,
    logo: `${baseUrl}/images/primary/cyberlogo.png`,
    image: `${baseUrl}/images/primary/cyberlogo.png`,
    description:
      'Unit Kegiatan Mahasiswa di bidang Teknologi Informasi Politeknik Negeri Padang (PNP). Berdiri sejak 2009, fokus pada pengembangan bakat di bidang Programming, Networking, dan Multimedia.',
    foundingDate: '2009-05-14',
    email: 'cybertechpnpofficial@gmail.com',
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Politeknik Negeri Padang',
      url: 'https://www.pnp.ac.id',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kampus Politeknik Negeri Padang, Limau Manis',
      addressLocality: 'Padang',
      addressRegion: 'Sumatera Barat',
      postalCode: '25164',
      addressCountry: 'ID',
    },
    sameAs: [
      'https://instagram.com/cybertech_pnp',
      'https://instagram.com/hackathon_cybertech',
      'https://youtube.com/@cybertechpnp',
    ],
    knowsAbout: [
      'Web Development',
      'Mobile Development',
      'Computer Networking',
      'Cyber Security',
      'UI/UX Design',
      'Graphic Design',
      'Machine Learning',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'UKM Cybertech PNP — Technology Can Unite Anything',
    description:
      'Official Website UKM Cybertech Politeknik Negeri Padang. Tempat berkarya, berkolaborasi, dan berinovasi di bidang IT.',
    inLanguage: ['id-ID', 'en-US'],
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };

  const hackathonEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${baseUrl}/#event-hackathon`,
    name: 'Hackathon Nasional UKM Cybertech PNP',
    description:
      'Ajang kompetisi live coding 24 jam nonstop untuk mengembangkan produk perangkat lunak dan inovasi teknologi digital.',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    organizer: {
      '@id': `${baseUrl}/#organization`,
    },
    location: {
      '@type': 'Place',
      name: 'Politeknik Negeri Padang',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Padang',
        addressRegion: 'Sumatera Barat',
        addressCountry: 'ID',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hackathonEventSchema) }}
      />
    </>
  );
}
