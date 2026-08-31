export interface ParseResult {
  success: boolean;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ParserOptions {
  filePath: string;
  fileName: string;
  classification?: string;
  fileType: string;
}

export interface Chunk {
  content: string;
  metadata: Record<string, unknown>;
  order: number;
}
