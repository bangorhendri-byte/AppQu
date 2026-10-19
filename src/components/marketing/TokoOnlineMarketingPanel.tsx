/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  QrCode, 
  Printer, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Smartphone, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle,
  Share2,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  OnlineStoreConfig, 
  getOnlineStoreConfig, 
  saveOnlineStoreConfig, 
  getPublicStoreUrl, 
  generateQrCodeDataUrl, 
  downloadQrCodePng,
  formatDisplayPhone 
} from '../../services/onlineStoreService';
import { StandeePrintModal } from './StandeePrintModal';

interface TokoOnlineMarketingPanelProps {
  moduleKey: 'bengkel' | 'kedai' | 'ritel' | 'klinik' | 'titip';
  moduleTitle?: string;
  themeColor?: 'emerald' | 'stone' | 'blue' | 'teal' | 'orange';
  onOpenCatalog?: () => void;
}

export const TokoOnlineMarketingPanel: React.FC<TokoOnlineMarketingPanelProps> = ({
  moduleKey,
  moduleTitle = 'UsahaQu',
  themeColor = 'emerald',
  onOpenCatalog
}) => {
  const [storeConfig, setStoreConfig] = useState<OnlineStoreConfig>(() => getOnlineStoreConfig(moduleKey));
  const [storeNameInput, setStoreNameInput] = useState(storeConfig.storeName);
  const [storeTaglineInput, setStoreTaglineInput] = useState(storeConfig.tagline);
  const [storeWaInput, setStoreWaInput] = useState(storeConfig.whatsappNumber);
  const [storeHoursInput, setStoreHoursInput] = useState(storeConfig.operationalHours);
  const [storeAddressInput, setStoreAddressInput] = useState(storeConfig.address);
  const [storeAnnouncementInput, setStoreAnnouncementInput] = useState(storeConfig.announcement || '');
  const [isStoreOpen, setIsStoreOpen] = useState(storeConfig.isOpen);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if moduleKey changes
  useEffect(() => {
    const cfg = getOnlineStoreConfig(moduleKey);
    setStoreConfig(cfg);
    setStoreNameInput(cfg.storeName);
    setStoreTaglineInput(cfg.tagline);
    setStoreWaInput(cfg.whatsappNumber);
    setStoreHoursInput(cfg.operationalHours);
    setStoreAddressInput(cfg.address);
    setStoreAnnouncementInput(cfg.announcement || '');
    setIsStoreOpen(cfg.isOpen);
  }, [moduleKey]);

  // Public URL
  const publicStoreUrl = getPublicStoreUrl(moduleKey, storeConfig.slug);

  // Generate QR Code on change
  useEffect(() => {
    if (publicStoreUrl) {
      setIsGeneratingQr(true);
      generateQrCodeDataUrl(publicStoreUrl, 512)
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('[TokoOnline QR Generation Error]:', err))
        .finally(() => setIsGeneratingQr(false));
    }
  }, [publicStoreUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveStoreConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveOnlineStoreConfig(moduleKey, {
      storeName: storeNameInput.trim() || storeConfig.storeName,
      tagline: storeTaglineInput.trim(),
      whatsappNumber: storeWaInput.trim() || '6281234567890',
      operationalHours: storeHoursInput.trim(),
      address: storeAddressInput.trim(),
      announcement: storeAnnouncementInput.trim(),
      isOpen: isStoreOpen
    });
    setStoreConfig(updated);
    showToast('Pengaturan Toko Online & Nomor WhatsApp berhasil diperbarui!');
  };

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(publicStoreUrl).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
      showToast('Tautan Toko Online berhasil disalin!');
    });
  };

  const handleDownloadQrPng = () => {
    downloadQrCodePng(publicStoreUrl, `qrcode-${moduleKey}.png`);
    showToast('QR Code resolusi tinggi berhasil diunduh (PNG)!');
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[10px] text-emerald-300 font-bold hover:underline shrink-0 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 1. Status Toko & Quick Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {storeConfig.storeName}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  storeConfig.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {storeConfig.isOpen ? '🟢 Toko Buka' : '🔴 Toko Tutup'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Katalog publik aktif & menerima pesanan langsung via WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenCatalog) {
                  onOpenCatalog();
                } else {
                  window.open(publicStoreUrl, '_blank');
                }
              }}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Toko Online</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStandeeModalOpen(true)}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Standee Meja</span>
            </button>
          </div>
        </div>

        {/* Tautan Toko Online */}
        <div className="mt-4 pt-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Link Publik Toko Online (Bagikan ke Pelanggan / Medsos):
          </label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <input
              type="text"
              readOnly
              value={publicStoreUrl}
              className="flex-1 bg-transparent border-0 px-2 text-xs font-mono text-slate-700 truncate focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleCopyStoreLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isLinkCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isLinkCopied ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Format URL publik otomatis siap pakai dan bisa diakses oleh pembeli tanpa perlu instal aplikasi.</span>
          </p>
        </div>
      </div>

      {/* 2. QR Code Generator & Standee Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* QR Code Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>QR Code Toko</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              High-Res
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-inner mb-3">
            {isGeneratingQr ? (
              <div className="w-40 h-40 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
            ) : qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code Toko Online"
                className="w-40 h-40 rounded-lg object-contain bg-white shadow-xs"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                Memuat QR...
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 mb-3 px-2">
            Scan langsung menggunakan kamera smartphone pelanggan untuk membuka katalog.
          </p>

          <div className="w-full grid grid-cols-2 gap-2 mt-auto">
            <button
              type="button"
              onClick={handleDownloadQrPng}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Unduh PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStandeeModalOpen(true)}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Standee</span>
            </button>
          </div>
        </div>

        {/* 3. Form Pengaturan Toko & WhatsApp Pengirim */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Profil Toko & WhatsApp Penerima Pesanan
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Pusat Marketing UsahaQu v1.85
            </span>
          </div>

          <form onSubmit={handleSaveStoreConfig} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nama Toko */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Nama Toko di Katalog *
                </label>
                <input
                  type="text"
                  required
                  value={storeNameInput}
                  onChange={(e) => setStoreNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* WhatsApp Pemilik */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  WhatsApp Pengirim / Penerima Order *
                </label>
                <input
                  type="tel"
                  required
                  value={storeWaInput}
                  onChange={(e) => setStoreWaInput(e.target.value)}
                  placeholder="08123456789 atau 628123456789"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pemesanan WhatsApp pembeli otomatis diarahkan ke nomor ini.
                </p>
              </div>
            </div>

            {/* Slogan */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Slogan / Deskripsi Singkat
              </label>
              <input
                type="text"
                value={storeTaglineInput}
                onChange={(e) => setStoreTaglineInput(e.target.value)}
                placeholder="Contoh: Perawatan Berkala, Ganti Oli & Sparepart Asli"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Jam Operasional */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Jam Operasional
                </label>
                <input
                  type="text"
                  value={storeHoursInput}
                  onChange={(e) => setStoreHoursInput(e.target.value)}
                  placeholder="Senin - Sabtu: 08:00 - 17:00 WIB"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Status Buka / Tutup */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Status Operasional Toko
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsStoreOpen(!isStoreOpen)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isStoreOpen ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isStoreOpen ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-700">
                    {isStoreOpen ? '🟢 Menerima Pesanan Online' : '🔴 Toko Tutup Sementara'}
                  </span>
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Alamat Fisik Toko
              </label>
              <input
                type="text"
                value={storeAddressInput}
                onChange={(e) => setStoreAddressInput(e.target.value)}
                placeholder="Jl. Ahmad Yani No. 88"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Pengumuman / Pesan Banner */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Banner Pengumuman / Info Promo di Katalog (Opsional)
              </label>
              <input
                type="text"
                value={storeAnnouncementInput}
                onChange={(e) => setStoreAnnouncementInput(e.target.value)}
                placeholder="Dapatkan diskon 10% untuk pemesanan hari ini!"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Pengaturan Toko</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Standee Print Modal */}
      <StandeePrintModal
        isOpen={isStandeeModalOpen}
        onClose={() => setIsStandeeModalOpen(false)}
        storeConfig={storeConfig}
        publicUrl={publicStoreUrl}
        moduleName={moduleTitle}
      />
    </div>
  );
};
