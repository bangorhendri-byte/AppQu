/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Stethoscope, 
  CreditCard, 
  Pill, 
  UserCheck, 
  Users, 
  BarChart3, 
  Settings, 
  Menu as MenuIcon, 
  X, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  ArrowLeft, 
  Bell, 
  Search, 
  HeartPulse, 
  Clock, 
  CheckCircle2, 
  Crown,
  ChevronLeft,
  Store
} from 'lucide-react';
import { 
  KlinikMenuTab, 
  KlinikAntrean, 
  RekamMedisRecord, 
  SuratMedisRecord, 
  TagihanKlinik, 
  KlinikObat, 
  ResepApotek, 
  KlinikDokter, 
  JadwalPraktikDokter, 
  RekapJasaMedisDokter, 
  KlinikPasien, 
  PiutangAsuransiPasien, 
  KlinikPengeluaran, 
  KlinikProfil, 
  StafHakAkses 
} from './KlinikTypes';
import { 
  KLINIK_STORAGE_KEYS, 
  getKlinikStorage, 
  setKlinikStorage,
  DEFAULT_KLINIK_PROFIL,
  DEFAULT_KLINIK_DOKTER,
  DEFAULT_KLINIK_JADWAL,
  DEFAULT_KLINIK_STAF,
  DEFAULT_KLINIK_PASIEN,
  DEFAULT_KLINIK_OBAT,
  DEFAULT_KLINIK_ANTREAN,
  DEFAULT_KLINIK_REKAM_MEDIS,
  DEFAULT_KLINIK_SURAT_MEDIS,
  DEFAULT_KLINIK_RESEP,
  DEFAULT_KLINIK_TAGIHAN,
  DEFAULT_KLINIK_JASA_MEDIS,
  DEFAULT_KLINIK_PIUTANG,
  DEFAULT_KLINIK_PENGELUARAN
} from './KlinikStorage';

import { PendaftaranView } from './views/PendaftaranView';
import { RekamMedisView } from './views/RekamMedisView';
import { PembayaranView } from './views/PembayaranView';
import { ApotekView } from './views/ApotekView';
import { DokterStafView } from './views/DokterStafView';
import { PasienView } from './views/PasienView';
import { LaporanView } from './views/LaporanView';
import { SettingView } from './views/SettingView';

interface KlinikQuViewProps {
  onBackToBengkel?: () => void;
  onOpenMasterSwitcher: () => void;
  onOpenOnlineCatalog?: () => void;
}

