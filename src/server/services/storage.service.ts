import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'prisma-rt04-documents';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

/**
 * Validate upload parameters
 */
export function validateUploadFile(mimeType: string, fileSize: number): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`File type '${mimeType}' is not permitted. Only JPG, PNG, WEBP, and PDF are allowed.`);
  }
  if (fileSize > MAX_UPLOAD_SIZE) {
    throw new Error(`File size (${(fileSize / (1024 * 1024)).toFixed(2)}MB) exceeds the 5MB maximum limit.`);
  }
}

/**
 * Generate a presigned upload URL
 */
export async function getPresignedUploadUrl(params: {
  folder: 'bukti-bayar' | 'dokumen-surat' | 'laporan-keamanan' | 'aspirasi' | 'foto-warga';
  filename: string;
  contentType: string;
}): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  const timestamp = Date.now();
  const sanitizedFilename = params.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileKey = `${params.folder}/${timestamp}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 mins
  const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${fileKey}`;

  return { uploadUrl, fileKey, publicUrl };
}

/**
 * Generate a presigned download/view URL for private documents
 */
export async function getPresignedDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}
