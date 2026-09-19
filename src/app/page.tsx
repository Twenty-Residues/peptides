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
        {site.description} We sell nothing — so we can tell you where the science
        is settled and where the{" "}
        <Link href="/methodology" className="underline underline-offset-4">
          frontier
        </Link>{" "}
        starts.
      </p>

      <h2 className="mt-16 text-sm font-semibold tracking-widest text-neutral-500 uppercase">
        Featured
      </h2>
      <ul className="mt-4 space-y-4">
        {peptides.slice(0, 6).map((p) => (
          <li key={p.slug}>
            <Link
              href={`/peptides/${p.slug}`}
              className="group block rounded-lg py-2"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium group-hover:underline underline-offset-4">
                  {p.name}
                </span>
                <span className="shrink-0 text-sm text-neutral-500">
                  {p.class}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                {p.hook}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/peptides"
        className="mt-6 inline-block text-sm underline underline-offset-4"
      >
        Browse all {peptides.length} peptides →
      </Link>
    </main>
  );
}
