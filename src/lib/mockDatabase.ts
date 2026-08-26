/**
 * Mock Database Fallback Provider for PRISMA RT 04
 * Provides safe, anonymized fallback data for templates, public structure, and finance summaries.
 * Contains NO private citizen credentials or sensitive personal information.
 */

export interface Pengurus {
    id: number;
    nama: string;
    jabatan: string;
    telepon: string;
    periode: string;
}

export interface LetterTemplate {
    id: string;
    title: string;
    category: string;
    description: string;
    requiredFields: string[];
    files?: {
        docx: string;
        pdf: string;
    };
}

export interface FinanceReport {
    month?: string;
    income?: number;
    expense?: number;
    balance?: number;
    description?: string;
    bulan: string;
    tahun: number;
    saldo_awal: number;
    total_pemasukan: number;
    total_pengeluaran: number;
    saldo_akhir: number;
    transaksi: any[];
}

export interface FinanceSummary {
    totalKas: number;
    pemasukanBulanIni: number;
    pengeluaranBulanIni: number;
    terakhirDiperbarui: string;
    avgMonthlyExpense: number;
    categories: Array<{ kategori: string; jumlah: number; persentase: number; avgBulanan: number; keterangan: string }>;
}

export interface Statistik {
    totalWarga: number;
    totalKK: number;
    wargaAktif: number;
    pendatangBaru: number;
    totalPengurus: number;
    iuranRate: number;
}

export interface SecurityReport {
    id: string;
    date: string;
    type: string;
    status: string;
    description: string;
}

export class MockDB {
    /**
     * Return public organizational structure for RT 04
     */
    static getPengurus(): Pengurus[] {
        return [
            {
                id: 1,
                nama: "Bpk. R Erry Adu Sundaru",
                jabatan: "Ketua RT 04",
                telepon: "6287872004448",
                periode: "2024-2027",
            },
            {
                id: 2,
                nama: "Bpk. Swandaru Tirta",
                jabatan: "Programmer & Technical Engineer",
                telepon: "6287782380077",
                periode: "2024-2027",
            },
        ];
    }

    /**
     * Return active letter templates
     */
    static getTemplates(category?: string): LetterTemplate[] {
        const templates: LetterTemplate[] = [
            {
                id: "domisili",
                title: "Surat Keterangan Domisili",
                category: "Administrasi",
                description: "Surat pengantar keterangan domisili tempat tinggal warga RT 04.",
                requiredFields: ["nama", "nik", "alamat", "lamaTinggal"],
            },
            {
                id: "sktm",
                title: "Surat Keterangan Tidak Mampu (SKTM)",
                category: "Administrasi",
                description: "Surat keterangan untuk keperluan beasiswa atau bantuan sosial.",
                requiredFields: ["nama", "nik", "pekerjaan", "penghasilan", "keperluan"],
            },
            {
                id: "pindah",
                title: "Surat Pengantar Pindah Tempat",
                category: "Administrasi",
                description: "Surat pengantar untuk kepindahan domisili warga.",
                requiredFields: ["nama", "nik", "alamatTujuan", "alasanPindah"],
            },
            {
                id: "umum",
                title: "Surat Pengantar Umum",
                category: "Umum",
                description: "Surat pengantar keperluan umum ke Kelurahan.",
                requiredFields: ["nama", "nik", "keperluan"],
            },
        ];

        if (category) {
            return templates.filter((t) => t.category.toLowerCase() === category.toLowerCase());
        }
        return templates;
    }

    /**
     * Get specific template by ID
     */
    static getTemplateById(id: string): LetterTemplate | null {
        const templates = this.getTemplates();
        return templates.find((t) => t.id === id) || null;
    }

    /**
     * Submit letter application mock
     */
    static submitLetter(_templateId: string, _data: Record<string, unknown>): string {
        return `SUB-${Date.now().toString().slice(-6)}`;
    }

    /**
     * Return aggregated monthly finance reports
     */
    static getFinanceReports(): FinanceReport[] {
        return [
            {
                month: "Januari 2026",
                income: 4500000,
                expense: 1200000,
                balance: 3300000,
                description: "Kas bulanan & iuran kebersihan",
                bulan: "Januari",
                tahun: 2026,
                saldo_awal: 4600000,
                total_pemasukan: 4500000,
                total_pengeluaran: 1200000,
                saldo_akhir: 7900000,
                transaksi: [],
            },
            {
                month: "Desember 2025",
                income: 4200000,
                expense: 2100000,
                balance: 2100000,
                description: "Perbaikan lampu jalan & kerja bakti",
                bulan: "Desember",
                tahun: 2025,
                saldo_awal: 2500000,
                total_pemasukan: 4200000,
                total_pengeluaran: 2100000,
                saldo_akhir: 4600000,
                transaksi: [],
            },
        ];
    }

    /**
     * Return current finance summary
     */
    static getFinanceSummary(): FinanceSummary {
        return {
            totalKas: 7900000,
            pemasukanBulanIni: 4500000,
            pengeluaranBulanIni: 1200000,
            terakhirDiperbarui: "2026-01-31",
            avgMonthlyExpense: 1500000,
            categories: [
                { kategori: "Kebersihan & Keamanan", jumlah: 800000, persentase: 66, avgBulanan: 800000, keterangan: "Operasional harian" },
                { kategori: "Pemeliharaan Fasilitas", jumlah: 400000, persentase: 34, avgBulanan: 400000, keterangan: "Perbaikan lampu jalan" },
            ],
        };
    }

    /**
     * Return environmental stats for RT 04
     */
    static getStatistik(): Statistik {
        return {
            totalWarga: 142,
            totalKK: 45,
            wargaAktif: 136,
            pendatangBaru: 6,
            totalPengurus: 6,
            iuranRate: 94.2,
        };
    }

    /**
     * Return security logs
     */
    static getSecurityReports(): SecurityReport[] {
        return [
            {
                id: "SEC-001",
                date: "2026-01-20",
                type: "Patroli Malam",
                status: "Aman",
                description: "Patroli pos ronda RT 04 terpantau kondusif.",
            },
        ];
    }
}
