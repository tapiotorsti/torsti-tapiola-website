-- Per-visitor rate limit for the site assistant (src/lib/chat).
-- Stores only an HMAC of the visitor's IP address, computed on the server with
-- a secret key, plus an hourly counter. Rows older than two hours are deleted.
-- No conversation content is stored anywhere.

CREATE TABLE public.chat_rate_limits (
  bucket text NOT NULL CHECK (bucket ~ '^[a-f0-9]{64}$'),
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0 CHECK (hits >= 0),
  PRIMARY KEY (bucket, window_start)
);

-- Nobody reads or writes the table directly; only the function below touches it.
-- Supabase grants new tables to anon/authenticated by default, so revoke first.
REVOKE ALL ON public.chat_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.chat_rate_limits TO service_role;
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Counts one assistant request for the bucket in the current hour and returns
-- whether it is within the limit (20 per hour). Malformed buckets are refused.
CREATE OR REPLACE FUNCTION public.chat_rate_limit_hit(_bucket text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window timestamptz := date_trunc('hour', now());
  _hits integer;
BEGIN
  IF _bucket IS NULL OR _bucket !~ '^[a-f0-9]{64}$' THEN
    RETURN false;
  END IF;

  DELETE FROM public.chat_rate_limits WHERE window_start < now() - interval '2 hours';

  INSERT INTO public.chat_rate_limits AS r (bucket, window_start, hits)
  VALUES (_bucket, _window, 1)
  ON CONFLICT (bucket, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO _hits;

  RETURN _hits <= 20;
END
$$;

REVOKE EXECUTE ON FUNCTION public.chat_rate_limit_hit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.chat_rate_limit_hit(text) TO anon, authenticated, service_role;