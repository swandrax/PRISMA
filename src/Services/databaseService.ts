// Database Service - Central service for all database operations
// Provides a clean API for frontend components to interact with database endpoints
// REFACTORED: Now uses Client-Side SQLite (sql.js) for high performance and direct import/export

import { SqliteDB } from '../lib/sqliteDB';
import { MockDB } from '../lib/mockDatabase'; // Keep MockDB for fallbacks/other data types not yet in SQLite

// Initialize SQLite on service load
if (typeof window !== 'undefined') {
    SqliteDB.init();
}

// Types
export interface AdministrationData {
    warga: WargaData[];
    pengurus: PengurusData[];
    statistik: StatistikData;
}

export interface WargaData {
    id: number;
    nama: string;
    alamat: string;
    status: string;
    telepon: string;
}

export interface PengurusData {
    id: number;
    nama: string;
    jabatan: string;
    periode: string;
}

export interface StatistikData {
    totalWarga: number;
    totalKK: number;
    wargaAktif: number;
    pendatangBaru: number;
}

export interface LetterTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    files: {
        docx: string;
        pdf: string;
    };
    requiredFields: string[];
}

export interface Transaction {
    id: string;
    tanggal: string;
    keterangan: string;
    kategori: string;
    tipe: 'pemasukan' | 'pengeluaran';
    jumlah: number;
}

export interface MonthlyReport {
    bulan: string;
    tahun: number;
    saldo_awal: number;
    total_pemasukan: number;
    total_pengeluaran: number;
    saldo_akhir: number;
    transaksi: Transaction[];
}

export interface ExpenseCategory {
    kategori: string;
    persentase: number;
    avgBulanan: number;
    keterangan: string;
    kategori_normalized?: string;
}

export interface ExpenseSummary {
    avgMonthlyExpense: number;
    categories: ExpenseCategory[];
}

export interface SecurityReportSubmission {
    kronologi: string;
    tanggal_kejadian: string;
    waktu_kejadian?: string;
    lokasi?: string;
    nama_pelapor: string;
    telepon_pelapor: string;
    jenis_kejadian: string;
}

export interface IncidentType {
    id: string;
    label: string;
    priority: string;
}

export interface DbSecurityReport {
    id: string | number;
    status: string;
    priority: string;
    telepon_pelapor?: string;
    telepon_display?: string;
    jenis_kejadian: string;
    lokasi: string;
    tanggal_kejadian: string;
    nama_pelapor: string;
    kronologi?: string;
}

// Helper to simulate network delay for realistic "loading" states (reduced for SQLite speed)
const simulateDelay = async <T>(data: T, ms: number = 50): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), ms));
};

