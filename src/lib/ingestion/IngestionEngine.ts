import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { parseCSV } from './parsers/csv';
import { parseTXT } from './parsers/txt';
import { parseJSON } from './parsers/json';
import { parseJSONL } from './parsers/jsonl';
import { Chunk, ParserOptions } from './parsers/types';

export class IngestionEngine {
  
  static async ingestFile(filePath: string, classification: string = 'INTERNAL'): Promise<{
    success: boolean;
    chunks: Chunk[];
    fingerprint: string;
    fileType: string;
    error?: string;
  }> {
    if (!fs.existsSync(filePath)) {
      return { success: false, chunks: [], fingerprint: '', fileType: 'UNKNOWN', error: 'File not found' };
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fingerprint = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const options: ParserOptions = { filePath, fileName, classification, fileType: ext.replace('.', '').toUpperCase() };

    let result;

    switch (ext) {
      case '.csv':
        result = parseCSV(options);
        break;
      case '.txt':
      case '.md':
        result = parseTXT(options);
        break;
      case '.json':
        result = parseJSON(options);
        break;
      case '.jsonl':
        result = await parseJSONL(options);
        break;
      default:
        return { success: false, chunks: [], fingerprint, fileType: 'UNKNOWN', error: `Unsupported file type: ${ext}` };
    }

    return {
      success: result.success,
      chunks: result.chunks,
      fingerprint,
      fileType: options.fileType,
      error: result.error,
    };
  }
}
