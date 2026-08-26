import { NextRequest, NextResponse } from "next/server";
import { INITIAL_50_WARGA, WargaSeedItem } from "@/lib/seed-data";

// In-memory runtime cache fallback when database client is initializing
let runtimeWargaList: WargaSeedItem[] = [...INITIAL_50_WARGA];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const role = searchParams.get("role");
    const blok = searchParams.get("blok");

    let filtered = [...runtimeWargaList];

    if (search) {
      filtered = filtered.filter(
        (w) =>
          w.nama.toLowerCase().includes(search) ||
          w.nik.includes(search) ||
          w.telepon.includes(search) ||
          w.alamat.toLowerCase().includes(search)
      );
    }

    if (role) {
      filtered = filtered.filter((w) => w.role === role);
    }

    if (blok) {
      filtered = filtered.filter((w) => w.blok.toUpperCase() === blok.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      data: filtered,
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
      return NextResponse.json(
        { success: false, error: "Nama dan NIK wajib diisi." },
        { status: 400 }
      );
    }

    // Check duplicate NIK
    const exists = runtimeWargaList.find((w) => w.nik === body.nik);
    if (exists) {
      return NextResponse.json(
        { success: false, error: "NIK sudah terdaftar dalam sistem." },
        { status: 400 }
      );
    }

    const newWarga: WargaSeedItem = {
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
      alamat: body.alamat || "Jl. Bugis RT 04 RW 06",
      blok: body.blok || "A",
      noRumah: body.noRumah || "1",
      rt: "04",
      rw: "06",
      telepon: body.telepon || "081200000000",
      email: body.email || `${body.nama.toLowerCase().replace(/[^a-z]/g, "")}@prisma.id`,
      role: body.role || "WARGA",
      jabatanPengurus: body.jabatanPengurus,
      status: "AKTIF",
    };

    runtimeWargaList.unshift(newWarga);

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan.",
      data: newWarga,
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
      return NextResponse.json(
        { success: false, error: "ID Warga diperlukan untuk update." },
        { status: 400 }
      );
    }

    const index = runtimeWargaList.findIndex((w) => w.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Data warga tidak ditemukan." },
        { status: 404 }
      );
    }

    runtimeWargaList[index] = {
      ...runtimeWargaList[index],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      message: "Data profil warga/pengurus berhasil diperbarui.",
      data: runtimeWargaList[index],
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
      return NextResponse.json(
        { success: false, error: "ID Warga diperlukan untuk penghapusan." },
        { status: 400 }
      );
    }

    const index = runtimeWargaList.findIndex((w) => w.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Data warga tidak ditemukan." },
        { status: 404 }
      );
    }

    const deleted = runtimeWargaList.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil dihapus.",
      data: deleted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
