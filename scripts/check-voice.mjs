#!/usr/bin/env node
/**
 * Voice check — audits catalog copy against the mechanics in VOICE.md and
 * writes a Markdown worklist for the copywriter.
 *
 *   node scripts/check-voice.mjs            # print report
 *   node scripts/check-voice.mjs --write    # also write docs/voice-check.md
 *   node scripts/check-voice.mjs --strict   # exit 1 on any "fix" finding (CI / build)
 *
 * Besides the catalog, the banned-word and dosing rules also sweep the site's
 * own copy (category blurbs, site description, page components) under the
 * slug "site", so hype can't creep in through a landing page.
 *
 * Rules (from VOICE.md):
 *   - Hooks: one line, ~10 words, a real claim or tension.
 *   - Summaries: 2–3 sentences.
 *   - Dashes: spaced en dash ( – ) for asides; one em dash per page, max.
 *   - Never: "miracle", "guaranteed", "cutting-edge" as filler, dosing,
 *     medical advice, "consult your doctor" boilerplate.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src", "lib", "peptides.ts"), "utf8");

// ── Parse entries without executing TS: split on `slug: "..."` boundaries. ──
const entries = [];
const slugRe = /^\s{4}slug:\s*"([^"]+)"/gm;
let m;
const starts = [];
while ((m = slugRe.exec(src))) starts.push({ slug: m[1], at: m.index });
for (let i = 0; i < starts.length; i++) {
  const body = src.slice(starts[i].at, starts[i + 1]?.at ?? src.length);
  entries.push({ slug: starts[i].slug, body });
}

const field = (body, key) => {
  const r = new RegExp(`^\\s{4}${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const x = body.match(r);
  return x ? x[1].replace(/\\"/g, '"') : "";
};
const strings = (body) =>
  [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)]
    .map((x) => x[1])
    .filter((s) => !s.startsWith("https://"));

const HOOK_MAX = 12;
const BANNED = [
  { re: /\bmiracle\b/i, why: "banned word" },
  { re: /\bguaranteed?\b/i, why: "banned word" },
  { re: /\bcutting[- ]edge\b/i, why: "banned filler" },
  { re: /\bbreakthrough\b/i, why: "hype filler" },
  { re: /\bunlock\b/i, why: "hype filler" },
  { re: /\bgame[- ]chang/i, why: "hype filler" },
  { re: /\bconsult (your|a) (doctor|physician)\b/i, why: "advice boilerplate" },
  { re: /\bbuyer beware\b/i, why: "fear framing" },
  { re: /\bcures?\b/i, why: "overreach: prefer 'studied for'" },
];
// Dosing: numbers with dose units, or protocol verbs. Allowed inside
// regulatory/safety context is a judgment call, so we flag for review.
const DOSING = [
  { re: /\b\d+(\.\d+)?\s?(mg|mcg|µg|ug|iu)\b(?!\/)/i, why: "dose amount" },
  { re: /\b(per day|daily dose|twice daily|once weekly dose|loading dose|cycle of)\b/i, why: "protocol language" },
  { re: /\b(take|inject|administer)\s+\d/i, why: "instruction" },
];

const sentences = (t) =>
  t.replace(/\b(e\.g|i\.e|et al|vs|approx|Dr|No)\./g, "$1").split(/(?<=[.!?])\s+(?=[A-Z"'(])/).filter(Boolean).length;
const words = (t) => t.trim().split(/\s+/).length;

const findings = []; // {slug, severity, rule, detail}
const add = (slug, severity, rule, detail) => findings.push({ slug, severity, rule, detail });

for (const e of entries) {
  const hook = field(e.body, "hook");
  const summary = field(e.body, "summary");
  const all = strings(e.body);
  const joined = all.join("\n");

  // Hook length
  const hw = words(hook);
  if (hw > HOOK_MAX) add(e.slug, "fix", "hook length", `${hw} words (target ~10): “${hook}”`);
  if (/[.!?].+[.!?]/.test(hook)) add(e.slug, "fix", "hook is two sentences", `“${hook}”`);

  // Summary sentence count
  const sc = sentences(summary);
  if (sc < 2 || sc > 3) add(e.slug, "fix", "summary length", `${sc} sentences (target 2–3)`);

  // Em dashes per entry (one page = one entry)
  const em = (joined.match(/—/g) ?? []).length;
  if (em > 1) add(e.slug, "fix", "em dashes", `${em} on the page (max 1). Swap extras for a spaced en dash ( – ) or a full stop.`);
  // Unspaced en dash used as an aside (ranges like 7-37 are fine)
  // Lowercase on both sides only: GHK–Cu and GIP–GLP-1 are bond/pair dashes.
  const badEn = joined.match(/[a-z]–[a-z]/g);
  if (badEn) add(e.slug, "nit", "en dash spacing", `${badEn.length}× unspaced en dash used as aside`);
  // Double hyphen
  if (/\s--\s/.test(joined)) add(e.slug, "nit", "double hyphen", "use a spaced en dash");

  // Banned / hype
  for (const b of BANNED) {
    const hit = all.find((s) => b.re.test(s));
    if (hit) add(e.slug, "fix", b.why, `“${hit.slice(0, 110)}${hit.length > 110 ? "…" : ""}”`);
  }
  // Dosing
  for (const d of DOSING) {
    const hits = all.filter((s) => d.re.test(s));
    for (const hit of hits) add(e.slug, "review", `dosing: ${d.why}`, `“${hit.slice(0, 110)}${hit.length > 110 ? "…" : ""}”`);
  }
  // Numbers in the hook: the hook is the line that gets screenshotted, so a
  // figure there must be carried by a Tier 1–2 claim in the entry.
  if (/\d+\s?%|\b\d{2,}\b/.test(hook)) add(e.slug, "review", "numeric claim in hook", `“${hook}” — confirm a human-tier claim below carries the figure, or soften.`);
  // Scare quotes around marketing terms in the hook (fine, but flag so they're deliberate)
  if (/(^|\s)['"]/.test(hook)) add(e.slug, "nit", "straight quotes in hook", `“${hook}”`);
  // Straight apostrophes/quotes (typography)
  const straight = (joined.match(/\b\w'\w\b/g) ?? []).length;
  if (straight > 0) add(e.slug, "nit", "straight apostrophes", `${straight}× ' — the site renders them as typed; use ’ for polish`);
}

// ── Site copy (not the catalog): banned words and dosing only ─────────────
import { readdirSync, statSync } from "node:fs";
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mdx?)$/.test(f) && !p.endsWith("peptides.ts") ? [p] : [];
  });
const siteText = [];
for (const f of [...walk(join(root, "src", "app")), ...walk(join(root, "src", "components")), join(root, "src", "lib", "categories.ts"), join(root, "src", "lib", "site.ts")]) {
  const t = readFileSync(f, "utf8");
  // String literals and JSX text nodes, with the file for the report.
  for (const x of t.matchAll(/"((?:[^"\\]|\\.)*)"|>([^<>{}]{12,})</g)) {
    const str = (x[1] ?? x[2] ?? "").trim();
    if (str && !str.startsWith("https://") && !/^[\w\s/:.\-]*(className|px|py|text-|bg-|ring-)/.test(str)) siteText.push({ str, file: f.slice(root.length + 1) });
  }
}
for (const { str, file } of siteText) {
  for (const b of BANNED) if (b.re.test(str)) add("site", "fix", `${b.why} (${file})`, `“${str.slice(0, 110)}${str.length > 110 ? "…" : ""}”`);
  for (const d of DOSING) if (d.re.test(str)) add("site", "review", `dosing: ${d.why} (${file})`, `“${str.slice(0, 110)}${str.length > 110 ? "…" : ""}”`);
}

// ── Report ────────────────────────────────────────────────────────────────
const order = { fix: 0, review: 1, nit: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.slug.localeCompare(b.slug));
const bySlug = new Map();
for (const f of findings) bySlug.set(f.slug, [...(bySlug.get(f.slug) ?? []), f]);

const counts = { fix: 0, review: 0, nit: 0 };
for (const f of findings) counts[f.severity]++;

const lines = [];
lines.push("# Voice check — catalog copy vs VOICE.md");
lines.push("");
lines.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`node scripts/check-voice.mjs --write\`. Re-run after editing \`src/lib/peptides.ts\`.`);
lines.push("");
lines.push("| Severity | Meaning | Count |");
lines.push("|---|---|---|");
lines.push(`| **fix** | Breaks a VOICE.md rule outright | ${counts.fix} |`);
lines.push(`| **review** | Judgment calls: dosing-adjacent language, or a figure in a hook | ${counts.review} |`);
lines.push(`| **nit** | Typography and polish | ${counts.nit} |`);
lines.push("");
lines.push("## Rules checked");
lines.push("");
lines.push(`- Hook ≤ ${HOOK_MAX} words, one sentence (VOICE.md: ~10 words).`);
lines.push("- Summary 2–3 sentences.");
lines.push("- At most one em dash (—) per entry; asides use a spaced en dash ( – ).");
lines.push("- No “miracle”, “guaranteed”, “cutting-edge”, “breakthrough”, “unlock”, “game-changing”, “cures”, “buyer beware”, or “consult your doctor”.");
lines.push("- No dosing amounts or protocol language outside a cited regulatory or trial fact.");
lines.push("- A figure in a hook must be carried by a Tier 1–2 claim in the same entry.");
lines.push("");
lines.push("## Hooks at a glance");
lines.push("");
lines.push("| Entry | Words | Hook |");
lines.push("|---|---|---|");
for (const e of entries) {
  const hook = field(e.body, "hook");
  lines.push(`| ${e.slug} | ${words(hook)} | ${hook} |`);
}
lines.push("");
lines.push("## Worklist by entry");
lines.push("");
if (findings.length === 0) lines.push("Clean. Nothing to do.");
for (const [slug, fs] of [...bySlug.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`### ${slug}`);
  lines.push("");
  for (const f of fs) lines.push(`- [ ] **${f.severity}** · ${f.rule} — ${f.detail}`);
  lines.push("");
}

const out = lines.join("\n");
console.log(out);
if (process.argv.includes("--write")) {
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "docs", "voice-check.md"), out + "\n");
  console.error(`\nWrote docs/voice-check.md (${counts.fix} fix, ${counts.review} review, ${counts.nit} nit)`);
}
if (process.argv.includes("--strict")) {
  if (counts.fix > 0) {
    console.error(`\n✗ Voice check: ${counts.fix} "fix" finding(s) break VOICE.md. See the worklist above.\n`);
    process.exit(1);
  }
  console.error(`\n✓ Voice check passed — ${entries.length} entries, ${counts.review} review, ${counts.nit} nit.`);
}
