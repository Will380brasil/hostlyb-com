
-- 1) Transactions: origin column
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'manual';

-- Idempotency: at most one auto guest-hospedagem tx per guest, one auto cleaning tx per cleaning
CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_auto_guest
  ON public.transactions (guest_id)
  WHERE origin = 'auto:guest' AND guest_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_auto_cleaning
  ON public.transactions (cleaning_job_id)
  WHERE origin = 'auto:cleaning' AND cleaning_job_id IS NOT NULL;

-- 2) Subscriptions: plan_tier
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free';

-- Backfill plan_tier from price_id for existing rows
UPDATE public.subscriptions
SET plan_tier = CASE
  WHEN price_id LIKE 'premium_monthly%' THEN 'premium'
  WHEN price_id LIKE 'pro_monthly%' THEN 'pro'
  WHEN price_id LIKE 'hostly_pro%' THEN 'premium'  -- legacy mapping
  ELSE 'free'
END
WHERE plan_tier = 'free' AND price_id IS NOT NULL;

-- 3) Auto-sync triggers
CREATE OR REPLACE FUNCTION public.sync_guest_to_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.total_value IS NULL OR NEW.total_value <= 0 THEN RETURN NEW; END IF;
  INSERT INTO public.transactions
    (user_id, type, category, description, amount, date, status,
     property_id, guest_id, payment_method, origin)
  VALUES
    (NEW.user_id, 'entrada', 'Hospedagem',
     'Reserva ' || COALESCE(NEW.platform,'') || ' — ' || NEW.name,
     NEW.total_value, NEW.checkin_date, 'pago',
     NEW.property_id, NEW.id, NULL, 'auto:guest')
  ON CONFLICT (guest_id) WHERE origin = 'auto:guest' AND guest_id IS NOT NULL
  DO UPDATE SET amount = EXCLUDED.amount, date = EXCLUDED.date, updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_guest_tx ON public.guests;
CREATE TRIGGER trg_sync_guest_tx
AFTER INSERT OR UPDATE OF total_value, name, platform, checkin_date, property_id ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.sync_guest_to_transaction();

CREATE OR REPLACE FUNCTION public.sync_cleaning_to_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cleaner_name TEXT;
BEGIN
  IF NEW.status <> 'concluido' THEN RETURN NEW; END IF;
  IF NEW.payment_amount IS NULL OR NEW.payment_amount <= 0 THEN RETURN NEW; END IF;
  SELECT name INTO v_cleaner_name FROM public.cleaners WHERE id = NEW.cleaner_id;
  INSERT INTO public.transactions
    (user_id, type, category, description, amount, date, status,
     property_id, cleaning_job_id, payment_method, origin)
  VALUES
    (NEW.user_id, 'saida', 'Limpeza / faxina',
     'Limpeza — ' || COALESCE(v_cleaner_name,'Faxineira'),
     NEW.payment_amount, NEW.scheduled_date,
     CASE WHEN NEW.payment_status = 'pago' THEN 'pago' ELSE 'pendente' END,
     NEW.property_id, NEW.id, NULL, 'auto:cleaning')
  ON CONFLICT (cleaning_job_id) WHERE origin = 'auto:cleaning' AND cleaning_job_id IS NOT NULL
  DO UPDATE SET amount = EXCLUDED.amount, date = EXCLUDED.date,
                status = EXCLUDED.status, updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_cleaning_tx ON public.cleaning_jobs;
CREATE TRIGGER trg_sync_cleaning_tx
AFTER INSERT OR UPDATE OF status, payment_amount, payment_status, scheduled_date, cleaner_id ON public.cleaning_jobs
FOR EACH ROW EXECUTE FUNCTION public.sync_cleaning_to_transaction();

-- 4) Access functions — Free tier is permanent. Drop legacy 7-day grace.
CREATE OR REPLACE FUNCTION public.user_can_access_app(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user IS NOT NULL;  -- any authenticated user can use the app (free or paid)
$$;

CREATE OR REPLACE FUNCTION public.can_add_property(_user uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_tier TEXT;
  v_count INT;
BEGIN
  IF _user IS NULL THEN RETURN false; END IF;

  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = _user) INTO v_is_admin;
  IF v_is_admin THEN RETURN true; END IF;

  -- Resolve effective plan_tier via org subscription
  SELECT s.plan_tier INTO v_tier
  FROM public.organization_members m
  JOIN public.subscriptions s ON s.organization_id = m.organization_id
  WHERE m.user_id = _user
    AND (s.status IN ('active','trialing')
         OR (s.status IN ('canceled','past_due') AND s.current_period_end > now()))
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_tier IS NULL THEN v_tier := 'free'; END IF;

  IF v_tier IN ('pro','premium') THEN
    RETURN true;  -- unlimited
  END IF;

  -- free: max 2 properties
  SELECT COUNT(*) INTO v_count FROM public.properties WHERE user_id = _user AND archived = false;
  RETURN v_count < 2;
END $$;
