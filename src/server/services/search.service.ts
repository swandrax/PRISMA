import prisma from '../db/prisma';
import { maskNIK } from '@/lib/formatting';

export interface GlobalSearchResult {
  category: 'Warga' | 'Surat' | 'Keuangan' | 'Keamanan' | 'Pengumuman';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export async function searchGlobal(query: string, isPrivileged = false): Promise<GlobalSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  const [wargaList, suratList, keuanganList, keamananList, announcementList] = await Promise.all([
    // Warga search
    prisma.warga.findMany({
      where: {
        OR: [
          { nama: { contains: q, mode: 'insensitive' } },
          { nik: { contains: q } },
          { alamat: { contains: q, mode: 'insensitive' } },
          { blok: { equals: q.toUpperCase() } },
        ],
      },
      take: 5,
    }),

    // Surat search
    prisma.surat.findMany({
      where: {
        OR: [
          { nomorSurat: { contains: q, mode: 'insensitive' } },
          { jenisSurat: { contains: q, mode: 'insensitive' } },
          { keperluan: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),

    // Keuangan search
    prisma.keuangan.findMany({
      where: {
        OR: [
          { kodeTransaksi: { contains: q, mode: 'insensitive' } },
          { kategori: { contains: q, mode: 'insensitive' } },
          { keterangan: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),

    // Keamanan search
    prisma.laporanKeamanan.findMany({
      where: {
        OR: [
          { nomorLaporan: { contains: q, mode: 'insensitive' } },
          { judul: { contains: q, mode: 'insensitive' } },
          { deskripsi: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),

    // Announcements search
    prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),
  ]);

  const results: GlobalSearchResult[] = [];

  for (const w of wargaList) {
    results.push({
      category: 'Warga',
      id: w.id,
      title: w.nama,
      subtitle: `Blok ${w.blok}/${w.noRumah} • NIK: ${isPrivileged ? w.nik : maskNIK(w.nik)}`,
      url: `/warga/${w.id}`,
    });
  }

  for (const s of suratList) {
    results.push({
      category: 'Surat',
      id: s.id,
      title: `${s.jenisSurat} (${s.nomorSurat || 'Draft'})`,
      subtitle: `Status: ${s.status} • Keperluan: ${s.keperluan.slice(0, 40)}`,
      url: `/surat/${s.id}`,
    });
  }

  for (const k of keuanganList) {
    results.push({
      category: 'Keuangan',
      id: k.id,
      title: `${k.jenis}: ${k.kategori}`,
      subtitle: `${k.kodeTransaksi || '-'} • ${k.keterangan || '-'}`,
      url: `/keuangan`,
    });
  }

  for (const km of keamananList) {
    results.push({
      category: 'Keamanan',
      id: km.id,
      title: km.judul,
      subtitle: `Urgensi: ${km.tingkatUrgensi} • Status: ${km.status}`,
      url: `/keamanan/${km.id}`,
    });
  }

  for (const a of announcementList) {
    results.push({
      category: 'Pengumuman',
      id: a.id,
      title: a.title,
      subtitle: a.content.slice(0, 50),
      url: `/`,
    });
  }

  return results;
}
