import React from 'react';
import { 
  X, 
  Wrench, 
  Coffee, 
  Stethoscope, 
  ShoppingCart, 
  Package, 
  MapPin,
  Check, 
  Sparkles,
  ExternalLink,
  Layers,
  Store,
  Lock,
  ShieldCheck,
  Key
} from 'lucide-react';
import { 
  canAccessModule, 
  getLicense, 
  getTrialDaysRemaining, 
  setPrimaryModule, 
  activateLicenseKey 
} from '../../engine/licenseEngine';
import { UpgradeToPremiumModal } from '../modals/UpgradeToPremiumModal';

export type EcosystemId = 'bengkel' | 'kedai' | 'klinik' | 'ritel' | 'titip' | 'customerqu';

export interface EcosystemModule {
  id: EcosystemId;
  name: string;
  tagline: string;
  category: string;
  layoutType: 'Grid Layout' | 'Sidebar Layout' | 'Navbar Layout';
  primaryColor: string;
  accentBg: string;
  icon: any;
  faIcon?: string;
  description: string;
  badge?: string;
  isReady: boolean;
}

export const ECOSYSTEM_MODULES: EcosystemModule[] = [
  {
    id: 'bengkel',
    name: 'BengkelQu',
    tagline: 'Otomotif & Bengkel Motor/Mobil',
    category: 'Otomotif & Servis',
    layoutType: 'Grid Layout',
    primaryColor: '#008952',
    accentBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: Wrench,
    faIcon: 'fa-wrench',
    description: 'Manajemen antrian servis, kasir POS, mekanik, sparepart, dan faktur cetak nota.',
    badge: 'Aktif Utama',
    isReady: true
  },
  {
    id: 'kedai',
    name: 'KedaiQu',
    tagline: 'Cafe, Resto & F&B Modern',
    category: 'Restoran & Coffee Shop',
    layoutType: 'Sidebar Layout',
    primaryColor: '#047857',
    accentBg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    icon: Coffee,
    faIcon: 'fa-coffee',
    description: 'Denah meja interaktif drag & drop, KDS Dapur langsung, Kasir F&B, dan kelola staff.',
    badge: 'Fitur Baru',
    isReady: true
  },
  {
    id: 'klinik',
    name: 'KlinikQu',
    tagline: 'Klinik, Praktek Dokter & Apotek',
    category: 'Kesehatan & Medis',
    layoutType: 'Sidebar Layout',
    primaryColor: '#047857',
    accentBg: 'bg-teal-50 border-teal-200 text-teal-900',
    icon: Stethoscope,
    faIcon: 'fa-stethoscope',
    description: 'Pendaftaran pasien, nomor antrian rekam medis elektronik, resep & stok obat apotek.',
    badge: 'Tersedia',
    isReady: true
  },
  {
    id: 'ritel',
    name: 'RitelQu',
    tagline: 'Minimarket & Toko Kelontong',
    category: 'Toko & Swalayan',
    layoutType: 'Navbar Layout',
    primaryColor: '#1E3A8A',
    accentBg: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: ShoppingCart,
    faIcon: 'fa-cart-shopping',
    description: 'Kasir barcode cepat, stok grosir/eceran, PO supplier & cetak label harga rak.',
    badge: 'Fitur Baru',
    isReady: true
  },
  {
    id: 'titip',
    name: 'Titip Qu',
    tagline: 'Konsinyasi, Reseller & Produksi',
    category: 'Konsinyasi & Maklon UMKM',
    layoutType: 'Navbar Layout',
    primaryColor: '#C2410C',
    accentBg: 'bg-amber-50 border-amber-200 text-amber-950',
    icon: Package,
    faIcon: 'fa-boxes-packing',
    description: 'Hitung HPP bahan & upah borongan, bagi hasil toko titipan, surat jalan & reseller tiering.',
    badge: 'Fitur Baru',
    isReady: true
  },
  {
    id: 'customerqu',
    name: 'CustomerQu',
    tagline: 'Peta Radar & Pedagang Keliling',
    category: 'Radar & Layanan Konsumen',
    layoutType: 'Grid Layout',
    primaryColor: '#0284c7',
    accentBg: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: MapPin,
    faIcon: 'fa-map-location-dot',
    description: 'Peta live pedagang keliling, ngetem/mangkal, toko offline, live sinkron stok & lonceng panggilan.',
    badge: 'Radar Live',
    isReady: true
  }
];

interface MasterSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEcosystem: EcosystemId;
  onSelectEcosystem: (id: EcosystemId) => void;
  onOpenOnboarding?: () => void;
}

