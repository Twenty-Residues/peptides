"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peptide } from "@/lib/peptides";
import { efficacyTiers } from "@/lib/peptides";
import { evidenceFloor, TIERS, type Tier } from "@/lib/evidence";
import { categories, inCategory } from "@/lib/categories";
import { PeptideCard } from "./PeptideCard";

type Sort = "evidence" | "name";

function matches(p: Peptide, q: string) {
  if (!q) return true;
  const hay = [p.name, ...(p.aka ?? []), p.class, p.hook, ...p.tags]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

export function CatalogExplorer({
  peptides,
  initialQuery = "",
  initialCategory = "",
}: {
  peptides: Peptide[];
  initialQuery?: string;
  initialCategory?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [tier, setTier] = useState<Tier | 0>(0);
  const [sort, setSort] = useState<Sort>("evidence");
  const deferredQ = useDeferredValue(q);

  const results = useMemo(() => {
    const cat = categories.find((c) => c.slug === category);
    const list = peptides.filter((p) => {
      if (!matches(p, deferredQ)) return false;
      if (cat && !inCategory(p, cat)) return false;
      if (tier) {
        const floor = evidenceFloor(efficacyTiers(p));
        if (floor !== tier) return false;
      }
      return true;
    });
    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort(
        (a, b) =>
          (evidenceFloor(efficacyTiers(a)) ?? 5) -
            (evidenceFloor(efficacyTiers(b)) ?? 5) ||
          a.name.localeCompare(b.name),
      );
    }
    return list;
  }, [peptides, deferredQ, category, tier, sort]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
      active
        ? "border-plum bg-plum text-surface"
        : "border-line bg-surface text-ink/75 hover:border-plum-500/40 hover:text-plum"
    }`;

  const clear = () => {
    setQ("");
    setCategory("");
    setTier(0);
    router.replace("/peptides", { scroll: false });
  };
  const filtered = Boolean(q || category || tier);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search the catalog</span>
        <svg
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, brand, class, or tag"
          autoComplete="off"
          className="w-full rounded-xl border border-line bg-surface py-3.5 pr-4 pl-11 text-ink shadow-sm placeholder:text-ink/45 focus:border-plum-500"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Category">
        <button type="button" onClick={() => setCategory("")} className={chip(!category)}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(category === c.slug ? "" : c.slug)}
            className={chip(category === c.slug)}
            aria-pressed={category === c.slug}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Evidence tier">
        <span className="mr-1 text-xs font-semibold tracking-widest text-muted uppercase">
          Best evidence
        </span>
        {([1, 2, 3, 4] as Tier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(tier === t ? 0 : t)}
            className={chip(tier === t)}
            aria-pressed={tier === t}
            title={TIERS[t].blurb}
          >
            T{t} · {TIERS[t].short}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p aria-live="polite">
          {results.length === peptides.length
            ? `All ${peptides.length} peptides`
            : `${results.length} of ${peptides.length} peptides`}
          {filtered && (
            <>
              {" · "}
              <button
                type="button"
                onClick={clear}
                className="font-medium text-plum-500 underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
        </p>
        <label className="flex items-center gap-2">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
          >
            <option value="evidence">Strongest evidence first</option>
            <option value="name">A to Z</option>
          </select>
        </label>
      </div>

      {results.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="font-serif text-lg text-plum">Nothing matches that.</p>
          <p className="mt-2 text-sm text-muted">
            Try a brand name, a class like “GLP-1”, or a goal like “repair”.
            Missing a peptide you expected? Tell us and we&apos;ll queue it.
          </p>
          <button
            type="button"
            onClick={clear}
            className="mt-4 rounded-full bg-plum px-4 py-1.5 text-sm font-semibold text-surface hover:bg-plum-600"
          >
            Show everything
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {results.map((p) => (
            <li key={p.slug}>
              <PeptideCard p={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
