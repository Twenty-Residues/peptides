import type { Metadata } from "next";
import { TIERS, TierBadge, type Tier } from "@/lib/evidence";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Peptides.info sources, tiers, and presents claims — the Standard.",
};

export default function MethodologyPage() {
  const tiers = (Object.keys(TIERS) as unknown as Tier[]).map(Number) as Tier[];
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Methodology</h1>
      <p className="mt-4 max-w-prose text-neutral-600 dark:text-neutral-400">
        Peptides.info is a reference, not a retailer and not a clinic. Our one
        job is to represent the evidence honestly — including where there is
        little of it.
      </p>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">The Standard</h2>
      <p className="mt-3 max-w-prose text-neutral-600 dark:text-neutral-400">
        We tier claims, not products. Every factual statement in a monograph
        carries a tier describing how well it is supported by independent,
        verifiable evidence. An entry&apos;s <em>evidence floor</em> is the
        strongest tier any single claim in it reaches.
      </p>

      <dl className="mt-8 space-y-6">
        {tiers.map((t) => (
          <div key={t} className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <dt className="sm:w-40 shrink-0">
              <TierBadge tier={t} />
            </dt>
            <dd className="max-w-prose text-neutral-600 dark:text-neutral-400">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {TIERS[t].label}.
              </span>{" "}
              {TIERS[t].blurb}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        What we don&apos;t do
      </h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-neutral-600 dark:text-neutral-400">
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
