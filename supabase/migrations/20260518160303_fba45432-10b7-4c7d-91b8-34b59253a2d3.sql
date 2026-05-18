ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ical_export_token uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS profiles_ical_export_token_idx ON public.profiles(ical_export_token);

CREATE OR REPLACE FUNCTION public.get_ical_export(p_token uuid)
RETURNS TABLE(
  user_display_name text,
  guest_name text,
  property_name text,
  platform text,
  checkin_date date,
  checkout_date date,
  guest_id uuid
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE ical_export_token = p_token;
  IF v_uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
    SELECT
      (SELECT display_name FROM public.profiles WHERE id = v_uid),
      g.name, p.name, g.platform, g.checkin_date, g.checkout_date, g.id
    FROM public.guests g
    JOIN public.properties p ON p.id = g.property_id
    WHERE g.user_id = v_uid
      AND g.checkout_date >= (CURRENT_DATE - INTERVAL '30 days');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ical_export(uuid) TO anon, authenticated;