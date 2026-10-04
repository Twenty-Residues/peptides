import { NextResponse, type NextRequest } from "next/server";
import { REGISTER_COOKIE } from "@/lib/veil";

/** /companies/preview?key=… lifts the veil for this browser; ?key=off clears it. */
export function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const res = NextResponse.redirect(new URL("/companies", req.url));
  if (key === "off") {
    res.cookies.delete(REGISTER_COOKIE);
  } else if (
    process.env.REGISTER_PREVIEW_KEY &&
    key === process.env.REGISTER_PREVIEW_KEY
  ) {
    res.cookies.set(REGISTER_COOKIE, key, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
  return res;
}
