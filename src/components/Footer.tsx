import Link from "next/link";
import { editorial, footerNav, primaryNav, site } from "@/lib/site";
import { categories } from "@/lib/categories";
import { LogoMark, Wordmark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-12 text-sm text-muted">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2">
              <LogoMark size={24} />
              <Wordmark className="text-lg" />
            </p>
            <p className="mt-2 max-w-sm leading-relaxed">{site.tagline}</p>
            <p className="mt-4 max-w-sm leading-relaxed">
              A reference for research and education. Nothing here is medical
              advice or an endorsement to use any substance. Many peptides
              discussed are not approved for human use.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
              Browse
            </p>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/peptides?category=${c.slug}`}
                    className="hover:text-plum hover:underline"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-plum-500 uppercase">
              Site
            </p>
            <ul className="mt-3 space-y-2">
              {[
                ...primaryNav(),
                ...footerNav.filter(
                  (f) => !primaryNav().some((n) => n.href === f.href),
                ),
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-plum hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${editorial.contact}`}
                  className="hover:text-plum hover:underline"
                >
                  Report a correction
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs">
          <span>
            © {new Date().getFullYear()} {site.org}. We sell nothing.
          </span>
          <span>Every claim tiered and cited to a fixed record.</span>
        </div>
      </div>
    </footer>
  );
}
