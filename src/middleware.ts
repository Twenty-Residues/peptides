import { NextResponse, type NextRequest } from "next/server";

/**
 * Site-wide pause gate.
 *
 * The site owner has paused further development pending a legal consult. While
 * paused, every page request is answered with a self-contained "coming soon"
 * page and an HTTP 503 (Service Unavailable) so search engines treat the
 * outage as temporary rather than de-indexing the site.
 *
 *   SITE_PAUSED unset or "true"   → paused (the default): everyone sees the veil
 *   SITE_PAUSED="false"           → live: the gate lifts, the real site serves
 *   SITE_PREVIEW_KEY=<key>        → visiting /?preview=<key> sets a cookie that
 *                                   lifts the veil for that browser only
 *
 * Defaulting to paused means the pause is a deploy, not a flag flip — shipping
 * this takes the public site dark until the consult clears it.
 */
const PREVIEW_COOKIE = "site-preview";

function isPaused(): boolean {
  return process.env.SITE_PAUSED !== "false";
}

export function middleware(req: NextRequest): NextResponse {
  if (!isPaused()) return NextResponse.next();

  const key = process.env.SITE_PREVIEW_KEY;

  // Let the owner mint a preview cookie with ?preview=<key>.
  if (key) {
    const supplied = req.nextUrl.searchParams.get("preview");
    if (supplied === key) {
      const url = req.nextUrl.clone();
      url.searchParams.delete("preview");
      const res = NextResponse.redirect(url);
      res.cookies.set(PREVIEW_COOKIE, key, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return res;
    }
    if (req.cookies.get(PREVIEW_COOKIE)?.value === key) {
      return NextResponse.next();
    }
  }

  return new NextResponse(COMING_SOON_HTML, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "86400",
    },
  });
}

/**
 * Run on every request except Next's internals and static assets, so the
 * favicon, icons and fonts still resolve and the page renders cleanly.
 */
export const config = {
  matcher: ["/((?!_next/|favicon\\.ico|icon\\.svg|.*\\.(?:png|jpg|svg|ico)).*)"],
};

const COMING_SOON_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Coming soon · Peptides.info</title>
<style>
  :root {
    --surface: #ffffff;
    --bg: #f6f4fa;
    --plum: #2f1e4e;
    --plum-500: #5e3a72;
    --ink: #33303a;
    --muted: #6b6577;
    --line: #e7e3ee;
    --gold: #ffc107;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 24px;
  }
  main {
    max-width: 34rem;
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 48px 40px;
    text-align: center;
    box-shadow: 0 1px 2px rgba(47, 30, 78, 0.04);
  }
  .mark {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    font-weight: 600;
    color: var(--plum);
    font-size: 1.05rem;
  }
  .dot {
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.18);
  }
  .eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--plum-500);
    margin: 0;
  }
  h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-weight: 500;
    font-size: 2rem;
    line-height: 1.15;
    color: var(--plum);
    margin: 18px 0 0;
  }
  p {
    font-size: 1.02rem;
    line-height: 1.6;
    color: var(--ink);
    opacity: 0.85;
    margin: 20px auto 0;
  }
  .note {
    font-size: 0.85rem;
    color: var(--muted);
    margin-top: 28px;
  }
  @media (max-width: 480px) {
    main { padding: 36px 24px; }
    h1 { font-size: 1.6rem; }
  }
</style>
</head>
<body>
<main>
  <div class="mark"><span class="dot" aria-hidden="true"></span>Peptides.info</div>
  <p class="eyebrow">Coming soon</p>
  <h1>We&rsquo;ll be back shortly.</h1>
  <p>
    The site is paused while we complete a review. Thanks for your patience &mdash;
    please check back soon.
  </p>
  <p class="note">&copy; Twenty Residues</p>
</main>
</body>
</html>`;
