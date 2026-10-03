import Link from "next/link";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  primaryCount,
  type NewsStory,
} from "@/lib/news";

export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function StatusPill({ status }: { status: NewsStory["status"] }) {
  const cls =
    status === "developing"
      ? "bg-amber-50 text-amber-800 ring-amber-600/20"
      : status === "updated"
        ? "bg-sky-50 text-sky-800 ring-sky-600/20"
        : "bg-emerald-50 text-emerald-800 ring-emerald-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function NewsCard({ story }: { story: NewsStory }) {
  const primaries = primaryCount(story);
  return (
    <Link
      href={`/news/${story.slug}`}
      className="group block rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-semibold tracking-widest text-plum-500 uppercase">
          {CATEGORY_LABEL[story.category]}
        </span>
        <span className="text-muted">{fmtDate(story.updated ?? story.published)}</span>
        <StatusPill status={story.status} />
      </div>
      <h3 className="mt-2 font-serif text-xl leading-snug font-semibold text-plum group-hover:text-plum-500">
        {story.title}
      </h3>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink/75">
        {story.dek}
      </p>
      <p className="mt-3 text-xs text-muted">
        {primaries} primary {primaries === 1 ? "record" : "records"} ·{" "}
        {story.sources.length - primaries} secondary
      </p>
    </Link>
  );
}
