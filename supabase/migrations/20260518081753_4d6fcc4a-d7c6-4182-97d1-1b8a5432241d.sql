-- Remove overly permissive anon upload policies; keep token-scoped policies
DROP POLICY IF EXISTS "Anon insert cleaning-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon insert forgotten-items" ON storage.objects;

-- Restrict invite token visibility to owners/admins only
DROP POLICY IF EXISTS "invites select team" ON public.organization_invites;
CREATE POLICY "invites select admin"
ON public.organization_invites
FOR SELECT
USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner'::org_role, 'admin'::org_role]));