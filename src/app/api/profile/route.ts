import { NextRequest, NextResponse } from "next/server";
import { INITIAL_50_WARGA, WargaSeedItem } from "@/lib/seed-data";
import { uploadToS3 } from "@/lib/s3";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "warga-01"; // Default to RT leader profile if not specified

    const profile = INITIAL_50_WARGA.find((w) => w.id === id) || INITIAL_50_WARGA[0];

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    const wargaId = (formData.get("wargaId") as string) || "warga-01";

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file avatar yang diupload." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "jpg";
    const s3Key = `avatars/${wargaId}-${Date.now()}.${fileExt}`;

    const s3Result = await uploadToS3(s3Key, buffer, file.type);

    return NextResponse.json({
      success: true,
      message: "Avatar berhasil diupload ke Neon S3 Storage.",
      url: s3Result.url || `/placeholder-avatar.png`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<WargaSeedItem>;
    const id = body.id || "warga-01";

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      data: { ...body, id },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
