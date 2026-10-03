/** The brand mark: three residues in a chain, the middle one gold. */
export function LogoMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="64" height="64" rx="14" fill="#2f1e4e" />
      <path
        d="M14 38 L32 26 L50 38"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="38" r="8" fill="#ffffff" />
      <circle cx="32" cy="26" r="9" fill="#ffc107" />
      <circle cx="50" cy="38" r="8" fill="#ffffff" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-serif font-semibold tracking-tight text-plum ${className}`}
    >
      Peptides<span className="text-plum-500">.</span>info
    </span>
  );
}
