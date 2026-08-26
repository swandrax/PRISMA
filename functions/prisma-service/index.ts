/**
 * PRISMA RT 04 — Neon Serverless Function
 * Handles RT 04 citizen status queries and financial ledger summaries
 */

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/health" || url.pathname === "/") {
    return new Response(
      JSON.stringify({
        status: "ok",
        service: "PRISMA RT 04 Neon Serverless Function",
        tenant: "RT 04 / RW 09 Kemayoran",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (url.pathname === "/info") {
    return new Response(
      JSON.stringify({
        rt: "04",
        rw: "09",
        kelurahan: "Kemayoran",
        kota: "Jakarta Pusat",
        layanan: [
          "Surat Pengantar Online",
          "Cek Kas & Iuran Warga",
          "Laporan Keamanan & Ketertiban",
          "AI Chatbot Mbak PRISMA",
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      error: "Not Found",
      availableEndpoints: ["/", "/health", "/info"],
    }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
}
