import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Car, 
  Wrench, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  AlertCircle,
  ShoppingCart,
  Lock,
  Key,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { MenuModuleConfig, ServiceQueue, WorkshopProfile, UserSession, SubscriptionState } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

interface HomeDashboardProps {
  modules: MenuModuleConfig[];
  onSelectModule: (module: MenuModuleConfig) => void;
  queues: ServiceQueue[];
  onOpenNewQueue: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onSelectQueueItem: (queue: ServiceQueue) => void;
  onQuickSearchPlat: (query: string) => void;
  profile?: WorkshopProfile;
  userSession?: UserSession | null;
  onLogout?: () => void;
  onSwitchUserRole?: (role: UserSession['role']) => void;
  subscription?: SubscriptionState;
  onOpenSubscription?: () => void;
  onOpenEcosystemSwitcher?: () => void;
  onOpenPosCore?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  modules,
  onSelectModule,
  queues,
  onOpenNewQueue,
  onOpenNotifications,
  unreadNotifsCount,
  onSelectQueueItem,
  onQuickSearchPlat,
  profile,
  userSession,
  onLogout,
  onSwitchUserRole,
  subscription,
  onOpenSubscription,
  onOpenEcosystemSwitcher,
  onOpenPosCore
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restrictedModalInfo, setRestrictedModalInfo] = useState<{
    moduleName: string;
    reason: string;
  } | null>(null);

  const currentRole = userSession?.role || 'Supervisor';

  // Role permissions checking for BengkelQu menu modules
  const checkModuleAccess = (moduleId: string): { allowed: boolean; reason?: string } => {
    if (currentRole === 'Supervisor' || currentRole === 'Owner' || currentRole === 'Admin') {
      return { allowed: true };
    }

    if (currentRole === 'Kasir') {
      if (moduleId === 'laporan') {
        return { 
          allowed: false, 
          reason: 'Laporan Keuangan & Omset Bengkel hanya dapat diakses oleh Supervisor / Owner.' 
        };
      }
      if (moduleId === 'setting') {
        return { 
          allowed: false, 
          reason: 'Pengaturan Sistem & Database hanya dapat diakses oleh Administrator / Supervisor.' 
        };
      }
      return { allowed: true };
    }

    if (currentRole === 'Mekanik') {
      if (moduleId === 'kasir') {
        return { 
          allowed: false, 
          reason: 'Kasir POS & Pembayaran uang tunai dibatasi khusus untuk Kasir atau Supervisor.' 
        };
      }
      if (moduleId === 'laporan') {
        return { 
          allowed: false, 
          reason: 'Laporan Omset Finansial Bengkel hanya dapat diakses oleh Supervisor / Owner.' 
        };
      }
      if (moduleId === 'marketing') {
        return { 
          allowed: false, 
          reason: 'Menu Marketing & Broadcast Promosi dikelola oleh Supervisor / Kasir.' 
        };
      }
      if (moduleId === 'setting') {
        return { 
          allowed: false, 
          reason: 'Pengaturan Sistem & Database hanya dapat diakses oleh Administrator / Supervisor.' 
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  };

  const handleModuleClick = (mod: MenuModuleConfig) => {
    const access = checkModuleAccess(mod.id);
    if (!access.allowed) {
      setRestrictedModalInfo({
        moduleName: mod.title,
        reason: access.reason || 'Fitur ini dibatasi untuk role saat ini.'
      });
      return;
    }
    onSelectModule(mod);
  };

  // Workshop quick stats
  const waitingCount = queues.filter((q) => q.status === 'menunggu').length;
  const inProgressCount = queues.filter((q) => q.status === 'proses').length;
  const completedCount = queues.filter((q) => q.status === 'selesai').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onQuickSearchPlat(searchQuery.trim());
    }
  };

  return (
    <div className="flex-1 bg-slate-50 pb-6">
      {/* 1. TOP HEADER: Clean Green Background with Profile Greeting & Notification Icon */}
      <div 
        className="bg-[#008952] text-white px-5 pt-3.5 pb-7 relative overflow-hidden rounded-b-[28px] shadow-md"
      >
        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-6 -bottom-8 opacity-15 pointer-events-none transform rotate-12">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-6h2v6zm0-8h-2V7h2v3z" />
          </svg>
        </div>
        <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Profile Greeting with Master Switcher on Logo BQ */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenEcosystemSwitcher}
              className="relative text-left cursor-pointer focus:outline-hidden transition-transform active:scale-95 group"
              title="Klik Logo BQ untuk Ganti Modul Ekosistem (KedaiQu, KlinikQu, RitelQu, Titip Qu)"
            >
              <div className="w-12 h-12 rounded-full bg-white text-[#008952] font-black text-lg flex items-center justify-center shadow-md ring-2 ring-emerald-300/40 group-hover:ring-white group-hover:scale-105 transition-all">
                BQ
              </div>
              <div className="absolute -top-1 -right-1 bg-slate-900 border border-emerald-300 text-[8px] font-black text-emerald-300 px-1 py-0.2 rounded-full shadow-xs uppercase">
                UQ
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#008952] rounded-full" />
            </button>
            <div>
              <button
                type="button"
                onClick={onOpenEcosystemSwitcher}
                className="flex items-center gap-1.5 text-left cursor-pointer group"
                title="Buka UsahaQu Master Switcher"
              >
                <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider group-hover:text-white transition-colors">
                  BENGKEL QU
                </span>
                <span className="text-[9px] bg-emerald-800/80 text-emerald-200 px-1.5 py-0.2 rounded font-semibold border border-emerald-600/40 group-hover:bg-emerald-700">
                  Ganti ▾
                </span>
              </button>
              <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                Halo, {userSession?.name?.split(' ')[0] || profile?.ownerName?.split(' ')[0] || 'SMB'} 👋
              </h2>
              <p className="text-[11px] text-emerald-100/90 font-medium truncate max-w-[260px]">
                {profile?.workshopName || 'Bengkel Qu Motor Berkah Jaya'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 relative z-10">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Plat Nomor (contoh: D 4521 ABC)..."
              className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-medium rounded-xl pl-9 pr-20 py-2.5 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-300 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Cari Unit
            </button>
          </div>
        </form>
      </div>

      {/* 2. SUMMARY WORKSHOP CARD (Floating overlap) */}
      <div className="px-4 -mt-4 relative z-20">
        <div className="bg-white rounded-2xl p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06)] border border-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#008952]" />
                Omset Hari Ini (Kas & QRIS)
              </span>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Rp 2.450.000
              </div>
            </div>
            <button
              onClick={onOpenNewQueue}
              className="bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Antrian</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-3 text-center">
            <div className="bg-amber-50/70 rounded-xl p-2 border border-amber-100/60">
              <span className="text-[10px] font-semibold text-amber-700 block">Menunggu</span>
              <span className="text-base font-extrabold text-amber-800">{waitingCount} Unit</span>
            </div>
            <div className="bg-blue-50/70 rounded-xl p-2 border border-blue-100/60">
              <span className="text-[10px] font-semibold text-blue-700 block">Dikerjakan</span>
              <span className="text-base font-extrabold text-blue-800">{inProgressCount} Unit</span>
            </div>
            <div className="bg-emerald-50/70 rounded-xl p-2 border border-emerald-100/60">
              <span className="text-[10px] font-semibold text-[#008952] block">Selesai</span>
              <span className="text-base font-extrabold text-emerald-800">{completedCount} Unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* POS Core Offline Quick Access Banner */}
      {onOpenPosCore && (
        <div className="px-4 mt-3">
          <div 
            onClick={onOpenPosCore}
            className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3 cursor-pointer active:scale-98 transition group border border-emerald-600/40"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
                <ShoppingCart className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs text-white">Kasir POS Offline (IndexedDB)</h4>
                  <span className="text-[9px] bg-amber-400 text-slate-900 font-black px-1.5 py-0.2 rounded uppercase">
                    100% Offline
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 truncate mt-0.5">
                  Katalog barang, keranjang checkout, kalkulator kembalian & cetak struk
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-white/15 group-hover:bg-white/30 flex items-center justify-center shrink-0 transition">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* 3. MENU UTAMA BENGKEL (Dengan Proteksi Hak Akses Role) */}
      <div className="px-4 mt-5">
        {/* Role Access Indicator & Quick Switcher Strip */}
        <div className="mb-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-3 shadow-sm border border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Key className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block leading-none">
                Hak Akses Role Aktif
              </span>
              <span className="text-xs font-black text-white leading-tight">
                Mode: <span className="text-emerald-400 font-extrabold">{currentRole}</span>
              </span>
            </div>
          </div>

          {/* Quick Role Switch Buttons */}
          {onSwitchUserRole && (
            <div className="flex items-center gap-1 ml-auto">
              {(['Supervisor', 'Kasir', 'Mekanik'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSwitchUserRole(r)}
                  className={`text-[10px] px-2 py-1 rounded-lg font-black transition-all cursor-pointer ${
                    currentRole === r
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title={`Uji Coba Hak Akses Role ${r}`}
                >
                  {r === 'Supervisor' && '🛡️ SPV'}
                  {r === 'Kasir' && '🛒 Kasir'}
                  {r === 'Mekanik' && '🔧 Mekanik'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Menu Utama Bengkel
            </h3>
            <p className="text-[11px] text-slate-500">
              {currentRole === 'Supervisor' ? 'Akses penuh ke semua modul' : `Menu disesuaikan untuk role ${currentRole}`}
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#008952] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {modules.length} Menu
          </span>
        </div>

        {/* Grid 3 Kolom: Menampilkan Ikon Hijau, Nama, dan Badge Hak Akses */}
        <div className="grid grid-cols-3 gap-2.5">
          {modules.map((mod) => {
            const access = checkModuleAccess(mod.id);
            const isAllowed = access.allowed;

            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                className={`rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200 group active:scale-95 flex flex-col items-center justify-center text-center cursor-pointer relative ${
                  isAllowed
                    ? 'bg-white border border-slate-100 hover:border-emerald-200'
                    : 'bg-slate-100/90 border border-slate-200 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Lock Badge if restricted for current role */}
                {!isAllowed && (
                  <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-xs" title="Menu dibatasi untuk role saat ini">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                )}

                {/* Ikon Hijau Kotak Bersudut Tumpul */}
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-md transition-transform mb-2 ${
                  isAllowed 
                    ? 'bg-[#008952] text-white shadow-emerald-700/20 group-hover:scale-105'
                    : 'bg-slate-500 text-slate-200 shadow-slate-500/20'
                }`}>
                  <IconRenderer name={mod.iconName} className="w-6 h-6 stroke-[2.2]" />
                </div>

                {/* Nama Menu & Status Akses */}
                <span className={`font-bold text-xs tracking-tight leading-tight ${
                  isAllowed ? 'text-slate-800 group-hover:text-[#008952]' : 'text-slate-500'
                }`}>
                  {mod.title}
                </span>

                {!isAllowed && (
                  <span className="text-[8.5px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-full mt-1">
                    Dibatasi
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. LIVE ANTRIAN & PROGRES WORKSHOP PREVIEW */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Antrian Motor Saat Ini
            </h3>
          </div>
          <button
            onClick={() => onSelectModule(modules[0])}
            className="text-[11px] font-bold text-[#008952] hover:underline flex items-center gap-0.5"
          >
            Lihat Semua Antrian <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {queues.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectQueueItem(item)}
              className="bg-white rounded-xl p-3 shadow-xs border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#008952] text-white">
                    {item.queueNumber}
                  </span>
                  <span className="font-bold text-xs text-slate-800">{item.plateNumber}</span>
                  <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                    ({item.vehicleModel})
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    item.status === 'proses'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : item.status === 'selesai'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-2 text-[11px] text-slate-600 line-clamp-1">
                Keluhan: <span className="font-medium text-slate-800">{item.complaint}</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.status === 'selesai'
                        ? 'bg-emerald-500'
                        : item.status === 'proses'
                        ? 'bg-blue-500'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">
                  {item.progressPercent}%
                </span>
                <span className="text-[10px] font-medium text-slate-400 ml-1">
                  Mekanik: {item.mechanicName.split(' ')[1] || item.mechanicName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dialog: Akses Dibatasi untuk Role Tertentu */}
      {restrictedModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Akses Dibatasi (RBAC)
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">
                Modul {restrictedModalInfo.moduleName}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {restrictedModalInfo.reason}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-600 border border-slate-200/80 text-left space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>Solusi Hak Akses:</span>
              </div>
              <p className="text-slate-500 leading-snug">
                Role Anda saat ini adalah <strong className="text-slate-800 font-bold">{currentRole}</strong>. Anda dapat beralih ke role Supervisor untuk membuka seluruh menu.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRestrictedModalInfo(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Tutup
              </button>
              {onSwitchUserRole && (
                <button
                  type="button"
                  onClick={() => {
                    onSwitchUserRole('Supervisor');
                    setRestrictedModalInfo(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-700/25 transition cursor-pointer"
                >
                  Beralih ke SPV
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
