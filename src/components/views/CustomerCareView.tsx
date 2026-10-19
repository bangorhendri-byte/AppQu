import React, { useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Send,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Wrench,
  Receipt,
  Package,
  Clock,
  Smartphone,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Check
} from 'lucide-react';
import { WorkshopProfile, UserSession, ServiceQueue, Sparepart, Transaction } from '../../types';
import { getOrCreateDeviceId } from '../../utils/licenseManager';
import { CURRENT_APP_VERSION, CURRENT_VERSION_CODE } from '../../utils/appUpdateChecker';

interface CustomerCareViewProps {
  onBack: () => void;
  profile?: WorkshopProfile;
  userSession?: UserSession | null;
  queues?: ServiceQueue[];
  spareparts?: Sparepart[];
  transactions?: Transaction[];
  embedded?: boolean;
}

export type IssueCategory = 
  | 'Aplikasi & Performa Sistem'
  | 'Kasir & Struk Thermal POS'
  | 'Komisi Mekanik & Staf'
  | 'Antrian & Pengerjaan Servis'
  | 'Stok, Inbound & Suku Cadang'
  | 'Lisensi & Tautkan HP'
  | 'Lainnya / Umum';

interface QuickPrompt {
  id: string;
  category: IssueCategory;
  title: string;
  detail: string;
  icon: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'qp-1',
    category: 'Kasir & Struk Thermal POS',
    title: 'Struk thermal kasir terpotong atau tidak pas',
    detail: 'Saat mencetak struk di printer thermal Bluetooth 58mm, teks nota terpotong ke samping atau margin terlalu lebar.',
    icon: 'Receipt'
  },
  {
    id: 'qp-2',
    category: 'Komisi Mekanik & Staf',
    title: 'Komisi mekanik tidak otomatis bertambah',
    detail: 'Setelah pembayaran servis di kasir selesai, komisi untuk mekanik penanggung jawab belum muncul di menu Staff > Komisi Mekanik.',
    icon: 'Wrench'
  },
  {
    id: 'qp-3',
    category: 'Aplikasi & Performa Sistem',
    title: 'Aplikasi terasa lambat atau antrian tidak refresh',
    detail: 'Halaman dashboard terasa berat saat dibuka setelah beberapa hari penggunaan, atau tampilan status antrian tidak langsung berganti.',
    icon: 'Sparkles'
  },
  {
    id: 'qp-4',
    category: 'Antrian & Pengerjaan Servis',
    title: 'Unit motor tidak bisa diselesaikan / dipindah status',
    detail: 'Tombol untuk menyelesaikan servis tidak merespons atau status servis tertahan di proses pengerjaan.',
    icon: 'Clock'
  },
  {
    id: 'qp-5',
    category: 'Stok, Inbound & Suku Cadang',
    title: 'Stok suku cadang tidak sinkron atau berkurang salah',
    detail: 'Jumlah stok fisik di bengkel berbeda dengan sisa stok katalog setelah transaksi kasir atau pencatatan barang datang.',
    icon: 'Package'
  },
  {
    id: 'qp-6',
    category: 'Lisensi & Tautkan HP',
    title: 'Gagal menautkan HP karyawan lewat QR Code',
    detail: 'Saat memindai QR code di menu Setting > Tautkan HP, perangkat kedua gagal terhubung atau token kedaluwarsa.',
    icon: 'Smartphone'
  }
];

