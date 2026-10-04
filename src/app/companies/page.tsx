import type { Metadata } from "next";
import Link from "next/link";
import {
  KIND_BLURB,
  KIND_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_PLAIN,
  STATUS_PROOF,
  companies,
  finderRows,
  compareCompanies,
  registerCounts,
  type CompanyKind,
  type CompanyStatus,
} from "@/lib/companies";
import { CompanyRow, StatusBadge } from "@/components/CompanyBits";
import { CompanyFinder } from "@/components/CompanyFinder";
import { site } from "@/lib/site";
import { registerIsVisible } from "@/lib/veil";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Who makes, compounds and sells peptides, and what the public record says about each: approvals, warning letters, recalls, lawsuits, acquisitions. No storefront links.",
  alternates: { canonical: "/companies" },
};

const KINDS: CompanyKind[] = [
  "developer",
  "manufacturer",
  "compounder",
  "telehealth",
  "ruo-vendor",
];

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await registerIsVisible())) return <ComingSoon />;
  const { status = "", q = "" } = await searchParams;
  const filter = STATUS_ORDER.includes(status as CompanyStatus)
    ? (status as CompanyStatus)
    : null;
  const n = registerCounts();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Peptides.info company register",
    description: metadata.description,
    url: `${site.url}/companies`,
    creator: { "@type": "Organization", name: site.name },
    variableMeasured: ["Company status", "Dated public-record events"],
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-4xl font-medium text-plum">Companies</h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/75">
        {n.companies} companies that make, compound or sell peptides, with{" "}
        {n.events} dated records between them. A status here is a quotation, not
        a verdict: every one traces to an FDA letter, a recall report, a court
        or securities filing. Where we found nothing, the entry says so. We
        never link to a storefront.{" "}
        <Link
          href="/companies/timeline"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          See every record as a timeline
        </Link>
        , or{" "}
        <Link
          href="/companies/by-peptide"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          look it up by peptide
        </Link>
        .
      </p>

      <CompanyFinder key={q} rows={finderRows()} initialQuery={q} />

      {/* How to read a status */}
      <details className="mt-8 max-w-3xl rounded-2xl border border-line bg-surface px-5 py-4 shadow-sm">
        <summary className="cursor-pointer list-none font-serif text-lg font-medium text-plum">
          How to read a status
          <span className="ml-2 font-sans text-sm font-normal text-muted">
            Seven words, each with a proof requirement
          </span>
        </summary>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink/75">
          A status is assigned by rule, not by judgment. Each one names the kind
          of record it must point to, and the build fails if an entry lacks it.
          A government enforcement record always wins: a company with a warning
          letter cannot be listed as anything milder.
        </p>
        <dl className="mt-4 divide-y divide-line">
          {STATUS_ORDER.map((s) => (
            <div
              key={s}
              className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4"
            >
              <dt>
                <StatusBadge status={s} />
              </dt>
              <dd className="text-sm leading-relaxed text-ink/85">
                {STATUS_PLAIN[s]}
                <span className="mt-0.5 block text-xs text-muted">
                  Requires: {STATUS_PROOF[s]}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </details>

      {/* Status legend + filter */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/companies"
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
            filter
              ? "text-ink/70 ring-line hover:bg-plum-050"
              : "bg-plum text-surface ring-plum"
          }`}
        >
          All {n.companies}
        </Link>
        {STATUS_ORDER.map((s) => (
          <Link
            key={s}
            href={`/companies?status=${s}`}
            title={STATUS_PLAIN[s]}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
              filter === s
                ? "bg-plum text-surface ring-plum"
                : "text-ink/70 ring-line hover:bg-plum-050"
            }`}
          >
            {STATUS_LABEL[s]} {n.byStatus[s] ?? 0}
          </Link>
        ))}
      </div>
      {filter && (
        <p className="mt-3 text-sm text-muted">
          <StatusBadge status={filter} /> {STATUS_PLAIN[filter]}
        </p>
      )}

      {KINDS.map((kind) => {
        const rows = companies
          .filter((c) => c.kind === kind && (!filter || c.status === filter))
          .sort(compareCompanies);
        if (rows.length === 0) return null;
        return (
          <section key={kind} id={kind} className="mt-12 scroll-mt-24">
            <h2 className="text-2xl font-medium text-plum">
              {KIND_LABEL[kind]}
            </h2>
            <p className="mt-1 text-sm text-muted">{KIND_BLURB[kind]}</p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-[11px] font-medium tracking-wide text-muted uppercase">
                    <th scope="col" className="py-3 pr-4 pl-5">
                      Company
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Status
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Latest record
                    </th>
                    <th scope="col" className="py-3 pr-5">
                      Why
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((c) => (
                    <CompanyRow key={c.slug} c={c} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <p className="mt-12 max-w-prose text-sm text-muted">
        Missing a company, or holding a record we should cite? Write to{" "}
        <a
          href="mailto:corrections@peptides.info?subject=Company%20register"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          corrections@peptides.info
        </a>
        . We add entries from records, not from reputation.
      </p>
    </main>
  );
}
