// c:\Users\user\Desktop\prisma\src\app\sw.ts
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly, ExpirationPlugin } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        // Never cache admin and API routes
        {
            matcher: ({ url }) => url.pathname.startsWith('/admin') || url.pathname.startsWith('/api'),
            handler: new NetworkOnly(),
        },
        // Cache First: static pages
        {
            matcher: ({ url }) => ['/', '/tentang', '/kontak'].includes(url.pathname),
            handler: new CacheFirst({
                cacheName: 'static-pages-cache',
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 10,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                    }),
                ],
            }),
        },
        // Network First: data that needs to be fresh
        {
            matcher: ({ url }) => ['/pengumuman', '/keuangan'].includes(url.pathname),
            handler: new NetworkFirst({
                cacheName: 'fresh-data-cache',
                networkTimeoutSeconds: 5,
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 20,
                        maxAgeSeconds: 24 * 60 * 60, // 24 Hours
                    }),
                ],
            }),
        },
        // Stale While Revalidate: Gallery
        {
            matcher: ({ url }) => url.pathname.startsWith('/galeri'),
            handler: new StaleWhileRevalidate({
                cacheName: 'gallery-cache',
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 50,
                        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
                    }),
                ],
            }),
        },
        // Default caching provided by Serwist for other assets (images, scripts, etc.)
        ...defaultCache,
    ],
    fallbacks: {
        entries: [
            {
                url: '/_offline',
                matcher({ request }) {
                    return request.destination === 'document';
                },
            },
        ],
    },
});

serwist.addEventListeners();
