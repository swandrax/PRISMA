import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/rw-admin/', '/auth/', '/api/', '/_next/'],
    },
    sitemap: 'https://prisma-rt-04.vercel.app/sitemap.xml',
  }
}
