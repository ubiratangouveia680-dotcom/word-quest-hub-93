CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, name = COALESCE(public.profiles.name, EXCLUDED.name), updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book text NOT NULL, chapter integer NOT NULL, verse integer, reference text NOT NULL, text text,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (user_id, reference)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own favorites" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);

CREATE TABLE public.reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book text NOT NULL, chapter integer NOT NULL, verse integer, reference text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (user_id, book, chapter)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_history TO authenticated;
GRANT ALL ON public.reading_history TO service_role;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own reading history" ON public.reading_history FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX reading_history_user_id_idx ON public.reading_history(user_id);
CREATE TRIGGER reading_history_set_updated_at BEFORE UPDATE ON public.reading_history FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL, subject text NOT NULL,
  message text NOT NULL, user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (length(trim(name)) >= 2 AND length(trim(email)) >= 5 AND position('@' in email) > 1 AND length(trim(subject)) >= 2 AND length(trim(message)) BETWEEN 10 AND 5000);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.community_categories (
  id text PRIMARY KEY, name text NOT NULL, description text, icon text NOT NULL, order_index integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_categories TO authenticated;
GRANT ALL ON public.community_categories TO service_role;
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public categories read" ON public.community_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.community_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category_id text NOT NULL REFERENCES public.community_categories(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, title text NOT NULL, body text NOT NULL,
  verse_reference text, is_answered boolean NOT NULL DEFAULT false, accepted_answer_id uuid,
  likes_count integer NOT NULL DEFAULT 0, answers_count integer NOT NULL DEFAULT 0, views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public questions read" ON public.questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users create questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors update questions" ON public.questions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors delete questions" ON public.questions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, parent_id uuid REFERENCES public.answers(id) ON DELETE CASCADE,
  body text NOT NULL, verse_reference text, is_accepted boolean NOT NULL DEFAULT false, likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ADD CONSTRAINT fk_questions_accepted_answer FOREIGN KEY (accepted_answer_id) REFERENCES public.answers(id) ON DELETE SET NULL;
GRANT SELECT ON public.answers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public answers read" ON public.answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users create answers" ON public.answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors update answers" ON public.answers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors delete answers" ON public.answers FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.question_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(question_id, user_id)
);
GRANT SELECT ON public.question_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.question_likes TO authenticated;
GRANT ALL ON public.question_likes TO service_role;
ALTER TABLE public.question_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public question likes read" ON public.question_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users manage question likes" ON public.question_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.answer_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), answer_id uuid NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(answer_id, user_id)
);
GRANT SELECT ON public.answer_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.answer_likes TO authenticated;
GRANT ALL ON public.answer_likes TO service_role;
ALTER TABLE public.answer_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public answer likes read" ON public.answer_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users manage answer likes" ON public.answer_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), target_type text NOT NULL CHECK (target_type IN ('question','answer')),
  target_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL, reaction_name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(target_type, target_id, user_id, emoji)
);
GRANT SELECT ON public.reactions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reactions TO authenticated;
GRANT ALL ON public.reactions TO service_role;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reactions read" ON public.reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users manage reactions" ON public.reactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('answer','reply','question_like','answer_like','reaction','accepted_answer')),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES public.answers(id) ON DELETE CASCADE, read boolean NOT NULL DEFAULT false,
  message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), target_type text NOT NULL CHECK (target_type IN ('question','answer','user')),
  target_id uuid NOT NULL, reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.community_reports TO authenticated;
GRANT SELECT, UPDATE ON public.community_reports TO authenticated;
GRANT ALL ON public.community_reports TO service_role;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create community reports" ON public.community_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view own reports" ON public.community_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.community_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.community_blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, blocked_user_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_blocked_users TO authenticated;
GRANT ALL ON public.community_blocked_users TO service_role;
ALTER TABLE public.community_blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage blocked list" ON public.community_blocked_users FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  verse_notifications_enabled boolean NOT NULL DEFAULT true, morning_enabled boolean NOT NULL DEFAULT true,
  morning_time text NOT NULL DEFAULT '08:00', afternoon_enabled boolean NOT NULL DEFAULT true,
  afternoon_time text NOT NULL DEFAULT '12:00', evening_enabled boolean NOT NULL DEFAULT true,
  evening_time text NOT NULL DEFAULT '20:00', timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  push_subscription jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notification_settings TO authenticated;
GRANT ALL ON public.user_notification_settings TO service_role;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage notification settings" ON public.user_notification_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.verse_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('morning_verse','afternoon_verse','evening_verse')),
  verse_reference text NOT NULL, verse_date date NOT NULL, scheduled_at timestamptz, sent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','skipped')), error_message text,
  idempotency_key text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.verse_notification_logs TO authenticated;
GRANT ALL ON public.verse_notification_logs TO service_role;
ALTER TABLE public.verse_notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notification logs" ON public.verse_notification_logs FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own notification logs" ON public.verse_notification_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.admin_notification_settings (
  id integer PRIMARY KEY DEFAULT 1, global_enabled boolean NOT NULL DEFAULT true,
  default_morning_time text NOT NULL DEFAULT '08:00', default_afternoon_time text NOT NULL DEFAULT '12:00', default_evening_time text NOT NULL DEFAULT '20:00',
  custom_morning_title text NOT NULL DEFAULT 'Versículo da Manhã', custom_afternoon_title text NOT NULL DEFAULT 'Versículo da Tarde',
  custom_evening_title text NOT NULL DEFAULT 'Versículo da Noite', updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT admin_notification_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.admin_notification_settings TO anon, authenticated;
GRANT UPDATE ON public.admin_notification_settings TO authenticated;
GRANT ALL ON public.admin_notification_settings TO service_role;
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads admin notification settings" ON public.admin_notification_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update notification settings" ON public.admin_notification_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_questions_category ON public.questions(category_id);
CREATE INDEX idx_questions_created ON public.questions(created_at DESC);
CREATE INDEX idx_answers_question ON public.answers(question_id);
CREATE INDEX idx_reactions_target ON public.reactions(target_type, target_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE TRIGGER questions_set_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER answers_set_updated_at BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER user_notification_settings_set_updated_at BEFORE UPDATE ON public.user_notification_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER admin_notification_settings_set_updated_at BEFORE UPDATE ON public.admin_notification_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();