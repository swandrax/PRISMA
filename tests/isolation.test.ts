// c:\Users\user\Desktop\prisma\tests\isolation.test.ts
import { describe, beforeAll, test, expect } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client bypassing RLS for setup
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

describe('Multi-tenant Data Isolation (RLS)', () => {
    let rt04Id: string;
    let rt05Id: string;
    let rt04WargaClient: SupabaseClient;
    let rt04PengurusClient: SupabaseClient;
    let rwAdminClient: SupabaseClient;

    beforeAll(async () => {
        // Retrieve RT IDs
        const { data: rts } = await adminClient.from('rt_units').select('id, kode_rt').in('kode_rt', ['rt04', 'rt05']);
        const rt04 = rts?.find(r => r.kode_rt === 'rt04');
        const rt05 = rts?.find(r => r.kode_rt === 'rt05');
        
        if (!rt04 || !rt05) {
            throw new Error('Required test RT units (rt04, rt05) not found in seed.');
        }
        
        rt04Id = rt04.id;
        rt05Id = rt05.id;

        // Authenticate mock clients (assuming users exist via seed script)
        rt04WargaClient = createClient(supabaseUrl, supabaseAnonKey);
        await rt04WargaClient.auth.signInWithPassword({ email: 'warga@rt04.com', password: 'Password123!' }); // Needs to exist

        rt04PengurusClient = createClient(supabaseUrl, supabaseAnonKey);
        await rt04PengurusClient.auth.signInWithPassword({ email: 'pengurus@rt04.com', password: 'Password123!' });

        rwAdminClient = createClient(supabaseUrl, supabaseAnonKey);
        await rwAdminClient.auth.signInWithPassword({ email: 'admin@rw09.com', password: 'Password123!' }); // Needs to exist
    });

    test('Warga RT04 can read RT04 pengumuman', async () => {
        const { data, error } = await rt04WargaClient.from('pengumuman').select('*').eq('rt_id', rt04Id);
        expect(error).toBeNull();
        expect(data).toBeDefined();
    });

    test('Warga RT04 CANNOT read RT05 pengumuman', async () => {
        const { data, error } = await rt04WargaClient.from('pengumuman').select('*').eq('rt_id', rt05Id);
        // It shouldn't return an error, but rather return an empty array due to RLS
        expect(error).toBeNull();
        expect(data?.length).toBe(0);
    });

    test('Warga RT04 CANNOT insert into RT05 pengajuan_surat', async () => {
        const { error } = await rt04WargaClient.from('pengajuan_surat').insert({
            jenis: 'Surat Keterangan',
            rt_id: rt05Id
        });
        expect(error).not.toBeNull();
        expect(error?.code).toBe('42501'); // 42501 is PostgreSQL insufficient_privilege
    });

    test('Pengurus RT04 CANNOT update RT05 pengumuman', async () => {
        // Attempt to update any pengumuman in RT05
        const { error, data } = await rt04PengurusClient.from('pengumuman')
            .update({ judul: 'Hacked' })
            .eq('rt_id', rt05Id)
            .select();
        
        expect(error).toBeNull();
        expect(data?.length).toBe(0); // No rows affected because of RLS
    });

    test('Super Admin RW can read all RTs pengumuman', async () => {
        const { data, error } = await rwAdminClient.from('pengumuman').select('*');
        expect(error).toBeNull();
        expect(data?.length).toBeGreaterThan(0);
        
        // Should contain RT04 and RT05 data
        const rtIds = data?.map(d => d.rt_id);
        expect(rtIds).toContain(rt04Id);
        expect(rtIds).toContain(rt05Id);
    });
});
