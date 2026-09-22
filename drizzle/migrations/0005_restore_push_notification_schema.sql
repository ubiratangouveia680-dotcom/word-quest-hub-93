CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  device_name text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own push subscriptions" ON public.push_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_push_sub_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_sub_endpoint ON public.push_subscriptions(endpoint);

CREATE TABLE IF NOT EXISTS public.prayer_notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_requests_enabled boolean NOT NULL DEFAULT true,
  prayer_support_enabled boolean NOT NULL DEFAULT true,
  community_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_notification_preferences TO authenticated;
GRANT ALL ON public.prayer_notification_preferences TO service_role;
ALTER TABLE public.prayer_notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their notification preferences" ON public.prayer_notification_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);