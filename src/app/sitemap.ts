import type { MetadataRoute } from "next";
import { peptides } from "@/lib/peptides";
import { comparisons } from "@/lib/comparisons";
import { news } from "@/lib/news";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/peptides`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/compare`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/news`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/data`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/methodology`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const monographs: MetadataRoute.Sitemap = peptides.map((p) => ({
    url: `${base}/peptides/${p.slug}`,
    lastModified: p.updated ? new Date(p.updated) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const headToHead: MetadataRoute.Sitemap = comparisons.map((c) => ({
    url: `${base}/compare/${c.slug}`,
    lastModified: new Date(c.updated),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const stories: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${base}/news/${n.slug}`,
    lastModified: new Date(n.updated ?? n.published),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...monographs, ...headToHead, ...stories];
}
