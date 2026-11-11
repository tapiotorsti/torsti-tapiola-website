// Security headers for every server-rendered response (applied in src/server.ts).
//
// Not applied in development or inside the Lovable editor preview: the editor
// frames the preview and injects its own scripts, which these headers would block.

// Lovable preview / staging domains (same list as src/integrations/supabase/previewAuthStorage.ts).
const PREVIEW_ZONES = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "lovable.app",
  "gpt-eng.com",
  "gptengineer.run",
];

export function isPreviewHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    PREVIEW_ZONES.some((zone) => hostname === zone || hostname.endsWith(`.${zone}`))
  );
}

function supabaseOrigin(): string | undefined {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

function contentSecurityPolicy(): string {
  const supabase = supabaseOrigin();
  const connect = ["'self'"];
  if (supabase) connect.push(supabase, supabase.replace(/^https:/, "wss:"));

  return [
    "default-src 'self'",
    // TanStack Start emits small inline scripts for hydration and scroll
    // restoration, so inline scripts must be allowed. External script hosts are not.
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    `connect-src ${connect.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function withSecurityHeaders(request: Request, response: Response): Response {
  if (import.meta.env.DEV) return response;

  let hostname: string;
  try {
    hostname = new URL(request.url).hostname;
  } catch {
    return response;
  }
  if (isPreviewHost(hostname)) return response;

  // Response headers can be immutable (e.g. from fetch), so copy before editing.
  const secured = new Response(response.body, response);
  const h = secured.headers;
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  h.set("Cross-Origin-Opener-Policy", "same-origin");

  const contentType = h.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    h.set("Content-Security-Policy", contentSecurityPolicy());
    h.set("X-Frame-Options", "DENY");
  }
  return secured;
}
