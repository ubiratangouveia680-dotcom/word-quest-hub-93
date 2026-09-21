-- Migração para Prova Bíblica (Quiz), Tentativas e Ranking
CREATE TABLE IF NOT EXISTS public.bible_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text NOT NULL,
  biblical_reference text,
  difficulty text NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  category text NOT NULL DEFAULT 'Geral',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  question_ids uuid[] NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  total_questions integer NOT NULL DEFAULT 10,
  passed boolean NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_quiz_rankings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  best_score integer NOT NULL DEFAULT 0,
  total_attempts integer NOT NULL DEFAULT 0,
  passed_attempts integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  win_rate numeric(5,2) NOT NULL DEFAULT 0.00,
  last_attempt_at timestamptz NOT NULL DEFAULT now()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_bible_quiz_questions_active ON public.bible_quiz_questions (active);
CREATE INDEX IF NOT EXISTS idx_bible_quiz_attempts_user ON public.bible_quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_bible_quiz_rankings_order ON public.bible_quiz_rankings (best_score DESC, win_rate DESC, total_attempts DESC);

-- Concessões
GRANT SELECT ON public.bible_quiz_questions TO anon, authenticated;
GRANT ALL ON public.bible_quiz_questions TO service_role;

GRANT SELECT, INSERT ON public.bible_quiz_attempts TO anon, authenticated;
GRANT ALL ON public.bible_quiz_attempts TO service_role;

GRANT SELECT ON public.bible_quiz_rankings TO anon, authenticated;
GRANT ALL ON public.bible_quiz_rankings TO service_role;

-- RLS
ALTER TABLE public.bible_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_quiz_rankings ENABLE ROW LEVEL SECURITY;

-- Leitura das questões ativas
CREATE POLICY "Public can view active quiz questions"
ON public.bible_quiz_questions FOR SELECT
USING (active = true);

-- Inserção de tentativas
CREATE POLICY "Anyone can insert quiz attempts"
ON public.bible_quiz_attempts FOR INSERT
WITH CHECK (
  auth.uid() IS NULL OR user_id = auth.uid()
);

-- Usuários podem ler suas próprias tentativas
CREATE POLICY "Users can view own quiz attempts"
ON public.bible_quiz_attempts FOR SELECT
USING (
  user_id = auth.uid()
);

-- Ranking é público
CREATE POLICY "Public can view quiz rankings"
ON public.bible_quiz_rankings FOR SELECT
USING (true);

-- Atualização do ranking
CREATE POLICY "Users can update own ranking"
ON public.bible_quiz_rankings FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
