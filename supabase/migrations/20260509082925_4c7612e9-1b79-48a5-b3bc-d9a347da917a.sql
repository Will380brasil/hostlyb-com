
-- 1. Tabela alerts
CREATE TABLE public.alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  property_id     UUID,
  cleaning_job_id UUID,
  guest_id        UUID,
  type            TEXT NOT NULL CHECK (type IN (
    'checkout_tomorrow','checkout_today','checkin_tomorrow','checkin_today',
    'cleaning_pending','cleaning_completed','cleaning_problem',
    'forgotten_item','forgotten_item_resolved',
    'payment_pending','ical_sync_error','property_idle'
  )),
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  priority        TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  is_dismissed    BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  action_url      TEXT,
  action_label    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id  ON public.alerts(user_id);
CREATE INDEX idx_alerts_unread   ON public.alerts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_priority ON public.alerts(priority);
CREATE INDEX idx_alerts_type     ON public.alerts(type);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alerts select own" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Alerts insert own" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Alerts update own" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Alerts delete own" ON public.alerts FOR DELETE USING (auth.uid() = user_id);

-- 2. Helper: criar alerta (SECURITY DEFINER para uso em triggers)
CREATE OR REPLACE FUNCTION public.create_alert(
  p_user_id      UUID,
  p_type         TEXT,
  p_title        TEXT,
  p_message      TEXT,
  p_priority     TEXT DEFAULT 'medium',
  p_property_id  UUID DEFAULT NULL,
  p_cleaning_id  UUID DEFAULT NULL,
  p_guest_id     UUID DEFAULT NULL,
  p_action_url   TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE alert_id UUID;
BEGIN
  INSERT INTO public.alerts (
    user_id, type, title, message, priority,
    property_id, cleaning_job_id, guest_id,
    action_url, action_label
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_priority,
    p_property_id, p_cleaning_id, p_guest_id,
    p_action_url, p_action_label
  ) RETURNING id INTO alert_id;
  RETURN alert_id;
END;
$$;

-- 3. Trigger: objeto esquecido inserido → alerta crítico
CREATE OR REPLACE FUNCTION public.trigger_forgotten_item_alert()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  prop_name TEXT;
  open_count INT;
BEGIN
  SELECT name INTO prop_name FROM public.properties WHERE id = NEW.property_id;

  SELECT COUNT(*) INTO open_count
  FROM public.forgotten_items
  WHERE cleaning_job_id = NEW.cleaning_job_id
    AND status NOT IN ('devolvido','descartado');

  PERFORM public.create_alert(
    NEW.user_id,
    'forgotten_item',
    '⚠️ Objeto esquecido encontrado',
    'A faxineira encontrou ' || open_count::TEXT || ' objeto(s) esquecido(s) em ' || COALESCE(prop_name,'imóvel') || '.',
    'critical',
    NEW.property_id,
    NEW.cleaning_job_id,
    NULL,
    '/limpezas',
    'Ver objetos esquecidos'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_forgotten_item_insert
  AFTER INSERT ON public.forgotten_items
  FOR EACH ROW EXECUTE FUNCTION public.trigger_forgotten_item_alert();

-- 4. Trigger: objeto esquecido todos resolvidos → alerta low
CREATE OR REPLACE FUNCTION public.trigger_forgotten_item_resolved_alert()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  open_count INT;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('devolvido','descartado') THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO open_count
  FROM public.forgotten_items
  WHERE cleaning_job_id = NEW.cleaning_job_id
    AND status NOT IN ('devolvido','descartado')
    AND id <> NEW.id;

  IF open_count = 0 THEN
    PERFORM public.create_alert(
      NEW.user_id,
      'forgotten_item_resolved',
      '✅ Objetos esquecidos resolvidos',
      'Todos os objetos esquecidos da limpeza foram tratados.',
      'low',
      NEW.property_id,
      NEW.cleaning_job_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_forgotten_item_status_change
  AFTER UPDATE OF status ON public.forgotten_items
  FOR EACH ROW EXECUTE FUNCTION public.trigger_forgotten_item_resolved_alert();

-- 5. Trigger: limpeza muda de status → alertas + status do imóvel
CREATE OR REPLACE FUNCTION public.trigger_cleaning_status_alert()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE prop_name TEXT;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  SELECT name INTO prop_name FROM public.properties WHERE id = NEW.property_id;

  IF NEW.status = 'concluido' THEN
    UPDATE public.properties SET status='livre', updated_at=NOW() WHERE id = NEW.property_id;
    PERFORM public.create_alert(
      NEW.user_id,'cleaning_completed',
      '✅ Limpeza concluída',
      COALESCE(prop_name,'O imóvel') || ' está limpo e pronto para o próximo hóspede.',
      'low', NEW.property_id, NEW.id, NULL,
      '/limpezas','Ver limpezas'
    );
  ELSIF NEW.status = 'em_andamento' THEN
    UPDATE public.properties SET status='limpeza', updated_at=NOW() WHERE id = NEW.property_id;
  ELSIF NEW.status = 'problema' THEN
    PERFORM public.create_alert(
      NEW.user_id,'cleaning_problem',
      '🚨 Problema na limpeza',
      'A faxineira reportou um problema em ' || COALESCE(prop_name,'um imóvel') || '. Verifique imediatamente.',
      'critical', NEW.property_id, NEW.id, NULL,
      '/limpezas','Ver problema'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_cleaning_status_change
  AFTER UPDATE OF status ON public.cleaning_jobs
  FOR EACH ROW EXECUTE FUNCTION public.trigger_cleaning_status_alert();

-- 6. Trigger: hóspede muda de status → status do imóvel + alerta de checkout
CREATE OR REPLACE FUNCTION public.trigger_guest_status_property()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE prop_name TEXT;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  SELECT name INTO prop_name FROM public.properties WHERE id = NEW.property_id;

  IF NEW.status = 'hospedado' THEN
    UPDATE public.properties SET status='ocupado', updated_at=NOW() WHERE id = NEW.property_id;
  ELSIF NEW.status = 'checkout' THEN
    UPDATE public.properties SET status='limpeza', updated_at=NOW() WHERE id = NEW.property_id;
    PERFORM public.create_alert(
      NEW.user_id,'checkout_today',
      '🚪 Checkout realizado',
      COALESCE(prop_name,'O imóvel') || ' — ' || NEW.name || ' fez checkout. Agende a limpeza!',
      'high', NEW.property_id, NULL, NEW.id,
      '/limpezas','Agendar limpeza'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_guest_status_change
  AFTER UPDATE OF status ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.trigger_guest_status_property();
