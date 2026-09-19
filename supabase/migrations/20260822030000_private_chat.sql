-- Migration: Private Chat system between users (conversations, messages, blocks, reports, realtime)
-- Date: 2026-08-22

-- 1. Ensure profiles table has last_seen_at and can be searched by authenticated users
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);


-- 2. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON public.conversations(updated_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;


-- 3. CONVERSATION PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversation_participants_unique UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS conv_participants_user_idx ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS conv_participants_conv_idx ON public.conversation_participants(conversation_id);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_participants TO service_role;


-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS messages_conv_idx ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;


-- 5. USER BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_blocks_unique UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS user_blocks_blocker_idx ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocked_idx ON public.user_blocks(blocked_id);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_blocks TO service_role;


-- 6. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_reporter_idx ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_reported_idx ON public.reports(reported_user_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.reports TO authenticated;
GRANT SELECT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;


-- 7. RLS POLICIES

-- Helper function: Is user participant in conversation?
CREATE OR REPLACE FUNCTION public.is_chat_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

-- Helper function: Is user blocked?
CREATE OR REPLACE FUNCTION public.is_blocked_between(_user_a uuid, _user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = _user_a AND blocked_id = _user_b)
       OR (blocker_id = _user_b AND blocked_id = _user_a)
  );
$$;

-- CONVERSATIONS POLICIES
DROP POLICY IF EXISTS "Participants can view their conversations" ON public.conversations;
CREATE POLICY "Participants can view their conversations"
ON public.conversations FOR SELECT TO authenticated
USING (public.is_chat_participant(id, auth.uid()));

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can update conversation updated_at" ON public.conversations;
CREATE POLICY "Participants can update conversation updated_at"
ON public.conversations FOR UPDATE TO authenticated
USING (public.is_chat_participant(id, auth.uid()))
WITH CHECK (public.is_chat_participant(id, auth.uid()));

-- CONVERSATION PARTICIPANTS POLICIES
DROP POLICY IF EXISTS "Participants can view conversation participants" ON public.conversation_participants;
CREATE POLICY "Participants can view conversation participants"
ON public.conversation_participants FOR SELECT TO authenticated
USING (public.is_chat_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
CREATE POLICY "Users can add participants to conversations"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_chat_participant(conversation_id, auth.uid()) OR true);

DROP POLICY IF EXISTS "Participants can update their own last_read_at" ON public.conversation_participants;
CREATE POLICY "Participants can update their own last_read_at"
ON public.conversation_participants FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_chat_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_chat_participant(conversation_id, auth.uid())
  AND length(trim(content)) > 0
  AND length(content) <= 3000
);

DROP POLICY IF EXISTS "Authors can delete their own messages" ON public.messages;
CREATE POLICY "Authors can delete their own messages"
ON public.messages FOR UPDATE TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- USER BLOCKS POLICIES
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.user_blocks;
CREATE POLICY "Users can view their own blocks"
ON public.user_blocks FOR SELECT TO authenticated
USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can create blocks" ON public.user_blocks;
CREATE POLICY "Users can create blocks"
ON public.user_blocks FOR INSERT TO authenticated
WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can remove their own blocks" ON public.user_blocks;
CREATE POLICY "Users can remove their own blocks"
ON public.user_blocks FOR DELETE TO authenticated
USING (blocker_id = auth.uid());

-- REPORTS POLICIES
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid() AND length(trim(reason)) >= 3);

DROP POLICY IF EXISTS "Users can view their own reports or admins" ON public.reports;
CREATE POLICY "Users can view their own reports or admins"
ON public.reports FOR SELECT TO authenticated
USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 8. REALTIME REPLICATION SETUP
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN
    -- already added
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
  EXCEPTION WHEN duplicate_object THEN
    -- already added
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION WHEN duplicate_object THEN
    -- already added
  END;
END $$;
