import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { efficacyTiers, getPeptide, peptides } from "@/lib/peptides";
import { evidenceFloor, TierBadge } from "@/lib/evidence";

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
  return { title: p.name, description: p.summary };
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/peptides"
        className="text-sm font-medium text-plum-500 hover:underline"
      >
        ← Catalog
      </Link>

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

      <p className="mt-6 max-w-prose font-serif text-2xl leading-snug font-medium text-plum">
        {p.hook}
      </p>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink/85">
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

      {p.sequence && (
        <p className="mt-6 text-sm text-muted">
          Sequence:{" "}
          <code className="rounded bg-plum-050 px-1.5 py-0.5 font-mono text-plum">
            {p.sequence.residues}
          </code>
          {p.sequence.note && (
            <span className="ml-2 text-muted">— {p.sequence.note}</span>
          )}
        </p>
      )}

      <h2 className="mt-12 text-sm font-semibold tracking-widest text-plum-500 uppercase">
        Claims &amp; evidence
      </h2>
      <ul className="mt-4 space-y-4">
        {p.claims.map((c, i) => (
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
                {c.source.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
