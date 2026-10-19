/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EcosystemId } from '../common/MasterSwitcherModal';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface BusinessTypeOption {
  id: EcosystemId;
  typeKey: string;
  name: string;
  shortDesc: string;
  emoji: string;
  colorBorder: string;
  colorBg: string;
  colorText: string;
}

const BUSINESS_OPTIONS: BusinessTypeOption[] = [
  {
    id: 'bengkel',
    typeKey: 'bengkel',
    name: 'Bengkel & Servis (BengkelQu)',
    shortDesc: 'Kasir Jasa/Part, Stok Sparepart & Oli, Antrian Mekanik',
    emoji: '🏍️',
    colorBorder: 'hover:border-emerald-500',
    colorBg: 'hover:bg-emerald-50/50',
    colorText: 'text-emerald-700'
  },
  {
    id: 'kedai',
    typeKey: 'kuliner',
    name: 'Kedai & Warung Makan (KedaiQu)',
    shortDesc: 'Kasir Menu, Dapur KDS, Denah Meja & Bahan Baku',
    emoji: '☕',
    colorBorder: 'hover:border-teal-500',
    colorBg: 'hover:bg-teal-50/50',
    colorText: 'text-teal-700'
  },
  {
    id: 'ritel',
    typeKey: 'retail',
    name: 'Toko & Sembako (RitelQu)',
    shortDesc: 'Kasir Cepat Barcode, Stok Ecer/Grosir & Cetak Label Rak',
    emoji: '🛍️',
    colorBorder: 'hover:border-blue-500',
    colorBg: 'hover:bg-blue-50/50',
    colorText: 'text-blue-700'
  },
  {
    id: 'klinik',
    typeKey: 'klinik',
    name: 'Klinik & Apotek (KlinikQu)',
    shortDesc: 'Pasien, Rekam Medis Elektronik, Resep & Stok Obat',
    emoji: '🏥',
    colorBorder: 'hover:border-cyan-500',
    colorBg: 'hover:bg-cyan-50/50',
    colorText: 'text-cyan-700'
  },
  {
    id: 'titip',
    typeKey: 'titip',
    name: 'Konsinyasi & Reseller (Titip Qu)',
    shortDesc: 'Hitung HPP Produk, Bagi Hasil Titipan & Surat Jalan Reseller',
    emoji: '🤝',
    colorBorder: 'hover:border-amber-500',
    colorBg: 'hover:bg-amber-50/50',
    colorText: 'text-amber-700'
  }
];

interface BusinessTypeOnboardingModalProps {
  isOpen: boolean;
  onSelectBusiness: (id: EcosystemId, typeKey: string) => void;
  onClose?: () => void;
  allowClose?: boolean;
  currentActive?: EcosystemId;
}

export const BusinessTypeOnboardingModal: React.FC<BusinessTypeOnboardingModalProps> = ({
  isOpen,
  onSelectBusiness,
  onClose,
  allowClose = false,
  currentActive
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto custom-scroll relative">
        {allowClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Onboarding */}
        <div className="text-center pt-1">
          <div className="w-14 h-14 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-xl mb-3 shadow-lg shadow-blue-500/25">
            UQ
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              VIP FAMILY
            </span>
          </div>
          <h2 className="font-extrabold text-slate-900 text-lg leading-tight">
            Selamat Datang di UsahaQu
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Pilih jenis usaha Anda untuk menyesuaikan fitur, terminologi, dan alur kasir secara otomatis:
          </p>
        </div>

        {/* List of Business Types */}
        <div className="space-y-2.5 pt-1">
          {BUSINESS_OPTIONS.map((opt) => {
            const isSelected = currentActive === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => onSelectBusiness(opt.id, opt.typeKey)}
                className={`w-full border rounded-2xl p-3.5 flex items-center gap-3.5 text-left transition-all active:scale-98 cursor-pointer group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                    : `border-slate-200 ${opt.colorBorder} ${opt.colorBg} bg-white hover:shadow-xs`
                }`}
              >
                <div className="text-3xl shrink-0 p-1 bg-slate-50 group-hover:bg-white rounded-xl shadow-2xs border border-slate-100 transition-colors">
                  {opt.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {opt.name}
                    </p>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {opt.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 text-center flex items-center justify-between text-[11px] text-slate-400">
          <span>Penyimpanan: Offline-First</span>
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Bebas ganti kapan saja
          </span>
        </div>
      </div>
    </div>
  );
};
