-- c:\Users\user\Desktop\prisma\supabase\migrations\20260528000003_ai_feedback.sql

-- Tabel versi system prompt (tracking iterasi)
CREATE TABLE IF NOT EXISTS public.prompt_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project TEXT NOT NULL,
  version TEXT NOT NULL,         -- 'v1.0', 'v1.1'
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  like_rate DECIMAL GENERATED ALWAYS AS (
    CASE WHEN (like_count + dislike_count) = 0 THEN 0
    ELSE like_count::DECIMAL / (like_count + dislike_count) * 100
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT                     -- catatan perubahan versi
);

-- Tabel feedback AI
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  project TEXT NOT NULL,         -- 'prisma' 
  user_message TEXT NOT NULL,    -- prompt yang dikirim user
  ai_response TEXT NOT NULL,     -- jawaban AI
  model_used TEXT NOT NULL,      -- 'llama3-8b-8192' dll
  system_prompt_version TEXT,    -- 'v1.0', 'v1.1' dll
  feedback TEXT,                 -- 'like' | 'dislike' | null
  feedback_reason TEXT,          -- alasan jika dislike
  response_time_ms INTEGER,      -- berapa lama AI menjawab
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial prompt version for tracking
INSERT INTO public.prompt_versions (project, version, system_prompt, is_active, notes)
VALUES (
  'prisma', 
  'v1.0', 
  'Kamu adalah Mbak PRISMA, asisten virtual warga RT 04/RW 09...', 
  true, 
  'Initial version based on Sesi 5 prompt'
);

-- RLS
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- RLS
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user insert own feedback" ON public.ai_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin read all feedback" ON public.ai_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'ketua', 'pengurus')
    )
  );

-- Prompt Versions Policies
CREATE POLICY "Everyone read active prompt" ON public.prompt_versions
  FOR SELECT USING (true); -- Read-only for everyone (to fetch active prompt)
  
CREATE POLICY "Admin manage prompts" ON public.prompt_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'ketua', 'pengurus')
    )
  );
