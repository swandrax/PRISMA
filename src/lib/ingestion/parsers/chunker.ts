import { Chunk } from "./types";

export function chunkText(text: string, metadata: Record<string, unknown>): Chunk[] {
  // A simple chunking strategy: split by double newlines (paragraphs)
  // In a real scenario, this could use a sophisticated tokenizer
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  
  return paragraphs.map((p, index) => ({
    content: p,
    metadata: { ...metadata, sectionIndex: index },
    order: index,
  }));
}
