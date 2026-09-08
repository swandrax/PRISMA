export interface AuditLogItem {
  id: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string | Date;
}

export * from '@/server/auth/rbac';
