import {
    WargaData,
    PengurusData,
    StatistikData,
    LetterTemplate,
    MonthlyReport,
    ExpenseSummary,
    SecurityReportSubmission,
    DbSecurityReport
} from '../Services/databaseService';

// ================= SEED DATA =================

const SEED_WARGA: WargaData[] = [
    { id: 1, nama: "Budi Santoso", alamat: "Jl. Merdeka No. 1", status: "Tetap", telepon: "081234567890" },
    { id: 2, nama: "Siti Aminah", alamat: "Jl. Merdeka No. 2", status: "Tetap", telepon: "081234567891" },
    { id: 3, nama: "Ahmad Rizky", alamat: "Jl. Merdeka No. 3", status: "Kontrak", telepon: "081234567892" },
    { id: 4, nama: "Dewi Lestari", alamat: "Jl. Merdeka No. 4", status: "Tetap", telepon: "081234567893" },
    { id: 5, nama: "Eko Prasetyo", alamat: "Jl. Merdeka No. 5", status: "Kost", telepon: "081234567894" }
];

const SEED_PENGURUS: PengurusData[] = [
    { id: 1, nama: "Bapak R Erry Adu Sundaru", jabatan: "Ketua RT", periode: "2024-2027" },
    { id: 2, nama: "Bu Sekretaris", jabatan: "Sekretaris", periode: "2024-2027" },
    { id: 3, nama: "Pak Bendahara", jabatan: "Bendahara", periode: "2024-2027" }
];

const SEED_LETTERS: LetterTemplate[] = [
    {
        id: "sktm",
        title: "Surat Keterangan Tidak Mampu",
        description: "Surat pengantar untuk keperluan administrasi bantuan sosial atau keringanan biaya.",
        category: "Administrasi",
        files: { docx: "/templates/sktm.docx", pdf: "/templates/sktm.pdf" },
        requiredFields: ["nama_lengkap", "nik", "keperluan"]
    },
    {
        id: "domisili",
        title: "Surat Keterangan Domisili",
        description: "Surat keterangan tempat tinggal sementara atau tetap.",
        category: "Kependudukan",
        files: { docx: "/templates/domisili.docx", pdf: "/templates/domisili.pdf" },
        requiredFields: ["nama_lengkap", "alamat_asal", "alamat_sekarang"]
    }
];

const SEED_FINANCE: MonthlyReport[] = [
    {
        bulan: "Januari",
        tahun: 2024,
        saldo_awal: 5000000,
        total_pemasukan: 1500000,
        total_pengeluaran: 500000,
        saldo_akhir: 6000000,
        transaksi: [
            { id: "tx1", tanggal: "2024-01-05", keterangan: "Iuran Warga", kategori: "Iuran", tipe: "pemasukan", jumlah: 1500000 },
            { id: "tx2", tanggal: "2024-01-15", keterangan: "Perbaikan Pos Ronda", kategori: "Infrastruktur", tipe: "pengeluaran", jumlah: 500000 }
        ]
    }
];

const SEED_SECURITY_INCIDENTS: DbSecurityReport[] = [
    {
        id: "inc1",
        jenis_kejadian: "Pencurian",
        lokasi: "Jl. Merdeka No. 2",
        tanggal_kejadian: "2024-02-01",
        status: "Resolved",
        priority: "High",
        nama_pelapor: "Siti Aminah",
        telepon_display: "0812***7891",
        kronologi: "Kehilangan sepeda motor di halaman rumah."
    }
];

// ================= STORAGE ENGINE =================

const STORAGE_KEYS = {
    WARGA: 'db_warga',
    PENGURUS: 'db_pengurus',
    LETTERS: 'db_letters',
    FINANCE: 'db_finance',
    SECURITY: 'db_security'
};

const isBrowser = typeof window !== 'undefined';

const getStorage = <T>(key: string, seed: T): T => {
    if (!isBrowser) return seed;
    try {
        const item = localStorage.getItem(key);
        if (item) return JSON.parse(item);
        // Initialize with seed if empty
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
    } catch (e) {
        console.error(`Error reading ${key} from localStorage`, e);
        return seed;
    }
};

const setStorage = <T>(key: string, data: T): void => {
    if (!isBrowser) return;
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error writing ${key} to localStorage`, e);
    }
};

// ================= MOCK API INTERFACE =================

export const MockDB = {
    // Administration
    getWarga: (): WargaData[] => getStorage(STORAGE_KEYS.WARGA, SEED_WARGA),
    addWarga: (warga: Partial<WargaData>): void => {
        const current = getStorage<WargaData[]>(STORAGE_KEYS.WARGA, SEED_WARGA);
        const newWarga = {
            id: current.length + 1,
            nama: warga.nama || "Unknown",
            alamat: warga.alamat || "-",
            status: warga.status || "Baru",
            telepon: warga.telepon || "-"
        };
        setStorage(STORAGE_KEYS.WARGA, [...current, newWarga]);
    },
    getPengurus: (): PengurusData[] => getStorage(STORAGE_KEYS.PENGURUS, SEED_PENGURUS),
    getStatistik: (): StatistikData => {
        const warga = getStorage<WargaData[]>(STORAGE_KEYS.WARGA, SEED_WARGA);
        return {
            totalWarga: warga.length,
            totalKK: Math.floor(warga.length / 3) + 1, // Mock logic
            wargaAktif: warga.filter(w => w.status === 'Tetap').length,
            pendatangBaru: warga.filter(w => w.status === 'Baru').length
        };
    },

    // Letters
    getTemplates: (category?: string): LetterTemplate[] => {
        const templates = getStorage(STORAGE_KEYS.LETTERS, SEED_LETTERS);
        if (category) return templates.filter(t => t.category === category);
        return templates;
    },
    getTemplateById: (id: string): LetterTemplate | null => {
        const templates = getStorage<LetterTemplate[]>(STORAGE_KEYS.LETTERS, SEED_LETTERS);
        return templates.find(t => t.id === id) || null;
    },
    submitLetter: (_templateId: string, _data: Record<string, unknown>): string => {
        // Just mock success, no storage needed for this simple version unless we add a "My Requests" feature
        return `REQ-${Date.now()}`;
    },

    // Finance
    getFinanceReports: (): MonthlyReport[] => getStorage(STORAGE_KEYS.FINANCE, SEED_FINANCE),
    getFinanceSummary: (): ExpenseSummary => {
        const _reports = getStorage<MonthlyReport[]>(STORAGE_KEYS.FINANCE, SEED_FINANCE);
        // Simple mock calculation
        return {
            avgMonthlyExpense: 500000,
            categories: [
                { kategori: "Infrastruktur", persentase: 60, avgBulanan: 300000, keterangan: "Perbaikan jalan & pos" },
                { kategori: "Kebersihan", persentase: 40, avgBulanan: 200000, keterangan: "Petugas sampah" }
            ]
        };
    },

    // Security
    getSecurityReports: () => getStorage(STORAGE_KEYS.SECURITY, SEED_SECURITY_INCIDENTS),
    addSecurityReport: (report: SecurityReportSubmission) => {
        const current = getStorage<DbSecurityReport[]>(STORAGE_KEYS.SECURITY, SEED_SECURITY_INCIDENTS);
        const newReport = {
            id: `inc${Date.now()}`,
            ...report,
            status: "Pending",
            priority: "Medium",
            telepon_display: report.telepon_pelapor.substring(0, 4) + "***" + report.telepon_pelapor.substring(report.telepon_pelapor.length - 4)
        };
        setStorage(STORAGE_KEYS.SECURITY, [newReport, ...current]);
        return newReport.id;
    }
};
