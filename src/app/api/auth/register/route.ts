import { NextRequest, NextResponse } from "next/server";
import { wargaGraphEngine } from "@/lib/warga-graph-rag";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, nik, noKK, telepon, alamat, blok, noRumah, role, password, pekerjaan, statusKeluarga } = body;

    if (!nama || !email || !telepon) {
      return NextResponse.json({ success: false, error: "Nama, email, dan nomor telepon wajib diisi." }, { status: 400 });
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
      alamat: alamat || `Jl. Bugis RT 04 RW 06`,
      blok: blok || "A",
      noRumah: noRumah || "1",
      rt: "04",
      rw: "06",
      telepon,
      email: email.toLowerCase(),
      role: (role ? role.toUpperCase() : "WARGA") as "WARGA" | "PENGURUS" | "ADMIN",
      status: "AKTIF",
      passwordHash: password || "prisma123",
    });

    return NextResponse.json({
      success: true,
      message: `Pendaftaran berhasil! Akun warga untuk ${newNode.nama} telah aktif dalam database RT 04.`,
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
