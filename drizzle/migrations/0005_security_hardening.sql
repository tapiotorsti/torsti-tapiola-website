-- 1. Stop auto-granting admin to new sign-ups (an admin already exists)

DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;

DROP FUNCTION IF EXISTS public.assign_first_admin();

-- 2. has_role is SECURITY DEFINER; don't let anonymous users call it

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3. Only allow https links in project URLs

ALTER TABLE public.projects

  ADD CONSTRAINT projects_live_url_https CHECK (live_url IS NULL OR live_url ~* '^https://'),

  ADD CONSTRAINT projects_github_url_https CHECK (github_url IS NULL OR github_url ~* '^https://');