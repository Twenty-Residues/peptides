import Link from "next/link";
import type { Peptide } from "@/lib/peptides";
import { efficacyTiers, snapshot } from "@/lib/peptides";
import { evidenceFloor, TierBadge } from "@/lib/evidence";

const REG_SHORT: Record<string, string> = {
  approved: "FDA-approved",
  "approved-abroad": "Approved abroad",
  "research-only": "Research-only",
  withdrawn: "Withdrawn",
};

export function PeptideCard({
  p,
  compact = false,
}: {
  p: Peptide;
  compact?: boolean;
}) {
  const floor = evidenceFloor(efficacyTiers(p));
  const snap = snapshot(p);
  return (
    <Link
      href={`/peptides/${p.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-px hover:border-plum-500/30 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-serif text-lg font-semibold text-plum group-hover:text-plum-500">
          {p.name}
        </span>
        {floor && <TierBadge tier={floor} />}
      </div>
      <p className="mt-0.5 text-xs font-medium tracking-wide text-muted uppercase">
        {p.class}
      </p>
      <p className="mt-3 font-medium leading-snug text-ink">{p.hook}</p>
      {!compact && (
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.summary}</p>
      )}
      <p className="mt-auto pt-4 text-xs text-muted">
        {snap.humanClaims > 0
          ? `${snap.humanClaims} of ${snap.totalClaims} claims human-tested`
          : "No human data yet"}
        {" · "}
        {snap.references} {snap.references === 1 ? "reference" : "references"}
        {p.regulatory && (
          <>
            {" · "}
            {REG_SHORT[p.regulatory.status]}
          </>
        )}
      </p>
    </Link>
  );
}
