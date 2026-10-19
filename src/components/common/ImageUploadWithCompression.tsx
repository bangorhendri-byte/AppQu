/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { compressImageToWebp, formatFileSize } from '../../utils/imageCompressor';

interface ImageUploadWithCompressionProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  onClear?: () => void;
  label?: string;
  compact?: boolean;
  required?: boolean;
}

export const ImageUploadWithCompression: React.FC<ImageUploadWithCompressionProps> = ({
  value,
  onChange,
  onClear,
  label = 'Foto Produk (Auto-WebP ~30-50KB)',
  compact = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressInfo, setCompressInfo] = useState<{ sizeKb: number; format: string } | null>(() => {
    if (value && value.startsWith('data:')) {
      const base64Length = value.length - (value.indexOf(',') + 1);
      const kb = Math.round(((base64Length * 3) / 4 / 1024) * 10) / 10;
      return { sizeKb: kb, format: value.includes('webp') ? 'webp' : 'jpeg' };
    }
    return null;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      // Auto compress: max-width 600px, 75% quality, format webp (~30-50KB)
      const result = await compressImageToWebp(file, 600, 600, 0.75);
      setCompressInfo({ sizeKb: result.sizeKb, format: result.format });
      onChange(result.dataUrl);
    } catch (err) {
      console.error('[Image Compression Error]:', err);
      alert('Gagal memproses gambar. Pastikan format file adalah foto (JPG/PNG/WebP).');
    } finally {
      setIsProcessing(false);
      // Reset input value agar dapat memilih file yang sama jika diinginkan
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompressInfo(null);
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>{label}</span>
        </label>
        {compressInfo && (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
            {compressInfo.format.toUpperCase()} {formatFileSize(compressInfo.sizeKb)}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className={`relative rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center gap-3 ${compact ? 'py-1.5' : 'py-2.5'}`}>
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-xs">
            <img
              src={value}
              alt="Preview Produk"
              className="w-full h-full object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Foto siap & terkompresi</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Otomatis dioptimalkan untuk toko online & database offline.
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
              >
                Ganti Foto
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={isProcessing}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className={`w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 p-4 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group ${compact ? 'py-3' : 'py-4'}`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Mengompresi ke WebP (~30-50KB)...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                  Ambil Foto / Pilih dari Galeri
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Kompresi otomatis WebP (maks. 600px, hemat memori)
                </p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
};
