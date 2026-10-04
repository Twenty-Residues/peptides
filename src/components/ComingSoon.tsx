import Link from "next/link";
import { registerCounts } from "@/lib/companies";

/** The veil. Says what is coming without showing a single company. */
export function ComingSoon() {
  const n = registerCounts();
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
        Coming soon
      </p>
      <h1 className="mx-auto mt-5 max-w-2xl text-4xl leading-[1.1] font-medium text-plum sm:text-5xl">
        The company register.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/80">
        Who makes, compounds and sells peptides, and what the public record says
        about each of them. Every status quoted from an FDA letter, a recall
        report, a court filing or a securities filing. No storefront links,
        nothing for sale.
      </p>
      <dl className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {[
          { k: "Companies", v: n.companies },
          { k: "Dated records", v: n.events },
        ].map((s) => (
          <div key={s.k} className="bg-surface px-4 py-4">
            <dt className="text-[11px] font-medium tracking-wide text-muted uppercase">
              {s.k}
            </dt>
            <dd className="mt-0.5 font-serif text-2xl text-plum">{s.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-sm text-muted">
        Until then, the{" "}
        <Link
          href="/news"
          className="font-medium text-plum-500 underline-offset-4 hover:underline"
        >
          news desk
        </Link>{" "}
        covers enforcement as it happens.
      </p>
    </main>
  );
}
