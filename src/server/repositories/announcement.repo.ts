import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { sendNotification } from '../services/notification.service';
import { logAudit } from '../services/audit.service';

export interface GetAnnouncementsParams {
  audience?: string; // 'ALL', 'RT_WIDE', 'BLOK', 'PENGURUS'
  block?: string;
  limit?: number;
}

export async function getActiveAnnouncements(params: GetAnnouncementsParams = {}) {
  const where: Prisma.AnnouncementWhereInput = {
    status: 'PUBLISHED',
    publishedAt: { lte: new Date() },
  };

  if (params.audience && params.audience !== 'ALL') {
    where.OR = [
      { targetAudience: 'ALL' },
      { targetAudience: params.audience },
      ...(params.block ? [{ targetBlock: params.block }] : []),
    ];
  }

  return await prisma.announcement.findMany({
    where,
    orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    take: params.limit || 20,
  });
}

export async function createAnnouncement(params: {
  title: string;
  content: string;
  targetAudience: 'ALL' | 'RT_WIDE' | 'BLOK' | 'PENGURUS';
  targetBlock?: string;
  channels?: string[];
  isPinned?: boolean;
  scheduledAt?: Date;
  authorId?: string;
}) {
  const isScheduled = params.scheduledAt && params.scheduledAt > new Date();
  const publishedAt = isScheduled ? params.scheduledAt! : new Date();
  const status = isScheduled ? 'DRAFT' : 'PUBLISHED';

  const announcement = await prisma.announcement.create({
    data: {
      title: params.title,
      content: params.content,
      targetAudience: params.targetAudience,
      targetBlock: params.targetBlock,
      channels: params.channels || ['WEB'],
      isPinned: params.isPinned || false,
      status,
      scheduledAt: params.scheduledAt,
      publishedAt,
      authorId: params.authorId,
    },
  });

  await logAudit({
    actorId: params.authorId,
    action: 'CREATE_ANNOUNCEMENT',
    resource: 'Announcement',
    resourceId: announcement.id,
    details: `Pengumuman (${announcement.targetAudience}): ${announcement.title}`,
  });

  if (!isScheduled) {
    await sendNotification({
      type: 'PENGUMUMAN',
      title: `📢 ${announcement.title}`,
      message: announcement.content.slice(0, 150) + (announcement.content.length > 150 ? '...' : ''),
      link: `/`,
      sendTelegram: announcement.channels.includes('TELEGRAM'),
    });
  }

  return announcement;
}
