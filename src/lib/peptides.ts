import type { Tier } from "./evidence";

export type Claim = {
  text: string;
  tier: Tier;
  source?: { label: string; href: string };
};

export type Peptide = {
  slug: string;
  name: string;
  aka?: string[];
  class: string;
  summary: string;
  sequence?: string;
  claims: Claim[];
};

export const peptides: Peptide[] = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    aka: ["Body Protection Compound-157"],
    class: "Gastric peptide fragment",
    summary:
      "A synthetic 15-amino-acid fragment derived from a gastric protein, studied largely in animal models for tissue-repair and cytoprotective effects.",
    sequence: "GEPPPGKPADDAGLV",
    claims: [
      {
        text: "Accelerates tendon-to-bone and muscle healing in rodent injury models.",
        tier: 3,
        source: {
          label: "Chang et al., 2011 (J Appl Physiol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/21030672/",
        },
      },
      {
        text: "No approved human indication exists in any major regulatory jurisdiction.",
        tier: 1,
      },
    ],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    aka: ["Thymosin β4 fragment"],
    class: "Actin-binding peptide",
    summary:
      "A synthetic peptide related to thymosin β4, investigated preclinically for angiogenesis and wound repair.",
    claims: [
      {
        text: "Promotes cell migration and angiogenesis in vitro and in animal wound models.",
        tier: 3,
        source: {
          label: "Goldstein et al., 2005 (Ann N Y Acad Sci)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16110805/",
        },
      },
    ],
  },
  {
    slug: "semaglutide",
    name: "Semaglutide",
    aka: ["Ozempic", "Wegovy"],
    class: "GLP-1 receptor agonist",
    summary:
      "A long-acting GLP-1 analog approved for type 2 diabetes and chronic weight management, with large randomized cardiovascular-outcome data.",
    claims: [
      {
        text: "Produces clinically significant weight loss in adults with obesity (STEP program).",
        tier: 1,
        source: {
          label: "Wilding et al., 2021 (NEJM, STEP 1)",
          href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
        },
      },
      {
        text: "Reduces major adverse cardiovascular events in established CVD (SELECT).",
        tier: 1,
        source: {
          label: "Lincoff et al., 2023 (NEJM, SELECT)",
          href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2307563",
        },
      },
    ],
  },
];

export function getPeptide(slug: string): Peptide | undefined {
  return peptides.find((p) => p.slug === slug);
}
