import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cardData, snapshot, type Source } from "@/lib/peptides";
import { comparisons, getComparison, pairOf } from "@/lib/comparisons";
import { TierBadge } from "@/lib/evidence";
import { editorial, site } from "@/lib/site";
import { PeptideCard } from "@/components/PeptideCard";

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return {};
  const [a, b] = pairOf(c);
  const title = `${a.name} vs ${b.name}`;
  return {
    title,
    description: c.summary,
    alternates: { canonical: `/compare/${c.slug}` },
    openGraph: { title: `${title} · ${site.name}`, description: c.summary },
  };
}

const REG_LABEL: Record<string, string> = {
  approved: "Approved",
  "approved-abroad": "Approved abroad",
  "research-only": "Research-only",
  withdrawn: "Withdrawn",
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();
  const [a, b] = pairOf(c);
  const sa = snapshot(a);
  const sb = snapshot(b);
  const title = `${a.name} vs ${b.name}`;

  const refs: Source[] = [];
  const seen = new Set<string>();
  for (const d of c.differences) {
    if (d.source && !seen.has(d.source.href)) {
      seen.add(d.source.href);
      refs.push(d.source);
    }
  }
  const refIndex = (href: string) => refs.findIndex((r) => r.href === href) + 1;

  const url = `${site.url}/compare/${c.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: title,
      url,
      description: c.summary,
      lastReviewed: c.updated,
      dateModified: c.updated,
      author: { "@type": "Organization", name: editorial.writtenBy },
      about: [a, b].map((p) => ({
        "@type": "Drug",
        name: p.name,
        url: `${site.url}/peptides/${p.slug}`,
      })),
      citation: refs.map((r) => ({
        "@type": "CreativeWork",
        name: r.label,
        url: r.href,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "Compare",
          item: `${site.url}/compare`,
        },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    },
    ...(c.faqs && c.faqs.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  const stat = (label: string, va: string, vb: string) => (
    <tr key={label} className="align-top">
      <th
        scope="row"
        className="py-3 pr-4 pl-5 text-left text-[11px] font-medium tracking-wide text-muted uppercase"
      >
        {label}
      </th>
      <td className="py-3 pr-4 font-serif text-lg text-plum">{va}</td>
      <td className="py-3 pr-5 font-serif text-lg text-plum">{vb}</td>
    </tr>
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-plum hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/compare" className="hover:text-plum hover:underline">
              Compare
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <p className="mt-8 text-xs font-medium tracking-wide text-plum-500 uppercase">
        Head to head
      </p>
      <h1 className="mt-2 text-4xl font-medium text-plum sm:text-5xl">
        <Link
          href={`/peptides/${a.slug}`}
          className="underline-offset-8 hover:underline"
        >
          {a.name}
        </Link>{" "}
        <span className="font-sans text-2xl text-muted sm:text-3xl">vs</span>{" "}
        <Link
          href={`/peptides/${b.slug}`}
          className="underline-offset-8 hover:underline"
        >
          {b.name}
        </Link>
      </h1>
      <p className="mt-6 max-w-prose font-serif text-2xl leading-snug font-medium text-plum">
        {c.hook}
      </p>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink/85">
        {c.summary}
      </p>

      {/* Snapshot, derived from the two monographs */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-4 pl-5">
                <span className="sr-only">Measure</span>
              </th>
              {[a, b].map((p) => (
                <th
                  key={p.slug}
                  scope="col"
                  className="py-3 pr-4 font-serif text-base font-semibold text-plum"
                >
                  {p.name}
                  <span className="mt-0.5 block font-sans text-xs font-normal text-muted">
                    {p.class}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr className="align-top">
              <th
                scope="row"
                className="py-3 pr-4 pl-5 text-left text-[11px] font-medium tracking-wide text-muted uppercase"
              >
                Best evidence
              </th>
              {[sa, sb].map((s, i) => (
                <td key={i} className="py-3 pr-4">
                  {s.floor ? <TierBadge tier={s.floor} /> : "—"}
                </td>
              ))}
            </tr>
            {stat(
              "Human-tested claims",
              `${sa.humanClaims} of ${sa.totalClaims}`,
              `${sb.humanClaims} of ${sb.totalClaims}`,
            )}
            {stat(
              "Status",
              a.regulatory ? REG_LABEL[a.regulatory.status] : "—",
              b.regulatory ? REG_LABEL[b.regulatory.status] : "—",
            )}
            {stat(
              "Cited sources",
              String(sa.references),
              String(sb.references),
            )}
          </tbody>
        </table>
      </div>

      {/* Verdict */}
      <section className="mt-14">
        <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
          Where the evidence lands
        </h2>
        <p className="mt-5 max-w-prose leading-relaxed text-ink/85">
          {c.verdict}
        </p>
      </section>

      {/* Differences */}
      <section className="mt-14">
        <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
          Where they differ
        </h2>
        <p className="mt-3 max-w-prose text-sm text-muted">
          Each row cites a fixed record. Numbers from different trials are not
          directly comparable, and the rows say so where that applies.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[11px] font-medium tracking-wide text-muted uppercase">
                <th scope="col" className="py-3 pr-4 pl-5">
                  Aspect
                </th>
                <th scope="col" className="py-3 pr-4">
                  {a.name}
                </th>
                <th scope="col" className="py-3 pr-5">
                  {b.name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {c.differences.map((d) => (
                <tr key={d.aspect} className="align-top">
                  <th
                    scope="row"
                    className="min-w-[8rem] py-4 pr-4 pl-5 text-left font-serif text-base font-semibold text-plum"
                  >
                    {d.aspect}
                    {d.source && (
                      <a
                        href={`#ref-${refIndex(d.source.href)}`}
                        className="ml-1.5 font-mono text-xs font-normal text-muted hover:text-plum-500"
                        aria-label={`Reference ${refIndex(d.source.href)}`}
                      >
                        [{refIndex(d.source.href)}]
                      </a>
                    )}
                  </th>
                  <td className="min-w-[14rem] py-4 pr-4 text-sm leading-relaxed text-ink/85">
                    {d.a}
                  </td>
                  <td className="min-w-[14rem] py-4 pr-5 text-sm leading-relaxed text-ink/85">
                    {d.b}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Evidence, lifted from both monographs */}
      <section className="mt-14">
        <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
          What each is studied for
        </h2>
        <p className="mt-3 max-w-prose text-sm text-muted">
          The efficacy claims from each monograph, with their tiers. Follow the
          entry for sources and safety.
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {[a, b].map((p) => (
            <div key={p.slug}>
              <h3 className="font-serif text-lg font-semibold text-plum">
                <Link
                  href={`/peptides/${p.slug}#evidence`}
                  className="underline-offset-4 hover:underline"
                >
                  {p.name}
                </Link>
              </h3>
              <ul className="mt-3 space-y-3">
                {p.claims
                  .filter((cl) => cl.kind !== "regulatory")
                  .map((cl, i) => (
                    <li
                      key={i}
                      className="rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink/85 shadow-sm"
                    >
                      <div className="mb-2">
                        <TierBadge tier={cl.tier} />
                      </div>
                      {cl.text}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {c.faqs && c.faqs.length > 0 && (
        <section className="mt-14">
          <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
            Frequently asked
          </h2>
          <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface">
            {c.faqs.map((f, i) => (
              <details key={i} className="group px-5 py-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg font-medium text-plum">
                  {f.q}
                  <span
                    aria-hidden
                    className="shrink-0 text-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 max-w-prose leading-relaxed text-ink/85">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {refs.length > 0 && (
        <section className="mt-14">
          <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
            References
          </h2>
          <ol className="mt-5 space-y-2">
            {refs.map((r, i) => (
              <li
                key={r.href}
                id={`ref-${i + 1}`}
                className="flex gap-2 text-sm text-ink/75"
              >
                <span className="shrink-0 font-mono text-muted">[{i + 1}]</span>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-plum-500 underline underline-offset-4 hover:text-plum-600"
                >
                  {r.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-14">
        <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
          The monographs
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {[a, b].map((p) => (
            <li key={p.slug}>
              <PeptideCard p={cardData(p)} compact />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 border-t border-line pt-6 text-sm text-muted">
        <p>
          Written by {editorial.writtenBy}. Medical review:{" "}
          {editorial.reviewStatus}.
        </p>
        <p className="mt-1">Last updated {fmtDate(c.updated)}.</p>
        <p className="mt-3">
          Tiers are explained in{" "}
          <Link
            href="/methodology"
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            the Standard
          </Link>
          . Spot an error?{" "}
          <a
            href={`mailto:${editorial.contact}?subject=${encodeURIComponent(`Correction: ${title}`)}`}
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            Report a correction
          </a>
          .
        </p>
      </div>
    </main>
  );
}
