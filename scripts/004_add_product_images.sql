-- =====================================================
-- SAYMON CELL - Adicionar imagens aos produtos
-- =====================================================

-- Adicionar coluna de imagem aos produtos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Adicionar coluna para mostrar na loja pública
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_in_store BOOLEAN DEFAULT false;

-- Permitir leitura pública de produtos ativos na loja
DROP POLICY IF EXISTS "products_read_public" ON public.products;
CREATE POLICY "products_read_public" ON public.products 
  FOR SELECT USING (is_active = true AND show_in_store = true);

-- Manter policy para usuários autenticados (CRUD completo)
DROP POLICY IF EXISTS "products_all_authenticated" ON public.products;
CREATE POLICY "products_all_authenticated" ON public.products 
  FOR ALL USING (auth.uid() IS NOT NULL);
