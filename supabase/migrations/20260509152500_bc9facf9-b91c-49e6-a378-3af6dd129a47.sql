
CREATE TABLE public.demo_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text NOT NULL,
  source text DEFAULT 'landing_demo',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert demo lead"
  ON public.demo_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read demo leads"
  ON public.demo_leads FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_demo_leads_created_at ON public.demo_leads(created_at DESC);
