// Shrinks a photo in the browser before it is uploaded. A phone photo is often
// 4000px wide and 5–10MB; the store never shows an image wider than ~1600px,
// so the full-size original only made uploads fail and pages crawl.

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;
// Files already this small and within MAX_DIMENSION are uploaded untouched.
const SMALL_ENOUGH_BYTES = 400 * 1024;

// Formats a canvas cannot faithfully re-encode (animation, vectors).
const PASS_THROUGH = new Set(['image/gif', 'image/svg+xml']);

const isHeic = (file) => /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }
  // Older Safari: fall back to an <img> element.
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(file) {
  if (PASS_THROUGH.has(file.type)) return file;

  let source;
  try {
    source = await decode(file);
  } catch {
    if (isHeic(file)) {
      throw new Error(`הקובץ "${file.name}" בפורמט HEIC שהדפדפן לא תומך בו. יש לשמור אותו כ-JPG ולהעלות שוב.`);
    }
    // Unknown to this browser but maybe fine for the server — let it decide.
    return file;
  }

  const { width, height } = source;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  if (scale === 1 && file.size <= SMALL_ENOUGH_BYTES && !isHeic(file)) {
    source.close?.();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  // JPEG has no transparency; paint white so transparent PNGs do not turn black.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob || (blob.size >= file.size && !isHeic(file))) return file;

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
