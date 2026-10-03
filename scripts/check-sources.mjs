#!/usr/bin/env node
/**
 * Source guardrail — fails the build if any citation in the catalog is not a
 * fixed, verifiable record. Catches the failure mode the launch audit found:
 * a "source" that is actually a search query, or a non-https link.
 *
 * A citation is any `href: "..."` in src/lib/peptides.ts or src/lib/news.ts.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["peptides.ts", "news.ts"].map((f) => join(root, "src", "lib", f));
const src = files.map((f) => readFileSync(f, "utf8")).join("\n");

const hrefs = [...src.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
const problems = [];

for (const href of hrefs) {
  if (!href.startsWith("https://")) {
    problems.push(`Non-https citation: ${href}`);
  }
  if (/[?&]term=/.test(href) || /\/search\b/.test(href)) {
    problems.push(`Search-query used as a source (cite a fixed record): ${href}`);
  }
}

if (problems.length > 0) {
  console.error("\n✗ Source check failed:\n");
  for (const p of problems) console.error("  - " + p);
  console.error(
    `\n${problems.length} problem(s). Every claim must cite a fixed record (PMID/PMCID/DOI/label), never a search.\n`,
  );
  process.exit(1);
}

console.log(`✓ Source check passed — ${hrefs.length} citations, all fixed records.`);
