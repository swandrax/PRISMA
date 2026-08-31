import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { ParserOptions, Chunk } from './types';
import { filterPII, containsPromptInjection } from './pii-filter';

export function parseCSV(options: ParserOptions): { success: boolean; chunks: Chunk[]; error?: string } {
  try {
    const rawContent = fs.readFileSync(options.filePath, 'utf-8');
    
    const records = parse(rawContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const chunks: Chunk[] = [];
    let order = 0;

    for (const record of records) {
      // Create a string representation of the record
      let recordStr = Object.entries(record as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      recordStr = filterPII(recordStr);

      if (containsPromptInjection(recordStr)) {
        console.warn(`[CSV] Prompt injection detected in row ${order}, skipping.`);
        continue;
      }

      chunks.push({
        content: recordStr,
        metadata: {
          source: options.fileName,
          type: 'CSV',
          classification: options.classification || 'INTERNAL',
          row: order,
        },
        order,
      });

      order++;
    }

    return { success: true, chunks };
  } catch (error: unknown) {
    return { success: false, chunks: [], error: error instanceof Error ? error.message : String(error) };
  }
}
