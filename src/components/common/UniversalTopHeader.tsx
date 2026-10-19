/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UniversalTopHeader - Top Header Bar Konsisten di Semua Halaman
 * Sesuai Spesifikasi:
 * - Kiri: Logo UsahaQu (Tombol Poin Akses utama -> Buka Drawer Pusat Modul & Template)
 * - Kanan/Tengah: Tombol Pintas Pintar "[📍 CustomerQu]" / "[🛒 Kasir POS]" (Quick-Switch)
 * - Ikon Notifikasi (Bell) untuk lonceng panggilan pembeli & pesan chat masuk
 */

import React from 'react';
import { Bell, MapPin, ShoppingCart, Sparkles } from 'lucide-react';
import { AppQuLogo } from './AppQuLogo';

interface UniversalTopHeaderProps {
  currentViewName?: string;
  isCustomerQuActive?: boolean;
  onOpenModuleDrawer: () => void;
  onQuickToggleCustomerQu: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  activePingsCount?: number;
}

export const UniversalTopHeader: React.FC<UniversalTopHeaderProps> = ({
  currentViewName = 'BengkelQu',
  isCustomerQuActive = false,
  onOpenModuleDrawer,
  onQuickToggleCustomerQu,
  onOpenNotifications,
  unreadCount = 0,
  activePingsCount = 0
}) => {
  const totalBadges = unreadCount + activePingsCount;

  return (
    <header className="w-full bg-[#008952] text-white px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 shadow-md shrink-0 z-30 select-none">
      
      {/* 1. KIRI: LOGO APPQU (Tombol Poin Akses Utama) */}
      <button
        type="button"
        onClick={onOpenModuleDrawer}
        className="flex items-center gap-2 text-left cursor-pointer group active:scale-95 transition-transform focus:outline-none"
        title="Buka Pusat Modul & Template AppQu"
      >
        <div className="relative">
          <AppQuLogo size={36} rounded="rounded-xl" className="ring-2 ring-white/30 group-hover:ring-white group-hover:scale-105 transition-all shadow-md" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#008952] animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1 leading-none">
            <span className="font-black text-sm tracking-tight text-white group-hover:text-emerald-100 transition-colors">
              AppQu
            </span>
            <span className="text-[9px] bg-emerald-800/80 text-emerald-200 px-1 py-0.2 rounded font-mono font-bold border border-emerald-600/40">
              Menu ▾
            </span>
          </div>
          <span className="text-[10px] text-emerald-100 font-medium block truncate max-w-[120px] sm:max-w-[160px] opacity-90 mt-0.5 leading-none">
            {currentViewName}
          </span>
        </div>
      </button>

      {/* 2. KANAN / TENGAH: TOMBOL PINTAS PINTAR & NOTIFIKASI BELL */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Tombol Pintas Pintar Quick-Switch [📍 CustomerQu] / [🛒 Kasir POS] */}
        <button
          type="button"
          onClick={onQuickToggleCustomerQu}
          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
            isCustomerQuActive
              ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 ring-2 ring-amber-300/30'
              : 'bg-white text-[#008952] border-emerald-100 hover:bg-emerald-50 ring-2 ring-white/20'
          }`}
          title={isCustomerQuActive ? 'Kembali ke Kasir POS' : 'Buka Peta Radar CustomerQu'}
        >
          {isCustomerQuActive ? (
            <>
              <ShoppingCart className="w-3.5 h-3.5 text-slate-950" />
              <span>🛒 Mode Kasir</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-[#008952] animate-bounce" />
              <span>📍 CustomerQu</span>
            </>
          )}
        </button>

        {/* Ikon Notifikasi (Bell) untuk lonceng panggilan pembeli & pesan chat masuk */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Notifikasi & Panggilan"
          className="relative w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center transition cursor-pointer text-white"
          title="Notifikasi & Panggilan Masuk"
        >
          <Bell className="w-4 h-4 text-white" />
          {totalBadges > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 border-2 border-[#008952] text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
              {totalBadges}
            </span>
          )}
        </button>

      </div>
    </header>
  );
};
