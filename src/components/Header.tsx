import Link from "next/link";
import { nav, site } from "@/lib/site";
import { NavLinks } from "./NavLinks";
import { LogoMark, Wordmark } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          className="flex items-center gap-2.5"
        >
          <LogoMark size={30} />
          <Wordmark className="text-xl" />
        </Link>

        {/* Desktop */}
        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          <NavLinks />
          <Link
            href="/peptides"
            className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-plum transition-colors hover:bg-gold-600"
          >
            Browse catalog
          </Link>
        </nav>

        {/* Mobile — a native <details> so it works with JS disabled */}
        <details className="menu-toggle relative sm:hidden">
          <summary
            className="grid size-10 cursor-pointer place-items-center rounded-lg text-plum hover:bg-plum-050"
            aria-label="Menu"
          >
            <svg
              className="icon-open"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg
              className="icon-close"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </summary>
          <nav
            aria-label="Primary"
            className="absolute right-0 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-line bg-surface p-2 shadow-lg"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-plum-050 hover:text-plum"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/peptides"
              className="mt-1 rounded-full bg-gold px-3 py-2 text-center text-sm font-semibold text-plum hover:bg-gold-600"
            >
              Browse catalog
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
