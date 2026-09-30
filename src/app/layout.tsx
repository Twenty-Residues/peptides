import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

const siteUrl = "https://peptides.info";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Peptides.info — every peptide, graded by how well it's proven",
    template: "%s · Peptides.info",
  },
  description:
    "Plain-language monographs on research peptides. Every claim carries an evidence tier and a citation to a fixed record. We sell nothing.",
  openGraph: {
    title: "Peptides.info",
    description:
      "A research-grade reference for peptides: mechanisms, evidence, and provenance.",
    url: siteUrl,
    siteName: "Peptides.info",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#2f1e4e",
  colorScheme: "light",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Peptides.info",
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  description:
    "A research-grade reference for peptides: mechanisms, evidence, and provenance — cited and tiered.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Header />
        <div id="main" className="flex-1">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
