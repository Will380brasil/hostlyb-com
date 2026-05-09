-- Admin users table for managing platform administrators
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function (security definer) to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _user_id)
$$;

-- Only admins can read the admin_users table
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
CREATE POLICY "Admins can view admin list"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Seed brasgold1@gmail.com as the initial general admin
INSERT INTO public.admin_users (user_id, email)
VALUES ('0777aac9-ab01-4951-928f-963d9349c9c5', 'brasgold1@gmail.com')
ON CONFLICT (user_id) DO NOTHING;