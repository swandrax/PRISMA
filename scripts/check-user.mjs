import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const sql = neon(databaseUrl);

async function checkAndEnsureUser() {
  console.log("Checking User & Warga in Neon Postgres...");

  const email = "swandarutirtasandhika1@gmail.com";

  // Check if exists
  const existing = await sql`SELECT * FROM "User" WHERE LOWER("email") = ${email.toLowerCase()};`;
  console.log("User in Neon:", existing);

  // If not exists, insert user and warga
  if (!existing || existing.length === 0) {
    console.log("Inserting user & warga into Neon Postgres...");
    const userRes = await sql`
      INSERT INTO "User" ("email", "passwordHash", "role")
      VALUES (${email.toLowerCase()}, 'prisma123', 'WARGA')
      RETURNING "id";
    `;
    const userId = userRes[0].id;

    await sql`
      INSERT INTO "Warga" (
        "userId", "nik", "nama", "alamat", "blok", "noRumah", "rt", "rw", "telepon", "email", "role", "status"
      )
      VALUES (
        ${userId}, '3171012608980001', 'Swandaru Tirta Sandhika', 'Gg. Bugis RT 04 RW 09', 'A', '1', '04', '09', '087782380077', ${email.toLowerCase()}, 'WARGA', 'AKTIF'
      )
      ON CONFLICT ("nik") DO NOTHING;
    `;
    console.log("✓ User & Warga successfully created in Neon!");
  } else {
    console.log("User already exists in Neon Postgres!");
  }
}

checkAndEnsureUser();
