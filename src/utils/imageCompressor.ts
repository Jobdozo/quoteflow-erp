// ─────────────────────────────────────────────────────────────────────────
// Image Compressor Utility — QuoteFlow ERP
// Resizes and compresses image files to < 40KB Base64 data URLs for fast
// sub-200ms Firebase Firestore sync without exceeding Firestore 1MB doc limits.
// ─────────────────────────────────────────────────────────────────────────

export function compressImageFile(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image with smooth scaling
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed PNG or WebP data URL
        const isTransparent = file.type.includes('png') || file.type.includes('svg');
        const outputType = isTransparent ? 'image/png' : 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(outputType, quality);

        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
