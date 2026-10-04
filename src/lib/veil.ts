import { cookies } from "next/headers";
import { registerIsPublic } from "./register-flag";

export { registerIsPublic };

/**
 * The company register ships behind a "coming soon" veil until it is ready.
 *
 *   REGISTER_LIVE=true          everyone sees it (sitemap, search, footer too)
 *   REGISTER_PREVIEW_KEY=<key>  visiting /companies/preview?key=<key> sets a
 *                               cookie that lifts the veil for that browser
 *
 * Neither set: everyone sees the veil. The data is still built and checked
 * in CI either way, so the launch is a flag flip, not a merge.
 */
export const REGISTER_COOKIE = "register-preview";

/** Server-only: public flag, or a valid preview cookie. */
export async function registerIsVisible(): Promise<boolean> {
  if (registerIsPublic()) return true;
  const key = process.env.REGISTER_PREVIEW_KEY;
  if (!key) return false;
  const jar = await cookies();
  return jar.get(REGISTER_COOKIE)?.value === key;
}
