import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABEL, getStory, news, sortedNews } from "@/lib/news";
import { getPeptide } from "@/lib/peptides";
import { NewsCard, StatusPill, fmtDate } from "@/components/NewsCard";
import { editorial, site } from "@/lib/site";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.dek,
    alternates: { canonical: `/news/${s.slug}` },
    openGraph: {
      title: `${s.title} · Peptides.info`,
      description: s.dek,
      type: "article",
      publishedTime: s.published,
      modifiedTime: s.updated ?? s.published,
    },
  };
}

function Block({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "yes" | "no";
}) {
  const mark = tone === "yes" ? "text-emerald-700" : "text-amber-700";
  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 text-ink/85">
            <span aria-hidden className={`mt-0.5 shrink-0 font-mono ${mark}`}>
              {tone === "yes" ? "●" : "○"}
            </span>
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) notFound();

  const url = `${site.url}/news/${s.slug}`;
  const compounds = s.compounds
    .map((c) => getPeptide(c))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const related = sortedNews()
    .filter((n) => n.slug !== s.slug)
    .filter(
      (n) =>
        n.category === s.category ||
        n.compounds.some((c) => s.compounds.includes(c)),
    )
    .slice(0, 2);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: s.title,
      description: s.dek,
      url,
      datePublished: s.published,
      dateModified: s.updated ?? s.published,
      articleSection: CATEGORY_LABEL[s.category],
      author: { "@type": "Organization", name: editorial.writtenBy },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
      citation: s.sources.map((r) => ({
        "@type": "CreativeWork",
        name: r.label,
        url: r.href,
      })),
      about: compounds.map((p) => ({
        "@type": "Drug",
        name: p.name,
        url: `${site.url}/peptides/${p.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "News", item: `${site.url}/news` },
        { "@type": "ListItem", position: 3, name: s.title, item: url },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/news" className="text-sm font-medium text-plum-500 hover:underline">
        ← News
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-semibold tracking-widest text-plum-500 uppercase">
          {CATEGORY_LABEL[s.category]}
        </span>
        <StatusPill status={s.status} />
      </div>
      <h1 className="mt-3 text-3xl leading-tight font-medium text-plum sm:text-4xl">
        {s.title}
      </h1>
      <p className="mt-5 max-w-prose font-serif text-xl leading-snug text-ink/90">
        {s.dek}
      </p>
      <p className="mt-4 text-sm text-muted">
        Published {fmtDate(s.published)}
        {s.updated && s.updated !== s.published && (
          <> · Updated {fmtDate(s.updated)}</>
        )}{" "}
        · {editorial.writtenBy}
      </p>

      {compounds.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">
            In the catalog
          </span>
          {compounds.map((p) => (
            <Link
              key={p.slug}
              href={`/peptides/${p.slug}`}
              className="rounded-full bg-plum-050 px-2.5 py-0.5 text-xs font-medium text-plum-500 hover:bg-plum-500 hover:text-surface"
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      <Block title="What the record establishes" items={s.documented} tone="yes" />
      <Block title="What it does not establish" items={s.notEstablished} tone="no" />

      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
          What would change this
        </h2>
        <p className="mt-4 max-w-prose leading-relaxed text-ink/85">{s.wouldChange}</p>
      </section>

      <section className="mt-10 rounded-2xl bg-plum px-6 py-6 text-surface">
        <h2 className="text-xs font-semibold tracking-widest text-gold uppercase">
          The open question
        </h2>
        <p className="mt-3 max-w-prose font-serif text-xl leading-snug">
          {s.openQuestion}
        </p>
        <p className="mt-4 text-sm text-surface/70">
          We don&apos;t answer this one. Take it to wherever you argue about
          peptides, and send us the strongest case from either side.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
          Sources
        </h2>
        <ol className="mt-4 space-y-3">
          {s.sources.map((r, i) => (
            <li key={r.href} className="flex gap-3 text-sm">
              <span className="shrink-0 font-mono text-muted">[{i + 1}]</span>
              <div>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-plum-500 underline underline-offset-4 hover:text-plum-600"
                >
                  {r.label}
                </a>
                <p className="mt-0.5 text-xs text-muted">
                  <span
                    className={`mr-2 rounded px-1.5 py-0.5 font-medium ${
                      r.grade === "primary"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {r.grade}
                  </span>
                  {r.kind}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {s.changelog && s.changelog.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
            Update history
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            {s.changelog.map((c) => (
              <li key={c.date + c.note}>
                <span className="font-mono text-muted">{c.date}</span> — {c.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12 max-w-prose text-sm text-muted">
        Something wrong or missing? Tell us at{" "}
        <a
          href="mailto:corrections@peptides.info"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          corrections@peptides.info
        </a>
        . Corrections are logged on the story.
      </p>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-medium text-plum">Related</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((n) => (
              <NewsCard key={n.slug} story={n} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
