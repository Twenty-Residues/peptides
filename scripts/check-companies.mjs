#!/usr/bin/env node
/**
 * Company register check — a status is a quotation from a record, so every
 * status must be backed by the kind of record its definition demands.
 *
 *   node --experimental-strip-types scripts/check-companies.mjs           # errors only
 *   node --experimental-strip-types scripts/check-companies.mjs --write   # also write docs/companies-check.md
 *
 * Rules:
 *   - slugs unique, kebab-case; names unique
 *   - status proof: active-regulated ⇒ approval/filing from FDA/EMA/SEC;
 *     under-enforcement ⇒ warning-letter/import-alert/criminal from a
 *     government host; recall-on-record ⇒ a recall and no stronger record;
 *     in-litigation ⇒ a lawsuit and no government record; acquired/ceased ⇒
 *     acquisition/dissolution/delisting from SEC; unverified ⇒ no record at all
 *   - a government enforcement record forces under-enforcement unless the
 *     company is since acquired or ceased
 *   - every event source on an allowed record host; dates ISO, ascending,
 *     not in the future
 *   - peptides are catalog slugs; news are story slugs
 *   - domains are bare hostnames (never linked, never with a scheme)
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { companies, ENFORCEMENT_KINDS } = await import(join(root, "src", "lib", "companies.ts"));
const { peptides } = await import(join(root, "src", "lib", "peptides.ts"));
const { news } = await import(join(root, "src", "lib", "news.ts"));

const write = process.argv.includes("--write");
const errors = [];
const warnings = [];
const err = (slug, msg) => errors.push({ slug, msg });
const warn = (slug, msg) => warnings.push({ slug, msg });

const GOV = [
  { host: "www.fda.gov", path: /^\/inspections-compliance-enforcement-and-criminal-investigations\/warning-letters\/[a-z0-9-]+$/, what: "FDA warning letter" },
  { host: "www.accessdata.fda.gov", path: /^\/cms_ia\/importalert_\d+\.html$/, what: "FDA import alert" },
  { host: "www.accessdata.fda.gov", path: /^\/drugsatfda_docs\/label\/\d{4}\/.+\.pdf$/, what: "FDA label" },
  { host: "api.fda.gov", path: /^\/drug\/enforcement\.json$/, query: /^search=recall_number:%22D-\d{3,4}-\d{4}%22$/, what: "FDA enforcement report" },
  { host: "www.justice.gov", path: /^\/[a-z0-9-]+\/pr\/[a-z0-9-]+$/, what: "DOJ press release" },
  { host: "www.ftc.gov", path: /^\/.+/, what: "FTC record" },
  { host: "www.ema.europa.eu", path: /^\/en\/medicines\//, what: "EMA record" },
  { host: "www.sec.gov", path: /^\/(Archives\/edgar\/data\/\d+\/\d+\/[0-9-]+-index\.htm|cgi-bin\/browse-edgar)$/, what: "SEC filing" },
];
/** Company releases are allowed only for lawsuit events the company itself filed. */
const RELEASE_HOSTS = ["investor.lilly.com"];

const slugSet = new Set(peptides.map((p) => p.slug));
const newsSet = new Set(news.map((n) => n.slug));
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);
const seenSlug = new Set();
const seenName = new Set();

const hostKind = (href) => {
  let u;
  try { u = new URL(href); } catch { return null; }
  if (u.protocol !== "https:") return null;
  const rule = GOV.find((r) => r.host === u.hostname && r.path.test(u.pathname) && (!r.query || r.query.test(u.search.slice(1))));
  if (rule) return { gov: true, what: rule.what, host: u.hostname };
  if (RELEASE_HOSTS.includes(u.hostname)) return { gov: false, what: "company release", host: u.hostname };
  return null;
};

