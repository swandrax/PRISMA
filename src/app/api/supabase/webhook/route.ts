// c:\Users\user\Desktop\prisma\src\app\api\supabase\webhook\route.ts
import { NextResponse } from 'next/server';
import { notifyNewSurat, notifySuratStatus, notifyNewTransaksi } from '@/lib/telegram/notifications';

const SUPABASE_WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

export async function POST(request: Request) {
    // Basic verification using Bearer token
    const authHeader = request.headers.get('Authorization');
    if (SUPABASE_WEBHOOK_SECRET && authHeader !== `Bearer ${SUPABASE_WEBHOOK_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        
        // Payload from Supabase webhook contains: type (INSERT, UPDATE, DELETE), table, record, old_record
        const { type, table, record, old_record } = payload;

        if (table === 'pengajuan_surat') {
            if (type === 'INSERT') {
                await notifyNewSurat(record);
            } 
            else if (type === 'UPDATE' && old_record.status !== record.status) {
                await notifySuratStatus(record);
            }
        } 
        else if (table === 'transaksi' && type === 'INSERT') {
            await notifyNewTransaksi(record);
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Supabase webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
