import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EVENT_LABEL,
  KIND_LABEL,
  LABELLING_LABEL,
  STATUS_PLAIN,
  companies,
  getCompany,
  recordSummary,
} from "@/lib/companies";
import { getPeptide } from "@/lib/peptides";
import { news } from "@/lib/news";
import { EventItem, StatusBadge, fmtDate } from "@/components/CompanyBits";
import { NewsCard } from "@/components/NewsCard";
import { editorial, site } from "@/lib/site";
import { registerIsVisible } from "@/lib/veil";
import { ComingSoon } from "@/components/ComingSoon";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) return {};
  return {
    title: c.name,
    description: `${c.name}: ${c.note}`,
    alternates: { canonical: `/companies/${c.slug}` },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await registerIsVisible())) return <ComingSoon />;
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) notFound();
  const peps = (c.peptides ?? []).map((s) => getPeptide(s)).filter(Boolean);
  const stories = (c.news ?? [])
    .map((s) => news.find((n) => n.slug === s))
    .filter(Boolean);
  const events = c.events ?? [];
  const summary = recordSummary(c);
  const SHOW = 5;
  const recent =
    events.length > SHOW + 1
      ? events.slice(-SHOW).reverse()
      : [...events].reverse();
  const older =
    events.length > SHOW + 1 ? events.slice(0, -SHOW).reverse() : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.name,
    alternateName: c.aka,
    url: `${site.url}/companies/${c.slug}`,
    description: c.note,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
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
            <Link href="/companies" className="hover:text-plum hover:underline">
              Companies
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {c.name}
          </li>
        </ol>
      </nav>

      <p className="mt-8 text-xs font-medium tracking-wide text-plum-500 uppercase">
        {KIND_LABEL[c.kind]} · {c.jurisdiction}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-medium text-plum sm:text-5xl">{c.name}</h1>
        <StatusBadge status={c.status} />
      </div>
      {c.aka && c.aka.length > 0 && (
        <p className="mt-2 text-sm text-muted">Also {c.aka.join(", ")}</p>
      )}
      <p className="mt-6 max-w-prose font-serif text-2xl leading-snug font-medium text-plum">
        {c.note}
      </p>
      <p className="mt-3 max-w-prose text-sm text-muted">
        {STATUS_PLAIN[c.status]}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {[
          { k: "Dated records", v: String(events.length) },
          {
            k: "Latest",
            v: events.at(-1) ? fmtDate(events.at(-1)!.date) : "—",
          },
          {
            k: "Labelling",
            v: c.labelling ? LABELLING_LABEL[c.labelling] : "—",
          },
          { k: "Domains", v: c.domains?.length ? c.domains.join(", ") : "—" },
        ].map((s) => (
          <div key={s.k} className="bg-surface px-4 py-3">
            <dt className="text-[11px] font-medium tracking-wide text-muted uppercase">
              {s.k}
            </dt>
            <dd className="mt-0.5 font-serif text-base text-plum break-words">
              {s.v}
            </dd>
          </div>
        ))}
      </dl>
      {c.domains && c.domains.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Domains are shown so you can recognise the company. We do not link to
          them.
        </p>
      )}

      <section className="mt-14">
        <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
          On the record
        </h2>
        {events.length === 0 ? (
          <p className="mt-5 max-w-prose leading-relaxed text-ink/85">
            We found no FDA, DOJ, FTC, court or securities record for this
            company. That is all this entry says. If you hold one, send it.
          </p>
        ) : (
          <>
            {summary.length > 1 || events.length > 2 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {summary.map((s) => (
                  <li
                    key={s.kind}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink/80"
                  >
                    <span className="font-semibold text-plum">{s.n}</span>{" "}
                    {EVENT_LABEL[s.kind].toLowerCase()}
                    {s.n > 1 ? "s" : ""}
                    <span className="text-muted">
                      {" · "}
                      {s.first === s.last
                        ? fmtDate(s.last)
                        : `${s.first.slice(0, 4)} to ${s.last.slice(0, 4)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <ol className="mt-6 space-y-6 border-l border-line pl-1">
              {recent.map((e, i) => (
                <EventItem key={i} e={e} />
              ))}
            </ol>
            {older.length > 0 && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-plum-500 underline-offset-4 hover:underline">
                  Show {older.length} earlier{" "}
                  {older.length === 1 ? "record" : "records"}
                </summary>
                <ol className="mt-6 space-y-6 border-l border-line pl-1">
                  {older.map((e, i) => (
                    <EventItem key={i} e={e} />
                  ))}
                </ol>
              </details>
            )}
          </>
        )}
      </section>

      {peps.length > 0 && (
        <section className="mt-14">
          <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
            Peptides on record
          </h2>
          <p className="mt-3 max-w-prose text-sm text-muted">
            Named in the records above. Each links to the monograph, where the
            evidence for the molecule itself is graded.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {peps.map((p) => (
              <li key={p!.slug}>
                <Link
                  href={`/peptides/${p!.slug}`}
                  className="rounded-full bg-plum-050 px-3 py-1 text-sm font-medium text-plum-500 hover:bg-plum-500 hover:text-surface"
                >
                  {p!.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stories.length > 0 && (
        <section className="mt-14">
          <h2 className="border-b border-line pb-2 text-2xl font-medium text-plum">
            In the news
          </h2>
          <ul className="mt-5 grid gap-4">
            {stories.map((s) => (
              <li key={s!.slug}>
                <NewsCard story={s!} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-14 border-t border-line pt-6 text-sm text-muted">
        <p>
          Compiled by {editorial.writtenBy}. Last reviewed {fmtDate(c.updated)}.
        </p>
        <p className="mt-3">
          A status here states what a record says and nothing more. To correct
          an entry, or to add a record,{" "}
          <a
            href={`mailto:${editorial.contact}?subject=${encodeURIComponent(`Company register: ${c.name}`)}`}
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            write to corrections
          </a>
          .
        </p>
      </div>
    </main>
  );
}