export const MasterSwitcherModal: React.FC<MasterSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeEcosystem,
  onSelectEcosystem,
  onOpenOnboarding
}) => {
  const [license, setLicenseState] = React.useState(() => getLicense());
  const [serialInput, setSerialInput] = React.useState('');
  const [showKeyInput, setShowKeyInput] = React.useState(false);
  const [keyMessage, setKeyMessage] = React.useState<string | null>(null);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [upgradeLockedTitle, setUpgradeLockedTitle] = React.useState('');
  const [upgradeLockedDesc, setUpgradeLockedDesc] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setLicenseState(getLicense());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trialDays = getTrialDaysRemaining();

  const handleModuleClick = (moduleId: EcosystemId, moduleItem: EcosystemModule) => {
    const hasAccess = canAccessModule(moduleId);
    if (!hasAccess) {
      setUpgradeLockedTitle(`Modul ${moduleItem.name} Terkunci`);
      setUpgradeLockedDesc(`Modul ini dikunci pada mode Free Lifetime. Modul utama aktif Anda adalah '${license.selected_primary_module.toUpperCase()}'. Upgrade ke Pro untuk membuka 5 ekosistem sekaligus!`);
      setIsUpgradeModalOpen(true);
      return;
    }
    onSelectEcosystem(moduleId);
    onClose();
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activateLicenseKey(serialInput, 'corporate', 12);
    setKeyMessage(res.message);
    if (res.success && res.license) {
      setLicenseState(res.license);
      setSerialInput('');
      setTimeout(() => setShowKeyInput(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-900/40">
                UQ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">UsahaQu v1.83</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MASTER ECOSYSTEM
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pilih Modul & Layout Operasional Bisnis Anda
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* License Status Strip */}
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            {license.status === 'trial' ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-200 font-semibold text-[11px]">
                  Masa Trial: <strong className="text-white">{trialDays} hari tersisa</strong> (Akses Semua Modul)
                </span>
              </div>
            ) : license.status === 'pro_active' ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-200 font-semibold text-[11px]">
                  👑 Lisensi Pro Aktif (Full Ekosistem)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-blue-200 font-semibold text-[11px]">
                  Free Lifetime (Modul Utama: <strong className="text-white">{license.selected_primary_module.toUpperCase()}</strong>)
                </span>
              </div>
            )}

            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[10px] bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold px-2 py-1 rounded-lg transition-all"
            >
              {showKeyInput ? 'Batal' : 'Aktivasi Pro'}
            </button>
          </div>

          {/* Optional Key Activation Dropdown */}
          {showKeyInput && (
            <form onSubmit={handleActivateKey} className="mt-3 p-3 bg-white/10 rounded-2xl border border-white/15 space-y-2">
              <label className="text-[11px] font-bold text-slate-200 block">
                Aktivasi Serial Key UsahaQu Pro:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="UQ-PRO-XXXX-XXXX"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-mono font-bold uppercase focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Aktifkan
                </button>
              </div>
              {keyMessage && (
                <p className="text-[10px] text-amber-200 font-semibold">{keyMessage}</p>
              )}
            </form>
          )}
        </div>

        {/* Content list */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scroll bg-slate-50/60">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Modul Ekosistem Terpasang
          </div>

          {ECOSYSTEM_MODULES.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeEcosystem === item.id;
            const hasAccess = canAccessModule(item.id);
            const isPrimary = license.selected_primary_module === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleModuleClick(item.id, item)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 relative group cursor-pointer ${
                  isCurrent 
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                    : hasAccess
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                    : 'locked-card bg-slate-100/90 border-slate-300/80 hover:border-amber-400'
                }`}
              >
                {/* Module Icon */}
                <div 
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-xs relative ${
                    item.id === 'bengkel' ? 'bg-[#008952]' :
                    item.id === 'kedai' ? 'bg-emerald-700' :
                    item.id === 'klinik' ? 'bg-teal-700' :
                    item.id === 'ritel' ? 'bg-[#1E3A8A]' : 'bg-[#C2410C]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${!hasAccess ? 'opacity-60' : ''}`} />
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-slate-900/50 rounded-xl flex items-center justify-center">
                      <Lock className="w-4 h-4 text-amber-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                      item.layoutType === 'Sidebar Layout' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.layoutType === 'Grid Layout'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {item.layoutType}
                    </span>

                    {/* Badges: Modul Utama vs Terkunci vs Trial Aktif */}
                    {!hasAccess ? (
                      <span className="lock-badge-pill ml-auto">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>Terkunci Pro</span>
                      </span>
                    ) : isPrimary ? (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full ml-auto bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Modul Utama (Aktif)</span>
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto bg-emerald-600 text-white">
                        Sedang Aktif
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto bg-slate-100 text-slate-600">
                        {license.status === 'trial' ? 'Trial Aktif' : item.badge || 'Tersedia'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {item.tagline}
                  </p>

                  {!hasAccess ? (
                    <p className="text-[11px] text-amber-800 font-bold mt-1 flex items-center gap-1">
                      <span>🔒 Modul terkunci di Free Lifetime • Klik untuk Upgrade</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Checked icon indicator */}
                {isCurrent && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 self-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info & Ganti Jenis Usaha button */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {onOpenOnboarding && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Buka Wizard Setup Onboarding Pilihan Usaha"
              >
                <span>⚙️ Ganti Jenis Usaha</span>
              </button>
            )}
            <a
              href="/usahaku.html"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Buka Kasir POS Standalone (usahaku.html)"
            >
              <span>🛒 Kasir POS v1.83</span>
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Modal Pop-up Upgrade ke Premium */}
      <UpgradeToPremiumModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        lockedItemTitle={upgradeLockedTitle}
        lockedItemDescription={upgradeLockedDesc}
        onUpgradeSuccess={(newLic) => {
          setLicenseState(newLic);
          setIsUpgradeModalOpen(false);
        }}
      />
    </div>
  );
};
