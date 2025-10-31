export async function compressImage(blob: Blob, maxSizeKB: number = 500): Promise<Blob> {
  if (blob.size / 1024 <= maxSizeKB) {
    return blob;
  }

  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  let scale = Math.sqrt(maxSizeKB * 1024 / blob.size);
  scale = Math.min(scale, 1);

  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (compressedBlob) => {
        if (compressedBlob) {
          resolve(compressedBlob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      },
      'image/jpeg',
      0.85
    );
  });
}

export function createImageCache<T>(maxSize: number = 50) {
  const cache = new Map<string, { data: T; timestamp: number }>();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  return {
    get(key: string): T | null {
      const entry = cache.get(key);
      if (!entry) return null;

      if (Date.now() - entry.timestamp > maxAge) {
        cache.delete(key);
        return null;
      }

      return entry.data;
    },

    set(key: string, data: T): void {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }

      cache.set(key, { data, timestamp: Date.now() });
    },

    clear(): void {
      cache.clear();
    }
  };
}
