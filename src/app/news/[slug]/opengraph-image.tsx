import { CATEGORY_LABEL, getStory, news, primaryCount, STATUS_LABEL } from "@/lib/news";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Peptides.info news";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) return ogCard({ eyebrow: "News", headline: "Peptides.info", pills: [] });
  const primaries = primaryCount(s);
  return ogCard({
    eyebrow: CATEGORY_LABEL[s.category],
    headline: s.title,
    sub: s.openQuestion,
    pills: [
      {
        color: s.status === "settled" ? "#34d399" : "#fbbf24",
        label: STATUS_LABEL[s.status],
      },
      {
        color: "#38bdf8",
        label: `${primaries} primary ${primaries === 1 ? "record" : "records"}`,
      },
      { color: "#ffc107", label: "No ads · no verdicts" },
    ],
  });
}
