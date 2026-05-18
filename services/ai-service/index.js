// AI Service — Express.js microservice for AI/NLP features
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4005;

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

app.use(cors());
app.use(express.json());

// ── Helper: Call Ollama ───────────────────────────────
async function callOllama(messages, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || OLLAMA_MODEL,
        messages,
        stream: false,
        options: { temperature: options.temperature || 0.7 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// ── Routes ────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    // Try to reach Ollama
    const response = await fetch(OLLAMA_API_URL.replace('/api/chat', '/api/tags'), {
      signal: AbortSignal.timeout(3000),
    });
    const ollamaStatus = response.ok ? 'connected' : 'unreachable';

    res.json({
      status: 'healthy',
      service: 'ai-service',
      ollama: ollamaStatus,
      model: OLLAMA_MODEL,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.json({
      status: 'healthy',
      service: 'ai-service',
      ollama: 'unreachable',
      model: OLLAMA_MODEL,
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/chat', async (req, res) => {
  const { message, history, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemPrompt = `Kamu adalah SIAGA (Sistem Informasi Asisten Gagasan Aktif), asisten AI untuk warga RT 04/RW 09 Kemayoran. Ketua RT 04/RW 09 Kemayoran saat ini adalah Bapak R Erry Adu Sundaru.
${context ? `\nKonteks: ${context}` : ''}
Berikan jawaban yang singkat, ramah, dan informatif dalam Bahasa Indonesia.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-10),
    { role: 'user', content: message },
  ];

  try {
    const reply = await callOllama(messages);
    res.json({
      reply,
      model: OLLAMA_MODEL,
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message);
    res.status(503).json({
      error: 'AI service unavailable',
      fallbackReply: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.',
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

Jawab dalam format JSON:
{"summary":["..."],"sentiment":{"label":"...","score":0.0,"confidence":0.0},"entities":[{"type":"...","value":"..."}]}`;

  try {
    const reply = await callOllama([{ role: 'user', content: prompt }], { temperature: 0.3 });

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
    const prompt = `Tentukan sentimen teks berikut: "${text}"\nJawab hanya dengan JSON: {"label":"positif/netral/negatif","score":0.0}`;
    const reply = await callOllama([{ role: 'user', content: prompt }], { temperature: 0.2 });

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
  console.log(`   Ollama: ${OLLAMA_API_URL}`);
  console.log(`   Model: ${OLLAMA_MODEL}`);
});

module.exports = app;
