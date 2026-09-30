import { ImageResponse } from "next/og";

export const alt = "Peptides.info — every peptide, graded by how well it's proven";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg viewBox="0 0 64 64" width="72" height="72">
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
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -0.5 }}>
            Peptides.info
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.08,
              display: "flex",
              flexDirection: "column",
              maxWidth: 1000,
            }}
          >
            <span>Every peptide, graded</span>
            <div style={{ display: "flex", gap: 22 }}>
              <span>by how well it&apos;s</span>
              <span style={{ color: "#ffc107" }}>proven.</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 30,
              marginTop: 32,
              color: "#d9cfe6",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Every claim tiered and cited to a fixed record. We sell nothing.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontFamily: "Arial, sans-serif",
            fontSize: 22,
          }}
        >
          {[
            ["#34d399", "T1 Established"],
            ["#38bdf8", "T2 Clinical"],
            ["#fbbf24", "T3 Preclinical"],
            ["#a3a3a3", "T4 Emerging"],
          ].map(([c, label]) => (
            <div
              key={label}
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
                  background: c,
                }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
