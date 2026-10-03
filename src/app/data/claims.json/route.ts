import { claimRows, envelope } from "@/lib/dataset";

export const dynamic = "force-static";

export function GET() {
  return Response.json(envelope("claims", claimRows()), {
    headers: { "Content-Disposition": 'inline; filename="peptides-info-claims.json"' },
  });
}
