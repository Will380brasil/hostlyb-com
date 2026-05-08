
-- =============== PROFILES ===============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============== PROPERTIES ===============
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'livre',
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  max_guests INT DEFAULT 2,
  wifi_password TEXT,
  notes TEXT,
  income_monthly NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties select own" ON public.properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Properties insert own" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Properties update own" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Properties delete own" ON public.properties FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_properties_user ON public.properties(user_id);

-- =============== CLEANERS ===============
CREATE TABLE public.cleaners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  pix_key TEXT,
  price_per_cleaning NUMERIC DEFAULT 0,
  notes TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_cleanings INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cleaners select own" ON public.cleaners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Cleaners insert own" ON public.cleaners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cleaners update own" ON public.cleaners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Cleaners delete own" ON public.cleaners FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_cleaners_updated BEFORE UPDATE ON public.cleaners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cleaners_user ON public.cleaners(user_id);

-- =============== PROPERTY <-> CLEANER LINK ===============
CREATE TABLE public.property_cleaners (
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  cleaner_id UUID NOT NULL REFERENCES public.cleaners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (property_id, cleaner_id)
);
ALTER TABLE public.property_cleaners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PC select own" ON public.property_cleaners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "PC insert own" ON public.property_cleaners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "PC delete own" ON public.property_cleaners FOR DELETE USING (auth.uid() = user_id);

-- =============== CLEANING JOBS ===============
CREATE TABLE public.cleaning_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  cleaner_id UUID REFERENCES public.cleaners(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL DEFAULT '10:00',
  status TEXT NOT NULL DEFAULT 'agendado',
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pendente',
  payment_amount NUMERIC DEFAULT 0,
  completed_at TIMESTAMPTZ,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  has_forgotten_items BOOLEAN NOT NULL DEFAULT false,
  admin_email_sent BOOLEAN NOT NULL DEFAULT false,
  calendar_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cleaning_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CJ select own" ON public.cleaning_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CJ insert own" ON public.cleaning_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "CJ update own" ON public.cleaning_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "CJ delete own" ON public.cleaning_jobs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_cj_updated BEFORE UPDATE ON public.cleaning_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cj_user_date ON public.cleaning_jobs(user_id, scheduled_date);

-- =============== GUESTS ===============
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado',
  nights INT,
  total_value NUMERIC DEFAULT 0,
  platform TEXT NOT NULL DEFAULT 'airbnb',
  rating NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests select own" ON public.guests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Guests insert own" ON public.guests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Guests update own" ON public.guests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Guests delete own" ON public.guests FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_guests_updated BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_guests_user_dates ON public.guests(user_id, checkin_date, checkout_date);

-- =============== CALENDAR EVENTS ===============
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  color TEXT,
  related_id UUID,
  google_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CE select own" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CE insert own" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "CE update own" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "CE delete own" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_ce_user_date ON public.calendar_events(user_id, start_date);

-- =============== FORGOTTEN ITEMS ===============
CREATE TABLE public.forgotten_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cleaning_job_id UUID NOT NULL REFERENCES public.cleaning_jobs(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'encontrado',
  found_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forgotten_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FI select own" ON public.forgotten_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "FI insert own" ON public.forgotten_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "FI update own" ON public.forgotten_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "FI delete own" ON public.forgotten_items FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_fi_updated BEFORE UPDATE ON public.forgotten_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: marcar cleaning_jobs.has_forgotten_items quando há itens não devolvidos/descartados
CREATE OR REPLACE FUNCTION public.refresh_has_forgotten_items()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE jid UUID;
BEGIN
  jid := COALESCE(NEW.cleaning_job_id, OLD.cleaning_job_id);
  UPDATE public.cleaning_jobs SET has_forgotten_items = EXISTS (
    SELECT 1 FROM public.forgotten_items
    WHERE cleaning_job_id = jid AND status NOT IN ('devolvido','descartado')
  ) WHERE id = jid;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_fi_refresh
AFTER INSERT OR UPDATE OR DELETE ON public.forgotten_items
FOR EACH ROW EXECUTE FUNCTION public.refresh_has_forgotten_items();

-- =============== STORAGE BUCKETS ===============
INSERT INTO storage.buckets (id, name, public) VALUES ('cleaning-photos', 'cleaning-photos', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('forgotten-items', 'forgotten-items', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('cleaner-avatars', 'cleaner-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Pasta = user_id/...
CREATE POLICY "cleaning-photos read own" ON storage.objects FOR SELECT
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cleaning-photos write own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cleaning-photos update own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cleaning-photos delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'cleaning-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "forgotten-items read own" ON storage.objects FOR SELECT
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "forgotten-items write own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "forgotten-items update own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "forgotten-items delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'forgotten-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "cleaner-avatars public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'cleaner-avatars');
CREATE POLICY "cleaner-avatars write own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cleaner-avatars update own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "cleaner-avatars delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'cleaner-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
