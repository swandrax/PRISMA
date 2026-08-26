/**
 * PRISMA RT-04 Centralized Audit Logger
 * Records sensitive administrative, security, resident, and financial activities.
 */

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "REGISTER_WARGA"
  | "UPDATE_PROFILE"
  | "DELETE_WARGA"
  | "CREATE_SURAT"
  | "UPDATE_SURAT_STATUS"
  | "CREATE_TRANSACTION"
  | "UPDATE_TRANSACTION"
  | "DELETE_TRANSACTION"
  | "CREATE_SECURITY_REPORT"
  | "UPDATE_SECURITY_REPORT"
  | "ROLE_CHANGE"
  | "RT_CODE_VERIFICATION"
  | "AI_SENSITIVE_QUERY";

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

// In-Memory Audit Log buffer with automatic retention limit
const auditLogStore: AuditLogEntry[] = [];
const MAX_LOG_ENTRIES = 500;

/**
 * Record an audit log entry
 */
export function logAudit(entry: {
  actor: string;
  actorRole?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
}): AuditLogEntry {
  const logRecord: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actor: entry.actor,
    actorRole: entry.actorRole || "WARGA",
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    details: entry.details,
    ipAddress: entry.ipAddress || "127.0.0.1",
    timestamp: new Date().toISOString(),
  };

  auditLogStore.unshift(logRecord);

  // Maintain buffer size
  if (auditLogStore.length > MAX_LOG_ENTRIES) {
    auditLogStore.pop();
  }

  // Safe server console trace
  if (process.env.NODE_ENV !== "test") {
    console.log(`[AUDIT] ${logRecord.timestamp} | ${logRecord.action} | Actor: ${logRecord.actor} | Res: ${logRecord.resource}`);
  }

  return logRecord;
}

/**
 * Retrieve audit logs (for Admin inspection)
 */
export function getAuditLogs(limit: number = 50): AuditLogEntry[] {
  return auditLogStore.slice(0, limit);
}
