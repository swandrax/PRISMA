import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  actorEmail?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getAuditLogs(params: GetAuditLogsParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};
  if (params.action) where.action = params.action;
  if (params.resource) where.resource = params.resource;
  if (params.actorEmail) where.actorEmail = { contains: params.actorEmail, mode: 'insensitive' };
  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) where.createdAt.gte = params.startDate;
    if (params.endDate) where.createdAt.lte = params.endDate;
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
