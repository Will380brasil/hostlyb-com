
-- iCal feeds table
CREATE TABLE public.ical_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'custom',
  label TEXT,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_status TEXT,
  last_error TEXT,
  events_imported INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ical_feeds_user ON public.ical_feeds(user_id);
CREATE INDEX idx_ical_feeds_property ON public.ical_feeds(property_id);

ALTER TABLE public.ical_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ical_feeds select own" ON public.ical_feeds FOR SELECT
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "ical_feeds insert own" ON public.ical_feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "ical_feeds update own" ON public.ical_feeds FOR UPDATE
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));
CREATE POLICY "ical_feeds delete own" ON public.ical_feeds FOR DELETE
  USING (auth.uid() = user_id AND user_can_access_app(auth.uid()));

CREATE TRIGGER trg_ical_feeds_updated_at
  BEFORE UPDATE ON public.ical_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend guests with iCal dedup keys
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS ical_uid TEXT;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS ical_source TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_ical_uid_user ON public.guests(user_id, ical_uid) WHERE ical_uid IS NOT NULL;

-- Maintenance -> transactions sync trigger (auto-expense)
CREATE OR REPLACE FUNCTION public.sync_maintenance_tx()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.transactions WHERE origin = 'maintenance' AND notes = OLD.id::text AND user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  IF COALESCE(NEW.cost, 0) <= 0 THEN
    DELETE FROM public.transactions WHERE origin = 'maintenance' AND notes = NEW.id::text AND user_id = NEW.user_id;
    RETURN NEW;
  END IF;

  INSERT INTO public.transactions (user_id, type, category, description, amount, date, status, property_id, notes, origin)
  VALUES (
    NEW.user_id, 'despesa', 'manutencao',
    COALESCE('Manutenção: ' || LEFT(NEW.description, 80), 'Manutenção'),
    NEW.cost, COALESCE(NEW.identified_date, CURRENT_DATE),
    CASE WHEN NEW.status = 'resolved' THEN 'pago' ELSE 'pendente' END,
    NEW.property_id, NEW.id::text, 'maintenance'
  )
  ON CONFLICT DO NOTHING;

  UPDATE public.transactions
    SET amount = NEW.cost,
        description = COALESCE('Manutenção: ' || LEFT(NEW.description, 80), 'Manutenção'),
        status = CASE WHEN NEW.status = 'resolved' THEN 'pago' ELSE 'pendente' END,
        date = COALESCE(NEW.identified_date, CURRENT_DATE),
        property_id = NEW.property_id,
        updated_at = now()
    WHERE origin = 'maintenance' AND notes = NEW.id::text AND user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_maintenance_tx ON public.maintenance_issues;
CREATE TRIGGER trg_sync_maintenance_tx
  AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_issues
  FOR EACH ROW EXECUTE FUNCTION public.sync_maintenance_tx();
