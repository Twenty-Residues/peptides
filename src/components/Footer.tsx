import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted">
        <p className="max-w-prose leading-relaxed">
          {site.name} is a reference for research and education. Nothing here is
          medical advice or an endorsement to use any substance. Many peptides
          discussed are not approved for human use.
        </p>
        <div className="mt-4 flex gap-6">
          <Link
            href="/methodology"
            className="font-medium text-plum-500 hover:underline"
          >
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
