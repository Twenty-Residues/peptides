import { efficacyTiers, peptides, snapshot } from "./peptides";
import { evidenceFloor } from "./evidence";
import { categoriesFor } from "./categories";
import { news } from "./news";
import { companies, GROUP_OF } from "./companies";
import { registerIsPublic } from "./register-flag";
import { site } from "./site";

/**
 * The open dataset. Everything the site asserts, as rows anyone can reuse:
 * one row per claim with its tier and fixed record, one row per monograph,
 * one row per story. Built from the same data the pages render from, so it
 * can never disagree with the site.
 */

export const DATASET_LICENSE = {
  name: "CC BY 4.0",
  url: "https://creativecommons.org/licenses/by/4.0/",
};

/** Version is the newest substantive date anywhere in the record. */
export function datasetVersion(): string {
  const dates = [
    ...peptides.map((p) => p.updated ?? ""),
    ...peptides.flatMap((p) => (p.changelog ?? []).map((c) => c.date)),
    ...news.map((n) => n.updated ?? n.published),
    ...(registerIsPublic() ? companies.map((c) => c.updated) : []),
  ].filter(Boolean);
  return dates.sort().at(-1) ?? "";
}

export function citation(): string {
  const v = datasetVersion();
  return `${site.org}. ${site.name} evidence dataset, version ${v}. ${site.url}/data. Licensed ${DATASET_LICENSE.name}.`;
}

export type ClaimRow = {
  peptide: string;
  peptide_name: string;
  claim: string;
  tier: number;
  kind: "efficacy" | "regulatory";
  source_label: string;
  source_url: string;
  updated: string;
  page: string;
};

export function claimRows(): ClaimRow[] {
  const out: ClaimRow[] = [];
  for (const p of peptides) {
    for (const c of p.claims) {
      out.push({
        peptide: p.slug,
        peptide_name: p.name,
        claim: c.text,
        tier: c.tier,
        kind: c.kind ?? "efficacy",
        source_label: c.source?.label ?? "",
        source_url: c.source?.href ?? "",
        updated: p.updated ?? "",
        page: `${site.url}/peptides/${p.slug}`,
      });
    }
  }
  return out;
}

export function peptideRows() {
  return peptides.map((p) => {
    const snap = snapshot(p);
    return {
      slug: p.slug,
      name: p.name,
      aka: p.aka ?? [],
      class: p.class,
      categories: categoriesFor(p).map((c) => c.slug),
      regulatory_status: p.regulatory?.status ?? null,
      evidence_floor: evidenceFloor(efficacyTiers(p)),
      human_claims: snap.humanClaims,
      total_claims: snap.totalClaims,
      references: snap.references,
      sequence: p.sequence?.residues ?? null,
      open_questions: p.openQuestions ?? [],
      updated: p.updated ?? null,
      page: `${site.url}/peptides/${p.slug}`,
    };
  });
}

export function newsRows() {
  return news.map((n) => ({
    slug: n.slug,
    title: n.title,
    category: n.category,
    status: n.status,
    published: n.published,
    updated: n.updated ?? null,
    compounds: n.compounds,
    documented: n.documented,
    not_established: n.notEstablished,
    would_change: n.wouldChange,
    open_question: n.openQuestion,
    sources: n.sources.map((s) => ({
      grade: s.grade,
      kind: s.kind,
      label: s.label,
      url: s.href,
    })),
    page: `${site.url}/news/${n.slug}`,
  }));
}

export function companyRows() {
  return companies.map((c) => ({
    slug: c.slug,
    name: c.name,
    aka: c.aka ?? [],
    kind: c.kind,
    jurisdiction: c.jurisdiction,
    status: c.status,
    note: c.note,
    labelling: c.labelling ?? null,
    domains: c.domains ?? [],
    peptides: c.peptides ?? [],
    records: (c.events ?? []).length,
    latest_record: (c.events ?? []).at(-1)?.date ?? null,
    updated: c.updated,
    page: `${site.url}/companies/${c.slug}`,
  }));
}

/** One row per dated record, flat, for spreadsheets. */
export function recordRows() {
  return companies.flatMap((c) =>
    (c.events ?? []).map((e) => ({
      company: c.slug,
      company_name: c.name,
      kind: c.kind,
      status: c.status,
      date: e.date,
      record_kind: e.kind,
      group: GROUP_OF[e.kind],
      summary: e.summary,
      source_label: e.source.label,
      source_url: e.source.href,
      page: `${site.url}/companies/${c.slug}`,
    })),
  );
}

export function envelope<T>(name: string, rows: T[]) {
  return {
    dataset: `${site.name} ${name}`,
    version: datasetVersion(),
    generated: new Date().toISOString().slice(0, 10),
    license: DATASET_LICENSE,
    citation: citation(),
    methodology: `${site.url}/methodology`,
    rows: rows.length,
    data: rows,
  };
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return (
    [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => cell(r[c])).join(",")),
    ].join("\n") + "\n"
  );
}

export type DataFile = { path: string; what: string };

const CORE_FILES: DataFile[] = [
  {
    path: "claims.json",
    what: "One row per claim: text, tier, kind, fixed record, page.",
  },
  { path: "claims.csv", what: "The same rows as CSV, for spreadsheets." },
  {
    path: "peptides.json",
    what: "One row per monograph: class, categories, status, evidence floor, counts, sequence, open questions.",
  },
  {
    path: "news.json",
    what: "One row per story: the three blocks, open question, graded sources.",
  },
];

const REGISTER_FILES: DataFile[] = [
  {
    path: "companies.json",
    what: "One row per company: kind, jurisdiction, status, labelling, domains, peptides on record, record count.",
  },
  {
    path: "records.csv",
    what: "One row per dated record: company, date, kind, group, summary, source URL.",
  },
];

/** The register's files appear only once it is public. */
export function dataFiles(): DataFile[] {
  return registerIsPublic() ? [...CORE_FILES, ...REGISTER_FILES] : CORE_FILES;
}
