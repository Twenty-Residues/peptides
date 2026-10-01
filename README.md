# peptides.info

A plain-language, research-grade reference for peptides — "Examine for peptides."
Every claim is graded by how well it's proven (the Standard) and cited to a fixed
record. We sell nothing.

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4.

## What's here

- **Catalog** of peptides, each an Examine-style monograph: verdict → research
  snapshot → how it works → tiered evidence matrix → safety → regulatory status →
  FAQ → references, with a written-by / reviewed-by / last-updated footer.
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

Copy is held to [`VOICE.md`](VOICE.md). The voice check audits hooks,
summaries, dashes, banned words, and dosing language, and writes a worklist
to [`docs/voice-check.md`](docs/voice-check.md):

```bash
npm run check:voice
```

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build && npm start
```

The `build` script runs the source guardrail before `next build`.

## Deploy

Vercel — connect the `Twenty-Residues/peptides` repo, or `vercel deploy --prod --yes`.
