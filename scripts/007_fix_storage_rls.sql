-- =====================================================
-- FIX: Criar politicas RLS para o bucket avatar_profire
-- Resolve o erro "new row violates row-level security policy"
-- ao fazer upload de avatar e imagens de notas de servico.
-- =====================================================

-- 1. Garantir que o bucket existe e esta configurado como privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar_profire', 'avatar_profire', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover politicas anteriores (caso existam) para evitar conflito
DROP POLICY IF EXISTS "avatar_select_own" ON storage.objects;
DROP POLICY IF EXISTS "avatar_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "avatar_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "avatar_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete_authenticated" ON storage.objects;

-- 3. Permitir que usuarios autenticados facam SELECT (visualizar) nos objetos do bucket
CREATE POLICY "avatar_select_authenticated" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatar_profire'
    AND auth.uid() IS NOT NULL
  );

-- 4. Permitir que usuarios autenticados facam INSERT (upload) no bucket
--    O path do avatar segue o padrao: avatars/{user_id}.{ext}
--    O path de notas de servico segue: service_notes/os-{number}-{timestamp}.png
CREATE POLICY "avatar_insert_authenticated" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatar_profire'
    AND auth.uid() IS NOT NULL
  );

-- 5. Permitir que usuarios autenticados facam UPDATE (upsert) no bucket
CREATE POLICY "avatar_update_authenticated" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatar_profire'
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'avatar_profire'
    AND auth.uid() IS NOT NULL
  );

-- 6. Permitir que usuarios autenticados facam DELETE no bucket
CREATE POLICY "avatar_delete_authenticated" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatar_profire'
    AND auth.uid() IS NOT NULL
  );
