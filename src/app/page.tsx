import Link from "next/link";
import { peptides } from "@/lib/peptides";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium tracking-widest text-neutral-500 uppercase">
        {site.org}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        {site.name}
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
        {site.description} Every claim is tiered by the strength of its
        evidence, so you can see where the science is settled and where the{" "}
        <Link href="/methodology" className="underline underline-offset-4">
          frontier
        </Link>{" "}
        begins.
      </p>

      <h2 className="mt-16 text-sm font-semibold tracking-widest text-neutral-500 uppercase">
        Catalog
      </h2>
      <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
        {peptides.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/peptides/${p.slug}`}
              className="flex items-baseline justify-between gap-4 py-4 hover:opacity-70"
            >
              <span className="font-medium">{p.name}</span>
              <span className="text-sm text-neutral-500">{p.class}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/peptides"
        className="mt-6 inline-block text-sm underline underline-offset-4"
      >
        Browse the full catalog →
      </Link>
    </main>
  );
}
