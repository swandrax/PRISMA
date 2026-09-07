import { Prisma, StatusSurat } from '@prisma/client';
import prisma from '../db/prisma';
import { registerDocumentVerification } from '../services/qr.service';
import { sendNotification } from '../services/notification.service';
import { logAudit } from '../services/audit.service';

export interface GetSuratListParams {
  page?: number;
  limit?: number;
  wargaId?: string;
  status?: string;
  search?: string;
}

export async function getSuratList(params: GetSuratListParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.SuratWhereInput = {};
  if (params.wargaId) where.wargaId = params.wargaId;
  if (params.status) where.status = params.status as StatusSurat;
  if (params.search) {
    where.OR = [
      { nomorSurat: { contains: params.search } },
      { jenisSurat: { contains: params.search, mode: 'insensitive' } },
      { keperluan: { contains: params.search, mode: 'insensitive' } },
      { warga: { nama: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.surat.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        warga: true,
        approvals: { orderBy: { createdAt: 'asc' } },
        revisions: { orderBy: { requestedAt: 'desc' } },
      },
    }),
    prisma.surat.count({ where }),
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

export async function getSuratById(id: string) {
  return await prisma.surat.findUnique({
    where: { id },
    include: {
      warga: true,
      approvals: { orderBy: { createdAt: 'asc' } },
      revisions: { orderBy: { requestedAt: 'desc' } },
    },
  });
}

export async function createSurat(params: {
  wargaId: string;
  jenisSurat: string;
  keperluan: string;
  catatan?: string;
  fileDokumenUrl?: string;
}) {
  const countThisYear = await prisma.surat.count();
  const year = new Date().getFullYear();
  const nomorSurat = `SRT/${year}/${String(countThisYear + 1).padStart(4, '0')}`;

  const surat = await prisma.surat.create({
    data: {
      wargaId: params.wargaId,
      nomorSurat,
      jenisSurat: params.jenisSurat,
      keperluan: params.keperluan,
      catatan: params.catatan,
      fileDokumenUrl: params.fileDokumenUrl,
      status: 'SUBMITTED',
    },
    include: { warga: true },
  });

  // Log audit
  await logAudit({
    actorId: params.wargaId,
    action: 'CREATE_SURAT',
    resource: 'Surat',
    resourceId: surat.id,
    details: `Pengajuan surat: ${surat.jenisSurat} (${surat.nomorSurat})`,
  });

  // Notify pengurus
  await sendNotification({
    type: 'SURAT',
    title: 'Pengajuan Surat Baru',
    message: `${surat.warga.nama} mengajukan surat: ${surat.jenisSurat}`,
    link: `/surat/${surat.id}`,
    sendTelegram: true,
  });

  return surat;
}

export async function processSuratStep(params: {
  suratId: string;
  step: 'VERIFICATION' | 'APPROVAL' | 'GENERATING' | 'SIGNING' | 'COMPLETED';
  status: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  approverId: string;
  approverNama: string;
  approverRole: string;
  notes?: string;
}) {
  const surat = await prisma.surat.findUnique({
    where: { id: params.suratId },
    include: { warga: true },
  });

  if (!surat) throw new Error('Surat not found');

  // Record approval step
  await prisma.letterApproval.create({
    data: {
      suratId: params.suratId,
      step: params.step,
      approverId: params.approverId,
      approverNama: params.approverNama,
      approverRole: params.approverRole,
      status: params.status,
      notes: params.notes,
    },
  });

  // Advance lifecycle state
  let nextStatus: StatusSurat = surat.status;
  if (params.status === 'REJECTED') {
    nextStatus = 'DITOLAK';
  } else if (params.status === 'REVISION_REQUESTED') {
    nextStatus = 'REVISI';
    await prisma.letterRevision.create({
      data: {
        suratId: params.suratId,
        requestedBy: params.approverNama,
        reason: params.notes || 'Perlu perbaikan dokumen',
      },
    });
  } else {
    // Approved step progression
    switch (params.step) {
      case 'VERIFICATION':
        nextStatus = 'APPROVAL';
        break;
      case 'APPROVAL':
        nextStatus = 'GENERATING';
        break;
      case 'GENERATING':
        nextStatus = 'SIGNED';
        break;
      case 'SIGNING':
        nextStatus = 'COMPLETED';
        break;
    }
  }

  const updatedSurat = await prisma.surat.update({
    where: { id: params.suratId },
    data: {
      status: nextStatus,
      tanggalSelesai: nextStatus === 'COMPLETED' ? new Date() : undefined,
    },
    include: { warga: true, approvals: true, revisions: true },
  });

  // If completed, register verifiable QR code
  if (nextStatus === 'COMPLETED') {
    await registerDocumentVerification({
      documentType: 'SURAT',
      documentId: updatedSurat.id,
      publicMetadata: {
        nama: updatedSurat.warga.nama,
        rt: updatedSurat.warga.rt,
        rw: updatedSurat.warga.rw,
        jenisDokumen: updatedSurat.jenisSurat,
        tanggalTerbit: new Date().toISOString(),
        nomorDokumen: updatedSurat.nomorSurat || undefined,
      },
    });
  }

  // Notify resident
  await sendNotification({
    wargaId: updatedSurat.wargaId,
    type: 'SURAT',
    title: `Status Surat: ${updatedSurat.jenisSurat}`,
    message: `Surat Anda sekarang berstatus: ${nextStatus}. ${params.notes ? `Catatan: ${params.notes}` : ''}`,
    link: `/surat/${updatedSurat.id}`,
    sendTelegram: true,
  });

  return updatedSurat;
}
