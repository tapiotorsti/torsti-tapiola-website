-- Remove inherited privileges so courses access matches the intended migration grants.
REVOKE ALL ON public.courses FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
