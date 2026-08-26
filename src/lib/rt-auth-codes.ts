/**
 * RT Authorization & Registration Code System
 * Codes issued by Ketua RT and Admin to verify genuine residents, administrators, and staff.
 */

export interface RTAuthCode {
  code: string;
  role: "WARGA" | "PENGURUS" | "ADMIN";
  description: string;
  issuedBy: string;
  active: boolean;
}

// Authoritative Master RT Codes
export const MASTER_RT_AUTH_CODES: RTAuthCode[] = [
  {
    code: "RT04-WARGA-2026",
    role: "WARGA",
    description: "Kode verifikasi registrasi & login khusus warga resmi RT 04 Kemayoran",
    issuedBy: "Ketua RT (R Erry Adu Sundaru)",
    active: true,
  },
  {
    code: "RT04-PENGURUS-2026",
    role: "PENGURUS",
    description: "Kode verifikasi khusus Pengurus RT 04 Kemayoran (Sekretaris, Bendahara, Seksi)",
    issuedBy: "Ketua RT (R Erry Adu Sundaru)",
    active: true,
  },
  {
    code: "RT04-ADMIN-KEMAYORAN",
    role: "ADMIN",
    description: "Kode otentikasi level Administrator Sistem PRISMA RT 04",
    issuedBy: "Administrator Sistem (Swandaru Tirta)",
    active: true,
  },
  // Short convenience codes
  {
    code: "WARGA04",
    role: "WARGA",
    description: "Kode cepat warga RT 04",
    issuedBy: "Ketua RT",
    active: true,
  },
  {
    code: "ADMIN04",
    role: "ADMIN",
    description: "Kode cepat administrator RT 04",
    issuedBy: "Admin",
    active: true,
  },
];

/**
 * Validate given RT code against designated role
 */
export function validateRTCode(
  inputCode: string,
  targetRole: "WARGA" | "PENGURUS" | "ADMIN" = "WARGA"
): { valid: boolean; role?: "WARGA" | "PENGURUS" | "ADMIN"; error?: string } {
  if (!inputCode) {
    return { valid: false, error: "Kode khusus dari Ketua RT / Admin wajib dimasukkan." };
  }

  const clean = inputCode.trim().toUpperCase();
  const match = MASTER_RT_AUTH_CODES.find((c) => c.code.toUpperCase() === clean && c.active);

  if (!match) {
    return {
      valid: false,
      error: "Kode khusus tidak valid atau sudah tidak aktif. Hubungi Ketua RT (0878-7200-4448) untuk mendapatkan kode resmi.",
    };
  }

  // Hierarchy check: ADMIN code can access PENGURUS/WARGA; PENGURUS code can access WARGA
  if (targetRole === "ADMIN" && match.role !== "ADMIN") {
    return { valid: false, error: "Kode ini tidak memiliki hak akses Administrator." };
  }
  if (targetRole === "PENGURUS" && match.role === "WARGA") {
    return { valid: false, error: "Kode ini tidak memiliki hak akses Pengurus RT." };
  }

  return { valid: true, role: match.role };
}
