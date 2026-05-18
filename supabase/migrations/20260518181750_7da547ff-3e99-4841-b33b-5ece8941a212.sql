ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_selected_at timestamptz;

UPDATE public.profiles
SET onboarding_completed = true
WHERE created_at < now() - interval '1 minute'
  AND onboarding_completed = false;

INSERT INTO public.admin_users (user_id, email)
SELECT u.id, u.email
FROM auth.users u
WHERE lower(u.email) = 'brasgold1@gmail.com'
ON CONFLICT (user_id) DO NOTHING;