"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  KIND_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  type FinderRow,
} from "@/lib/companies";
import { editorial } from "@/lib/site";
import { StatusBadge } from "./CompanyBits";

function matches(r: FinderRow, q: string) {
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => r.keywords.includes(w));
}

/**
 * The reader arrives with a name on a vial or a domain on a receipt. Answer
 * that first. Everything below the finder is the full register.
 */
export function CompanyFinder({
  rows,
  initialQuery = "",
}: {
  rows: FinderRow[];
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const dq = useDeferredValue(q.trim());
  const results = useMemo(() => {
    if (!dq) return [];
    return rows
      .filter((r) => matches(r, dq))
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, 12);
  }, [rows, dq]);

  return (
    <div className="mt-8">
      <label htmlFor="company-q" className="sr-only">
        Find a company
      </label>
      <div className="flex max-w-xl items-center gap-2 rounded-xl border border-line bg-surface py-2 pr-2 pl-5 shadow-sm focus-within:border-plum-500 focus-within:shadow-md">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
          className="shrink-0 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id="company-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Company name, domain, or peptide"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-ink outline-none placeholder:text-ink/45"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-plum-050 hover:text-plum"
          >
            Clear
          </button>
        )}
      </div>

      {dq && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
        >
          {results.length === 0 ? (
            <div className="px-5 py-4 text-sm leading-relaxed text-ink/80">
              <p className="font-medium text-plum">Not in the register.</p>
              <p className="mt-1 text-muted">
                We list companies from records, not reputation, so an absence
                means we have found no FDA, DOJ, SEC or court record and no one
                has sent us one. Hold a record?{" "}
                <a
                  href={`mailto:${editorial.contact}?subject=${encodeURIComponent(`Company register: ${q.trim()}`)}`}
                  className="font-medium text-plum-500 underline-offset-4 hover:underline"
                >
                  Send it
                </a>
                .
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/companies/${r.slug}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-plum-050/60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-plum">
                        {r.name}
                      </span>
                      <span className="block text-xs text-muted">
                        {KIND_LABEL[r.kind]} · {r.jurisdiction}
                      </span>
                    </span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
              {results.length === 12 && (
                <li className="px-5 py-2 text-xs text-muted">
                  Showing the first 12. Keep typing to narrow.
                </li>
              )}
            </ul>
          )}
        </div>
      )}
      <p className="sr-only">
        Statuses: {STATUS_ORDER.map((s) => STATUS_LABEL[s]).join(", ")}.
      </p>
    </div>
  );
}
