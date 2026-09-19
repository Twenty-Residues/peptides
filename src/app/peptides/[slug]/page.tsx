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
        className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
      >
        ← Catalog
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{p.name}</h1>
        {floor && <TierBadge tier={floor} />}
      </div>
      {p.aka && p.aka.length > 0 && (
        <p className="mt-1 text-sm text-neutral-500">
          Also known as {p.aka.join(", ")}
        </p>
      )}
      <p className="mt-1 text-sm text-neutral-500">{p.class}</p>

      <p className="mt-6 max-w-prose text-xl font-medium leading-snug text-neutral-900 dark:text-neutral-100">
        {p.hook}
      </p>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
        {p.summary}
      </p>

      {p.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {p.sequence && (
        <p className="mt-6 text-sm text-neutral-500">
          Sequence:{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
            {p.sequence}
          </code>
        </p>
      )}

      <h2 className="mt-12 text-sm font-semibold tracking-widest text-neutral-500 uppercase">
        Claims &amp; evidence
      </h2>
      <ul className="mt-4 space-y-5">
        {p.claims.map((c, i) => (
          <li
            key={i}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-neutral-800 dark:text-neutral-200">{c.text}</p>
              <TierBadge tier={c.tier} />
            </div>
            {c.source && (
              <a
                href={c.source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-sky-700 underline underline-offset-4 dark:text-sky-400"
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
