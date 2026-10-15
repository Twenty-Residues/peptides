import {
  peptides,
  efficacyTiers,
  type Peptide,
  type Regulatory,
} from "./peptides";
import { categories, inCategory } from "./categories";
import { evidenceFloor, type Tier } from "./evidence";

/**
 * The Therapy Map — a goal-first atlas into the catalog.
 *
 * It answers the query behind "peptide therapy near me" without being a
 * lead-gen clinic directory: start from what you want to do, see what the
 * evidence actually supports (the strongest tier each peptide reaches), and
 * learn what "getting" a peptide really means (its regulatory access lane).
 *
 * Everything here is derived from the catalog and the browse categories, so
 * it can never drift from the monographs it points at.
 */

export type RegStatus = Regulatory["status"];

/** One peptide as the map needs it — just enough to list and link. */
export type MapPeptide = {
  slug: string;
  name: string;
  class: string;
  /** Strongest efficacy tier the monograph reaches (its badge), or null. */
  floor: Tier | null;
  regulatory: RegStatus | null;
};

export type Goal = {
  slug: string;
  label: string;
  blurb: string;
  peptides: MapPeptide[];
};

/** An access lane groups peptides by what obtaining them legally entails. */
export type AccessLane = {
  key: RegStatus | "unlisted";
  label: string;
  /** Honest, plain-language reality of access — no advice, no dosing. */
  reality: string;
  peptides: MapPeptide[];
};

function mapPeptide(p: Peptide): MapPeptide {
  return {
    slug: p.slug,
    name: p.name,
    class: p.class,
    floor: evidenceFloor(efficacyTiers(p)),
    regulatory: p.regulatory?.status ?? null,
  };
}

/** Strongest evidence first (lowest tier number); ties break by name. */
function byEvidenceThenName(a: MapPeptide, b: MapPeptide): number {
  const fa = a.floor ?? 99;
  const fb = b.floor ?? 99;
  if (fa !== fb) return fa - fb;
  return a.name.localeCompare(b.name);
}

/**
 * The map itself: every browse category that has at least one peptide,
 * with its peptides ordered strongest-evidence-first.
 */
export function therapyGoals(): Goal[] {
  return categories
    .map((c) => ({
      slug: c.slug,
      label: c.label,
      blurb: c.blurb,
      peptides: peptides
        .filter((p) => inCategory(p, c))
        .map(mapPeptide)
        .sort(byEvidenceThenName),
    }))
    .filter((g) => g.peptides.length > 0);
}

/** Display order of access lanes — most ordinary route first. */
const LANE_ORDER: (RegStatus | "unlisted")[] = [
  "approved",
  "approved-abroad",
  "withdrawn",
  "research-only",
  "unlisted",
];

const LANE_META: Record<
  RegStatus | "unlisted",
  { label: string; reality: string }
> = {
  approved: {
    label: "At a pharmacy, by prescription",
    reality:
      "FDA-approved for at least one use. A licensed prescriber can prescribe it and a pharmacy dispenses it — the ordinary route, the same as any other drug.",
  },
  "approved-abroad": {
    label: "Approved abroad, unapproved here",
    reality:
      "Cleared by a regulator outside the US, but not by the FDA. Inside the US there is no approved route, so whatever is sold here is unapproved.",
  },
  "research-only": {
    label: "Research-only, not for human use",
    reality:
      "No approval anywhere. Sold as a research chemical and labeled not for human use. There is no regulated route to it — only a grey market that the label itself disclaims.",
  },
  withdrawn: {
    label: "Approved once, then pulled",
    reality:
      "It held an approval that no longer stands. The record of why it was withdrawn is the part worth reading before anything else.",
  },
  unlisted: {
    label: "Status not yet recorded",
    reality:
      "The monograph does not yet carry a regulatory record. Treat the access question as open until it does.",
  },
};

/** Every peptide sorted into its access lane, strongest evidence first. */
export function accessLanes(): AccessLane[] {
  const all = peptides.map(mapPeptide);
  return LANE_ORDER.map((key) => {
    const members = all
      .filter((p) => (p.regulatory ?? "unlisted") === key)
      .sort(byEvidenceThenName);
    return {
      key,
      label: LANE_META[key].label,
      reality: LANE_META[key].reality,
      peptides: members,
    };
  }).filter((lane) => lane.peptides.length > 0);
}
