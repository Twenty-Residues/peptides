"use client";

import { useState } from "react";

/**
 * Share without trackers: the Web Share API where it exists, clipboard
 * everywhere else. `text` is the line we want travelling — an open question
 * — so the share carries the question, not just the URL.
 */
export function ShareRow({
  text,
  path,
  label = "Share this question",
}: {
  text: string;
  path: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");
  const url = () => `${window.location.origin}${path}`;

  async function share() {
    const payload = `${text}\n\n${url()}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text: payload, url: url() });
        setState("shared");
        return;
      }
    } catch {
      /* user cancelled; fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(payload);
      setState("copied");
    } catch {
      setState("idle");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-surface/30 px-3 py-1 text-xs font-medium text-surface/90 transition-colors hover:border-gold hover:text-gold"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
      {state === "copied"
        ? "Copied question and link"
        : state === "shared"
          ? "Shared"
          : label}
    </button>
  );
}
