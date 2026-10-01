import { peptides, snapshot, type Claim, type Peptide } from "./peptides";
import { categories, inCategory, type Category } from "./categories";
import type { Tier } from "./evidence";

/**
 * The one efficacy claim that best represents what the evidence shows: the
 * first claim at the entry's strongest tier. Derived, never hand-picked, so
 * the compare table can't drift from the monograph.
 */
export function headlineClaim(p: Peptide): Claim | null {
  const efficacy = p.claims.filter((c) => c.kind !== "regulatory");
  if (efficacy.length === 0) return null;
  const best = Math.min(...efficacy.map((c) => c.tier)) as Tier;
  return efficacy.find((c) => c.tier === best) ?? null;
}

export type CompareRow = {
  slug: string;
  name: string;
  class: string;
  floor: Tier | null;
  humanClaims: number;
  totalClaims: number;
  references: number;
  regulatory: Peptide["regulatory"] extends infer R
    ? R extends { status: infer S }
      ? S | null
      : null
    : null;
  headline: string | null;
  headlineTier: Tier | null;
};

export function compareRow(p: Peptide): CompareRow {
  const snap = snapshot(p);
  const h = headlineClaim(p);
  return {
    slug: p.slug,
    name: p.name,
    class: p.class,
    floor: snap.floor,
    humanClaims: snap.humanClaims,
    totalClaims: snap.totalClaims,
    references: snap.references,
    regulatory: p.regulatory?.status ?? null,
    headline: h?.text ?? null,
    headlineTier: h?.tier ?? null,
  };
}

const REG_RANK: Record<string, number> = {
  approved: 0,
  "approved-abroad": 1,
  withdrawn: 2,
  "research-only": 3,
};

/** Strongest evidence first; ties broken by approval, then human coverage. */
export function compareSort(a: CompareRow, b: CompareRow): number {
  const fa = a.floor ?? 5;
  const fb = b.floor ?? 5;
  if (fa !== fb) return fa - fb;
  const ra = REG_RANK[a.regulatory ?? ""] ?? 4;
  const rb = REG_RANK[b.regulatory ?? ""] ?? 4;
  if (ra !== rb) return ra - rb;
  if (b.humanClaims !== a.humanClaims) return b.humanClaims - a.humanClaims;
  return a.name.localeCompare(b.name);
}

export type CompareGroup = { category: Category; rows: CompareRow[] };

/** Every browse category with its members, each group sorted by evidence. */
export function compareGroups(): CompareGroup[] {
  return categories
    .map((category) => ({
      category,
      rows: peptides
        .filter((p) => inCategory(p, category))
        .map(compareRow)
        .sort(compareSort),
    }))
    .filter((g) => g.rows.length > 0);
}
