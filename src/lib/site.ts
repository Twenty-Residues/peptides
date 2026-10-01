export const site = {
  name: "Peptides.info",
  org: "Twenty Residues",
  url: "https://peptides.info",
  tagline: "Peptides, straight.",
  description:
    "The peptide reference that wants you to understand: every claim tiered by how well it's proven and cited to a fixed record. Bullish on the science, honest about the frontier.",
};

export const nav = [
  { href: "/peptides", label: "Catalog" },
  { href: "/compare", label: "Compare" },
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
  /** Reads naturally after "Medical review:" */
  reviewStatus: "pending; a named reviewer is being assigned",
  contact: "corrections@peptides.info",
} as const;
