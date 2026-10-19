import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Check, 
  Copy, 
  Mail, 
  Key, 
  Zap, 
  Store, 
  ShieldCheck, 
  X, 
  Calendar, 
  Laptop, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Users,
  Building2
} from 'lucide-react';
import { SubscriptionPlanId, SubscriptionState, ProDurationOption, ProTierOption } from '../../types';
import { 
  getOrCreateDeviceId, 
  validateSerialNumber, 
  buildMailtoRequest, 
  DEVELOPER_EMAIL,
  PRO_TIERS,
  calculateTierPrice
} from '../../utils/licenseManager';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onSelectPlan: (planId: SubscriptionPlanId, durationDays: number) => void;
  onActivateSerialKey: (serialKey: string) => { success: boolean; message: string };
  workshopName?: string;
  contactPhone?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSelectPlan,
  onActivateSerialKey,
  workshopName = 'Bengkel Qu Motor',
  contactPhone = '0812-3456-7890'
}) => {
  if (!isOpen) return null;

  const deviceId = subscription.deviceId || getOrCreateDeviceId();

  // Tab: 'aktivasi' | 'paket'
  const [modalTab, setModalTab] = useState<'aktivasi' | 'paket'>('aktivasi');

  // Selected Tier: Basic (1000/hari), Core (2000/hari), Enterprise (3000/hari)
  const [selectedTier, setSelectedTier] = useState<ProTierOption>('core');

  // Selected duration for request: 1, 3, 6, 12 Bulan
  const [selectedDuration, setSelectedDuration] = useState<ProDurationOption>(1);

  // Serial key input
  const [inputSerial, setInputSerial] = useState('');
  const [activationResult, setActivationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Copy feedback
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  const DURATION_OPTIONS: { months: ProDurationOption; days: number; label: string; badge?: string }[] = [
    { months: 1, days: 30, label: '1 Bulan' },
    { months: 3, days: 90, label: '3 Bulan', badge: 'Kuartal' },
    { months: 6, days: 180, label: '6 Bulan', badge: 'Semester' },
    { months: 12, days: 365, label: '12 Bulan', badge: '1 Tahun Penuh' }
  ];

  const currentPriceCalculation = calculateTierPrice(selectedTier, selectedDuration);

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedDeviceId(true);
    setTimeout(() => setCopiedDeviceId(false), 2000);
  };

  const handleCopyEmailText = () => {
    const tierMeta = PRO_TIERS[selectedTier];
    const text = `Kepada: ${DEVELOPER_EMAIL}\nPerihal: Permintaan Serial Number [${tierMeta.name}] [${selectedDuration} Bulan]\n\n• Device ID: ${deviceId}\n• Paket: ${tierMeta.name} (${tierMeta.rateLabel})\n• Durasi: ${selectedDuration} Bulan (${currentPriceCalculation.days} Hari)\n• Total: ${currentPriceCalculation.formattedPrice}\n• Nama Bengkel: ${workshopName}\n• Kontak: ${contactPhone}\n\nMohon dikirimkan Serial Number aktivasi PRO. Terima kasih!`;
    navigator.clipboard.writeText(text);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 2000);
  };

  const handleDoActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSerial.trim()) {
      setActivationResult({ success: false, message: 'Mohon masukkan kode Serial Number terlebih dahulu.' });
      return;
    }

    const res = onActivateSerialKey(inputSerial.trim());
    setActivationResult(res);
  };

  const expiryDateFormatted = subscription.subscriptionExpiryDate 
    ? new Date(subscription.subscriptionExpiryDate).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4.5 my-6 max-h-[92vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#008952] text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                Lisensi Bengkel Qu PRO
              </span>
              {subscription.isTrialActive && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-200">
                  Trial: Sisa {subscription.trialDaysRemaining} Hari
                </span>
              )}
              {subscription.isSubscribed && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  PRO AKTIF ({subscription.planName.split(' ')[0]})
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Pilihan Paket PRO (1, 3, 6, 12 Bulan)
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              3 Menu Utama (<strong>Service, Kasir, dan Stok</strong>) selalu <strong>100% Gratis & Bebas Selamanya</strong>. Untuk fitur tambahan, pilih paket Basic (1rb/hari), Core (2rb/hari), atau Enterprise (3rb/hari).
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#008952] flex items-center justify-center font-black">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block leading-tight">
                  {subscription.isSubscribed 
                    ? `Paket ${subscription.planName} (${subscription.subscriptionDurationMonths || 1} Bulan)` 
                    : subscription.isTrialActive 
                    ? `Masa Trial 10 Hari (Langsung Aktif Saat Install Pertama)` 
                    : 'Free Lifetime Mode (Menu Inti Tetap Bebas)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {subscription.isSubscribed && expiryDateFormatted
                    ? `Aktif sampai ${expiryDateFormatted}`
                    : subscription.isTrialActive
                    ? `Sisa ${subscription.trialDaysRemaining} hari masa uji coba gratis seluruh fitur`
                    : 'Service, Kasir & Stok tetap aktif tanpa batas'}
                </span>
              </div>
            </div>
            {subscription.isTrialActive && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-mono text-xs font-black shrink-0">
                {subscription.trialDaysRemaining} Hari
              </span>
            )}
          </div>

          {/* Progress bar jika trial aktif */}
          {subscription.isTrialActive && (
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#008952] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, (subscription.trialDaysRemaining / 10) * 100))}%` }}
              />
            </div>
          )}
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setModalTab('aktivasi')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              modalTab === 'aktivasi' ? 'bg-white text-[#008952] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔑 Pilih Paket, Durasi & Aktivasi
          </button>
          <button
            type="button"
            onClick={() => setModalTab('paket')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              modalTab === 'paket' ? 'bg-white text-[#008952] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Tabel Fitur & Perbandingan
          </button>
        </div>

        {modalTab === 'aktivasi' && (
          <div className="space-y-4 animate-in fade-in">
            {/* 1. Device ID Card */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-[#008952]" />
                  Device ID Perangkat Ini (Terkunci & Unik)
                </span>
                <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  Lisensi per Device
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 font-mono text-sm font-black text-slate-800 tracking-wider">
                  {deviceId}
                </div>
                <button
                  type="button"
                  onClick={handleCopyDeviceId}
                  className="bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedDeviceId ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* 2. Pilihan Paket PRO (Basic, Core, Enterprise) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>1. Pilih Paket PRO yang Diinginkan:</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Tarif Harian Fleksibel
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Basic Pro */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('basic')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTier === 'basic'
                      ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900">Basic Pro</span>
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Solo Mode Mandiri</span>
                  </div>
                  <div className="mt-2.5 pt-1.5 border-t border-slate-100">
                    <span className="font-mono text-xs font-black text-blue-700 block">Rp 1.000</span>
                    <span className="text-[9px] text-slate-400">per hari</span>
                  </div>
                </button>

                {/* Core Pro */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('core')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    selectedTier === 'core'
                      ? 'border-[#008952] bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  <span className="absolute -top-2 right-2 bg-amber-400 text-amber-950 font-black text-[8px] px-1.5 py-0.2 rounded-full shadow-2xs">
                    Populer
                  </span>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900">Core Pro</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#008952]" />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Multi-User SPV & Kasir</span>
                  </div>
                  <div className="mt-2.5 pt-1.5 border-t border-slate-100">
                    <span className="font-mono text-xs font-black text-[#008952] block">Rp 2.000</span>
                    <span className="text-[9px] text-slate-400">per hari</span>
                  </div>
                </button>

                {/* Enterprise Pro */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('corporate')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTier === 'corporate'
                      ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900">Enterprise</span>
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Multi-Cabang (3 Outlet)</span>
                  </div>
                  <div className="mt-2.5 pt-1.5 border-t border-slate-100">
                    <span className="font-mono text-xs font-black text-purple-700 block">Rp 3.000</span>
                    <span className="text-[9px] text-slate-400">per hari</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Pilihan Durasi (1, 3, 6, 12 Bulan) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>2. Pilih Durasi Langganan:</span>
                <span className="text-[11px] text-slate-500">1, 3, 6, 12 Bulan</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((opt) => {
                  const price = calculateTierPrice(selectedTier, opt.months);
                  const isSelected = selectedDuration === opt.months;

                  return (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => setSelectedDuration(opt.months)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#008952] bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{opt.label}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{opt.days} Hari</span>
                      </div>
                      <span className="text-[10px] font-black text-[#008952] font-mono mt-1.5 block">
                        {price.formattedPrice}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Rincian Kalkulasi Harga */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Ringkasan Pilihan:</span>
                  <span className="font-bold text-slate-900">
                    {PRO_TIERS[selectedTier].name} ({selectedDuration} Bulan / {currentPriceCalculation.days} Hari)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">
                    {currentPriceCalculation.days} hari × {PRO_TIERS[selectedTier].rateLabel}
                  </span>
                  <span className="font-mono font-black text-sm text-[#008952]">
                    {currentPriceCalculation.formattedPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Tombol Request Email ke Developer Hendri */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#008952]" />
                  Kirim Permintaan ke Developer Hendri
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-600">
                  {DEVELOPER_EMAIL}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={buildMailtoRequest(deviceId, selectedTier, selectedDuration, workshopName, contactPhone)}
                  className="flex-1 bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all text-center"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email Permintaan Serial Number</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmailText}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedEmailText ? 'Format Disalin!' : 'Salin Format'}</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-500 leading-tight">
                Developer (<strong>Mas Hendri</strong> di <code className="bg-slate-200/70 px-1 py-0.5 rounded font-mono text-slate-800">{DEVELOPER_EMAIL}</code>) akan membuat Serial Number aktivasi {PRO_TIERS[selectedTier].name} ({selectedDuration} Bulan) menggunakan Termux dan mengirimkannya kembali ke Anda.
              </p>
            </div>

            {/* 5. Form Input Serial Number */}
            <form onSubmit={handleDoActivate} className="bg-white border-2 border-emerald-600/30 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#008952]" />
                <h4 className="font-extrabold text-xs text-slate-900">
                  Sudah Menerima Serial Number? Masukkan di Bawah:
                </h4>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={inputSerial}
                  onChange={(e) => {
                    setInputSerial(e.target.value.toUpperCase());
                    setActivationResult(null);
                  }}
                  placeholder="Contoh: BQPRO-CORE-3M-A48F-72E1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 tracking-wider uppercase placeholder:text-slate-400 placeholder:normal-case focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 block">
                  Format resmi: BQPRO-[TIER]-[DURASI]M-[KODE-4]-[KODE-4]
                </span>
              </div>

              {activationResult && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  activationResult.success 
                    ? 'bg-emerald-100 text-[#008952] border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {activationResult.success ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                  <span>{activationResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white py-2.5 rounded-xl text-xs font-black shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Aktivasi Bengkel Qu PRO Sekarang</span>
              </button>
            </form>
          </div>
        )}

        {modalTab === 'paket' && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Free Lifetime */}
            <div className="border border-emerald-300 bg-emerald-50/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#008952]" />
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Free Lifetime (100% Gratis Selamanya)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                  Rp 0
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Menu Service (Registrasi, Antrian, Pengerjaan, Selesai, Total)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Menu Kasir POS (Pembayaran Tunai, QRIS, Struk Fisik & WA)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Menu Stok & Inventaris Sparepart (Inbound, Katalog, Stok Kritis)</span>
                </li>
              </ul>
            </div>

            {/* Basic Pro */}
            <div className="border border-blue-300 bg-blue-50/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Basic Pro (Rp 1.000 / hari)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-black text-blue-800 bg-white px-2 py-0.5 rounded-full border border-blue-300">
                  Solo Mode
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                {PRO_TIERS.basic.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Pro */}
            <div className="border border-emerald-400 bg-emerald-50/50 rounded-2xl p-3.5 space-y-2 ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#008952]" />
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Core Pro (Rp 2.000 / hari)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-black text-[#008952] bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                  Paling Populer
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                {PRO_TIERS.core.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#008952] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise Pro */}
            <div className="border border-purple-300 bg-purple-50/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Enterprise Pro (Rp 3.000 / hari)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-black text-purple-800 bg-white px-2 py-0.5 rounded-full border border-purple-300">
                  Multi-Cabang
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                {PRO_TIERS.corporate.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <button
                type="button"
                onClick={() => setModalTab('aktivasi')}
                className="text-xs font-bold text-[#008952] underline cursor-pointer"
              >
                Pilih Paket & Request Serial Number Sekarang →
              </button>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
          <span>Bengkel Qu POS v2.4.0 • Device ID Terverifikasi</span>
          <span className="font-mono">Dev: {DEVELOPER_EMAIL}</span>
        </div>

      </div>
    </div>
  );
};
