import { db } from '@/server/db';

type HealthStatus = { status: 'ok'; database: 'ready' } | { status: 'unavailable'; database: 'unavailable' };

export async function getHealthStatus(ping: () => Promise<unknown> = () => db.$queryRawUnsafe('SELECT 1 AS connected')): Promise<HealthStatus> {
  try {
    await ping();
    return { status: 'ok', database: 'ready' };
  } catch {
    return { status: 'unavailable', database: 'unavailable' };
  }
}

export async function GET() {
  const health = await getHealthStatus();
  if (health.status === 'ok') {
    return Response.json(
      health,
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return Response.json(
    health,
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
