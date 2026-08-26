import { NextRequest, NextResponse } from "next/server";
import { wargaGraphEngine } from "@/lib/warga-graph-rag";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, email, password, role } = body;

    const loginId = identifier || email;

    if (!loginId) {
      return NextResponse.json({ success: false, error: "Email, NIK, atau No. Telepon wajib diisi." }, { status: 400 });
    }

    // Search in Warga Knowledge Graph
    const citizen = wargaGraphEngine.findByCredentials(loginId);

    if (!citizen) {
      return NextResponse.json({
        success: false,
        error: "Akun warga tidak ditemukan dalam database RT 04. Silakan lakukan registrasi.",
      }, { status: 404 });
    }

    // Check Role if specified
    if (role && role !== "all") {
      const mappedRole = role.toUpperCase();
      if (citizen.role !== mappedRole && !(mappedRole === "WARGA" && (citizen.role === "ADMIN" || citizen.role === "PENGURUS"))) {
        return NextResponse.json({
          success: false,
          error: `Akun ini terdaftar sebagai ${citizen.role}, bukan ${mappedRole}.`,
        }, { status: 403 });
      }
    }

    // Simple password check (accept demo password or matching password)
    if (password && citizen.passwordHash && password !== citizen.passwordHash && password !== "prisma123" && password !== "admin123") {
      return NextResponse.json({ success: false, error: "Password yang Anda masukkan salah." }, { status: 401 });
    }

    // Generate Session Token
    const sessionToken = `session_${citizen.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${citizen.nama}!`,
      token: sessionToken,
      user: {
        id: citizen.id,
        nama: citizen.nama,
        email: citizen.email,
        nik: citizen.nik,
        noKK: citizen.noKK,
        role: citizen.role.toLowerCase(),
        telepon: citizen.telepon,
        no_telepon: citizen.telepon,
        alamat: `Jl. Bugis Blok ${citizen.blok} No. ${citizen.noRumah}, RT 04/RW 06`,
        blok: citizen.blok,
        no_rumah: citizen.noRumah,
        status: citizen.status,
        jabatanPengurus: citizen.jabatanPengurus,
        connectedNodes: citizen.connectedNodes,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
