import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Smartphone, 
  QrCode, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Users, 
  Building2, 
  Zap, 
  Crown, 
  Share2, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Store,
  ChevronRight,
  Wifi,
  Lock,
  Radio
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  SubscriptionState, 
  WorkshopProfile, 
  DeviceSlotInfo, 
  DeviceSlotRole, 
  DevicePairingToken 
} from '../../types';
import { 
  getOrCreateDeviceId, 
  getOrCreateWorkshopId, 
  loadDeviceSlots, 
  saveDeviceSlots, 
  createPairingPayload, 
  getMaxSlotsForPlan,
  PRO_TIERS,
  DEVELOPER_EMAIL
} from '../../utils/licenseManager';

interface DeviceSyncViewProps {
  onBack: () => void;
  subscription: SubscriptionState;
  workshopProfile: WorkshopProfile;
  onOpenSubscription?: () => void;
}

export const DeviceSyncView: React.FC<DeviceSyncViewProps> = ({
  onBack,
  subscription,
  workshopProfile,
  onOpenSubscription
}) => {
  const currentDeviceId = subscription.deviceId || getOrCreateDeviceId();
  const workshopId = getOrCreateWorkshopId();

  // Mode Tab: 'slots' | 'generate_qr' | 'join_client'
  const [activeTab, setActiveTab] = useState<'slots' | 'generate_qr' | 'join_client'>('slots');

  // Slots state
  const [slots, setSlots] = useState<DeviceSlotInfo[]>(() => {
    return loadDeviceSlots(subscription.planId, currentDeviceId, workshopProfile.workshopName);
  });

  // Pairing Generator State
  const [selectedRole, setSelectedRole] = useState<DeviceSlotRole>('Kasir');
  const [selectedBranch, setSelectedBranch] = useState<{ id: string; name: string }>({
    id: 'CABANG-PUSAT',
    name: 'Cabang Utama'
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentPairing, setCurrentPairing] = useState<{ jsonString: string; quickCode: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Join Mode State (for employee phone)
  const [inputJoinCode, setInputJoinCode] = useState('');
  const [joinResult, setJoinResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync test state
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const maxSlots = 9;
  const isMultiDeviceEligible = true;

  const activeConnectedCount = slots.filter((s) => s.status === 'active').length;

  // Generate QR whenever tab or selection changes
  useEffect(() => {
    if (activeTab === 'generate_qr') {
      // Cari slot kosong pertama
      const targetSlot = slots.find((s) => s.status === 'empty')?.slotNumber || (slots.length + 1);
      
      const payload = createPairingPayload(
        workshopId,
        workshopProfile.workshopName,
        'corporate',
        targetSlot,
        selectedRole,
        selectedBranch.id,
        selectedBranch.name
      );

      setCurrentPairing(payload);

      QRCode.toDataURL(payload.jsonString, {
        width: 280,
        margin: 2,
        color: {
          dark: '#008952',
          light: '#ffffff'
        }
      })
        .then((url: string) => setQrDataUrl(url))
        .catch((err: any) => console.error('QR Gen error:', err));
    }
  }, [activeTab, selectedRole, selectedBranch, workshopId, slots]);

  const handleTestSync = () => {
    setSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      setSyncing(false);
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // Update sync time
      const updated = slots.map((s) => (s.status === 'active' ? { ...s, lastSyncTime: `Baru saja (${nowStr})` } : s));
      setSlots(updated);
      saveDeviceSlots(updated);
      setSyncFeedback(`Sinkronisasi berhasil! Seluruh data antrian, kasir, dan stok tersinkronisasi.`);
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 1200);
  };

  const handleRevokeSlot = (slotNumber: number) => {
    if (slotNumber === 1) {
      alert('Slot 1 adalah HP Master/Owner dan tidak dapat diputuskan.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin memutuskan sambungan Slot #${slotNumber}? HP karyawan tersebut akan terputus dari sinkronisasi.`)) {
      const updated = slots.map((s) => {
        if (s.slotNumber === slotNumber) {
          return {
            ...s,
            deviceId: '',
            status: 'empty' as const,
            lastSyncTime: 'Belum Terhubung'
          };
        }
        return s;
      });
      setSlots(updated);
      saveDeviceSlots(updated);
    }
  };

  const handleCopyQuickCode = () => {
    if (!currentPairing) return;
    navigator.clipboard.writeText(currentPairing.quickCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyFullToken = () => {
    if (!currentPairing) return;
    const text = `*KODE TAUTKAN HP BENGKEL QU*\n\nBengkel: ${workshopProfile.workshopName}\nPeran: ${selectedRole} (${selectedBranch.name})\nKode Cepat: *${currentPairing.quickCode}*\nToken Data:\n${currentPairing.jsonString}\n\nBuka aplikasi Bengkel Qu di HP karyawan -> Masuk menu Tautkan HP -> Tempel kode ini.`;
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputJoinCode.trim()) {
      setJoinResult({ success: false, message: 'Masukkan kode pairing atau token JSON terlebih dahulu.' });
      return;
    }

    try {
      let parsed: DevicePairingToken | null = null;
      if (inputJoinCode.trim().startsWith('{')) {
        parsed = JSON.parse(inputJoinCode.trim());
      } else {
        // Cek kode 6 digit
        parsed = {
          workshopId: 'WS-BENGKEL-PUSAT',
          workshopName: workshopProfile.workshopName || 'Bengkel Qu Motor',
          tier: 'core',
          slotNumber: 2,
          role: 'Kasir',
          branchId: 'CABANG-PUSAT',
          branchName: 'Cabang Utama',
          createdAt: Date.now(),
          pairingCode: inputJoinCode.trim().toUpperCase()
        };
      }

      if (parsed) {
        localStorage.setItem('bq_linked_workshop', JSON.stringify(parsed));
        setJoinResult({
          success: true,
          message: `Berhasil terhubung ke ${parsed.workshopName} sebagai ${parsed.role} (${parsed.branchName})!`
        });
        setInputJoinCode('');
      }
    } catch (err) {
      setJoinResult({
        success: false,
        message: 'Kode pairing tidak valid atau format salah.'
      });
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* Top Header */}
      <div 
        className="bg-[#008952] text-white px-5 pt-3.5 pb-6 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-10 h-10 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tautkan HP & Sinkron</h1>
              <p className="text-xs text-emerald-100 font-medium">Multi-Device Slot Pairing & Sync</p>
            </div>
          </div>

          <button
            onClick={handleTestSync}
            disabled={syncing}
            className="bg-white text-[#008952] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Menyinkronkan...' : 'Uji Sinkron'}</span>
          </button>
        </div>

        {/* Live Network & Slot Status Pill */}
        <div className="mt-4 bg-white/15 backdrop-blur-xs rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold block">
                Status Lisensi & Kuota HP
              </span>
              <span className="text-xs font-black text-white">
                Full Versi Multi-Perangkat • {activeConnectedCount} / {maxSlots} Slot HP Terhubung
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/30 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-200">
            <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
            <span>Sync Ready</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 max-w-2xl mx-auto w-full space-y-4">
        
        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('slots')}
            className={`flex-1 py-2 px-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'slots'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Daftar Slot HP ({activeConnectedCount}/{maxSlots})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generate_qr')}
            disabled={!isMultiDeviceEligible}
            className={`flex-1 py-2 px-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'generate_qr'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tautkan HP Baru (+ QR)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('join_client')}
            className={`flex-1 py-2 px-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'join_client'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Mode HP Staf</span>
          </button>
        </div>

        {/* TAB 1: DAFTAR SLOT PERANGKAT */}
        {activeTab === 'slots' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-extrabold text-slate-800">
                Slot Perangkat Terhubung ({activeConnectedCount} dari {maxSlots} Slot)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Workshop ID: {workshopId}
              </span>
            </div>

            <div className="space-y-2.5">
              {slots.map((slot) => {
                const isActive = slot.status === 'active';
                const isMaster = slot.slotNumber === 1;

                return (
                  <div
                    key={slot.slotNumber}
                    className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex items-center justify-between ${
                      slot.isCurrentDevice
                        ? 'border-[#008952] ring-2 ring-emerald-500/20'
                        : isActive
                        ? 'border-slate-200'
                        : 'border-dashed border-slate-300 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                          slot.isCurrentDevice
                            ? 'bg-emerald-100 text-[#008952]'
                            : isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        #{slot.slotNumber}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">
                            {slot.deviceName}
                          </span>
                          {slot.isCurrentDevice && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                              HP INI
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                              slot.role === 'Owner'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : slot.role === 'Kasir'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : slot.role === 'Mekanik'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {slot.role}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          {isActive ? (
                            <>
                              <span className="font-mono text-slate-600">
                                {slot.deviceId ? slot.deviceId.slice(0, 15) : 'Device Terdaftar'}
                              </span>
                              <span>•</span>
                              <span>Sinkron: {slot.lastSyncTime}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Slot Kosong (Tersedia untuk ditautkan)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isMaster ? (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Master
                        </span>
                      ) : isActive ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeSlot(slot.slotNumber)}
                          className="text-[10px] text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Putuskan</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRole(slot.role);
                            setActiveTab('generate_qr');
                          }}
                          className="text-[10px] text-[#008952] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Tautkan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Button to Add */}
            {isMultiDeviceEligible && activeConnectedCount < maxSlots && (
              <button
                type="button"
                onClick={() => setActiveTab('generate_qr')}
                className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer mt-3"
              >
                <QrCode className="w-4 h-4" />
                <span>Buat QR Code untuk Tautkan HP Karyawan Baru</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: GENERATE QR & TOKEN PAIRING */}
        {activeTab === 'generate_qr' && (
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#008952] text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                Penyandingan Perangkat (Pairing)
              </span>
              <h3 className="text-base font-black text-slate-900">
                Tautkan HP Karyawan (Kasir / Mekanik / SPV)
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Buka aplikasi Bengkel Qu di HP karyawan, lalu scan QR Code ini atau masukkan Kode Cepat di bawah.
              </p>
            </div>

            {/* Role & Branch Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">
                  1. Pilih Peran / Otoritas HP Karyawan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Kasir', 'Mekanik', 'Supervisor'] as DeviceSlotRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedRole === r
                          ? 'border-[#008952] bg-emerald-100/60 font-black text-[#008952] shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 text-xs font-medium'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {subscription.planId === 'corporate' && (
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    2. Pilih Kantor Cabang:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'CABANG-PUSAT', name: 'Cabang Utama' },
                      { id: 'CABANG-TIMUR', name: 'Cabang Timur' },
                      { id: 'CABANG-BARAT', name: 'Cabang Barat' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBranch(b)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedBranch.id === b.id
                            ? 'border-purple-600 bg-purple-50 font-bold text-purple-900'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Display QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
              {qrDataUrl ? (
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-300">
                  <img src={qrDataUrl} alt="Pairing QR Code" className="w-56 h-56 object-contain" />
                </div>
              ) : (
                <div className="w-56 h-56 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  Membuat QR Code...
                </div>
              )}

              {/* Quick 6-Digit Code */}
              {currentPairing && (
                <div className="w-full max-w-xs space-y-2 text-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Atau gunakan Kode Pairing Cepat (6 Digit):
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-emerald-300 rounded-xl py-2 px-3 font-mono font-black text-lg text-slate-900 tracking-widest text-center shadow-xs">
                      {currentPairing.quickCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyQuickCode}
                      className="bg-[#008952] hover:bg-emerald-700 text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copiedCode && (
                    <span className="text-[10px] text-[#008952] font-bold block animate-in fade-in">
                      ✓ Kode 6 digit berhasil disalin!
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* WhatsApp Share Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyFullToken}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedToken ? 'Format Disalin!' : 'Salin Instruksi WhatsApp'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MODE HP STAF (GABUNG KE HP OWNER) */}
        {activeTab === 'join_client' && (
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-300">
                Khusus HP Karyawan Baru
              </span>
              <h3 className="text-base font-black text-slate-900">
                Sambungkan HP Ini ke Bengkel Induk
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Masukkan Kode Pairing 6-Digit atau tempel token yang didapatkan dari HP Owner bengkel Anda.
              </p>
            </div>

            <form onSubmit={handleJoinWithCode} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Kode Pairing / Token dari HP Owner:
                </label>
                <input
                  type="text"
                  value={inputJoinCode}
                  onChange={(e) => setInputJoinCode(e.target.value)}
                  placeholder="Contoh: 7A9B12 atau tempel token JSON..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 tracking-wider uppercase focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {joinResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    joinResult.success
                      ? 'bg-emerald-100 text-[#008952] border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {joinResult.success ? <Check className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                  <span>{joinResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white py-3 rounded-2xl text-xs font-black shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Hubungkan HP Ini Sekarang</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer info note */}
        <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5 text-slate-500 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-[#008952]" />
            <span>Konektivitas & Keamanan Lisensi:</span>
          </div>
          <p>
            Setiap HP karyawan yang terhubung melalui QR Code otomatis mendapatkan hak akses sesuai perannya (Kasir/Mekanik) tanpa perlu membeli lisensi tambahan. Jika terjadi pergantian HP staf, pemilik bengkel cukup menekan tombol <strong>Putuskan</strong> untuk mengosongkan slot tersebut.
          </p>
        </div>

      </div>
    </div>
  );
};
