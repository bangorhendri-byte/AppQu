/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - TriPay Checkout Modal & Upgrade to Premium
 * Arsitektur Integrasi Pembayaran Otomatis TriPay:
 * 1. Pilihan Paket (Starter 1 Modul, Combo 2-3 Modul, Ultimate All Modul)
 * 2. Pembuatan Transaksi via Backend /api/create-payment
 * 3. Tampilan Checkout Iframe / Webview / QRIS Langsung
 * 4. Polling Otomatis Status Pembayaran via /api/payment-status/:reference
 * 5. Update Lisensi LocalStorage & Header UI secara Real-Time
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  QrCode, 
  CreditCard, 
  Key, 
  Check, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building,
  Smartphone,
  Copy,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  getLicense, 
  activateLicenseKey, 
  LicenseMetadata 
} from '../../engine/licenseEngine';
import { 
  createPayment, 
  startPaymentPolling, 
  simulatePaymentSuccess,
  TriPayPaymentResponse 
} from '../../services/tripayClient';

export interface UpgradePlan {
  id: 'starter' | 'combo' | 'ultimate';
  name: string;
  tagline: string;
  price: number;
  period: string;
  badge?: string;
  features: string[];
}

export const UPGRADE_PLANS: UpgradePlan[] = [
  {
    id: 'starter',
    name: 'Paket Starter 1 Modul',
    tagline: 'Cocok untuk 1 Cabang Usaha Tunggal',
    price: 99000,
    period: '/ Tahun',
    features: [
      '1 Modul Utama Aktif Selamanya',
      'Kasir POS Offline Bebas Kuota',
      'Cetak Struk Bluetooth Thermal',
      'Ekspor Rekap Laporan Bulanan'
    ]
  },
  {
    id: 'combo',
    name: 'Paket Combo (2-3 Modul)',
    tagline: 'Favorit UMKM Multi-Unit Bisnis',
    price: 189000,
    period: '/ Tahun',
    badge: 'PALING POPULER',
    features: [
      'Bebas Pilih 3 Modul Usaha',
      'Fitur WhatsApp Gateway Struk',
      'Sinkronisasi Multi-HP Karyawan',
      'Ekspor Buku Kas Excel Lengkap'
    ]
  },
  {
    id: 'ultimate',
    name: 'Paket Ultimate All Modul',
    tagline: 'Akses Seluruh Ekosistem Tanpa Batas',
    price: 299000,
    period: '/ Tahun',
    badge: 'VIP FULL AKSES',
    features: [
      '5 Modul Ekosistem Penuh (Bengkel, Kedai, Klinik, Ritel, Titip)',
      'Semua Fitur Premium Terbuka',
      'Manajemen Multi-Cabang Outlet',
      'Backup Cloud Otomatis Harian'
    ]
  }
];

export const PAYMENT_CHANNELS = [
  { id: 'QRIS', name: 'QRIS Instant', icon: '📱', desc: 'GoPay, OVO, Dana, BCA, ShopeePay' },
  { id: 'BCAVA', name: 'BCA Virtual Account', icon: '🏦', desc: 'Transfer Otomatis 24 Jam' },
  { id: 'BRIVA', name: 'BRI Virtual Account', icon: '🏦', desc: 'ATM, BRImo, Internet Banking' },
  { id: 'MANDIRIVA', name: 'Mandiri Virtual Account', icon: '🏦', desc: 'Livin by Mandiri & ATM' },
  { id: 'BNIVA', name: 'BNI Virtual Account', icon: '🏦', desc: 'BNI Mobile & ATM' }
];

interface UpgradeToPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedItemTitle?: string;
  lockedItemDescription?: string;
  onUpgradeSuccess?: (license: LicenseMetadata) => void;
}

