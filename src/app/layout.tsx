import type { Metadata } from "next";
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
  alternates: { canonical: "/" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Peptides.info",
  url: siteUrl,
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
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
