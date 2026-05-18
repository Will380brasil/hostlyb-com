
-- ============ FEATURE 1: GUIDEBOOK ============
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS guidebook_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guidebook_slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS guidebook_data jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_properties_guidebook_slug ON public.properties(guidebook_slug) WHERE guidebook_enabled = true;

-- Public read for active guidebooks (limited via column projection in server fn)
CREATE POLICY "Public can read active guidebooks"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (guidebook_enabled = true AND guidebook_slug IS NOT NULL);

-- ============ FEATURE 2: DIGITAL CHECK-IN ============
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS checkin_token uuid UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS checkin_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS document_country text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS nationality text;

CREATE INDEX IF NOT EXISTS idx_guests_checkin_token ON public.guests(checkin_token);

-- RPC for public check-in form to fetch and submit
CREATE OR REPLACE FUNCTION public.guest_checkin_get(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', g.id,
    'name', g.name,
    'checkin_date', g.checkin_date,
    'checkout_date', g.checkout_date,
    'submitted_at', g.checkin_submitted_at,
    'property_name', p.name,
    'property_address', p.address,
    'document', g.document,
    'document_country', g.document_country,
    'date_of_birth', g.date_of_birth,
    'nationality', g.nationality
  ) INTO r
  FROM public.guests g
  JOIN public.properties p ON p.id = g.property_id
  WHERE g.checkin_token = p_token;
  IF r IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.guest_checkin_submit(
  p_token uuid,
  p_name text,
  p_document text,
  p_document_country text,
  p_date_of_birth date,
  p_nationality text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  UPDATE public.guests
  SET name = COALESCE(NULLIF(p_name,''), name),
      document = p_document,
      document_country = p_document_country,
      date_of_birth = p_date_of_birth,
      nationality = p_nationality,
      checkin_submitted_at = NOW(),
      updated_at = NOW()
  WHERE checkin_token = p_token
  RETURNING id INTO v_id;
  IF v_id IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;
  RETURN jsonb_build_object('ok', true, 'id', v_id);
END $$;

GRANT EXECUTE ON FUNCTION public.guest_checkin_get(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_checkin_submit(uuid, text, text, text, date, text) TO anon, authenticated;

-- ============ FEATURE 3: MAINTENANCE LOG ============
ALTER TABLE public.maintenance_issues
  ADD COLUMN IF NOT EXISTS cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS responsible text,
  ADD COLUMN IF NOT EXISTS identified_date date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS internal_notes text;

-- Sync maintenance cost to transactions when resolved
CREATE OR REPLACE FUNCTION public.sync_maintenance_to_transaction()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status <> 'resolved' THEN RETURN NEW; END IF;
  IF COALESCE(NEW.cost, 0) <= 0 THEN RETURN NEW; END IF;

  -- Update placeholder transaction or insert new
  UPDATE public.transactions
    SET amount = NEW.cost,
        status = 'pago',
        description = 'Manutenção — ' || LEFT(NEW.description, 80),
        date = COALESCE(NEW.resolved_at::date, CURRENT_DATE),
        updated_at = NOW()
  WHERE origin = 'auto:maintenance'
    AND property_id = NEW.property_id
    AND notes = NEW.description
    AND amount = 0;

  IF NOT FOUND THEN
    INSERT INTO public.transactions
      (user_id, type, category, description, amount, date, status, property_id, origin, notes)
    VALUES
      (NEW.user_id, 'saida', 'Manutenção',
       'Manutenção — ' || LEFT(NEW.description, 80),
       NEW.cost, COALESCE(NEW.resolved_at::date, CURRENT_DATE), 'pago',
       NEW.property_id, 'auto:maintenance:resolved', NEW.description);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_maintenance_resolved ON public.maintenance_issues;
CREATE TRIGGER on_maintenance_resolved
  AFTER UPDATE ON public.maintenance_issues
  FOR EACH ROW
  WHEN (NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved')
  EXECUTE FUNCTION public.sync_maintenance_to_transaction();

-- Auto-set resolved_at when status changes to resolved
CREATE OR REPLACE FUNCTION public.set_maintenance_resolved_at()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved' AND NEW.resolved_at IS NULL THEN
    NEW.resolved_at := NOW();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS set_maintenance_resolved_at_trigger ON public.maintenance_issues;
CREATE TRIGGER set_maintenance_resolved_at_trigger
  BEFORE UPDATE ON public.maintenance_issues
  FOR EACH ROW EXECUTE FUNCTION public.set_maintenance_resolved_at();
