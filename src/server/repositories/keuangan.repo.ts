import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';

export interface GetKeuanganParams {
  page?: number;
  limit?: number;
  jenis?: 'PEMASUKAN' | 'PENGELUARAN';
  kategori?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getKeuanganList(params: GetKeuanganParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 15));
  const skip = (page - 1) * limit;

  const where: Prisma.KeuanganWhereInput = {};
  if (params.jenis) where.jenis = params.jenis;
  if (params.kategori) where.kategori = params.kategori;
  if (params.startDate || params.endDate) {
    where.tanggal = {};
    if (params.startDate) where.tanggal.gte = params.startDate;
    if (params.endDate) where.tanggal.lte = params.endDate;
  }

  const [items, total] = await Promise.all([
    prisma.keuangan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { tanggal: 'desc' },
    }),
    prisma.keuangan.count({ where }),
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

/**
 * Total summary & balance calculation
 */
export async function getKeuanganSummary() {
  const transactions = await prisma.keuangan.findMany({
    select: { jenis: true, jumlah: true, kategori: true, tanggal: true },
  });

  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  const categoryBreakdown: Record<string, number> = {};

  for (const t of transactions) {
    const amt = Number(t.jumlah);
    if (t.jenis === 'PEMASUKAN') {
      totalPemasukan += amt;
    } else {
      totalPengeluaran += amt;
    }

    categoryBreakdown[t.kategori] = (categoryBreakdown[t.kategori] || 0) + amt;
  }

  const saldo = totalPemasukan - totalPengeluaran;

  return {
    totalPemasukan,
    totalPengeluaran,
    saldo,
    categoryBreakdown,
    totalTransaksi: transactions.length,
  };
}

/**
 * Public safe transparency summary (No personal resident data or bank accounts exposed)
 */
export async function getPublicTransparencyData() {
  const summary = await getKeuanganSummary();

  // Get aggregated monthly trend
  const allTx = await prisma.keuangan.findMany({
    select: { jenis: true, jumlah: true, tanggal: true },
    orderBy: { tanggal: 'asc' },
  });

  const monthlyMap: Record<string, { bulan: string; pemasukan: number; pengeluaran: number }> = {};
  for (const tx of allTx) {
    const d = new Date(tx.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        bulan: key,
        pemasukan: 0,
        pengeluaran: 0,
      };
    }
    const amt = Number(tx.jumlah);
    if (tx.jenis === 'PEMASUKAN') {
      monthlyMap[key].pemasukan += amt;
    } else {
      monthlyMap[key].pengeluaran += amt;
    }
  }

  const monthlyTrends = Object.values(monthlyMap);

  return {
    summary: {
      totalPemasukan: summary.totalPemasukan,
      totalPengeluaran: summary.totalPengeluaran,
      saldoKas: summary.saldo,
      totalTransaksi: summary.totalTransaksi,
    },
    categoryBreakdown: summary.categoryBreakdown,
    monthlyTrends,
  };
}
