import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Endpoint = process.env.AWS_ENDPOINT_URL_S3 || "https://br-dry-star-ay3wf1ms.storage.c-5.us-east-2.aws.neon.tech";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const region = process.env.AWS_REGION || "us-east-2";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "prisma-rt04-storage";

export const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Needed for S3 compatible endpoints like Neon Object Storage
});

/**
 * Upload a buffer or string to Neon S3 Object Storage
 */
export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType: string = "application/octet-stream"
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);
    const publicUrl = `${s3Endpoint.replace(/\/$/, '')}/${bucketName}/${key}`;
    return { success: true, url: publicUrl };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload to S3";
    console.error("S3 Upload error:", message);
    return { success: false, url: "", error: message };
  }
}

/**
 * Generate a pre-signed URL for direct client download or upload
 */
export async function getPresignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete an object from Neon S3 Storage
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("S3 Delete error:", error);
    return false;
  }
}