const FAQS = [
  {
    q: 'Apakah fitur Customer Care AI ini gratis?',
    a: 'Ya, 100% Gratis! Layanan Customer Care AI terintegrasi menggunakan Gemini AI resmi untuk membantu menganalisis diagnosis masalah teknis bengkel Anda kapan saja secara mandiri tanpa biaya langganan.'
  },
  {
    q: 'Bagaimana cara mengatur printer thermal 58mm agar struk rapi?',
    a: 'Saat kotak dialog Print muncul, klik "More settings" > ubah Margins menjadi "None" atau "Minimum", dan pastikan Paper size diatur ke "58mm Roll" atau "Receipt Paper". Centang juga "Background graphics".'
  },
  {
    q: 'Mengapa komisi mekanik tidak muncul setelah transaksi?',
    a: 'Komisi mekanik dihitung khusus dari item bertipe "Jasa Servis" (suku cadang tidak dihitung komisi). Pastikan mekanik penanggung jawab sudah dipilih saat checkout dan persentase komisi mekanik di menu Staff sudah diisi (misal: 20%).'
  },
  {
    q: 'Bagaimana cara mencadangkan data agar tidak hilang?',
    a: 'Buka menu Setting > Backup JSON, lalu klik "Unduh Cadangan JSON". Simpan berkas tersebut ke Google Drive atau WhatsApp Anda secara berkala setiap sore hari.'
  },
  {
    q: 'Apakah aplikasi BengkelQu bisa berjalan tanpa internet (Offline)?',
    a: 'Bisa! BengkelQu menggunakan penyimpanan lokal IndexedDB dan Service Worker PWA, sehingga kasir POS, antrian, dan stok tetap berjalan penuh saat offline.'
  }
];