export const UpgradeToPremiumModal: React.FC<UpgradeToPremiumModalProps> = ({
  isOpen,
  onClose,
  lockedItemTitle = 'Fitur / Modul Terkunci',
  lockedItemDescription = 'Fitur ini merupakan bagian dari paket UsahaQu Premium.',
  onUpgradeSuccess
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'starter' | 'combo' | 'ultimate'>('combo');
  const [selectedChannel, setSelectedChannel] = useState<string>('QRIS');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  
  // Checkout & Payment State
  const [isCreatingPayment, setIsCreatingPayment] = useState<boolean>(false);
  const [activePayment, setActivePayment] = useState<TriPayPaymentResponse | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [isSimulatingPay, setIsSimulatingPay] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Serial Key manual fallback
  const [showKeyTab, setShowKeyTab] = useState<boolean>(false);
  const [serialKeyInput, setSerialKeyInput] = useState<string>('');
  const [keyResult, setKeyResult] = useState<{ success: boolean; message: string } | null>(null);

  const stopPollingRef = useRef<(() => void) | null>(null);

  // Inisialisasi email dari session atau profil lokal
  useEffect(() => {
    if (isOpen) {
      try {
        const rawProfile = localStorage.getItem('usahaqu_store_profile');
        if (rawProfile) {
          const profile = JSON.parse(rawProfile);
          if (profile.email) setCustomerEmail(profile.email);
        }
      } catch {}
      if (!customerEmail) {
        setCustomerEmail('pemilik@usahaqu.id');
      }
    }
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlan = UPGRADE_PLANS.find((p) => p.id === selectedPlanId) || UPGRADE_PLANS[1];

  // =========================================================================
  // 1. BUAT TRANSAKSI TRIPAY (PILIH & BAYAR)
  // =========================================================================
  const handleInitiatePayment = async () => {
    setIsCreatingPayment(true);
    setPaymentError(null);

    const license = getLicense();
    const tenantId = license.device_id || `tenant-${Date.now()}`;

    const res = await createPayment({
      tenant_id: tenantId,
      email: customerEmail || 'pemilik@usahaqu.id',
      nama_paket: currentPlan.name,
      amount: currentPlan.price,
      payment_method: selectedChannel,
      customer_name: license.owner_name || 'Pemilik UsahaQu',
      return_url: window.location.href
    });

    setIsCreatingPayment(false);

    if (!res.success || !res.data) {
      setPaymentError(res.message || 'Gagal menghubungi server pembayaran TriPay.');
      return;
    }

    const txData = res.data;
    setActivePayment(txData);

    // =========================================================================
    // 2. MULAI POLLING OTOMATIS STATUS PEMBAYARAN KE /api/payment-status/:reference
    // =========================================================================
    if (stopPollingRef.current) {
      stopPollingRef.current();
    }

    stopPollingRef.current = startPaymentPolling(
      txData.reference,
      ({ transaction, license: updatedLicense }) => {
        setPaymentSuccess(true);
        if (onUpgradeSuccess) {
          onUpgradeSuccess(updatedLicense);
        }
        setTimeout(() => {
          onClose();
        }, 2200);
      },
      (errMsg) => {
        setPaymentError(errMsg);
      },
      2500
    );
  };

  // =========================================================================
  // 3. SIMULASI BAYAR LUNAS (UNTUK PENGUJIAN INSTAN SANDBOX)
  // =========================================================================
  const handleSimulatePayment = async () => {
    if (!activePayment) return;
    setIsSimulatingPay(true);
    const success = await simulatePaymentSuccess(activePayment.reference);
    setIsSimulatingPay(false);
    if (!success) {
      setPaymentError('Simulasi gagal, silakan coba lagi.');
    }
  };

  // =========================================================================
  // 4. AKTIVASI VIA SERIAL KEY MANUAL
  // =========================================================================
  const handleActivateSerialKey = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyResult(null);
    const res = activateLicenseKey(serialKeyInput, 'corporate', 12);
    setKeyResult(res);

    if (res.success && res.license) {
      if (onUpgradeSuccess) onUpgradeSuccess(res.license);
      setTimeout(() => {
        onClose();
      }, 1600);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white p-5 relative overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-100 shadow-md border border-white/20 shrink-0">
                <Crown className="w-6 h-6 text-amber-200 fill-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-white/25 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    TriPay Gateway
                  </span>
                  <span className="text-[10px] bg-emerald-400 text-slate-900 font-black px-2 py-0.5 rounded-full uppercase">
                    Aktif Otomatis
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight mt-1 truncate">
                  Upgrade UsahaQu Pro v1.83
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Locked reason banner */}
          <div className="mt-3.5 bg-black/25 backdrop-blur-md rounded-xl p-2.5 flex items-center gap-2.5 text-xs text-amber-100 border border-white/10">
            <Lock className="w-4 h-4 text-amber-300 shrink-0" />
            <div className="min-w-0">
              <strong className="text-white block truncate">{lockedItemTitle}</strong>
              <p className="text-[11px] text-amber-100/90 leading-tight truncate">{lockedItemDescription}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scroll">
          {/* =========================================================
              VIEW A: PEMBAYARAN SUKSES
              ========================================================= */}
          {paymentSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Pembayaran Berhasil Diverifikasi!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Terima kasih! Lisensi <strong className="text-emerald-700">{currentPlan.name}</strong> Anda telah aktif selama 1 Tahun penuh. Seluruh fitur dan modul kini terbuka bebas.
              </p>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-mono text-emerald-800 inline-block font-bold">
                REF: {activePayment?.reference} • STATUS: PAID
              </div>
            </div>
          ) : activePayment ? (
            /* =========================================================
               VIEW B: DETAIL PEMBAYARAN TRIPAY & QRIS / VA CODE
               ========================================================= */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">No. Referensi TriPay</span>
                    <span className="text-xs font-mono font-black text-slate-800">{activePayment.reference}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Tagihan</span>
                    <span className="text-sm font-black text-emerald-700">Rp {activePayment.total_amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* QRIS View */}
                {activePayment.payment_method === 'QRIS' && activePayment.qr_url && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-700 block">
                      Scan QRIS Menggunakan Aplikasi Bank / E-Wallet Anda
                    </span>
                    <img 
                      src={activePayment.qr_url} 
                      alt="QRIS Code" 
                      className="w-48 h-48 mx-auto rounded-xl shadow-inner border border-slate-100" 
                    />
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Menunggu pembayaran... (Terverifikasi Otomatis)</span>
                    </div>
                  </div>
                )}

                {/* Virtual Account View */}
                {activePayment.payment_method !== 'QRIS' && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Nomor Virtual Account ({activePayment.payment_method})
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl font-mono font-black text-slate-900 tracking-wider">
                        {activePayment.pay_code || '88012081234567'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(activePayment.pay_code || '88012081234567')}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Salin Nomor VA"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Sistem mendeteksi transfer secara otomatis</span>
                    </div>
                  </div>
                )}

                {/* Tombol Buka Webview TriPay Asli / Simulator */}
                <div className="space-y-2 pt-1">
                  <a
                    href={activePayment.checkout_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Halaman Pembayaran TriPay</span>
                  </a>

                  {/* Simulator Sandbox Testing */}
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isSimulatingPay}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                  >
                    {isSimulatingPay ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memproses Simulasi TriPay...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulasikan Bayar Lunas (Testing)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (stopPollingRef.current) stopPollingRef.current();
                      setActivePayment(null);
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    &larr; Ganti Paket atau Metode Bayar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================
               VIEW C: PILIHAN PAKET & METODE PEMBAYARAN TRIPAY
               ========================================================= */
            <>
              {/* Tab Switcher: TriPay vs Serial Key */}
              <div className="flex border-b border-slate-200 pb-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyTab(false)}
                  className={`text-xs font-black pb-1.5 transition border-b-2 cursor-pointer ${
                    !showKeyTab
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Pilihan Paket & TriPay Gateway
                </button>
                <button
                  type="button"
                  onClick={() => setShowKeyTab(true)}
                  className={`text-xs font-black pb-1.5 transition border-b-2 cursor-pointer ${
                    showKeyTab
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Aktivasi Serial Key Manual
                </button>
              </div>

              {!showKeyTab ? (
                <div className="space-y-4">
                  {/* 1. Tampilan 3 Pilihan Paket */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      1. Pilih Paket Usaha
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {UPGRADE_PLANS.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        return (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            {plan.badge && (
                              <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-xs">
                                {plan.badge}
                              </span>
                            )}

                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                                {plan.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                {plan.tagline}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100">
                              <span className="text-sm font-black text-slate-900 block">
                                Rp {plan.price.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                {plan.period}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ringkasan Fitur Paket Terpilih */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                      <span className="font-extrabold text-slate-800 text-[11px] block">
                        Benefit Termasuk di {currentPlan.name}:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {currentPlan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. Pilihan Saluran Pembayaran TriPay */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      2. Pilih Saluran Pembayaran (TriPay)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PAYMENT_CHANNELS.map((ch) => {
                        const isSelected = selectedChannel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setSelectedChannel(ch.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <span className="text-lg shrink-0">{ch.icon}</span>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold block truncate">{ch.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{ch.desc}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input Email Tenant */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Email Konfirmasi Lisensi
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email-anda@domain.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Tombol Pilih & Bayar */}
                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    disabled={isCreatingPayment}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                  >
                    {isCreatingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menghubungi TriPay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pilih & Bayar Rp {currentPlan.price.toLocaleString('id-ID')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Tab Aktivasi Serial Key Manual */
                <form onSubmit={handleActivateSerialKey} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Masukkan Serial Key Lisensi UsahaQu
                    </label>
                    <input
                      type="text"
                      value={serialKeyInput}
                      onChange={(e) => setSerialKeyInput(e.target.value)}
                      placeholder="UQ-PRO-XXXX-XXXX-XXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Serial key diterbitkan resmi setelah transaksi TriPay terkonfirmasi.
                    </p>
                  </div>

                  {keyResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        keyResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}
                    >
                      {keyResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{keyResult.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs transition cursor-pointer"
                  >
                    Aktifkan Lisensi Sekarang
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
