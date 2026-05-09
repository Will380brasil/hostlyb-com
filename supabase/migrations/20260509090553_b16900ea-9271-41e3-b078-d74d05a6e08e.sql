
-- 1) Add access_token to cleaning_jobs
ALTER TABLE public.cleaning_jobs
  ADD COLUMN IF NOT EXISTS access_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS cleaning_jobs_access_token_idx
  ON public.cleaning_jobs(access_token);

-- 2) RPC: fetch job by token (joins property + cleaner basic info)
CREATE OR REPLACE FUNCTION public.cleaner_get_job(p_token UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', j.id,
    'status', j.status,
    'scheduled_date', j.scheduled_date,
    'scheduled_time', j.scheduled_time,
    'checklist', j.checklist,
    'photos', j.photos,
    'notes', j.notes,
    'has_forgotten_items', j.has_forgotten_items,
    'property', jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'address', p.address,
      'city', p.city,
      'wifi_password', p.wifi_password,
      'bedrooms', p.bedrooms,
      'bathrooms', p.bathrooms
    ),
    'cleaner', CASE WHEN c.id IS NOT NULL THEN jsonb_build_object(
      'id', c.id, 'name', c.name, 'photo_url', c.photo_url
    ) ELSE NULL END,
    'forgotten_items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', fi.id, 'description', fi.description, 'photo_url', fi.photo_url, 'status', fi.status, 'notes', fi.notes
      ) ORDER BY fi.created_at DESC)
      FROM public.forgotten_items fi
      WHERE fi.cleaning_job_id = j.id
    ), '[]'::jsonb)
  )
  INTO result
  FROM public.cleaning_jobs j
  JOIN public.properties p ON p.id = j.property_id
  LEFT JOIN public.cleaners c ON c.id = j.cleaner_id
  WHERE j.access_token = p_token;

  IF result IS NULL THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  RETURN result;
END;
$$;

-- 3) RPC: update job (checklist / notes / status / photos)
CREATE OR REPLACE FUNCTION public.cleaner_update_job(
  p_token UUID,
  p_checklist jsonb DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_photos jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_id UUID;
BEGIN
  SELECT id INTO job_id FROM public.cleaning_jobs WHERE access_token = p_token;
  IF job_id IS NULL THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('agendado','em_andamento','concluido','problema','cancelado') THEN
    RAISE EXCEPTION 'invalid_status' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.cleaning_jobs
  SET checklist    = COALESCE(p_checklist, checklist),
      notes        = COALESCE(p_notes, notes),
      status       = COALESCE(p_status, status),
      photos       = COALESCE(p_photos, photos),
      completed_at = CASE WHEN p_status = 'concluido' THEN NOW() ELSE completed_at END,
      updated_at   = NOW()
  WHERE id = job_id;

  RETURN public.cleaner_get_job(p_token);
END;
$$;

-- 4) RPC: add forgotten item by token
CREATE OR REPLACE FUNCTION public.cleaner_add_forgotten_item(
  p_token UUID,
  p_description text,
  p_photo_url text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_id UUID;
BEGIN
  SELECT id, user_id, property_id INTO v_job
  FROM public.cleaning_jobs WHERE access_token = p_token;
  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.forgotten_items (user_id, property_id, cleaning_job_id, description, photo_url, notes)
  VALUES (v_job.user_id, v_job.property_id, v_job.id, p_description, p_photo_url, p_notes)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- 5) Grant execute to anon + authenticated (token-protected)
GRANT EXECUTE ON FUNCTION public.cleaner_get_job(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleaner_update_job(UUID, jsonb, text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleaner_add_forgotten_item(UUID, text, text, text) TO anon, authenticated;
