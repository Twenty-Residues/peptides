import type { Metadata } from "next";
import Link from "next/link";
import { peptides } from "@/lib/peptides";
import { site } from "@/lib/site";
import { TierBadge } from "@/lib/evidence";
import {
  therapyGoals,
  accessLanes,
  type MapPeptide,
} from "@/lib/therapy-map";

export const metadata: Metadata = {
  title: "Peptide therapy map",
  description:
    "Start from what you want to do. The peptide therapy map shows which peptides are studied for each goal, how strong that evidence is, and what obtaining each one legally actually means — no clinics to sell you, no lead forms.",
  alternates: { canonical: "/map" },
};

const REG_SHORT: Record<string, string> = {
  approved: "FDA-approved",
  "approved-abroad": "Approved abroad",
  "research-only": "Research-only",
  withdrawn: "Withdrawn",
};

/** A compact, linked row used by both the goal panels and the access lanes. */
function PeptideRow({ p }: { p: MapPeptide }) {
  return (
    <li>
      <Link
        href={`/peptides/${p.slug}`}
        className="group flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition hover:bg-plum-050/60"
      >
        <span className="min-w-0">
          <span className="font-serif font-semibold text-plum group-hover:text-plum-500">
            {p.name}
          </span>
          <span className="ml-2 text-xs text-muted">{p.class}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {p.floor ? (
            <TierBadge tier={p.floor} />
          ) : (
            <span className="text-xs text-muted">Untiered</span>
          )}
        </span>
      </Link>
    </li>
  );
}

export default function TherapyMapPage() {
  const goals = therapyGoals();
  const lanes = accessLanes();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Peptide therapy map",
    description:
      "Peptides studied for each therapeutic goal, graded by evidence tier, with the regulatory access reality for each.",
    url: `${site.url}/map`,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
          The therapy map
        </p>
        <h1 className="mt-3 text-4xl font-medium text-plum sm:text-5xl">
          Start from what you want to do.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink/85">
          Search &ldquo;peptide therapy near me&rdquo; and you get a directory
          of clinics paying to be found. This is the other map: every goal
          people reach for peptides to meet, the peptides actually studied for
          it, how strong that evidence is, and — the part the directories skip —
          what obtaining each one legally means. We sell nothing and link to no
          clinic.
        </p>
      </header>

      {/* Jump nav */}
      <nav
        aria-label="Goals"
        className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3 text-sm"
      >
        <span className="text-xs font-semibold tracking-widest text-muted uppercase">
          Jump to
        </span>
        {goals.map((g) => (
          <a
            key={g.slug}
            href={`#${g.slug}`}
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            {g.label}
          </a>
        ))}
        <a
          href="#access"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          Can you get it?
        </a>
      </nav>

      {/* Goal map */}
      <section className="mt-10">
        <h2 className="text-2xl font-medium text-plum">By goal</h2>
        <p className="mt-2 max-w-prose text-ink/75">
          Within each goal the strongest evidence sits at the top, so the order
          is itself a finding. A badge shows the best tier any claim in that
          monograph reaches —{" "}
          <Link
            href="/methodology"
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            how the tiers work
          </Link>
          .
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <section
              key={g.slug}
              id={g.slug}
              aria-labelledby={`${g.slug}-h`}
              className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5"
            >
              <h3
                id={`${g.slug}-h`}
                className="font-serif text-lg font-semibold text-plum"
              >
                {g.label}
              </h3>
              <p className="mt-1 text-sm leading-snug text-ink/70">{g.blurb}</p>
              <ul className="mt-3 -mx-2.5">
                {g.peptides.map((p) => (
                  <PeptideRow key={p.slug} p={p} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      {/* Access lanes — the honest "near me" answer */}
      <section id="access" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-medium text-plum">
          Can you actually get it?
        </h2>
        <p className="mt-2 max-w-prose text-ink/75">
          &ldquo;Near me&rdquo; is the wrong axis. The one that decides whether a
          peptide is a prescription, an import, or a grey-market research vial is
          its regulatory status. Here is the whole catalog sorted by what
          obtaining it legally entails.
        </p>
        <div className="mt-6 space-y-4">
          {lanes.map((lane) => (
            <div
              key={lane.key}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                <div className="max-w-xl">
                  <h3 className="font-serif text-lg font-semibold text-plum">
                    {lane.label}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/75">
                    {lane.reality}
                  </p>
                </div>
                <span className="mt-2 shrink-0 text-xs font-medium text-muted sm:mt-0">
                  {lane.peptides.length}{" "}
                  {lane.peptides.length === 1 ? "peptide" : "peptides"}
                </span>
              </div>
              <ul className="mt-3 -mx-2.5 grid gap-x-4 sm:grid-cols-2">
                {lane.peptides.map((p) => (
                  <PeptideRow key={p.slug} p={p} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* What to ask — the reframed "how to choose a clinic" */}
      <section className="mt-16">
        <h2 className="text-2xl font-medium text-plum">
          If a provider offers these
        </h2>
        <p className="mt-2 max-w-prose text-ink/75">
          We name no clinics and take no referral fees, so we cannot tell you
          where to go. We can tell you what separates a provider reading the
          evidence from one reading a sales script. Four questions do most of
          the work.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              q: "Which exact compound, and what is its status?",
              a: "A straight answer names the molecule and whether it is approved, approved only abroad, or a research chemical. A vague one sells a category.",
            },
            {
              q: "What does the human evidence actually show?",
              a: "Ask for the trial, not the testimonial. Much of the recovery and longevity field is still animal and in-vitro work, and an honest provider will say so.",
            },
            {
              q: "Where is it compounded, and by whom?",
              a: "A 503A or 503B compounding pharmacy is a real, inspectable answer. “Our partner lab” is not.",
            },
            {
              q: "What would make you say no?",
              a: "A provider who can name who should not take something, and why, is weighing risk. One who only lists benefits is not.",
            },
          ].map((item) => (
            <li
              key={item.q}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <p className="font-semibold text-plum">{item.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                {item.a}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Close */}
      <section className="mt-16 rounded-2xl bg-plum px-6 py-8 text-surface sm:px-10">
        <h2 className="font-serif text-2xl font-medium text-surface">
          The map is the catalog
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-surface/85">
          Every peptide above links to a full monograph: the tiered evidence
          matrix, the regulatory record, the safety notes, and the open
          questions the record cannot yet answer. {peptides.length} entries, each
          graded the same way.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/peptides"
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-plum transition-colors hover:bg-gold-600"
          >
            Browse the catalog
          </Link>
          <Link
            href="/compare"
            className="rounded-full border border-surface/30 px-5 py-2 text-sm font-semibold text-surface transition-colors hover:bg-surface/10"
          >
            Compare side by side
          </Link>
        </div>
      </section>

      {/* Reading the lanes */}
      <p className="mt-10 max-w-prose text-sm leading-relaxed text-muted">
        Access labels come straight from each monograph&apos;s regulatory
        record:{" "}
        {Object.entries(REG_SHORT).map(([k, v], i) => (
          <span key={k}>
            {i > 0 && ", "}
            <span className="font-medium text-ink/70">{v}</span>
          </span>
        ))}
        . They describe a legal posture, not an endorsement or a warning.
      </p>
    </main>
  );
}
