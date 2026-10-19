/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PaguyubanQuView - Modul Klaster Komunitas Warga & Smart SiagaQu AppQu
 * Integrasi Penuh:
 * 1. PaguyubanQu: Sosial, Kas Transparan, Smart Scan OCR, Surat Pengantar Digital Auto-Fill
 * 2. Smart SiagaQu: Panic Button (Audio Sirene Web Audio API), RTSP CCTV, Smart Ronda QR Checkpoint, Tanggap Duka & Dompet Solidaritas
 * 3. Klaster UsahaQu: Katalog Lapak Lokal terbit otomatis dari modul Usaha (KedaiQu, BengkelQu, RitelQu, dll)
 * 4. Multi-Role RBAC: Warga, Ketua RT, Bendahara, Sekretaris, Satpam, Pelaku Usaha, Governance Pemda
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Wallet, 
  FileText, 
  HeartHandshake, 
  QrCode, 
  AlertTriangle, 
  Bell, 
  Camera, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Plus, 
  Search, 
  Share2, 
  Volume2, 
  VolumeX, 
  Building2, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Download, 
  Check, 
  X, 
  Eye, 
  ShoppingBag, 
  ArrowRight,
  Filter,
  Flame,
  Activity,
  UserCheck,
  Award
} from 'lucide-react';
import { 
  KomunitasRole, 
  WargaMember, 
  CommunityFeedItem, 
  KasTransactionItem, 
  SuratPengantarItem, 
  EmergencyAlertItem, 
  RondaCheckpointItem,
  TanggapDukaItem
} from './PaguyubanTypes';
import { 
  getSavedMembers, 
  getSavedFeeds, 
  saveFeed, 
  toggleLikeFeed,
  getSavedKas, 
  saveKasEntry, 
  getSavedSurat, 
  saveSurat, 
  updateSuratStatus, 
  getSavedRondaCheckpoints, 
  scanRondaCheckpoint,
  getSavedTanggapDuka, 
  donateToSolidarity,
  getSavedEmergencyAlerts, 
  triggerEmergencyPanicAlert,
  resolveEmergencyAlert
} from './PaguyubanStorage';
import { playEmergencySiren, stopEmergencySiren, isSirenActive } from './SiagaQuAudio';
import { AppQuLogo } from '../common/AppQuLogo';

interface PaguyubanQuViewProps {
  onBackToMain?: () => void;
  onOpenUsahaModule?: (moduleKey: string) => void;
  currentSparepartsCount?: number;
}

