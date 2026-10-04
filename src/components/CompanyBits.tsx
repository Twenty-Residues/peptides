import Link from "next/link";
import {
  EVENT_LABEL,
  KIND_LABEL,
  LABELLING_LABEL,
  STATUS_LABEL,
  STATUS_PLAIN,
  type Company,
  type CompanyEvent,
  type CompanyStatus,
} from "@/lib/companies";

const STATUS_CLASS: Record<CompanyStatus, string> = {
  "active-regulated": "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  "under-enforcement": "bg-rose-50 text-rose-800 ring-rose-600/20",
  "in-litigation": "bg-orange-50 text-orange-800 ring-orange-600/20",
  "recall-on-record": "bg-amber-50 text-amber-800 ring-amber-600/20",
  acquired: "bg-sky-50 text-sky-800 ring-sky-600/20",
  ceased: "bg-neutral-100 text-neutral-700 ring-neutral-500/20",
  unverified: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
};

export function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      title={STATUS_PLAIN[status]}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CompanyRow({ c }: { c: Company }) {
  const last = (c.events ?? []).at(-1);
  return (
    <tr className="group align-top">
      <th
        scope="row"
        className="py-4 pr-4 pl-5 text-left font-normal group-hover:bg-plum-050/60"
      >
        <Link
          href={`/companies/${c.slug}`}
          className="font-serif text-base font-semibold text-plum underline-offset-4 hover:text-plum-500 hover:underline"
        >
          {c.name}
        </Link>
        <span className="mt-0.5 block text-xs text-muted">
          {KIND_LABEL[c.kind]} · {c.jurisdiction}
          {c.labelling ? ` · ${LABELLING_LABEL[c.labelling]}` : ""}
        </span>
      </th>
      <td className="py-4 pr-4 group-hover:bg-plum-050/60">
        <StatusBadge status={c.status} />
      </td>
      <td className="py-4 pr-4 text-sm whitespace-nowrap text-ink/80 group-hover:bg-plum-050/60">
        {last ? (
          <>
            <span className="font-medium text-ink">
              {EVENT_LABEL[last.kind]}
            </span>
            <span className="block text-xs text-muted">
              {fmtDate(last.date)}
            </span>
          </>
        ) : (
          <span className="text-muted">None found</span>
        )}
      </td>
      <td className="min-w-[20rem] py-4 pr-5 text-sm leading-relaxed text-ink/85 group-hover:bg-plum-050/60">
        {c.note}
      </td>
    </tr>
  );
}

export function EventItem({
  e,
  company,
}: {
  e: CompanyEvent;
  company?: Company;
}) {
  return (
    <li className="relative pl-6">
      <span
        aria-hidden
        className="absolute top-2 left-0 size-2.5 rounded-full bg-plum-500 ring-4 ring-background"
      />
      <p className="text-xs text-muted">
        <span className="font-mono">{e.date}</span> ·{" "}
        <span className="font-medium text-plum-500">{EVENT_LABEL[e.kind]}</span>
        {company && (
          <>
            {" · "}
            <Link
              href={`/companies/${company.slug}`}
              className="font-medium text-plum underline-offset-4 hover:underline"
            >
              {company.name}
            </Link>
          </>
        )}
      </p>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink/85">
        {e.summary}
      </p>
      <a
        href={e.source.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-sm font-medium text-plum-500 underline underline-offset-4 hover:text-plum-600"
      >
        {e.source.label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
  );
}
