export const site = {
  name: "Peptides.info",
  org: "Twenty Residues",
  url: "https://peptides.info",
  tagline: "Peptides, straight.",
  description:
    "The peptide reference that reads like it wants you to understand — every entry hooked hard, then held to the evidence. Bullish on the science, honest about the frontier.",
};

export const nav = [
  { href: "/peptides", label: "Catalog" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
] as const;

/**
 * Editorial byline — a swappable placeholder until a named author/reviewer is
 * assigned. Shown as "Written by" / "Reviewed by" on every monograph.
 */
export const editorial = {
  writtenBy: "Twenty Residues editorial",
  reviewedBy: "Pending named medical review",
  contact: "corrections@peptides.info",
} as const;