for (const c of companies) {
  const { slug } = c;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) err(slug, "slug is not kebab-case");
  if (seenSlug.has(slug)) err(slug, "duplicate slug");
  seenSlug.add(slug);
  const nk = c.name.trim().toLowerCase();
  if (seenName.has(nk)) err(slug, `duplicate name "${c.name}"`);
  seenName.add(nk);
  for (const k of ["name", "kind", "jurisdiction", "status", "note", "updated"]) if (!c[k]) err(slug, `${k} is empty`);
  if (c.updated && (!ISO.test(c.updated) || c.updated > today)) err(slug, `updated "${c.updated}" is not a valid past ISO date`);
  if (/\b(scam|legit|trustworthy|fraud|fake|best|worst)\b/i.test(c.note)) err(slug, `note carries a verdict word: "${c.note.slice(0, 60)}…"`);
  for (const d of c.domains ?? []) if (/^[a-z]+:\/\/|\//.test(d)) err(slug, `domain "${d}" must be a bare hostname`);
  for (const p of c.peptides ?? []) if (!slugSet.has(p)) err(slug, `peptide "${p}" is not a catalog slug`);
  for (const n of c.news ?? []) if (!newsSet.has(n)) err(slug, `news "${n}" is not a story slug`);

  const events = c.events ?? [];
  let prev = "";
  const kinds = new Set();
  let gov = false, lawsuit = false, recall = false, corp = false, approval = false;
  events.forEach((e, i) => {
    const w = `event ${i + 1}`;
    if (!ISO.test(e.date) || e.date > today) err(slug, `${w}: date "${e.date}" is not a valid past ISO date`);
    if (e.date < prev) err(slug, `${w}: events are not in date order`);
    prev = e.date;
    if (!e.summary?.trim()) err(slug, `${w}: empty summary`);
    if (!e.source?.href || !e.source?.label) { err(slug, `${w}: missing source`); return; }
    const hk = hostKind(e.source.href);
    if (!hk) { err(slug, `${w}: source is not an allowed record (${e.source.href})`); return; }
    if (!hk.gov && e.kind !== "lawsuit") err(slug, `${w}: a company release can only back a lawsuit event`);
    kinds.add(e.kind);
    if (ENFORCEMENT_KINDS.includes(e.kind) && hk.gov) gov = true;
    if (e.kind === "lawsuit") lawsuit = true;
    if (e.kind === "recall" && hk.gov) recall = true;
    if (["acquisition", "dissolution", "delisting"].includes(e.kind) && hk.host === "www.sec.gov") corp = true;
    if (["approval", "filing"].includes(e.kind) && hk.gov) approval = true;
  });

  const s = c.status;
  switch (s) {
    case "active-regulated": if (!approval) err(slug, "active-regulated needs an approval or filing from FDA/EMA/SEC"); break;
    case "under-enforcement": if (!gov) err(slug, "under-enforcement needs a government enforcement record"); break;
    case "recall-on-record": if (!recall) err(slug, "recall-on-record needs an FDA enforcement report"); if (gov) err(slug, "has a stronger record than a recall; status should be under-enforcement"); break;
    case "in-litigation": if (!lawsuit) err(slug, "in-litigation needs a lawsuit event"); if (gov) err(slug, "has a government record; status should be under-enforcement"); break;
    case "acquired": case "ceased": if (!corp) err(slug, `${s} needs an SEC acquisition, dissolution or delisting record`); break;
    case "unverified": if (events.length) err(slug, "unverified entries must have no events"); break;
    default: err(slug, `unknown status "${s}"`);
  }
  if (gov && !["under-enforcement", "acquired", "ceased"].includes(s)) err(slug, `government enforcement record on file but status is "${s}"`);
  if (c.kind === "ruo-vendor" && !c.labelling) warn(slug, "research-use vendor without labelling noted");
  if (!c.peptides?.length && c.kind !== "manufacturer") warn(slug, "no catalog peptides linked");
}

const byStatus = {};
for (const c of companies) byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
if (write) {
  const lines = ["# Company register check — editor worklist", "", "Generated by `node --experimental-strip-types scripts/check-companies.mjs --write`. Errors fail the build; warnings are editorial work.", "", "## Coverage", "", "| Status | Companies |", "|---|---|"];
  for (const [k, v] of Object.entries(byStatus).sort()) lines.push(`| ${k} | ${v} |`);
  lines.push(`| **total** | ${companies.length} |`, "", "## Worklist", "");
  if (!warnings.length) lines.push("Clean. Nothing to do.");
  for (const w of warnings) lines.push(`- [ ] **${w.slug}**: ${w.msg}`);
  writeFileSync(join(root, "docs", "companies-check.md"), lines.join("\n") + "\n");
  console.log(`Wrote docs/companies-check.md (${warnings.length} item(s))`);
}
for (const e of errors) console.error(`  ✗ ${e.slug}: ${e.msg}`);
if (errors.length) { console.error(`\n✗ Company register check failed — ${errors.length} error(s).`); process.exit(1); }
console.log(`✓ Company register check passed — ${companies.length} companies, ${companies.reduce((n, c) => n + (c.events?.length ?? 0), 0)} records, ${warnings.length} warning(s).`);
