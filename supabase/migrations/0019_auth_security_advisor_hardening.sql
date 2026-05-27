-- Migration 0019: Harden Security Advisor warnings
--
-- After SaaS onboarding (0018) the Security Advisor flags:
--  1. reset_organization_to_factory_defaults — SECURITY DEFINER without a
--     hardened search_path.
--  2. complete_self_signup — search_path only set to "public", not
--     "public, pg_temp".
--  3. Several RPCs still executable by PUBLIC/anon.
--
-- Fixes:
--  - Add pg_temp to all definer-function search paths.
--  - Revoke PUBLIC/anon execute from every RPC and re-grant only where
--    intentionally needed.

----------------------------------------------------------------------
-- 1. Hardened search_path on reset_organization_to_factory_defaults
--    (currently SECURITY DEFINER without any search_path — potential
--    security hazard).
----------------------------------------------------------------------
alter function public.reset_organization_to_factory_defaults(uuid, uuid, boolean)
  set search_path = public, pg_temp;

----------------------------------------------------------------------
-- 2. Upgrade complete_self_signup search_path to include pg_temp
--    (migration 0018 set search_path = public only).
----------------------------------------------------------------------
alter function public.complete_self_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text
) set search_path = public, pg_temp;

----------------------------------------------------------------------
-- 3. Revoke PUBLIC/anon execute from all relevant RPCs, then re-grant
--    to authenticated (or service_role / dashboard_user) where needed.
----------------------------------------------------------------------

-- 3a. complete_self_signup — new-owner bootstrap, needs authenticated
revoke execute on function public.complete_self_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.complete_self_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;

-- 3b. reset_organization_to_factory_defaults — destructive admin-only,
--     but the RPC itself validates owner/admin so authenticated is safe.
revoke execute on function public.reset_organization_to_factory_defaults(uuid, uuid, boolean)
  from public, anon;
grant execute on function public.reset_organization_to_factory_defaults(uuid, uuid, boolean)
  to authenticated;

-- 3c. current_organization_id — used by RLS policies, must stay
--     executable by authenticated.  (Migration 0010 already did this,
--     but we re-assert for clarity.)
revoke execute on function public.current_organization_id()
  from public, anon;
grant execute on function public.current_organization_id()
  to authenticated;

-- 3d. current_user_role — same as above
revoke execute on function public.current_user_role()
  from public, anon;
grant execute on function public.current_user_role()
  to authenticated;

----------------------------------------------------------------------
-- 4. Leaked-password protection is a Pro-plan Supabase Dashboard
--    setting (Authentication → Providers → Email → Password security).
--    Not configurable via migrations / free-tier.
--
--    To enable: Supabase Dashboard → Authentication → Providers →
--    Email → toggle "Enable leaked password protection" ON.
----------------------------------------------------------------------
