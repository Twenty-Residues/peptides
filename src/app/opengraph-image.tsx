import { ImageResponse } from "next/og";

export const alt = "Peptides.info — peptide information you can trust";
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
          justifyContent: "center",
          background: "#2f1e4e",
          color: "#ffffff",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#ffc107",
          }}
        >
          Peptides.info
        </div>
        <div
          style={{
            fontSize: 76,
            lineHeight: 1.1,
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Peptide information</span>
          <span>you can trust</span>
        </div>
        <div
          style={{
            fontSize: 30,
            marginTop: 32,
            color: "#d9cfe6",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Every claim graded by how well it&apos;s proven. We sell nothing.
        </div>
      </div>
    ),
    { ...size },
  );
}
