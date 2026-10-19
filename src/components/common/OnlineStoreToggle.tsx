/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe, Store, Sparkles } from 'lucide-react';

interface OnlineStoreToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  compact?: boolean;
}

export const OnlineStoreToggle: React.FC<OnlineStoreToggleProps> = ({
  checked,
  onChange,
  label = 'Tampilkan di Toko Online',
  description = 'Produk ini akan tampil di katalog digital publik dan dapat dipesan pelanggan via WhatsApp.',
  compact = false
}) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`rounded-xl border transition-all cursor-pointer select-none ${
        checked
          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20 shadow-xs'
          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
      } ${compact ? 'p-2.5' : 'p-3'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              checked
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold leading-tight ${checked ? 'text-emerald-950' : 'text-slate-700'}`}>
                {label}
              </span>
              {checked && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                  <Sparkles className="w-2 h-2" />
                  Live
                </span>
              )}
            </div>
            {!compact && (
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Toggle switch switch button */}
        <div
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            checked ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
