#!/usr/bin/env node
/**
 * Catalog integrity check — loads the real catalog (not a regex over the
 * file) and verifies the structural promises the site makes:
 *
 *   - every slug and name is unique and URL-safe
 *   - every claim is tiered 1–4 and cites a fixed record on a known host
 *     (PubMed / PMC / DOI / FDA label / ClinicalTrials.gov / UniProt / EMA)
 *   - regulatory claims are Tier 1 and match the entry's regulatory status
 *   - the "approved" / "approved-abroad" / "investigational" tags agree with
 *     the regulatory status, so category pages can't lie
 *   - every entry lands in at least one browse category
 *   - dates are real ISO dates, not in the future, and the changelog is ordered
 *   - one-letter sequences only use amino-acid letters
 *   - FAQs are questions with answers; the same href always carries one label
 *   - open questions end in a question mark and carry no verdict word
 *
 *   node scripts/check-catalog.mjs            # errors fail (exit 1), warnings print
 *   node scripts/check-catalog.mjs --strict   # warnings fail too
 *   node scripts/check-catalog.mjs --write    # also write docs/catalog-check.md (editor worklist)
 *
 * Runs under Node ≥ 22.6 via --experimental-strip-types (no build step).
 */
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const write = process.argv.includes("--write");

const { peptides } = await import(pathToFileURL(join(root, "src/lib/peptides.ts")).href);
const { categories, categoriesFor } = await import(
  pathToFileURL(join(root, "src/lib/categories.ts")).href
);

const errors = [];
const warnings = [];
const err = (slug, msg) => errors.push(`${slug}: ${msg}`);
const warn = (slug, msg) => warnings.push(`${slug}: ${msg}`);

// ── Fixed-record hosts and the shape a record URL must take there ─────────
const RECORD_HOSTS = [
  { host: "pubmed.ncbi.nlm.nih.gov", path: /^\/\d+\/?$/, what: "PMID" },
  { host: "pmc.ncbi.nlm.nih.gov", path: /^\/articles\/PMC\d+\/?$/, what: "PMCID" },
  { host: "www.ncbi.nlm.nih.gov", path: /^\/pmc\/articles\/PMC\d+\/?$/, what: "PMCID" },
  { host: "doi.org", path: /^\/10\.\d{4,}\/\S+$/, what: "DOI" },
  { host: "dx.doi.org", path: /^\/10\.\d{4,}\/\S+$/, what: "DOI" },
  { host: "www.nejm.org", path: /^\/doi\/(full|10\.)/, what: "DOI" },
  { host: "www.accessdata.fda.gov", path: /^\/drugsatfda_docs\/label\/\d{4}\/.+\.pdf$/, what: "FDA label" },
  { host: "dailymed.nlm.nih.gov", path: /^\/dailymed\/drugInfo\.cfm\?setid=/, what: "DailyMed label" },
  { host: "www.ema.europa.eu", path: /^\/en\/medicines\//, what: "EMA record" },
  { host: "clinicaltrials.gov", path: /^\/study\/NCT\d{8}\/?$/, what: "NCT record" },
  { host: "www.uniprot.org", path: /^\/uniprotkb\/[A-Z0-9]+/, what: "UniProt accession" },
  { host: "rest.uniprot.org", path: /^\/uniprotkb\/[A-Z0-9]+/, what: "UniProt accession" },
];

function checkHref(slug, where, href) {
  let u;
  try {
    u = new URL(href);
  } catch {
    return err(slug, `${where}: unparseable href "${href}"`);
  }
  if (u.protocol !== "https:") return err(slug, `${where}: non-https href ${href}`);
  const rule = RECORD_HOSTS.find((r) => r.host === u.hostname);
  if (!rule) return err(slug, `${where}: host ${u.hostname} is not a fixed-record source (${href})`);
  if (!rule.path.test(u.pathname + u.search)) {
    err(slug, `${where}: ${href} is on ${u.hostname} but is not a ${rule.what} URL`);
  }
}

// ── Per-entry checks ──────────────────────────────────────────────────────
const AA = /^[ACDEFGHIKLMNPQRSTVWY]+$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);
const STATUS_TAG = {
  approved: "approved",
  "approved-abroad": "approved-abroad",
  "research-only": "investigational",
  withdrawn: null,
};
const STATUS_TAGS = new Set(["approved", "approved-abroad", "investigational"]);

const slugs = new Map();
const names = new Map();
const labelsByHref = new Map();

