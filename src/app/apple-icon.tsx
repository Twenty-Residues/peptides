import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon: the mark on a full-bleed plum tile (iOS rounds it). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2f1e4e",
        }}
      >
        <svg viewBox="0 0 64 64" width="150" height="150">
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
      </div>
    ),
    size,
  );
}
