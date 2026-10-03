import { efficacyTiers, getPeptide, peptides, snapshot } from "@/lib/peptides";
import { evidenceFloor, TIERS } from "@/lib/evidence";
import { ogCard, OG_SIZE, TIER_COLOR } from "@/lib/og";

export const alt = "Peptides.info monograph";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return peptides.map((p) => ({ slug: p.slug }));
}

const REG: Record<string, string> = {
  approved: "Approved",
  "approved-abroad": "Approved abroad",
  "research-only": "Research-only",
  withdrawn: "Withdrawn",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPeptide(slug);
  if (!p) return ogCard({ eyebrow: "Catalog", headline: "Peptides.info", pills: [] });
  const floor = evidenceFloor(efficacyTiers(p));
  const snap = snapshot(p);
  return ogCard({
    eyebrow: p.class,
    headline: p.hook,
    sub: `${p.name} · ${snap.humanClaims} of ${snap.totalClaims} claims backed by human data · ${snap.references} cited records`,
    pills: [
      ...(floor
        ? [{ color: TIER_COLOR[floor], label: `T${floor} ${TIERS[floor].short}` }]
        : []),
      ...(p.regulatory
        ? [{ color: "#efe9f5", label: REG[p.regulatory.status] }]
        : []),
      { color: "#ffc107", label: "We sell nothing" },
    ],
  });
}
