import { recordRows, toCsv } from "@/lib/dataset";
import { registerIsPublic } from "@/lib/register-flag";

export const dynamic = "force-static";

export function GET() {
  if (!registerIsPublic()) return new Response("Not found", { status: 404 });
  return new Response(toCsv(recordRows()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="peptides-info-records.csv"',
    },
  });
}
