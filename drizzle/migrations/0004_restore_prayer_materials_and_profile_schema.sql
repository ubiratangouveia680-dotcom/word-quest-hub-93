ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles (username) WHERE username IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  title text,
  verse_reference text,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'archived', 'deleted')),
  prayed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prayer_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_requests TO authenticated;
GRANT ALL ON public.prayer_requests TO service_role;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active prayer requests" ON public.prayer_requests FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "Users can create prayer requests" ON public.prayer_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayer requests" ON public.prayer_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayer requests" ON public.prayer_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user ON public.prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON public.prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created ON public.prayer_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS public.prayer_support (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(prayer_request_id, user_id)
);
GRANT SELECT ON public.prayer_support TO anon;
GRANT SELECT, INSERT, DELETE ON public.prayer_support TO authenticated;
GRANT ALL ON public.prayer_support TO service_role;
ALTER TABLE public.prayer_support ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read prayer support" ON public.prayer_support FOR SELECT USING (true);
CREATE POLICY "Users can pray for requests" ON public.prayer_support FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their prayer support" ON public.prayer_support FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_support_request ON public.prayer_support(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_support_user ON public.prayer_support(user_id);

CREATE TABLE IF NOT EXISTS public.prayer_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.prayer_reports TO authenticated;
GRANT ALL ON public.prayer_reports TO service_role;
ALTER TABLE public.prayer_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit prayer reports" ON public.prayer_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Admins can view prayer reports" ON public.prayer_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.bible_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('estudo', 'escola-dominical', 'apostila', 'curso')),
  title text NOT NULL,
  category text NOT NULL,
  category_slug text NOT NULL,
  audience text NOT NULL DEFAULT 'geral' CHECK (audience IN ('geral', 'familia', 'jovens', 'infantil', 'adultos')),
  level text NOT NULL DEFAULT 'basico' CHECK (level IN ('basico', 'intermediario', 'avancado')),
  bible_book text,
  series text,
  lesson_number integer,
  author text NOT NULL DEFAULT 'Equipe Bíblia Online',
  cover_url text,
  excerpt text NOT NULL,
  main_verse text,
  main_verse_ref text,
  objectives text[] DEFAULT '{}'::text[],
  content text NOT NULL,
  topics jsonb DEFAULT '[]'::jsonb,
  questions text[] DEFAULT '{}'::text[],
  practical_application text,
  conclusion text,
  reference_verses jsonb DEFAULT '[]'::jsonb,
  table_of_contents jsonb DEFAULT '[]'::jsonb,
  is_downloadable boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bible_materials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_materials TO authenticated;
GRANT ALL ON public.bible_materials TO service_role;
ALTER TABLE public.bible_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published bible materials" ON public.bible_materials FOR SELECT USING (status = 'published' OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Admins can insert bible materials" ON public.bible_materials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bible materials" ON public.bible_materials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bible materials" ON public.bible_materials FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_bible_materials_type ON public.bible_materials(type);
CREATE INDEX IF NOT EXISTS idx_bible_materials_category_slug ON public.bible_materials(category_slug);
CREATE INDEX IF NOT EXISTS idx_bible_materials_status ON public.bible_materials(status);

CREATE OR REPLACE FUNCTION public.update_prayer_request_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prayer_requests SET prayed_count = prayed_count + 1, updated_at = now() WHERE id = NEW.prayer_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prayer_requests SET prayed_count = GREATEST(0, prayed_count - 1), updated_at = now() WHERE id = OLD.prayer_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_prayer_support_count ON public.prayer_support;
CREATE TRIGGER trg_prayer_support_count AFTER INSERT OR DELETE ON public.prayer_support FOR EACH ROW EXECUTE FUNCTION public.update_prayer_request_count();