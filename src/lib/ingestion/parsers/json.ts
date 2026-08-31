import fs from 'fs';
import { ParserOptions, Chunk } from './types';
import { filterPII, containsPromptInjection } from './pii-filter';
import { chunkText } from './chunker';

export function parseJSON(options: ParserOptions): { success: boolean; chunks: Chunk[]; error?: string } {
  try {
    const rawContent = fs.readFileSync(options.filePath, 'utf-8');
    const parsed = JSON.parse(rawContent);
    
    // Normalize JSON representation
    let jsonStr = JSON.stringify(parsed, null, 2);
    
    jsonStr = filterPII(jsonStr);

    if (containsPromptInjection(jsonStr)) {
      return { success: false, chunks: [], error: "Prompt injection detected in JSON file." };
    }

    const metadata = {
      source: options.fileName,
      type: 'JSON',
      classification: options.classification || 'INTERNAL',
    };

    // For deeply nested giant JSONs, we can use the text chunker as a fallback
    // In a highly optimized system, we would traverse the tree and chunk logically
    const chunks = chunkText(jsonStr, metadata);

    return { success: true, chunks };
  } catch (error: unknown) {
    return { success: false, chunks: [], error: error instanceof Error ? error.message : String(error) };
  }
}
