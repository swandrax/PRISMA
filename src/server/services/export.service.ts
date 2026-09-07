import { formatCurrencyIDR, formatDateID, maskNIK } from '@/lib/formatting';

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

/**
 * Format records into RFC 4180 compliant CSV string
 */
export function generateCSV<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerLine = columns.map((col) => escapeCell(col.header)).join(',');
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCell(col.accessor(row))).join(',')
  );

  return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Export Financial Transactions to CSV
 */
export function exportFinancialTransactionsCSV(transactions: Array<{
  kodeTransaksi?: string | null;
  tanggal: Date;
  jenis: string;
  kategori: string;
  jumlah: number | string;
  keterangan?: string | null;
  dicatatOleh?: string | null;
}>): string {
  return generateCSV(transactions, [
    { header: 'Kode Transaksi', accessor: (r) => r.kodeTransaksi || '-' },
    { header: 'Tanggal', accessor: (r) => formatDateID(r.tanggal) },
    { header: 'Jenis', accessor: (r) => r.jenis },
    { header: 'Kategori', accessor: (r) => r.kategori },
    { header: 'Jumlah', accessor: (r) => formatCurrencyIDR(Number(r.jumlah)) },
    { header: 'Keterangan', accessor: (r) => r.keterangan || '-' },
    { header: 'Pencatat', accessor: (r) => r.dicatatOleh || '-' },
  ]);
}

/**
 * Export Resident Directory to CSV (with safe masking options for non-superadmins)
 */
export function exportResidentDirectoryCSV(residents: Array<{
  nik: string;
  noKK?: string | null;
  nama: string;
  jenisKelamin: string;
  blok: string;
  noRumah: string;
  telepon?: string | null;
  status: string;
}>, isPrivileged = false): string {
  return generateCSV(residents, [
    { header: 'NIK', accessor: (r) => (isPrivileged ? r.nik : maskNIK(r.nik)) },
    { header: 'No KK', accessor: (r) => (isPrivileged ? r.noKK || '-' : maskNIK(r.noKK)) },
    { header: 'Nama Lengkap', accessor: (r) => r.nama },
    { header: 'L/P', accessor: (r) => r.jenisKelamin },
    { header: 'Blok', accessor: (r) => r.blok },
    { header: 'No Rumah', accessor: (r) => r.noRumah },
    { header: 'Telepon', accessor: (r) => r.telepon || '-' },
    { header: 'Status Warga', accessor: (r) => r.status },
  ]);
}
