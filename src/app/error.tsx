"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
        Something broke
      </p>
      <h1 className="mt-4 text-4xl font-medium text-plum">
        This page failed to render.
      </h1>
      <p className="mx-auto mt-4 max-w-prose text-ink/75">
        The content is static, so this is almost always a transient problem.
        Try again; if it persists, the catalog and news still work from the
        links below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-plum hover:bg-gold-600"
        >
          Try again
        </button>
        <Link
          href="/peptides"
          className="rounded-full border border-line bg-surface px-5 py-2 text-sm font-semibold text-plum hover:border-plum-500/40"
        >
          Catalog
        </Link>
        <Link
          href="/news"
          className="rounded-full border border-line bg-surface px-5 py-2 text-sm font-semibold text-plum hover:border-plum-500/40"
        >
          News
        </Link>
      </div>
    </main>
  );
}
