-- Lock down trigger functions (run automatically; never need direct exec)
REVOKE EXECUTE ON FUNCTION public.refresh_has_forgotten_items() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_cleaning_status_alert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_forgotten_item_alert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_forgotten_item_resolved_alert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_guest_status_property() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Internal helper called only from triggers
REVOKE EXECUTE ON FUNCTION public.create_alert(uuid, text, text, text, text, uuid, uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;

-- RLS helpers: keep authenticated only
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, org_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.org_has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, org_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_has_active_subscription(uuid, text) TO authenticated;

-- accept_invite: only signed-in users
REVOKE EXECUTE ON FUNCTION public.accept_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invite(uuid) TO authenticated;