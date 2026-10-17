-- =====================================================
-- SAYMON CELL - Fotos dos produtos da loja virtual
-- O painel reduz a foto no navegador e envia para o espaco publico "produtos".
-- Qualquer pessoa ve as fotos; so quem esta logado no painel envia, troca ou apaga.
-- Rodar uma vez no SQL Editor do Supabase.
-- =====================================================

-- 1. Espaco publico de fotos, com ate 2 MB por foto e so formatos de imagem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('produtos', 'produtos', true, 2097152, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Remover politicas anteriores (caso existam) para evitar conflito
DROP POLICY IF EXISTS "produtos_select_public" ON storage.objects;
DROP POLICY IF EXISTS "produtos_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "produtos_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "produtos_delete_authenticated" ON storage.objects;

-- 3. Leitura publica das fotos
CREATE POLICY "produtos_select_public" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'produtos');

-- 4. Envio, troca e remocao so para usuarios logados no painel
CREATE POLICY "produtos_insert_authenticated" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'produtos' AND auth.uid() IS NOT NULL);

CREATE POLICY "produtos_update_authenticated" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'produtos' AND auth.uid() IS NOT NULL);

CREATE POLICY "produtos_delete_authenticated" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'produtos' AND auth.uid() IS NOT NULL);
