import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

console.log("Connecting to Neon Postgres...");
const sql = neon(databaseUrl);

async function run() {
  try {
    console.log("Creating Extensions & Tables on Neon...\n");
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    await sql`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT,
        "role" TEXT NOT NULL DEFAULT 'WARGA',
        "avatarUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'User' verified");

    await sql`
      CREATE TABLE IF NOT EXISTS "Warga" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "userId" TEXT UNIQUE REFERENCES "User"("id") ON DELETE SET NULL,
        "nik" TEXT UNIQUE NOT NULL,
        "noKK" TEXT,
        "nama" TEXT NOT NULL,
        "jenisKelamin" VARCHAR(2) DEFAULT 'L',
        "tempatLahir" TEXT,
        "tanggalLahir" TIMESTAMP WITH TIME ZONE,
        "agama" TEXT DEFAULT 'Islam',
        "pendidikan" TEXT,
        "pekerjaan" TEXT,
        "statusPernikahan" TEXT DEFAULT 'Menikah',
        "statusKeluarga" TEXT DEFAULT 'Kepala Keluarga',
        "alamat" TEXT NOT NULL,
        "blok" VARCHAR(10) DEFAULT 'A',
        "noRumah" VARCHAR(10) DEFAULT '1',
        "rt" VARCHAR(5) DEFAULT '04',
        "rw" VARCHAR(5) DEFAULT '09',
        "telepon" TEXT,
        "email" TEXT,
        "role" TEXT DEFAULT 'WARGA',
        "status" TEXT DEFAULT 'AKTIF',
        "fotoUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'Warga' verified");
    await sql`ALTER TABLE "Warga" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'WARGA';`;

    await sql`
      CREATE TABLE IF NOT EXISTS "Pengurus" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "wargaId" TEXT UNIQUE NOT NULL REFERENCES "Warga"("id") ON DELETE CASCADE,
        "jabatan" TEXT NOT NULL,
        "periode" TEXT DEFAULT '2024-2027',
        "skPengangkatan" TEXT,
        "statusAktif" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'Pengurus' verified");

    await sql`
      CREATE TABLE IF NOT EXISTS "Surat" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "nomorSurat" TEXT UNIQUE,
        "wargaId" TEXT NOT NULL REFERENCES "Warga"("id") ON DELETE CASCADE,
        "jenisSurat" TEXT NOT NULL,
        "keperluan" TEXT NOT NULL,
        "status" TEXT DEFAULT 'PENDING',
        "catatan" TEXT,
        "fileDokumenUrl" TEXT,
        "tanggalPengajuan" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "tanggalSelesai" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'Surat' verified");

    await sql`
      CREATE TABLE IF NOT EXISTS "Keuangan" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "kodeTransaksi" TEXT UNIQUE,
        "jenis" TEXT NOT NULL,
        "kategori" TEXT NOT NULL,
        "jumlah" NUMERIC(15, 2) NOT NULL,
        "keterangan" TEXT,
        "buktiBayarUrl" TEXT,
        "dicatatOleh" TEXT,
        "tanggal" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'Keuangan' verified");

    await sql`
      CREATE TABLE IF NOT EXISTS "LaporanKeamanan" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "nomorLaporan" TEXT UNIQUE,
        "pelaporId" TEXT NOT NULL REFERENCES "Warga"("id") ON DELETE CASCADE,
        "judul" TEXT NOT NULL,
        "deskripsi" TEXT NOT NULL,
        "lokasi" TEXT,
        "status" TEXT DEFAULT 'PENDING',
        "tingkatUrgensi" TEXT DEFAULT 'SEDANG',
        "fotoBuktiUrl" TEXT,
        "tindakan" TEXT,
        "tanggal" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'LaporanKeamanan' verified");

    await sql`
      CREATE TABLE IF NOT EXISTS "AuthCode" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "code" TEXT UNIQUE NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'WARGA',
        "description" TEXT,
        "active" BOOLEAN DEFAULT true,
        "usedCount" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'AuthCode' verified");

    await sql`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
        "action" TEXT NOT NULL,
        "resource" TEXT NOT NULL,
        "details" TEXT,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✓ Table 'AuditLog' verified");

    // Seed Master Auth Codes
    await sql`
      INSERT INTO "AuthCode" ("code", "role", "description")
      VALUES
        ('RT04-WARGA-2026', 'WARGA', 'Kode Verifikasi Warga Resmi RT 04'),
        ('WARGA04', 'WARGA', 'Kode Cepat Warga RT 04'),
        ('RT04-PENGURUS-2026', 'PENGURUS', 'Kode Khusus Pengurus RT 04'),
        ('RT04-ADMIN-KEMAYORAN', 'ADMIN', 'Kode Master Administrator RT 04'),
        ('ADMIN04', 'ADMIN', 'Kode Cepat Admin RT 04')
      ON CONFLICT ("code") DO NOTHING;
    `;
    console.log("✓ Master AuthCodes seeded");

    // Seed Admin User
    const adminUser = await sql`
      INSERT INTO "User" ("email", "passwordHash", "role")
      VALUES ('admin@prisma.id', 'prisma123', 'ADMIN')
      ON CONFLICT ("email") DO UPDATE SET "role" = 'ADMIN'
      RETURNING "id";
    `;
    const adminId = adminUser[0]?.id;

    if (adminId) {
      await sql`
        INSERT INTO "Warga" ("userId", "nik", "nama", "alamat", "blok", "noRumah", "role", "status", "email", "telepon")
        VALUES (${adminId}, '3171010101900001', 'Swandaru Tirta (Administrator)', 'Gg. Bugis RT 04 RW 09', 'A', '1', 'ADMIN', 'AKTIF', 'admin@prisma.id', '087782380077')
        ON CONFLICT ("nik") DO NOTHING;
      `;
    }

    // Seed Ketua RT (Pengurus)
    const pengurusUser = await sql`
      INSERT INTO "User" ("email", "passwordHash", "role")
      VALUES ('ketua.rt@prisma.id', 'prisma123', 'PENGURUS')
      ON CONFLICT ("email") DO UPDATE SET "role" = 'PENGURUS'
      RETURNING "id";
    `;
    const pengurusId = pengurusUser[0]?.id;

    if (pengurusId) {
      const ketuaWarga = await sql`
        INSERT INTO "Warga" ("userId", "nik", "nama", "alamat", "blok", "noRumah", "role", "status", "email", "telepon")
        VALUES (${pengurusId}, '3171010202800002', 'Bpk. R Erry Adu Sundaru', 'Gg. Bugis RT 04 RW 09', 'A', '2', 'PENGURUS', 'AKTIF', 'ketua.rt@prisma.id', '087872004448')
        ON CONFLICT ("nik") DO UPDATE SET "nama" = 'Bpk. R Erry Adu Sundaru'
        RETURNING "id";
      `;
      const ketuaWargaId = ketuaWarga[0]?.id;
      if (ketuaWargaId) {
        await sql`
          INSERT INTO "Pengurus" ("wargaId", "jabatan", "periode")
          VALUES (${ketuaWargaId}, 'Ketua RT 04', '2024-2027')
          ON CONFLICT ("wargaId") DO NOTHING;
        `;
      }
    }

    console.log("✓ Initial Admin & Pengurus accounts ready in Neon");
    console.log("\n🚀 All Tables Created in Neon Postgres Successfully!");
  } catch (e) {
    console.error("Error executing SQL on Neon:", e);
  }
}

run();
