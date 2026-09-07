/**
 * Format a number into Indonesian Rupiah (IDR)
 */
export function formatCurrencyIDR(amount: number | string | bigint | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rp 0';
  const numeric = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(numeric)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Format date to Indonesian human-readable format
 */
export function formatDateID(date: Date | string | null | undefined, includeTime = false): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };
  return new Intl.DateTimeFormat('id-ID', options).format(d);
}

/**
 * Mask National Identification Number (NIK) for public/safe views
 * e.g., 3171012345670001 -> 3171************
 */
export function maskNIK(nik: string | null | undefined): string {
  if (!nik) return '****************';
  const clean = nik.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return clean.slice(0, 4) + '*'.repeat(Math.max(0, clean.length - 4));
}

/**
 * Mask Family Card Number (No KK)
 */
export function maskNoKK(noKK: string | null | undefined): string {
  if (!noKK) return '****************';
  const clean = noKK.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return clean.slice(0, 4) + '*'.repeat(Math.max(0, clean.length - 4));
}

/**
 * Mask Phone Number
 * e.g. 08123456789 -> 0812****789
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 6) return clean;
  return clean.slice(0, 4) + '****' + clean.slice(-3);
}
