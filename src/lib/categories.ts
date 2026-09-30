import type { Peptide } from "./peptides";

/**
 * Reader-facing groupings for browsing. Derived from tags so they can never
 * drift from the catalog. Order is editorial: strongest evidence first.
 */
export type Category = {
  slug: string;
  label: string;
  /** One line, benefit-first, no overreach. */
  blurb: string;
  tags: readonly string[];
};

export const categories: Category[] = [
  {
    slug: "metabolic",
    label: "Weight & metabolism",
    blurb: "GLP-1 agonists and the fragments that chase them.",
    tags: ["metabolic"],
  },
  {
    slug: "gh-axis",
    label: "Growth hormone axis",
    blurb: "GHRH analogs and secretagogues that raise GH and IGF-1.",
    tags: ["GH-axis", "GH-fragment"],
  },
  {
    slug: "repair",
    label: "Repair & recovery",
    blurb: "The tissue-repair peptides behind the recovery buzz.",
    tags: ["repair", "anti-inflammatory"],
  },
  {
    slug: "skin",
    label: "Skin",
    blurb: "Cosmetic peptides with a real dermatology record.",
    tags: ["skin", "cosmetic"],
  },
  {
    slug: "neuro",
    label: "Mind & mood",
    blurb: "Nootropic and anxiolytic peptides, mostly Russian-clinical.",
    tags: ["neuro"],
  },
  {
    slug: "immune",
    label: "Immune",
    blurb: "Immunomodulators with approvals abroad.",
    tags: ["immune"],
  },
  {
    slug: "longevity",
    label: "Longevity",
    blurb: "Mitochondrial and telomere peptides at the frontier.",
    tags: ["longevity"],
  },
  {
    slug: "sexual-health",
    label: "Sexual health & pigmentation",
    blurb: "Melanocortin agonists, one approved and one not.",
    tags: ["melanocortin"],
  },
];

export function inCategory(p: Peptide, c: Category): boolean {
  return p.tags.some((t) => c.tags.includes(t));
}

export function categoriesFor(p: Peptide): Category[] {
  return categories.filter((c) => inCategory(p, c));
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
