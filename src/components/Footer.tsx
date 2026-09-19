import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-neutral-500">
        <p className="max-w-prose">
          {site.name} is a reference for research and education. Nothing here is
          medical advice or an endorsement to use any substance. Many peptides
          discussed are not approved for human use.
        </p>
        <div className="mt-4 flex gap-6">
          <Link href="/methodology" className="hover:text-neutral-800 dark:hover:text-neutral-300">
            Methodology
          </Link>
          <span>
            © {new Date().getFullYear()} {site.org}
          </span>
        </div>
      </div>
    </footer>
  );
}
