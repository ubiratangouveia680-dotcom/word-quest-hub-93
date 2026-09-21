CREATE TABLE IF NOT EXISTS public.bible_quiz_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  avatar_url text,
  best_score integer NOT NULL DEFAULT 0,
  total_attempts integer NOT NULL DEFAULT 1,
  passed_attempts integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  win_rate numeric(5,2) NOT NULL DEFAULT 0.00,
  last_attempt_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text,
  question_ids text[] NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  total_questions integer NOT NULL DEFAULT 10,
  passed boolean NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bible_quiz_rankings_order ON public.bible_quiz_rankings (best_score DESC, win_rate DESC, total_attempts DESC);
CREATE INDEX IF NOT EXISTS idx_bible_quiz_rankings_user_id ON public.bible_quiz_rankings (user_id);
CREATE INDEX IF NOT EXISTS idx_bible_quiz_rankings_display_name ON public.bible_quiz_rankings (display_name);

ALTER TABLE public.bible_quiz_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view quiz rankings" ON public.bible_quiz_rankings;
CREATE POLICY "Public can view quiz rankings"
ON public.bible_quiz_rankings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can insert quiz rankings" ON public.bible_quiz_rankings;
CREATE POLICY "Anyone can insert quiz rankings"
ON public.bible_quiz_rankings FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update quiz rankings" ON public.bible_quiz_rankings;
CREATE POLICY "Anyone can update quiz rankings"
ON public.bible_quiz_rankings FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert quiz attempts" ON public.bible_quiz_attempts;
CREATE POLICY "Anyone can insert quiz attempts"
ON public.bible_quiz_attempts FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view quiz attempts" ON public.bible_quiz_attempts;
CREATE POLICY "Public can view quiz attempts"
ON public.bible_quiz_attempts FOR SELECT
USING (true);

GRANT SELECT, INSERT, UPDATE ON public.bible_quiz_rankings TO anon, authenticated;
GRANT ALL ON public.bible_quiz_rankings TO service_role;

GRANT SELECT, INSERT ON public.bible_quiz_attempts TO anon, authenticated;
GRANT ALL ON public.bible_quiz_attempts TO service_role;
