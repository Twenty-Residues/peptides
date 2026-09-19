import Link from "next/link";
import { nav, site } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          {site.name}
        </Link>
        <nav className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
