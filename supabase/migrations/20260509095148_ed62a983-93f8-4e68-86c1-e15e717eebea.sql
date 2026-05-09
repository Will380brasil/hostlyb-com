CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','live')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  price_id TEXT,
  product_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, environment);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organization_id, environment);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their subscription"
ON public.subscriptions FOR SELECT
USING (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()));

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.org_has_active_subscription(_org_id UUID, _env TEXT DEFAULT 'sandbox')
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE organization_id = _org_id
      AND environment = _env
      AND (
        status IN ('active','trialing')
        OR (status = 'canceled' AND current_period_end > now())
        OR (status = 'past_due' AND current_period_end > now())
      )
  );
$$;