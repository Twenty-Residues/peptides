import { efficacyTiers, peptides } from "./peptides";
import { evidenceFloor } from "./evidence";
import { comparisons } from "./comparisons";
import { CATEGORY_LABEL, sortedNews } from "./news";
import { footerNav } from "./site";

/**
 * One static index for the whole site. Built on the server at render time
 * and handed to the palette; small enough (a few dozen entries) to ship on
 * every page. No network, no tracking, no third-party search.
 */
export type SearchKind = "peptide" | "comparison" | "news" | "page";

export type SearchEntry = {
  kind: SearchKind;
  title: string;
  /** Second line in the result row. */
  sub: string;
  href: string;
  /** Small right-aligned fact (tier, category, date). */
  meta?: string;
  /** Lower-cased words the query is matched against. Not shown. */
  keywords: string;
};

export const KIND_LABEL: Record<SearchKind, string> = {
  peptide: "Peptides",
  comparison: "Head to head",
  news: "News",
  page: "Pages",
};

export function buildSearchIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];

  for (const p of peptides) {
    const floor = evidenceFloor(efficacyTiers(p));
    out.push({
      kind: "peptide",
      title: p.name,
      sub: p.hook,
      href: `/peptides/${p.slug}`,
      meta: floor ? `T${floor}` : undefined,
      keywords: [p.name, ...(p.aka ?? []), p.class, p.hook, ...p.tags, p.slug]
        .join(" ")
        .toLowerCase(),
    });
  }

  for (const c of comparisons) {
    const names = c.pair.map(
      (s) => peptides.find((p) => p.slug === s)?.name ?? s,
    );
    out.push({
      kind: "comparison",
      title: `${names[0]} vs ${names[1]}`,
      sub: c.hook,
      href: `/compare/${c.slug}`,
      keywords: [...names, ...c.pair, c.hook, "compare", "vs", "versus"]
        .join(" ")
        .toLowerCase(),
    });
  }

  for (const n of sortedNews()) {
    out.push({
      kind: "news",
      title: n.title,
      sub: n.dek,
      href: `/news/${n.slug}`,
      meta: CATEGORY_LABEL[n.category],
      keywords: [n.title, n.dek, n.category, ...n.compounds, n.openQuestion]
        .join(" ")
        .toLowerCase(),
    });
  }

  const pages: [string, string, string, string][] = [
    ["Catalog", "Every peptide, graded by how well it's proven.", "/peptides", "catalog browse all peptides list"],
    ["Compare", "Head-to-head pages on the same axes.", "/compare", "compare head to head versus"],
    ["News", "What's documented, what isn't, and what would change it.", "/news", "news enforcement regulation fda doj trials"],
    ...footerNav.map(
      (f) =>
        [f.label, "", f.href, f.label.toLowerCase()] as [string, string, string, string],
    ),
  ];
  for (const [title, sub, href, kw] of pages) {
    out.push({ kind: "page", title, sub, href, keywords: `${title.toLowerCase()} ${kw}` });
  }

  return out;
}

/**
 * Score a query against an entry. Every query word must match somewhere;
 * title hits outrank keyword hits, and prefix hits outrank substring hits.
 * Keywords match on word prefixes only, so "reta" finds retatrutide and not
 * sec-reta-gogue.
 */
export function scoreEntry(e: SearchEntry, words: string[]): number {
  const title = e.title.toLowerCase();
  let score = 0;
  for (const w of words) {
    if (title.startsWith(w)) score += 6;
    else if (title.split(/[\s\-–]+/).some((t) => t.startsWith(w))) score += 4;
    else if (title.includes(w)) score += 3;
    else if (e.keywords.split(/[\s\-–/(),.]+/).some((k) => k.startsWith(w))) score += 2;
    else return 0;
  }
  return score;
}
