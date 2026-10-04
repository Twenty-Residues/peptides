#!/usr/bin/env node
/**
 * Link liveness — fetches every unique citation in the catalog, the
 * comparisons and the company register, and reports
 * the ones that no longer resolve. Network-bound, so it is NOT part of the
 * build; CI runs it on a weekly schedule and on demand.
 *
 *   node scripts/check-links.mjs
 *
 * Exit 1 on a definite dead link (404 / 410 / DNS failure). Publisher
 * bot-walls (403 / 429) and timeouts are reported as warnings, since they
 * say nothing about whether the record exists.
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { peptides } = await import(
  pathToFileURL(join(root, "src/lib/peptides.ts")).href
);
// comparisons.ts imports the catalog at runtime, which Node's type stripping
// cannot resolve without extensions; its few literal records are scanned instead.
const comparisonsSrc = readFileSync(
  join(root, "src/lib/comparisons.ts"),
  "utf8",
);
const { companies } = await import(
  pathToFileURL(join(root, "src/lib/companies.ts")).href
);

const hrefs = new Map(); // href -> [slug, ...]
const note = (slug, s) =>
  s && hrefs.set(s.href, [...(hrefs.get(s.href) ?? []), slug]);
for (const p of peptides) {
  for (const c of p.claims) note(p.slug, c.source);
  note(p.slug, p.regulatory?.source);
  for (const s of p.safety ?? []) note(p.slug, s.source);
  note(p.slug, p.sequence?.source);
}
for (const m of comparisonsSrc.matchAll(/href:\s*"([^"]+)"/g))
  note("comparisons", { href: m[1] });
for (const c of companies)
  for (const e of c.events ?? []) note(`company:${c.slug}`, e.source);

const CONCURRENCY = 4;
const TIMEOUT_MS = 20_000;
const UA = "peptides.info link check (+https://peptides.info/about)";

async function probe(href) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    // GET, not HEAD: several of these hosts answer HEAD with 405 or 403.
    const res = await fetch(href, {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": UA,
        accept: "text/html,application/pdf;q=0.9,*/*;q=0.8",
      },
      signal: ctl.signal,
    });
    // Drain cheaply so keep-alive sockets are reused.
    await res.body?.cancel();
    return { status: res.status, final: res.url };
  } catch (e) {
    return {
      error: e.name === "AbortError" ? "timeout" : (e.cause?.code ?? e.message),
    };
  } finally {
    clearTimeout(t);
  }
}

const queue = [...hrefs.keys()];
const dead = [];
const warnings = [];
let ok = 0;

async function worker() {
  while (queue.length) {
    const href = queue.shift();
    const r = await probe(href);
    const who = hrefs.get(href).join(", ");
    if (r.error) {
      (r.error === "timeout" ? warnings : dead).push(
        `${href} → ${r.error} (${who})`,
      );
    } else if (r.status === 404 || r.status === 410) {
      dead.push(`${href} → HTTP ${r.status} (${who})`);
    } else if (r.status >= 400) {
      warnings.push(`${href} → HTTP ${r.status} (${who})`);
    } else {
      ok++;
      // PubMed and PMC redirect a retired ID to a search or the home page.
      if (
        /[?&]term=|\/search\b/.test(r.final) ||
        new URL(r.final).pathname === "/"
      ) {
        dead.push(`${href} → redirected to ${r.final} (${who})`);
      }
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

for (const w of warnings) console.warn("  ⚠ " + w);
if (dead.length) {
  console.error("\n✗ Link check: dead citations\n");
  for (const d of dead) console.error("  - " + d);
  console.error(
    `\n${dead.length} dead, ${warnings.length} unverifiable, ${ok} ok of ${hrefs.size}.\n`,
  );
  process.exit(1);
}
console.log(
  `✓ Link check — ${ok} ok, ${warnings.length} unverifiable (bot-walled or slow), 0 dead of ${hrefs.size} unique records.`,
);
