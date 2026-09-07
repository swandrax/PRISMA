import prisma from '../db/prisma';

const startTime = Date.now();

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  database: {
    connected: boolean;
    responseTimeMs?: number;
    error?: string;
  };
  storage: {
    configured: boolean;
    region?: string;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
  };
}

export async function getSystemHealth(): Promise<HealthStatus> {
  const startDb = Date.now();
  let dbConnected = false;
  let dbError: string | undefined;
  let dbResponseTimeMs: number | undefined;

  try {
    // Quick query to test connection
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    dbResponseTimeMs = Date.now() - startDb;
  } catch (err) {
    dbConnected = false;
    dbError = err instanceof Error ? err.message : String(err);
  }

  const memoryUsage = process.memoryUsage ? process.memoryUsage() : { heapUsed: 0, heapTotal: 0 };

  const storageConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET);

  const status: 'healthy' | 'degraded' | 'unhealthy' =
    dbConnected && storageConfigured ? 'healthy' : dbConnected ? 'degraded' : 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
    version: '0.2.0-tanstack',
    database: {
      connected: dbConnected,
      responseTimeMs: dbResponseTimeMs,
      error: dbError,
    },
    storage: {
      configured: storageConfigured,
      region: process.env.AWS_REGION || 'ap-southeast-1',
    },
    memory: {
      heapUsedMB: Math.round((memoryUsage.heapUsed / (1024 * 1024)) * 100) / 100,
      heapTotalMB: Math.round((memoryUsage.heapTotal / (1024 * 1024)) * 100) / 100,
    },
  };
}
