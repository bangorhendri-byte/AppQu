/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ModuleTemplateDrawerModal - Modal Overlay / Drawer "Pusat Modul & Template UsahaQu"
 * Muncul saat Logo UsahaQu di Top Header Bar ditekan.
 * Menyajikan Grid Ikon Seluruh Modul:
 * - Modul POS Kasir & Transaksi
 * - Modul CustomerQu (Peta Radar & Keliling)
 * - Modul Stok & Inventaris
 * - Modul In-App Chat & Panggilan
 * - Modul Laporan Keuangan
 * - Pilihan Template Kategori Usaha (Kuliner, Sayur/Kelontong, Toko Offline, Jasa Keliling)
 */

import React from 'react';
import { 
  X, 
  ShoppingCart, 
  MapPin, 
  Package, 
  MessageCircle, 
  BarChart3, 
  Utensils, 
  Carrot, 
  Store, 
  Wrench, 
  Layers, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export type UsahaQuFeatureTarget = 
  | 'pos-kasir'
  | 'customerqu'
  | 'stok-inventaris'
  | 'chat-panggilan'
  | 'laporan-keuangan'
  | 'template-kuliner'
  | 'template-sayur'
  | 'template-toko'
  | 'template-keliling';

interface ModuleTemplateDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (target: UsahaQuFeatureTarget) => void;
  currentActiveFeature?: string;
}

export const ModuleTemplateDrawerModal: React.FC<ModuleTemplateDrawerModalProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
  currentActiveFeature
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-[32px] max-w-lg w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Drawer */}
        <div className="bg-gradient-to-r from-[#008952] via-emerald-800 to-slate-900 text-white p-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#008952] font-black text-xl flex items-center justify-center shadow-md">
              UQ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base tracking-tight">Pusat Modul & Template</h3>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                  UsahaQu
                </span>
              </div>
              <p className="text-xs text-emerald-100">Ekosistem POS, Radar CustomerQu & Multi-Usaha</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Menu"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* SECTION 1: MODUL UTAMA APLIKASI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Modul Inti Ekosistem</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                1 Aplikasi All-in-One
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. Modul POS Kasir & Transaksi */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('pos-kasir');
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 active:scale-98 ${
                  currentActiveFeature === 'kasir'
                    ? 'border-[#008952] bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#008952] flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    Modul POS Kasir
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Transaksi kasir, cetak struk thermal 58mm & QRIS
                  </p>
                </div>
              </button>

              {/* 2. Modul CustomerQu (Peta Radar & Keliling) */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('customerqu');
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 active:scale-98 ${
                  currentActiveFeature === 'customerqu'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      Modul CustomerQu
                    </span>
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black uppercase">
                      Radar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Peta live pedagang keliling, ngetem & toko offline
                  </p>
                </div>
              </button>

              {/* 3. Modul Stok & Inventaris */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('stok-inventaris');
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50 text-left transition-all cursor-pointer flex items-start gap-3 active:scale-98"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    Modul Stok & Inventaris
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Katalog barang, stok opname & barang masuk
                  </p>
                </div>
              </button>

              {/* 4. Modul In-App Chat & Panggilan */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('chat-panggilan');
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all cursor-pointer flex items-start gap-3 active:scale-98"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    Chat & Panggilan
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Pesan instan 24h & bel panggilan pembeli
                  </p>
                </div>
              </button>

              {/* 5. Modul Laporan Keuangan */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('laporan-keuangan');
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50 text-left transition-all cursor-pointer flex items-start gap-3 active:scale-98 sm:col-span-2"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    Modul Laporan Keuangan & Rekap
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Laporan omset harian, margin laba rugi, kas kecil operasional & komisi
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: PILIHAN TEMPLATE KATEGORI USAHA */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              Pilihan Template Kategori Usaha:
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Template Kuliner */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('template-kuliner');
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition cursor-pointer flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-1.5">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 block">Kuliner & Makanan</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Bakso, nasi goreng, kopi & resto</span>
              </button>

              {/* Template Sayur / Kelontong */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('template-sayur');
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition cursor-pointer flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#008952] flex items-center justify-center mb-1.5">
                  <Carrot className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 block">Sayur & Kelontong</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Sayur segar, sembako & bumbu</span>
              </button>

              {/* Template Toko Offline */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('template-toko');
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition cursor-pointer flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
                  <Store className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 block">Toko Offline & Bengkel</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Toko fisik, sparepart & minimarket</span>
              </button>

              {/* Template Jasa Keliling */}
              <button
                type="button"
                onClick={() => {
                  onSelectFeature('template-keliling');
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition cursor-pointer flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 block">Jasa Keliling</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Tambal ban, servis panggilan & laundry</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 shrink-0 text-center text-xs text-slate-500">
          <span>UsahaQu Ekosistem v1.87 • 100% Gratis, Cepat & Tanpa Biaya Berlangganan</span>
        </div>

      </div>
    </div>
  );
};
