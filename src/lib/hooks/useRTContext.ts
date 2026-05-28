// c:\Users\user\Desktop\prisma\src\lib\hooks\useRTContext.ts
import { headers } from 'next/headers';

export interface RTContextData {
    rtId: string;
    rtKode: string;
    rtNama: string;
}

/**
 * Server-side hook/utility to get current RT context from headers injected by middleware.
 * Must only be called within Server Components, Server Actions, or Route Handlers.
 */
export async function getRTContext(): Promise<RTContextData> {
    const headersList = await headers();
    
    // Default to env if headers are missing (e.g. static rendering or local dev without middleware hit)
    const defaultId = process.env.NEXT_PUBLIC_DEFAULT_RT_ID || '00000000-0000-0000-0000-000000000000';
    
    const rtId = headersList.get('x-rt-id') || defaultId;
    const rtKode = headersList.get('x-rt-kode') || 'rt04';
    const rtNama = headersList.get('x-rt-nama') || 'RT 04';

    return {
        rtId,
        rtKode,
        rtNama
    };
}
