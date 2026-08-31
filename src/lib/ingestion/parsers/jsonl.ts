import fs from 'fs';
import readline from 'readline';
import { ParserOptions, Chunk } from './types';
import { filterPII, containsPromptInjection } from './pii-filter';

export async function parseJSONL(options: ParserOptions): Promise<{ success: boolean; chunks: Chunk[]; error?: string }> {
  try {
    const fileStream = fs.createReadStream(options.filePath);
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const chunks: Chunk[] = [];
    let order = 0;

    for await (const line of rl) {
      if (!line.trim()) continue;

      try {
        const parsed = JSON.parse(line);
        let recordStr = JSON.stringify(parsed);
        
        recordStr = filterPII(recordStr);

        if (containsPromptInjection(recordStr)) {
          console.warn(`[JSONL] Prompt injection detected in row ${order}, skipping.`);
          continue;
        }

        chunks.push({
          content: recordStr,
          metadata: {
            source: options.fileName,
            type: 'JSONL',
            classification: options.classification || 'INTERNAL',
            row: order,
          },
          order,
        });

      } catch {
        console.warn(`[JSONL] Malformed JSON at line ${order}, skipping.`);
      }
      order++;
    }

    return { success: true, chunks };
  } catch (error: unknown) {
    return { success: false, chunks: [], error: error instanceof Error ? error.message : String(error) };
  }
}
