import { getSystemHealth } from './server/services/health.service';
import { searchGlobal } from './server/services/search.service';
import { verifyDocumentCode } from './server/services/qr.service';
import { getPublicTransparencyData } from './server/repositories/keuangan.repo';
import { getWargaList, getOrCreateResidentCard } from './server/repositories/warga.repo';
import { getSuratList, createSurat } from './server/repositories/surat.repo';

export {
  getSystemHealth,
  searchGlobal,
  verifyDocumentCode,
  getPublicTransparencyData,
  getWargaList,
  getOrCreateResidentCard,
  getSuratList,
  createSurat,
};

export async function handleApiRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // 1. Health check
  if (path === '/api/health') {
    const health = await getSystemHealth();
    return new Response(JSON.stringify(health), {
      status: health.status === 'unhealthy' ? 503 : 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Global search
  if (path === '/api/search') {
    const q = url.searchParams.get('q') || '';
    const results = await searchGlobal(q);
    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Document / Resident QR Verification
  if (path.startsWith('/api/verify/')) {
    const code = path.replace('/api/verify/', '');
    const result = await verifyDocumentCode(code);
    return new Response(JSON.stringify(result), {
      status: result.valid ? 200 : 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Public transparency
  if (path === '/api/transparansi') {
    const data = await getPublicTransparencyData();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. Warga directory
  if (path === '/api/warga') {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const search = url.searchParams.get('search') || undefined;
    const data = await getWargaList({ page, limit, search });
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (path.startsWith('/api/warga/card')) {
    // Default demo/current user card
    const data = await getOrCreateResidentCard('default-resident');
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 6. Surat services
  if (path === '/api/surat') {
    if (req.method === 'POST') {
      const body = await req.json();
      const surat = await createSurat({
        wargaId: body.wargaId || 'default-resident',
        jenisSurat: body.jenisSurat,
        keperluan: body.keperluan,
        catatan: body.catatan,
        fileDokumenUrl: body.fileDokumenUrl,
      });
      return new Response(JSON.stringify(surat), { status: 201 });
    }
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const data = await getSuratList({ page, limit });
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Endpoint Not Found' }), { status: 404 });
}
