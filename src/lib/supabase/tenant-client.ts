// c:\Users\user\Desktop\prisma\src\lib\supabase\tenant-client.ts
import { createClient } from '@/utils/supabase/client';
import { getRTContext } from '@/lib/hooks/useRTContext';

// List of tables that require RT isolation
const TENANT_TABLES = [
    'pengumuman',
    'jadwal',
    'keuangan_bulanan',
    'transaksi',
    'pengajuan_surat',
    'galeri',
    'profiles'
];

/**
 * Creates a server-side Supabase client that automatically applies
 * an `.eq('rt_id', currentRtId)` filter for tenant-specific tables.
 * This acts as a secondary safety net in addition to Postgres RLS.
 */
export async function createTenantClient() {
    const supabase = await createClient();
    const { rtId } = await getRTContext();

    const handler: ProxyHandler<ReturnType<typeof createClient>> = {
        get(target, prop, receiver) {
            if (prop === 'from') {
                return (table: string) => {
                    const queryBuilder = target.from(table);
                    
                    if (TENANT_TABLES.includes(table) && rtId) {
                        const originalSelect = queryBuilder.select.bind(queryBuilder);
                        queryBuilder.select = (columns?: string, options?: unknown) => {
                            return originalSelect(columns, options).eq('rt_id', rtId);
                        };
                    }
                    return queryBuilder;
                };
            }
            return Reflect.get(target, prop, receiver);
        }
    };
        
    return new Proxy(supabase, handler);
}
