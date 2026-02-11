CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "leads_insert_public" ON public.leads;

DROP POLICY IF EXISTS "leads_insert_anon" ON public.leads;
CREATE POLICY "leads_insert_anon"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (
  status = 'pending'
  AND converted_order_id IS NULL
);

DROP POLICY IF EXISTS "leads_insert_authenticated" ON public.leads;
CREATE POLICY "leads_insert_authenticated"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  status = 'pending'
  AND converted_order_id IS NULL
);
