-- ENUM de papel
DO $$ BEGIN
  CREATE TYPE public.org_role AS ENUM ('owner','admin','staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  max_members INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- MEMBERS
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.org_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);

-- INVITES
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.org_role NOT NULL DEFAULT 'staff',
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.organization_invites(organization_id);

-- helper: is member
CREATE OR REPLACE FUNCTION public.is_org_member(_org UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id=_org AND user_id=_user);
$$;

-- helper: has role
CREATE OR REPLACE FUNCTION public.has_org_role(_org UUID, _user UUID, _roles public.org_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id=_org AND user_id=_user AND role = ANY(_roles)
  );
$$;

-- RLS organizations
DROP POLICY IF EXISTS "org select members" ON public.organizations;
CREATE POLICY "org select members" ON public.organizations FOR SELECT
USING (public.is_org_member(id, auth.uid()));

DROP POLICY IF EXISTS "org update owner/admin" ON public.organizations;
CREATE POLICY "org update owner/admin" ON public.organizations FOR UPDATE
USING (public.has_org_role(id, auth.uid(), ARRAY['owner','admin']::public.org_role[]));

DROP POLICY IF EXISTS "org insert self" ON public.organizations;
CREATE POLICY "org insert self" ON public.organizations FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- RLS members
DROP POLICY IF EXISTS "members select team" ON public.organization_members;
CREATE POLICY "members select team" ON public.organization_members FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

DROP POLICY IF EXISTS "members insert admin" ON public.organization_members;
CREATE POLICY "members insert admin" ON public.organization_members FOR INSERT
WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[]));

DROP POLICY IF EXISTS "members delete admin" ON public.organization_members;
CREATE POLICY "members delete admin" ON public.organization_members FOR DELETE
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[]));

-- RLS invites
DROP POLICY IF EXISTS "invites select team" ON public.organization_invites;
CREATE POLICY "invites select team" ON public.organization_invites FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

DROP POLICY IF EXISTS "invites insert admin" ON public.organization_invites;
CREATE POLICY "invites insert admin" ON public.organization_invites FOR INSERT
WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[])
  AND auth.uid() = invited_by);

DROP POLICY IF EXISTS "invites delete admin" ON public.organization_invites;
CREATE POLICY "invites delete admin" ON public.organization_invites FOR DELETE
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[]));

-- Public RPC: get invite by token (anon allowed)
CREATE OR REPLACE FUNCTION public.get_invite_by_token(p_token UUID)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', i.id, 'email', i.email, 'role', i.role,
    'organization_id', i.organization_id, 'organization_name', o.name,
    'expires_at', i.expires_at, 'accepted_at', i.accepted_at
  ) INTO r
  FROM public.organization_invites i
  JOIN public.organizations o ON o.id = i.organization_id
  WHERE i.token = p_token;
  RETURN r;
END; $$;

-- Public RPC: accept invite (must be authenticated)
CREATE OR REPLACE FUNCTION public.accept_invite(p_token UUID)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_invite RECORD;
  v_count INT;
  v_max INT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT * INTO v_invite FROM public.organization_invites WHERE token = p_token;
  IF v_invite.id IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;
  IF v_invite.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'already_accepted'; END IF;
  IF v_invite.expires_at < now() THEN RAISE EXCEPTION 'expired'; END IF;

  SELECT max_members INTO v_max FROM public.organizations WHERE id = v_invite.organization_id;
  SELECT COUNT(*) INTO v_count FROM public.organization_members WHERE organization_id = v_invite.organization_id;
  IF v_count >= v_max THEN RAISE EXCEPTION 'org_full'; END IF;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_invite.organization_id, auth.uid(), v_invite.role)
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  UPDATE public.organization_invites SET accepted_at = now() WHERE id = v_invite.id;

  RETURN jsonb_build_object('organization_id', v_invite.organization_id);
END; $$;

GRANT EXECUTE ON FUNCTION public.get_invite_by_token(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invite(UUID) TO authenticated;

-- Auto-create org on signup (extend existing handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_org UUID;
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  -- Only create an org if user isn't already a member of one (e.g. invite flow)
  IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = NEW.id) THEN
    INSERT INTO public.organizations (name, owner_id)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)) || '''s workspace', NEW.id)
    RETURNING id INTO v_org;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END; $$;

-- Backfill: create org for existing users without one
DO $$
DECLARE u RECORD; v_org UUID;
BEGIN
  FOR u IN SELECT p.id, p.email, p.display_name FROM public.profiles p
           WHERE NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.user_id = p.id)
  LOOP
    INSERT INTO public.organizations (name, owner_id)
    VALUES (COALESCE(u.display_name, split_part(u.email,'@',1)) || '''s workspace', u.id)
    RETURNING id INTO v_org;
    INSERT INTO public.organization_members (organization_id, user_id, role) VALUES (v_org, u.id, 'owner');
  END LOOP;
END $$;

-- updated_at trigger on organizations
DROP TRIGGER IF EXISTS trg_org_updated ON public.organizations;
CREATE TRIGGER trg_org_updated BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();