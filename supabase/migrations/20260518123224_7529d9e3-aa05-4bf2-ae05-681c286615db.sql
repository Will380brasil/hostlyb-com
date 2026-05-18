
-- 1. cleaning_jobs: start time + computed duration
ALTER TABLE public.cleaning_jobs
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

CREATE OR REPLACE FUNCTION public.cleaning_jobs_timing()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'em_andamento' AND (OLD.status IS DISTINCT FROM 'em_andamento') AND NEW.started_at IS NULL THEN
    NEW.started_at := NOW();
  END IF;
  IF NEW.status = 'concluido' AND (OLD.status IS DISTINCT FROM 'concluido') THEN
    IF NEW.completed_at IS NULL THEN NEW.completed_at := NOW(); END IF;
    IF NEW.started_at IS NOT NULL THEN
      NEW.duration_minutes := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) / 60.0)::INT);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_cleaning_jobs_timing ON public.cleaning_jobs;
CREATE TRIGGER trg_cleaning_jobs_timing BEFORE UPDATE ON public.cleaning_jobs
  FOR EACH ROW EXECUTE FUNCTION public.cleaning_jobs_timing();

-- 2. guests: VIP & attention flags
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS had_issue BOOLEAN NOT NULL DEFAULT false;

-- 3. maintenance_issues
CREATE TABLE IF NOT EXISTS public.maintenance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  cleaning_job_id UUID,
  guest_id UUID,
  description TEXT NOT NULL,
  photo_url TEXT,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal','urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  reported_by TEXT NOT NULL DEFAULT 'host' CHECK (reported_by IN ('cleaner','host')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MI select own" ON public.maintenance_issues FOR SELECT
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "MI insert own" ON public.maintenance_issues FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "MI update own" ON public.maintenance_issues FOR UPDATE
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "MI delete own" ON public.maintenance_issues FOR DELETE
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_mi_user ON public.maintenance_issues(user_id, status);
CREATE INDEX IF NOT EXISTS idx_mi_property ON public.maintenance_issues(property_id);

CREATE TRIGGER trg_mi_updated_at BEFORE UPDATE ON public.maintenance_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- On new maintenance issue: create alert + pending transaction
CREATE OR REPLACE FUNCTION public.on_maintenance_issue_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prop_name TEXT;
BEGIN
  SELECT name INTO prop_name FROM public.properties WHERE id = NEW.property_id;
  PERFORM public.create_alert(
    NEW.user_id,
    'maintenance_issue',
    CASE WHEN NEW.urgency = 'urgent' THEN '🚨 Problema urgente reportado' ELSE '🔧 Manutenção reportada' END,
    'Problema em ' || COALESCE(prop_name,'imóvel') || ': ' || LEFT(NEW.description, 120),
    CASE WHEN NEW.urgency = 'urgent' THEN 'critical' ELSE 'medium' END,
    NEW.property_id, NEW.cleaning_job_id, NEW.guest_id,
    '/imoveis/' || NEW.property_id::TEXT, 'Ver imóvel'
  );
  INSERT INTO public.transactions
    (user_id, type, category, description, amount, date, status, property_id, origin, notes)
  VALUES
    (NEW.user_id, 'saida', 'Manutenção',
     'Manutenção pendente — ' || LEFT(NEW.description, 80),
     0, CURRENT_DATE, 'pendente', NEW.property_id, 'auto:maintenance', NEW.description);
  IF NEW.guest_id IS NOT NULL THEN
    UPDATE public.guests SET had_issue = true WHERE id = NEW.guest_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_mi_on_create ON public.maintenance_issues;
CREATE TRIGGER trg_mi_on_create AFTER INSERT ON public.maintenance_issues
  FOR EACH ROW EXECUTE FUNCTION public.on_maintenance_issue_created();

-- 4. RPC for cleaner portal
CREATE OR REPLACE FUNCTION public.cleaner_report_problem(
  p_token UUID, p_description TEXT, p_photo_url TEXT DEFAULT NULL, p_urgency TEXT DEFAULT 'normal'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_job RECORD;
  v_id UUID;
  v_guest UUID;
BEGIN
  SELECT id, user_id, property_id, scheduled_date INTO v_job
  FROM public.cleaning_jobs WHERE access_token = p_token;
  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;
  IF p_urgency NOT IN ('normal','urgent') THEN p_urgency := 'normal'; END IF;

  -- Try to attach to a guest who was staying at that date
  SELECT id INTO v_guest FROM public.guests
   WHERE property_id = v_job.property_id
     AND checkin_date <= v_job.scheduled_date
     AND checkout_date >= v_job.scheduled_date
   ORDER BY checkin_date DESC LIMIT 1;

  INSERT INTO public.maintenance_issues
    (user_id, property_id, cleaning_job_id, guest_id, description, photo_url, urgency, reported_by)
  VALUES
    (v_job.user_id, v_job.property_id, v_job.id, v_guest, p_description, p_photo_url, p_urgency, 'cleaner')
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- 5. Property cleaning stats view
CREATE OR REPLACE VIEW public.property_cleaning_stats
WITH (security_invoker = true) AS
SELECT
  p.id AS property_id,
  p.user_id,
  (SELECT MAX(completed_at) FROM public.cleaning_jobs cj
     WHERE cj.property_id = p.id AND cj.status = 'concluido') AS last_cleaning_at,
  (SELECT COUNT(*) FROM public.cleaning_jobs cj
     WHERE cj.property_id = p.id AND cj.status = 'concluido'
       AND cj.completed_at >= date_trunc('month', now())) AS cleanings_this_month,
  (SELECT COUNT(*) FROM public.maintenance_issues mi
     WHERE mi.property_id = p.id AND mi.status = 'open') AS open_issues,
  (SELECT AVG(duration_minutes)::INT FROM public.cleaning_jobs cj
     WHERE cj.property_id = p.id AND cj.duration_minutes IS NOT NULL) AS avg_duration_minutes
FROM public.properties p;

GRANT SELECT ON public.property_cleaning_stats TO authenticated;
