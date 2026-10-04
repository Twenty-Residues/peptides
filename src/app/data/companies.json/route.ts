import { companyRows, envelope } from "@/lib/dataset";
import { registerIsPublic } from "@/lib/register-flag";

export const dynamic = "force-static";

export function GET() {
  if (!registerIsPublic()) return new Response("Not found", { status: 404 });
  return Response.json(envelope("company register", companyRows()), {
    headers: {
      "Content-Disposition": 'inline; filename="peptides-info-companies.json"',
    },
  });
}
