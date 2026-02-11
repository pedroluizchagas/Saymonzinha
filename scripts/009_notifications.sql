-- =====================================================
-- 009: Tabela de Notificacoes do Sistema
-- =====================================================

-- Tipos de notificacao
CREATE TYPE notification_type AS ENUM (
  'new_lead',
  'low_stock',
  'new_purchase',
  'order_status',
  'system'
);

-- Tabela principal de notificacoes
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT DEFAULT '/admin',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de leitura por usuario (muitos-para-muitos)
-- Cada usuario pode marcar cada notificacao como lida independentemente
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification ON notification_reads(notification_id);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Politicas para notifications: todos autenticados podem ler
CREATE POLICY "Authenticated users can read notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

-- Apenas service_role pode inserir notificacoes (via server actions)
-- Nao criamos policy de INSERT para authenticated, usamos admin client

-- Politicas para notification_reads
CREATE POLICY "Users can read own notification reads"
  ON notification_reads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark notifications as read"
  ON notification_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark notifications"
  ON notification_reads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Habilitar Realtime para notificacoes
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
