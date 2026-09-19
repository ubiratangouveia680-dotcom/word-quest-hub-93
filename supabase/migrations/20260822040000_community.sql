-- ==============================================================================
-- COMUNIDADE WORD QUEST - SCHEMA & RLS
-- ==============================================================================

-- 1. Categorias da Comunidade
CREATE TABLE IF NOT EXISTS public.community_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir as 10 categorias padrão
INSERT INTO public.community_categories (id, name, description, icon, order_index) VALUES
  ('biblia', 'Bíblia', 'Perguntas e reflexões sobre passagens e capítulos da Bíblia', '📖', 1),
  ('oracao', 'Oração', 'Pedidos de oração, gratidão e intercessão cristã', '🙏', 2),
  ('vida-crista', 'Vida Cristã', 'Desafios cotidianos, testemunhos e santificação', '❤️', 3),
  ('estudos-biblicos', 'Estudos Bíblicos', 'Exegese, teologia bíblica e aprofundamento', '📚', 4),
  ('duvidas', 'Dúvidas', 'Tire dúvidas doutrinárias, pastorais e teológicas', '❓', 5),
  ('fe', 'Fé', 'Esperança, milagres e perseverança espiritual', '🕊️', 6),
  ('familia', 'Família', 'Casamento, filhos e princípios bíblicos no lar', '👨‍👩‍👧', 7),
  ('historia-biblica', 'História Bíblica', 'Arqueologia, contexto histórico e geografia bíblica', '📜', 8),
  ('conhecimento', 'Conhecimento', 'Curiosidades e aprendizados das Escrituras', '💡', 9),
  ('geral', 'Geral', 'Conversas edificantes e comunhão fraterna', '📌', 10)
ON CONFLICT (id) DO NOTHING;

-- 2. Perguntas (Tópicos do Fórum)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES public.community_categories(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  verse_reference TEXT,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  accepted_answer_id UUID,
  likes_count INT NOT NULL DEFAULT 0,
  answers_count INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_user ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON public.questions(created_at DESC);

-- 3. Respostas e Respostas Encadeadas (Threaded)
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  verse_reference TEXT,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_parent ON public.answers(parent_id);
CREATE INDEX IF NOT EXISTS idx_answers_user ON public.answers(user_id);

-- Adicionar foreign key de accepted_answer_id em questions agora que answers existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_questions_accepted_answer'
  ) THEN
    ALTER TABLE public.questions
    ADD CONSTRAINT fk_questions_accepted_answer
    FOREIGN KEY (accepted_answer_id) REFERENCES public.answers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Curtidas em Perguntas
CREATE TABLE IF NOT EXISTS public.question_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- 5. Curtidas em Respostas
CREATE TABLE IF NOT EXISTS public.answer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- 6. Reações com Emojis Cristãos (Perguntas e Respostas)
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  target_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  reaction_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(target_type, target_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_target ON public.reactions(target_type, target_id);

-- 7. Notificações do Usuário
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('answer', 'reply', 'question_like', 'answer_like', 'reaction', 'accepted_answer')),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- 8. Denúncias (Moderação)
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer', 'user')),
  target_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Usuários Bloqueados
CREATE TABLE IF NOT EXISTS public.community_blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_blocked_users ENABLE ROW LEVEL SECURITY;

-- Categorias: Qualquer um pode ler
CREATE POLICY "Public categories read" ON public.community_categories
  FOR SELECT USING (true);

-- Perguntas: Qualquer um pode ler, autenticados criam, autor edita/exclui
CREATE POLICY "Public questions read" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON public.questions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update questions" ON public.questions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete questions" ON public.questions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Respostas: Qualquer um pode ler, autenticados criam, autor edita/exclui
CREATE POLICY "Public answers read" ON public.answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON public.answers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update answers" ON public.answers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete answers" ON public.answers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Curtidas em perguntas
CREATE POLICY "Public question likes read" ON public.question_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can toggle question likes" ON public.question_likes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Curtidas em respostas
CREATE POLICY "Public answer likes read" ON public.answer_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can toggle answer likes" ON public.answer_likes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reações
CREATE POLICY "Public reactions read" ON public.reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their reactions" ON public.reactions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notificações
CREATE POLICY "Users can only view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications for others" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Denúncias
CREATE POLICY "Users can create reports" ON public.community_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Bloqueios
CREATE POLICY "Users can manage their blocked list" ON public.community_blocked_users
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
