import { editorial, site } from "@/lib/site";

/**
 * The reader's way in. Two paths, no backend: email (lowest friction) and a
 * public GitHub issue (the open record). Both land in the same editorial queue.
 */
export function ProposeQuestion({
  subject,
  kind = "question",
}: {
  subject: string;
  kind?: "question" | "correction" | "tip";
}) {
  const label =
    kind === "correction"
      ? "Report a correction"
      : kind === "tip"
        ? "Send a news tip"
        : "Propose a question";
  const to = kind === "correction" ? editorial.contact : editorial.questions;
  const template =
    kind === "correction"
      ? "correction.yml"
      : kind === "tip"
        ? "news-tip.yml"
        : "open-question.yml";
  const mail = `mailto:${to}?subject=${encodeURIComponent(`[${kind}] ${subject}`)}`;
  const issue = `${site.repo}/issues/new?template=${template}&title=${encodeURIComponent(`[${kind}] ${subject}`)}`;

  return (
    <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
      <a
        href={mail}
        className="font-medium text-plum-500 underline-offset-4 hover:underline"
      >
        {label} by email
      </a>
      <span aria-hidden>·</span>
      <a
        href={issue}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-plum-500 underline-offset-4 hover:underline"
      >
        or on the public record
      </a>
    </p>
  );
}
