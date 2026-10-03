import { envelope, newsRows } from "@/lib/dataset";

export const dynamic = "force-static";

export function GET() {
  return Response.json(envelope("news", newsRows()), {
    headers: { "Content-Disposition": 'inline; filename="peptides-info-news.json"' },
  });
}