const isoDate = (slug, where, d) => {
  if (!ISO.test(d) || Number.isNaN(Date.parse(d)) || new Date(d).toISOString().slice(0, 10) !== d) {
    return err(slug, `${where}: "${d}" is not a real ISO date`);
  }
  if (d > today) err(slug, `${where}: ${d} is in the future`);
};

const noteSource = (slug, where, s) => {
  if (!s) return;
  if (!s.label?.trim()) err(slug, `${where}: source has no label`);
  checkHref(slug, where, s.href);
  const set = labelsByHref.get(s.href) ?? new Set();
  set.add(s.label);
  labelsByHref.set(s.href, set);
};

for (const p of peptides) {
  const { slug } = p;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) err(slug, "slug is not lowercase-kebab");
  if (slugs.has(slug)) err(slug, "duplicate slug");
  slugs.set(slug, true);
  const nameKey = p.name.trim().toLowerCase();
  if (names.has(nameKey)) err(slug, `duplicate name "${p.name}" (also ${names.get(nameKey)})`);
  names.set(nameKey, slug);

  for (const k of ["name", "class", "hook", "summary"]) {
    if (!p[k]?.trim()) err(slug, `${k} is empty`);
  }
  if (!p.mechanism?.trim()) warn(slug, "no mechanism paragraph");
  if (!p.sequence) warn(slug, "no sequence");
  if (!p.safety?.length) warn(slug, "no safety section");
  if (!p.faqs?.length) warn(slug, "no FAQs");
  if (!p.openQuestions?.length) warn(slug, "no open questions");
  for (const q of p.openQuestions ?? []) {
    if (!q.trim().endsWith("?")) err(slug, `open question must end with a question mark: "${q.slice(0, 60)}…"`);
    const verdict = q.match(/\b(safe|effective|scam|useless|miracle|guaranteed|worthless)\b/i);
    if (verdict) err(slug, `open question carries a verdict word (${verdict[1]}): "${q.slice(0, 60)}…"`);
  }
  if (p.aka && p.aka.some((a) => !a.trim())) err(slug, "empty aka entry");

  // Claims
  if (!p.claims?.length) err(slug, "no claims");
  const efficacy = (p.claims ?? []).filter((c) => c.kind !== "regulatory");
  if (!efficacy.length) err(slug, "no efficacy claims (only regulatory)");
  (p.claims ?? []).forEach((c, i) => {
    const where = `claim ${i + 1}`;
    if (!c.text?.trim()) err(slug, `${where}: empty text`);
    if (![1, 2, 3, 4].includes(c.tier)) err(slug, `${where}: tier ${c.tier} is not 1–4`);
    if (!c.source) {
      // A Tier 4 "no trial exists" statement has no record to cite; flag it
      // for an editor. Anything stronger than that must be cited.
      (c.tier === 4 ? warn : err)(slug, `${where}: no source${c.tier === 4 ? " (Tier 4 absence claim – cite a review if one exists)" : " – every claim must cite a fixed record"} (“${c.text?.slice(0, 60)}…”)`);
    }
    noteSource(slug, where, c.source);
    if (c.kind === "regulatory") {
      if (c.tier !== 1) err(slug, `${where}: regulatory claims are Tier 1 by provenance (got ${c.tier})`);
      if (!p.regulatory) err(slug, `${where}: regulatory claim but entry has no regulatory block`);
    }
  });

  // Regulatory block ↔ tags
  if (!p.regulatory) {
    err(slug, "no regulatory block (status must be stated as fact)");
  } else {
    const { status, detail, source } = p.regulatory;
    if (!(status in STATUS_TAG)) err(slug, `regulatory.status "${status}" is not a known status`);
    if (!detail?.trim()) err(slug, "regulatory.detail is empty");
    if ((status === "approved" || status === "approved-abroad") && !source) {
      err(slug, `regulatory status "${status}" needs a label or register citation`);
    }
    noteSource(slug, "regulatory", source);
    const want = STATUS_TAG[status];
    const have = p.tags.filter((t) => STATUS_TAGS.has(t));
    if (want && !have.includes(want)) err(slug, `status "${status}" but tags lack "${want}" (tags: ${p.tags.join(", ")})`);
    for (const t of have) if (t !== want) err(slug, `tag "${t}" contradicts regulatory status "${status}"`);
  }

  for (const [i, s] of (p.safety ?? []).entries()) {
    if (!s.text?.trim()) err(slug, `safety ${i + 1}: empty text`);
    noteSource(slug, `safety ${i + 1}`, s.source);
  }
  if (p.sequence) {
    const r = p.sequence.residues?.trim();
    if (!r) err(slug, "sequence.residues is empty");
    else if (/^[A-Z]+$/.test(r) && !AA.test(r)) err(slug, `sequence "${r}" contains non-amino-acid letters`);
    if (!p.sequence.source && !/not\s+(letter-)?verified|secondary/i.test(p.sequence.note ?? "")) {
      warn(slug, "sequence has no source and the note doesn't say it is unverified");
    }
    noteSource(slug, "sequence", p.sequence.source);
  }
  for (const [i, f] of (p.faqs ?? []).entries()) {
    if (!f.q?.trim().endsWith("?")) err(slug, `FAQ ${i + 1}: question must end with "?" (“${f.q}”)`);
    if (!f.a?.trim()) err(slug, `FAQ ${i + 1}: empty answer`);
  }

  // Tags and categories
  if (!p.tags?.length) err(slug, "no tags");
  if (new Set(p.tags).size !== p.tags.length) err(slug, "duplicate tags");
  if (categoriesFor(p).length === 0) err(slug, `lands in no browse category (tags: ${p.tags.join(", ")})`);

  // Dates
  if (!p.updated) err(slug, "no updated date");
  else isoDate(slug, "updated", p.updated);
  let prev = "";
  for (const [i, c] of (p.changelog ?? []).entries()) {
    isoDate(slug, `changelog ${i + 1}`, c.date);
    if (!c.note?.trim()) err(slug, `changelog ${i + 1}: empty note`);
    if (c.date < prev) err(slug, `changelog is not in date order at entry ${i + 1}`);
    prev = c.date;
    if (p.updated && c.date > p.updated) err(slug, `changelog entry ${c.date} is newer than updated (${p.updated})`);
  }
}

