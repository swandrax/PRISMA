import { NextRequest, NextResponse } from "next/server";
import { getNeonSql } from "@/lib/neon";
import { askAIGateway } from "@/lib/ai-gateway";

export const maxDuration = 60; // Allow edge function to run up to 60s
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Simple security check (e.g. CRON secret or bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "local-cron-secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getNeonSql();
    
    // 1. Fetch one pending task and atomically mark it as PROCESSING
    // We use a subquery with FOR UPDATE SKIP LOCKED to prevent concurrent workers from picking the same job.
    const pendingJobs = await sql`
      UPDATE "LlmQueue"
      SET status = 'PROCESSING', "updatedAt" = NOW()
      WHERE id = (
        SELECT id FROM "LlmQueue"
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `;

    if (pendingJobs.length === 0) {
      return NextResponse.json({ message: "No pending tasks." });
    }

    const job = pendingJobs[0];

    // 2. Process the job based on taskType
    let resultPayload = {};
    
    try {
      if (job.taskType === "SUMMARIZE_LAPORAN") {
        const { text } = job.payload;
        const aiResponse = await askAIGateway([
          { role: "system", content: "You are an assistant summarizing reports." },
          { role: "user", content: `Please summarize this: ${text}` }
        ]);
        
        if (aiResponse.error) throw new Error(aiResponse.error);
        resultPayload = { summary: aiResponse.text };
      } else if (job.taskType === "TEST_JOB") {
        resultPayload = { success: true, message: "Test job executed successfully" };
      } else if (job.taskType === "INGEST_KNOWLEDGE") {
        const { IngestionEngine } = await import("@/lib/ingestion/IngestionEngine");
        const { KnowledgeIndexer } = await import("@/lib/ingestion/KnowledgeIndexer");
        
        const { filePath, classification } = job.payload as { filePath: string; classification: string };
        
        const ingestRes = await IngestionEngine.ingestFile(filePath, classification);
        if (!ingestRes.success) {
          throw new Error(`Ingestion failed: ${ingestRes.error}`);
        }

        const docRes = await KnowledgeIndexer.getOrRegisterDocument(
          filePath,
          ingestRes.fileType,
          classification,
          ingestRes.fingerprint
        );

        if (!docRes.isNew) {
          resultPayload = { success: true, message: "Skipped: File unchanged (fingerprint match)" };
        } else {
          const indexRes = await KnowledgeIndexer.indexDocument(docRes.documentId, ingestRes.chunks);
          
          const finalStatus = indexRes.failed === 0 ? 'COMPLETED' : (indexRes.indexed > 0 ? 'PARTIALLY_COMPLETED' : 'FAILED');
          await KnowledgeIndexer.markDocumentStatus(docRes.documentId, finalStatus, indexRes.failed > 0 ? `Failed chunks: ${indexRes.failed}` : undefined);
          
          if (finalStatus === 'FAILED') {
             throw new Error("All chunks failed to index");
          }
          resultPayload = { success: true, indexed: indexRes.indexed, failed: indexRes.failed };
        }
      } else {
        throw new Error(`Unknown taskType: ${job.taskType}`);
      }

      // 3. Mark as COMPLETED
      await sql`
        UPDATE "LlmQueue"
        SET status = 'COMPLETED', result = ${JSON.stringify(resultPayload)}, "updatedAt" = NOW()
        WHERE id = ${job.id};
      `;

      return NextResponse.json({ success: true, jobId: job.id, status: "COMPLETED" });

    } catch (processError: unknown) {
      // 4. Mark as FAILED
      const errorMsg = processError instanceof Error ? processError.message : "Unknown error";
      await sql`
        UPDATE "LlmQueue"
        SET status = 'FAILED', "errorMessage" = ${errorMsg}, "updatedAt" = NOW()
        WHERE id = ${job.id};
      `;
      return NextResponse.json({ success: false, jobId: job.id, status: "FAILED", error: errorMsg }, { status: 500 });
    }

  } catch (dbError: unknown) {
    const message = dbError instanceof Error ? dbError.message : "Database error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
