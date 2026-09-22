-- ==============================================================================
-- MIGRATION: CORREÇÃO DE POLÍTICAS RLS E NOTIFICAÇÕES DE PEDIDOS DE ORAÇÃO
-- ==============================================================================

-- 1. Assegurar que os usuários só podem visualizar suas próprias notificações
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'notifications' 
      AND policyname = 'Users can only view their own notifications'
  ) THEN
    CREATE POLICY "Users can only view their own notifications"
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Assegurar permissão de DELETE para o usuário em suas próprias notificações
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'notifications' 
      AND policyname = 'Users can delete their own notifications'
  ) THEN
    CREATE POLICY "Users can delete their own notifications"
      ON public.notifications
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Assegurar que o usuário só pode marcar/atualizar suas próprias notificações
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'notifications' 
      AND policyname = 'Users can update their own notifications'
  ) THEN
    ALTER POLICY "Users can update their own notifications"
      ON public.notifications
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  ELSE
    CREATE POLICY "Users can update their own notifications"
      ON public.notifications
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Assegurar política de inserção: somente o próprio autor pode disparar notificação
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'notifications' 
      AND policyname = 'Users can create notifications for others'
  ) THEN
    CREATE POLICY "Users can create notifications for others"
      ON public.notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = actor_id);
  END IF;
END $$;

-- 5. Prevenção de Duplicidades (Idempotência a nível de banco)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_question_actor 
  ON public.notifications (user_id, question_id, actor_id);

-- 6. Função de Backend com SECURITY DEFINER para criação automática de notificações de oração
-- Executada no servidor com permissões elevadas para evitar falhas de RLS em lote
CREATE OR REPLACE FUNCTION public.create_prayer_notifications(
  p_question_id UUID,
  p_author_id UUID,
  p_author_name TEXT,
  p_message_preview TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted_count INT := 0;
  v_clean_author TEXT;
  v_clean_msg TEXT;
  v_full_message TEXT;
BEGIN
  IF p_question_id IS NULL OR p_author_id IS NULL THEN
    RETURN 0;
  END IF;

  v_clean_author := COALESCE(NULLIF(TRIM(p_author_name), ''), 'Irmão(ã)');
  v_clean_msg := COALESCE(NULLIF(TRIM(p_message_preview), ''), 'Peço oração.');
  v_full_message := '🙏 ' || v_clean_author || ' publicou um novo pedido de oração:' || E'\n"' || v_clean_msg || '"';

  -- Insere uma notificação para cada outro usuário registrado, prevenindo duplicações e excluindo o autor
  WITH inserted_rows AS (
    INSERT INTO public.notifications (user_id, actor_id, type, question_id, message, read)
    SELECT
      p.user_id,
      p_author_id,
      'reaction',
      p_question_id,
      v_full_message,
      false
    FROM public.profiles p
    WHERE p.user_id IS NOT NULL
      AND p.user_id <> p_author_id
    ON CONFLICT (user_id, question_id, actor_id) DO NOTHING
    RETURNING id
  )
  SELECT COUNT(*) INTO v_inserted_count FROM inserted_rows;

  RETURN v_inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_prayer_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_prayer_notifications TO service_role;
