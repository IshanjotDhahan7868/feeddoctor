/**
 * Wrapper around Vercel Blob. In this demo we return a data URI instead of uploading.
 */
import { randomUUID } from 'crypto';

export async function uploadBlob(name: string, content: Buffer, contentType: string): Promise<{ url: string }> {
  // In a real implementation you would use @vercel/blob to upload and return a signed URL.
  const base64 = content.toString('base64');
  return { url: `data:${contentType};base64,${base64}` };
}