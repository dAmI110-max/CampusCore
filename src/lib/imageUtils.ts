/**
 * Resize + re-encode a photo before upload. Phone photos are 3-8 MB; shrinking them makes uploads
 * reliable on mobile data and keeps pages fast. Falls back to the original file if the browser can't decode it.
 */
export async function compressImage(file: File, maxDim = 1280, quality = 0.82): Promise<Blob> {
  try {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
