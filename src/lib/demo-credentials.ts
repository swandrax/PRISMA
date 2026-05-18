// ============================================================
// PRIVATE CREDENTIALS - Developer Only
// These credentials are NOT displayed anywhere in the UI.
// Only the developer knows these login details.
// ============================================================

export interface DemoUser {
    id: number;
    email: string;
    password: string;
    nama: string;
    role: 'admin' | 'pengurus' | 'warga';
    no_telepon: string;
    tanggal_lahir: string;
    alamat: string;
    blok: string;
    no_rumah: string;
    status: 'Aktif' | 'Pending' | 'Nonaktif';
    foto_path: string | null;
    permissions: string[];
}

// Private user database - NOT exposed in any UI component
const PRIVATE_USERS: DemoUser[] = [
    {
        id: 1,
        email: "rerry@prisma.dev",
        password: "Pr1sm4RT04!",
        nama: "R Erry Adu Sundaru",
        role: "admin",
        no_telepon: "6287872004448",
        tanggal_lahir: "1985-03-15",
        alamat: "Gg. Bugis No.95, RT 04/RW 09, Kemayoran",
        blok: "A",
        no_rumah: "95",
        status: "Aktif",
        foto_path: null,
        permissions: [
            "manage_users", "manage_finance", "manage_surat",
            "manage_security", "view_reports", "manage_settings",
            "manage_infrastructure", "audit_logs", "manage_files"
        ]
    },
    {
        id: 2,
        email: "sekretaris@prisma.dev",
        password: "S3kr3t4r1s!",
        nama: "Sekretaris RT 04",
        role: "pengurus",
        no_telepon: "6281234567891",
        tanggal_lahir: "1990-06-20",
        alamat: "Gg. Bugis, RT 04/RW 09, Kemayoran",
        blok: "A",
        no_rumah: "42",
        status: "Aktif",
        foto_path: null,
        permissions: [
            "manage_surat", "view_reports", "manage_users"
        ]
    },
    {
        id: 3,
        email: "bendahara@prisma.dev",
        password: "B3nd4h4r4!",
        nama: "Bendahara RT 04",
        role: "pengurus",
        no_telepon: "6281234567892",
        tanggal_lahir: "1988-11-10",
        alamat: "Gg. Bugis, RT 04/RW 09, Kemayoran",
        blok: "B",
        no_rumah: "17",
        status: "Aktif",
        foto_path: null,
        permissions: [
            "manage_finance", "view_reports"
        ]
    },
    {
        id: 4,
        email: "warga@prisma.dev",
        password: "W4rg4RT04!",
        nama: "Budi Santoso",
        role: "warga",
        no_telepon: "6281234567893",
        tanggal_lahir: "1995-01-25",
        alamat: "Gg. Bugis No.30, RT 04/RW 09, Kemayoran",
        blok: "B",
        no_rumah: "30",
        status: "Aktif",
        foto_path: null,
        permissions: [
            "view_reports", "create_surat", "report_security"
        ]
    },
    {
        id: 5,
        email: "tamu@prisma.dev",
        password: "T4muRT04!",
        nama: "Tamu / Guest",
        role: "warga",
        no_telepon: "6280000000000",
        tanggal_lahir: "2000-01-01",
        alamat: "Pengunjung",
        blok: "-",
        no_rumah: "-",
        status: "Aktif",
        foto_path: null,
        permissions: [
            "view_reports"
        ]
    },
];

// Keep the public-facing export empty to prevent any UI from listing users
export const DEMO_USERS: DemoUser[] = [];

/**
 * Authenticate user by email and password.
 * This function checks against PRIVATE_USERS (not the empty DEMO_USERS).
 * Credentials are never displayed in the UI.
 */
export function authenticateDemo(email: string, password: string): DemoUser | null {
    const normalizedEmail = email.toLowerCase().trim();
    return PRIVATE_USERS.find(
        u => u.email.toLowerCase() === normalizedEmail && u.password === password
    ) || null;
}

/**
 * Get user by email (for profile lookups after login).
 */
export function getDemoUserByEmail(email: string): DemoUser | null {
    const normalizedEmail = email.toLowerCase().trim();
    return PRIVATE_USERS.find(
        u => u.email.toLowerCase() === normalizedEmail
    ) || null;
}

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(user: DemoUser, permission: string): boolean {
    return user.permissions.includes(permission);
}

export const BETA_CONFIG = {
    version: "1.0.0",
    environment: "production",
    features: {
        demoLogin: false,         // No demo UI shown
        customFinanceInput: true,
        realtimeAnalysis: true,
        budgetMonitoring: true
    },
    domain: "prisma.dev",
    lastUpdated: "2026-02-12"
};
