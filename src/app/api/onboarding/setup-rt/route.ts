// c:\Users\user\Desktop\prisma\src\app\api\onboarding\setup-rt\route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { bot } from '@/lib/telegram/bot';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
    if (!supabaseServiceKey) {
        return NextResponse.json({ error: 'Service role key not configured.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const body = await request.json();
        const { 
            kode_rt, nama_rt, alamat, nama_ketua_rt, email_ketua_rt, 
            telegram_chat_pengurus, telegram_chat_keuangan 
        } = body;

        // 1. Check if subdomain already exists
        const { data: existingRT } = await supabaseAdmin
            .from('rt_units')
            .select('id')
            .eq('subdomain', kode_rt)
            .single();
            
        if (existingRT) {
            return NextResponse.json({ error: `Subdomain ${kode_rt} sudah digunakan.` }, { status: 400 });
        }

        // 2. Insert into rt_units
        const { data: newRT, error: rtError } = await supabaseAdmin
            .from('rt_units')
            .insert([{
                kode_rt,
                nama: nama_rt,
                alamat,
                subdomain: kode_rt,
                telegram_chat_pengurus,
                telegram_chat_keuangan,
                is_active: true
            }])
            .select()
            .single();

        if (rtError || !newRT) {
            console.error(rtError);
            return NextResponse.json({ error: 'Gagal membuat unit RT baru.' }, { status: 500 });
        }

        // 3. Create Chairman User Account
        // Note: In a real app, inviteUserByEmail might be preferred. We'll use createUser with a random password.
        const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'; // Basic strong random
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email_ketua_rt,
            email_confirm: true,
            password: tempPassword,
            user_metadata: {
                nama: nama_ketua_rt,
                role: 'ketua',
                rt_id: newRT.id
            }
        });

        if (authError) {
            // Rollback RT creation
            await supabaseAdmin.from('rt_units').delete().eq('id', newRT.id);
            return NextResponse.json({ error: `Gagal membuat akun ketua: ${authError.message}` }, { status: 400 });
        }

        // 4. Ensure profile is updated properly (Supabase creates auth, trigger might create profile, but we ensure it)
        const userId = authData.user.id;
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: email_ketua_rt,
                nama: nama_ketua_rt,
                role: 'ketua',
                rt_id: newRT.id
            });

        if (profileError) {
            console.error('Profile Error:', profileError);
        }

        // 5. Notify Super Admin Group via Telegram
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_GROUP_ID;
        if (adminChatId) {
            await bot.sendMessage(adminChatId, `✅ <b>RT Baru Aktif:</b> ${nama_rt}\nKode: ${kode_rt}\nSubdomain: ${kode_rt}.prisma-kemayoran.id`);
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prisma-kemayoran.id';
        const loginUrl = siteUrl.replace('://', `://${kode_rt}.`);

        return NextResponse.json({ 
            success: true, 
            subdomain: kode_rt, 
            loginUrl,
            tempPassword // In real life, send this via email, not returned to client, or use invite link
        });

    } catch (error) {
        console.error('Setup RT Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
