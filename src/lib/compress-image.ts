"use client";

export type CompressOptions = {
  /** Longest side in pixels after resizing (default 2000) */
  maxSide?: number;
  /** 0–1, for WebP/JPEG output (default 0.82) */
  quality?: number;
  /** Output format (default WebP; falls back to JPEG where the browser can't encode WebP) */
  format?: "webp" | "jpeg" | "png";
};

const SKIP_BELOW_BYTES = 350 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Shrinks a photo in the browser before it is uploaded: resizes it to at most `maxSide` pixels and re-encodes it.
 * Phone photos of 4–10 MB typically become 150–500 KB. Runs before upload because the host rejects request bodies
 * over about 4.5 MB. Returns the original file if it is already small, is not a photo (GIF/SVG), if compressing
 * fails, or if the result would not be smaller.
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  if (!file.type.startsWith("image/") || /gif|svg/.test(file.type)) return file;
  const maxSide = options.maxSide ?? 2000;
  const quality = options.quality ?? 0.82;
  const format = options.format ?? "webp";

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
      bitmap.close();
      return file;
    }
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    let type = `image/${format}`;
    let blob = await toBlob(canvas, type, quality);
    if (!blob || blob.type !== type) {
      // this browser can't encode that format (older Safari with WebP): use JPEG on a white background
      type = "image/jpeg";
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      blob = await toBlob(canvas, type, quality);
    }
    bitmap.close();
    if (!blob || blob.size >= file.size) return file;

    const ext = type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.${ext}`, { type, lastModified: Date.now() });
  } catch {
    return file;
  }
}

/** Puts `file` into an <input type="file"> so the form submits the compressed version. */
export function setInputFile(input: HTMLInputElement, file: File) {
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
}
