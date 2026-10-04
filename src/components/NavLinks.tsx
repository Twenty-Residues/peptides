"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/site";

export function NavLinks({
  items,
  className = "",
}: {
  items: readonly NavItem[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${className} text-sm font-medium transition-colors hover:text-plum ${
              active ? "text-plum" : "text-ink/70"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
