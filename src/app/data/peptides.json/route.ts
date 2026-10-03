import { envelope, peptideRows } from "@/lib/dataset";

export const dynamic = "force-static";

export function GET() {
  return Response.json(envelope("monographs", peptideRows()), {
    headers: { "Content-Disposition": 'inline; filename="peptides-info-monographs.json"' },
  });
}
