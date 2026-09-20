import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
