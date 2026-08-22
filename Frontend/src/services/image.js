/**
 * Downscale a receipt photo before uploading.
 *
 * A modern phone camera produces 3-8 MB images. Those bytes are uploaded to the
 * backend, stored, then sent on to the vision model - so every extra megabyte is
 * paid for several times over. Receipts stay comfortably legible at 1600px on the
 * long edge, so this trims the slowest part of the OCR round trip without hurting
 * accuracy. Uses the browser's own canvas, so it adds no dependency.
 *
 * PDFs and anything that is not an image are returned untouched.
 */
const MAX_EDGE = 1600;
const QUALITY = 0.85;
/** Below this, compressing is not worth the CPU. */
const SKIP_UNDER_BYTES = 300 * 1024;

export async function compressImage(file) {
  if (!file || !file.type?.startsWith('image/')) return file;
  if (file.size <= SKIP_UNDER_BYTES) return file;

  try {
    const bitmap = await loadBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // Already small enough in both dimensions: leave it alone.
    if (scale === 1 && file.size <= SKIP_UNDER_BYTES) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );
    if (!blob || blob.size >= file.size) return file; // no gain - keep the original

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file; // never block an upload because compression failed
  }
}

function loadBitmap(file) {
  if ('createImageBitmap' in window) return createImageBitmap(file);
  // Older browsers: go through an <img> element.
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