export const PaguyubanQuView: React.FC<PaguyubanQuViewProps> = ({
  onBackToMain,
  onOpenUsahaModule
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'siaga' | 'kas' | 'surat' | 'warga'>('feed');

  // RBAC Role State
  const [currentRole, setCurrentRole] = useState<KomunitasRole>('Warga');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Community data states
  const [members, setMembers] = useState<WargaMember[]>(() => getSavedMembers());
  const [feeds, setFeeds] = useState<CommunityFeedItem[]>(() => getSavedFeeds());
  const [kasList, setKasList] = useState<KasTransactionItem[]>(() => getSavedKas());
  const [suratList, setSuratList] = useState<SuratPengantarItem[]>(() => getSavedSurat());
  const [rondaCheckpoints, setRondaCheckpoints] = useState<RondaCheckpointItem[]>(() => getSavedRondaCheckpoints());
  const [tanggapDukaList, setTanggapDukaList] = useState<TanggapDukaItem[]>(() => getSavedTanggapDuka());
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlertItem[]>(() => getSavedEmergencyAlerts());

  // Panic button & siren state
  const [isPanicTriggered, setIsPanicTriggered] = useState(false);
  const [activeAlert, setActiveAlert] = useState<EmergencyAlertItem | null>(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  // Smart Ronda QR Scanner modal state
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [selectedCheckpointToScan, setSelectedCheckpointToScan] = useState<string>('chk-1');
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);

  // Smart Scan OCR Kas Iuran modal state
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrStep, setOcrStep] = useState<'upload' | 'scanning' | 'result'>('upload');
  const [ocrForm, setOcrForm] = useState({
    payerName: 'Bpk. Hendra Gunawan (Blok C3/07)',
    amount: 150000,
    category: 'Iuran Bulanan' as KasTransactionItem['category'],
    title: 'Iuran Keamanan & Kebersihan Oktober 2026',
    receiptNumber: `KAS-OCR-${Date.now().toString().slice(-6)}`
  });

  // Surat Pengantar Modal state
  const [isNewSuratModalOpen, setIsNewSuratModalOpen] = useState(false);
  const [suratForm, setSuratForm] = useState({
    applicantName: 'Bpk. Ahmad Fauzi',
    applicantNikMasked: '3273********0001',
    applicantAddress: 'Blok A1 No. 04, RT 001 / RW 005',
    type: 'Pengantar SKCK' as SuratPengantarItem['type'],
    purpose: ''
  });
  const [viewingSuratDetail, setViewingSuratDetail] = useState<SuratPengantarItem | null>(null);

  // New Post Feed Modal state
  const [isNewFeedModalOpen, setIsNewFeedModalOpen] = useState(false);
  const [feedTitle, setFeedTitle] = useState('');
  const [feedContent, setFeedContent] = useState('');
  const [feedType, setFeedType] = useState<CommunityFeedItem['type']>('ASPIRASI_WARGA');

  // Solidarity Donation Modal state
  const [activeDonationItem, setActiveDonationItem] = useState<TanggapDukaItem | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(50000);
  const [donorName, setDonorName] = useState<string>('Warga RT 01');

  // Filter state for Feed
  const [feedFilter, setFeedFilter] = useState<'SEMUA' | 'PENGUMUMAN' | 'LAPAK' | 'DUKA'>('SEMUA');

  // Quick switch role
  const rolesList: KomunitasRole[] = [
    'Warga',
    'Ketua RT',
    'Wakil RT',
    'Bendahara',
    'Sekretaris',
    'Satpam / Ronda',
    'Pelaku Usaha',
    'Governance / Pemda'
  ];

  // Refresh feeds & kas on mount
  useEffect(() => {
    setFeeds(getSavedFeeds());
    setKasList(getSavedKas());
  }, []);

  // Panic button audio listener
  useEffect(() => {
    return () => {
      stopEmergencySiren();
    };
  }, []);

  // Trigger Emergency Panic Button
  const handleTriggerPanic = (type: EmergencyAlertItem['type']) => {
    const coords: [number, number] = [-6.9175, 107.6191];
    const alert = triggerEmergencyPanicAlert(
      type,
      'Warga Siaga (Bpk. Ahmad Fauzi)',
      'Jl. Mawar Raya Blok A1 No. 04',
      coords
    );
    setActiveAlert(alert);
    setIsPanicTriggered(true);
    playEmergencySiren();
    setSirenPlaying(true);
    setEmergencyAlerts(getSavedEmergencyAlerts());
  };

  const handleStopPanic = () => {
    stopEmergencySiren();
    setSirenPlaying(false);
    setIsPanicTriggered(false);
    if (activeAlert) {
      const updated = resolveEmergencyAlert(activeAlert.id);
      setEmergencyAlerts(updated);
      setActiveAlert(null);
    }
  };

  // Toggle Siren Sound
  const handleToggleSirenSound = () => {
    if (sirenPlaying) {
      stopEmergencySiren();
      setSirenPlaying(false);
    } else {
      playEmergencySiren();
      setSirenPlaying(true);
    }
  };

  // Scan QR Checkpoint
  const handleConfirmScan = (checkpointId: string) => {
    const updated = scanRondaCheckpoint(checkpointId, 'Petugas Ronda (' + currentRole + ')');
    setRondaCheckpoints(updated);
    setScanSuccessMsg(`Checkpoint ${checkpointId} berhasil diverifikasi & dicatat di audit log!`);
    setTimeout(() => {
      setScanSuccessMsg(null);
      setIsQrScannerOpen(false);
    }, 1500);
  };

  // Perform Smart Scan OCR Simulation
  const handleStartOcrScan = () => {
    setOcrStep('scanning');
    setTimeout(() => {
      setOcrStep('result');
    }, 1400);
  };

  const handleSaveOcrKas = () => {
    const newKas: KasTransactionItem = {
      id: `kas-ocr-${Date.now()}`,
      title: ocrForm.title,
      category: ocrForm.category,
      amount: ocrForm.amount,
      isIncome: true,
      payerName: ocrForm.payerName,
      date: 'Hari ini',
      receiptNumber: ocrForm.receiptNumber,
      isOcrVerified: true,
      status: 'Lunas'
    };
    const updated = saveKasEntry(newKas);
    setKasList(updated);
    setIsOcrModalOpen(false);
    setOcrStep('upload');
  };

  // Submit Surat Pengantar
  const handleSubmitSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suratForm.purpose.trim()) return;

    const newSurat: SuratPengantarItem = {
      id: `srt-${Date.now()}`,
      applicantName: suratForm.applicantName,
      applicantNikMasked: suratForm.applicantNikMasked,
      applicantAddress: suratForm.applicantAddress,
      type: suratForm.type,
      purpose: suratForm.purpose,
      status: 'Menunggu Verifikasi',
      submittedDate: 'Hari ini'
    };
    const updated = saveSurat(newSurat);
    setSuratList(updated);
    setIsNewSuratModalOpen(false);
    setSuratForm({
      applicantName: 'Bpk. Ahmad Fauzi',
      applicantNikMasked: '3273********0001',
      applicantAddress: 'Blok A1 No. 04, RT 001 / RW 005',
      type: 'Pengantar SKCK',
      purpose: ''
    });
  };

  // Handle Surat Approval by RT
  const handleApproveSurat = (id: string) => {
    const updated = updateSuratStatus(id, 'Disetujui RT', `Bpk. Ahmad Fauzi (${currentRole})`);
    setSuratList(updated);
    if (viewingSuratDetail && viewingSuratDetail.id === id) {
      setViewingSuratDetail(updated.find(s => s.id === id) || null);
    }
  };

  // Submit Solidarity Donation
  const handleProcessDonation = () => {
    if (!activeDonationItem) return;
    const { updatedDuka, kasEntry } = donateToSolidarity(activeDonationItem.id, donationAmount, donorName);
    setTanggapDukaList(updatedDuka);
    setKasList(getSavedKas());
    setActiveDonationItem(null);
  };

  // Submit Community Feed Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedTitle.trim() || !feedContent.trim()) return;

    const newPost: CommunityFeedItem = {
      id: `f-${Date.now()}`,
      authorName: currentRole === 'Warga' ? 'Bpk. Ahmad Fauzi (Warga)' : `Bpk. Ahmad Fauzi (${currentRole})`,
      authorRoleBadge: currentRole,
      authorAvatar: currentRole === 'Satpam / Ronda' ? '👮' : currentRole === 'Bendahara' ? '👩‍💼' : '👨‍💼',
      type: feedType,
      title: feedTitle,
      content: feedContent,
      timestamp: 'Baru saja',
      likeCount: 1,
      commentCount: 0,
      isLiked: true
    };
    const updated = saveFeed(newPost);
    setFeeds(updated);
    setIsNewFeedModalOpen(false);
    setFeedTitle('');
    setFeedContent('');
  };

  // Toggle Like Feed
  const handleLike = (id: string) => {
    const updated = toggleLikeFeed(id);
    setFeeds(updated);
  };

  // Filtered feeds
  const filteredFeeds = feeds.filter(item => {
    if (feedFilter === 'PENGUMUMAN') return item.type === 'PENGUMUMAN_RESMI' || item.type === 'KEGIATAN_AGENDA';
    if (feedFilter === 'LAPAK') return item.type === 'LAPAK_PROMO';
    if (feedFilter === 'DUKA') return item.type === 'TANGGAP_DUKA';
    return true;
  });

  // Calculate Kas Balances
  const totalIncome = kasList.filter(k => k.isIncome).reduce((sum, k) => sum + k.amount, 0);
  const totalExpense = kasList.filter(k => !k.isIncome).reduce((sum, k) => sum + k.amount, 0);
  const currentKasBalance = totalIncome - totalExpense;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans select-none">
      
      {/* 1. TOP HEADER & BRANDING BAR: Deep Emerald (#0F5257) & Warm Amber (#FB8B24) */}
      <div className="bg-[#0F5257] text-white px-3 sm:px-4 py-3 shrink-0 shadow-md border-b border-emerald-950/20">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Sub-tagline */}
          <div className="flex items-center gap-2.5 min-w-0">
            <AppQuLogo size={38} rounded="rounded-xl" className="ring-2 ring-white/30 shadow-md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-base tracking-tight text-white">
                  PaguyubanQu
                </span>
                <span className="text-[10px] bg-[#FB8B24] text-slate-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Klaster Komunitas
                </span>
              </div>
              <p className="text-[10px] text-teal-100 truncate max-w-[200px] sm:max-w-[280px]">
                Menghubungkan warga, menguatkan ekonomi, menjaga keamanan
              </p>
            </div>
          </div>

          {/* RBAC Role Switcher Pill */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#2A9D8F]/30 hover:bg-[#2A9D8F]/50 border border-teal-300/40 px-2.5 py-1.5 rounded-xl transition cursor-pointer text-left active:scale-95"
              title="Ganti Peran / Role Akses"
            >
              <div className="w-2 h-2 rounded-full bg-[#FB8B24] animate-pulse" />
              <div className="leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-teal-200 block font-semibold">
                  Peran Aktif:
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  {currentRole}
                  <span className="text-[10px] text-amber-300">▾</span>
                </span>
              </div>
            </button>

            {/* Dropdown Menu Role */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 text-slate-800">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulasi Hak Akses (RBAC)
                  </span>
                </div>
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                      currentRole === r ? 'bg-emerald-50 text-[#0F5257] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Alert Banner if Panic is Active */}
        {isPanicTriggered && activeAlert && (
          <div className="mt-2.5 bg-red-600 text-white p-2.5 rounded-xl shadow-lg border border-red-400 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-black uppercase tracking-wide">
                  ⚠️ ALARM {activeAlert.type} AKTIF!
                </span>
                <span className="text-[11px] block text-red-100 truncate">
                  {activeAlert.triggerAddress} • HP Pengurus & Satpam Berdering
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleToggleSirenSound}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs"
                title={sirenPlaying ? 'Mute Sirene' : 'Bunyikan Sirene'}
              >
                {sirenPlaying ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={handleStopPanic}
                className="bg-white text-red-700 font-bold px-2 py-1 rounded-lg text-xs hover:bg-red-50"
              >
                Matikan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION TABS (5 MODULE PILLARS) */}
      <div className="bg-white border-b border-slate-200 px-2 py-1.5 shrink-0 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar shadow-xs">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-[#0F5257] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Feed & Lapak</span>
        </button>

        <button
          onClick={() => setActiveTab('siaga')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'siaga'
              ? 'bg-red-700 text-white shadow-sm ring-2 ring-red-400/50'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Smart SiagaQu</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </button>

        <button
          onClick={() => setActiveTab('kas')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'kas'
              ? 'bg-[#0F5257] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Kas & OCR</span>
        </button>

        <button
          onClick={() => setActiveTab('surat')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'surat'
              ? 'bg-[#0F5257] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Surat Pengantar</span>
          {suratList.filter(s => s.status === 'Menunggu Verifikasi').length > 0 && (
            <span className="text-[10px] bg-amber-500 text-white px-1.5 rounded-full font-bold">
              {suratList.filter(s => s.status === 'Menunggu Verifikasi').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('warga')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'warga'
              ? 'bg-[#0F5257] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Data Warga</span>
        </button>
      </div>

      {/* 3. TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        
        {/* ================= TAB 1: FEED WARGA & LAPAK USAHAQU ================= */}
        {activeTab === 'feed' && (
          <div className="space-y-3.5 max-w-xl mx-auto">
            
            {/* Quick Actions & Filter Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {(['SEMUA', 'PENGUMUMAN', 'LAPAK', 'DUKA'] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setFeedFilter(flt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      feedFilter === flt
                        ? 'bg-[#0F5257] text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNewFeedModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#FB8B24] hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm active:scale-95 transition shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Posting</span>
              </button>
            </div>

            {/* Seamless UsahaQu Promotion Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-3 rounded-2xl shadow-sm border border-emerald-700/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-xs">
                  🏪
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-300">Integrasi Lapak UsahaQu</h4>
                  <p className="text-[11px] text-teal-100">
                    Produk dari KedaiQu, BengkelQu & RitelQu otomatis tayang di lapak warga!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFeedFilter('LAPAK')}
                className="bg-[#FB8B24] text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-xl hover:bg-amber-400 shrink-0 cursor-pointer"
              >
                Lihat Lapak
              </button>
            </div>

            {/* Feed Cards List */}
            {filteredFeeds.map(feed => (
              <div 
                key={feed.id} 
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 hover:border-emerald-300 transition"
              >
                {/* Author Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{feed.authorAvatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-800">{feed.authorName}</span>
                        <span className="text-[9px] bg-emerald-100 text-[#0F5257] font-bold px-1.5 py-0.2 rounded">
                          {feed.authorRoleBadge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{feed.timestamp}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    feed.type === 'PENGUMUMAN_RESMI' ? 'bg-blue-100 text-blue-700' :
                    feed.type === 'LAPAK_PROMO' ? 'bg-amber-100 text-amber-800' :
                    feed.type === 'TANGGAP_DUKA' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {feed.type.replace('_', ' ')}
                  </span>
                </div>

                {/* Content */}
                <h4 className="font-bold text-sm text-slate-900 mb-1">{feed.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{feed.content}</p>

                {/* Event info if applicable */}
                {feed.eventDate && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{feed.eventDate}</span>
                    </div>
                    {feed.eventLocation && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span className="truncate max-w-[150px]">{feed.eventLocation}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Lapak Product Card from UsahaQu */}
                {feed.lapakProduct && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-amber-800 font-semibold block">
                        {feed.lapakProduct.businessName}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900">{feed.lapakProduct.productName}</h5>
                      <span className="text-xs font-black text-[#0F5257]">
                        Rp {feed.lapakProduct.price.toLocaleString('id-ID')}
                        {feed.lapakProduct.unit ? ` / ${feed.lapakProduct.unit}` : ''}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/62${feed.lapakProduct.phone.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(feed.lapakProduct.businessName)},%20saya%20warga%20RT%2001%20mau%20pesan%20${encodeURIComponent(feed.lapakProduct.productName)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Pesan</span>
                    </a>
                  </div>
                )}

                {/* Social interactions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <button
                    onClick={() => handleLike(feed.id)}
                    className={`flex items-center gap-1.5 hover:text-red-500 transition cursor-pointer font-medium ${
                      feed.isLiked ? 'text-red-500 font-bold' : ''
                    }`}
                  >
                    <span>❤️</span>
                    <span>{feed.likeCount} Suka</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span>💬</span>
                    <span>{feed.commentCount} Komentar</span>
                  </div>
                  <button 
                    onClick={() => alert(`Tautan postingan disalin: ${feed.title}`)}
                    className="flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 2: SMART SIAGAQU (KEAMANAN & GOTONG ROYONG) ================= */}
        {activeTab === 'siaga' && (
          <div className="space-y-4 max-w-xl mx-auto">
            
            {/* 1. PANIC BUTTON SECTION: Kemalingan / Kebakaran / Medis */}
            <div className="bg-gradient-to-b from-red-50 to-white rounded-3xl p-4 sm:p-5 border-2 border-red-300 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShieldAlert className="w-6 h-6 text-red-600 animate-bounce" />
                <h3 className="font-black text-base text-red-950 uppercase tracking-tight">
                  Smart SiagaQu Panic Button
                </h3>
              </div>
              <p className="text-xs text-red-800 mb-4 max-w-sm mx-auto">
                Tekan tombol dalam situasi darurat. Audio sirene akan menyala dan notifikasi darurat override silent mode dikirim ke HP Satpam & Pengurus RT!
              </p>

              {/* Huge Emergency Siren Trigger Button */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => handleTriggerPanic('KEMALINGAN')}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition transform active:scale-95 cursor-pointer ring-8 ${
                    isPanicTriggered
                      ? 'bg-red-700 text-white ring-red-400 animate-pulse'
                      : 'bg-gradient-to-br from-red-600 to-rose-700 text-white ring-red-200 hover:ring-red-300 hover:scale-105'
                  }`}
                >
                  <AlertTriangle className="w-10 h-10 mb-1 text-amber-300 animate-pulse" />
                  <span className="font-black text-sm tracking-widest uppercase">
                    {isPanicTriggered ? 'SIRENE ON' : 'PANIC'}
                  </span>
                  <span className="text-[10px] font-semibold text-red-100">
                    {isPanicTriggered ? 'Tekan Matikan' : 'BAHAYA / MALING'}
                  </span>
                </button>
              </div>

              {/* Other Emergency Quick Triggers */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTriggerPanic('KEBAKARAN')}
                  className="bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-950 p-2.5 rounded-2xl flex flex-col items-center gap-1 transition cursor-pointer"
                >
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="text-xs font-bold">Kebakaran</span>
                </button>

                <button
                  onClick={() => handleTriggerPanic('MEDIS DARURAT')}
                  className="bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-950 p-2.5 rounded-2xl flex flex-col items-center gap-1 transition cursor-pointer"
                >
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">Medis Darurat</span>
                </button>

                <button
                  onClick={handleStopPanic}
                  disabled={!isPanicTriggered}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition border ${
                    isPanicTriggered
                      ? 'bg-slate-800 text-white border-slate-700 cursor-pointer hover:bg-slate-900'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <VolumeX className="w-5 h-5" />
                  <span className="text-xs font-bold">Reset Sirene</span>
                </button>
              </div>
            </div>

            {/* 2. RTSP CCTV STREAM SIMULATOR */}
            <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-xs text-slate-200">Live CCTV RTSP Siaga (RT 01)</h4>
                </div>
                <span className="text-[10px] bg-red-600/80 text-white px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE REC
                </span>
              </div>

              {/* Simulated RTSP stream camera view */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-700">
                <img 
                  src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=700&auto=format&fit=crop" 
                  alt="CCTV Portal RT 01"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-mono text-emerald-400">
                  CAM-01: PORTAL UTARA • 25 FPS
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                  {new Date().toLocaleTimeString('id-ID')} WIB
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Titik pantau portal keluar-masuk warga terhubung langsung ke HP Satpam & Balai RT.
              </p>
            </div>

            {/* 3. SMART RONDA QR CHECKPOINT */}
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#0F5257]" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Smart Ronda QR Checkpoint</h4>
                    <p className="text-[10px] text-slate-500">Patroli malam & audit presensi satpam</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsQrScannerOpen(true)}
                  className="bg-[#0F5257] hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan QR Pos</span>
                </button>
              </div>

              {/* Checkpoint list */}
              <div className="space-y-2">
                {rondaCheckpoints.map((chk, idx) => (
                  <div
                    key={chk.id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800 truncate">{chk.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          chk.status === 'Aman' ? 'bg-emerald-100 text-emerald-800' :
                          chk.status === 'Belum Patroli' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {chk.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{chk.locationDescription}</p>
                      <span className="text-[10px] text-slate-400">
                        Jadwal: {chk.targetSchedule} • Terakhir: {chk.lastScannedTime || '-'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCheckpointToScan(chk.id);
                        handleConfirmScan(chk.id);
                      }}
                      className="bg-white hover:bg-emerald-50 border border-slate-200 text-[#0F5257] px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                      title="Simulasi Scan Checkpoint ini"
                    >
                      Verifikasi
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. TANGGAP DUKA & SAKIT (DOMPET SOLIDARITAS & PIKET TAKZIAH) */}
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Tanggap Duka & Solidaritas Warga</h4>
                  <p className="text-[10px] text-slate-500">Santunan digital & rotasi piket takziah warga</p>
                </div>
              </div>

              <div className="space-y-3">
                {tanggapDukaList.map(duka => (
                  <div 
                    key={duka.id}
                    className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{duka.wargaName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            duka.statusType === 'Duka Cita' ? 'bg-slate-200 text-slate-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {duka.statusType}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">{duka.blokAddress}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{duka.dateReported}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{duka.description}</p>

                    {/* Dompet Solidaritas Progress */}
                    <div className="bg-white p-2.5 rounded-xl border border-rose-200/60">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">Dompet Solidaritas:</span>
                        <span className="font-black text-[#0F5257]">
                          Rp {duka.donationCollected.toLocaleString('id-ID')} / Rp {duka.donationTarget.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (duka.donationCollected / duka.donationTarget) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Action & Piket Takziah info */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[10px] text-slate-500">
                        👥 Piket Takziah: <span className="font-medium">{duka.piketTakziahList.slice(0, 3).join(', ')} dkk.</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveDonationItem(duka);
                          setDonationAmount(50000);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                      >
                        Donasi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: KAS WARGA TRANSPARAN & SMART SCAN OCR ================= */}
        {activeTab === 'kas' && (
          <div className="space-y-4 max-w-xl mx-auto">
            
            {/* Saldo Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-gradient-to-br from-[#0F5257] to-emerald-900 text-white p-3 rounded-2xl shadow-sm">
                <span className="text-[10px] text-emerald-200 block font-medium">Saldo Kas Aktif</span>
                <span className="font-black text-sm sm:text-base tracking-tight block mt-0.5">
                  Rp {currentKasBalance.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                <span className="text-[10px] text-slate-500 block font-medium">Total Pemasukan</span>
                <span className="font-bold text-xs sm:text-sm text-emerald-700 block mt-0.5">
                  +Rp {totalIncome.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                <span className="text-[10px] text-slate-500 block font-medium">Total Pengeluaran</span>
                <span className="font-bold text-xs sm:text-sm text-rose-600 block mt-0.5">
                  -Rp {totalExpense.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Smart Scan OCR Iuran Button Card */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-dashed border-[#2A9D8F] p-4 rounded-3xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0F5257] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Camera className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#0F5257]">Smart Scan OCR Bukti Iuran</h4>
                  <p className="text-[11px] text-slate-600">
                    Otomatis ekstrak nama pembayar, nominal, & tanggal dari kuitansi / struk transfer
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setOcrStep('upload');
                  setIsOcrModalOpen(true);
                }}
                className="bg-[#0F5257] hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 cursor-pointer shadow-sm active:scale-95 transition"
              >
                Scan OCR
              </button>
            </div>

            {/* Kas Transactions Ledger */}
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs text-slate-800">Buku Kas & Transparansi Iuran</h4>
                <span className="text-[10px] text-slate-400">Terupdate Otomatis</span>
              </div>

              <div className="space-y-2.5">
                {kasList.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{item.title}</span>
                        {item.isOcrVerified && (
                          <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            OCR
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {item.payerName ? `${item.payerName} • ` : ''}{item.category} • {item.date}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-black text-xs block ${
                        item.isIncome ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {item.isIncome ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{item.receiptNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: LAYANAN SURAT PENGANTAR DIGITAL ================= */}
        {activeTab === 'surat' && (
          <div className="space-y-4 max-w-xl mx-auto">
            
            {/* Header & Buat Surat Baru Button */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900">Layanan Surat Pengantar Digital</h4>
                <p className="text-[11px] text-slate-500">
                  Auto-fill NIK & alamat warga. Verifikasi online Ketua RT & Sekretaris.
                </p>
              </div>

              <button
                onClick={() => setIsNewSuratModalOpen(true)}
                className="bg-[#0F5257] hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Ajukan Surat</span>
              </button>
            </div>

            {/* List Surat Pengantar */}
            <div className="space-y-3">
              {suratList.map(surat => (
                <div
                  key={surat.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        {surat.letterNumber || 'Nomor Surat Menunggu Persetujuan RT'}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{surat.type}</h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      surat.status === 'Selesai' || surat.status === 'Disetujui RT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : surat.status === 'Ditolak'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {surat.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <div><span className="text-slate-400">Pemohon:</span> <span className="font-semibold">{surat.applicantName}</span> ({surat.applicantNikMasked})</div>
                    <div><span className="text-slate-400">Alamat:</span> {surat.applicantAddress}</div>
                    <div><span className="text-slate-400">Keperluan:</span> {surat.purpose}</div>
                    {surat.approvedBy && (
                      <div className="text-emerald-700 font-semibold pt-1">
                        ✓ Disetujui oleh: {surat.approvedBy}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">Diajukan: {surat.submittedDate}</span>

                    <div className="flex items-center gap-1.5">
                      {/* RT / Sekretaris Approver Action */}
                      {(currentRole === 'Ketua RT' || currentRole === 'Wakil RT' || currentRole === 'Sekretaris') && surat.status === 'Menunggu Verifikasi' && (
                        <button
                          onClick={() => handleApproveSurat(surat.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer shadow-xs"
                        >
                          Setujui RT
                        </button>
                      )}

                      <button
                        onClick={() => setViewingSuratDetail(surat)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                      >
                        Lihat Cetak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: DATA WARGA & GOVERNANCE OVERVIEW ================= */}
        {activeTab === 'warga' && (
          <div className="space-y-4 max-w-xl mx-auto">
            
            {/* Governance Pemda Overview Banner if selected */}
            {currentRole === 'Governance / Pemda' && (
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-3xl shadow-sm border border-blue-700/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-300" />
                    <h4 className="font-bold text-xs uppercase tracking-wide text-amber-300">
                      Dashboard Agregat Kelurahan / Pemda
                    </h4>
                  </div>
                  <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded font-mono">
                    SKU-RT01-RW05
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-[10px] text-blue-200 block">Kepatuhan Iuran</span>
                    <span className="font-black text-sm text-amber-300">85% Lunas</span>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-[10px] text-blue-200 block">Indeks Aman</span>
                    <span className="font-black text-sm text-emerald-300">98 / 100</span>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-[10px] text-blue-200 block">UMKM UsahaQu</span>
                    <span className="font-black text-sm text-amber-300">6 Mitra</span>
                  </div>
                </div>
              </div>
            )}

            {/* Citizens Directory */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs text-slate-800">Daftar Data Induk Warga RT 01/RW 05</h4>
                <span className="text-[10px] text-slate-500">{members.length} KK Terdaftar</span>
              </div>

              <div className="space-y-2.5">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{member.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">{member.name}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                            {member.statusHunian}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {member.alamatBlok} • {member.nikMasked}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {member.roles.map(r => (
                            <span key={r} className="text-[8px] bg-emerald-100 text-[#0F5257] font-bold px-1.5 py-0.2 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/62${member.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                      title="Hubungi WhatsApp Warga"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL 1: SMART SCAN OCR SIMULATION ================= */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2A9D8F]" />
                <h4 className="font-extrabold text-sm text-[#0F5257]">Smart OCR Scan Bukti Iuran</h4>
              </div>
              <button 
                onClick={() => setIsOcrModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ocrStep === 'upload' && (
              <div className="space-y-3 text-center">
                <div className="border-2 border-dashed border-teal-300 rounded-2xl p-6 bg-teal-50/40">
                  <Camera className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-700 font-semibold mb-1">
                    Ambil Foto Struk Transfer / Kuitansi Fisik Iuran
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Engine OCR otomatis mengekstrak nominal, nama pengirim, dan tanggal
                  </p>
                </div>

                <button
                  onClick={handleStartOcrScan}
                  className="w-full bg-[#0F5257] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition"
                >
                  Mulai Pindai OCR Otomatis
                </button>
              </div>
            )}

            {ocrStep === 'scanning' && (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-[#0F5257] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">Sedang mengekstrak data kuitansi iuran...</p>
                <span className="text-[10px] text-teal-700 block font-mono">Tesseract Vision Engine v2.4</span>
              </div>
            )}

            {ocrStep === 'result' && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Kuitansi berhasil terdeteksi dengan akurasi 99.4%!</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Pembayar / Warga</label>
                    <input
                      type="text"
                      value={ocrForm.payerName}
                      onChange={e => setOcrForm({ ...ocrForm, payerName: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nominal (Rp)</label>
                      <input
                        type="number"
                        value={ocrForm.amount}
                        onChange={e => setOcrForm({ ...ocrForm, amount: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Kategori Iuran</label>
                      <select
                        value={ocrForm.category}
                        onChange={e => setOcrForm({ ...ocrForm, category: e.target.value as any })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Iuran Bulanan">Iuran Bulanan</option>
                        <option value="Donasi Duka">Donasi Duka</option>
                        <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveOcrKas}
                  className="w-full bg-[#0F5257] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition"
                >
                  Verifikasi & Catat ke Buku Kas Transparan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: AJUKAN SURAT PENGANTAR DIGITAL ================= */}
      {isNewSuratModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-sm text-[#0F5257]">Ajukan Surat Pengantar Digital</h4>
              <button 
                onClick={() => setIsNewSuratModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitSurat} className="space-y-2.5 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-[11px] text-emerald-800">
                Data induk pemohon otomatis terisi dari akun WargaQu Anda.
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Pemohon</label>
                <input
                  type="text"
                  value={suratForm.applicantName}
                  disabled
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">NIK (Masked)</label>
                  <input
                    type="text"
                    value={suratForm.applicantNikMasked}
                    disabled
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Jenis Surat</label>
                  <select
                    value={suratForm.type}
                    onChange={e => setSuratForm({ ...suratForm, type: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Pengantar SKCK">Pengantar SKCK</option>
                    <option value="Keterangan Domisili">Keterangan Domisili</option>
                    <option value="Keterangan Usaha (SKU)">Keterangan Usaha (SKU)</option>
                    <option value="Keterangan Kematian / Duka">Keterangan Duka / Kematian</option>
                    <option value="Pengantar Nikah">Pengantar Nikah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Alamat Pemohon</label>
                <input
                  type="text"
                  value={suratForm.applicantAddress}
                  disabled
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Keperluan Pengajuan Surat *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Misal: Untuk syarat pendaftaran kerja di BUMN / Bank BRI"
                  value={suratForm.purpose}
                  onChange={e => setSuratForm({ ...suratForm, purpose: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F5257] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition mt-2"
              >
                Kirim Pengajuan ke Pengurus RT 01
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CETAK / DETAIL SURAT PENGANTAR DIGITAL ================= */}
      {viewingSuratDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400">SURAT PENGANTAR DIGITAL RESMI</span>
              <button 
                onClick={() => setViewingSuratDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Official Letter Layout */}
            <div className="border border-slate-300 p-4 rounded-xl font-serif text-slate-900 text-xs space-y-3 bg-amber-50/10">
              <div className="text-center border-b-2 border-slate-800 pb-2">
                <h5 className="font-black text-sm uppercase tracking-wider">RUKUN TETANGGA 001 / RUKUN WARGA 005</h5>
                <p className="text-[10px] font-sans text-slate-600">KELURAHAN SUKAMAJU, KECAMATAN MERDEKA</p>
                <p className="text-[9px] font-sans text-slate-500">Nomor: {viewingSuratDetail.letterNumber || '470/PENDING/RT.01/X/2026'}</p>
              </div>

              <div className="text-center py-1">
                <span className="font-bold underline text-xs uppercase">{viewingSuratDetail.type}</span>
              </div>

              <div className="space-y-1 text-[11px] leading-relaxed">
                <p>Yang bertanda tangan di bawah ini Pengurus RT 001 / RW 005, menerangkan bahwa:</p>
                <div className="pl-4 space-y-0.5">
                  <div>Nama Lengkap : <span className="font-bold">{viewingSuratDetail.applicantName}</span></div>
                  <div>NIK : <span className="font-mono">{viewingSuratDetail.applicantNikMasked}</span></div>
                  <div>Alamat : {viewingSuratDetail.applicantAddress}</div>
                  <div>Keperluan : <span className="italic">{viewingSuratDetail.purpose}</span></div>
                </div>
                <p className="pt-1">Demikian surat pengantar ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
              </div>

              <div className="pt-4 flex justify-between items-end text-[10px]">
                <div className="text-center">
                  <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[8px] font-mono mx-auto mb-1">
                    [QR CAP RT]
                  </div>
                  <span className="text-emerald-700 font-bold block">TERVERIFIKASI DIGITAL</span>
                </div>

                <div className="text-center">
                  <p>Bandung, {viewingSuratDetail.submittedDate}</p>
                  <p className="font-bold pt-6">{viewingSuratDetail.approvedBy || 'Ketua RT 001'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  alert('Surat Pengantar Digital diunduh dalam format PDF siap cetak!');
                  setViewingSuratDetail(null);
                }}
                className="flex-1 bg-[#0F5257] hover:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Surat (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DONASI SOLIDARITAS DUKA ================= */}
      {activeDonationItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-rose-700">Dompet Solidaritas Warga</h4>
              <button 
                onClick={() => setActiveDonationItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-xs">
              <span className="text-slate-500 block">Penerima Santunan:</span>
              <span className="font-bold text-slate-900 block">{activeDonationItem.wargaName}</span>
              <span className="text-[10px] text-slate-500">{activeDonationItem.blokAddress}</span>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-slate-500 block">Pilih Nominal Donasi</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[20000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      donationAmount === amt
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    Rp {amt.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcessDonation}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition mt-2"
            >
              Kirim Donasi (Tercatat ke Kas Transparan)
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: POSTING ASPIRASI / FEED BARU ================= */}
      {isNewFeedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-[#0F5257]">Buat Postingan / Aspirasi Warga</h4>
              <button 
                onClick={() => setIsNewFeedModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Kategori Post</label>
                <select
                  value={feedType}
                  onChange={e => setFeedType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="ASPIRASI_WARGA">Aspirasi / Ide Warga</option>
                  <option value="PENGUMUMAN_RESMI">Pengumuman Resmi (Pengurus RT)</option>
                  <option value="KEGIATAN_AGENDA">Agenda Kegiatan</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Judul Postingan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Usul Perbaikan Lampu PJU Gang 3"
                  value={feedTitle}
                  onChange={e => setFeedTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Isi Pesan / Keterangan *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan pesan atau aspirasi Anda untuk warga RT 01..."
                  value={feedContent}
                  onChange={e => setFeedContent(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F5257] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition mt-2"
              >
                Terbitkan ke Feed Warga RT 01
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: SCANNER RONDA CHECKPOINT SIMULATION ================= */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-800 space-y-3.5 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400">SCANNER QR RONDA CHECKPOINT</span>
              <button 
                onClick={() => setIsQrScannerOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Viewfinder */}
            <div className="relative w-48 h-48 mx-auto border-2 border-emerald-400 rounded-2xl flex items-center justify-center overflow-hidden bg-black/50">
              <QrCode className="w-28 h-28 text-emerald-400/40 animate-pulse" />
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-md animate-bounce" />
            </div>

            <p className="text-xs text-slate-300">
              Arahkan kamera ke QR Code token pos ronda untuk memvalidasi presensi patroli malam.
            </p>

            {scanSuccessMsg ? (
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-2 rounded-xl text-xs font-bold">
                {scanSuccessMsg}
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 block">Pilih Pos Ronda untuk Validasi Presensi:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {rondaCheckpoints.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleConfirmScan(c.id)}
                      className="bg-slate-800 hover:bg-emerald-900 border border-slate-700 text-white p-2 rounded-xl text-[10px] font-bold truncate"
                    >
                      {c.name.split('-')[1] || c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
