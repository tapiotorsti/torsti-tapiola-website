// Privacy-preserving rate-limit keys for the site assistant.
// The visitor's IP is never stored: the database only sees an HMAC of
// "IP | current hour" keyed with a server secret, so the value cannot be
// reversed to an IP and cannot be linked across hours.

/** Best-effort client IP from proxy headers (Cloudflare first). */
export function clientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** 64-char hex HMAC-SHA256 of `${ip}|${hour}` (hour in UTC, e.g. 2026-11-12T09). */
export async function rateLimitBucket(
  ip: string,
  secret: string,
  now = new Date(),
): Promise<string> {
  const hour = now.toISOString().slice(0, 13);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${ip}|${hour}`));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
