import type { Metadata } from "next";
import Link from "next/link";
import { editorial, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Peptides.info collects when you visit (very little), what it never collects, and who to ask.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2026-10-01";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-medium text-plum">Privacy</h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink/85">
        {site.name} is a reference you read, not a service you sign up for. We
        keep the data we touch to the minimum a website can run on, and this
        page lists all of it.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">What we collect</h2>
      <ul className="mt-3 max-w-prose list-disc space-y-3 pl-5 leading-relaxed text-ink/75">
        <li>
          <span className="font-semibold text-plum">Aggregate page views.</span>{" "}
          We use Vercel Web Analytics to count visits per page. It does not
          set cookies, does not fingerprint your device, and does not track
          you across sites. It records the page, the referrer, and coarse
          device and country information, and discards anything that could
          identify you.
        </li>
        <li>
          <span className="font-semibold text-plum">Standard server logs.</span>{" "}
          Our host, Vercel, keeps short-lived request logs to run and secure
          the site. We do not use them to profile readers.
        </li>
        <li>
          <span className="font-semibold text-plum">Email you send us.</span>{" "}
          If you write to{" "}
          <a
            href={`mailto:${editorial.contact}`}
            className="font-medium text-plum-500 underline-offset-4 hover:underline"
          >
            {editorial.contact}
          </a>
          , we keep the message so we can act on it and log the correction.
          We never add you to a list.
        </li>
      </ul>

      <h2 className="mt-12 text-2xl font-medium text-plum">
        What we don&apos;t do
      </h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 leading-relaxed text-ink/75">
        <li>No accounts, no sign-ups, no newsletters.</li>
        <li>No advertising, no ad networks, no affiliate links.</li>
        <li>No tracking cookies and no cookie banner, because there is nothing to consent to.</li>
        <li>
          No third-party font or script calls on page load. Fonts are served
          from our own domain.
        </li>
        <li>
          No sale or sharing of reader data with anyone, for any reason.
        </li>
      </ul>

      <h2 className="mt-12 text-2xl font-medium text-plum">Outbound links</h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/75">
        Every citation links to a fixed record on an external site such as
        PubMed, a regulator, or a journal. Those sites have their own privacy
        practices once you arrive. Links open in a new tab and send no
        information about you beyond the page you came from.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">Your rights</h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/75">
        Because we hold no personal data about readers, there is nothing to
        export or delete. If you believe we hold something about you anyway,
        or you have a question about this page, email{" "}
        <a
          href={`mailto:${editorial.contact}`}
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          {editorial.contact}
        </a>{" "}
        and we will answer.
      </p>

      <h2 className="mt-12 text-2xl font-medium text-plum">Changes</h2>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/75">
        If any of the above changes, we will update this page and note the
        date here, the same way we log changes to a monograph. See{" "}
        <Link
          href="/methodology"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          how we handle corrections
        </Link>
        .
      </p>

      <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
        Last updated {UPDATED}. Operated by {site.org}.
      </p>
    </main>
  );
}
