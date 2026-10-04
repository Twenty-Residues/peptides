import type { Metadata } from "next";
import Link from "next/link";
import {
  KIND_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_PLAIN,
  companiesFor,
  peptideCoverage,
  type CompanyStatus,
} from "@/lib/companies";
import { getPeptide } from "@/lib/peptides";
import { StatusBadge } from "@/components/CompanyBits";
import { registerIsVisible } from "@/lib/veil";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Companies by peptide",
  description:
    "Pick a peptide and see every company the public record ties to it, grouped by status: approval holders, warning-letter recipients, compounders with recalls.",
  alternates: { canonical: "/companies/by-peptide" },
};

type SearchParams = Promise<{ p?: string }>;

export default async function ByPeptidePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await registerIsVisible())) return <ComingSoon />;
  const { p = "" } = await searchParams;
  const coverage = peptideCoverage();
  const selected = coverage.find((c) => c.slug === p)
    ? getPeptide(p)
    : undefined;
  const rows = selected ? companiesFor(selected.slug) : [];
  const groups = STATUS_ORDER.map((s) => ({
    status: s,
    rows: rows.filter((c) => c.status === s),
  })).filter((g) => g.rows.length > 0);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/companies" className="hover:text-plum hover:underline">
          Companies
        </Link>{" "}
        / By peptide
      </nav>
      <h1 className="mt-4 text-4xl font-medium text-plum">
        {selected
          ? `Who is on record for ${selected.name}`
          : "Companies by peptide"}
      </h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/75">
        {selected
          ? `${rows.length} ${rows.length === 1 ? "company" : "companies"} named in a public record alongside ${selected.name}, grouped by what that record is. The molecule's own evidence is graded on its monograph; this page is about who is handling it.`
          : "Pick a peptide to see every company the public record ties to it, grouped by status. The shape of each list is the finding: for an approved drug, one approval holder and a long tail of compounders and sellers; for an investigational one, no approval holder at all."}
      </p>

      <ul
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Peptides with companies on record"
      >
        {coverage.map((c) => {
          const pep = getPeptide(c.slug);
          if (!pep) return null;
          const active = c.slug === p;
          return (
            <li key={c.slug}>
              <Link
                href={`/companies/by-peptide?p=${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset transition-colors ${
                  active
                    ? "bg-plum text-surface ring-plum"
                    : "bg-surface text-ink/75 ring-line hover:bg-plum-050 hover:text-plum"
                }`}
              >
                {pep.name}
                <span
                  className={`font-mono text-xs ${active ? "text-surface/70" : "text-muted"}`}
                >
                  {c.companies}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {selected && (
        <>
          <p className="mt-6 text-sm text-muted">
            Evidence for the molecule itself:{" "}
            <Link
              href={`/peptides/${selected.slug}`}
              className="font-medium text-plum-500 underline-offset-4 hover:underline"
            >
              {selected.name} monograph
            </Link>
            .
          </p>
          {groups.map((g) => (
            <section key={g.status} className="mt-10">
              <div className="flex flex-wrap items-center gap-3 border-b border-line pb-2">
                <h2 className="text-2xl font-medium text-plum">
                  {STATUS_LABEL[g.status]}
                </h2>
                <StatusBadge status={g.status as CompanyStatus} />
                <span className="text-sm text-muted">
                  {g.rows.length} · {STATUS_PLAIN[g.status]}
                </span>
              </div>
              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
                {g.rows.map((c) => (
                  <li key={c.slug} className="px-5 py-3">
                    <Link
                      href={`/companies/${c.slug}`}
                      className="font-medium text-plum underline-offset-4 hover:underline"
                    >
                      {c.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted">
                      {KIND_LABEL[c.kind]}
                    </span>
                    <p className="mt-0.5 max-w-prose text-sm leading-relaxed text-ink/75">
                      {c.note}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
