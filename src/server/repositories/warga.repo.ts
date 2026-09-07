import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';

export interface GetWargaListParams {
  page?: number;
  limit?: number;
  search?: string;
  blok?: string;
  status?: 'AKTIF' | 'PINDAH' | 'MENINGGAL';
}

export async function getWargaList(params: GetWargaListParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.WargaWhereInput = {};
  if (params.status) {
    where.status = params.status;
  }
  if (params.blok) {
    where.blok = params.blok;
  }
  if (params.search) {
    where.OR = [
      { nama: { contains: params.search, mode: 'insensitive' } },
      { nik: { contains: params.search } },
      { alamat: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.warga.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nama: 'asc' },
      include: {
        residentVerification: true,
        pengurus: true,
      },
    }),
    prisma.warga.count({ where }),
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

export async function getWargaById(id: string) {
  return await prisma.warga.findUnique({
    where: { id },
    include: {
      user: true,
      pengurus: true,
      residentVerification: true,
      suratList: { take: 5, orderBy: { createdAt: 'desc' } },
      laporanList: { take: 5, orderBy: { createdAt: 'desc' } },
      contributionBills: {
        take: 12,
        orderBy: { tahun: 'desc' },
        include: { contribution: true, payments: true },
      },
    },
  });
}

export async function getOrCreateResidentCard(wargaId: string) {
  const warga = await prisma.warga.findUnique({
    where: { id: wargaId },
    include: { residentVerification: true },
  });

  if (!warga) throw new Error('Warga not found');

  if (warga.residentVerification) {
    return {
      warga,
      verification: warga.residentVerification,
    };
  }

  // Create PRISMA ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const prismaId = `PRISMA-${warga.rt}${warga.rw}-${randomSuffix}`;

  const verification = await prisma.residentVerification.create({
    data: {
      wargaId: warga.id,
      prismaId,
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  return {
    warga,
    verification,
  };
}
