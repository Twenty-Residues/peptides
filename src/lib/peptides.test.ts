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
