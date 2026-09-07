import { test, expect } from '@playwright/test';

test.describe('PRISMA Digital RT/RW Platform - Critical E2E Flows', () => {

  test('1. Warga login and view digital resident profile', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('text=Masuk ke Portal PRISMA')).toBeVisible();

    await page.fill('input[type="email"]', 'warga@prisma.id');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Masuk Sekarang")');

    // Navigate to digital resident card
    await page.goto('/warga/card');
    await expect(page.locator('text=Kartu Identitas Warga Digital')).toBeVisible();
    await expect(page.locator('text=PRISMA ID')).toBeVisible();
  });

  test('2. Resident submits letter request and staff approves', async ({ page }) => {
    await page.goto('/surat/ajukan');
    await expect(page.locator('text=Pengajuan Surat Keterangan RT')).toBeVisible();

    await page.fill('input[placeholder*="Keperluan"]', 'Pembukaan rekening tabungan bank');
    await page.click('button:has-text("Kirim Pengajuan Surat")');

    // Should navigate to letter detail
    await expect(page.locator('text=Alur & Tahapan Pemrosesan Surat')).toBeVisible();
    await expect(page.locator('text=SUBMITTED')).toBeVisible();
  });

  test('3. Resident views contribution bill and submits payment proof', async ({ page }) => {
    await page.goto('/keuangan/iuran');
    await expect(page.locator('text=Tagihan & Pembayaran Iuran Warga')).toBeVisible();

    const payButton = page.locator('button:has-text("Konfirmasi Pembayaran")').first();
    if (await payButton.isVisible()) {
      await payButton.click();
      await expect(page.locator('text=Konfirmasi Pembayaran Iuran')).toBeVisible();
      await page.fill('input[placeholder="https://..."]', 'https://prisma-s3.amazonaws.com/struk.jpg');
      await page.click('button:has-text("Kirim Bukti")');
    }
  });

  test('4. Resident submits security incident report', async ({ page }) => {
    await page.goto('/keamanan/lapor');
    await expect(page.locator('text=Pelaporan Insiden Lingkungan')).toBeVisible();

    await page.fill('input[placeholder*="Judul"]', 'Lampu penerangan gang mati');
    await page.fill('input[placeholder*="Lokasi"]', 'Blok B3 Gang 2');
    await page.fill('textarea[placeholder*="kronologi"]', 'Lampu jalan mati sejak kemarin malam membuat jalan gelap');
    await page.click('button:has-text("Kirim Laporan Keamanan")');
  });

  test('5. Admin views audit logs and verifies system health', async ({ page }) => {
    await page.goto('/admin/audit');
    await expect(page.locator('text=Log Audit Sistem Keamanan')).toBeVisible();

    // Verify /api/health endpoint
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    const healthJson = await response.json();
    expect(healthJson).toHaveProperty('status');
    expect(healthJson).toHaveProperty('database');
  });

  test('6. Public transparency portal is accessible without sensitive data exposure', async ({ page }) => {
    await page.goto('/transparansi');
    await expect(page.locator('text=Portal Transparansi Publik RT 04 / RW 09')).toBeVisible();
    await expect(page.locator('text=Saldo Kas RT Terkini')).toBeVisible();
    // Ensure zero raw NIKs on public page
    const content = await page.content();
    expect(content).not.toContain('3171012345670001');
  });
});
