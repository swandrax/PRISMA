// c:\Users\user\Desktop\prisma\scripts\seed-rt05.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function seedRT05() {
    console.log("Seeding RT05 test tenant...");

    // 1. Insert rt_units
    const { data: rt05, error: rtError } = await supabase
        .from('rt_units')
        .upsert({
            kode_rt: 'rt05',
            nama: 'RT 05',
            alamat: 'Gg. Mangga No.12',
            subdomain: 'rt05',
            is_active: true
        }, { onConflict: 'kode_rt' })
        .select()
        .single();

    if (rtError || !rt05) {
        console.error("Error creating RT05:", rtError);
        process.exit(1);
    }

    console.log("✅ Created RT05 unit with ID:", rt05.id);

    // 2. Create Warga and Pengurus Users
    const users = [
        { email: 'warga@rt05.com', role: 'warga', nama: 'Warga RT05 Test' },
        { email: 'pengurus@rt05.com', role: 'pengurus', nama: 'Pengurus RT05 Test' }
    ];

    for (const u of users) {
        // Attempt to create user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: 'Password123!',
            email_confirm: true,
            user_metadata: {
                nama: u.nama,
                role: u.role,
                rt_id: rt05.id
            }
        });

        if (authError) {
            console.log(`⚠️ User ${u.email} already exists or error:`, authError.message);
        } else if (authData.user) {
            console.log(`✅ Created ${u.role} user: ${u.email}`);
            
            // Ensure profile exists
            await supabase.from('profiles').upsert({
                id: authData.user.id,
                email: u.email,
                nama: u.nama,
                role: u.role,
                rt_id: rt05.id
            });
        }
    }

    // 3. Insert Dummy Pengumuman for RT05
    await supabase.from('pengumuman').upsert({
        judul: 'Kerja Bakti RT 05',
        isi: 'Ayo warga RT 05, kita bersihkan selokan.',
        kategori: 'Kegiatan',
        rt_id: rt05.id,
        is_pinned: true,
        tanggal: new Date().toISOString()
    }, { onConflict: 'judul' });
    console.log("✅ Created pengumuman for RT05");

    // 4. Insert Dummy Keuangan for RT05
    await supabase.from('keuangan_bulanan').upsert({
        rt_id: rt05.id,
        bulan: new Date().toLocaleString('id-ID', { month: 'long' }),
        tahun: new Date().getFullYear().toString(),
        saldo: 500000,
        pemasukan: 500000,
        pengeluaran: 0
    }, { onConflict: 'rt_id,bulan,tahun' });
    console.log("✅ Created keuangan for RT05");

    console.log("\nSeeding complete! You can now test data isolation by logging in as warga@rt05.com or pengurus@rt05.com via rt05.prisma-kemayoran.id");
}

seedRT05();
