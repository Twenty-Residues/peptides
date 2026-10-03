import type { Metadata } from "next";
import Link from "next/link";
import { peptides } from "@/lib/peptides";
import { site } from "@/lib/site";
import { sortedNews } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center sm:pt-24">
        <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
          {site.org}
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl leading-[1.1] font-medium text-plum sm:text-6xl">
          Peptide information you can trust
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink/80">
          {site.name} reads every study so you don&apos;t have to — mechanisms,
          evidence, and provenance, written plainly and{" "}
          <Link
            href="/methodology"
            className="font-semibold text-plum-500 underline-offset-4 hover:underline"
          >
            tiered by how well it&apos;s proven
          </Link>
          .
        </p>

        {/* Search-styled entry into the catalog */}
        <Link
          href="/peptides"
          className="group mx-auto mt-9 flex max-w-xl items-center justify-between gap-3 rounded-xl border border-line bg-surface py-3.5 pr-3 pl-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-ink/50">What do you want to learn about?</span>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-plum-500 text-surface transition-colors group-hover:bg-plum-600">
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
          </span>
        </Link>

        {/* Promo card */}
        <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-plum px-6 py-6 text-surface">
          <p className="text-[15px] leading-relaxed">
            <span className="font-semibold">We sell nothing.</span> That&apos;s
            why we can tell you where the science is settled and where the
            frontier really starts.
          </p>
          <Link
            href="/methodology"
            className="mt-4 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-plum-500 transition-colors hover:bg-gold-600"
          >
            How we grade the evidence
          </Link>
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
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-medium text-plum">Featured peptides</h2>
          <Link
            href="/peptides"
            className="text-sm font-semibold text-plum-500 underline-offset-4 hover:underline"
          >
            All {peptides.length} →
          </Link>
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {peptides.slice(0, 6).map((p) => (
            <li key={p.slug}>
              <Link
                href={`/peptides/${p.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-lg font-semibold text-plum group-hover:text-plum-500">
                    {p.name}
                  </span>
                  <span className="shrink-0 text-xs font-medium tracking-wide text-muted uppercase">
                    {p.class}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">
                  {p.hook}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
