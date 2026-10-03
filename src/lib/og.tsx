import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared Open Graph card. The share unit of the site is a single line — a
 * hook, a headline, or an open question — so the card is built around one
 * large line of text, a small eyebrow above it, and a row of facts below.
 */

const font = (file: string) =>
  readFile(join(process.cwd(), "src", "app", "fonts", file));

export const OG_SIZE = { width: 1200, height: 630 };

export type OgPill = { color: string; label: string };

export async function ogCard({
  eyebrow,
  headline,
  sub,
  pills,
}: {
  eyebrow: string;
  headline: string;
  sub?: string;
  pills: OgPill[];
}) {
  const [loraData, interData] = await Promise.all([
    font("Lora-Medium.ttf"),
    font("Inter-Regular.ttf"),
  ]);
  const long = headline.length > 90;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #2f1e4e 0%, #241539 100%)",
          color: "#ffffff",
          padding: "64px 80px",
          fontFamily: "Lora, Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg viewBox="0 0 64 64" width="52" height="52">
              <rect width="64" height="64" rx="14" fill="#ffffff" fillOpacity="0.08" />
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
            <div style={{ fontSize: 30, fontWeight: 600, fontFamily: "Lora" }}>
              Peptides.info
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#ffc107",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: long ? 50 : 62,
              lineHeight: 1.12,
              maxWidth: 1040,
              display: "flex",
            }}
          >
            {headline}
          </div>
          {sub && (
            <div
              style={{
                fontSize: 26,
                marginTop: 24,
                color: "#d9cfe6",
                maxWidth: 1000,
                fontFamily: "Inter, Arial, sans-serif",
                display: "flex",
              }}
            >
              {sub}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 22,
          }}
        >
          {pills.map((p) => (
            <div
              key={p.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 18px",
                borderRadius: 999,
                border: "1.5px solid rgba(255,255,255,0.25)",
                color: "#efe9f5",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: p.color,
                }}
              />
              {p.label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Lora", data: loraData, weight: 500, style: "normal" },
        { name: "Inter", data: interData, weight: 400, style: "normal" },
      ],
    },
  );
}

export const TIER_COLOR: Record<number, string> = {
  1: "#34d399",
  2: "#38bdf8",
  3: "#fbbf24",
  4: "#a3a3a3",
};