export const CustomerCareView: React.FC<CustomerCareViewProps> = ({
  onBack,
  profile,
  userSession,
  queues = [],
  spareparts = [],
  transactions = [],
  embedded = false
}) => {
  const [activeTab, setActiveTab] = useState<'ai-troubleshoot' | 'send-email' | 'faq'>('ai-troubleshoot');

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>('Aplikasi & Performa Sistem');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDetails, setIssueDetails] = useState('');

  // AI Loading & Result State
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<'gemini-ai' | 'rule-based-fallback' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email form state
  const [senderName, setSenderName] = useState(profile?.ownerName || userSession?.name || '');
  const [senderPhone, setSenderPhone] = useState(profile?.phone || '');
  const [emailRecipient, setEmailRecipient] = useState('hendri.bageur20@gmail.com');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // FAQ open items
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const deviceId = getOrCreateDeviceId();
  const workshopName = profile?.workshopName || 'Bengkel Qu Motor';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pilih template cepat
  const handleSelectQuickPrompt = (qp: QuickPrompt) => {
    setSelectedCategory(qp.category);
    setIssueTitle(qp.title);
    setIssueDetails(qp.detail);
    showToast(`Template "${qp.title}" terpilih.`);
  };

  // Panggil AI Troubleshoot via server-side endpoint
  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!issueTitle.trim() && !issueDetails.trim()) {
      showToast('Harap isi judul atau detail masalah terlebih dahulu!');
      return;
    }

    setIsLoadingAI(true);
    setAiSolution(null);

    try {
      const res = await fetch('/api/customer-care/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          issueTitle: issueTitle.trim() || selectedCategory,
          issueDetails: issueDetails.trim(),
          appContext: {
            workshopName,
            version: `${CURRENT_APP_VERSION} (Build ${CURRENT_VERSION_CODE})`,
            deviceId,
            queuesCount: queues.length,
            sparepartsCount: spareparts.length,
            transactionsCount: transactions.length
          }
        })
      });

      const data = await res.json();
      if (data.success && data.solution) {
        setAiSolution(data.solution);
        setAiSource(data.source || 'gemini-ai');
        showToast('✨ Diagnosis cerdas AI berhasil disajikan!');
      } else {
        throw new Error(data.message || 'Gagal memproses diagnosis AI');
      }
    } catch (err: any) {
      console.warn('AI API Error fallback:', err);
      // Fallback lokal jika fetch gagal
      setAiSolution(`### 🔍 Analisis Kemungkinan Penyebab:
1. **Sinkronisasi Sesi Lokal**: Terjadi tumpukan memori browser sementara pada penyimpanan sesi.
2. **Koneksi / Hak Akses**: Periksa apakah role Anda saat ini memiliki otorisasi penuh untuk fitur tersebut.

### 🛠️ Langkah Solusi Mandiri:
- **Langkah 1**: Buka menu **Setting > Backup JSON** lalu unduh salinan data Anda.
- **Langkah 2**: Refresh browser Anda atau beralih ke role **Supervisor** untuk memeriksa izin modul.
- **Langkah 3**: Jika masalah berlanjut, gunakan tombol **Kirim Email ke Developer** di bawah untuk bantuan teknis langsung.`);
      setAiSource('rule-based-fallback');
      showToast('Solusi disajikan melalui mode panduan diagnostik mandiri.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Buat pesan teks email terstruktur
  const generateEmailReportText = () => {
    const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    return `LAPORAN KENDALA TEKNIS BENGKELQU
========================================
Tanggal & Waktu : ${timestamp}
Nama Bengkel    : ${workshopName}
Nama Pelapor    : ${senderName || 'Pengguna BengkelQu'}
Nomor Kontak    : ${senderPhone || '-'}
Device ID       : ${deviceId}
Versi Aplikasi  : v${CURRENT_APP_VERSION} (Build ${CURRENT_VERSION_CODE})

RINCIAN MASALAH:
----------------------------------------
Kategori Kendala: ${selectedCategory}
Judul Masalah   : ${issueTitle || 'Laporan Kendala Teknis'}
Detail Masalah  :
${issueDetails || '-'}

Catatan Tambahan :
${additionalNotes || '-'}

STATUS SISTEM SAAT INI:
----------------------------------------
- Total Antrian Aktif : ${queues.length} unit
- Total Suku Cadang   : ${spareparts.length} item
- Total Transaksi     : ${transactions.length} transaksi

${aiSolution ? `HASIL DIAGNOSA AWAL AI:
----------------------------------------
${aiSolution}
` : ''}
========================================
Mohon bantuan tim support/developer BengkelQu untuk meninjau kendala ini. Terima kasih!`;
  };

  // Buka Client Email (mailto:)
  const handleSendEmail = () => {
    const subject = `[Kendala BengkelQu] ${selectedCategory} - ${workshopName}`;
    const body = generateEmailReportText();
    const mailtoUrl = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailtoUrl, '_blank');
    showToast('Membuka aplikasi email Anda...');
  };

  // Salin Format Email ke Clipboard
  const handleCopyEmailReport = async () => {
    try {
      const text = generateEmailReportText();
      await navigator.clipboard.writeText(text);
      showToast('📋 Format laporan email berhasil disalin ke clipboard!');
    } catch (err) {
      showToast('Gagal menyalin teks laporan.');
    }
  };

  // Kirim WhatsApp Support
  const handleSendWhatsAppSupport = () => {
    const cleanPhone = '6281234567890'; // Support Center
    const body = generateEmailReportText();
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(body)}`;
    window.open(waUrl, '_blank');
    showToast('Membuka WhatsApp Support...');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* 1. TOP HEADER (ADAPTIVE: STANDALONE VS EMBEDDED) */}
      {!embedded ? (
        <div className="bg-[#008952] text-white px-4 pt-2.5 pb-2.5 shadow-sm sticky top-0 z-30">
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
                <h1 className="text-base font-extrabold tracking-tight truncate leading-tight flex items-center gap-1.5">
                  <span>Customer Care & AI Support</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    100% Gratis
                  </span>
                </h1>
                <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                  Bantuan Teknis, Diagnosis Masalah & Layanan Pengembang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="px-2 py-1 rounded-lg bg-emerald-800/50 text-[10px] font-bold text-white flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-amber-300" />
                <span>AI 24/7</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher Horizontal */}
          <div className="flex items-center gap-1.5 mt-2.5 bg-emerald-800/40 p-1 rounded-xl text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('ai-troubleshoot')}
              className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'ai-troubleshoot' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnosis AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('send-email')}
              className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'send-email' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kirim Email Support</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'faq' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ Solusi</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs mb-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#008952] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-[#008952]" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>Customer Care & Asisten Teknis AI</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                    Gratis
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400">Diagnosis kendala operasional, prompt cepat & eskalasi email</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Gemini 3.8 Flash</span>
            </div>
          </div>

          {/* Embedded Sub-Tab Switcher */}
          <div className="flex items-center gap-1.5 mt-2 bg-slate-100/80 p-1 rounded-xl text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('ai-troubleshoot')}
              className={`flex-1 min-w-[110px] py-1.5 px-2.5 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'ai-troubleshoot' ? 'bg-[#008952] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnosis AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('send-email')}
              className={`flex-1 min-w-[110px] py-1.5 px-2.5 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'send-email' ? 'bg-[#008952] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kirim Email Support</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`flex-1 min-w-[95px] py-1.5 px-2.5 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'faq' ? 'bg-[#008952] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ Solusi</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200 max-w-sm text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content View */}
      <div 
        style={{ paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))' }}
        className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full space-y-4"
      >
        {/* System Diagnostics Snapshot Banner */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008952] flex items-center justify-center font-black text-sm shrink-0">
              BQ
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sistem Terhubung • {workshopName}
              </span>
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <span>v{CURRENT_APP_VERSION} (Build {CURRENT_VERSION_CODE})</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] text-slate-500 font-medium">ID: {deviceId.slice(0, 16)}...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto text-[11px]">
            <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              {queues.length} Antrian
            </span>
            <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200">
              {spareparts.length} Part
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
              {transactions.length} Nota
            </span>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: DIAGNOSIS AI & TROUBLESHOOTING
        ========================================================================= */}
        {activeTab === 'ai-troubleshoot' && (
          <div className="space-y-4">
            {/* Banner AI Hero */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                    <Bot className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-200 tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                      AI Powered Support • Gemini 3.8 Flash
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-white mt-1">
                      Troubleshooter Cerdas BengkelQu
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-xl shadow-xs">
                    Tanpa Kuota API (Free)
                  </span>
                </div>
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed">
                Ceritakan kendala operasional, struk kasir, komisi teknisi, atau masalah sinkronisasi yang Anda hadapi. Asisten AI kami akan segera memberikan analisis akar penyebab dan langkah pemecahan masalah mandiri secara bertahap.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 block">
                Pilih Cepat Masalah yang Sering Dialami:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.id}
                    type="button"
                    onClick={() => handleSelectQuickPrompt(qp)}
                    className="p-3 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 hover:border-emerald-300 text-left transition shadow-xs flex items-start gap-2.5 cursor-pointer active:scale-98 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                      {qp.icon === 'Receipt' && <Receipt className="w-4 h-4" />}
                      {qp.icon === 'Wrench' && <Wrench className="w-4 h-4" />}
                      {qp.icon === 'Sparkles' && <Sparkles className="w-4 h-4" />}
                      {qp.icon === 'Clock' && <Clock className="w-4 h-4" />}
                      {qp.icon === 'Package' && <Package className="w-4 h-4" />}
                      {qp.icon === 'Smartphone' && <Smartphone className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                        {qp.category}
                      </span>
                      <h3 className="text-xs font-extrabold text-slate-800 tracking-tight group-hover:text-emerald-900 truncate">
                        {qp.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {qp.detail}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form Card */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#008952]" />
                <span>Formulir Rincian Masalah & Pertanyaan Teknis</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Kategori Masalah */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kategori Masalah
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as IssueCategory)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-800 font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Aplikasi & Performa Sistem">Aplikasi & Performa Sistem (Lelet / Freeze / Sync)</option>
                    <option value="Kasir & Struk Thermal POS">Kasir & Struk Thermal POS (Print 58mm / 80mm)</option>
                    <option value="Komisi Mekanik & Staf">Komisi Mekanik & Staf (Perhitungan / Payout)</option>
                    <option value="Antrian & Pengerjaan Servis">Antrian & Pengerjaan Servis (Status Unit / QC)</option>
                    <option value="Stok, Inbound & Suku Cadang">Stok, Inbound & Suku Cadang (Minus / Rusak)</option>
                    <option value="Lisensi & Tautkan HP">Lisensi & Tautkan HP (Multi-Device / Pairing Code)</option>
                    <option value="Lainnya / Umum">Lainnya / Pertanyaan Umum</option>
                  </select>
                </div>

                {/* Judul Kendala Singkat */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Judul Kendala Singkat
                  </label>
                  <input
                    type="text"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="Contoh: Struk thermal kasir terpotong atau tulisan terlalu kecil"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none"
                  />
                </div>

                {/* Detail Masalah & Gejala */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Detail Masalah & Gejala yang Terjadi
                  </label>
                  <textarea
                    rows={4}
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    placeholder="Jelaskan secara rinci apa yang terjadi, tombol apa yang diklik, atau pesan kesalahan yang muncul di layar..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-800 font-medium text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Tombol Aksi Diagnosis AI */}
                <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Data diagnostik terlampir otomatis</span>
                  </div>

                  <button
                    type="button"
                    disabled={isLoadingAI}
                    onClick={() => handleAskAI()}
                    className="bg-[#008952] hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 active:scale-95 transition cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>AI Menganalisis...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>Analisis Masalah dengan AI (Gratis)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Diagnosis Solution Card */}
            {aiSolution && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-emerald-500/40 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#008952] flex items-center justify-center font-bold">
                      <Bot className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Hasil Diagnosis & Panduan Solusi AI
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {aiSource === 'gemini-ai' ? 'Powered by Google Gemini 3.8 Flash' : 'Mode Panduan Diagnostik BengkelQu'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(aiSolution);
                        showToast('📋 Teks solusi berhasil disalin!');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Salin Solusi AI"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Solusi</span>
                    </button>
                  </div>
                </div>

                {/* Markdown Styled Solution Body */}
                <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                  {aiSolution}
                </div>

                {/* Escalation Action Strip */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Masalah belum tuntas atau memerlukan bantuan khusus?
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Kirimkan rincian kendala beserta log diagnosa ini langsung ke email pengembang.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-300" />
                      <span>Kirim Email Support</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendWhatsAppSupport}
                      className="bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                      title="Kirim via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: KIRIM EMAIL SUPPORT
        ========================================================================= */}
        {activeTab === 'send-email' && (
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008952] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Kirim Laporan Masalah ke Tim Developer
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Format email terstruktur dengan log diagnostik otomatis
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Tujuan Support</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Bengkel / Pemilik</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / Telepon</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-medium text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Masalah</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as IssueCategory)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Aplikasi & Performa Sistem">Aplikasi & Performa Sistem</option>
                    <option value="Kasir & Struk Thermal POS">Kasir & Struk Thermal POS</option>
                    <option value="Komisi Mekanik & Staf">Komisi Mekanik & Staf</option>
                    <option value="Antrian & Pengerjaan Servis">Antrian & Pengerjaan Servis</option>
                    <option value="Stok, Inbound & Suku Cadang">Stok, Inbound & Suku Cadang</option>
                    <option value="Lisensi & Tautkan HP">Lisensi & Tautkan HP</option>
                    <option value="Lainnya / Umum">Lainnya / Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Kendala</label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="Contoh: Kesalahan kalkulasi komisi mekanik pada servis turun mesin"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rincian & Gejala Masalah</label>
                <textarea
                  rows={3}
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  placeholder="Jelaskan kendala Anda..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-800 font-medium text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Preview Format Email Terstruktur */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">Preview Isi Email yang Akan Dikirim:</label>
                  <button
                    type="button"
                    onClick={handleCopyEmailReport}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin Teks Laporan</span>
                  </button>
                </div>
                <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-2xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-slate-800 shadow-inner">
                  {generateEmailReportText()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyEmailReport}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin ke Clipboard</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="bg-[#008952] hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 active:scale-95 transition cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>Buka Email Client & Kirim</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: FAQ & SOLUSI MANDIRI CEPAT
        ========================================================================= */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h3>
              <p className="text-[11px] text-slate-400">
                Solusi praktis cepat tanpa perlu menunggu respon teknis
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {FAQS.map((faq, index) => {
                const isOpen = expandedFaqIndex === index;
                return (
                  <div key={index} className="py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                      className="w-full text-left flex items-center justify-between gap-2 font-bold text-xs text-slate-800 hover:text-emerald-800 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span>{faq.q}</span>
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
