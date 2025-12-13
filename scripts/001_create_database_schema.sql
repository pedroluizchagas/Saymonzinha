-- =====================================================
-- SAYMON CELL - SISTEMA DE GESTÃO
-- Database Schema v1.0
-- =====================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: profiles (Usuários do sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'technician', 'attendant')),
  phone TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- TABELA: customers (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_all_authenticated" ON public.customers 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: device_brands (Marcas de dispositivos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.device_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.device_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_brands_read_all" ON public.device_brands FOR SELECT USING (true);
CREATE POLICY "device_brands_write_authenticated" ON public.device_brands 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: device_models (Modelos de dispositivos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.device_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.device_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_models_read_all" ON public.device_models FOR SELECT USING (true);
CREATE POLICY "device_models_write_authenticated" ON public.device_models 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: problem_types (Tipos de problemas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.problem_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  estimated_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.problem_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "problem_types_read_all" ON public.problem_types FOR SELECT USING (true);
CREATE POLICY "problem_types_write_authenticated" ON public.problem_types 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: service_orders (Ordens de Serviço)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  technician_id UUID REFERENCES public.profiles(id),
  
  -- Dados do aparelho
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_password TEXT,
  device_imei TEXT,
  device_color TEXT,
  
  -- Problema e diagnóstico
  problem_description TEXT NOT NULL,
  problem_type_id UUID REFERENCES public.problem_types(id),
  diagnosis TEXT,
  
  -- Status e fluxo
  status TEXT NOT NULL DEFAULT 'awaiting_device' CHECK (status IN (
    'lead', 'awaiting_device', 'in_analysis', 'awaiting_approval', 
    'in_repair', 'ready', 'delivered', 'cancelled'
  )),
  
  -- Checklist de entrada
  entry_checklist JSONB DEFAULT '{}',
  
  -- Valores
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  parts_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Delivery
  delivery_type TEXT DEFAULT 'store' CHECK (delivery_type IN ('store', 'delivery')),
  delivery_address TEXT,
  
  -- Datas
  received_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Controle
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_orders_all_authenticated" ON public.service_orders 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: service_order_history (Histórico de OS)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_order_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_order_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_order_history_all_authenticated" ON public.service_order_history 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: products (Produtos para venda - PDV)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('accessory', 'part', 'service', 'other')),
  purchase_price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_all_authenticated" ON public.products 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: payment_methods (Métodos de pagamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  fee_percentage DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_methods_all_authenticated" ON public.payment_methods 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: sales (Vendas - PDV)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number SERIAL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  service_order_id UUID REFERENCES public.service_orders(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  payment_method_id UUID REFERENCES public.payment_methods(id),
  payment_fee DECIMAL(10,2) DEFAULT 0,
  net_total DECIMAL(10,2) NOT NULL,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_all_authenticated" ON public.sales 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: sale_items (Itens da venda)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sale_items_all_authenticated" ON public.sale_items 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: expense_categories (Categorias de despesas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expense_categories_all_authenticated" ON public.expense_categories 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: cash_transactions (Fluxo de caixa)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cash_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'withdrawal', 'deposit')),
  category_id UUID REFERENCES public.expense_categories(id),
  sale_id UUID REFERENCES public.sales(id),
  
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  is_paid BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_transactions_all_authenticated" ON public.cash_transactions 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TABELA: leads (Pré-orçamentos do site)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados do cliente
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Dados do aparelho
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_password TEXT,
  
  -- Problema
  problem_type TEXT NOT NULL,
  problem_description TEXT,
  
  -- Delivery
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('store', 'delivery')),
  delivery_address TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
  converted_order_id UUID REFERENCES public.service_orders(id),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads podem ser criados sem autenticação (pelo site)
CREATE POLICY "leads_insert_public" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_select_authenticated" ON public.leads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "leads_update_authenticated" ON public.leads FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "leads_delete_authenticated" ON public.leads FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Criar profile automaticamente no signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'technician')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
