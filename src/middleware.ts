// c:\Users\user\Desktop\prisma\src\middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// A simple in-memory cache for subdomain to RT metadata mapping
// In a real production app (edge/serverless), this might reset on cold starts,
// but it's acceptable to avoid hitting the DB for *every* request.
const subdomainCache = new Map<string, { id: string, kode: string, nama: string }>();
let cacheLastUpdated = 0;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export async function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl

    // Ignore static files and api routes for subdomain routing
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/sw.js') ||
        pathname.startsWith('/workbox') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Determine the subdomain
    // Example: rt04.prisma-kemayoran.id -> rt04
    // Example: rw09.prisma-kemayoran.id -> rw09
    // Example: localhost:3000 -> no subdomain or 'localhost'
    const parts = hostname.split('.');
    
    // Check if we are on a subdomain (at least 3 parts for production, e.g. rt04.domain.com)
    // For localhost testing, we might use rt04.localhost
    let subdomain = '';
    
    if (parts.length >= 3 && hostname.includes('prisma-kemayoran.id')) {
        subdomain = parts[0];
    } else if (hostname.includes('.localhost')) {
        subdomain = parts[0];
    }

    // 1. If no subdomain, or 'www', just proceed normally (maybe landing page)
    if (!subdomain || subdomain === 'www') {
        return NextResponse.next()
    }

    // 2. If it's the Super Admin subdomain 'rw09'
    if (subdomain === 'rw09') {
        // Rewrite all requests on rw09 to the /rw-admin folder internally
        // So rw09.prisma-kemayoran.id/dashboard -> /rw-admin/dashboard
        if (!pathname.startsWith('/rw-admin')) {
            const url = request.nextUrl.clone()
            url.pathname = `/rw-admin${pathname === '/' ? '/dashboard' : pathname}`
            return NextResponse.rewrite(url)
        }
        return NextResponse.next()
    }

    // 3. For RT subdomains (e.g. 'rt04')
    // We need to inject the RT ID into headers for server components to use
    let rtData = subdomainCache.get(subdomain);
    const now = Date.now();

    if (!rtData || (now - cacheLastUpdated > CACHE_TTL_MS)) {
        try {
            // Fetch from Supabase using REST API directly to avoid pulling the heavy client in edge runtime
            // Or use standard fetch since middleware runs on the Edge
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (supabaseUrl && supabaseKey) {
                const res = await fetch(`${supabaseUrl}/rest/v1/rt_units?subdomain=eq.${subdomain}&is_active=eq.true&select=id,kode_rt,nama`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    next: { revalidate: 300 } // Next.js fetch cache
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        rtData = { id: data[0].id, kode: data[0].kode_rt, nama: data[0].nama };
                        subdomainCache.set(subdomain, rtData);
                        cacheLastUpdated = now;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching RT data in middleware:', error);
        }
    }

    if (!rtData) {
        // Unknown subdomain, redirect to main site or show 404
        // Assuming main site is without subdomain
        const url = request.nextUrl.clone()
        url.hostname = hostname.replace(`${subdomain}.`, '');
        url.pathname = '/';
        return NextResponse.redirect(url)
    }

    // 4. Inject Headers and Protect Admin Routes
    const headers = new Headers(request.headers);
    headers.set('x-rt-id', rtData.id);
    headers.set('x-rt-kode', rtData.kode);
    headers.set('x-rt-nama', rtData.nama);

    // Protect /admin routes inside RT tenant
    if (pathname.startsWith('/admin')) {
        const loggedInFlag = request.cookies.get('sb-access-token') || request.cookies.get('warga_session');
        if (!loggedInFlag) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('redirect_to', pathname);
            return NextResponse.redirect(url, { headers });
        }
    }

    return NextResponse.next({
        request: {
            headers
        }
    });
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
