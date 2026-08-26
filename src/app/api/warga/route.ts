import { NextRequest, NextResponse } from "next/server";
import { wargaGraphEngine } from "@/lib/warga-graph-rag";
import { logAudit } from "@/lib/audit-logger";

// Masking Utilities for Resident Privacy Protection
export function maskNik(nik: string): string {
  if (!nik || nik.length < 8) return "******";
  return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
}

export function maskNoKK(kk?: string): string {
  if (!kk || kk.length < 8) return "******";
  return `${kk.slice(0, 4)}********${kk.slice(-4)}`;
}

export function maskPhone(phone?: string): string {
  if (!phone || phone.length < 6) return "***";
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}

export function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "***";
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

// Data Transfer Objects
export interface ResidentPublicDTO {
  id: string;
  nama: string;
  nikMasked: string;
  blok: string;
  noRumah: string;
  teleponMasked: string;
  role: string;
  jabatanPengurus?: string;
  status: string;
}

export interface ResidentAdminDTO {
  id: string;
  nik: string;
  noKK?: string;
  nama: string;
  jenisKelamin: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  pendidikan?: string;
  pekerjaan?: string;
  statusPernikahan?: string;
  statusKeluarga?: string;
  alamat: string;
  blok: string;
  noRumah: string;
  rt: string;
  rw: string;
  telepon?: string;
  email?: string;
  role: string;
  jabatanPengurus?: string;
  status: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const role = searchParams.get("role");
    const blok = searchParams.get("blok");
    const authRole = req.headers.get("x-user-role")?.toUpperCase() || "ADMIN"; // Default to admin preview in dashboard

    let nodes = wargaGraphEngine.getAllNodes();

    if (search) {
      nodes = wargaGraphEngine.queryRAG(search, 50);
    }

    if (role && role !== "all") {
      nodes = nodes.filter((w) => w.role.toUpperCase() === role.toUpperCase());
    }

    if (blok && blok !== "all") {
      nodes = nodes.filter((w) => w.blok.toUpperCase() === blok.toUpperCase());
    }

    // Role-based DTO formatting
    if (authRole === "ADMIN" || authRole === "PENGURUS") {
      const adminData: ResidentAdminDTO[] = nodes.map((w) => ({
        id: w.id,
        nik: w.nik,
        noKK: w.noKK,
        nama: w.nama,
        jenisKelamin: "L",
        alamat: w.alamat,
        blok: w.blok,
        noRumah: w.noRumah,
        rt: "04",
        rw: "09",
        telepon: w.telepon,
        email: w.email,
        role: w.role,
        jabatanPengurus: w.jabatanPengurus,
        status: w.status,
        pekerjaan: w.pekerjaan,
        statusKeluarga: w.statusKeluarga,
      }));

      return NextResponse.json({
        success: true,
        role: authRole,
        total: adminData.length,
        data: adminData,
      });
    }

    // Public / Restricted DTO with Masked PII
    const publicData: ResidentPublicDTO[] = nodes.map((w) => ({
      id: w.id,
      nama: w.nama,
      nikMasked: maskNik(w.nik),
      blok: `Blok ${w.blok}`,
      noRumah: `No. ${w.noRumah}`,
      teleponMasked: maskPhone(w.telepon),
      role: w.role,
      jabatanPengurus: w.jabatanPengurus,
      status: w.status,
    }));

    return NextResponse.json({
      success: true,
      role: "PUBLIC",
      total: publicData.length,
      data: publicData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.nama || !body.nik) {
      return NextResponse.json({ success: false, error: "Nama dan NIK wajib diisi." }, { status: 400 });
    }

    const newNode = wargaGraphEngine.addNode({
      id: `warga-${Date.now()}`,
      nik: body.nik,
      noKK: body.noKK || "3171011001010099",
      nama: body.nama,
      jenisKelamin: body.jenisKelamin || "L",
      tempatLahir: body.tempatLahir || "Jakarta",
      tanggalLahir: body.tanggalLahir || "1995-01-01",
      agama: body.agama || "Islam",
      pendidikan: body.pendidikan || "SMA",
      pekerjaan: body.pekerjaan || "Wiraswasta",
      statusPernikahan: body.statusPernikahan || "Belum Menikah",
      statusKeluarga: body.statusKeluarga || "Kepala Keluarga",
      alamat: body.alamat || "Jl. Bugis RT 04 RW 09",
      blok: body.blok || "A",
      noRumah: body.noRumah || "1",
      rt: "04",
      rw: "09",
      telepon: body.telepon || "081200000000",
      email: body.email || `${body.nama.toLowerCase().replace(/[^a-z]/g, "")}@prisma.id`,
      role: body.role || "WARGA",
      jabatanPengurus: body.jabatanPengurus,
      status: "AKTIF",
    });

    logAudit({
      actor: "ADMIN/PENGURUS",
      action: "REGISTER_WARGA",
      resource: "Warga",
      resourceId: newNode.id,
      details: `Pendaftaran warga baru: ${newNode.nama} (${newNode.nik})`,
    });

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan.",
      data: newNode,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Warga diperlukan untuk update." }, { status: 400 });
    }

    const updated = wargaGraphEngine.updateNode(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Data warga tidak ditemukan." }, { status: 404 });
    }

    logAudit({
      actor: "USER/ADMIN",
      action: "UPDATE_PROFILE",
      resource: "Warga",
      resourceId: id,
      details: `Perubahan profil warga: ${updated.nama}`,
    });

    return NextResponse.json({
      success: true,
      message: "Data profil warga/pengurus berhasil diperbarui.",
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Warga diperlukan untuk penghapusan." }, { status: 400 });
    }

    const deleted = wargaGraphEngine.deleteNode(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Data warga tidak ditemukan." }, { status: 404 });
    }

    logAudit({
      actor: "ADMIN",
      action: "DELETE_WARGA",
      resource: "Warga",
      resourceId: id,
      details: `Penghapusan data warga ID: ${id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil dihapus.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
