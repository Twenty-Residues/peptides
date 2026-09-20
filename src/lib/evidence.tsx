/**
 * The Standard — claim-level provenance tiering.
 *
 * Every factual claim in a monograph carries a tier describing how well the
 * claim is supported by independent, verifiable evidence. Tiers are ordinal:
 * a higher tier subsumes the confidence of those below it.
 */

export type Tier = 1 | 2 | 3 | 4;

type TierMeta = {
  label: string;
  short: string;
  blurb: string;
  className: string;
};

export const TIERS: Record<Tier, TierMeta> = {
  1: {
    label: "Tier 1 — Regulatory / pivotal RCT",
    short: "Established",
    blurb:
      "Regulatory approval or a pivotal (Phase 3 / confirmatory) randomized controlled trial in humans. The strongest floor.",
    className:
      "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  2: {
    label: "Tier 2 — Clinical",
    short: "Clinical",
    blurb:
      "Human clinical data short of a pivotal trial: Phase 2 RCTs, cohorts, open-label studies, or well-powered pilots.",
    className:
      "bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
  },
  3: {
    label: "Tier 3 — Preclinical",
    short: "Preclinical",
    blurb:
      "Animal models and in-vitro work. Mechanistically informative; not yet shown in people.",
    className:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  },
  4: {
    label: "Tier 4 — Emerging",
    short: "Emerging",
    blurb:
      "Early signals, theory, or community observation without controlled evidence. The frontier.",
    className:
      "bg-neutral-100 text-neutral-700 ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-300 dark:ring-neutral-400/20",
  },
};

export function TierBadge({ tier }: { tier: Tier }) {
  const meta = TIERS[tier];
  return (
    <span
      title={meta.blurb}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.className}`}
    >
      <span aria-hidden className="font-mono">
        T{tier}
      </span>
      {meta.short}
    </span>
  );
}

/**
 * The evidence floor of a set of claims is the strongest tier that at least
 * one claim reaches (i.e. the numerically lowest tier present).
 */
export function evidenceFloor(tiers: Tier[]): Tier | null {
  if (tiers.length === 0) return null;
  return Math.min(...tiers) as Tier;
}
