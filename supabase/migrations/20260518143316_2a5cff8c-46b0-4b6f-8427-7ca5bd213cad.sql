-- 1) Storage: drop overly broad anonymous INSERT policies on cleaning-photos / forgotten-items.
-- Token-scoped policies ("Cleaner token upload *") remain and continue to authorize legitimate uploads.
DROP POLICY IF EXISTS "Anon insert cleaning-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon insert forgotten-items" ON storage.objects;

-- 2) organization_invites: SELECT was visible to every org member, exposing tokens.
-- Restrict to owner/admin only (matching INSERT/DELETE policies).
DROP POLICY IF EXISTS "invites select team" ON public.organization_invites;
DROP POLICY IF EXISTS "invites select admin" ON public.organization_invites;

CREATE POLICY "invites select admin"
ON public.organization_invites
FOR SELECT
USING (
  public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::org_role, 'admin'::org_role])
);