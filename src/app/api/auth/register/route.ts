import { NextRequest, NextResponse } from "next/server";
import { wargaGraphEngine } from "@/lib/warga-graph-rag";
import { validateRTCode } from "@/lib/rt-auth-codes";
import { logAudit } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nama,
      email,
      nik,
      noKK,
      telepon,
      alamat,
      blok,
      noRumah,
      role,
      password,
      pekerjaan,
      statusKeluarga,
      rtCode,
    } = body;

    if (!nama || !email || !telepon) {
      return NextResponse.json({ success: false, error: "Nama, email, dan nomor telepon wajib diisi." }, { status: 400 });
    }

    const targetRole = (role ? role.toUpperCase() : "WARGA") as "WARGA" | "PENGURUS" | "ADMIN";

    // 🔒 SECURITY: Validate RT Verification Passcode
    const codeValidation = validateRTCode(rtCode || "", targetRole);
    if (!codeValidation.valid) {
      logAudit({
        actor: email,
        action: "LOGIN_FAILED",
        resource: "AuthRegister",
        details: `Registrasi ditolak: Kode RT '${rtCode}' tidak valid untuk role ${targetRole}`,
      });
      return NextResponse.json({ success: false, error: codeValidation.error }, { status: 403 });
    }

    // Check if citizen already registered
    const existing = wargaGraphEngine.findByCredentials(email) || (nik ? wargaGraphEngine.findByCredentials(nik) : null);
    if (existing) {
      return NextResponse.json({
        success: false,
        error: "Email atau NIK sudah terdaftar dalam sistem RT 04.",
      }, { status: 400 });
    }

    const newCitizenId = `warga-${Date.now()}`;
    const generatedNik = nik || `317101${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const generatedKK = noKK || `317101100101${Math.floor(1000 + Math.random() * 9000)}`;

    const newNode = wargaGraphEngine.addNode({
      id: newCitizenId,
      nik: generatedNik,
      noKK: generatedKK,
      nama,
      jenisKelamin: "L",
      tempatLahir: "Jakarta",
      tanggalLahir: "1995-01-01",
      agama: "Islam",
      pendidikan: "SMA/S1",
      pekerjaan: pekerjaan || "Wiraswasta",
      statusPernikahan: "Menikah",
      statusKeluarga: statusKeluarga || "Kepala Keluarga",
      alamat: alamat || `Jl. Bugis RT 04 RW 09`,
      blok: blok || "A",
      noRumah: noRumah || "1",
      rt: "04",
      rw: "09",
      telepon,
      email: email.toLowerCase(),
      role: targetRole,
      status: "AKTIF",
      passwordHash: password || "prisma123",
    });

    logAudit({
      actor: newNode.email,
      actorRole: newNode.role,
      action: "REGISTER_WARGA",
      resource: "Warga",
      resourceId: newNode.id,
      details: `Pendaftaran warga baru dengan verifikasi kode RT '${rtCode}': ${newNode.nama}`,
    });

    return NextResponse.json({
      success: true,
      message: `Pendaftaran berhasil diverifikasi! Akun ${newNode.nama} (${newNode.role}) telah aktif di RT 04.`,
      user: {
        id: newNode.id,
        nama: newNode.nama,
        email: newNode.email,
        nik: newNode.nik,
        role: newNode.role.toLowerCase(),
        telepon: newNode.telepon,
        alamat: newNode.alamat,
        blok: newNode.blok,
        no_rumah: newNode.noRumah,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
