import { Prisma, AspirationCategory, AspirationStatus } from '@prisma/client';
import prisma from '../db/prisma';
import { logAudit } from '../services/audit.service';
import { sendNotification } from '../services/notification.service';

export interface GetAspirationsParams {
  page?: number;
  limit?: number;
  kategori?: AspirationCategory;
  status?: AspirationStatus;
}

export async function getAspirationsList(params: GetAspirationsParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.AspirationWhereInput = {};
  if (params.kategori) where.kategori = params.kategori;
  if (params.status) where.status = params.status;

  const [items, total] = await Promise.all([
    prisma.aspiration.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        pelapor: {
          select: { id: true, nama: true, blok: true, noRumah: true },
        },
      },
    }),
    prisma.aspiration.count({ where }),
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

export async function createAspiration(params: {
  pelaporId: string;
  judul: string;
  deskripsi: string;
  kategori: AspirationCategory;
  tingkatUrgensi: string;
  fotoLampiranUrl?: string;
}) {
  const count = await prisma.aspiration.count();
  const year = new Date().getFullYear();
  const nomorTiket = `ASP/${year}/${String(count + 1).padStart(4, '0')}`;

  const item = await prisma.aspiration.create({
    data: {
      pelaporId: params.pelaporId,
      nomorTiket,
      judul: params.judul,
      deskripsi: params.deskripsi,
      kategori: params.kategori,
      tingkatUrgensi: params.tingkatUrgensi,
      fotoLampiranUrl: params.fotoLampiranUrl,
      status: 'SUBMITTED',
    },
    include: { pelapor: true },
  });

  await logAudit({
    actorId: params.pelaporId,
    action: 'CREATE_ASPIRATION',
    resource: 'Aspiration',
    resourceId: item.id,
    details: `Aspirasi [${item.kategori}]: ${item.judul} (${item.nomorTiket})`,
  });

  await sendNotification({
    type: 'SISTEM',
    title: 'Aspirasi Warga Baru',
    message: `${item.pelapor.nama} menyampaikan aspirasi: ${item.judul} (${item.kategori})`,
    link: `/layanan/aspirasi`,
    sendTelegram: true,
  });

  return item;
}

export async function updateAspirationStatus(params: {
  id: string;
  status: 'SUBMITTED' | 'REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  resolutionNotes?: string;
  rating?: number;
}) {
  const updated = await prisma.aspiration.update({
    where: { id: params.id },
    data: {
      status: params.status,
      assignedTo: params.assignedTo,
      resolutionNotes: params.resolutionNotes,
      rating: params.rating,
    },
    include: { pelapor: true },
  });

  await sendNotification({
    wargaId: updated.pelaporId,
    type: 'SISTEM',
    title: `Status Aspirasi: ${updated.status}`,
    message: `Aspirasi "${updated.judul}" sekarang berstatus: ${updated.status}.${updated.resolutionNotes ? ` Catatan: ${updated.resolutionNotes}` : ''}`,
    link: `/layanan/aspirasi`,
  });

  return updated;
}
