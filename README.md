# peptides.info

A plain-language, research-grade reference for peptides — "Examine for peptides."
Every claim is graded by how well it's proven (the Standard) and cited to a fixed
record. We sell nothing.

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Node ≥ 22.6.

## What's here

- **Catalog** of peptides, each an Examine-style monograph: verdict → research
  snapshot → how it works → tiered evidence matrix → safety → regulatory status →
  FAQ → references, with a written-by / reviewed-by / last-updated footer.
- **Compare** (`/compare`) — every entry on the same axes, grouped by category,
  plus head-to-head pages (`/compare/a-vs-b`) whose every point of difference
  cites a record. Pairs live in [`src/lib/comparisons.ts`](src/lib/comparisons.ts)
  and look their sources up from the monographs by label, so they cannot cite
  anything the monographs don't.
- **Company register** (`/companies`, veiled) — who makes, compounds and sells
  peptides, with a status quoted from a fixed record: FDA warning letters,
  openFDA enforcement reports, DOJ releases, SEC filings. Data in
  [`src/lib/companies.ts`](src/lib/companies.ts); `npm run check:companies`
  enforces that every status has the record its definition demands and
  writes [`docs/companies-check.md`](docs/companies-check.md). Ships behind a
  coming-soon veil: set `REGISTER_LIVE=true` to publish, or
  `REGISTER_PREVIEW_KEY=<key>` and visit `/companies/preview?key=<key>` to
  preview in one browser (`?key=off` clears it). Domains are shown as text and
  never linked.
- **The Standard** (`/methodology`) — claim-level evidence tiering:
  - **Tier 1** — regulatory approval or a pivotal / Phase 3 RCT
  - **Tier 2** — human clinical short of pivotal (Phase 2 RCT, cohort, open-label)
  - **Tier 3** — preclinical (animal / in-vitro)
  - **Tier 4** — emerging (early signals, theory, community)
- **Trust layer** — `/about`, sourcing & review policy, corrections path, and a
  no-conflict-of-interest statement.
- **SEO** — dynamic sitemap, robots, canonicals, JSON-LD (MedicalWebPage,
  FAQPage, BreadcrumbList, Dataset, Organization), and a branded OG image.

## Editing the catalog

All content lives in [`src/lib/peptides.ts`](src/lib/peptides.ts). Every `href`
must point to a **fixed record** (PMID / PMCID / DOI / label) — never a search
query. The build enforces this:

```bash
npm run check:sources
```

The catalog check loads the real data and verifies its structure: unique
slugs, every claim tiered and cited to a known record host (PubMed, PMC, DOI,
FDA label, ClinicalTrials.gov, UniProt), regulatory claims and status tags in
agreement, every entry in a browse category, real dates, valid sequences.
Missing sections (safety, FAQs, sequence) and uncited Tier 4 absence claims
are warnings, written as an editor's worklist to
[`docs/catalog-check.md`](docs/catalog-check.md). Commit the regenerated file;
CI fails if it is stale:

```bash
npm run check:catalog       # regenerate docs/catalog-check.md
npm run check:catalog:ci    # errors only, no write
```

Copy is held to [`VOICE.md`](VOICE.md). The voice check audits hooks,
summaries, dashes, banned words, and dosing language across the catalog and
the site's own page copy, and writes a worklist to
[`docs/voice-check.md`](docs/voice-check.md). Commit the regenerated worklist;
CI fails if it is stale or if any rule is broken outright:

```bash
npm run check:voice       # regenerate docs/voice-check.md
npm run check:voice:ci    # strict: exit 1 on any "fix" finding
npm run check             # sources + catalog + voice, what `build` runs first
```

Citations are re-fetched weekly by the `Citation links` workflow (and on
demand with `npm run check:links`); a 404, a DNS failure, or a redirect to a
search page fails the run.

## Develop

```bash
npm install
npm run dev
```

## Test

Unit tests for the catalog helpers (evidence floor, snapshot, card projection,
categories, related entries) run on Node's test runner via `tsx`:

```bash
npm test
```

## Build

```bash
npm run build && npm start
```

The `build` script runs `npm run check` (sources, catalog, voice) before `next build`.
CI (`.github/workflows/ci.yml`) runs the same checks plus worklist freshness, unit tests, typecheck, lint, and build on every PR.

## Deploy

Vercel — connect the `Twenty-Residues/peptides` repo, or `vercel deploy --prod --yes`.
