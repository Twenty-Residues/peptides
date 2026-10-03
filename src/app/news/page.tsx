import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_LABEL, sortedNews, type NewsCategory } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "News",
  description:
    "Peptide news held to the record: enforcement, regulation, litigation, and clinical results — what's documented, what isn't, and what would change it.",
  alternates: {
    canonical: "/news",
    types: { "application/rss+xml": "/news/feed.xml" },
  },
};

export default function NewsIndex() {
  const stories = sortedNews();
  const [lead, ...rest] = stories;

  const counts = stories.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Peptides.info News",
    url: `${site.url}/news`,
    description: metadata.description,
    hasPart: stories.map((s) => ({
      "@type": "NewsArticle",
      headline: s.title,
      url: `${site.url}/news/${s.slug}`,
      datePublished: s.published,
      dateModified: s.updated ?? s.published,
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-plum">News</h1>
          <p className="mt-4 max-w-prose leading-relaxed text-ink/75">
            Who&apos;s being shut down, what&apos;s being approved, what the
            trials actually said. Every story is split into what the record
            establishes, what it doesn&apos;t, and what would change it. No
            verdicts, no ads, no vendor placements. Sources are graded:{" "}
            <strong className="font-semibold text-ink">primary</strong> is the
            document itself,{" "}
            <strong className="font-semibold text-ink">secondary</strong> is a
            report about it.
          </p>
        </div>
        <a
          href="/news/feed.xml"
          className="text-sm font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          RSS feed
        </a>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABEL) as NewsCategory[])
          .filter((c) => counts[c])
          .map((c) => (
            <Link
              key={c}
              href={`/news#${c}`}
              className="rounded-full bg-plum-050 px-3 py-1 text-xs font-medium text-plum-500 hover:bg-plum-500 hover:text-surface"
            >
              {CATEGORY_LABEL[c]} · {counts[c]}
            </Link>
          ))}
      </div>

      {lead && (
        <section className="mt-10">
          <NewsCard story={lead} />
        </section>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {rest.map((s) => (
          <div key={s.slug} id={s.category}>
            <NewsCard story={s} />
          </div>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-medium text-plum">How the desk works</h2>
        <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/75">
          <li>
            A story runs only when at least one primary record exists. Reports
            without a document behind them wait.
          </li>
          <li>
            We state what the record establishes and, separately, what it does
            not. The second list is usually the more useful one.
          </li>
          <li>
            Every story names the evidence that would change it, and carries a
            dated status: developing, updated, or settled record.
          </li>
          <li>
            We never take a position on whether a peptide is safe, effective, or
            worthless. We publish the question. Corrections:{" "}
            <a
              href="mailto:corrections@peptides.info"
              className="font-medium text-plum-500 underline-offset-4 hover:underline"
            >
              corrections@peptides.info
            </a>
            .
          </li>
        </ul>
      </section>
    </main>
  );
}
