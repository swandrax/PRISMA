import * as dotenv from "dotenv";
import WebSocket from "ws";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

interface WAVHeaderOptions {
  sampleRate?: number;
  numChannels?: number;
  bitsPerSample?: number;
}

/**
 * Creates a standard 44-byte WAV header for PCM16 audio
 */
function createWAVHeader(dataLength: number, options: WAVHeaderOptions = {}): Buffer {
  const sampleRate = options.sampleRate || 24000;
  const numChannels = options.numChannels || 1;
  const bitsPerSample = options.bitsPerSample || 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  const buffer = Buffer.alloc(44);

  // RIFF Chunk Descriptor
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);

  // "fmt " Sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // "data" Sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

// AI Gateway Realtime Configuration Interface
export const gateway = {
  experimental_realtime: {
    async getToken(options: { model: string }) {
      const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY || "";
      const baseApiUrl = process.env.AI_GATEWAY_URL || "https://api.openai.com/v1";

      return {
        token: apiKey,
        url: `${baseApiUrl.replace(/^http/, "ws")}/realtime?model=${encodeURIComponent(options.model)}`,
        model: options.model,
      };
    },
  },
};

// Model Realtime Protocol Helpers
export const realtimeModel = {
  getWebSocketConfig(tokenInfo: { token: string; url: string }) {
    return {
      url: tokenInfo.url,
      protocols: ["realtime"],
      headers: {
        Authorization: `Bearer ${tokenInfo.token}`,
        "OpenAI-Beta": "realtime=v1",
      },
    };
  },

  serializeClientEvent(event: Record<string, unknown>): string {
    return JSON.stringify(event);
  },

  parseServerEvent(data: string | Buffer): Record<string, unknown> {
    const raw = typeof data === "string" ? data : data.toString("utf-8");
    try {
      return JSON.parse(raw);
    } catch {
      return { type: "unknown", raw };
    }
  },
};

async function main() {
  console.log("🚀 Initializing AI Gateway Realtime Client...");

  const targetModel = "spacexai/grok-voice-think-fast-1.0";
  const tokenInfo = await gateway.experimental_realtime.getToken({ model: targetModel });
  const wsConfig = realtimeModel.getWebSocketConfig(tokenInfo);

  console.log(`🔌 Connecting to Realtime AI Gateway with model: ${targetModel}`);

  const pcmChunks: Buffer[] = [];
  const outputPath = path.resolve(process.cwd(), "output-realtime.wav");

  const ws = new WebSocket(wsConfig.url, wsConfig.protocols, {
    headers: wsConfig.headers,
  });

  ws.on("open", () => {
    console.log("✅ WebSocket Connected! Sending conversation prompt...");

    // 1. Create conversation item
    const createItemEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Halo Mbak PRISMA, jelaskan jadwal kegiatan dan layanan warga RT 04 Kemayoran secara singkat!",
          },
        ],
      },
    };
    ws.send(realtimeModel.serializeClientEvent(createItemEvent));

    // 2. Request response creation with audio modalities
    const createResponseEvent = {
      type: "response.create",
      response: {
        modalities: ["text", "audio"],
        voice: "alloy",
        output_audio_format: "pcm16",
      },
    };
    ws.send(realtimeModel.serializeClientEvent(createResponseEvent));
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ws.on("message", (data: any) => {
    const event = realtimeModel.parseServerEvent(data.toString());

    // Print text transcript delta
    if (
      event.type === "response.audio_transcript.delta" ||
      event.type === "audio-transcript-delta"
    ) {
      const delta = (event.delta as string) || (event.text as string) || "";
      process.stdout.write(delta);
    }

    // Collect PCM16 audio delta chunks
    if (
      event.type === "response.audio.delta" ||
      event.type === "audio-delta"
    ) {
      const deltaBase64 = (event.delta as string) || "";
      if (deltaBase64) {
        const chunk = Buffer.from(deltaBase64, "base64");
        pcmChunks.push(chunk);
      }
    }

    // Handle response completion
    if (
      event.type === "response.done" ||
      event.type === "response-done"
    ) {
      console.log("\n\n🎉 Response Done received!");

      if (pcmChunks.length > 0) {
        const totalPcm = Buffer.concat(pcmChunks);
        const wavHeader = createWAVHeader(totalPcm.length, { sampleRate: 24000 });
        const wavFile = Buffer.concat([wavHeader, totalPcm]);

        fs.writeFileSync(outputPath, wavFile);
        console.log(`💾 Playable WAV Audio written to: ${outputPath} (${wavFile.length} bytes)`);
      } else {
        console.log("ℹ️ No audio chunks received in this response.");
      }

      ws.close();
    }
  });

  ws.on("error", (error: Error) => {
    console.error("❌ WebSocket Error:", error.message);
  });

  ws.on("close", (code: number, reason: Buffer) => {
    console.log(`🔌 Connection closed (code: ${code}, reason: ${reason?.toString() || "none"})`);
  });
}

main().catch((err) => {
  console.error("Fatal Error:", err);
});
