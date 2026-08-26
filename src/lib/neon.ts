/**
 * Neon Services Helper Configuration
 * Provides unified access to Neon Lakebase Postgres, Neon Auth, and Neon REST Data API.
 */

export const NEON_CONFIG = {
    databaseUrl: process.env.DATABASE_URL || '',
    authUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEON_AUTH_URL || '',
    jwksUrl: process.env.NEON_JWKS_URL || '',
    apiUrl: process.env.NEXT_PUBLIC_NEON_API_URL || process.env.NEON_API_URL || '',
};

/**
 * Fetch helper for Neon REST Data API
 */
export async function neonRestFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
    try {
        const baseUrl = NEON_CONFIG.apiUrl.replace(/\/$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${baseUrl}${cleanEndpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        const res = await fetch(url, {
            ...options,
            headers,
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { data: null, error: `Neon REST API Error (${res.status}): ${errorText}` };
        }

        const data = await res.json() as T;
        return { data, error: null };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error during Neon REST request';
        return { data: null, error: message };
    }
}
