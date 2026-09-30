import type { Metadata } from "next";
import Link from "next/link";
import { peptides } from "@/lib/peptides";
import { CatalogExplorer } from "@/components/CatalogExplorer";

export const metadata: Metadata = {
  title: "Catalog",
  description: `${peptides.length} research peptides, each graded by how well its claims are proven and cited to a fixed record.`,
  alternates: { canonical: "/peptides" },
};

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", category = "" } = await searchParams;
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Peptides.info catalog",
    description:
      "A catalog of research peptides with claim-level, tiered, cited evidence (the Standard).",
    url: "https://peptides.info/peptides",
    creator: { "@type": "Organization", name: "Peptides.info" },
    license: "https://peptides.info/methodology",
    variableMeasured: "Evidence tier (1–4) per claim",
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <h1 className="text-4xl font-medium text-plum">Catalog</h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/75">
        {peptides.length} peptides, each with a one-line verdict and the
        evidence behind it. The badge shows the strongest tier any claim in the
        entry reaches, so an “Established” badge means at least one claim rests
        on an approval or a pivotal trial, not that everything does.{" "}
        <Link
          href="/methodology"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          How the tiers work
        </Link>
        .
      </p>

      <div className="mt-8">
        <CatalogExplorer
          key={`${q}|${category}`}
          peptides={peptides}
          initialQuery={q}
          initialCategory={category}
        />
      </div>
    </main>
  );
}
