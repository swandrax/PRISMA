-- c:\Users\user\Desktop\prisma\supabase\migrations\20260528000000_init_cms.sql

-- 1. Create Tables
CREATE TABLE public.pengumuman (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    kategori TEXT NOT NULL,
    tanggal DATE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    rt_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE public.jadwal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    frekuensi TEXT NOT NULL,
    hari TEXT NOT NULL,
    waktu TEXT NOT NULL,
    lokasi TEXT NOT NULL,
    rt_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE public.keuangan_bulanan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bulan INT NOT NULL,
    tahun INT NOT NULL,
    saldo NUMERIC DEFAULT 0,
    pemasukan NUMERIC DEFAULT 0,
    pengeluaran NUMERIC DEFAULT 0,
    keterangan TEXT,
    rt_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE public.transaksi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tanggal DATE NOT NULL,
    deskripsi TEXT NOT NULL,
    jenis TEXT NOT NULL, -- 'pemasukan' atau 'pengeluaran'
    jumlah NUMERIC NOT NULL,
    kategori TEXT,
    created_by UUID REFERENCES auth.users(id),
    rt_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keuangan_bulanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy helper: determine if user is admin or pengurus based on public.users table role
-- Note: Assuming there is a users table that has a role column. Since we need it in RLS, we can query it.
-- Alternatively, we can use auth.jwt() -> 'user_metadata' ->> 'role' for faster check.
-- We will use the auth.jwt() -> 'user_metadata' ->> 'role' to avoid nested queries.

-- pengumuman policies
CREATE POLICY "Pengumuman dapat dibaca oleh publik"
    ON public.pengumuman FOR SELECT
    USING (true);

CREATE POLICY "Pengumuman dapat diubah oleh admin atau pengurus"
    ON public.pengumuman FOR ALL
    USING (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    )
    WITH CHECK (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    );

-- jadwal policies
CREATE POLICY "Jadwal dapat dibaca oleh publik"
    ON public.jadwal FOR SELECT
    USING (true);

CREATE POLICY "Jadwal dapat diubah oleh admin atau pengurus"
    ON public.jadwal FOR ALL
    USING (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    )
    WITH CHECK (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    );

-- keuangan_bulanan policies
CREATE POLICY "Keuangan bulanan dapat dibaca oleh semua role terautentikasi"
    ON public.keuangan_bulanan FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Keuangan bulanan dapat diubah oleh admin atau pengurus"
    ON public.keuangan_bulanan FOR ALL
    USING (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    )
    WITH CHECK (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    );

-- transaksi policies
CREATE POLICY "Transaksi dapat dibaca oleh semua role terautentikasi"
    ON public.transaksi FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Transaksi dapat diubah oleh admin atau pengurus"
    ON public.transaksi FOR ALL
    USING (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    )
    WITH CHECK (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'pengurus', 'ketua')
    );
