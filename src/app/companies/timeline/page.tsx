import type { Metadata } from "next";
import Link from "next/link";
import {
  EVENT_LABEL,
  timeline,
  timelineByYear,
  type EventKind,
} from "@/lib/companies";
import { RecordChart } from "@/components/RecordChart";
import { EventItem } from "@/components/CompanyBits";
import { registerIsVisible } from "@/lib/veil";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Enforcement timeline",
  description:
    "Every dated public record in the company register, newest first: warning letters, recalls, lawsuits, approvals, acquisitions.",
  alternates: { canonical: "/companies/timeline" },
};

export default async function TimelinePage() {
  if (!(await registerIsVisible())) return <ComingSoon />;
  const entries = timeline();
  const byYear = new Map<string, typeof entries>();
  for (const e of entries) {
    const y = e.date.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), e]);
  }
  const counts = entries.reduce<Partial<Record<EventKind, number>>>(
    (acc, e) => {
      acc[e.kind] = (acc[e.kind] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/companies" className="hover:text-plum hover:underline">
          Companies
        </Link>{" "}
        / Timeline
      </nav>
      <h1 className="mt-4 text-4xl font-medium text-plum">
        The record, in order
      </h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/75">
        {entries.length} dated records across the register, newest first. Read
        it top to bottom and the industry&apos;s story tells itself: a decade of
        compounded sermorelin recalls, then GLP-1s, then the research-use
        sellers.
      </p>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {(Object.keys(counts) as EventKind[]).map((k) => (
          <span key={k}>
            <span className="font-medium text-ink">{counts[k]}</span>{" "}
            {EVENT_LABEL[k].toLowerCase()}
            {counts[k]! > 1 ? "s" : ""}
          </span>
        ))}
      </p>

      <div className="mt-8">
        <RecordChart rows={timelineByYear()} />
      </div>

      {[...byYear.entries()].map(([year, es]) => (
        <section key={year} id={`y${year}`} className="mt-12 scroll-mt-24">
          <h2 className="border-b border-line pb-2 font-serif text-2xl font-medium text-plum">
            {year}
            <span className="ml-3 font-sans text-sm font-normal text-muted">
              {es.length} {es.length === 1 ? "record" : "records"}
            </span>
          </h2>
          <ol className="mt-6 space-y-6 border-l border-line pl-1">
            {es.map((e, i) => (
              <EventItem key={i} e={e} company={e.company} />
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
