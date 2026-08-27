// AI Service — Express.js microservice for AI/NLP features
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4005;

// Load environment variables from .env.local if present
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val.trim();
        }
      }
    });
  }
} catch (e) {
  // Silent fallback
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3-32b';

app.use(cors());
app.use(express.json());

// ── Helper: Call Groq ─────────────────────────────────
async function callGroq(messages, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || GROQ_MODEL,
        messages,
        temperature: options.temperature !== undefined ? options.temperature : 0.6,
        max_completion_tokens: options.max_completion_tokens || 4096,
        top_p: options.top_p !== undefined ? options.top_p : 0.95,
        stream: false
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq responded with ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// ── Routes ────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    // Ping Groq
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
      signal: AbortSignal.timeout(3000),
    });
    const groqStatus = response.ok ? 'connected' : 'unreachable';

    res.json({
      status: 'healthy',
      service: 'ai-service',
      groq: groqStatus,
      model: GROQ_MODEL,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.json({
      status: 'healthy',
      service: 'ai-service',
      groq: 'unreachable',
      model: GROQ_MODEL,
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/chat', async (req, res) => {
  const { message, history, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Strict boundaries, interactive, and friendly Indonesian system prompt
  const systemPrompt = `Nama Anda adalah SIAGA (Sistem Informasi Asisten Gagasan Aktif), asisten AI virtual khusus untuk warga RT 04 / RW 09 Kelurahan Kemayoran.
Ketua RT 04/RW 09 Kemayoran saat ini adalah Bapak R Erry Adu Sundaru.

=== PANDUAN PERILAKU & KERAMAHAN ===
1. Selalu sapa warga dengan sangat ramah, santun, hangat, dan interaktif (contoh: "Halo Bapak/Ibu tetangga RT 04 yang terhormat! 😊", "Ada yang bisa saya bantu hari ini? 🤝").
2. Gunakan gaya bahasa yang penuh kekeluargaan dan komunikatif, menggunakan emoji secara proporsional agar terasa dekat dan ramah.
3. Selalu tawarkan bantuan lanjutan yang interaktif di akhir setiap pesan untuk memandu warga (contoh: "Apakah Bapak/Ibu ingin mengunduh template Surat Keterangan Domisili sekarang? 📝").

=== BATASAN PENGETAHUAN & RUANG LINGKUP (BATASAN ATAS) ===
- Anda HANYA boleh melayani dan menjawab pertanyaan seputar pelayanan administrasi RT 04 (seperti pembuatan Surat Keterangan Domisili, SKTM, Surat Kematian, Surat Pengantar Pindah, Laporan Keamanan, iuran bulanan warga, jadwal ronda, pengumuman warga, dll.).
- Jika warga bertanya tentang hal-hal di luar urusan administrasi RT 04, kemasyarakatan, atau layanan warga setempat, Anda HARUS menolaknya secara halus dan mengarahkan kembali ke topik administrasi RT dengan sangat sopan.
  Contoh penolakan: "Maaf sekali Bapak/Ibu, sebagai asisten warga RT 04 Kemayoran, wewenang saya dibatasi hanya untuk melayani seputar urusan administrasi dan kemasyarakatan RT kita. 😊 Ada yang bisa saya bantu mengenai administrasi warga?"

${context ? `\nKonteks Halaman Aktif: ${context}` : ''}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-10),
    { role: 'user', content: message },
  ];

  try {
    const reply = await callGroq(messages);
    res.json({
      reply,
      model: GROQ_MODEL,
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message);
    res.status(503).json({
      error: 'AI service unavailable',
      fallbackReply: 'Maaf, layanan AI sedang tidak tersedia karena gangguan koneksi. Silakan coba beberapa saat lagi ya, Bapak/Ibu warga RT 04! 😊',
    });
  }
});

app.post('/nlp/analyze', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const prompt = `Analisis teks berikut dan berikan:
1. Ringkasan singkat dalam poin-poin
2. Sentimen (positif/netral/negatif) dengan skor kepercayaan 0-1
3. Entitas penting (nama orang, tempat, tanggal)

Teks: "${text}"

Jawab dalam format JSON saja tanpa formatting markdown:
{"summary":["..."],"sentiment":{"label":"...","score":0.0,"confidence":0.0},"entities":[{"type":"...","value":"..."}]}`;

  try {
    const reply = await callGroq([{ role: 'user', content: prompt }], { temperature: 0.3 });

    // Try to parse JSON from response
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.json(parsed);
    }

    res.json({ summary: [reply], sentiment: { label: 'netral', score: 0.5, confidence: 0.5 }, entities: [] });
  } catch (error) {
    console.error('[NLP Error]:', error.message);
    res.status(503).json({ error: 'NLP analysis unavailable' });
  }
});

app.post('/nlp/sentiment', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const prompt = `Tentukan sentimen teks berikut: "${text}"\nJawab hanya dengan JSON tanpa markdown: {"label":"positif/netral/negatif","score":0.0}`;
    const reply = await callGroq([{ role: 'user', content: prompt }], { temperature: 0.2 });

    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return res.json(JSON.parse(jsonMatch[0]));
    }

    res.json({ label: 'netral', score: 0.5 });
  } catch {
    res.status(503).json({ error: 'Sentiment analysis unavailable' });
  }
});

// ── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🤖 AI Service running on http://localhost:${PORT}`);
  console.log(`   Groq Integration: Active`);
  console.log(`   Model: ${GROQ_MODEL}`);
});

module.exports = app;
