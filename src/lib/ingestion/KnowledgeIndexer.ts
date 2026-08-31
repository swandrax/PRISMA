import { getNeonSql } from '@/lib/neon';
import { Chunk } from './parsers/types';

export class KnowledgeIndexer {
  /**
   * Persists chunks to the KnowledgeStore.
   */
  static async indexDocument(documentId: string, chunks: Chunk[]): Promise<{ indexed: number; failed: number }> {
    const sql = getNeonSql();
    let indexed = 0;
    let failed = 0;

    for (const chunk of chunks) {
      try {
        await sql`
          INSERT INTO "KnowledgeChunk" ("id", "documentId", "content", "metadata", "order", "createdAt")
          VALUES (
            gen_random_uuid(),
            ${documentId},
            ${chunk.content},
            ${JSON.stringify(chunk.metadata)},
            ${chunk.order},
            NOW()
          )
        `;
        indexed++;
      } catch (err) {
        console.error(`Failed to index chunk ${chunk.order} for doc ${documentId}`, err);
        failed++;
      }
    }

    return { indexed, failed };
  }

  /**
   * Performs incremental ingestion checking.
   * If the file has the same fingerprint, it returns the existing document ID.
   */
  static async getOrRegisterDocument(
    filename: string, 
    fileType: string, 
    classification: string, 
    fingerprint: string
  ): Promise<{ documentId: string; isNew: boolean }> {
    const sql = getNeonSql();

    // Check existing fingerprint
    const existing = await sql`
      SELECT id FROM "KnowledgeDocument" 
      WHERE fingerprint = ${fingerprint}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return { documentId: existing[0].id, isNew: false };
    }

    // Insert new document record
    const newDoc = await sql`
      INSERT INTO "KnowledgeDocument" (
        "id", "filename", "fileType", "status", "classification", "fingerprint", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        ${filename},
        ${fileType},
        'PROCESSING',
        ${classification},
        ${fingerprint},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    return { documentId: newDoc[0].id, isNew: true };
  }

  static async markDocumentStatus(
    documentId: string,
    status: 'COMPLETED' | 'FAILED' | 'PARTIALLY_COMPLETED',
    errorMessage?: string
  ) {
    const sql = getNeonSql();
    await sql`
      UPDATE "KnowledgeDocument"
      SET 
        status = ${status},
        "errorMessage" = ${errorMessage || null},
        "updatedAt" = NOW()
      WHERE id = ${documentId}
    `;
  }
}
