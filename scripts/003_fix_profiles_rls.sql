-- =====================================================
-- FIX: Corrigir RLS recursivo na tabela profiles
-- =====================================================

-- Remove as políticas problemáticas
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Criar função SECURITY DEFINER para verificar se usuário é admin
-- Isso evita a recursão porque a função roda com permissões elevadas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Criar função SECURITY DEFINER para obter o role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Novas políticas sem recursão
-- Usuário pode ver seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Admin pode ver todos os perfis (usando função SECURITY DEFINER)
CREATE POLICY "profiles_select_admin" ON public.profiles 
  FOR SELECT USING (public.is_admin());

-- Usuário pode inserir seu próprio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admin pode atualizar qualquer perfil
CREATE POLICY "profiles_update_admin" ON public.profiles 
  FOR UPDATE USING (public.is_admin());

-- Admin pode deletar perfis (exceto o próprio)
CREATE POLICY "profiles_delete_admin" ON public.profiles 
  FOR DELETE USING (public.is_admin() AND auth.uid() != id);
