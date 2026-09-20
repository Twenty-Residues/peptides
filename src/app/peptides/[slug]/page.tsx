import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  efficacyTiers,
  getPeptide,
  peptides,
  snapshot,
  type Source,
} from "@/lib/peptides";
import { evidenceFloor, TIERS, TierBadge } from "@/lib/evidence";
import { editorial, site } from "@/lib/site";

export function generateStaticParams() {
  return peptides.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPeptide(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary,
    alternates: { canonical: `/peptides/${p.slug}` },
    openGraph: { title: `${p.name} · Peptides.info`, description: p.summary },
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

export default async function PeptidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPeptide(slug);
  if (!p) notFound();

  const floor = evidenceFloor(efficacyTiers(p));
  const snap = snapshot(p);

  // Collect a de-duplicated, numbered reference list across the whole entry.
  const refs: Source[] = [];
  const seen = new Set<string>();
  const addRef = (s?: Source) => {
    if (s && !seen.has(s.href)) {
      seen.add(s.href);
      refs.push(s);
    }
  };
  p.claims.forEach((c) => addRef(c.source));
  addRef(p.regulatory?.source);
  (p.safety ?? []).forEach((s) => addRef(s.source));
  addRef(p.sequence?.source);
  const refIndex = (href?: string) =>
    href ? refs.findIndex((r) => r.href === href) + 1 : 0;

  const url = `${site.url}/peptides/${p.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: p.name,
      alternateName: p.aka,
      url,
      description: p.summary,
      lastReviewed: p.updated,
      dateModified: p.updated,
      author: { "@type": "Organization", name: editorial.writtenBy },
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
          name: "Catalog",
          item: `${site.url}/peptides`,
        },
        { "@type": "ListItem", position: 3, name: p.name, item: url },
      ],
    },
    ...(p.faqs && p.faqs.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: p.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-sm font-semibold tracking-widest text-plum-500 uppercase">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/peptides"
        className="text-sm font-medium text-plum-500 hover:underline"
      >
        ← Catalog
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-medium text-plum">{p.name}</h1>
        {floor && <TierBadge tier={floor} />}
      </div>
      {p.aka && p.aka.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          Also known as {p.aka.join(", ")}
        </p>
      )}
      <p className="mt-1 text-xs font-medium tracking-wide text-plum-500 uppercase">
        {p.class}
      </p>

      {/* Verdict */}
      <p className="mt-6 max-w-prose font-serif text-2xl leading-snug font-medium text-plum">
        {p.hook}
      </p>

      {/* Research snapshot */}
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {[
          { k: "References", v: String(snap.references) },
          {
            k: "Human-grade claims",
            v: `${snap.humanClaims} of ${snap.totalClaims}`,
          },
          {
            k: "Evidence floor",
            v: floor ? TIERS[floor].short : "—",
          },
          {
            k: "Status",
            v: p.regulatory ? REG_LABEL[p.regulatory.status] : "—",
          },
        ].map((s) => (
          <div key={s.k} className="bg-surface px-4 py-3">
            <dt className="text-[11px] font-medium tracking-wide text-muted uppercase">
              {s.k}
            </dt>
            <dd className="mt-0.5 font-serif text-lg text-plum">{s.v}</dd>
          </div>
        ))}
      </dl>

      {/* Summary */}
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink/85">
        {p.summary}
      </p>

      {p.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-plum-050 px-2.5 py-0.5 text-xs font-medium text-plum-500"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* How it works */}
      {p.mechanism && (
        <Section id="how-it-works" title="How it works">
          <p className="max-w-prose leading-relaxed text-ink/85">
            {p.mechanism}
          </p>
          {p.sequence && (
            <p className="mt-4 text-sm text-muted">
              Sequence:{" "}
              <code className="rounded bg-plum-050 px-1.5 py-0.5 font-mono text-plum">
                {p.sequence.residues}
              </code>
              {p.sequence.note && (
                <span className="mt-1 block max-w-prose">{p.sequence.note}</span>
              )}
            </p>
          )}
        </Section>
      )}

      {/* Evidence matrix */}
      <Section id="evidence" title="What it's studied for">
        <ul className="space-y-4">
          {p.claims
            .filter((c) => c.kind !== "regulatory")
            .map((c, i) => (
            <li
              key={i}
              className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-ink">{c.text}</p>
                <TierBadge tier={c.tier} />
              </div>
              {c.source && (
                <a
                  href={c.source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-plum-500 underline underline-offset-4 hover:text-plum-600"
                >
                  [{refIndex(c.source.href)}] {c.source.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* Safety */}
      {p.safety && p.safety.length > 0 && (
        <Section id="safety" title="Safety & limitations">
          <div className="space-y-4">
            {p.safety.map((s, i) => (
              <div key={i} className="max-w-prose">
                <p className="leading-relaxed text-ink/85">{s.text}</p>
                {s.source && (
                  <a
                    href={s.source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-medium text-plum-500 underline underline-offset-4 hover:text-plum-600"
                  >
                    [{refIndex(s.source.href)}] {s.source.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Regulatory */}
      {p.regulatory && (
        <Section id="regulatory" title="Regulatory & legal status">
          <div className="max-w-prose rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <span className="inline-block rounded-full bg-plum-050 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-plum-500 uppercase">
              {REG_LABEL[p.regulatory.status]}
            </span>
            <p className="mt-3 leading-relaxed text-ink/85">
              {p.regulatory.detail}
            </p>
            {p.regulatory.source && (
              <a
                href={p.regulatory.source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-plum-500 underline underline-offset-4 hover:text-plum-600"
              >
                [{refIndex(p.regulatory.source.href)}] {p.regulatory.source.label}
              </a>
            )}
          </div>
        </Section>
      )}

      {/* FAQ */}
      {p.faqs && p.faqs.length > 0 && (
        <Section id="faq" title="Frequently asked">
          <dl className="space-y-5">
            {p.faqs.map((f, i) => (
              <div key={i} className="max-w-prose">
                <dt className="font-serif text-lg font-medium text-plum">
                  {f.q}
                </dt>
                <dd className="mt-1 leading-relaxed text-ink/85">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* References */}
      {refs.length > 0 && (
        <Section id="references" title="References">
          <ol className="space-y-2">
            {refs.map((r, i) => (
              <li key={r.href} className="flex gap-2 text-sm text-ink/75">
                <span className="shrink-0 font-mono text-muted">[{i + 1}]</span>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-plum-500 underline underline-offset-4 hover:text-plum-600"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Meta footer */}
      <div className="mt-12 border-t border-line pt-6 text-sm text-muted">
        <p>
          Written by {editorial.writtenBy}. Reviewed by {editorial.reviewedBy}.
        </p>
        {p.updated && <p className="mt-1">Last updated {fmtDate(p.updated)}.</p>}
        {p.changelog && p.changelog.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-plum-500">
              Update history
            </summary>
            <ul className="mt-2 space-y-1 pl-4">
              {p.changelog.map((c, i) => (
                <li key={i}>
                  <span className="font-mono text-xs">{c.date}</span> — {c.note}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </main>
  );
}