export const KlinikQuView: React.FC<KlinikQuViewProps> = ({
  onBackToBengkel,
  onOpenMasterSwitcher,
  onOpenOnlineCatalog
}) => {
  // Navigation State (Active Menu Tab)
  const [activeTab, setActiveTab] = useState<KlinikMenuTab>('pendaftaran');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activePatientForSOAP, setActivePatientForSOAP] = useState<KlinikAntrean | null>(null);

  // Time ticker
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Isolated Persistent State with prefix usahaku_data_klinik_*
  const [antreanList, setAntreanList] = useState<KlinikAntrean[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.ANTREAN, DEFAULT_KLINIK_ANTREAN)
  );
  const [rekamMedisList, setRekamMedisList] = useState<RekamMedisRecord[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.REKAM_MEDIS, DEFAULT_KLINIK_REKAM_MEDIS)
  );
  const [suratMedisList, setSuratMedisList] = useState<SuratMedisRecord[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.SURAT_MEDIS, DEFAULT_KLINIK_SURAT_MEDIS)
  );
  const [tagihanList, setTagihanList] = useState<TagihanKlinik[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.TAGIHAN, DEFAULT_KLINIK_TAGIHAN)
  );
  const [obatList, setObatList] = useState<KlinikObat[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.OBAT, DEFAULT_KLINIK_OBAT)
  );
  const [resepList, setResepList] = useState<ResepApotek[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.RESEP, DEFAULT_KLINIK_RESEP)
  );
  const [dokterList, setDokterList] = useState<KlinikDokter[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.DOKTER, DEFAULT_KLINIK_DOKTER)
  );
  const [jadwalList, setJadwalList] = useState<JadwalPraktikDokter[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.JADWAL, DEFAULT_KLINIK_JADWAL)
  );
  const [jasaMedisList, setJasaMedisList] = useState<RekapJasaMedisDokter[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.JASA_MEDIS, DEFAULT_KLINIK_JASA_MEDIS)
  );
  const [pasienList, setPasienList] = useState<KlinikPasien[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.PASIEN, DEFAULT_KLINIK_PASIEN)
  );
  const [piutangList, setPiutangList] = useState<PiutangAsuransiPasien[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.PIUTANG, DEFAULT_KLINIK_PIUTANG)
  );
  const [pengeluaranList, setPengeluaranList] = useState<KlinikPengeluaran[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.PENGELUARAN, DEFAULT_KLINIK_PENGELUARAN)
  );
  const [profilKlinik, setProfilKlinik] = useState<KlinikProfil>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.PROFIL, DEFAULT_KLINIK_PROFIL)
  );
  const [stafList, setStafList] = useState<StafHakAkses[]>(() =>
    getKlinikStorage(KLINIK_STORAGE_KEYS.STAF, DEFAULT_KLINIK_STAF)
  );

  // Sync back to LocalStorage
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.ANTREAN, antreanList); }, [antreanList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.REKAM_MEDIS, rekamMedisList); }, [rekamMedisList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.SURAT_MEDIS, suratMedisList); }, [suratMedisList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.TAGIHAN, tagihanList); }, [tagihanList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.OBAT, obatList); }, [obatList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.RESEP, resepList); }, [resepList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.DOKTER, dokterList); }, [dokterList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.JADWAL, jadwalList); }, [jadwalList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.JASA_MEDIS, jasaMedisList); }, [jasaMedisList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.PASIEN, pasienList); }, [pasienList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.PIUTANG, piutangList); }, [piutangList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.PENGELUARAN, pengeluaranList); }, [pengeluaranList]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.PROFIL, profilKlinik); }, [profilKlinik]);
  useEffect(() => { setKlinikStorage(KLINIK_STORAGE_KEYS.STAF, stafList); }, [stafList]);

  // Sidebar Menu Items (8 Utama)
  const MENU_ITEMS = [
    {
      id: 'pendaftaran' as KlinikMenuTab,
      label: 'Pendaftaran',
      subtext: 'Antrean Umum / BPJS',
      icon: ClipboardList,
      badge: antreanList.filter(a => a.status === 'Menunggu' || a.status === 'Dipanggil').length.toString()
    },
    {
      id: 'rekam_medis' as KlinikMenuTab,
      label: 'Rekam Medis',
      subtext: 'Input SOAP & Surat Sakit',
      icon: Stethoscope,
      badge: undefined
    },
    {
      id: 'pembayaran' as KlinikMenuTab,
      label: 'Pembayaran',
      subtext: 'Kasir & Rincian Biaya',
      icon: CreditCard,
      badge: tagihanList.filter(t => t.statusPembayaran !== 'Lunas').length.toString()
    },
    {
      id: 'apotek' as KlinikMenuTab,
      label: 'Apotek',
      subtext: 'Resep & Warning Expired',
      icon: Pill,
      badge: resepList.filter(r => r.statusPenyiapan !== 'Diserahkan').length.toString()
    },
    {
      id: 'dokter_staf' as KlinikMenuTab,
      label: 'Dokter & Staf',
      subtext: 'Jadwal & Jasa Medis',
      icon: UserCheck,
      isPro: true
    },
    {
      id: 'pasien' as KlinikMenuTab,
      label: 'Pasien',
      subtext: 'Master Data & Piutang',
      icon: Users,
      badge: undefined
    },
    {
      id: 'laporan' as KlinikMenuTab,
      label: 'Laporan',
      subtext: 'Omset & Ekspor Excel',
      icon: BarChart3,
      isPro: true
    },
    {
      id: 'setting' as KlinikMenuTab,
      label: 'Setting',
      subtext: 'Kop Surat & Hak Akses',
      icon: Settings,
      isPro: true
    }
  ];

  // Handler from Pendaftaran to SOAP
  const handleNavigateToSOAP = (antrean: KlinikAntrean) => {
    setActivePatientForSOAP(antrean);
    setActiveTab('rekam_medis');
  };

  // Reset Factory
  const handleResetKlinikData = () => {
    setAntreanList(DEFAULT_KLINIK_ANTREAN);
    setRekamMedisList(DEFAULT_KLINIK_REKAM_MEDIS);
    setSuratMedisList(DEFAULT_KLINIK_SURAT_MEDIS);
    setTagihanList(DEFAULT_KLINIK_TAGIHAN);
    setObatList(DEFAULT_KLINIK_OBAT);
    setResepList(DEFAULT_KLINIK_RESEP);
    setDokterList(DEFAULT_KLINIK_DOKTER);
    setJadwalList(DEFAULT_KLINIK_JADWAL);
    setJasaMedisList(DEFAULT_KLINIK_JASA_MEDIS);
    setPasienList(DEFAULT_KLINIK_PASIEN);
    setPiutangList(DEFAULT_KLINIK_PIUTANG);
    setPengeluaranList(DEFAULT_KLINIK_PENGELUARAN);
    setProfilKlinik(DEFAULT_KLINIK_PROFIL);
    setStafList(DEFAULT_KLINIK_STAF);
  };

  const handleRestoreBackup = (data: any) => {
    if (data.usahaku_data_klinik_antrean) setAntreanList(data.usahaku_data_klinik_antrean);
    if (data.usahaku_data_klinik_rekam_medis) setRekamMedisList(data.usahaku_data_klinik_rekam_medis);
    if (data.usahaku_data_klinik_surat_medis) setSuratMedisList(data.usahaku_data_klinik_surat_medis);
    if (data.usahaku_data_klinik_tagihan) setTagihanList(data.usahaku_data_klinik_tagihan);
    if (data.usahaku_data_klinik_obat) setObatList(data.usahaku_data_klinik_obat);
    if (data.usahaku_data_klinik_resep) setResepList(data.usahaku_data_klinik_resep);
    if (data.usahaku_data_klinik_dokter) setDokterList(data.usahaku_data_klinik_dokter);
    if (data.usahaku_data_klinik_jadwal) setJadwalList(data.usahaku_data_klinik_jadwal);
    if (data.usahaku_data_klinik_jasa_medis) setJasaMedisList(data.usahaku_data_klinik_jasa_medis);
    if (data.usahaku_data_klinik_pasien) setPasienList(data.usahaku_data_klinik_pasien);
    if (data.usahaku_data_klinik_piutang) setPiutangList(data.usahaku_data_klinik_piutang);
    if (data.usahaku_data_klinik_pengeluaran) setPengeluaranList(data.usahaku_data_klinik_pengeluaran);
    if (data.usahaku_data_klinik_profil) setProfilKlinik(data.usahaku_data_klinik_profil);
    if (data.usahaku_data_klinik_staf) setStafList(data.usahaku_data_klinik_staf);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Drawer Backdrop Overlay (< md) */}
      {isMobileDrawerOpen && (
        <div 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR: Deep Medical Teal (#0F4C5C)
          Laptop/Desktop (>= 768px): flex permanen
          HP/Mobile (< 768px): hidden secara default, tampil sebagai sliding drawer saat dibuka
         ========================================================================= */}
      <aside
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        className={`
          fixed md:static top-0 left-0 h-full z-50 md:z-30
          bg-[#0F4C5C] text-white transition-all duration-300 ease-in-out
          flex flex-col shrink-0 select-none
          ${isMobileDrawerOpen ? 'translate-x-0 w-64 shadow-2xl flex' : '-translate-x-full md:translate-x-0 hidden md:flex'}
          ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Top Header: Brand Logo Medis KQ */}
        <div className="p-4 border-b border-teal-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo Ikon Medis "KQ" Kombinasi K, Q & Simbol Medis Plus */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-800 to-[#0A333E] border border-teal-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-teal-950/40 group">
              {/* Graphic Medical Cross + KQ monogram */}
              <div className="flex items-baseline justify-center font-black tracking-tighter text-white">
                <span className="text-lg leading-none font-extrabold tracking-tighter">K</span>
                <span className="text-sm leading-none font-bold text-[#34D399]">Q</span>
              </div>
              {/* Floating Medical Cross Badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#0F4C5C] flex items-center justify-center shadow-xs">
                <span className="text-white text-[10px] font-black leading-none">+</span>
              </div>
            </div>

            {/* Title / Brand text */}
            {isSidebarOpen && (
              <div className="truncate animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                    KlinikQu
                  </h1>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#10B981] text-[#0F4C5C] uppercase">
                    v1.81
                  </span>
                </div>
                <p className="text-[11px] text-teal-200 truncate mt-0.5 font-medium">
                  {profilKlinik.namaKlinik}
                </p>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-7 h-7 rounded-lg bg-teal-800/60 hover:bg-teal-700 text-teal-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isSidebarOpen ? 'Kecilkan Sidebar' : 'Buka Sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List - Minimalist, NO BOX-CEPTION, Indikator Garis Tipis Mint Green (#10B981) */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scroll">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all relative group cursor-pointer ${
                  isActive
                    ? 'text-[#34D399] font-extrabold'
                    : 'text-teal-100 hover:text-white font-medium hover:bg-teal-800/40'
                } rounded-xl`}
              >
                {/* Clean Mint Green Underline / Left Border Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#10B981] shadow-sm shadow-[#10B981]/50" />
                )}

                <div className={`shrink-0 transition-transform ${isActive ? 'scale-110 text-[#34D399]' : 'text-teal-300 group-hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {isSidebarOpen && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                    <div className="truncate">
                      <div className="text-xs sm:text-sm tracking-tight truncate leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-teal-300/80 font-normal truncate mt-0.5">
                        {item.subtext}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.isPro && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 shadow-xs">
                          PRO 👑
                        </span>
                      )}
                      {item.badge && Number(item.badge) > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#10B981] text-[#0F4C5C]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: Ecosystem Switcher & Back to BengkelQu */}
        <div 
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
          className="p-3 border-t border-teal-800/60 space-y-2 bg-teal-950/40"
        >
          <button
            onClick={onOpenMasterSwitcher}
            className="w-full py-2 px-3 rounded-xl bg-teal-800/50 hover:bg-teal-700/60 border border-teal-600/30 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Layers className="w-4 h-4 text-[#34D399]" />
            {isSidebarOpen && <span className="truncate">Ganti Ekosistem</span>}
          </button>

          {onBackToBengkel && (
            <button
              onClick={onBackToBengkel}
              className="w-full py-2 px-3 rounded-xl text-teal-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isSidebarOpen && <span className="truncate">Kembali ke BengkelQu</span>}
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE: Soft Slate Gray (#F8FAFC)
          Clean, High Contrast, Tablet/Laptop Medical Professional View
         ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Top Navbar */}
        <header 
          style={{ 
            paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
            minHeight: 'calc(4rem + env(safe-area-inset-top, 0px))'
          }}
          className="bg-white border-b border-slate-200/90 px-4 sm:px-6 pb-2.5 flex items-center justify-between gap-3 shrink-0 shadow-2xs z-30"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer md:hidden shrink-0"
              title="Buka Menu Klinik"
            >
              <MenuIcon className="w-5 h-5 text-[#0F4C5C]" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                <span className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight truncate">
                  {profilKlinik.namaKlinik}
                </span>
                {/* Badge Rawat Jalan: Sembunyi di HP (< md:), tampil di Laptop (>= md:) */}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#0F4C5C] border border-teal-200 hidden md:inline-block shrink-0">
                  Rawat Jalan Pratama
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate hidden md:block">
                PJ: {profilKlinik.namaDokterPenanggungJawab}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Clock */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Jam/Waktu: Sembunyi di HP (< md:), tampil di Laptop (>= md:) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              <Clock className="w-3.5 h-3.5 text-[#0F4C5C]" />
              <span>
                {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
              </span>
            </div>

            {/* Antrean Status Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-teal-50 border border-teal-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl">
              <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F4C5C] animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-500 font-medium hidden sm:inline">Pasien: </span>
                <span className="font-black text-[#0F4C5C]">{antreanList.length}</span>
                <span className="text-[10px] text-slate-400 ml-1 hidden sm:inline">Hari ini</span>
              </div>
            </div>

            {/* Tombol Toko Online & Katalog Apotek */}
            {onOpenOnlineCatalog && (
              <button
                type="button"
                onClick={onOpenOnlineCatalog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F4C5C] hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Buka Toko Online & Katalog Apotek Publik"
              >
                <Store className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden sm:inline">Toko Online</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Scrollable View Area: pb-24 di mobile agar tidak tertutup bottom nav fixed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll pb-24 md:pb-6">
          {activeTab === 'pendaftaran' && (
            <PendaftaranView
              antreanList={antreanList}
              pasienList={pasienList}
              dokterList={dokterList}
              onAddAntrean={(newA) => setAntreanList([newA, ...antreanList])}
              onUpdateStatusAntrean={(id, status) => {
                setAntreanList(prev => prev.map(a => a.id === id ? { ...a, status } : a));
              }}
              onNavigateToRekamMedis={handleNavigateToSOAP}
              onAddNewPasienQuick={(p) => setPasienList([p, ...pasienList])}
            />
          )}

          {activeTab === 'rekam_medis' && (
            <RekamMedisView
              rekamMedisList={rekamMedisList}
              suratMedisList={suratMedisList}
              antreanList={antreanList}
              pasienList={pasienList}
              dokterList={dokterList}
              obatList={obatList}
              profilKlinik={profilKlinik}
              activePatientForSOAP={activePatientForSOAP}
              onSaveRekamMedis={(rec, rsp, inv) => {
                setRekamMedisList([rec, ...rekamMedisList]);
                if (rsp) setResepList([rsp, ...resepList]);
                if (inv) setTagihanList([inv, ...tagihanList]);
              }}
              onSaveSuratMedis={(srt) => setSuratMedisList([srt, ...suratMedisList])}
              onUpdateAntreanStatus={(id, status) => {
                setAntreanList(prev => prev.map(a => a.id === id ? { ...a, status } : a));
              }}
            />
          )}

          {activeTab === 'pembayaran' && (
            <PembayaranView
              tagihanList={tagihanList}
              profilKlinik={profilKlinik}
              onUpdateStatusBayar={(id, metode, dibayar) => {
                setTagihanList(prev => prev.map(t => {
                  if (t.id === id) {
                    return {
                      ...t,
                      statusPembayaran: 'Lunas',
                      metodePembayaran: metode,
                      jumlahBayar: dibayar,
                      kembalian: Math.max(0, dibayar - t.rincian.totalBersih)
                    };
                  }
                  return t;
                }));
              }}
              onAddNewTagihanManual={(tagihan) => setTagihanList([tagihan, ...tagihanList])}
            />
          )}

          {activeTab === 'apotek' && (
            <ApotekView
              obatList={obatList}
              resepList={resepList}
              onUpdateStokObat={(id, newStok) => {
                setObatList(prev => prev.map(o => o.id === id ? { ...o, stok: newStok } : o));
              }}
              onAddNewObat={(newObat) => setObatList([newObat, ...obatList])}
              onUpdateStatusResep={(id, status) => {
                setResepList(prev => prev.map(r => r.id === id ? { ...r, statusPenyiapan: status } : r));
              }}
            />
          )}

          {activeTab === 'dokter_staf' && (
            <DokterStafView
              dokterList={dokterList}
              jadwalList={jadwalList}
              jasaMedisList={jasaMedisList}
              onAddNewDokter={(doc) => setDokterList([doc, ...dokterList])}
              onAddNewJadwal={(jdw) => setJadwalList([jdw, ...jadwalList])}
              onPayJasaMedis={(id) => {
                setJasaMedisList(prev => prev.map(j => j.id === id ? { ...j, statusPembayaran: 'Telah Ditransfer' } : j));
              }}
            />
          )}

          {activeTab === 'pasien' && (
            <PasienView
              pasienList={pasienList}
              piutangList={piutangList}
              onAddNewPasien={(pas) => setPasienList([pas, ...pasienList])}
              onUpdatePiutangStatus={(id, status) => {
                setPiutangList(prev => prev.map(p => p.id === id ? { ...p, status } : p));
              }}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanView
              tagihanList={tagihanList}
              pengeluaranList={pengeluaranList}
              obatList={obatList}
              rekamMedisList={rekamMedisList}
              profilKlinik={profilKlinik}
              onAddPengeluaran={(newP) => setPengeluaranList([newP, ...pengeluaranList])}
            />
          )}

          {activeTab === 'setting' && (
            <SettingView
              profil={profilKlinik}
              stafList={stafList}
              onSaveProfil={(p) => setProfilKlinik(p)}
              onUpdateStafList={(s) => setStafList(s)}
              onRestoreBackup={handleRestoreBackup}
              onResetKlinikData={handleResetKlinikData}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation Bar - Safe Area Bawah Protected */}
        <nav 
          aria-label="KlinikQu Bottom Navigation"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
          className="lg:hidden bg-white border-t border-slate-200 px-2 pt-1.5 flex items-center justify-around shrink-0 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        >
          {MENU_ITEMS.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
                  isActive ? 'text-[#0F4C5C] font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#10B981]' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight">{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-0.5" />}
              </button>
            );
          })}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <MenuIcon className="w-4 h-4 text-[#0F4C5C]" />
            <span className="text-[10px] leading-tight">Menu</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default KlinikQuView;
