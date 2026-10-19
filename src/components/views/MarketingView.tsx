import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Tag, 
  Star, 
  Check, 
  Copy, 
  Sparkles, 
  Users, 
  Percent, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2,
  Share2,
  Trash2,
  FileText,
  Store,
  QrCode,
  Printer,
  Download,
  ExternalLink,
  Globe,
  Smartphone,
  RefreshCw,
  ShoppingCart
} from 'lucide-react';
import { MarketingCampaign, PromoVoucher, CustomerVehicle, Sparepart, WorkshopProfile } from '../../types';
import { INITIAL_SPAREPARTS, INITIAL_PROFILE } from '../../data/mockData';
import { 
  OnlineStoreConfig, 
  getOnlineStoreConfig, 
  saveOnlineStoreConfig, 
  getPublicStoreUrl, 
  generateQrCodeDataUrl, 
  downloadQrCodePng 
} from '../../services/onlineStoreService';
import { downloadOfflineStoreHtml, openOfflineStoreInNewTab } from '../../utils/offlineStoreGenerator';
import { StandeePrintModal } from '../marketing/StandeePrintModal';

interface MarketingViewProps {
  initialTab?: string;
  customers: CustomerVehicle[];
  campaigns: MarketingCampaign[];
  vouchers: PromoVoucher[];
  onBack: () => void;
  onSendCampaign: (newCampaign: MarketingCampaign) => void;
  onAddVoucher: (newVoucher: PromoVoucher) => void;
  onToggleVoucherActive: (id: string) => void;
  onOpenOnlineCatalog?: () => void;
  spareparts?: Sparepart[];
  profile?: WorkshopProfile;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  initialTab = 'toko-online',
  customers,
  campaigns,
  vouchers,
  onBack,
  onSendCampaign,
  onAddVoucher,
  onToggleVoucherActive,
  onOpenOnlineCatalog,
  spareparts = INITIAL_SPAREPARTS,
  profile = INITIAL_PROFILE
}) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialTab === 'toko-online' || initialTab === 'store' || initialTab === 'mkt-store') return 'toko-online';
    if (initialTab === 'voucher-diskon' || initialTab === 'voucher') return 'promo-diskon';
    if (initialTab === 'ulasan-google' || initialTab === 'reviews') return 'riwayat-pesan';
    return initialTab || 'toko-online';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // TOKO ONLINE & QR CODE STATE
  // ---------------------------------------------------------------------------
  const [storeConfig, setStoreConfig] = useState<OnlineStoreConfig>(() => getOnlineStoreConfig('bengkel'));
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

  // Public store URL
  const publicStoreUrl = getPublicStoreUrl('bengkel', storeConfig.slug);

  // Generate QR code on load
  useEffect(() => {
    if (publicStoreUrl) {
      setIsGeneratingQr(true);
      generateQrCodeDataUrl(publicStoreUrl, 512)
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('[QR Generation Error]:', err))
        .finally(() => setIsGeneratingQr(false));
    }
  }, [publicStoreUrl]);

  const handleSaveStoreConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveOnlineStoreConfig('bengkel', {
      storeName: storeNameInput.trim() || 'BengkelQu Servis & Sparepart',
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
    downloadQrCodePng(publicStoreUrl, `qrcode-bengkelqu.png`);
    showToast('QR Code resolusi tinggi berhasil diunduh (PNG)!');
  };

  // Sub-Menu Form State (Broadcast WhatsApp)
  const [draftTitle, setDraftTitle] = useState('Promo Servis Berkala & Ganti Oli Rutin');
  const [draftTarget, setDraftTarget] = useState('Semua Pelanggan Terdaftar');
  const [draftMessage, setDraftMessage] = useState(
    `🛵 PROMO KHUSUS BENGKEL QU! 🛵\n\nHalo Sahabat Bengkel Qu!\nSudah waktunya ganti oli atau servis rutin motormu? Dapatkan DISKON 15% untuk Paket Ganti Oli + Servis CVT minggu ini!\n\n✅ Oli Dijamin 100% Asli\n✅ Free Cek Rem & Tekanan Ban\n✅ Mekanik Profesional\n\nTunjukkan pesan ini ke kasir Bengkel Qu saat pengerjaan. Kami siap melayani!`
  );

  // Sub-Menu Form State (Promo & Diskon)
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherTitle, setNewVoucherTitle] = useState('');
  const [newVoucherType, setNewVoucherType] = useState<'Persen' | 'Nominal'>('Persen');
  const [newVoucherValue, setNewVoucherValue] = useState<number>(10);
  const [newVoucherMinTx, setNewVoucherMinTx] = useState<number>(75000);
  const [newVoucherValidUntil, setNewVoucherValidUntil] = useState('30 Nov 2026');
  const [newVoucherCategory, setNewVoucherCategory] = useState<PromoVoucher['category']>('Jasa Servis');
  const [newVoucherQuota, setNewVoucherQuota] = useState<number>(50);
  const [isAddVoucherFormOpen, setIsAddVoucherFormOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'toko-online' || initialTab === 'store' || initialTab === 'mkt-store') setActiveTab('toko-online');
      else if (initialTab === 'voucher-diskon' || initialTab === 'voucher') setActiveTab('promo-diskon');
      else if (initialTab === 'ulasan-google' || initialTab === 'reviews') setActiveTab('riwayat-pesan');
      else setActiveTab(initialTab);
    }
  }, [initialTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'toko-online':
        return {
          title: 'Toko Online & QR Code',
          subtitle: 'Katalog Digital Publik, WhatsApp Order & Cetak Standee Meja'
        };
      case 'broadcast-wa':
        return {
          title: 'Broadcast WhatsApp',
          subtitle: 'Form Draf & Kirim Pesan Promo / Reminder Servis'
        };
      case 'promo-diskon':
        return {
          title: 'Promo & Diskon',
          subtitle: 'Kelola Voucher Diskon & Potongan Servis Bengkel'
        };
      case 'riwayat-pesan':
        return {
          title: 'Riwayat Pesan / Campaign',
          subtitle: 'Log Kampanye Pesan & Pengiriman Promosi'
        };
      default:
        return {
          title: 'Marketing & Promosi',
          subtitle: 'Katalog Digital, Kampanye WhatsApp & Voucher'
        };
    }
  };

  const headerMeta = getHeaderMeta();

  // Quick preset templates for Broadcast WA
  const PRESET_TEMPLATES = [
    {
      label: 'Promo Oli & CVT 15%',
      title: 'Diskon Paket Servis CVT + Oli Mesin 15%',
      text: `🛵 PROMO BENGKEL QU 🛵\nHalo Sahabat Bengkel Qu!\nNikmati potongan 15% untuk paket ganti oli MPX/SPX/Yamalube + servis CVT.\nTarikan motor enteng kembali, siap gas tanpa kendala!`
    },
    {
      label: 'Reminder Ganti Oli Rutin',
      title: 'Reminder Servis Berkala & Ganti Oli Rutin',
      text: `🔧 JADWAL SERVIS BERKALA MOTOR ANDA 🔧\nHalo Kak! Motor Anda sudah waktunya servis berkala dan cek kesehatan aki di Bengkel Qu.\nYuk mampir hari ini, kami buka sampai jam 17:00 WIB.`
    },
    {
      label: 'Cek Aki & Kelistrikan Gratis',
      title: 'Gratis Pemeriksaan Aki & Tekanan Angin Digital',
      text: `⚡ PROMO MUSIM HUJAN: CEK AKI GRATIS! ⚡\nBengkel Qu menyediakan pengecekan tegangan aki & scanner injeksi gratis untuk motor Anda agar tidak mogok di jalan!`
    }
  ];

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftMessage.trim()) {
      showToast('Harap isi judul kampanye dan pesan promosi!');
      return;
    }

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    const recipientEstimate = 
      draftTarget === 'Semua Pelanggan Terdaftar' 
        ? customers.length 
        : Math.max(12, Math.floor(customers.length * 0.7));

    const newCmp: MarketingCampaign = {
      id: `cmp-${Date.now()}`,
      title: draftTitle.trim(),
      channel: 'WhatsApp',
      targetAudience: `${draftTarget} (${recipientEstimate} Kontak)`,
      messageContent: draftMessage.trim(),
      sentDate: dateFormatted,
      recipientCount: recipientEstimate,
      status: 'Terkirim',
      deliveredPercent: 100
    };

    onSendCampaign(newCmp);
    showToast(`Pesan broadcast berhasil dikirimkan ke ${recipientEstimate} kontak WhatsApp pelanggan!`);
    setActiveTab('riwayat-pesan');
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode.trim() || !newVoucherTitle.trim()) {
      showToast('Harap isi kode voucher dan judul promo!');
      return;
    }

    const newVch: PromoVoucher = {
      id: `vch-${Date.now()}`,
      code: newVoucherCode.trim().toUpperCase(),
      title: newVoucherTitle.trim(),
      discountType: newVoucherType,
      discountValue: Number(newVoucherValue) || 10,
      minTransaction: Number(newVoucherMinTx) || 0,
      validUntil: newVoucherValidUntil.trim() || '31 Des 2026',
      category: newVoucherCategory,
      quota: Number(newVoucherQuota) || 50,
      usedCount: 0,
      isActive: true,
      notes: `Voucher diskon ${newVoucherCategory}`
    };

    onAddVoucher(newVch);
    setIsAddVoucherFormOpen(false);
    showToast(`Voucher ${newVch.code} berhasil dibuat dan diaktifkan di kasir!`);

    // Reset Form
    setNewVoucherCode('');
    setNewVoucherTitle('');
    setNewVoucherValue(10);
    setNewVoucherMinTx(75000);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
    showToast('Teks berhasil disalin ke clipboard!');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* =========================================================================
          1. COMPACT SUB-MENU HEADER
          - Shrunk compact header
          - Dynamically matches active sub-menu
          - Hiding unnecessary quick filter buttons
      ========================================================================= */}
      <div 
        className="bg-[#008952] text-white px-4 py-2.5 shadow-sm sticky top-0 z-30"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-8 h-8 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
                {headerMeta.title}
              </h1>
              <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2 py-1 rounded-lg bg-emerald-800/40 text-[10px] font-bold text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-200" />
              <span>{todayStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-MENU TABS BAR (Quick Navigation across Marketing Tools) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 sticky top-[48px] z-20 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('toko-online')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'toko-online'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Toko Online & QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcast-wa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'broadcast-wa'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast WA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promo-diskon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'promo-diskon'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promo & Voucher</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riwayat-pesan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'riwayat-pesan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Riwayat Pesan</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 shadow-lg flex items-center justify-between gap-2 sticky top-[88px] z-20">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[10px] text-emerald-300 font-bold hover:underline shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto w-full pb-20">

        {/* =====================================================================
            SUB-MENU UTAMA: TOKO ONLINE & QR CODE GENERATOR (Pusat Marketing)
        ===================================================================== */}
        {activeTab === 'toko-online' && (
          <div className="space-y-4">
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
                      if (onOpenOnlineCatalog) {
                        onOpenOnlineCatalog();
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
                    <span>Cetak Standee</span>
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
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isLinkCopied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: storeConfig.storeName,
                          text: `Buka katalog digital dan pesan langsung di ${storeConfig.storeName}:`,
                          url: publicStoreUrl
                        });
                      } else {
                        handleCopyStoreLink();
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                    title="Bagikan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 1.5. CARD TOKO OFFLINE MANDIRI (.HTML) - DATA STOK & SPAREPART DENGAN KERANJANG, SEND WA & QR CODE */}
            <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">
                        Toko Offline Mandiri (Format .html)
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        ⚡ 100% Offline Tanpa Kuota
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                        Powered by UsahaQu
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      Katalog stok & sparepart mandiri dalam 1 berkas <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300 font-mono">.html</code>. Dilengkapi banner logo profil, keranjang belanja, checkout direct WhatsApp & QR Code pembayaran.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shopName = profile.workshopName || storeConfig.storeName || 'BengkelQu';
                      const filename = `toko-${shopName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
                      downloadOfflineStoreHtml(profile, spareparts, filename);
                      showToast(`Berkas ${filename} berhasil diunduh! Siap dibuka offline di HP tanpa internet.`);
                    }}
                    className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Unduh File .html</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openOfflineStoreInNewTab(profile, spareparts)}
                    className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Preview (.html)</span>
                  </button>
                </div>
              </div>

              {/* Rincian Fitur & Parameter Toko Offline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                    <Store className="w-3.5 h-3.5" />
                    <span>Banner & Header Toko</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">
                    {profile.workshopName || storeConfig.storeName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Logo BQ + Powered by UsahaQu
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Keranjang & Kirim WA</span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    {spareparts.length} Sparepart Terdata
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Kirim order otomatis ke WA: {profile.phone || storeConfig.whatsappNumber}
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Code Pembayaran</span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    Offline SVG Generator
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Muncul di modal checkout .html
                  </p>
                </div>
              </div>

              {/* Link Akses Cepat File Publik Standar */}
              <div className="mt-3.5 pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-emerald-200/90 text-[11px] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Berkas mandiri juga tersedia di URL lokal: <code className="bg-black/30 px-1.5 py-0.5 rounded text-emerald-300 font-mono">/toko-bengkel.html</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.open('/toko-bengkel.html', '_blank');
                    }}
                    className="text-[11px] text-emerald-300 hover:text-white font-bold underline cursor-pointer"
                  >
                    Buka /toko-bengkel.html ↗
                  </button>
                  <span className="text-emerald-600">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const origin = window.location.origin;
                      const fileUrl = `${origin}/toko-bengkel.html`;
                      navigator.clipboard.writeText(fileUrl).then(() => {
                        showToast('Tautan file /toko-bengkel.html berhasil disalin!');
                      });
                    }}
                    className="text-[11px] text-emerald-300 hover:text-white font-bold underline cursor-pointer"
                  >
                    Salin Tautan File
                  </button>
                </div>
              </div>
            </div>

            {/* 2. QR Code Generator Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  QR Code Toko Resmi
                </span>

                <div className="relative w-48 h-48 bg-white rounded-2xl p-2.5 border-2 border-slate-200 shadow-inner flex items-center justify-center">
                  {isGeneratingQr ? (
                    <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                      <span>Membuat QR Code...</span>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code Toko"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">QR Code Error</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2.5">
                  Pelanggan cukup mengarahkan kamera HP untuk membuka katalog tanpa instal aplikasi.
                </p>

                <div className="w-full grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleDownloadQrPng}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStandeeModalOpen(true)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Standee</span>
                  </button>
                </div>
              </div>

              {/* 3. Form Pengaturan Toko Online & Nomor WhatsApp Penerima Pesanan */}
              <div className="md:col-span-2 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Pengaturan Toko Online & WhatsApp Penerima
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kontrol jam operasional, alamat, dan nomor WhatsApp admin yang menerima direct order.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsStoreOpen(!isStoreOpen)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isStoreOpen
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {isStoreOpen ? 'Status: BUKA' : 'Status: TUTUP'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveStoreConfig} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Nama Toko / Bengkel Publik *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeNameInput}
                        onChange={(e) => setStoreNameInput(e.target.value)}
                        placeholder="Contoh: BengkelQu Motor Jaya"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Nomor WhatsApp Penerima Pesanan *
                      </label>
                      <input
                        type="tel"
                        required
                        value={storeWaInput}
                        onChange={(e) => setStoreWaInput(e.target.value)}
                        placeholder="Contoh: 081234567890 atau 628..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Slogan / Deskripsi Singkat Toko:
                    </label>
                    <input
                      type="text"
                      value={storeTaglineInput}
                      onChange={(e) => setStoreTaglineInput(e.target.value)}
                      placeholder="Contoh: Servis Cepat & Sparepart Asli Bergaransi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Jam Operasional Toko:
                      </label>
                      <input
                        type="text"
                        value={storeHoursInput}
                        onChange={(e) => setStoreHoursInput(e.target.value)}
                        placeholder="Contoh: 08:00 - 17:00 WIB"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Alamat Singkat / Lokasi:
                      </label>
                      <input
                        type="text"
                        value={storeAddressInput}
                        onChange={(e) => setStoreAddressInput(e.target.value)}
                        placeholder="Contoh: Jl. Ahmad Yani No. 88"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Pengumuman / Teks Promo Header:
                    </label>
                    <input
                      type="text"
                      value={storeAnnouncementInput}
                      onChange={(e) => setStoreAnnouncementInput(e.target.value)}
                      placeholder="Contoh: Gratis Cek Rem & Diskon 10% Servis Bulan Ini!"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan Toko</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SUB-MENU A: BROADCAST WHATSAPP
            - Large form card with minimalist underlined inputs for drafting and sending service reminders or promo messages
        ===================================================================== */}
        {activeTab === 'broadcast-wa' && (
          <div className="space-y-4">
            {/* LARGE FORM CARD */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Formulir Draf Siaran Broadcast WhatsApp
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kirim pesan promosi, kupon diskon, atau pengingat servis berkala langsung ke pelanggan.
                  </p>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
              </div>

              {/* Template Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pilih Contoh Template Cepat:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDraftTitle(tmpl.title);
                        setDraftMessage(tmpl.text);
                        showToast(`Template "${tmpl.label}" dimuat ke formulir.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                {/* Judul Kampanye */}
                <div className="group">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Nama Kampanye / Subjek Pesan *
                  </label>
                  <input
                    type="text"
                    required
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Contoh: Promo Ganti Oli + Servis CVT Diskon 15%"
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-900 font-bold text-xs focus:outline-none"
                  />
                </div>

                {/* Target Penerima */}
                <div className="group">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Target Sasaran Pelanggan *
                  </label>
                  <select
                    value={draftTarget}
                    onChange={(e) => setDraftTarget(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs focus:outline-none"
                  >
                    <option value="Semua Pelanggan Terdaftar">Semua Pelanggan Terdaftar ({customers.length} Kontak)</option>
                    <option value="Pelanggan Servis Lebih Dari 2 Bulan">Pelanggan Servis Lebih Dari 2 Bulan (Reminder Rutin)</option>
                    <option value="Pemilik Motor Matic (Vario, BeAT, NMAX, Aerox)">Pemilik Motor Matic (Khusus Promo CVT)</option>
                    <option value="Member Poin Loyalitas Tinggi">Member Loyalitas (Poin Reward)</option>
                  </select>
                </div>

                {/* Pesan WhatsApp */}
                <div className="group">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Isi Pesan WhatsApp *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    placeholder="Ketik draf pesan siaran promosi Anda di sini..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-[#008952] font-mono leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Panjang teks: {draftMessage.length} karakter. Gunakan simbol *tebal* atau _miring_ untuk format teks WhatsApp.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-98 text-white font-extrabold py-3.5 rounded-2xl shadow-xs text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Siaran Broadcast WhatsApp ke Pelanggan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            SUB-MENU B: PROMO & DISKON
            - Medium-to-large card layout to manage active discounts and service vouchers using minimalist underlined fields
        ===================================================================== */}
        {activeTab === 'promo-diskon' && (
          <div className="space-y-4">
            {/* Header Action & Stats */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Manajemen Voucher & Promo Aktif ({vouchers.filter((v) => v.isActive).length} Voucher Aktif)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Voucher otomatis terbaca saat proses pembayaran di menu Kasir.
                </p>
              </div>

              <button
                onClick={() => setIsAddVoucherFormOpen(!isAddVoucherFormOpen)}
                className="px-3 py-1.5 rounded-xl bg-[#008952] text-white text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddVoucherFormOpen ? 'Tutup Form' : '+ Tambah Promo'}</span>
              </button>
            </div>

            {/* FORM CARD (COLLAPSIBLE / EXPANDED) */}
            {isAddVoucherFormOpen && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-emerald-200/80 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Input Voucher Promo & Diskon Baru
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Minimalist Underlined Form
                  </span>
                </div>

                <form onSubmit={handleCreateVoucher} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Kode Kupon / Voucher (KAPITAL) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newVoucherCode}
                        onChange={(e) => setNewVoucherCode(e.target.value)}
                        placeholder="Contoh: BENGKELQU15"
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-900 font-black text-xs uppercase"
                      />
                    </div>

                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Judul Promosi *
                      </label>
                      <input
                        type="text"
                        required
                        value={newVoucherTitle}
                        onChange={(e) => setNewVoucherTitle(e.target.value)}
                        placeholder="Contoh: Diskon Servis Rutin 15%"
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Tipe Potongan
                      </label>
                      <select
                        value={newVoucherType}
                        onChange={(e) => setNewVoucherType(e.target.value as any)}
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs"
                      >
                        <option value="Persen">Persentase (%)</option>
                        <option value="Nominal">Nominal Tetap (Rp)</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Nilai Potongan {newVoucherType === 'Persen' ? '(%)' : '(Rp)'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newVoucherValue}
                        onChange={(e) => setNewVoucherValue(Number(e.target.value))}
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-[#008952] font-black text-xs"
                      />
                    </div>

                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Min. Transaksi (Rp)
                      </label>
                      <input
                        type="number"
                        value={newVoucherMinTx}
                        onChange={(e) => setNewVoucherMinTx(Number(e.target.value))}
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Kategori Berlaku
                      </label>
                      <select
                        value={newVoucherCategory}
                        onChange={(e) => setNewVoucherCategory(e.target.value as any)}
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs"
                      >
                        <option value="Semua">Semua Pembelian</option>
                        <option value="Jasa Servis">Jasa Servis Saja</option>
                        <option value="Sparepart">Suku Cadang Saja</option>
                        <option value="Oli">Oli & Pelumas</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Berlaku Sampai
                      </label>
                      <input
                        type="text"
                        value={newVoucherValidUntil}
                        onChange={(e) => setNewVoucherValidUntil(e.target.value)}
                        placeholder="30 Nov 2026"
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs"
                      />
                    </div>

                    <div className="group">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Batas Kuota Pemakaian
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newVoucherQuota}
                        onChange={(e) => setNewVoucherQuota(Number(e.target.value))}
                        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddVoucherFormOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs"
                    >
                      Simpan & Aktifkan Voucher
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* MEDIUM-TO-LARGE CARDS DISPLAYING ACTIVE VOUCHERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {vouchers.map((v) => (
                <div
                  key={v.id}
                  className={`bg-white rounded-3xl p-5 shadow-xs border transition-all space-y-3 ${
                    v.isActive ? 'border-slate-200/90 hover:border-emerald-300' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 tracking-wider">
                          {v.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {v.category}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-1.5">
                        {v.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-[#008952]">
                        {v.discountType === 'Persen' ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString('id-ID')}`}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Min. Rp {v.minTransaction.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>Berlaku s/d: <strong className="text-slate-800">{v.validUntil}</strong></span>
                    <span>Terpakai: <strong className="text-slate-800">{v.usedCount} / {v.quota}</strong></span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {v.isActive ? '● Status Aktif' : '○ Nonaktif'}
                    </span>

                    <button
                      onClick={() => {
                        onToggleVoucherActive(v.id);
                        showToast(`Status voucher ${v.code} telah diubah.`);
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer"
                    >
                      {v.isActive ? 'Nonaktifkan' : 'Aktifkan Kembali'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            SUB-MENU C: RIWAYAT PESAN / CAMPAIGN
            - Minimalist underlined list view tracking previously sent marketing campaigns
        ===================================================================== */}
        {activeTab === 'riwayat-pesan' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Riwayat Kampanye & Siaran Pesan ({campaigns.length} Riwayat)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Log kronologis seluruh pengiriman pesan siaran promosi bengkel.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Minimalist Underlined Log
              </span>
            </div>

            {/* Minimalist Underlined List View */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada kampanye pesan yang dikirim
                </div>
              ) : (
                campaigns.map((cmp, idx) => (
                  <div key={cmp.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                            {cmp.channel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {cmp.sentDate}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {cmp.deliveredPercent}% Terkirim
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {cmp.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 italic font-mono bg-slate-50 p-2 rounded-xl border border-slate-100">
                          "{cmp.messageContent}"
                        </p>

                        <div className="text-[11px] text-slate-500 pt-0.5">
                          Sasaran: <strong className="text-slate-700">{cmp.targetAudience}</strong>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-black">
                          {cmp.recipientCount} Kontak
                        </span>
                        <div className="mt-1">
                          <button
                            onClick={() => handleCopyText(cmp.messageContent, idx)}
                            className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedIndex === idx ? 'Tersalin!' : 'Salin Pesan'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* STANDEE MEJA / BROSUR QR PRINT MODAL */}
      <StandeePrintModal
        isOpen={isStandeeModalOpen}
        onClose={() => setIsStandeeModalOpen(false)}
        storeConfig={storeConfig}
        publicUrl={publicStoreUrl}
        moduleName="BengkelQu"
      />
    </div>
  );
};

