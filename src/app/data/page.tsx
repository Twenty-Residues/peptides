import type { Metadata } from "next";
import Link from "next/link";
import {
  citation,
  claimRows,
  DATASET_LICENSE,
  datasetVersion,
  FILES,
  newsRows,
  peptideRows,
} from "@/lib/dataset";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Open data",
  description:
    "Every claim, tier, and source on Peptides.info as a downloadable, versioned, CC BY dataset.",
  alternates: { canonical: "/data" },
};

export default function DataPage() {
  const version = datasetVersion();
  const claims = claimRows();
  const monographs = peptideRows();
  const stories = newsRows();
  const cite = citation();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${site.name} evidence dataset`,
    description: metadata.description,
    url: `${site.url}/data`,
    version,
    license: DATASET_LICENSE.url,
    creator: { "@type": "Organization", name: site.org, url: site.url },
    isAccessibleForFree: true,
    keywords: ["peptides", "evidence", "clinical trials", "regulatory status", "citations"],
    variableMeasured: ["Evidence tier (1–4) per claim", "Regulatory status", "Source record"],
    distribution: FILES.map((f) => ({
      "@type": "DataDownload",
      contentUrl: `${site.url}/data/${f.path}`,
      encodingFormat: f.path.endsWith(".csv") ? "text/csv" : "application/json",
    })),
  };

  const tierCounts = [1, 2, 3, 4].map(
    (t) => claims.filter((c) => c.kind === "efficacy" && c.tier === t).length,
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
        Open data · version {version}
      </p>
      <h1 className="mt-3 text-4xl font-medium text-plum">
        Everything we assert, as rows you can reuse.
      </h1>
      <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink/80">
        The site is built from a single record. This is that record: every
        claim with its tier and the fixed source behind it, every monograph,
        every story with its graded sources. Same data the pages render from,
        so it cannot disagree with what you read here.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {[
          ["Monographs", String(monographs.length)],
          ["Claims", String(claims.length)],
          ["Stories", String(stories.length)],
          ["License", DATASET_LICENSE.name],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface px-4 py-3">
            <dt className="text-[11px] font-medium tracking-wide text-muted uppercase">{k}</dt>
            <dd className="mt-0.5 font-serif text-lg text-plum">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
          Files
        </h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {FILES.map((f) => (
            <li key={f.path} className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4">
              <div>
                <a
                  href={`/data/${f.path}`}
                  className="font-mono text-sm font-semibold text-plum-500 underline-offset-4 hover:underline"
                >
                  /data/{f.path}
                </a>
                <p className="mt-1 max-w-prose text-sm text-ink/75">{f.what}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Each JSON file carries a header with the version, license, and
          citation line, then a <code className="rounded bg-plum-050 px-1 font-mono text-plum">data</code> array.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
          Claims by tier
        </h2>
        <ul className="mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {tierCounts.map((n, i) => (
            <li key={i} className="bg-surface px-4 py-3 text-center">
              <p className="font-mono text-xs text-muted">T{i + 1}</p>
              <p className="font-serif text-xl text-plum">{n}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-prose text-sm text-ink/75">
          Efficacy claims only; regulatory facts are counted separately. The
          tiers are defined in{" "}
          <Link href="/methodology" className="font-medium text-plum-500 underline-offset-4 hover:underline">
            the Standard
          </Link>
          .
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
          How to cite
        </h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-plum px-5 py-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-surface">
          {cite}
        </pre>
        <p className="mt-3 max-w-prose text-sm text-ink/75">
          Licensed{" "}
          <a href={DATASET_LICENSE.url} className="font-medium text-plum-500 underline-offset-4 hover:underline">
            {DATASET_LICENSE.name}
          </a>
          : reuse, remix, and redistribute, with attribution. The version is
          the newest date anywhere in the record; cite the version you used.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
          What the data is not
        </h2>
        <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5 text-ink/80">
          <li>Not a verdict on any peptide. A tier describes how a claim is supported, not whether the peptide works.</li>
          <li>Not dosing, protocols, or medical advice. Those fields do not exist.</li>
          <li>Not complete. The catalog covers {monographs.length} peptides and grows as the evidence earns it. Corrections go through the same path as everything else: <a href="mailto:corrections@peptides.info" className="font-medium text-plum-500 underline-offset-4 hover:underline">corrections@peptides.info</a>.</li>
        </ul>
      </section>
    </main>
  );
}
