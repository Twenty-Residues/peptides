import Link from "next/link";
import { peptides } from "@/lib/peptides";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
        404
      </p>
      <h1 className="mt-4 text-4xl font-medium text-plum">
        No entry at this address.
      </h1>
      <p className="mx-auto mt-4 max-w-prose text-ink/75">
        The page may have moved, or the peptide isn&apos;t in the catalog yet.
        We cover {peptides.length} so far and add more as the evidence earns
        it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/peptides"
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-plum hover:bg-gold-600"
        >
          Browse the catalog
        </Link>
        <Link
          href="/"
          className="rounded-full border border-line bg-surface px-5 py-2 text-sm font-semibold text-plum hover:border-plum-500/40"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
