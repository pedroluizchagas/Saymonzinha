-- =====================================================
-- 008: Tabela de Push Subscriptions para Notificacoes
-- =====================================================

-- Tabela para armazenar subscriptions de push notification
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indice para busca por user_id
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Indice para busca por endpoint (usado no unsubscribe)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Habilitar RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios autenticados podem inserir suas proprias subscriptions
CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politica: usuarios autenticados podem ver suas proprias subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politica: usuarios autenticados podem deletar suas proprias subscriptions
CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politica: usuarios autenticados podem atualizar suas proprias subscriptions (upsert)
CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
