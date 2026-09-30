import { peptides, type Peptide } from "./peptides";
import { categoriesFor } from "./categories";

/** Peptides that share a class or a browse category, best overlap first. */
export function relatedPeptides(p: Peptide, limit = 3): Peptide[] {
  const mine = new Set(categoriesFor(p).map((c) => c.slug));
  return peptides
    .filter((q) => q.slug !== p.slug)
    .map((q) => {
      let score = 0;
      if (q.class === p.class) score += 3;
      for (const c of categoriesFor(q)) if (mine.has(c.slug)) score += 2;
      for (const t of q.tags) if (p.tags.includes(t)) score += 1;
      return { q, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.q);
}
