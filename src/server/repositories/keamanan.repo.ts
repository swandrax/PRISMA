import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { logAudit } from '../services/audit.service';
import { sendNotification } from '../services/notification.service';

export interface GetKeamananListParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'DIPROSES' | 'SELESAI';
  urgensi?: string;
}

export async function getKeamananList(params: GetKeamananListParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.LaporanKeamananWhereInput = {};
  if (params.status) where.status = params.status;
  if (params.urgensi) where.tingkatUrgensi = params.urgensi;

  const [items, total] = await Promise.all([
    prisma.laporanKeamanan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { tanggal: 'desc' },
      include: {
        pelapor: {
          select: { id: true, nama: true, blok: true, noRumah: true, telepon: true },
        },
      },
    }),
    prisma.laporanKeamanan.count({ where }),
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

export async function createLaporanKeamanan(params: {
  pelaporId: string;
  judul: string;
  deskripsi: string;
  lokasi?: string;
  tingkatUrgensi: string;
  fotoBuktiUrl?: string;
}) {
  const count = await prisma.laporanKeamanan.count();
  const year = new Date().getFullYear();
  const nomorLaporan = `SEC/${year}/${String(count + 1).padStart(4, '0')}`;

  const laporan = await prisma.laporanKeamanan.create({
    data: {
      pelaporId: params.pelaporId,
      nomorLaporan,
      judul: params.judul,
      deskripsi: params.deskripsi,
      lokasi: params.lokasi,
      tingkatUrgensi: params.tingkatUrgensi,
      fotoBuktiUrl: params.fotoBuktiUrl,
      status: 'PENDING',
    },
    include: { pelapor: true },
  });

  await logAudit({
    actorId: params.pelaporId,
    action: 'CREATE_SECURITY_REPORT',
    resource: 'LaporanKeamanan',
    resourceId: laporan.id,
    details: `Laporan Keamanan [${laporan.tingkatUrgensi}]: ${laporan.judul} (${laporan.nomorLaporan})`,
  });

  await sendNotification({
    type: 'KEAMANAN',
    title: `🚨 Laporan Keamanan (${laporan.tingkatUrgensi})`,
    message: `${laporan.judul} di ${laporan.lokasi || 'lingkungan RT'}. Pelapor: ${laporan.pelapor.nama}`,
    link: `/keamanan/${laporan.id}`,
    sendTelegram: true,
  });

  return laporan;
}

export async function updateStatusKeamanan(params: {
  id: string;
  status: 'PENDING' | 'DIPROSES' | 'SELESAI';
  tindakan?: string;
  officerName: string;
}) {
  const updated = await prisma.laporanKeamanan.update({
    where: { id: params.id },
    data: {
      status: params.status,
      tindakan: params.tindakan,
    },
    include: { pelapor: true },
  });

  await logAudit({
    action: 'UPDATE_SECURITY_REPORT_STATUS',
    resource: 'LaporanKeamanan',
    resourceId: updated.id,
    details: `Status laporan diubah ke ${params.status} oleh ${params.officerName}. Tindakan: ${params.tindakan || '-'}`,
  });

  await sendNotification({
    wargaId: updated.pelaporId,
    type: 'KEAMANAN',
    title: `Update Laporan Keamanan: ${updated.status}`,
    message: `Laporan "${updated.judul}" telah diperbarui. Tindakan: ${params.tindakan || 'Sedang ditangani oleh petugas keamanan RT.'}`,
    link: `/keamanan/${updated.id}`,
  });

  return updated;
}
