import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = "https://peptides.info";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Peptides.info — the reference for research peptides",
    template: "%s · Peptides.info",
  },
  description:
    "A research-grade reference for peptides: mechanisms, evidence, and provenance — written plainly, cited carefully.",
  openGraph: {
    title: "Peptides.info",
    description:
      "A research-grade reference for peptides: mechanisms, evidence, and provenance.",
    url: siteUrl,
    siteName: "Peptides.info",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
