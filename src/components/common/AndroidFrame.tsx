import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi } from 'lucide-react';
import { AppQuLogo } from './AppQuLogo';

interface AndroidFrameProps {
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
  onHomePress?: () => void;
  onBackPress?: () => void;
  canGoBack?: boolean;
  activeModuleName?: string;
  onOpenMasterSwitcher?: () => void;
  topSafeAreaColor?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  bottomBar,
  onHomePress,
  onBackPress,
  canGoBack,
  activeModuleName = 'BengkelQu - Otomotif & Servis',
  onOpenMasterSwitcher,
  topSafeAreaColor = '#008952'
}) => {
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [isRealMobileDevice, setIsRealMobileDevice] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
    }
    return false;
  });

  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      setIsRealMobileDevice(isMobile);
    };

    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const needsTopBuffer = isMobileMode || isRealMobileDevice;

  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-800 flex flex-col items-center justify-start p-0 md:py-4 md:px-4">
      {/* Top control bar outside phone frame (hanya di desktop untuk simulasi mode preview) */}
      <div className="w-full max-w-5xl mb-2.5 hidden md:flex items-center justify-between px-4 py-2 bg-white shadow-xs rounded-2xl border border-slate-200 text-slate-600 text-xs">
        <div className="flex items-center gap-3">
          <div 
            onClick={onOpenMasterSwitcher} 
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Klik untuk Buka AppQu Master Switcher"
          >
            <AppQuLogo size={32} rounded="rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight">AppQu v1.88</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                {activeModuleName}
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 text-[#008952] font-bold px-2 py-0.5 rounded-full border border-emerald-300 hidden sm:inline-flex items-center gap-1 shadow-2xs">
            FULL VERSI PERMANEN
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Frame mode toggle */}
          <button
            onClick={() => setIsMobileMode(!isMobileMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            {isMobileMode ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Mode Lebar</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mode HP (412px)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container Phone Frame / Full Viewport */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isMobileMode
            ? 'max-w-[425px] h-[100dvh] md:h-[780px] md:max-h-[92vh] rounded-none md:rounded-[40px] shadow-none md:shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-0 md:border-2 md:border-slate-300/80 overflow-hidden bg-white my-auto'
            : 'max-w-6xl xl:max-w-7xl h-[100dvh] md:h-[840px] md:max-h-[94vh] rounded-none md:rounded-2xl shadow-none md:shadow-xl border-0 md:border md:border-slate-200 bg-white overflow-hidden my-auto'
        }`}
      >
        {/* Application Viewport Container: Kaku 100% Height, Tidak Scroll Luar */}
        <div className="relative flex-1 flex flex-col h-full min-h-0 bg-slate-50 overflow-hidden">
          {/* Safe Area Atas Native Buffer (Memberikan clearance 52px aman agar jam & batre bawaan HP tidak menutupi UI) */}
          <div 
            style={{ 
              height: needsTopBuffer
                ? 'max(env(safe-area-inset-top, 0px), 3.25rem)'
                : '0px',
              backgroundColor: topSafeAreaColor
            }}
            className="shrink-0 w-full select-none z-50 transition-colors pointer-events-none"
          >
            {/* Simulasi status bar hanya ditampilkan saat di desktop preview dalam mode HP (agar pengguna desktop melihat preview nyata) */}
            {isMobileMode && !isRealMobileDevice && (
              <div className="w-full h-full flex items-center justify-between px-5 text-white/90 text-[11px] font-semibold select-none pt-1">
                <span className="font-bold tracking-tight">{currentTime}</span>
                <div className="w-3.5 h-3.5 rounded-full bg-black/40 ring-1 ring-white/20" title="Front Camera Cutout" />
                <div className="flex items-center gap-1.5 text-xs">
                  <Wifi className="w-3.5 h-3.5" />
                  <svg className="w-3.5 h-3.5 fill-current opacity-90" viewBox="0 0 24 24">
                    <path d="M2 22h20V2z" />
                  </svg>
                  <div className="flex items-center gap-0.5 font-bold text-[10px]">
                    <span className="text-[9px]">100%</span>
                    <div className="w-4 h-2.5 border border-white/90 rounded-xs p-0.5 flex items-center">
                      <div className="w-full h-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Viewport Content - Flex-1 kaku tanpa scroll luar agar navbar bawah terkunci permanen */}
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
            {children}
          </div>

          {/* Bottom Bar jika dipassing via prop (misal BengkelQu) */}
          {bottomBar && (
            <div className="shrink-0 w-full z-40 bg-white">
              {bottomBar}
            </div>
          )}

          {/* Safe Area Bawah Native Buffer (Mencegah menutupi tombol navigasi bawaan HP) */}
          <div 
            style={{ height: 'max(env(safe-area-inset-bottom, 0px), 0.35rem)' }}
            className="shrink-0 w-full bg-white select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
