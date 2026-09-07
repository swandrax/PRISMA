import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  wargaFormSchema,
  suratFormSchema,
  laporanKeamananSchema,
  aspirasiFormSchema,
  paymentProofSchema,
  announcementSchema,
  tableSearchSchema,
} from './validation';

describe('Validation Schemas (Zod)', () => {
  it('should validate valid login credentials', () => {
    const valid = loginSchema.safeParse({
      email: 'warga@prisma.id',
      password: 'password123',
    });
    expect(valid.success).toBe(true);
  });

  it('should reject invalid email in login', () => {
    const invalid = loginSchema.safeParse({
      email: 'notanemail',
      password: '123',
    });
    expect(invalid.success).toBe(false);
  });

  it('should validate resident registration with matching passwords', () => {
    const valid = registerSchema.safeParse({
      email: 'budi@prisma.id',
      password: 'securePassword1',
      confirmPassword: 'securePassword1',
      nik: '3171012345670001',
      nama: 'Budi Santoso',
      rt: '04',
      rw: '09',
    });
    expect(valid.success).toBe(true);
  });

  it('should reject registration when passwords do not match', () => {
    const invalid = registerSchema.safeParse({
      email: 'budi@prisma.id',
      password: 'securePassword1',
      confirmPassword: 'differentPassword',
      nik: '3171012345670001',
      nama: 'Budi Santoso',
      rt: '04',
      rw: '09',
    });
    expect(invalid.success).toBe(false);
  });

  it('should validate letter request form', () => {
    const valid = suratFormSchema.safeParse({
      jenisSurat: 'Keterangan Domisili',
      keperluan: 'Pembukaan rekening bank untuk usaha',
    });
    expect(valid.success).toBe(true);
  });

  it('should validate incident security report', () => {
    const valid = laporanKeamananSchema.safeParse({
      judul: 'Penerangan jalan padam',
      deskripsi: 'Lampu penerangan di ujung gang Blok B mati sejak malam lalu',
      lokasi: 'Blok B Gang 2',
      tingkatUrgensi: 'SEDANG',
    });
    expect(valid.success).toBe(true);
  });

  it('should validate community aspiration form', () => {
    const valid = aspirasiFormSchema.safeParse({
      judul: 'Pilah sampah organik',
      deskripsi: 'Usulan penyediaan kantong sampah khusus organik per rumah tangga',
      kategori: 'KEBERSIHAN',
      tingkatUrgensi: 'SEDANG',
    });
    expect(valid.success).toBe(true);
  });

  it('should validate payment proof submission', () => {
    const valid = paymentProofSchema.safeParse({
      billId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 50000,
      paymentMethod: 'TRANSFER_BANK',
      buktiBayarUrl: 'https://prisma-s3.amazonaws.com/receipt.jpg',
    });
    expect(valid.success).toBe(true);
  });

  it('should parse and sanitize table search params with fallback defaults', () => {
    const parsed = tableSearchSchema.parse({
      page: -5, // Invalid negative page should fallback
      limit: 200, // Excessive limit should be clamped
    });
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(10);
    expect(parsed.sortOrder).toBe('desc');
  });
});
