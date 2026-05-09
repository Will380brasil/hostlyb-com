
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS alerts_user_archived_idx
  ON public.alerts (user_id, archived_at, created_at DESC);
