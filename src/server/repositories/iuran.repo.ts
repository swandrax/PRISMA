import prisma from '../db/prisma';
import { IURAN_CATEGORIES } from '@/lib/constants';
import { logAudit } from '../services/audit.service';
import { sendNotification } from '../services/notification.service';

/**
 * Ensure default contribution categories exist in DB
 */
export async function seedContributionCategories() {
  for (const cat of IURAN_CATEGORIES) {
    const existing = await prisma.contribution.findFirst({
      where: { kategori: cat.id },
    });
    if (!existing) {
      await prisma.contribution.create({
        data: {
          name: cat.label,
          kategori: cat.id,
          amount: cat.defaultAmount,
          periode: 'BULANAN',
          isActive: true,
        },
      });
    }
  }
}

export async function getContributionCategories() {
  await seedContributionCategories();
  return await prisma.contribution.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Generate monthly contribution bills for all active households
 */
export async function generateMonthlyBills(bulan: number, tahun: number) {
  const categories = await getContributionCategories();
  const wargaList = await prisma.warga.findMany({
    where: { status: 'AKTIF' },
  });

  const dueDate = new Date(tahun, bulan - 1, 20); // Due on 20th of the month
  let createdCount = 0;

  for (const w of wargaList) {
    for (const cat of categories) {
      const existing = await prisma.contributionBill.findUnique({
        where: {
          contributionId_wargaId_bulan_tahun: {
            contributionId: cat.id,
            wargaId: w.id,
            bulan,
            tahun,
          },
        },
      });

      if (!existing) {
        await prisma.contributionBill.create({
          data: {
            contributionId: cat.id,
            wargaId: w.id,
            bulan,
            tahun,
            amount: cat.amount,
            status: 'UNPAID',
            dueDate,
          },
        });
        createdCount++;
      }
    }
  }

  return { createdCount, totalWarga: wargaList.length };
}

/**
 * Get bills for a specific resident or household
 */
export async function getResidentBills(wargaId: string) {
  return await prisma.contributionBill.findMany({
    where: { wargaId },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    include: {
      contribution: true,
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });
}

/**
 * Submit payment proof by citizen
 */
export async function submitPaymentProof(params: {
  billId: string;
  amount: number;
  paymentMethod: string;
  buktiBayarUrl: string;
  notes?: string;
  actorId: string;
}) {
  const bill = await prisma.contributionBill.findUnique({
    where: { id: params.billId },
    include: { contribution: true, warga: true },
  });

  if (!bill) throw new Error('Tagihan iuran tidak ditemukan');

  const payment = await prisma.contributionPayment.create({
    data: {
      billId: params.billId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      buktiBayarUrl: params.buktiBayarUrl,
      notes: params.notes,
      status: 'PENDING',
    },
  });

  await logAudit({
    actorId: params.actorId,
    action: 'SUBMIT_IURAN_PAYMENT',
    resource: 'ContributionPayment',
    resourceId: payment.id,
    details: `Upload bukti bayar: ${bill.contribution.name} (${bill.bulan}/${bill.tahun}) oleh ${bill.warga.nama}`,
  });

  await sendNotification({
    type: 'IURAN',
    title: 'Konfirmasi Pembayaran Iuran',
    message: `${bill.warga.nama} mengunggah bukti bayar untuk ${bill.contribution.name} periode ${bill.bulan}/${bill.tahun}`,
    link: '/keuangan/iuran',
    sendTelegram: true,
  });

  return payment;
}

/**
 * Treasurer verifies citizen payment proof
 */
export async function verifyPayment(params: {
  paymentId: string;
  isApproved: boolean;
  verifierName: string;
  notes?: string;
}) {
  const payment = await prisma.contributionPayment.findUnique({
    where: { id: params.paymentId },
    include: {
      bill: {
        include: { contribution: true, warga: true },
      },
    },
  });

  if (!payment) throw new Error('Data pembayaran tidak ditemukan');

  const newStatus = params.isApproved ? 'VERIFIED' : 'REJECTED';

  const updatedPayment = await prisma.contributionPayment.update({
    where: { id: params.paymentId },
    data: {
      status: newStatus,
      verifiedBy: params.verifierName,
      verifiedAt: new Date(),
      notes: params.notes,
    },
  });

  // If verified, update bill to PAID and record in general ledger (Keuangan)
  if (params.isApproved) {
    await prisma.contributionBill.update({
      where: { id: payment.billId },
      data: { status: 'PAID' },
    });

    const kodeTransaksi = `KAS-IN-${Date.now()}`;
    await prisma.keuangan.create({
      data: {
        kodeTransaksi,
        jenis: 'PEMASUKAN',
        kategori: payment.bill.contribution.name,
        jumlah: payment.amount,
        keterangan: `Iuran ${payment.bill.contribution.name} (${payment.bill.bulan}/${payment.bill.tahun}) - ${payment.bill.warga.nama}`,
        buktiBayarUrl: payment.buktiBayarUrl,
        dicatatOleh: params.verifierName,
        tanggal: new Date(),
      },
    });
  }

  // Notify resident
  await sendNotification({
    wargaId: payment.bill.wargaId,
    type: 'IURAN',
    title: `Verifikasi Pembayaran Iuran: ${params.isApproved ? 'Diterima' : 'Ditolak'}`,
    message: `Pembayaran ${payment.bill.contribution.name} periode ${payment.bill.bulan}/${payment.bill.tahun} telah ${params.isApproved ? 'terverifikasi lunas' : 'ditolak'}. ${params.notes ? `Catatan: ${params.notes}` : ''}`,
    link: '/keuangan/iuran',
  });

  return updatedPayment;
}

/**
 * Monthly contribution collection analytics
 */
export async function getContributionSummary(tahun = new Date().getFullYear()) {
  const bills = await prisma.contributionBill.findMany({
    where: { tahun },
    include: { contribution: true },
  });

  const totalBilled = bills.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalCollected = bills
    .filter((b) => b.status === 'PAID')
    .reduce((acc, b) => acc + Number(b.amount), 0);
  const totalUnpaid = bills
    .filter((b) => b.status === 'UNPAID' || b.status === 'OVERDUE')
    .reduce((acc, b) => acc + Number(b.amount), 0);

  return {
    tahun,
    totalBilled,
    totalCollected,
    totalUnpaid,
    collectionRate: totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0,
    billsCount: bills.length,
    paidBillsCount: bills.filter((b) => b.status === 'PAID').length,
  };
}
