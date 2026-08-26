/**
 * Safe Demo Authentication Provider
 * Provides safe demo fallback authentication for PRISMA RT 04
 * Contains NO production secrets or sensitive citizen passwords.
 */

export interface DemoUser {
    id: number;
    email: string;
    nama: string;
    role: 'warga' | 'pengurus' | 'rw_admin';
    no_telepon: string;
    alamat: string;
    blok: string;
    no_rumah: string;
    status: string;
    permissions: string[];
}

const DEMO_USERS: DemoUser[] = [
    {
        id: 1,
        email: "rt04@prisma.dev",
        nama: "Bpk. R Erry Adu Sundaru",
        role: "pengurus",
        no_telepon: "6287872004448",
        alamat: "Gg. Bugis No.95 RT 04/09",
        blok: "A",
        no_rumah: "95",
        status: "Aktif",
        permissions: ["read:all", "write:announcement", "manage:warga", "manage:finance"],
    },
    {
        id: 2,
        email: "swandaru@prisma.dev",
        nama: "Swandaru Tirta",
        role: "pengurus",
        no_telepon: "6287782380077",
        alamat: "Gg. Bugis No.96 RT 04/09",
        blok: "A",
        no_rumah: "96",
        status: "Aktif",
        permissions: ["read:all", "write:announcement", "manage:warga", "manage:finance", "manage:tech"],
    },
    {
        id: 3,
        email: "warga@prisma.dev",
        nama: "Warga RT 04",
        role: "warga",
        no_telepon: "6281299887766",
        alamat: "Gg. Bugis No.97 RT 04/09",
        blok: "B",
        no_rumah: "97",
        status: "Aktif",
        permissions: ["read:public", "create:surat", "create:laporan"],
    },
];

/**
 * Authenticate user for demo environment
 */
export async function authenticateDemo(email: string, _password: string): Promise<DemoUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
        return user;
    }
    return null;
}

/**
 * Get demo user profile by email
 */
export function getDemoUserByEmail(email: string): DemoUser | null {
    const cleanEmail = email.trim().toLowerCase();
    return DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}
