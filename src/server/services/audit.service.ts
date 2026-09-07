import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';

export interface CreateAuditLogParams {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

const REDACTED_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'authorization',
  'pin',
  'cvv',
]);

/**
 * Deep-sanitize metadata objects to remove any sensitive secrets before logging
 */
export function sanitizeAuditMetadata(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeAuditMetadata(item));
  }

  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const lower = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (REDACTED_KEYS.has(lower)) {
      clean[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeAuditMetadata(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Record a production-grade sanitized audit log
 */
export async function logAudit(params: CreateAuditLogParams): Promise<void> {
  try {
    const safeMetadata = params.metadata ? (sanitizeAuditMetadata(params.metadata) as Prisma.InputJsonValue) : undefined;

    await prisma.auditLog.create({
      data: {
        userId: params.actorId || undefined,
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details,
        metadata: safeMetadata,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestId: params.requestId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      },
    });
  } catch (error) {
    // Fail-safe: Never throw unhandled errors that would crash the main request
    console.error('[Audit Log Error]', error);
  }
}
