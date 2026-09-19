-- ==============================================================================
-- NOTIFICAÇÕES DO VERSÍCULO DO DIA (MANHÃ, TARDE E NOITE)
-- ==============================================================================

-- 1. Configurações de notificação de cada usuário
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  verse_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  morning_enabled BOOLEAN NOT NULL DEFAULT true,
  morning_time TEXT NOT NULL DEFAULT '08:00',
  afternoon_enabled BOOLEAN NOT NULL DEFAULT true,
  afternoon_time TEXT NOT NULL DEFAULT '12:00',
  evening_enabled BOOLEAN NOT NULL DEFAULT true,
  evening_time TEXT NOT NULL DEFAULT '20:00',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  push_subscription JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notif_enabled ON public.user_notification_settings(verse_notifications_enabled);

-- 2. Logs de notificações enviadas (Controle rígido de Idempotência)
CREATE TABLE IF NOT EXISTS public.verse_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('morning_verse', 'afternoon_verse', 'evening_verse')),
  verse_reference TEXT NOT NULL,
  verse_date DATE NOT NULL,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verse_logs_user_date ON public.verse_notification_logs(user_id, verse_date);
CREATE INDEX IF NOT EXISTS idx_verse_logs_status ON public.verse_notification_logs(status);

-- 3. Configurações globais administrativas para notificações
CREATE TABLE IF NOT EXISTS public.admin_notification_settings (
  id INT PRIMARY KEY DEFAULT 1,
  global_enabled BOOLEAN NOT NULL DEFAULT true,
  default_morning_time TEXT NOT NULL DEFAULT '08:00',
  default_afternoon_time TEXT NOT NULL DEFAULT '12:00',
  default_evening_time TEXT NOT NULL DEFAULT '20:00',
  custom_morning_title TEXT NOT NULL DEFAULT '🌅 Versículo da Manhã',
  custom_afternoon_title TEXT NOT NULL DEFAULT '☀️ Versículo da Tarde',
  custom_evening_title TEXT NOT NULL DEFAULT '🌙 Versículo da Noite',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.admin_notification_settings (id, global_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- Usuários gerenciam suas próprias configurações
CREATE POLICY "Users can manage their own notification settings" ON public.user_notification_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Usuários leem seus próprios logs
CREATE POLICY "Users can view their own notification logs" ON public.verse_notification_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Inserção de log via usuário autenticado para seu próprio id
CREATE POLICY "Users can insert their own notification logs" ON public.verse_notification_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Leitura pública de admin_notification_settings (para respeitar global_enabled)
CREATE POLICY "Public read of admin notification settings" ON public.admin_notification_settings
  FOR SELECT USING (true);

-- Admins podem atualizar admin_notification_settings e ver estatísticas agregadas
CREATE POLICY "Admins can update notification settings" ON public.admin_notification_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all logs" ON public.verse_notification_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
