import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  UserCheck, 
  Key, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { UserSession } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  defaultEmail?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  defaultEmail = 'smbsyariah@gmail.com'
}) => {
  const [selectedEmail, setSelectedEmail] = useState(defaultEmail);
  const [selectedRole, setSelectedRole] = useState<'Supervisor' | 'Owner' | 'Kasir'>('Supervisor');
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [autoLoginCountdown, setAutoLoginCountdown] = useState<number | null>(3);
  const [isPaused, setIsPaused] = useState(false);

  // Available Google Accounts
  const GOOGLE_ACCOUNTS = [
    {
      name: 'SMB Syariah',
      email: 'smbsyariah@gmail.com',
      role: 'Supervisor' as const,
      avatarBg: 'bg-emerald-600',
      initials: 'SM'
    },
    {
      name: 'Bpk. Ahmad Fauzi (Owner)',
      email: 'ahmad.fauzi.bengkel@gmail.com',
      role: 'Owner' as const,
      avatarBg: 'bg-blue-600',
      initials: 'AF'
    },
    {
      name: 'Staf Kasir Bengkel Qu',
      email: 'kasir.bengkelqu@gmail.com',
      role: 'Kasir' as const,
      avatarBg: 'bg-amber-600',
      initials: 'KB'
    }
  ];

  const currentAccount =
    GOOGLE_ACCOUNTS.find((acc) => acc.email === selectedEmail) || GOOGLE_ACCOUNTS[0];

  // Auto Login Countdown
  useEffect(() => {
    if (!isAutoLoginEnabled || isPaused) return;

    if (autoLoginCountdown === null) return;

    if (autoLoginCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoLoginCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoLoginCountdown === 0) {
      handlePerformGoogleLogin();
    }
  }, [autoLoginCountdown, isAutoLoginEnabled, isPaused]);

  const handlePerformGoogleLogin = (chosenAccount = currentAccount) => {
    setIsLoading(true);
    setAutoLoginCountdown(null);

    // Simulate authentic Google Identity handshake
    setTimeout(() => {
      const session: UserSession = {
        name: chosenAccount.name,
        email: chosenAccount.email,
        role: selectedRole,
        autoLogin: isAutoLoginEnabled,
        loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      };
      setIsLoading(false);
      onLoginSuccess(session);
    }, 1200);
  };

  const handleSelectAccount = (account: typeof GOOGLE_ACCOUNTS[0]) => {
    setSelectedEmail(account.email);
    setSelectedRole(account.role);
    setShowAccountChooser(false);
    setAutoLoginCountdown(null);
    handlePerformGoogleLogin(account);
  };

  return (
    <div 
      style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      className="flex-1 bg-gradient-to-b from-emerald-50 via-white to-slate-50 flex flex-col justify-between p-6 select-none animate-in fade-in"
    >
      {/* Top Brand Header */}
      <div className="pt-4 flex flex-col items-center text-center">
        {/* App Logo with solid green rounded background */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-3xl bg-[#008952] text-white flex items-center justify-center shadow-xl shadow-emerald-700/25 ring-4 ring-emerald-100">
            <Wrench className="w-10 h-10 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white text-[#008952] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-emerald-200">
            v1.60
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Bengkel Qu <span className="text-[#008952]">1.60</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1 max-w-[260px]">
          Sistem Manajemen Operasional Bengkel Motor & Mobil Modern
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="my-auto py-4 space-y-4">
        {/* Auto Login Countdown Banner */}
        {isAutoLoginEnabled && autoLoginCountdown !== null && autoLoginCountdown > 0 && !isLoading && (
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <Sparkles className="w-4 h-4 text-[#008952] shrink-0" />
              <span>Masuk otomatis dalam {autoLoginCountdown} detik...</span>
            </div>
            <button
              onClick={() => {
                setIsPaused(true);
                setAutoLoginCountdown(null);
              }}
              className="text-[11px] font-bold text-[#008952] hover:underline"
            >
              Batal
            </button>
          </div>
        )}

        {/* Google One-Tap Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_10px_35px_rgba(0,137,82,0.08)] border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs font-bold text-slate-800">Akun Google Terdeteksi</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#008952] border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Siap
            </span>
          </div>

          {/* User Account Info Item */}
          <div
            onClick={() => setShowAccountChooser(true)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl ${currentAccount.avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm`}
              >
                {currentAccount.initials}
              </div>
              <div className="min-w-0 pr-1">
                <span className="font-bold text-slate-900 text-xs block truncate leading-tight group-hover:text-[#008952] transition-colors">
                  {currentAccount.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block truncate">
                  {currentAccount.email}
                </span>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                  Peran: {selectedRole}
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#008952] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {/* Role Selector Pill */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Pilih Peran Masuk:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
              {(['Supervisor', 'Owner', 'Kasir'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-1.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                    selectedRole === r
                      ? 'bg-[#008952] text-white border-[#008952] font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Google Sign-in Main Button */}
          <button
            onClick={() => handlePerformGoogleLogin()}
            disabled={isLoading}
            className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Menghubungkan ke Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-xs">Masuk Otomatis via Google</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>

          {/* Auto Login Setting Toggle */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={isAutoLoginEnabled}
                onChange={(e) => setIsAutoLoginEnabled(e.target.checked)}
                className="w-4 h-4 text-[#008952] rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-[11px] font-medium">Masuk otomatis berikutnya</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAccountChooser(true)}
              className="text-[11px] font-bold text-[#008952] hover:underline"
            >
              Ganti Akun
            </button>
          </div>
        </div>
      </div>

      {/* Footer Security Badges */}
      <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#008952]" />
          <span>Google Identity Services 256-bit SSL</span>
        </div>
        <p>Dengan masuk, Anda menyetujui Kebijakan Layanan Bengkel Qu 1.60</p>
      </div>

      {/* Account Chooser Dialog Modal */}
      {showAccountChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="font-bold text-xs text-slate-800">Pilih Akun Google</h3>
              </div>
              <button
                onClick={() => setShowAccountChooser(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Pilih akun Google yang terdaftar untuk mengakses dashboard Bengkel Qu:
            </p>

            <div className="space-y-2">
              {GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all text-left cursor-pointer group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${acc.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                  >
                    {acc.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-900 block truncate group-hover:text-[#008952]">
                      {acc.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block truncate">
                      {acc.email}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAccountChooser(false)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 pt-1"
            >
              Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
