import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cardData,
  efficacyTiers,
  getPeptide,
  peptides,
  snapshot,
  type Peptide,
} from "./peptides";
import { categoriesFor, inCategory, categories } from "./categories";
import { relatedPeptides } from "./related";
import {
  compareGroups,
  compareRow,
  compareSort,
  headlineClaim,
} from "./compare";
import { comparisons, comparisonsFor, pairOf } from "./comparisons";
import {
  companies,
  companiesFor,
  compareCompanies,
  finderRows,
  recordSummary,
  peptideCoverage,
  registerCounts,
  timeline,
  timelineByYear,
} from "./companies";

const fixture: Peptide = {
  slug: "x",
  name: "X",
  class: "test",
  hook: "h",
  summary: "s",
  tags: ["metabolic"],
  regulatory: { status: "research-only", detail: "d" },
  safety: [
    {
      text: "t",
      source: { label: "a", href: "https://pubmed.ncbi.nlm.nih.gov/1/" },
    },
  ],
  claims: [
    {
      text: "animal",
      tier: 3,
      source: { label: "a", href: "https://pubmed.ncbi.nlm.nih.gov/1/" },
    },
    {
      text: "human",
      tier: 2,
      source: { label: "b", href: "https://pubmed.ncbi.nlm.nih.gov/2/" },
    },
    {
      text: "not approved",
      tier: 1,
      kind: "regulatory",
      source: { label: "c", href: "https://pubmed.ncbi.nlm.nih.gov/3/" },
    },
  ],
};

test("regulatory claims never set the evidence floor", () => {
  assert.deepEqual(efficacyTiers(fixture), [3, 2]);
  assert.equal(snapshot(fixture).floor, 2);
});

test("snapshot counts efficacy claims and distinct records", () => {
  const s = snapshot(fixture);
  assert.equal(s.totalClaims, 2);
  assert.equal(s.humanClaims, 1);
  // safety shares a record with claim 1, regulatory claim adds a third
  assert.equal(s.references, 3);
});

test("an entry with only regulatory claims falls back to them", () => {
  const only: Peptide = { ...fixture, claims: [fixture.claims[2]] };
  assert.deepEqual(efficacyTiers(only), [1]);
  assert.equal(snapshot(only).floor, null);
});

test("cardData carries exactly what a card renders", () => {
  const c = cardData(fixture);
  assert.deepEqual(Object.keys(c).sort(), [
    "aka",
    "class",
    "floor",
    "hook",
    "humanClaims",
    "name",
    "references",
    "regulatory",
    "slug",
    "summary",
    "tags",
    "totalClaims",
  ]);
  assert.equal(c.floor, 2);
  assert.equal(c.regulatory, "research-only");
  assert.deepEqual(c.aka, []);
  assert.ok(!("claims" in c) && !("mechanism" in c));
});

test("categories derive from tags", () => {
  assert.deepEqual(
    categoriesFor(fixture).map((c) => c.slug),
    ["metabolic"],
  );
  assert.equal(inCategory({ tags: ["nothing"] }, categories[0]), false);
});

test("every real entry resolves by slug and has a floor", () => {
  for (const p of peptides) {
    assert.equal(getPeptide(p.slug), p);
    assert.ok(cardData(p).floor !== null, `${p.slug} has no efficacy claim`);
  }
});

test("related entries exclude self, share something, and are capped", () => {
  const sema = getPeptide("semaglutide")!;
  const rel = relatedPeptides(sema);
  assert.ok(rel.length > 0 && rel.length <= 3);
  assert.ok(!rel.some((r) => r.slug === sema.slug));
  assert.ok(
    rel.some((r) => r.slug === "tirzepatide"),
    "same class ranks first",
  );
});

test("headline claim is the first claim at the strongest efficacy tier", () => {
  assert.equal(headlineClaim(fixture)?.text, "human");
  const only: Peptide = { ...fixture, claims: [fixture.claims[2]] };
  assert.equal(headlineClaim(only), null);
});

