
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'pt',
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_notes_admin_all ON public.admin_notes;
CREATE POLICY admin_notes_admin_all ON public.admin_notes
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX IF NOT EXISTS admin_notes_user_idx ON public.admin_notes(user_id, created_at DESC);

-- Audience log to make automated-email dedup easy (cron uses this).
CREATE TABLE IF NOT EXISTS public.email_audience_log (
  id BIGSERIAL PRIMARY KEY,
  template_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_name, user_id)
);
ALTER TABLE public.email_audience_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS email_audience_log_admin_read ON public.email_audience_log;
CREATE POLICY email_audience_log_admin_read ON public.email_audience_log
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
