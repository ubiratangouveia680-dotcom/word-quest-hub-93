-- ==============================================================================
-- MIGRATION: ARQUITETURA DEDICADA E INDEPENDENTE PARA PEDIDOS DE ORAÇÃO
-- ==============================================================================

-- 1. Criar Tabela Dedicada de Pedidos de Oração (Sem coluna category_id)
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  title TEXT,
  verse_reference TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'archived', 'deleted')),
  prayed_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_user ON public.prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON public.prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created ON public.prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_prayed ON public.prayer_requests(prayed_count DESC);

-- 2. Tabela de Apoio em Oração ("Vou orar por você" - relação única por usuário e pedido)
CREATE TABLE IF NOT EXISTS public.prayer_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(prayer_request_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_prayer_support_request ON public.prayer_support(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_support_user ON public.prayer_support(user_id);

-- 3. Tabela de Denúncias de Pedidos de Oração (Moderação)
CREATE TABLE IF NOT EXISTS public.prayer_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayer_reports_status ON public.prayer_reports(status);

-- 4. Habilitar RLS e Políticas de Acesso
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_reports ENABLE ROW LEVEL SECURITY;

-- prayer_requests policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_requests' AND policyname = 'Public read active prayer requests') THEN
    CREATE POLICY "Public read active prayer requests" ON public.prayer_requests
      FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_requests' AND policyname = 'Users can create prayer requests') THEN
    CREATE POLICY "Users can create prayer requests" ON public.prayer_requests
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_requests' AND policyname = 'Users can update their own prayer requests') THEN
    CREATE POLICY "Users can update their own prayer requests" ON public.prayer_requests
      FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_requests' AND policyname = 'Users can delete their own prayer requests') THEN
    CREATE POLICY "Users can delete their own prayer requests" ON public.prayer_requests
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- prayer_support policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_support' AND policyname = 'Public read prayer support') THEN
    CREATE POLICY "Public read prayer support" ON public.prayer_support
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_support' AND policyname = 'Users can pray for requests') THEN
    CREATE POLICY "Users can pray for requests" ON public.prayer_support
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_support' AND policyname = 'Users can remove their prayer support') THEN
    CREATE POLICY "Users can remove their prayer support" ON public.prayer_support
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- prayer_reports policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_reports' AND policyname = 'Users can submit prayer reports') THEN
    CREATE POLICY "Users can submit prayer reports" ON public.prayer_reports
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_reports' AND policyname = 'Admins can view prayer reports') THEN
    CREATE POLICY "Admins can view prayer reports" ON public.prayer_reports
      FOR SELECT TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- 5. Trigger para atualização atômica de contadores de apoio
CREATE OR REPLACE FUNCTION public.update_prayer_request_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prayer_requests
    SET prayed_count = prayed_count + 1, updated_at = now()
    WHERE id = NEW.prayer_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prayer_requests
    SET prayed_count = GREATEST(0, prayed_count - 1), updated_at = now()
    WHERE id = OLD.prayer_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prayer_support_count ON public.prayer_support;
CREATE TRIGGER trg_prayer_support_count
AFTER INSERT OR DELETE ON public.prayer_support
FOR EACH ROW EXECUTE FUNCTION public.update_prayer_request_count();

-- 6. Migrar pedidos de oração existentes da tabela questions (preservando o histórico)
INSERT INTO public.prayer_requests (id, user_id, content, title, verse_reference, is_anonymous, status, created_at, updated_at)
SELECT
  id,
  user_id,
  body AS content,
  title,
  verse_reference,
  COALESCE(title LIKE '[ANÔNIMO]%', false) AS is_anonymous,
  'active' AS status,
  created_at,
  updated_at
FROM public.questions
WHERE category_id = 'oracao'
   OR title ILIKE '%Pedido de Oração%'
   OR title ILIKE '%[ANÔNIMO]%'
ON CONFLICT (id) DO NOTHING;