// ── Cross-entry checks ────────────────────────────────────────────────────
for (const [href, labels] of labelsByHref) {
  if (labels.size > 1) warn("catalog", `one record, ${labels.size} labels: ${href} → ${[...labels].map((l) => `"${l}"`).join(", ")}`);
}
for (const c of categories) {
  if (!peptides.some((p) => categoriesFor(p).some((x) => x.slug === c.slug))) {
    warn("categories", `category "${c.slug}" is empty`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────
const unique = labelsByHref.size;
for (const w of warnings) console.warn("  ⚠ " + w);
if (errors.length) {
  console.error("\n✗ Catalog check failed:\n");
  for (const e of errors) console.error("  - " + e);
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s).\n`);
  process.exit(1);
}
if (strict && warnings.length) {
  console.error(`\n✗ Catalog check: ${warnings.length} warning(s) with --strict.\n`);
  process.exit(1);
}
if (write) {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const by = new Map();
  for (const w of warnings) {
    const [slug, ...rest] = w.split(": ");
    by.set(slug, [...(by.get(slug) ?? []), rest.join(": ")]);
  }
  const cov = (k) => peptides.filter((p) => (Array.isArray(p[k]) ? p[k].length : p[k])).length;
  const lines = [
    "# Catalog check — editor worklist",
    "",
    "Generated by `node scripts/check-catalog.mjs --write`. Re-run after editing `src/lib/peptides.ts`. Errors fail the build; what is listed here is the remaining editorial work.",
    "",
    "## Coverage",
    "",
    "| Section | Entries |",
    "|---|---|",
    `| Mechanism | ${cov("mechanism")} / ${peptides.length} |`,
    `| Sequence | ${cov("sequence")} / ${peptides.length} |`,
    `| Safety | ${cov("safety")} / ${peptides.length} |`,
    `| FAQs | ${cov("faqs")} / ${peptides.length} |`,
    `| Open questions | ${cov("openQuestions")} / ${peptides.length} |`,
    `| Unique cited records | ${unique} |`,
    "",
    "## Worklist by entry",
    "",
  ];
  if (by.size === 0) lines.push("Clean. Nothing to do.");
  for (const [slug, items] of [...by.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`### ${slug}`, "");
    for (const i of items) lines.push(`- [ ] ${i}`);
    lines.push("");
  }
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "docs", "catalog-check.md"), lines.join("\n") + "\n");
  console.error(`Wrote docs/catalog-check.md (${warnings.length} item(s))`);
}
console.log(
  `✓ Catalog check passed — ${peptides.length} entries, ${peptides.reduce((n, p) => n + p.claims.length, 0)} claims, ${unique} unique records${warnings.length ? `, ${warnings.length} warning(s)` : ""}.`,
);
