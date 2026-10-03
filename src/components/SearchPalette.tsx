"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KIND_LABEL,
  scoreEntry,
  type SearchEntry,
  type SearchKind,
} from "@/lib/search";

const ORDER: SearchKind[] = ["peptide", "comparison", "news", "page"];

/** Anything on the site can open the palette by dispatching this event. */
export const OPEN_SEARCH_EVENT = "peptides:open-search";

export function SearchPalette({ index }: { index: SearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      // Empty query: a short, useful default — the newest news and the first few peptides.
      const news = index.filter((e) => e.kind === "news").slice(0, 3);
      const peps = index.filter((e) => e.kind === "peptide").slice(0, 5);
      return [...peps, ...news];
    }
    return index
      .map((e) => ({ e, s: scoreEntry(e, words) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || ORDER.indexOf(a.e.kind) - ORDER.indexOf(b.e.kind))
      .slice(0, 12)
      .map((x) => x.e);
  }, [index, q]);

  const grouped = useMemo(() => {
    const g = new Map<SearchKind, SearchEntry[]>();
    for (const r of results) g.set(r.kind, [...(g.get(r.kind) ?? []), r]);
    return ORDER.filter((k) => g.has(k)).map((k) => [k, g.get(k)!] as const);
  }, [results]);

  const flat = useMemo(() => grouped.flatMap(([, list]) => list), [grouped]);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setCursor(0);
  }, []);

  const go = useCallback(
    (e: SearchEntry) => {
      close();
      router.push(e.href);
    },
    [close, router],
  );

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setOpen((o) => !o);
      } else if (ev.key === "/" && !open) {
        const t = ev.target as HTMLElement | null;
        const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
        if (!typing) {
          ev.preventDefault();
          setOpen(true);
        }
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setCursor(0), [q]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-plum/40 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      >
        <label className="relative block border-b border-line">
          <span className="sr-only">Search</span>
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
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, flat.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (e.key === "Enter" && flat[cursor]) {
                e.preventDefault();
                go(flat[cursor]);
              }
            }}
            placeholder="Search peptides, comparisons, news…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent py-4 pr-20 pl-11 text-base text-ink outline-none placeholder:text-ink/45"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">
            esc
          </kbd>
        </label>

        <ul
          ref={listRef}
          role="listbox"
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {flat.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-muted">
              Nothing matches. Try a peptide name, a brand, “vs”, or a category
              like “enforcement”.
            </li>
          ) : (
            grouped.map(([kind, list]) => (
              <li key={kind}>
                <p className="px-5 pt-3 pb-1 text-[11px] font-semibold tracking-widest text-muted uppercase">
                  {KIND_LABEL[kind]}
                </p>
                <ul>
                  {list.map((e) => {
                    const i = flat.indexOf(e);
                    const active = i === cursor;
                    return (
                      <li
                        key={e.href}
                        data-i={i}
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setCursor(i)}
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                          go(e);
                        }}
                        className={`flex cursor-pointer items-baseline justify-between gap-4 px-5 py-2.5 ${
                          active ? "bg-plum-050" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-plum">{e.title}</p>
                          {e.sub && (
                            <p className="truncate text-sm text-ink/70">{e.sub}</p>
                          )}
                        </div>
                        {e.meta && (
                          <span className="shrink-0 font-mono text-xs text-muted">
                            {e.meta}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-line px-5 py-2 text-[11px] text-muted">
          <span>↑↓ to move · ↵ to open</span>
          <span>No tracking. Search runs in your browser.</span>
        </div>
      </div>
    </div>
  );
}

/** A header button that opens the palette. Works with JS on; links to the catalog otherwise. */
export function SearchButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/peptides"
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
      }}
      aria-label="Search the site"
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink/70 transition-colors hover:border-plum-500/40 hover:text-plum ${className}`}
    >
      <svg
        width="16"
        height="16"
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
      <span className="hidden md:inline">Search</span>
      <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted md:inline">
        ⌘K
      </kbd>
    </Link>
  );
}
