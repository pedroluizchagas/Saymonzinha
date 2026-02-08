 -- =====================================================
 -- TABELA: service_order_items (Itens vinculados à OS)
 -- =====================================================
 CREATE TABLE IF NOT EXISTS public.service_order_items (
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
   product_id UUID REFERENCES public.products(id),
   description TEXT NOT NULL,
   quantity INTEGER NOT NULL DEFAULT 1,
   unit_price DECIMAL(10,2) NOT NULL,
   total_price DECIMAL(10,2) NOT NULL,
   created_at TIMESTAMPTZ DEFAULT NOW()
 );
 
 ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;
 
 CREATE POLICY "service_order_items_all_authenticated" ON public.service_order_items 
   FOR ALL USING (auth.uid() IS NOT NULL);
 
