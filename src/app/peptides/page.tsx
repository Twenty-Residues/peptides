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
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-medium text-plum">Catalog</h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/75">
        {peptides.length} peptides, each one hooked hard and then held to the
        evidence. The badge is the entry&apos;s <em>floor</em> — the strongest
        tier any single claim in it reaches.
      </p>

      <ul className="mt-10 space-y-4">
        {peptides.map((p) => {
          const floor = evidenceFloor(efficacyTiers(p));
          return (
            <li key={p.slug}>
              <Link
                href={`/peptides/${p.slug}`}
                className="group block rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-serif text-xl font-semibold text-plum group-hover:text-plum-500">
                    {p.name}
                  </h2>
                  {floor && <TierBadge tier={floor} />}
                  <span className="ml-auto text-xs font-medium tracking-wide text-muted uppercase">
                    {p.class}
                  </span>
                </div>
                <p className="mt-2 max-w-prose font-medium text-ink">
                  {p.hook}
                </p>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink/70">
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
