/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  Sparkles, 
  Smartphone, 
  MessageCircle, 
  Store,
  CheckCircle2
} from 'lucide-react';
import { OnlineStoreConfig, generateQrCodeDataUrl, downloadQrCodePng } from '../../services/onlineStoreService';

interface StandeePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: OnlineStoreConfig;
  publicUrl: string;
  moduleName?: string;
}

export const StandeePrintModal: React.FC<StandeePrintModalProps> = ({
  isOpen,
  onClose,
  storeConfig,
  publicUrl,
  moduleName = 'UsahaQu'
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && publicUrl) {
      setIsGenerating(true);
      generateQrCodeDataUrl(publicUrl, 600)
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('[Standee QR error]:', err))
        .finally(() => setIsGenerating(false));
    }
  }, [isOpen, publicUrl]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    const filename = `standee-qr-${storeConfig.slug || 'usahaqu'}.png`;
    downloadQrCodePng(publicUrl, filename);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-100">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight leading-tight">
                Standee Meja / Brosur QR
              </h3>
              <p className="text-[11px] text-slate-300">
                Siap cetak untuk display meja kasir & akrilik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Preview Container */}
        <div className="p-4 sm:p-5 bg-slate-100 overflow-y-auto max-h-[70vh] flex flex-col items-center">
          {/* STANDING TENT CARD / ACRYLIC PRINT SHEET */}
          <div 
            id="standee-print-target"
            className="w-full max-w-[320px] bg-white rounded-2xl shadow-md border-2 border-slate-800 p-5 flex flex-col items-center text-center relative overflow-hidden"
            style={{ minHeight: '440px' }}
          >
            {/* Top Badge */}
            <div className="w-full bg-[#008952] text-white py-1.5 px-3 rounded-xl mb-3 shadow-xs">
              <span className="text-[10px] font-black tracking-wider uppercase flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                MENU & KATALOG DIGITAL RESMI
              </span>
            </div>

            {/* Shop Name & Tagline */}
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              {storeConfig.storeName}
            </h2>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">
              {storeConfig.tagline || 'Pesan Langsung via WhatsApp'}
            </p>

            {/* QR Code Container */}
            <div className="my-4 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center shadow-inner">
              <div className="relative w-44 h-44 bg-white rounded-xl p-2 shadow-xs border border-slate-200 flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Toko"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="animate-pulse text-xs text-slate-400">
                    Membuat QR Code...
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white">
                    UQ
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2 uppercase tracking-wide">
                Arahkan Kamera HP ke Sini
              </span>
            </div>

            {/* 3 Step Instruction */}
            <div className="w-full bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-left text-[10px] space-y-1 mb-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">1</span>
                <span>Buka Kamera / Pemindai QR di HP Anda</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">2</span>
                <span>Buka Tautan Menu & Pilih Produk</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">3</span>
                <span>Kirim Pesanan Langsung ke WhatsApp Kami</span>
              </div>
            </div>

            {/* Footer */}
            <div className="w-full border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-500">
              <span className="font-bold text-slate-700 truncate max-w-[150px]">
                WA: {storeConfig.whatsappNumber}
              </span>
              <span className="text-emerald-700 font-black">
                Powered by UsahaQu
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Standee (Print)</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh QR PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
