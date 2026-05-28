// c:\Users\user\Desktop\prisma\src\app\api\galeri\upload\route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/utils/slugify'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const judul = formData.get('judul') as string
        const deskripsi = formData.get('deskripsi') as string
        const kategori = formData.get('kategori') as string
        const isFeatured = formData.get('is_featured') === 'true'

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 })
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP allowed.' }, { status: 400 })
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 })
        }

        // Slugify filename
        const originalName = file.name
        const sluggedName = slugify(originalName)
        const uniqueFilename = `${Date.now()}-${sluggedName}`

        // Upload to Storage
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const { data: storageData, error: storageError } = await supabase.storage
            .from('galeri')
            .upload(uniqueFilename, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (storageError) {
            console.error('Storage error:', storageError)
            return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('galeri')
            .getPublicUrl(uniqueFilename)

        const publicUrl = publicUrlData.publicUrl
        
        // Insert metadata into galeri table
        const { data: dbData, error: dbError } = await supabase
            .from('galeri')
            .insert([{
                judul,
                deskripsi,
                kategori,
                image_url: publicUrl,
                thumbnail_url: publicUrl, // For now, use the same as original. Real thumbnail would require image processing.
                is_featured: isFeatured,
                tanggal: new Date().toISOString(),
                peserta_count: 0 // Default
            }])
            .select()
            .single()

        if (dbError) {
            console.error('DB error:', dbError)
            // Rollback storage upload if DB fails
            await supabase.storage.from('galeri').remove([uniqueFilename])
            return NextResponse.json({ error: 'Failed to save metadata' }, { status: 500 })
        }

        return NextResponse.json({ 
            id: dbData.id,
            url: publicUrl, 
            thumbnail_url: publicUrl 
        })

    } catch (error) {
        console.error('Upload handler error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