// Database Service
export const databaseService = {
    // ======== ADMINISTRATION ========
    async getAdministrationData(type?: 'warga' | 'pengurus' | 'statistik'): Promise<AdministrationData | WargaData[] | PengurusData[] | StatistikData> {
        await SqliteDB.init();

        if (type === 'warga') return SqliteDB.getAllWarga();

        // Fallback to MockDB for other types until we migrate them to SQLite tables completely
        if (type === 'pengurus') return MockDB.getPengurus();

        if (type === 'statistik') {
            const warga = SqliteDB.getAllWarga();
            return {
                totalWarga: warga.length,
                totalKK: Math.floor(warga.length / 3) + 1,
                wargaAktif: warga.filter(w => w.status === 'Tetap').length,
                pendatangBaru: warga.filter(w => w.status === 'Baru' || w.status === 'Kontrak').length
            };
        }

        return {
            warga: SqliteDB.getAllWarga(),
            pengurus: MockDB.getPengurus(),
            statistik: {
                totalWarga: SqliteDB.getAllWarga().length,
                totalKK: 0,
                wargaAktif: 0,
                pendatangBaru: 0
            }
        };
    },

    async addWarga(data: Partial<WargaData>): Promise<{ success: boolean; message: string }> {
        await SqliteDB.init();
        SqliteDB.addWarga(data);
        return { success: true, message: "Warga berhasil ditambahkan ke SQLite Database" };
    },

    // ======== SURAT MENYURAT ========
    async getLetterTemplates(category?: string): Promise<LetterTemplate[]> {
        await simulateDelay(null);
        return MockDB.getTemplates(category);
    },

    async getLetterTemplate(id: string): Promise<LetterTemplate | null> {
        await simulateDelay(null);
        return MockDB.getTemplateById(id);
    },

    async submitLetterRequest(templateId: string, data: Record<string, string>): Promise<{ success: boolean; submissionId?: string; message?: string }> {
        await simulateDelay(null);
        const subId = MockDB.submitLetter(templateId, data);
        return { success: true, submissionId: subId, message: "Permohonan surat berhasil dikirim" };
    },

    getTemplateDownloadUrl(templateId: string, format: 'docx' | 'pdf'): string {
        return `/templates/surat/${templateId}.${format}`;
    },

    // ======== KEUANGAN ========
    async getCurrentBalance(): Promise<{ saldo: number; lastUpdate: string }> {
        await simulateDelay(null);
        const reports = MockDB.getFinanceReports();
        const latest = reports[0]; // Assuming sorted desc
        return {
            saldo: latest ? latest.saldo_akhir : 0,
            lastUpdate: latest ? `${latest.bulan} ${latest.tahun}` : "-"
        };
    },

    async getMonthlyReports(): Promise<MonthlyReport[]> {
        await simulateDelay(null);
        return MockDB.getFinanceReports();
    },

    async getMonthlyReport(bulan: string, tahun: number): Promise<MonthlyReport | null> {
        await simulateDelay(null);
        const reports = MockDB.getFinanceReports();
        return reports.find(r => r.bulan === bulan && r.tahun === Number(tahun)) || null;
    },

    async getExpenseSummary(): Promise<ExpenseSummary> {
        await simulateDelay(null);
        return MockDB.getFinanceSummary();
    },

    getFinancialReportPdfUrl(_bulan: string, _tahun: number): string {
        // Mock PDF link or disable feature
        return `#`;
    },

    // ======== KEAMANAN ========
    async getIncidentTypes(): Promise<IncidentType[]> {
        await simulateDelay(null);
        return [
            { id: 'theft', label: 'Pencurian', priority: 'High' },
            { id: 'disturbance', label: 'Keributan', priority: 'Medium' },
            { id: 'medical', label: 'Darurat Medis', priority: 'High' },
            { id: 'other', label: 'Lainnya', priority: 'Low' }
        ];
    },

    async getSecurityStats(): Promise<{
        total: number;
        pending: number;
        resolved: number;
        byPriority: Record<string, number>;
    }> {
        await SqliteDB.init();
        const reports = SqliteDB.getAllSecurityReports() as unknown as DbSecurityReport[];
        return {
            total: reports.length,
            pending: reports.filter(r => r.status === 'Pending').length,
            resolved: reports.filter(r => r.status === 'Resolved').length,
            byPriority: {
                High: reports.filter(r => r.priority === 'High').length,
                Medium: reports.filter(r => r.priority === 'Medium').length,
                Low: reports.filter(r => r.priority === 'Low').length
            }
        };
    },

    async getRecentSecurityReports(): Promise<Array<{
        id: string;
        jenis_kejadian: string;
        lokasi: string;
        tanggal_kejadian: string;
        status: string;
        priority: string;
        nama_pelapor: string;
        telepon_display: string;
    }>> {
        await SqliteDB.init();
        const reports = SqliteDB.getAllSecurityReports() as unknown as DbSecurityReport[];
        return reports.map(r => ({
            ...r,
            id: r.id.toString(),
            telepon_display: r.telepon_pelapor || "-"
        }));
    },

    async submitSecurityReport(report: SecurityReportSubmission): Promise<{
        success: boolean;
        reportId?: string;
        message?: string;
        priority?: string;
    }> {
        await SqliteDB.init();
        SqliteDB.addSecurityReport(report);
        return {
            success: true,
            reportId: "123", // Placeholder since SqliteDB.addSecurityReport doesn't return ID yet
            message: "Laporan keamanan berhasil dikirim ke SQLite Database",
            priority: "Medium"
        };
    },
};

export default databaseService;
