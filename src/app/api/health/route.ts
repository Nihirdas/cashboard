// Liveness check — cheap endpoint for smoke tests and uptime pings.

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ status: "ok", asOf: new Date().toISOString() });
}
