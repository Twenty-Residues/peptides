import type { Metadata } from "next";
import Link from "next/link";
import { efficacyTiers, peptides } from "@/lib/peptides";
import { evidenceFloor, TierBadge } from "@/lib/evidence";

export const metadata: Metadata = {
  title: "Catalog",
  description: "The peptide catalog — each entry tiered by evidence strength.",
};

export default function CatalogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Catalog</h1>
      <p className="mt-4 max-w-prose text-neutral-600 dark:text-neutral-400">
        {peptides.length} peptides, each one hooked hard and then held to the
        evidence. The badge is the entry&apos;s <em>floor</em> — the strongest
        tier any single claim in it reaches.
      </p>

      <ul className="mt-10 space-y-6">
        {peptides.map((p) => {
          const floor = evidenceFloor(efficacyTiers(p));
          return (
            <li key={p.slug}>
              <Link href={`/peptides/${p.slug}`} className="group block">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium group-hover:underline underline-offset-4">
                    {p.name}
                  </h2>
                  {floor && <TierBadge tier={floor} />}
                </div>
                <p className="mt-1 text-sm text-neutral-500">{p.class}</p>
                <p className="mt-2 max-w-prose font-medium text-neutral-800 dark:text-neutral-200">
                  {p.hook}
                </p>
                <p className="mt-1 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
                  {p.summary}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
