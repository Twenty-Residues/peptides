import { claimRows, toCsv } from "@/lib/dataset";

export const dynamic = "force-static";

export function GET() {
  return new Response(toCsv(claimRows()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="peptides-info-claims.csv"',
    },
  });
}
