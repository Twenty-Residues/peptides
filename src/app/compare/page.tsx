import type { Metadata } from "next";
import Link from "next/link";
import { peptides } from "@/lib/peptides";
import { site } from "@/lib/site";
import { compareGroups, type CompareRow } from "@/lib/compare";
import { comparisons, pairOf } from "@/lib/comparisons";
import { TIERS, TierBadge } from "@/lib/evidence";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Every peptide in the catalog on one page, side by side: strongest evidence tier, human-tested claims, regulatory status, and the single best-supported finding for each.",
  alternates: { canonical: "/compare" },
};

const REG_SHORT: Record<string, string> = {
  approved: "FDA-approved",
  "approved-abroad": "Approved abroad",
  "research-only": "Research-only",
  withdrawn: "Withdrawn",
};

const cell = "py-4 pr-4 group-hover:bg-plum-050/60";

function Row({ r }: { r: CompareRow }) {
  return (
    <tr className="group align-top">
      <th
        scope="row"
        className={`sticky left-0 z-10 bg-surface pl-5 text-left font-normal ${cell}`}
      >
        <Link
          href={`/peptides/${r.slug}`}
          className="font-serif text-base font-semibold text-plum underline-offset-4 hover:text-plum-500 hover:underline"
        >
          {r.name}
        </Link>
        <span className="mt-0.5 block text-xs text-muted">{r.class}</span>
      </th>
      <td className={cell}>
        {r.floor ? (
          <TierBadge tier={r.floor} />
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className={`${cell} text-sm whitespace-nowrap text-ink/80`}>
        {r.humanClaims > 0 ? (
          <>
            <span className="font-medium text-ink">{r.humanClaims}</span> of{" "}
            {r.totalClaims}
          </>
        ) : (
          <span className="text-muted">None yet</span>
        )}
      </td>
      <td className={`${cell} text-sm whitespace-nowrap text-ink/80`}>
        {r.regulatory ? REG_SHORT[r.regulatory] : "—"}
      </td>
      <td
        className={`${cell} min-w-[22rem] pr-5 text-sm leading-relaxed text-ink/85`}
      >
        {r.headline ?? <span className="text-muted">—</span>}
      </td>
    </tr>
  );
}

export default function ComparePage() {
  const groups = compareGroups();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Peptides.info comparison table",
    description:
      "Every peptide in the catalog compared on strongest evidence tier, human-tested claims, and regulatory status.",
    url: `${site.url}/compare`,
    creator: { "@type": "Organization", name: site.name },
    variableMeasured: [
      "Strongest evidence tier (1–4)",
      "Human-tested claims",
      "Regulatory status",
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-4xl font-medium text-plum">Compare</h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/75">
        All {peptides.length} peptides on the same axes. Within each group the
        strongest evidence sits at the top, so the order is itself a finding.
        The last column is not a summary we wrote: it is the single
        best-supported claim from each monograph, lifted as-is.{" "}
        <Link
          href="/methodology"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          How the tiers work
        </Link>
        .
      </p>

      <nav
        aria-label="Groups"
        className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3 text-sm"
      >
        <span className="text-xs font-semibold tracking-widest text-muted uppercase">
          Jump to
        </span>
        <a
          href="#head-to-head"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          Head to head
        </a>
        {groups.map((g) => (
          <a
            key={g.category.slug}
            href={`#${g.category.slug}`}
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            {g.category.label}
          </a>
        ))}
      </nav>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        {([1, 2, 3, 4] as const).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <TierBadge tier={t} />
            <span>{TIERS[t].plain}</span>
          </span>
        ))}
      </div>

      {/* Head to head */}
      <section id="head-to-head" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-medium text-plum">Head to head</h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          The pairs people actually weigh against each other, with every point
          of difference cited.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {comparisons.map((c) => {
            const [a, b] = pairOf(c);
            return (
              <li key={c.slug}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-px hover:border-plum-500/30 hover:shadow-md"
                >
                  <span className="font-serif text-lg font-semibold text-plum group-hover:text-plum-500">
                    {a.name}{" "}
                    <span className="font-sans text-sm text-muted">vs</span>{" "}
                    {b.name}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-ink/75">
                    {c.hook}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {groups.map((g) => (
        <section
          key={g.category.slug}
          id={g.category.slug}
          className="mt-12 scroll-mt-24"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-medium text-plum">
              {g.category.label}
            </h2>
            <Link
              href={`/peptides?category=${g.category.slug}`}
              className="text-sm font-medium text-plum-500 underline-offset-4 hover:underline"
            >
              Browse as cards
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted">{g.category.blurb}</p>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[11px] font-medium tracking-wide text-muted uppercase">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-surface py-3 pr-4 pl-5"
                  >
                    Peptide
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    Best evidence
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    Human-tested
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    Status
                  </th>
                  <th scope="col" className="py-3 pr-5">
                    Best-supported finding
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {g.rows.map((r) => (
                  <Row key={r.slug} r={r} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="mt-12 max-w-prose text-sm text-muted">
        A peptide can appear in more than one group. “Human-tested” counts
        efficacy claims at Tier 1 or 2; regulatory facts are excluded so an
        approval alone never inflates the count.
      </p>
    </main>
  );
}
