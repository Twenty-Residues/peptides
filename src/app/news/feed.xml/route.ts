import { sortedNews, CATEGORY_LABEL } from "@/lib/news";
import { site } from "@/lib/site";

export const dynamic = "force-static";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const items = sortedNews()
    .map((s) => {
      const url = `${site.url}/news/${s.slug}`;
      const body = [
        `<p>${esc(s.dek)}</p>`,
        `<h3>What the record establishes</h3><ul>${s.documented.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>`,
        `<h3>What it does not establish</h3><ul>${s.notEstablished.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>`,
        `<h3>What would change this</h3><p>${esc(s.wouldChange)}</p>`,
        `<h3>The open question</h3><p>${esc(s.openQuestion)}</p>`,
      ].join("");
      return `
    <item>
      <title>${esc(s.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(s.published + "T12:00:00Z").toUTCString()}</pubDate>
      <category>${esc(CATEGORY_LABEL[s.category])}</category>
      <description>${esc(s.dek)}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(site.name)} — News</title>
    <link>${site.url}/news</link>
    <atom:link href="${site.url}/news/feed.xml" rel="self" type="application/rss+xml" />
    <description>Peptide news held to the record: what's documented, what isn't, and what would change it.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
