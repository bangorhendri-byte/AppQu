import React from 'react';
import { ArrowLeft, Info, Sparkles, Wrench } from 'lucide-react';

interface SubMenuHeaderProps {
  title: string;
  subtitle?: string;
  infoLabel?: string;
  onBack: () => void;
  iconGraphic?: React.ReactNode;
}

export const SubMenuHeader: React.FC<SubMenuHeaderProps> = ({
  title,
  subtitle = 'Manajemen Bengkel',
  infoLabel,
  onBack,
  iconGraphic
}) => {
  return (
    <div className="relative">
      {/* Top Header: Solid Green Background */}
      <div 
        className="bg-[#008952] text-white px-5 pt-3.5 pb-6 relative overflow-hidden shadow-md"
      >
        {/* Subtle vector illustration graphic on the right */}
        <div className="absolute -right-4 -bottom-6 opacity-15 pointer-events-none transform rotate-12 select-none">
          {iconGraphic || (
            <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
            </svg>
          )}
        </div>
        {/* Subtle decorative circles for depth */}
        <div className="absolute right-20 top-2 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        {/* Header Content Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Kembali ke Dashboard"
              className="w-10 h-10 rounded-full bg-white/15 active:bg-white/30 hover:bg-white/20 flex items-center justify-center transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{title}</h1>
              <p className="text-xs text-emerald-100 font-medium opacity-90">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-semibold text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span>v1.60</span>
            </div>
          </div>
        </div>
      </div>

      {/* Below the header: Rounded white container card with small info icon and title label */}
      <div className="px-4 -mt-5 relative z-20">
        <div className="bg-white rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-[#008952]">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 tracking-tight">
                {infoLabel || `Modul ${title} Bengkel Qu`}
              </span>
              <p className="text-[10px] text-slate-500">Pilih menu navigasi di bawah untuk melanjutkan</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold text-[#008952]">
            <Wrench className="w-3 h-3" />
            <span>Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
};
