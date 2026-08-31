import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://prisma-rose.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/layanan',
    '/surat',
    '/surat/keamanan',
    '/keuangan/laporan',
    '/keuangan/iuran',
    '/keuangan/pembayaran',
    '/keuangan/event-budget',
    '/keuangan/share',
    '/galeri',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
