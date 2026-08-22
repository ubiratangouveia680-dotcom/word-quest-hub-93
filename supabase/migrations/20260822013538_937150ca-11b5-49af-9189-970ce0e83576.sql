CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.ad_settings (
  id integer PRIMARY KEY DEFAULT 1,
  ads_enabled boolean NOT NULL DEFAULT true,
  publisher_id text NOT NULL DEFAULT '',
  slot_banner text NOT NULL DEFAULT '',
  slot_mobile text NOT NULL DEFAULT '',
  slot_desktop text NOT NULL DEFAULT '',
  slot_in_article text NOT NULL DEFAULT '',
  slot_end_of_chapter text NOT NULL DEFAULT '',
  ga_measurement_id text NOT NULL DEFAULT '',
  ads_txt text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT ad_settings_singleton CHECK (id = 1)
);

GRANT SELECT ON public.ad_settings TO anon;
GRANT SELECT, UPDATE ON public.ad_settings TO authenticated;
GRANT ALL ON public.ad_settings TO service_role;

ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ad settings are publicly readable"
ON public.ad_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update ad settings"
ON public.ad_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ad_settings_set_updated_at
BEFORE UPDATE ON public.ad_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.ad_settings (id) VALUES (1);