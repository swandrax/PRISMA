import { describe, it, expect } from 'vitest';
import { sanitizeAuditMetadata } from './audit.service';
import { generateVerificationCode } from './qr.service';
import { generateCSV } from './export.service';
import { maskNIK, maskNoKK, formatCurrencyIDR, formatDateID } from '@/lib/formatting';

describe('Audit, QR, Formatting & Export Services', () => {
  it('sanitizeAuditMetadata should redact sensitive keys and nested tokens', () => {
    const rawPayload = {
      email: 'user@prisma.id',
      password: 'SuperSecretPassword123!',
      apiKey: 'sk_live_1234567890',
      nested: {
        accessToken: 'bearer_token_xyz',
        publicNote: 'Catatan pengajuan warga',
      },
    };

    const sanitized = sanitizeAuditMetadata(rawPayload) as typeof rawPayload;

    expect(sanitized.email).toBe('user@prisma.id');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.nested.accessToken).toBe('[REDACTED]');
    expect(sanitized.nested.publicNote).toBe('Catatan pengajuan warga');
  });

  it('generateVerificationCode should generate correctly formatted verification codes', () => {
    const code = generateVerificationCode('SRT');
    expect(code).toMatch(/^SRT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('masking helpers should properly protect NIK and No KK', () => {
    expect(maskNIK('3171012345670001')).toBe('3171************');
    expect(maskNoKK('3171019876540002')).toBe('3171************');
  });

  it('currency and date formatters should produce Indonesian localized output', () => {
    expect(formatCurrencyIDR(50000)).toMatch(/Rp\s*50\.000/);
    const dateStr = formatDateID('2026-08-17');
    expect(dateStr).toContain('Agustus');
    expect(dateStr).toContain('2026');
  });

  it('generateCSV should properly quote and escape cells containing commas and quotes', () => {
    const data = [
      { name: 'Budi, S.Kom', notes: 'Menyatakan "Setuju"' },
      { name: 'Siti Aminah', notes: 'Reguler' },
    ];

    const csv = generateCSV(data, [
      { header: 'Nama', accessor: (r) => r.name },
      { header: 'Catatan', accessor: (r) => r.notes },
    ]);

    expect(csv).toContain('"Budi, S.Kom"');
    expect(csv).toContain('"Menyatakan ""Setuju"""');
    expect(csv).toContain('Siti Aminah');
  });
});
