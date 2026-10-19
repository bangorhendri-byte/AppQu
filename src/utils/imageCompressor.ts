/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompressionResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  format: 'webp' | 'jpeg' | 'png';
}

/**
 * Mengompresi gambar dari kamera atau galeri secara otomatis menggunakan HTML5 Canvas.
 * - Resolusi maksimal: 600px (menjaga rasio aspek foto)
 * - Format: image/webp (dengan fallback image/jpeg jika browser tidak mendukung WebP encoder)
 * - Kualitas: 75%
 * - Target ukuran berkas: ~30-50 KB agar ringan disimpan di IndexedDB/LocalStorage.
 */
export async function compressImageToWebp(
  fileOrBlob: File | Blob,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format file gambar tidak valid.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek untuk membatasi ukuran maksimal (600px)
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Browser tidak mendukung 2D Canvas context.'));
        }

        // Latar belakang putih untuk menghindari transparansi hitam pada JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Render gambar ke canvas dengan anti-aliasing berkualitas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Coba kompresi format WebP terlebih dahulu
        let dataUrl = canvas.toDataURL('image/webp', quality);
        let format: 'webp' | 'jpeg' | 'png' = 'webp';

        // Jika browser tidak mendukung export WebP (misal Safari lawas), fallback ke JPEG
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          format = 'jpeg';
        }

        // Hitung perkiraan ukuran byte dari panjang base64
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const padding = dataUrl.endsWith('==') ? 2 : dataUrl.endsWith('=') ? 1 : 0;
        const bytes = Math.round((base64Length * 3) / 4) - padding;
        const sizeKb = Math.round((bytes / 1024) * 10) / 10;

        resolve({
          dataUrl,
          sizeKb,
          width,
          height,
          format
        });
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Format ukuran byte / KB menjadi string scannable (e.g. "38.5 KB")
 */
export function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
  return `${kb.toFixed(1)} KB`;
}
