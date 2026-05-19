// ============================================================
// SECURE CREDENTIALS - Bcrypt Hashed Passwords
// Passwords are stored as bcrypt hashes, NEVER as plaintext.
// Original plaintext passwords are NOT in the codebase.
// ============================================================

import bcrypt from 'bcryptjs';

export interface DemoUser {
    id: number;
    email: string;
    passwordHash: string; // bcrypt hash — plaintext REMOVED
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

// Password hashes generated via: bcrypt.hashSync(password, 12)
// The original plaintext passwords are managed externally and NOT stored here.
const PRIVATE_USERS: DemoUser[] = [
    {
        id: 1,
        email: "rerry@prisma.dev",
        passwordHash: "$2b$12$hFzqpBhqVtf/MHokEkqJ9uqoIg/tAzOJFmozcF84eslZSlO6fDePO",
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
        passwordHash: "$2b$12$4ZDjgvOcPq19XIvuSHTo.ebSUVpOOqGMzEahnqYQco5We2wijnW4O",
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
        passwordHash: "$2b$12$lIFCgo5woTE2YNg2Cm9l2..9Oj8VkKZpfshLIJ4MeeEjn.7ocGvpK",
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
        passwordHash: "$2b$12$PnsRlfDMURGZFrB8V5w4l.Fx2cEzqT89g9SJNus8sq98LVfj08/d.",
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
        passwordHash: "$2b$12$8vbhnQK2yQnB4PG5n/vJSu7lIjCir.qhcOWqXoslyUJPLePEGkd3y",
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
 * Authenticate user by email and password using bcrypt comparison.
 * SEC-001 FIX: Passwords are hashed, never stored as plaintext.
 * Credentials are never displayed in the UI.
 */
export async function authenticateDemo(email: string, password: string): Promise<DemoUser | null> {
    if (!email || !password) return null;

    const normalizedEmail = email.toLowerCase().trim();
    const user = PRIVATE_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
        // Constant-time: still run bcrypt compare to prevent timing attacks
        await bcrypt.compare(password, '$2a$12$invalidhashplaceholderstring000000000000000000');
        return null;
    }

    const isValid = await bcrypt.compareSync(password, user.passwordHash);
    return isValid ? user : null;
}

/**
 * Synchronous version for backward compatibility.
 * Prefer async authenticateDemo() for production use.
 */
export function authenticateDemoSync(email: string, password: string): DemoUser | null {
    if (!email || !password) return null;

    const normalizedEmail = email.toLowerCase().trim();
    const user = PRIVATE_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) return null;

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    return isValid ? user : null;
}

/**
 * Get user by email (for profile lookups after login).
 * Does NOT return password hash.
 */
export function getDemoUserByEmail(email: string): Omit<DemoUser, 'passwordHash'> | null {
    const normalizedEmail = email.toLowerCase().trim();
    const user = PRIVATE_USERS.find(
        u => u.email.toLowerCase() === normalizedEmail
    );
    if (!user) return null;

    // Strip password hash from returned object
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
}

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(user: Pick<DemoUser, 'permissions'>, permission: string): boolean {
    return user.permissions.includes(permission);
}

/**
 * Utility: Generate a bcrypt hash for a new password.
 * Usage (dev only): generatePasswordHash('MyPassword123!')
 */
export async function generatePasswordHash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, 12);
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
    lastUpdated: "2026-05-19"
};
