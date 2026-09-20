import type { Metadata } from "next";
import Link from "next/link";
import { editorial, site } from "@/lib/site";
import { peptides } from "@/lib/peptides";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who is behind Peptides.info, how we work, and why we sell nothing.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-medium text-plum">About {site.name}</h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink/85">
        {site.name} is a plain-language reference for peptides. We read the
        literature so you don&apos;t have to, and we grade every claim by how
        well it&apos;s actually proven — from regulatory-grade trials down to
        early signals on the frontier.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">Why we exist</h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/75">
        Peptide information online is split between hype and fear — vendor copy
        that oversells, and scare pieces that flatten everything into &quot;buyer
        beware.&quot; Neither helps a curious, capable adult understand what a
        molecule is, how it works, and whether the evidence backs the claims.
        That gap is the whole reason for this site.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">
        What makes us different
      </h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 leading-relaxed text-ink/75">
        <li>
          <span className="font-semibold text-plum">We sell nothing.</span> No
          products, no affiliate links, no commissions. Nothing on this page is
          tuned to move a sale, so we can call thin evidence thin.
        </li>
        <li>
          <span className="font-semibold text-plum">We grade claims, not
          products.</span> Every factual statement carries a tier describing how
          well it&apos;s supported. See{" "}
          <Link
            href="/methodology"
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            the Standard
          </Link>
          .
        </li>
        <li>
          <span className="font-semibold text-plum">Every claim is cited.</span>{" "}
          Sources point to fixed records — trials, labels, primary papers — never
          a search box. Across {peptides.length} entries, that&apos;s the
          backbone of the whole reference.
        </li>
        <li>
          <span className="font-semibold text-plum">The frontier is exciting,
          not scary.</span> Where evidence is early, we say so plainly and frame
          it as open territory worth watching.
        </li>
      </ul>

      <h2 className="mt-12 text-2xl font-medium text-plum">How we work</h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/75">
        Each monograph is drafted from primary and regulatory sources, tiered
        against the Standard, and stamped with a review date and an update
        history. When newer evidence lands — an approval, a pivotal trial, a
        retraction — we revise the entry and log the change.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">
        Editorial &amp; review
      </h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/75">
        Written by {editorial.writtenBy}. {editorial.reviewedBy}. Medical review
        strengthens a reference like this, and naming a qualified reviewer is a
        priority as the site matures.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">
        Corrections &amp; contact
      </h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/75">
        Spotted an error or a better source? That feedback makes the reference
        stronger. Reach us at{" "}
        <a
          href={`mailto:${editorial.contact}`}
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          {editorial.contact}
        </a>
        .
      </p>

      <div className="mt-12 rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-muted">
        {site.name} is a reference for research and education. Nothing here is
        medical advice or an endorsement to use any substance. Many peptides
        discussed are not approved for human use.
      </div>
    </main>
  );
}
