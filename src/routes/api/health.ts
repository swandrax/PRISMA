import { getSystemHealth } from '@/server/services/health.service';

export async function GET() {
  try {
    const health = await getSystemHealth();
    return new Response(JSON.stringify(health, null, 2), {
      status: health.status === 'unhealthy' ? 503 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
