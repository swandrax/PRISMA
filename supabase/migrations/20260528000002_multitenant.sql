-- c:\Users\user\Desktop\prisma\supabase\migrations\20260528000002_multitenant.sql

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create rt_units table
CREATE TABLE IF NOT EXISTS public.rt_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kode_rt TEXT NOT NULL UNIQUE,  
  nama TEXT NOT NULL,             
  alamat TEXT,
  kelurahan TEXT DEFAULT 'Kemayoran',
  kecamatan TEXT DEFAULT 'Kemayoran', 
  kota TEXT DEFAULT 'Jakarta Pusat',
  subdomain TEXT NOT NULL UNIQUE, 
  telegram_chat_pengurus TEXT,
  telegram_chat_keuangan TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create rw_admins table for super admins
CREATE TABLE IF NOT EXISTS public.rw_admins (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nama TEXT,
  rw_kode TEXT DEFAULT 'rw09',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert existing RT04 data
INSERT INTO public.rt_units (kode_rt, nama, subdomain, alamat)
VALUES ('rt04', 'RT 04', 'rt04', 'Gg. Bugis No.95')
ON CONFLICT (kode_rt) DO NOTHING;

-- 4. Get the ID of RT04 to update existing data
DO $$
DECLARE
    rt04_id UUID;
BEGIN
    SELECT id INTO rt04_id FROM public.rt_units WHERE kode_rt = 'rt04' LIMIT 1;

    -- 5. Ensure rt_id column exists in all tables and update existing rows to belong to RT04
    
    -- profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rt_id') THEN
        ALTER TABLE public.profiles ADD COLUMN rt_id UUID REFERENCES public.rt_units(id);
    END IF;
    UPDATE public.profiles SET rt_id = rt04_id WHERE rt_id IS NULL;

    -- pengumuman
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pengumuman' AND column_name='rt_id') THEN
        ALTER TABLE public.pengumuman ADD COLUMN rt_id UUID REFERENCES public.rt_units(id);
    END IF;
    UPDATE public.pengumuman SET rt_id = rt04_id WHERE rt_id IS NULL;

    -- jadwal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jadwal' AND column_name='rt_id') THEN
        ALTER TABLE public.jadwal ADD COLUMN rt_id UUID REFERENCES public.rt_units(id);
    END IF;
    UPDATE public.jadwal SET rt_id = rt04_id WHERE rt_id IS NULL;

    -- keuangan_bulanan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='keuangan_bulanan' AND column_name='rt_id') THEN
        ALTER TABLE public.keuangan_bulanan ADD COLUMN rt_id UUID REFERENCES public.rt_units(id);
    END IF;
    UPDATE public.keuangan_bulanan SET rt_id = rt04_id WHERE rt_id IS NULL;

    -- transaksi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transaksi' AND column_name='rt_id') THEN
        ALTER TABLE public.transaksi ADD COLUMN rt_id UUID REFERENCES public.rt_units(id);
    END IF;
    UPDATE public.transaksi SET rt_id = rt04_id WHERE rt_id IS NULL;

    -- pengajuan_surat
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pengajuan_surat' AND column_name='rt_id') THEN
        ALTER TABLE public.pengajuan_surat ADD COLUMN rt_id UUID REFERENCES public.rt_units(id);
    END IF;
    UPDATE public.pengajuan_surat SET rt_id = rt04_id WHERE rt_id IS NULL;

    -- galeri
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='galeri' AND column_name='rt_id') THEN
        ALTER TABLE public.galeri ADD COLUMN rt_id UUID REFERENCES public.rt_units(id);
    END IF;
    UPDATE public.galeri SET rt_id = rt04_id WHERE rt_id IS NULL;
END $$;

-- 6. Helper Function for RLS
CREATE OR REPLACE FUNCTION get_user_rt_id()
RETURNS UUID AS $$
  SELECT rt_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.rw_admins WHERE id = auth.uid())
$$ LANGUAGE SQL SECURITY DEFINER;

-- 7. RLS Policies Updates
-- We will dynamically recreate policies for isolation.
-- Usage: Super Admin sees all, Pengurus/Ketua sees their RT, Warga sees their RT (and only reads for most).

DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['pengumuman', 'jadwal', 'keuangan_bulanan', 'transaksi', 'pengajuan_surat', 'galeri', 'profiles'])
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        
        -- Drop existing policies if they exist (ignoring errors implicitly by using a plpgsql block if needed, but we'll assume standard naming or just drop all).
        -- Since Supabase might have generated unknown names, we query pg_policies and drop them.
        DECLARE
            pol RECORD;
        BEGIN
            FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
            LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, tbl);
            END LOOP;
        END;

        -- Create Super Admin Policy (Bypass all)
        EXECUTE format('CREATE POLICY "Super Admin Access %I" ON public.%I FOR ALL USING (is_super_admin());', tbl, tbl);

        -- Create RT-specific Policies
        IF tbl = 'pengumuman' OR tbl = 'jadwal' OR tbl = 'keuangan_bulanan' OR tbl = 'galeri' OR tbl = 'profiles' THEN
            -- Read-only for all users in the same RT
            EXECUTE format('CREATE POLICY "Warga Read %I" ON public.%I FOR SELECT USING (rt_id = get_user_rt_id());', tbl, tbl);
        END IF;

        IF tbl = 'pengajuan_surat' OR tbl = 'transaksi' THEN
            -- Warga can only read their own (surat) or transactions (all warga in same RT can see trans? usually yes for transparency)
            IF tbl = 'transaksi' THEN
                EXECUTE format('CREATE POLICY "Warga Read %I" ON public.%I FOR SELECT USING (rt_id = get_user_rt_id());', tbl, tbl);
            ELSE
                -- pengajuan_surat: warga sees only their own
                EXECUTE format('CREATE POLICY "Warga Read Own %I" ON public.%I FOR SELECT USING (warga_id = auth.uid() AND rt_id = get_user_rt_id());', tbl, tbl);
                EXECUTE format('CREATE POLICY "Warga Insert Own %I" ON public.%I FOR INSERT WITH CHECK (warga_id = auth.uid() AND rt_id = get_user_rt_id());', tbl, tbl);
            END IF;
        END IF;

        -- Pengurus/Ketua Access (CRUD) for their RT
        EXECUTE format('
            CREATE POLICY "Pengurus Access %I" ON public.%I 
            FOR ALL 
            USING (
                rt_id = get_user_rt_id() 
                AND EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN (''pengurus'', ''ketua'')
                )
            );
        ', tbl, tbl);

    END LOOP;
END $$;
