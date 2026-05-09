
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada','saida')),
  category TEXT NOT NULL DEFAULT 'outros',
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pago' CHECK (status IN ('pago','pendente','cancelado')),
  payment_method TEXT,
  property_id UUID,
  guest_id UUID,
  cleaning_job_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tx select own" ON public.transactions FOR SELECT
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "Tx insert own" ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "Tx update own" ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "Tx delete own" ON public.transactions FOR DELETE
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));

CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
