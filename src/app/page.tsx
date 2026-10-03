import type { Metadata } from "next";
import Link from "next/link";
import { cardData, peptides, snapshot } from "@/lib/peptides";
import { site } from "@/lib/site";
import { sortedNews } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { categories, inCategory } from "@/lib/categories";
import { TIERS, TierBadge, type Tier } from "@/lib/evidence";
import { PeptideCard } from "@/components/PeptideCard";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const FEATURED = [
  "semaglutide",
  "tirzepatide",
  "bpc-157",
  "tesamorelin",
  "ghk-cu",
  "retatrutide",
];

export default function Home() {
  const featured = FEATURED.map((s) => peptides.find((p) => p.slug === s)!);
  const totalRefs = peptides.reduce((n, p) => n + snapshot(p).references, 0);
  const totalClaims = peptides.reduce((n, p) => n + snapshot(p).totalClaims, 0);

  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center sm:pt-24">
        <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
          {site.tagline}
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl leading-[1.1] font-medium text-plum sm:text-6xl">
          Every peptide, graded by how well it&apos;s proven.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink/80">
          Plain-language monographs on {peptides.length} research peptides. Each
          claim carries an evidence tier and a citation to a fixed record, so
          you can see exactly where the science is settled and where the
          frontier begins.
        </p>

        {/* Real search — submits to the catalog */}
        <form
          action="/peptides"
          method="get"
          role="search"
          className="mx-auto mt-9 flex max-w-xl items-center gap-2 rounded-xl border border-line bg-surface py-2 pr-2 pl-5 shadow-sm focus-within:border-plum-500 focus-within:shadow-md"
        >
          <label htmlFor="home-q" className="sr-only">
            Search the catalog
          </label>
          <input
            id="home-q"
            name="q"
            type="search"
            placeholder="Search a peptide, brand, or goal"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-ink outline-none placeholder:text-ink/45"
          />
          <button
            type="submit"
            aria-label="Search"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-plum-500 text-surface transition-colors hover:bg-plum-600"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>

        <p className="mt-4 text-sm text-muted">
          Start with:{" "}
          {["semaglutide", "bpc-157", "tirzepatide", "ghk-cu"].map((s, i) => {
            const p = peptides.find((x) => x.slug === s)!;
            return (
              <span key={s}>
                {i > 0 && ", "}
                <Link
                  href={`/peptides/${s}`}
                  className="font-medium text-plum-500 underline-offset-4 hover:underline"
                >
                  {p.name}
                </Link>
              </span>
            );
          })}
        </p>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {[
            {
              k: "We sell nothing",
              v: "No products, no affiliate links. That is what lets us call thin evidence thin.",
            },
            {
              k: `${totalClaims} claims, each tiered`,
              v: "Tier 1 is an approval or pivotal trial. Tier 4 is the frontier. Nothing gets promoted.",
            },
            {
              k: `${totalRefs} fixed-record citations`,
              v: "Every source is a PMID, DOI, or drug label. Never a search query.",
            },
          ].map((s) => (
            <div key={s.k} className="bg-surface px-5 py-5">
              <p className="font-serif text-lg font-semibold text-plum">
                {s.k}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest news */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-medium text-plum">Latest</h2>
          <Link
            href="/news"
            className="text-sm font-semibold text-plum-500 underline-offset-4 hover:underline"
          >
            All news →
          </Link>
        </div>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          What&apos;s documented, what isn&apos;t, and what would change it. No
          verdicts, no ads.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {sortedNews()
            .slice(0, 3)
            .map((s) => (
              <NewsCard key={s.slug} story={s} />
            ))}
        </div>
      {/* Browse by goal */}
      <section className="mx-auto max-w-5xl px-6 pt-16">
        <h2 className="text-2xl font-medium text-plum">Browse by goal</h2>
        <p className="mt-2 text-ink/70">
          Start from what you want to understand, not from a chemical name.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const n = peptides.filter((p) => inCategory(p, c)).length;
            return (
              <li key={c.slug}>
                <Link
                  href={`/peptides?category=${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:border-plum-500/30 hover:shadow-md"
                >
                  <span className="font-semibold text-plum group-hover:text-plum-500">
                    {c.label}
                  </span>
                  <span className="mt-1 text-sm leading-snug text-ink/70">
                    {c.blurb}
                  </span>
                  <span className="mt-3 text-xs font-medium text-muted">
                    {n} {n === 1 ? "entry" : "entries"} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-5xl px-6 pt-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-medium text-plum">Start here</h2>
          <Link
            href="/peptides"
            className="text-sm font-semibold text-plum-500 underline-offset-4 hover:underline"
          >
            All {peptides.length} peptides →
          </Link>
        </div>
        <p className="mt-2 text-ink/70">
          Six entries that show the range, from FDA-approved to the frontier. Or
          see{" "}
          <Link
            href="/compare"
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            all of them side by side
          </Link>
          .
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <li key={p.slug}>
              <PeptideCard p={cardData(p)} compact />
            </li>
          ))}
        </ul>
      </section>

      {/* How to read a badge */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24">
        <div className="rounded-2xl bg-plum px-6 py-8 text-surface sm:px-10">
          <div className="sm:flex sm:items-start sm:justify-between sm:gap-10">
            <div className="max-w-md">
              <h2 className="font-serif text-2xl font-medium text-surface">
                How to read a badge
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-surface/85">
                Every claim on the site carries one of four tiers. The badge on
                an entry shows the strongest tier any of its claims reaches, so
                you know the ceiling before you read a word.
              </p>
              <Link
                href="/methodology"
                className="mt-5 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-plum transition-colors hover:bg-gold-600"
              >
                Read the full Standard
              </Link>
            </div>
            <ul className="mt-8 grid gap-3 sm:mt-0 sm:w-80">
              {([1, 2, 3, 4] as Tier[]).map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <TierBadge tier={t} />
                  <span className="text-sm leading-snug text-surface/80">
                    {TIERS[t].plain}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
