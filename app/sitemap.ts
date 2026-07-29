import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cybertech-pnp.vercel.app').replace(/\/$/, '');
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      images: [
        `${baseUrl}/images/primary/cyberlogo.png`,
        `${baseUrl}/images/primary/maskot.png`,
      ],
    },
  ];
}
