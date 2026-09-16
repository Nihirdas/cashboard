// Net-worth projection as JSON. Query: start, monthly, return, years, startYear
// (all optional — see PROJECTION_DEFAULTS / PROJECTION_BOUNDS). The maths and
// validation live in lib/projections so they're unit-tested independently.

import { parseProjectionQuery, projectionResult } from "@/lib/projections";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseProjectionQuery(searchParams);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  return Response.json(projectionResult(parsed.input));
}
