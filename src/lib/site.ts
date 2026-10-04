export const site = {
  name: "Peptides.info",
  org: "Twenty Residues",
  url: "https://peptides.info",
  repo: "https://github.com/Twenty-Residues/peptides",
  tagline: "Peptides, straight.",
  description:
    "The peptide reference that wants you to understand: every claim tiered by how well it's proven and cited to a fixed record. Bullish on the science, honest about the frontier.",
};

/** Primary header navigation — the two things a reader comes here to do. */
export const nav = [
  { href: "/peptides", label: "Catalog" },
  { href: "/news", label: "News" },
] as const;

/** Secondary routes and trust pages — footer only. */
export const footerNav = [
  { href: "/compare", label: "Compare" },
  { href: "/companies", label: "Companies" },
  { href: "/data", label: "Open data" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
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
  questions: "questions@peptides.info",
} as const;
