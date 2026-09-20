ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- Criar bucket de avatares caso o schema storage exista no Supabase
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    ON CONFLICT (id) DO UPDATE SET public = true;
  END IF;
END $$;

-- Políticas de segurança para o bucket avatars
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
    CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');

    DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
    CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

    DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
    CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

    DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
    CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
