// scripts/generate_templates.mjs
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'templates', 'surat');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const templates = [
  {
    id: 'kematian',
    title: 'Surat Keterangan Kematian',
    content: `RUKUN TETANGGA 04 / RUKUN WARGA 09\nKELURAHAN KEMAYORAN, KECAMATAN KEMAYORAN\nJAKARTA PUSAT\n\nSURAT KETERANGAN KEMATIAN\nNomor: .../SKK/RT04-RW09/...\n\nYang bertanda tangan di bawah ini Ketua RT 04 RW 09 Kelurahan Kemayoran menerangkan bahwa:\nNama: [Nama Almarhum/Almarhumah]\nNIK: [NIK]\nTempat/Tgl Lahir: [Tempat, Tanggal Lahir]\nAlamat: [Alamat Lengkap]\nTelah meninggal dunia pada:\nHari/Tanggal: [Hari, Tanggal]\nPukul: [Waktu]\nTempat: [Tempat Meninggal]\nPenyebab: [Sakit / Usia Lanjut / dll]\n\nDemikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.\n\nJakarta, ....................\nKetua RT 04 RW 09\n\n\n( R Erry Adu Sundaru )`
  },
  {
    id: 'sktm',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    content: `RUKUN TETANGGA 04 / RUKUN WARGA 09\nKELURAHAN KEMAYORAN, KECAMATAN KEMAYORAN\nJAKARTA PUSAT\n\nSURAT KETERANGAN TIDAK MAMPU\nNomor: .../SKTM/RT04-RW09/...\n\nYang bertanda tangan di bawah ini Ketua RT 04 RW 09 Kelurahan Kemayoran menerangkan bahwa:\nNama: [Nama Pemohon]\nNIK: [NIK]\nTempat/Tgl Lahir: [Tempat, Tanggal Lahir]\nPekerjaan: [Pekerjaan]\nAlamat: [Alamat Lengkap RT 04 RW 09]\n\nAdalah benar warga kami yang tergolong keluarga tidak mampu / pra-sejahtera, dan surat ini dibuat untuk keperluan:\n[Keperluan Beasiswa / KJP / Pengobatan / dll].\n\nDemikian surat keterangan ini dibuat dengan sebenarnya.\n\nJakarta, ....................\nKetua RT 04 RW 09\n\n\n( R Erry Adu Sundaru )`
  },
  {
    id: 'pindah',
    title: 'Surat Pengantar Pindah Domisili',
    content: `RUKUN TETANGGA 04 / RUKUN WARGA 09\nKELURAHAN KEMAYORAN, KECAMATAN KEMAYORAN\nJAKARTA PUSAT\n\nSURAT PENGANTAR PINDAH\nNomor: .../SPP/RT04-RW09/...\n\nYang bertanda tangan di bawah ini Ketua RT 04 RW 09 menerangkan bahwa:\nNama: [Nama Pemohon]\nNIK: [NIK]\nNo. KK: [Nomor Kartu Keluarga]\nAlamat Asal: [Alamat Lengkap RT 04 RW 09]\nAlamat Tujuan: [Alamat Tujuan Pindah Lengkap]\nAlasan Pindah: [Pekerjaan / Perumahan / Mengikuti Keluarga / dll]\nJumlah Pengikut: [.....] Orang\n\nDemikian surat pengantar ini dibuat untuk proses administrasi kependudukan di Kelurahan.\n\nJakarta, ....................\nKetua RT 04 RW 09\n\n\n( R Erry Adu Sundaru )`
  },
  {
    id: 'umum',
    title: 'Surat Keterangan RT (Umum)',
    content: `RUKUN TETANGGA 04 / RUKUN WARGA 09\nKELURAHAN KEMAYORAN, KECAMATAN KEMAYORAN\nJAKARTA PUSAT\n\nSURAT KETERANGAN PENGANTAR\nNomor: .../SK/RT04-RW09/...\n\nYang bertanda tangan di bawah ini Ketua RT 04 RW 09 menerangkan bahwa:\nNama: [Nama Pemohon]\nNIK: [NIK]\nTempat/Tgl Lahir: [Tempat, Tanggal Lahir]\nJenis Kelamin: [Laki-laki / Perempuan]\nAgama: [Agama]\nPekerjaan: [Pekerjaan]\nAlamat: [Alamat Lengkap RT 04 RW 09]\nKeperluan: [Keterangan Domisili / Pembuatan SKCK / Buka Rekening / dll]\n\nDemikian surat keterangan ini dibuat untuk dipergunakan sesuai keperluannya.\n\nJakarta, ....................\nKetua RT 04 RW 09\n\n\n( R Erry Adu Sundaru )`
  }
];

function generateMinimalPdf(title, body) {
  const content = `${title}\n\n${body}`;
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${content.length + 100} >>
stream
BT
/F1 12 Tf
50 780 Td
(${title}) Tj
0 -30 Td
(${content.replace(/[\(\)\\]/g, '').replace(/\n/g, ') Tj T* (')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000400 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
490
%%EOF`;
  return Buffer.from(pdfString);
}

for (const t of templates) {
  const docxPath = path.join(dir, `${t.id}.docx`);
  const pdfPath = path.join(dir, `${t.id}.pdf`);

  fs.writeFileSync(docxPath, t.content, 'utf8');
  fs.writeFileSync(pdfPath, generateMinimalPdf(t.title, t.content));
  console.log(`Generated: ${t.id}.docx and ${t.id}.pdf`);
}
console.log('All templates created in public/templates/surat/');
