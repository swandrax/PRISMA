# Panduan Migrasi ke Arsitektur Multi-Tenant PRISMA Kemayoran

Dokumen ini berisi panduan lengkap untuk melakukan migrasi dari aplikasi PRISMA RT04 (Single-Tenant) ke PRISMA Kemayoran (Multi-Tenant).

---

## 1. Pre-Migration Checklist

Sebelum melakukan migrasi di environment production, pastikan Anda telah menyelesaikan hal-hal berikut:

- [ ] **Backup Database**: Lakukan full backup database Supabase Anda saat ini melalui dashboard Supabase (Database -> Backups).
- [ ] **Staging Environment**: Sangat disarankan untuk menguji proses ini di project Supabase dan Vercel khusus staging terlebih dahulu.
- [ ] **Domain & DNS**: Pastikan domain utama (`prisma-kemayoran.id`) telah terhubung dengan Vercel/Cloudflare dan Anda bisa mengatur *wildcard DNS* (`*.prisma-kemayoran.id`) mengarah ke server Vercel.
- [ ] **Informasikan Warga**: Berikan pengumuman bahwa aplikasi akan mengalami *downtime* atau pemeliharaan singkat selama proses migrasi.

---

## 2. Step-by-step Migration

Ikuti langkah-langkah berikut secara berurutan:

### Step 1: Jalankan SQL Migration
1. Buka Supabase Dashboard > SQL Editor.
2. Salin isi file `supabase/migrations/20260528000002_multitenant.sql`.
3. Jalankan *query* tersebut. Script ini akan:
   - Membuat tabel `rt_units` dan `rw_admins`.
   - Mengisi data awal untuk RT 04 (agar data yang sudah ada tidak hilang).
   - Menambahkan kolom `rt_id` pada semua tabel jika belum ada, dan menghubungkannya dengan ID RT04.
   - Mengganti seluruh *Row Level Security* (RLS) agar berbasis RT.

### Step 2: Update Environment Variables
1. Perbarui environment variables di Vercel atau `.env.local` lokal Anda.
2. Pastikan variabel berikut tersedia:
   ```env
   NEXT_PUBLIC_DEFAULT_RT_ID="<id-rt04-dari-database>"
   NEXT_PUBLIC_SITE_URL="https://prisma-kemayoran.id"
   ```
   *(Opsional jika menggunakan setup lokal, ganti `NEXT_PUBLIC_SITE_URL` dengan `http://localhost:3000`)*

### Step 3: Deploy Kode Terbaru (Middleware)
1. Lakukan push/deploy kode terbaru yang berisi pembaruan `src/middleware.ts` ke Vercel.
2. Middleware ini bertugas mencegat (*intercept*) subdomain dan mengatur *header* tenant.

### Step 4: Setup Domain Wildcard di Vercel
1. Masuk ke dashboard proyek di Vercel > Settings > Domains.
2. Tambahkan domain: `*.prisma-kemayoran.id`.
3. Pastikan `vercel.json` dengan konfigurasi *rewrites* sudah ter-deploy.

### Step 5: Test Subdomain RT04
1. Buka `https://rt04.prisma-kemayoran.id` di browser.
2. Pastikan halaman termuat dengan benar.
3. Login sebagai pengurus dan warga RT 04.

### Step 6: Verifikasi Data Aksesibilitas
1. Periksa apakah data pengumuman, keuangan, dan surat pengajuan RT04 lama masih muncul.
2. Cobalah buat surat pengajuan baru, pastikan berhasil masuk.

### Step 7: Jalankan Isolation Test
Jika Anda memiliki akses terminal ke CI/CD atau lokal:
```bash
npm run test tests/isolation.test.ts
```
Pastikan seluruh tes untuk *Data Isolation* berwarna hijau (Lulus).

### Step 8: Pengumuman Berhasil
Beri tahu warga RT04 bahwa URL aplikasi sekarang telah berubah menjadi `rt04.prisma-kemayoran.id`.

---

## 3. Rollback Plan

Jika terjadi *critical failure* (misalnya: tidak ada user yang bisa login, data hilang dari dashboard) dalam waktu 24 jam setelah migrasi, ikuti prosedur berikut:

1. **Revert Routing Vercel**:
   - Hapus aturan domain wildcard `*.prisma-kemayoran.id` dari Vercel.
   - Rollback *deployment* Vercel ke versi sebelum middleware baru di-deploy (menggunakan fitur *Instant Rollback* Vercel).

2. **Revert Database RLS**:
   - Buka SQL Editor di Supabase.
   - Hapus policy multi-tenant dan kembalikan ke policy sederhana tanpa cek `rt_id`:
     ```sql
     -- Contoh untuk tabel pengumuman
     DROP POLICY IF EXISTS "Warga Read pengumuman" ON public.pengumuman;
     CREATE POLICY "Enable read access for all users" ON public.pengumuman FOR SELECT USING (true);
     -- Lakukan hal serupa untuk policy lain jika diperlukan secara darurat.
     ```
   - (Alternatif) Cukup matikan RLS sementara untuk *recovery* darurat (SANGAT TIDAK DISARANKAN KECUALI DARURAT):
     ```sql
     ALTER TABLE public.pengumuman DISABLE ROW LEVEL SECURITY;
     ```

3. **Restore Backup**:
   Jika skema terlanjur rusak parah, *restore* database Supabase dari *Point in Time Recovery* (PITR) ke 1 jam sebelum proses migrasi.

---

## 4. Post-Migration Checklist

Setelah migrasi selesai dan dinilai stabil:

- [ ] Seluruh RLS policy berbasis `get_user_rt_id()` telah aktif di semua tabel.
- [ ] Isolation test passed tanpa *error*.
- [ ] Data historical RT04 dapat diakses 100%.
- [ ] Integrasi webhook Telegram bot masih merespons `chat_id` yang benar.
- [ ] PWA `manifest.json` tetap bekerja pada *start_url* subdomain.
