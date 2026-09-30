import type { Metadata } from "next";
import { TIERS, TierBadge, type Tier } from "@/lib/evidence";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Peptides.info sources, tiers, and presents claims — the Standard.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  const tiers = (Object.keys(TIERS) as unknown as Tier[]).map(Number) as Tier[];
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-medium text-plum">Methodology</h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink/85">
        Peptides.info is a reference, not a retailer and not a clinic. Our one
        job is to represent the evidence honestly, including where there is
        little of it. This page is the whole rulebook.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">The Standard</h2>
      <p className="mt-3 max-w-prose text-ink/75">
        We tier claims, not products. Every factual statement in a monograph
        carries a tier describing how well it is supported by independent,
        verifiable evidence. The badge on an entry shows its <em>best
        evidence</em>: the strongest tier any single claim in it reaches. It
        tells you the ceiling, not the average.
      </p>

      <dl className="mt-8 space-y-6">
        {tiers.map((t) => (
          <div key={t} className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <dt className="sm:w-40 shrink-0">
              <TierBadge tier={t} />
            </dt>
            <dd className="max-w-prose text-ink/75">
              <span className="font-semibold text-plum">
                {TIERS[t].label}.
              </span>{" "}
              {TIERS[t].blurb}
              <span className="mt-1 block text-sm text-muted">
                In short: {TIERS[t].plain}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 max-w-prose rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink/75">
        <p className="font-semibold text-plum">Worked example</p>
        <p className="mt-1">
          Semaglutide carries a Tier 1 badge because its weight-loss claim
          rests on a pivotal trial and an FDA approval. Its Tier 4 claims, such
          as early signals in addiction, sit in the same entry with their own
          badge. The entry badge never upgrades a claim.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-medium text-plum">How we source</h2>
      <p className="mt-3 max-w-prose text-ink/75">
        Claims are drawn from primary and regulatory records — randomized
        trials, drug labels, ClinicalTrials.gov registrations, sequence
        databases, and peer-reviewed papers. Every citation points to a{" "}
        <em>fixed record</em> (a PMID, PMCID, DOI, or label), never a search
        query, so any reader can land on the exact source we read. Where a
        finding rests on a single research group or is not independently
        replicated, we say so in the claim itself.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">How we review</h2>
      <p className="mt-3 max-w-prose text-ink/75">
        Each entry is verified against those sources, tiered against the
        Standard, and stamped with a review date and an update history. When the
        evidence changes — a new approval, a pivotal trial, a corrected fact — we
        revise the entry and log what changed and when.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">
        No conflict of interest
      </h2>
      <p className="mt-3 max-w-prose text-ink/75">
        We sell nothing — no products, no affiliate links, no commissions on any
        sale. Nothing in a monograph is written to move a transaction, which is
        precisely what lets us grade thin evidence as thin.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">Corrections</h2>
      <p className="mt-3 max-w-prose text-ink/75">
        A reference is only as good as its willingness to be corrected. If a
        claim, tier, or source looks wrong, tell us at{" "}
        <a
          href="mailto:corrections@peptides.info"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          corrections@peptides.info
        </a>{" "}
        and we&apos;ll review it and log any change.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">
        What we don&apos;t do
      </h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-ink/75">
        <li>We don&apos;t give dosing protocols or medical advice.</li>
        <li>We don&apos;t sell peptides or take commissions on their sale.</li>
        <li>
          We don&apos;t launder early signals into settled fact — Tier 4 stays
          labeled Tier 4.
        </li>
      </ul>
    </main>
  );
}
