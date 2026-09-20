import Link from "next/link";
import { nav, site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-plum"
        >
          {site.name}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden text-sm font-medium text-ink/70 transition-colors hover:text-plum sm:inline"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/peptides"
            className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-plum-500 transition-colors hover:bg-gold-600"
          >
            Browse catalog
          </Link>
        </nav>
      </div>
    </header>
  );
}
