-- ==============================================================================
-- MIGRATION: MURAL DE PEDIDOS DE ORAÇÃO & WEB PUSH MULTI-DISPOSITIVO
-- ==============================================================================

-- 1. Tabela de Pedidos de Oração
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

-- 4. Tabela de Inscrições Web Push Multi-Dispositivo (1 Usuário -> Vários Dispositivos/Navegadores)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_sub_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_sub_endpoint ON public.push_subscriptions(endpoint);

-- 5. Preferências de Notificações de Oração e Comunidade
CREATE TABLE IF NOT EXISTS public.prayer_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_requests_enabled BOOLEAN NOT NULL DEFAULT true,
  prayer_support_enabled BOOLEAN NOT NULL DEFAULT true,
  community_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_notification_preferences ENABLE ROW LEVEL SECURITY;

-- prayer_requests:
-- Qualquer um pode ler pedidos ativos
CREATE POLICY "Public read active prayer requests" ON public.prayer_requests
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

-- Autenticados criam pedidos para si mesmos
CREATE POLICY "Users can create prayer requests" ON public.prayer_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Autor pode atualizar seu próprio pedido
CREATE POLICY "Users can update their own prayer requests" ON public.prayer_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Autor pode excluir seu próprio pedido
CREATE POLICY "Users can delete their own prayer requests" ON public.prayer_requests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- prayer_support:
-- Qualquer um pode ler quem está orando (para contadores)
CREATE POLICY "Public read prayer support" ON public.prayer_support
  FOR SELECT USING (true);

-- Usuários autenticados podem interceder (inserir seu próprio voto)
CREATE POLICY "Users can pray for requests" ON public.prayer_support
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Usuários podem desfazer sua intercessão ("Deixar de orar")
CREATE POLICY "Users can remove their prayer support" ON public.prayer_support
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- prayer_reports:
-- Usuários autenticados podem denunciar pedidos
CREATE POLICY "Users can submit prayer reports" ON public.prayer_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);

-- Admins podem ler e moderar denúncias
CREATE POLICY "Admins can view prayer reports" ON public.prayer_reports
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- push_subscriptions:
-- Usuário gerencia apenas suas próprias inscrições de push
CREATE POLICY "Users manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- prayer_notification_preferences:
-- Usuário gerencia apenas suas próprias preferências
CREATE POLICY "Users manage their notification preferences" ON public.prayer_notification_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER PARA ATUALIZAR CONTADOR DE ORAÇÃO EM PRAYER_REQUESTS
-- ==============================================================================

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
