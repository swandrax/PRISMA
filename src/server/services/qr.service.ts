import { Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import crypto from 'crypto';

export interface VerificationResult {
  valid: boolean;
  documentType?: string;
  documentId?: string;
  verifiedAt?: string;
  status?: string;
  publicMetadata?: {
    nama?: string;
    rt?: string;
    rw?: string;
    jenisDokumen?: string;
    tanggalTerbit?: string;
    nomorDokumen?: string;
  };
  error?: string;
}

/**
 * Generate a cryptographically secure verification code
 */
export function generateVerificationCode(prefix = 'VER'): string {
  const randomBytes = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `${prefix}-${randomBytes.slice(0, 4)}-${randomBytes.slice(4, 8)}-${randomBytes.slice(8, 12)}`;
}

/**
 * Register a verifiable document (Resident Card or Surat)
 */
export async function registerDocumentVerification(params: {
  documentType: 'SURAT' | 'KARTU_WARGA';
  documentId: string;
  publicMetadata: {
    nama: string;
    rt: string;
    rw: string;
    jenisDokumen: string;
    tanggalTerbit: string;
    nomorDokumen?: string;
  };
}) {
  const code = generateVerificationCode(params.documentType === 'SURAT' ? 'SRT' : 'KTP');
  const baseUrl = process.env.VITE_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://prisma-rt04.pages.dev';
  const qrCodeData = `${baseUrl}/surat/verify/${code}`;

  const doc = await prisma.documentVerification.create({
    data: {
      documentType: params.documentType,
      documentId: params.documentId,
      verificationCode: code,
      qrCodeData,
      status: 'VALID',
      metadata: (params.publicMetadata || {}) as Prisma.InputJsonValue,
    },
  });

  return doc;
}

/**
 * Public minimal verification check (Strictly zero sensitive data returned)
 */
export async function verifyDocumentCode(code: string): Promise<VerificationResult> {
  const record = await prisma.documentVerification.findUnique({
    where: { verificationCode: code },
  });

  if (!record) {
    return { valid: false, error: 'Dokumen tidak ditemukan atau kode verifikasi tidak valid' };
  }

  if (record.status !== 'VALID') {
    return {
      valid: false,
      status: record.status,
      error: `Dokumen ini sudah ${record.status === 'REVOKED' ? 'dicabut/dibatalkan' : 'kedaluwarsa'}`,
    };
  }

  if (record.expiresAt && new Date() > record.expiresAt) {
    return { valid: false, status: 'EXPIRED', error: 'Masa berlaku dokumen telah habis' };
  }

  return {
    valid: true,
    documentType: record.documentType,
    documentId: record.documentId,
    verifiedAt: new Date().toISOString(),
    status: record.status,
    publicMetadata: record.metadata as VerificationResult['publicMetadata'],
  };
}
