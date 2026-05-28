-- c:\Users\user\Desktop\prisma\supabase\migrations\20260528000001_gallery_and_rate_limits.sql

-- 1. Alter Galeri Table
-- Add missing columns for Sesi 3 if they don't exist
ALTER TABLE public.galeri 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL;

-- 2. Create Rate Limits Table for Telegram Webhook
CREATE TABLE IF NOT EXISTS public.rate_limits (
    chat_id BIGINT PRIMARY KEY,
    count INT DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Note: No RLS needed on rate_limits as it's accessed securely by the server (Service Role or Edge Function)
-- Or we can enable it but no policies are needed if we use Service Role Key in the webhook.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
