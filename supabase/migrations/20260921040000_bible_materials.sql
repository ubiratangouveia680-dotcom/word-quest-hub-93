-- Migração para Estudos Bíblicos, Escola Dominical e Apostilas
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

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_bible_materials_type ON public.bible_materials (type);
CREATE INDEX IF NOT EXISTS idx_bible_materials_category_slug ON public.bible_materials (category_slug);
CREATE INDEX IF NOT EXISTS idx_bible_materials_status ON public.bible_materials (status);
CREATE INDEX IF NOT EXISTS idx_bible_materials_audience ON public.bible_materials (audience);
CREATE INDEX IF NOT EXISTS idx_bible_materials_bible_book ON public.bible_materials (bible_book);

-- Concessões
GRANT SELECT ON public.bible_materials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_materials TO authenticated;
GRANT ALL ON public.bible_materials TO service_role;

-- RLS
ALTER TABLE public.bible_materials ENABLE ROW LEVEL SECURITY;

-- Visitantes e usuários comuns podem ler materiais publicados
CREATE POLICY "Public can view published bible materials"
ON public.bible_materials FOR SELECT
USING (
  status = 'published'
  OR (
    auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'admin')
  )
);

-- Somente administradores podem inserir materiais
CREATE POLICY "Admins can insert bible materials"
ON public.bible_materials FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Somente administradores podem atualizar materiais
CREATE POLICY "Admins can update bible materials"
ON public.bible_materials FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Somente administradores podem excluir materiais
CREATE POLICY "Admins can delete bible materials"
ON public.bible_materials FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
