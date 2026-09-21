-- ==============================================================================
-- MIGRATION: SISTEMA DE NOTIFICAÇÕES PARA PEDIDOS DE ORAÇÃO
-- ==============================================================================

-- 1. Criar Tabela Segura de Notificações de Usuário
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'prayer_request',
  title TEXT NOT NULL DEFAULT '🙏 Novo pedido de oração',
  message TEXT NOT NULL DEFAULT 'Alguém publicou um novo pedido de oração. Ore por essa pessoa.',
  reference_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices para Alto Desempenho e Prevenção de Duplicidades
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_ref ON public.user_notifications(reference_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_notifications_unique ON public.user_notifications(user_id, reference_id, type);

-- 3. Habilitar RLS e Permissões Seguras
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE, DELETE ON public.user_notifications TO authenticated;
GRANT ALL ON public.user_notifications TO service_role;

-- 4. Políticas de RLS Estritas (Usuário acessa SOMENTE as suas próprias notificações)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notifications' AND policyname = 'Users can view their own notifications') THEN
    CREATE POLICY "Users can view their own notifications"
      ON public.user_notifications
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notifications' AND policyname = 'Users can update their own notifications') THEN
    CREATE POLICY "Users can update their own notifications"
      ON public.user_notifications
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notifications' AND policyname = 'Users can delete their own notifications') THEN
    CREATE POLICY "Users can delete their own notifications"
      ON public.user_notifications
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Trigger no Backend: Geração Automática e Eficiente de Notificações
-- Sempre que um novo pedido de oração for inserido em public.prayer_requests:
-- 1. Identifica o autor (NEW.user_id).
-- 2. Busca todos os usuários cadastrados em public.profiles.
-- 3. Exclui o autor do pedido (o autor nunca recebe notificação de si próprio).
-- 4. Insere em lote as notificações em um único comando set-based de alta performance.
CREATE OR REPLACE FUNCTION public.handle_new_prayer_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insere uma notificação para cada outro usuário registrado
  INSERT INTO public.user_notifications (user_id, type, title, message, reference_id, read)
  SELECT
    p.user_id,
    'prayer_request',
    '🙏 Novo pedido de oração',
    'Alguém publicou um novo pedido de oração. Ore por essa pessoa.',
    NEW.id,
    false
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL
    AND (NEW.user_id IS NULL OR p.user_id <> NEW.user_id)
  ON CONFLICT (user_id, reference_id, type) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_prayer_request ON public.prayer_requests;
CREATE TRIGGER trg_notify_on_prayer_request
AFTER INSERT ON public.prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_prayer_request_notification();

-- 6. Habilitar Supabase Realtime para a tabela de notificações
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_notifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
    END IF;
  END IF;
END $$;
