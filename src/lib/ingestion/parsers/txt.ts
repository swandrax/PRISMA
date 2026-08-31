import fs from 'fs';
import { ParserOptions, Chunk } from './types';
import { filterPII, containsPromptInjection } from './pii-filter';
import { chunkText } from './chunker';

export function parseTXT(options: ParserOptions): { success: boolean; chunks: Chunk[]; error?: string } {
  try {
    let rawContent = fs.readFileSync(options.filePath, 'utf-8');
    
    // Normalize newlines
    rawContent = rawContent.replace(/\r\n/g, '\n');
    
    rawContent = filterPII(rawContent);

    if (containsPromptInjection(rawContent)) {
      return { success: false, chunks: [], error: "Prompt injection detected in TXT file." };
    }

    const metadata = {
      source: options.fileName,
      type: 'TXT',
      classification: options.classification || 'INTERNAL',
    };

    const chunks = chunkText(rawContent, metadata);

    return { success: true, chunks };
  } catch (error: unknown) {
    return { success: false, chunks: [], error: error instanceof Error ? error.message : String(error) };
  }
}