test("compare rows sort strongest evidence first, then approval", () => {
  const a = compareRow({ ...fixture, slug: "a", name: "A" });
  const b = compareRow({
    ...fixture,
    slug: "b",
    name: "B",
    claims: [fixture.claims[0]],
  });
  const c = compareRow({
    ...fixture,
    slug: "c",
    name: "C",
    regulatory: { status: "approved", detail: "d" },
  });
  assert.deepEqual(
    [b, a, c].sort(compareSort).map((r) => r.slug),
    ["c", "a", "b"],
  );
});

test("every catalog entry appears in at least one compare group", () => {
  const seen = new Set(
    compareGroups().flatMap((g) => g.rows.map((r) => r.slug)),
  );
  for (const p of peptides) assert.ok(seen.has(p.slug), p.slug);
});

test("every comparison resolves to two distinct catalog entries and cites records", () => {
  const seen = new Set<string>();
  for (const c of comparisons) {
    assert.ok(!seen.has(c.slug), `duplicate comparison ${c.slug}`);
    seen.add(c.slug);
    const [a, b] = pairOf(c);
    assert.notEqual(a.slug, b.slug);
    assert.equal(c.slug, `${a.slug}-vs-${b.slug}`);
    assert.ok(c.differences.length >= 3, c.slug);
    for (const d of c.differences) {
      assert.ok(d.source, `${c.slug}: "${d.aspect}" has no source`);
      assert.match(d.source!.href, /^https:\/\//);
    }
  }
});

test("a monograph can find the comparisons it appears in", () => {
  const first = comparisons[0];
  const [a] = pairOf(first);
  assert.ok(comparisonsFor(a).some((c) => c.slug === first.slug));
  assert.deepEqual(comparisonsFor({ slug: "no-such-peptide" }), []);
});

test("register: every company resolves its peptides and sorts regulated first", () => {
  const slugs = new Set(peptides.map((p) => p.slug));
  for (const c of companies)
    for (const s of c.peptides ?? [])
      assert.ok(slugs.has(s), `${c.slug} → ${s}`);
  const sorted = [...companies].sort(compareCompanies);
  assert.equal(sorted[0].status, "active-regulated");
  assert.equal(sorted.at(-1)!.status, "unverified");
});

test("register: timeline is newest first and counts match", () => {
  const t = timeline();
  for (let i = 1; i < t.length; i++) assert.ok(t[i - 1].date >= t[i].date);
  assert.equal(t.length, registerCounts().events);
});

test("register: companiesFor finds the approval holder for semaglutide", () => {
  assert.ok(companiesFor("semaglutide").some((c) => c.slug === "novo-nordisk"));
  assert.deepEqual(companiesFor("no-such-peptide"), []);
});

test("register: finder rows match on domains and peptides, summary counts add up", () => {
  const rows = finderRows();
  assert.equal(rows.length, companies.length);
  const royal = rows.find((r) => r.slug === "royal-peptides")!;
  assert.ok(royal.keywords.includes("royal-peptides.com"));
  assert.ok(royal.keywords.includes("tirzepatide"));
  for (const c of companies) {
    const total = recordSummary(c).reduce((n: number, s) => n + s.n, 0);
    assert.equal(total, c.events?.length ?? 0, c.slug);
  }
});

test("register: year rows cover every record once and every year in range", () => {
  const rows = timelineByYear();
  const sum = rows.reduce(
    (n: number, r) => n + r.enforcement + r.recall + r.legal + r.corporate,
    0,
  );
  assert.equal(sum, registerCounts().events);
  for (let i = 1; i < rows.length; i++)
    assert.equal(Number(rows[i].year), Number(rows[i - 1].year) + 1);
  const cov = peptideCoverage();
  assert.ok(cov.find((c) => c.slug === "semaglutide")!.companies > 10);
  for (const c of cov) assert.equal(companiesFor(c.slug).length, c.companies);
});

test("dataset: register rows mirror the register", async () => {
  const { companyRows, recordRows } = await import("./dataset");
  assert.equal(companyRows().length, companies.length);
  assert.equal(recordRows().length, registerCounts().events);
  for (const r of recordRows()) assert.match(r.source_url, /^https:\/\//);
});
