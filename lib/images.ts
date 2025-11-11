/**
 * Probe image size via HTTP HEAD request using probe-image-size. If network calls are unavailable, returns null.
 */
// @ts-ignore
import probe from 'probe-image-size';

export async function probeImage(url: string): Promise<{ width: number; height: number } | null> {
  try {
    const result = await probe(url);
    return { width: result.width, height: result.height };
  } catch {
    return null;
  }
}