import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

// Suppress harmless Turbopack warning — Serwist is already disabled in non-production via `disable` flag
process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = '1';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== "production",
});

// Conditionally enable static export for Cloudflare Pages or manual static builds
const isStaticExport = 
  process.env.STATIC_EXPORT === 'true' || 
  process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || 
  !!process.env.CF_PAGES;

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  // Fix Turbopack compat error with next-pwa/serwist webpack config
  turbopack: {
    root: process.cwd(),
  },
  // Performance: compress responses
  compress: true,
  // Security: remove X-Powered-By header
  poweredByHeader: false,
  // Structured logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withSerwist(nextConfig);
