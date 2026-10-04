import type { Metadata } from "next";
import { registerIsPublic } from "@/lib/register-flag";

/**
 * Only metadata lives here. The veil itself is checked inside each page,
 * because a layout that withholds its children still streams the page's
 * server payload to the client.
 */
export const metadata: Metadata = registerIsPublic()
  ? {}
  : { robots: { index: false, follow: false } };

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
