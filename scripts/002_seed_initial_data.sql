-- =====================================================
-- SEED: Dados iniciais do sistema
-- =====================================================

-- Marcas de dispositivos
INSERT INTO public.device_brands (name) VALUES 
  ('Apple'),
  ('Samsung'),
  ('Motorola'),
  ('Xiaomi'),
  ('LG'),
  ('Asus'),
  ('Huawei'),
  ('Nokia'),
  ('OnePlus'),
  ('Realme'),
  ('Outro')
ON CONFLICT (name) DO NOTHING;

-- Tipos de problemas comuns
INSERT INTO public.problem_types (name, description, estimated_price) VALUES 
  ('Troca de Tela', 'Substituição completa do display/LCD', 250.00),
  ('Substituição de Bateria', 'Troca da bateria por nova original/compatível', 120.00),
  ('Troca de Conector de Carga', 'Reparo ou substituição do conector de carregamento', 80.00),
  ('Reparo de Placa', 'Diagnóstico e reparo de componentes da placa-mãe', 200.00),
  ('Troca de Alto-falante', 'Substituição do alto-falante auricular ou de mídia', 60.00),
  ('Troca de Câmera', 'Substituição da câmera frontal ou traseira', 150.00),
  ('Troca de Microfone', 'Substituição do microfone', 70.00),
  ('Formatação', 'Reset de fábrica e reinstalação do sistema', 50.00),
  ('Remoção de Conta Google', 'Desbloqueio de conta Google/FRP', 100.00),
  ('Troca de Botões', 'Substituição de botões físicos (volume, power)', 60.00),
  ('Reparo de TouchID/FaceID', 'Diagnóstico e reparo de biometria', 180.00),
  ('Outros Reparos', 'Outros tipos de reparo não listados', NULL)
ON CONFLICT (name) DO NOTHING;

-- Métodos de pagamento
INSERT INTO public.payment_methods (name, fee_percentage) VALUES 
  ('Dinheiro', 0.00),
  ('PIX', 0.00),
  ('Cartão de Débito', 1.50),
  ('Cartão de Crédito à Vista', 3.50),
  ('Cartão de Crédito 2x', 5.00),
  ('Cartão de Crédito 3x', 6.50)
ON CONFLICT (name) DO NOTHING;

-- Categorias de despesas
INSERT INTO public.expense_categories (name, color) VALUES 
  ('Peças e Componentes', '#EF4444'),
  ('Aluguel', '#F59E0B'),
  ('Energia', '#10B981'),
  ('Internet/Telefone', '#3B82F6'),
  ('Motoboy/Entrega', '#8B5CF6'),
  ('Material de Escritório', '#EC4899'),
  ('Marketing', '#06B6D4'),
  ('Outros', '#6B7280')
ON CONFLICT (name) DO NOTHING;
