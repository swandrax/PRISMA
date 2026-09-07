import { z } from 'zod';

// ==========================================
// Authentication Schemas
// ==========================================
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  rt: z.string().default('04'),
  rw: z.string().default('09'),
  telepon: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});
export type RegisterInput = z.infer<typeof registerSchema>;

// ==========================================
// Warga (Resident) Schemas
// ==========================================
export const wargaFormSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus angka'),
  noKK: z.string().length(16, 'Nomor KK harus 16 digit').regex(/^\d+$/, 'No KK harus angka').optional().or(z.literal('')),
  nama: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  jenisKelamin: z.enum(['L', 'P']),
  tempatLahir: z.string().min(2, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(4, 'Tanggal lahir wajib diisi'),
  agama: z.string().default('Islam'),
  pendidikan: z.string().optional(),
  pekerjaan: z.string().optional(),
  statusPernikahan: z.string().default('Menikah'),
  statusKeluarga: z.string().default('Kepala Keluarga'),
  alamat: z.string().min(5, 'Alamat wajib diisi'),
  blok: z.string().min(1, 'Blok rumah wajib diisi'),
  noRumah: z.string().min(1, 'Nomor rumah wajib diisi'),
  rt: z.string().default('04'),
  rw: z.string().default('09'),
  telepon: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  status: z.enum(['AKTIF', 'PINDAH', 'MENINGGAL']).default('AKTIF'),
});
export type WargaFormInput = z.infer<typeof wargaFormSchema>;

// ==========================================
// Surat (Letter) Schemas
// ==========================================
export const suratFormSchema = z.object({
  jenisSurat: z.enum([
    'Keterangan Domisili',
    'Keterangan Pengantar SKCK',
    'Keterangan Usaha (SKU)',
    'Keterangan Kematian',
    'Keterangan Tidak Mampu (SKTM)',
    'Keterangan Belum Menikah',
    'Keterangan Lainnya',
  ]),
  keperluan: z.string().min(5, 'Keperluan pengajuan surat minimal 5 karakter'),
  catatan: z.string().optional(),
  fileDokumenUrl: z.string().url('URL dokumen tidak valid').optional().or(z.literal('')),
});
export type SuratFormInput = z.infer<typeof suratFormSchema>;

export const letterApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUESTED']),
  notes: z.string().optional(),
});
export type LetterApprovalInput = z.infer<typeof letterApprovalSchema>;

// ==========================================
// Keamanan (Security Incident) Schemas
// ==========================================
export const laporanKeamananSchema = z.object({
  judul: z.string().min(5, 'Judul laporan minimal 5 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi kejadian minimal 10 karakter'),
  lokasi: z.string().min(3, 'Lokasi kejadian wajib diisi'),
  tingkatUrgensi: z.enum(['RENDAH', 'SEDANG', 'TINGGI', 'DARURAT']).default('SEDANG'),
  fotoBuktiUrl: z.string().url().optional().or(z.literal('')),
});
export type LaporanKeamananInput = z.infer<typeof laporanKeamananSchema>;

// ==========================================
// Aspirasi & Keluhan Warga Schemas
// ==========================================
export const aspirasiFormSchema = z.object({
  judul: z.string().min(5, 'Judul aspirasi/keluhan minimal 5 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi aspirasi minimal 10 karakter'),
  kategori: z.enum(['KEAMANAN', 'KEBERSIHAN', 'INFRASTRUKTUR', 'ADMINISTRASI', 'SOSIAL', 'UMUM']),
  tingkatUrgensi: z.enum(['RENDAH', 'SEDANG', 'TINGGI']).default('SEDANG'),
  fotoLampiranUrl: z.string().url().optional().or(z.literal('')),
});
export type AspirasiFormInput = z.infer<typeof aspirasiFormSchema>;

// ==========================================
// Iuran & Pembayaran Schemas
// ==========================================
export const paymentProofSchema = z.object({
  billId: z.string().uuid(),
  amount: z.number().positive('Jumlah bayar harus lebih dari 0'),
  paymentMethod: z.enum(['TRANSFER_BANK', 'QRIS', 'TUNAI']).default('TRANSFER_BANK'),
  buktiBayarUrl: z.string().url('URL bukti pembayaran tidak valid'),
  notes: z.string().optional(),
});
export type PaymentProofInput = z.infer<typeof paymentProofSchema>;

// ==========================================
// Pengumuman Schemas
// ==========================================
export const announcementSchema = z.object({
  title: z.string().min(5, 'Judul pengumuman minimal 5 karakter'),
  content: z.string().min(15, 'Isi pengumuman minimal 15 karakter'),
  targetAudience: z.enum(['ALL', 'RT_WIDE', 'BLOK', 'PENGURUS']).default('ALL'),
  targetBlock: z.string().optional(),
  channels: z.array(z.string()).default(['WEB']),
  isPinned: z.boolean().default(false),
  scheduledAt: z.string().optional(),
});
export type AnnouncementInput = z.infer<typeof announcementSchema>;

// ==========================================
// Typed Route Search Parameters Schemas
// ==========================================
export const tableSearchSchema = z.object({
  page: z.preprocess((val) => {
    if (val === undefined) return 1;
    const num = Number(val);
    return isNaN(num) || num < 1 ? 1 : num;
  }, z.number().int().positive()).catch(1).default(1),
  limit: z.preprocess((val) => {
    if (val === undefined) return 10;
    const num = Number(val);
    return isNaN(num) || num < 1 || num > 100 ? 10 : num;
  }, z.number().int().positive().max(100)).catch(10).default(10),
  search: z.string().optional().catch(''),
  sortBy: z.string().optional().catch('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).catch('desc').default('desc'),
  filter: z.string().optional().catch(''),
});
export type TableSearchInput = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: string;
};



