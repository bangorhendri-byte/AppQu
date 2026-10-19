import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Palette, 
  Database, 
  UploadCloud, 
  RotateCcw, 
  Check, 
  CheckCircle2, 
  Download, 
  AlertTriangle, 
  Sparkles,
  ShieldAlert,
  Info,
  Key,
  Copy,
  Mail,
  Crown,
  Laptop,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  Trash2,
  RefreshCw,
  Layers,
  FileCheck,
  X,
  Users,
  Building2,
  ShieldCheck,
  Cpu,
  Lock,
  Unlock,
  Radio,
  Headphones
} from 'lucide-react';
import { CustomerCareView } from './CustomerCareView';
import { 
  ServiceQueue, 
  Sparepart, 
  Transaction, 
  CustomerVehicle, 
  WorkshopProfile, 
  RolePermissionConfig, 
  BranchItem,
  UserSession,
  DamagedGood,
  ProcurementRecord,
  MarketingCampaign,
  PromoVoucher,
  ExpenseItem,
  SubscriptionState
} from '../../types';
import { 
  getOrCreateDeviceId, 
  APP_VERSION, 
  checkAndMigrateAppData
} from '../../utils/licenseManager';
import { STORES, StoreName, countItems } from '../../db/indexedDbManager';
import { getLicense, getTrialDaysRemaining, LicenseMetadata } from '../../engine/licenseEngine';
import { exportDataToJSON, importDataFromJSON, UsahaQuBackupPayload, ImportResult } from '../../utils/backupRestoreManager';
import { 
  simulateExpireTrial, 
  simulatePaymentSuccess, 
  simulateResetTrial, 
  simulateSwitchPrimaryModule, 
  getLicenseDiagnostics, 
  LicenseDiagnostics 
} from '../../utils/licenseSimulator';
import { 
  auditStorageIntegrity, 
  checkForServiceWorkerUpdate, 
  applyServiceWorkerUpdate, 
  StorageIntegrityAudit 
} from '../../utils/pwaResilience';
import { 
  checkForAppUpdate, 
  CURRENT_APP_VERSION, 
  CURRENT_VERSION_CODE, 
  AppVersionInfo 
} from '../../utils/appUpdateChecker';


interface SettingViewProps {
  initialTab?: string;
  onBack: () => void;
  queues: ServiceQueue[];
  spareparts: Sparepart[];
  transactions: Transaction[];
  customers: CustomerVehicle[];
  damagedGoods?: DamagedGood[];
  procurements?: ProcurementRecord[];
  campaigns?: MarketingCampaign[];
  vouchers?: PromoVoucher[];
  expenses?: ExpenseItem[];
  profile: WorkshopProfile;
  permissions: RolePermissionConfig[];
  branches: BranchItem[];
  onRestoreData: (backupData: any) => void;
  onResetData: (mode: 'daily' | 'factory' | 'clean_slate') => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
  subscription?: SubscriptionState;
  onReloadDemoData?: () => void;
  onNavigateToDevices?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToPermissions?: () => void;
  onNavigateToBranches?: () => void;
  onNavigateToCustomerCare?: () => void;
}

export const SettingView: React.FC<SettingViewProps> = ({
  initialTab = 'setting-tema',
  onBack,
  queues,
  spareparts,
  transactions,
  customers,
  damagedGoods = [],
  procurements = [],
  campaigns = [],
  vouchers = [],
  expenses = [],
  profile,
  permissions,
  branches,
  onRestoreData,
  onResetData,
  userSession,
  onLogout,
  subscription,
  onReloadDemoData,
  onNavigateToDevices,
  onNavigateToProfile,
  onNavigateToPermissions,
  onNavigateToBranches,
  onNavigateToCustomerCare
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // 1. Theme State
  const [selectedTheme, setSelectedTheme] = useState<'emerald' | 'teal' | 'forest' | 'lime'>(() => {
    return (localStorage.getItem('bq_theme') as any) || 'emerald';
  });
  const [themeSaved, setThemeSaved] = useState(false);

  // 2. Backup State
  const [backupOptions, setBackupOptions] = useState({
    queues: true,
    spareparts: true,
    transactions: true,
    customers: true,
    damagedGoods: true,
    procurements: true,
    campaigns: true,
    vouchers: true,
    expenses: true,
    profile: true,
    permissions: true,
    branches: true
  });
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [isExportingFullDb, setIsExportingFullDb] = useState(false);
  const [fullDbExportResult, setFullDbExportResult] = useState<UsahaQuBackupPayload | null>(null);

  // 3. Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [restoreRawJson, setRestoreRawJson] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreDetailedResult, setRestoreDetailedResult] = useState<ImportResult | null>(null);

  // 4. Simulator Lisensi (Development Tool) State
  const [diagnostics, setDiagnostics] = useState<LicenseDiagnostics | null>(() => {
    return typeof window !== 'undefined' ? getLicenseDiagnostics() : null;
  });
  const [diagnosticsNotice, setDiagnosticsNotice] = useState<string | null>(null);

  // 5. PWA Service Worker & Storage Integrity State
  const [storageAudit, setStorageAudit] = useState<StorageIntegrityAudit | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [swStatusMsg, setSwStatusMsg] = useState<string | null>(null);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  // 6. Reset State (Clean slate vs demo vs daily)
  const [resetConfirmationText, setResetConfirmationText] = useState('');
  const [resetModalMode, setResetModalMode] = useState<'daily' | 'factory' | 'clean_slate' | null>(null);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  // Device identification & Update State
  const deviceId = subscription?.deviceId || getOrCreateDeviceId();
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{ checked: boolean; msg: string } | null>(null);

  // Sync Diagnostics on load and license events
  useEffect(() => {
    const refreshDiag = () => {
      setDiagnostics(getLicenseDiagnostics());
    };

    const handleSWUpdate = () => {
      setSwUpdateAvailable(true);
      setSwStatusMsg('Pembaruan aplikasi versi baru ditemukan! Siap diterapkan.');
    };

    window.addEventListener('usahaqu:license-updated', refreshDiag);
    window.addEventListener('usahaqu:sw-update-available', handleSWUpdate);

    // Initial audit on load
    auditStorageIntegrity().then((audit) => setStorageAudit(audit));

    return () => {
      window.removeEventListener('usahaqu:license-updated', refreshDiag);
      window.removeEventListener('usahaqu:sw-update-available', handleSWUpdate);
    };
  }, []);

  // Theme Choices
  const THEMES = [
    {
      id: 'emerald',
      name: 'Hijau Emerald (Standar Bengkel Qu)',
      desc: 'Warna resmi hijau bersih yang sejuk dan profesional',
      color: '#008952',
      badge: 'Aktif'
    },
    {
      id: 'teal',
      name: 'Teal Mint Modern',
      desc: 'Nuansa biru-kehijauan cerah ala aplikasi fintech modern',
      color: '#0d9488',
      badge: 'Pilihan'
    },
    {
      id: 'forest',
      name: 'Hijau Forest Solid',
      desc: 'Warna hijau daun pekat dengan kontras tinggi',
      color: '#15803d',
      badge: 'Pilihan'
    },
    {
      id: 'lime',
      name: 'Lime Racing Otomotif',
      desc: 'Warna hijau sporty terinspirasi arena balap motor',
      color: '#65a30d',
      badge: 'Sporty'
    }
  ];

  const handleApplyTheme = (themeId: any) => {
    setSelectedTheme(themeId);
    localStorage.setItem('bq_theme', themeId);
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2000);
  };

  /**
   * Ekspor Lengkap IndexedDB (21 Stores) & Lisensi menggunakan exportDataToJSON
   */
  const handleFullDbExport = async () => {
    setIsExportingFullDb(true);
    try {
      const result = await exportDataToJSON({ downloadFile: true, includeLocalStorage: true });
      setFullDbExportResult(result);
      setBackupDownloaded(true);
      setTimeout(() => setBackupDownloaded(false), 3000);
    } catch (err: any) {
      alert('Gagal mengekspor database IndexedDB: ' + err.message);
    } finally {
      setIsExportingFullDb(false);
    }
  };

  /**
   * Ekspor Modular BengkelQu (Legacy JSON Format)
   */
  const handleDownloadBackup = () => {
    const backupPayload: any = {
      app: 'Bengkel Qu POS',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      deviceId,
      subscription,
      summary: {
        queuesCount: queues.length,
        sparepartsCount: spareparts.length,
        transactionsCount: transactions.length,
        customersCount: customers.length,
        damagedGoodsCount: damagedGoods.length,
        procurementsCount: procurements.length
      },
      data: {}
    };

    if (backupOptions.queues) backupPayload.data.queues = queues;
    if (backupOptions.spareparts) backupPayload.data.spareparts = spareparts;
    if (backupOptions.transactions) backupPayload.data.transactions = transactions;
    if (backupOptions.customers) backupPayload.data.customers = customers;
    if (backupOptions.damagedGoods) backupPayload.data.damagedGoods = damagedGoods;
    if (backupOptions.procurements) backupPayload.data.procurements = procurements;
    if (backupOptions.campaigns) backupPayload.data.campaigns = campaigns;
    if (backupOptions.vouchers) backupPayload.data.vouchers = vouchers;
    if (backupOptions.expenses) backupPayload.data.expenses = expenses;
    if (backupOptions.profile) backupPayload.data.profile = profile;
    if (backupOptions.permissions) backupPayload.data.permissions = permissions;
    if (backupOptions.branches) backupPayload.data.branches = branches;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bengkelqu_backup_${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreError(null);
    setRestoreDetailedResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setRestoreRawJson(parsed);

        // Deteksi format UsahaQu v1.83 (IndexedDB) atau legacy BengkelQu
        if (parsed.indexedDbStores) {
          setRestorePreview({
            isIndexedDbBackup: true,
            storesCount: Object.keys(parsed.indexedDbStores).length,
            totalRecords: parsed.metadata?.totalRecords || Object.values(parsed.indexedDbStores).reduce((a: any, b: any) => a + (Array.isArray(b) ? b.length : 0), 0),
            version: parsed.metadata?.version || '1.83',
            exportedAt: parsed.metadata?.exportedAt,
            stores: parsed.indexedDbStores,
            license: parsed.license
          });
        } else if (parsed.data || parsed.queues) {
          setRestorePreview({
            isIndexedDbBackup: false,
            queues: parsed.data?.queues || parsed.queues,
            spareparts: parsed.data?.spareparts || parsed.spareparts,
            transactions: parsed.data?.transactions || parsed.transactions,
            customers: parsed.data?.customers || parsed.customers,
            data: parsed.data || parsed
          });
        } else {
          throw new Error('Format berkas tidak sesuai dengan skema data cadangan UsahaQu / BengkelQu.');
        }
      } catch (err: any) {
        setRestoreError(err.message || 'Gagal membaca berkas JSON.');
        setRestorePreview(null);
        setRestoreRawJson(null);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Eksekusi Restore dengan Proteksi Struktur Database (importDataFromJSON)
   */
  const handleExecuteRestore = async () => {
    if (!restoreRawJson) return;

    try {
      // 1. Pulihkan IndexedDB (Master Data & Transaksi) dan Lisensi secara aman
      const result = await importDataFromJSON(restoreRawJson, {
        mode: restoreMode,
        restoreLicense: true,
        restoreLocalStorage: true
      });

      setRestoreDetailedResult(result);
      setRestoreSuccess(true);

      // 2. Jika ada data BengkelQu untuk state React, perbarui memori aktif
      if (restoreRawJson.data || restoreRawJson.queues) {
        onRestoreData(restoreRawJson.data || restoreRawJson);
      }

      // 3. Perbarui audit integritas storage lokal
      auditStorageIntegrity().then((audit) => setStorageAudit(audit));
      setDiagnostics(getLicenseDiagnostics());

      setTimeout(() => {
        setRestoreSuccess(false);
      }, 4000);
    } catch (err: any) {
      setRestoreError('Gagal memulihkan database: ' + err.message);
    }
  };

  // =========================================================================
  // SIMULATOR UJI COBA STATUS LISENSI HANDLERS
  // =========================================================================
  const handleSimulateExpireTrial = () => {
    const updated = simulateExpireTrial();
    setDiagnostics(getLicenseDiagnostics());
    setDiagnosticsNotice(`Masa trial telah diakhiri secara simulasi. Status otomatis beralih ke 'free_lifetime'. Hanya modul [${updated.selected_primary_module.toUpperCase()}] yang kini aktif.`);
    setTimeout(() => setDiagnosticsNotice(null), 4000);
  };

  const handleSimulatePaymentSuccess = () => {
    simulatePaymentSuccess('corporate', 12);
    setDiagnostics(getLicenseDiagnostics());
    setDiagnosticsNotice('Pembayaran sukses disimulasikan! Status lisensi beralih ke PRO AKTIF (Corporate Tier). Seluruh 5 modul ekosistem terbuka penuh.');
    setTimeout(() => setDiagnosticsNotice(null), 4000);
  };

  const handleSimulateResetTrial = () => {
    simulateResetTrial();
    setDiagnostics(getLicenseDiagnostics());
    setDiagnosticsNotice('Lisensi berhasil di-reset kembali ke Masa Trial 10 Hari baru.');
    setTimeout(() => setDiagnosticsNotice(null), 4000);
  };

  const handleSimulateSwitchPrimaryModule = (modName: string) => {
    const updated = simulateSwitchPrimaryModule(modName);
    setDiagnostics(getLicenseDiagnostics());
    setDiagnosticsNotice(`Modul utama terpilih freemium diubah ke: [${updated.selected_primary_module.toUpperCase()}].`);
    setTimeout(() => setDiagnosticsNotice(null), 4000);
  };

  // =========================================================================
  // PWA UPDATE RESILIENCE & STORAGE AUDIT HANDLERS
  // =========================================================================
  const handleRunStorageAudit = async () => {
    setIsAuditing(true);
    try {
      const audit = await auditStorageIntegrity();
      setStorageAudit(audit);
      setMigrationStatus({
        checked: true,
        msg: `Audit Berhasil: ${audit.totalStoresCount} Stores IndexedDB dengan total ${audit.totalRecordsCount} data aktif 100% aman dan utuh!`
      });
      setTimeout(() => setMigrationStatus(null), 3500);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCheckSWUpdate = async () => {
    setSwStatusMsg('Memeriksa versi baru service worker ke server...');
    const hasUpdate = await checkForServiceWorkerUpdate();
    if (hasUpdate) {
      setSwUpdateAvailable(true);
      setSwStatusMsg('Pembaruan baru ditemukan dan siap diterapkan!');
    } else {
      setSwStatusMsg('Aplikasi sudah menggunakan versi terbaru (Stale-While-Revalidate).');
      setTimeout(() => setSwStatusMsg(null), 3000);
    }
  };

  const handleApplySWUpdate = () => {
    const applied = applyServiceWorkerUpdate();
    if (!applied) {
      window.location.reload();
    }
  };

  // State & Handler Cek Pembaruan Rilis APK Otomatis
  const [appUpdateInfo, setAppUpdateInfo] = useState<AppVersionInfo | null>(null);
  const [isCheckingAppUpdate, setIsCheckingAppUpdate] = useState(false);
  const [appUpdateStatusMsg, setAppUpdateStatusMsg] = useState<string | null>(null);

  const handleCheckAppRelease = async () => {
    setIsCheckingAppUpdate(true);
    setAppUpdateStatusMsg('Memeriksa rilis APK & pembaruan sistem ke server...');
    try {
      const update = await checkForAppUpdate();
      setIsCheckingAppUpdate(false);
      if (update) {
        setAppUpdateInfo(update);
        if (update.isUpdateAvailable) {
          setAppUpdateStatusMsg(`Pembaruan versi baru ${update.version} tersedia!`);
        } else {
          setAppUpdateStatusMsg(`Aplikasi Anda sudah menggunakan versi paling mutakhir (v${CURRENT_APP_VERSION}).`);
          setTimeout(() => setAppUpdateStatusMsg(null), 4000);
        }
      } else {
        setAppUpdateStatusMsg(`Aplikasi Anda menggunakan versi mutakhir (v${CURRENT_APP_VERSION}).`);
        setTimeout(() => setAppUpdateStatusMsg(null), 4000);
      }
    } catch (err: any) {
      setIsCheckingAppUpdate(false);
      setAppUpdateStatusMsg('Gagal terhubung ke server update: ' + err.message);
    }
  };


  const handleExecuteReset = () => {
    const cleanWord = resetConfirmationText.trim().toUpperCase();
    if (cleanWord !== 'RESET' && cleanWord !== 'HAPUS') return;

    if (resetModalMode) {
      onResetData(resetModalMode);
      if (resetModalMode === 'clean_slate') {
        setResetSuccessNotice('Semua data operasional berhasil dihapus bersih total tanpa tersisa!');
      } else if (resetModalMode === 'factory') {
        setResetSuccessNotice('Data sampel / demo pabrik berhasil dimuat ulang!');
      } else {
        setResetSuccessNotice('Antrian & transaksi shift hari ini berhasil dibersihkan!');
      }

      setResetModalMode(null);
      setResetConfirmationText('');
      setTimeout(() => setResetSuccessNotice(null), 3500);
    }
  };

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedDeviceId(true);
    setTimeout(() => setCopiedDeviceId(false), 2000);
  };

  const handleRunMigrationCheck = () => {
    const info = checkAndMigrateAppData();
    setMigrationStatus({
      checked: true,
      msg: `Pengecekan versi ${info.currentVersion} berhasil. Skema data tersinkronisasi 100% aman dan kompatibel!`
    });
    setTimeout(() => setMigrationStatus(null), 3500);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      {/* Top Header */}
      <div 
        className="bg-[#008952] text-white px-5 pt-3.5 pb-5 shadow-md"
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
              <h1 className="text-xl font-bold tracking-tight">Setting Bengkel Qu</h1>
              <p className="text-xs text-emerald-100 font-medium">
                Profil, Hak Akses, Cabang, Multi-HP, Tema, Backup & Restore
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Horizontal (Scrollable for compact touch) */}
        <div className="flex items-center gap-1.5 mt-4 bg-emerald-800/50 p-1 rounded-xl text-xs overflow-x-auto scrollbar-none">
          {onNavigateToProfile && (
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="flex-1 min-w-[65px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap text-emerald-100 hover:text-white bg-white/15 hover:bg-white/25 active:scale-95"
            >
              Profil
            </button>
          )}
          {onNavigateToPermissions && (
            <button
              type="button"
              onClick={onNavigateToPermissions}
              className="flex-1 min-w-[75px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap text-emerald-100 hover:text-white bg-white/15 hover:bg-white/25 active:scale-95"
            >
              Hak Akses
            </button>
          )}
          {onNavigateToBranches && (
            <button
              type="button"
              onClick={onNavigateToBranches}
              className="flex-1 min-w-[65px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap text-emerald-100 hover:text-white bg-white/15 hover:bg-white/25 active:scale-95"
            >
              Cabang
            </button>
          )}
          {onNavigateToDevices && (
            <button
              type="button"
              onClick={onNavigateToDevices}
              className="flex-1 min-w-[80px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap text-emerald-100 hover:text-white bg-white/15 hover:bg-white/25 active:scale-95"
            >
              Tautkan HP
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('setting-customer-care')}
            className={`flex-1 min-w-[130px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'setting-customer-care' ? 'bg-amber-400 text-slate-950 shadow-xs font-black ring-1 ring-amber-300' : 'text-amber-200 hover:text-white bg-emerald-900/40'
            }`}
          >
            <span>🎧 Customer Care AI</span>
          </button>
          <button
            onClick={() => setActiveTab('setting-tema')}
            className={`flex-1 min-w-[60px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'setting-tema' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100'
            }`}
          >
            Tema
          </button>
          <button
            onClick={() => setActiveTab('setting-backup')}
            className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'setting-backup' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100'
            }`}
          >
            Backup JSON
          </button>
          <button
            onClick={() => setActiveTab('setting-restore')}
            className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'setting-restore' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100'
            }`}
          >
            Restore JSON
          </button>
          <button
            onClick={() => setActiveTab('setting-simulator')}
            className={`flex-1 min-w-[95px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'setting-simulator' ? 'bg-amber-400 text-slate-900 shadow-xs ring-1 ring-amber-300' : 'text-amber-200 hover:text-white'
            }`}
          >
            ⚡ Simulator Lisensi
          </button>
          <button
            onClick={() => setActiveTab('setting-reset')}
            className={`flex-1 min-w-[60px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'setting-reset' ? 'bg-white text-rose-600 shadow-xs' : 'text-emerald-100'
            }`}
          >
            Reset
          </button>
          <button
            onClick={() => setActiveTab('setting-update')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'setting-update' ? 'bg-white text-[#008952] shadow-xs' : 'text-emerald-100'
            }`}
          >
            Info & PWA
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        
        {/* ================= TAB: CUSTOMER CARE AI & TROUBLESHOOT ================= */}
        {activeTab === 'setting-customer-care' && (
          <div className="space-y-4 animate-in fade-in">
            <CustomerCareView
              onBack={() => setActiveTab('setting-tema')}
              profile={profile}
              userSession={userSession}
              queues={queues}
              spareparts={spareparts}
              transactions={transactions}
              embedded
            />
          </div>
        )}

        {/* ================= TAB 1: TEMA ================= */}
        {activeTab === 'setting-tema' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-4 h-4 text-[#008952]" />
                <h3 className="font-bold text-slate-900 text-sm">Pilihan Tema Warna</h3>
              </div>
              <p className="text-xs text-slate-500">
                Pilih palet nuansa warna antarmuka untuk seluruh dashboard dan tombol Bengkel Qu.
              </p>
            </div>

            {themeSaved && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Tema berhasil diterapkan dan disimpan!</span>
              </div>
            )}

            <div className="space-y-2.5">
              {THEMES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleApplyTheme(t.id)}
                  className={`bg-white rounded-2xl p-4 shadow-xs border transition-all cursor-pointer flex items-center justify-between ${
                    selectedTheme === t.id
                      ? 'border-[#008952] ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center text-white font-black"
                      style={{ backgroundColor: t.color }}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {selectedTheme === t.id ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#008952] border border-emerald-200">
                        Dipakai
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Pilih</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BACKUP JSON ================= */}
        {activeTab === 'setting-backup' && (
          <div className="space-y-3 animate-in fade-in">
            {/* OPSI UTAMA: EKSPOR SELURUH INDEXEDDB (21 STORES) & LISENSI */}
            <div className="bg-gradient-to-br from-emerald-900 to-[#008952] text-white rounded-3xl p-5 shadow-lg space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Ekspor Seluruh Database IndexedDB (.JSON)</h3>
                  <span className="text-[10px] text-emerald-200 font-mono">Fungsi Utilitas: exportDataToJSON()</span>
                </div>
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed">
                Mengambil seluruh isi <strong>21 tabel IndexedDB</strong> (5 Master Data Global, 14 Master Spesifik Modul Bengkel/Kedai/Klinik/Ritel/Titip, 2 POS Core Offline Katalog & Transaksi Kasir) beserta status lisensi dan preferensi pengguna menjadi satu berkas JSON terformat dengan checksum integritas.
              </p>

              <div className="bg-black/20 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-emerald-200 block">Master Global</span>
                  <span className="font-bold text-white text-sm">5 Tabel</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-200 block">Modul Spesifik</span>
                  <span className="font-bold text-white text-sm">14 Tabel</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-200 block">POS Core Offline</span>
                  <span className="font-bold text-white text-sm">2 Tabel</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFullDbExport}
                disabled={isExportingFullDb}
                className="w-full bg-white hover:bg-emerald-50 active:scale-95 text-[#008952] font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isExportingFullDb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#008952]" />
                    <span>Mengekstrak 21 Store IndexedDB...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#008952]" />
                    <span>Ekspor & Unduh Seluruh IndexedDB (.JSON)</span>
                  </>
                )}
              </button>
            </div>

            {backupDownloaded && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Berkas JSON cadangan berhasil diunduh ke perangkat Anda!</span>
              </div>
            )}

            {fullDbExportResult && (
              <div className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-[#008952]">
                    <FileCheck className="w-4 h-4" />
                    <span>Laporan Ekspor Terakhir</span>
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-50 text-[#008952] px-2 py-0.5 rounded-full border border-emerald-200">
                    Checksum: {fullDbExportResult.metadata.checksum}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Total Catatan: <strong className="text-slate-900">{fullDbExportResult.summary.totalRecords} record</strong></div>
                  <div>Tabel IndexedDB: <strong className="text-slate-900">{fullDbExportResult.summary.storesCount} stores</strong></div>
                  <div>Status Lisensi: <strong className="text-slate-900">{fullDbExportResult.license.status}</strong></div>
                  <div>Versi App: <strong className="text-slate-900">v{fullDbExportResult.metadata.version}</strong></div>
                </div>
              </div>
            )}

            {/* OPSI KEDUA: PENCADANGAN MODULAR BENGKELQU (LEGACY) */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-xs text-slate-800">Pencadangan Selektif (Modul BengkelQu)</span>
                </div>
                <span className="text-[10px] text-slate-400">Pilih komponen</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'queues', label: `Antrian Servis (${queues.length})` },
                  { key: 'spareparts', label: `Katalog Part (${spareparts.length})` },
                  { key: 'transactions', label: `Transaksi Kasir (${transactions.length})` },
                  { key: 'customers', label: `Data CRM Pelanggan (${customers.length})` },
                  { key: 'damagedGoods', label: `Barang Rusak (${damagedGoods.length})` },
                  { key: 'procurements', label: `Pengadaan Suku Cadang (${procurements.length})` },
                  { key: 'expenses', label: `Kas Kecil Operasional (${expenses.length})` },
                  { key: 'profile', label: 'Profil & Identitas Bengkel' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(backupOptions as any)[item.key]}
                      onChange={(e) =>
                        setBackupOptions({
                          ...backupOptions,
                          [item.key]: e.target.checked
                        })
                      }
                      className="rounded text-[#008952] focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Selektif BengkelQu (.JSON)</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: RESTORE JSON ================= */}
        {activeTab === 'setting-restore' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <UploadCloud className="w-4 h-4 text-[#008952]" />
                <h3 className="font-bold text-slate-900 text-sm">Pemulihan Data Terproteksi (Restore .JSON)</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Membaca file JSON cadangan dan memulihkan seluruh tabel IndexedDB dan LocalStorage <strong>tanpa merusak atau mengubah struktur skema database</strong>.
              </p>
              <div className="mt-2 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#008952] shrink-0" />
                <span>Proteksi Skema: Indeks & KeyPath tabel IndexedDB terlindungi 100% dari kerusakan format.</span>
              </div>
            </div>

            {restoreSuccess && (
              <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Pemulihan Database Berhasil 100%!</span>
                </div>
                {restoreDetailedResult && (
                  <p className="text-[11px] text-emerald-800 font-normal">
                    {restoreDetailedResult.message}
                  </p>
                )}
              </div>
            )}

            {restoreError && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4" />
                <span>{restoreError}</span>
              </div>
            )}

            {/* Pilihan Mode Restore: Replace vs Merge */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-2">
              <span className="font-bold text-xs text-slate-800 block">Metode Pemulihan Data:</span>
              <div className="grid grid-cols-2 gap-2">
                <label 
                  onClick={() => setRestoreMode('replace')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col gap-1 transition ${
                    restoreMode === 'replace'
                      ? 'border-[#008952] bg-emerald-50/60 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Timpa Bersih (Replace)</span>
                    <input 
                      type="radio" 
                      name="restore_mode" 
                      checked={restoreMode === 'replace'} 
                      onChange={() => setRestoreMode('replace')}
                      className="text-[#008952]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Mengosongkan tabel lama sebelum mengisi dengan data cadangan.</span>
                </label>

                <label 
                  onClick={() => setRestoreMode('merge')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col gap-1 transition ${
                    restoreMode === 'merge'
                      ? 'border-[#008952] bg-emerald-50/60 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Gabungkan (Merge)</span>
                    <input 
                      type="radio" 
                      name="restore_mode" 
                      checked={restoreMode === 'merge'} 
                      onChange={() => setRestoreMode('merge')}
                      className="text-[#008952]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Menyisipkan dan memperbarui catatan tanpa menghapus data lain.</span>
                </label>
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border-2 border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-[#008952] rounded-full flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  Pilih Berkas Cadangan UsahaQu (.JSON)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Format berkas: usahaqu_v183_backup_*.json atau bengkelqu_backup_*.json
                </span>
              </div>

              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#008952] hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>

            {/* Preview Restore */}
            {restorePreview && (
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-emerald-300 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[#008952]">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span className="font-bold text-xs">Pratinjau Data yang Terdeteksi</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                    {restorePreview.isIndexedDbBackup ? 'Format IndexedDB UsahaQu v1.83' : 'Format Selektif BengkelQu'}
                  </span>
                </div>

                {restorePreview.isIndexedDbBackup ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Tabel Database</span>
                        <span className="font-extrabold text-slate-900">{restorePreview.storesCount} Stores Aktif</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Total Data Record</span>
                        <span className="font-extrabold text-slate-900">{restorePreview.totalRecords} Catatan</span>
                      </div>
                    </div>
                    {restorePreview.license && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center justify-between text-blue-900">
                        <span>Lisensi Cadangan: <strong>{restorePreview.license.status}</strong></span>
                        <span className="text-[10px] font-mono bg-blue-100 px-2 py-0.5 rounded">Modul: {restorePreview.license.selected_primary_module}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Antrian Servis</span>
                      <span className="font-bold text-slate-800">{restorePreview.queues?.length || 0} Tiket</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Suku Cadang / Stok</span>
                      <span className="font-bold text-slate-800">{restorePreview.spareparts?.length || 0} Item</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Transaksi Kasir</span>
                      <span className="font-bold text-slate-800">{restorePreview.transactions?.length || 0} Nota</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Pelanggan CRM</span>
                      <span className="font-bold text-slate-800">{restorePreview.customers?.length || 0} Unit</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Pulihkan Seluruh Tabel Sekarang ({restoreMode.toUpperCase()})</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB BARU: SIMULATOR UJI COBA LISENSI (DEVELOPMENT TOOL) ================= */}
        {activeTab === 'setting-simulator' && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Header Simulator */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Simulator Uji Coba Status Lisensi</h3>
                  <span className="text-[10px] text-amber-100 font-medium">Development & QA Tool UsahaQu v1.83</span>
                </div>
              </div>
              <p className="text-xs text-amber-50 leading-relaxed">
                Utilitas pengujian untuk memverifikasi transisi status lisensi offline-first: peralihan masa trial, auto-downgrade freemium hybrid fallback, dan pembukaan seluruh modul ekosistem saat pembayaran berhasil.
              </p>
            </div>

            {/* Notification Banner */}
            {diagnosticsNotice && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{diagnosticsNotice}</span>
              </div>
            )}

            {/* Tombol-Tombol Simulator Spesifikasi Kebutuhan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. simulateExpireTrial() */}
              <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>1. simulateExpireTrial()</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Memajukan tanggal <code>trial_ends_at</code> ke masa lalu untuk menguji fungsi <strong>auto-downgrade ke 'free_lifetime'</strong>. Modul non-utama akan otomatis terkunci.
                </p>
                <button
                  type="button"
                  onClick={handleSimulateExpireTrial}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-300 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Simulasi Trial Kedaluwarsa (Downgrade)</span>
                </button>
              </div>

              {/* 2. simulatePaymentSuccess() */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-[#008952] font-extrabold text-xs">
                  <Crown className="w-4 h-4 text-[#008952]" />
                  <span>2. simulatePaymentSuccess()</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mengubah lisensi lokal langsung ke <strong>'paid_plan' ('pro_active')</strong> untuk menguji pembukaan seluruh 5 modul ekosistem dan semua fitur premium.
                </p>
                <button
                  type="button"
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008952] font-extrabold text-xs border border-emerald-300 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Simulasi Bayar Sukses (Buka Semua Modul)</span>
                </button>
              </div>
            </div>

            {/* 3. Reset Trial & Modul Switcher */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Alat Pengujian Tambahan</span>
                <span className="text-[10px] text-slate-400">Helper Cepat</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSimulateResetTrial}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reset ke Trial 10 Hari Baru</span>
                </button>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Ganti Modul Utama Free Lifetime:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { key: 'bengkel', icon: '🏍️', label: 'Bengkel' },
                      { key: 'kedai', icon: '☕', label: 'Kedai' },
                      { key: 'klinik', icon: '🩺', label: 'Klinik' },
                      { key: 'ritel', icon: '🛒', label: 'Ritel' },
                      { key: 'titip', icon: '📦', label: 'Titip' }
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => handleSimulateSwitchPrimaryModule(m.key)}
                        title={`Pilih ${m.label} sebagai modul utama`}
                        className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold border transition ${
                          diagnostics?.selectedPrimaryModule === m.key
                            ? 'bg-[#008952] text-white border-[#008952]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {m.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE DIAGNOSTICS MATRIX */}
            {diagnostics && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>Matriks Status & Hak Akses Realtime</span>
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    diagnostics.status === 'pro_active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : diagnostics.status === 'trial'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    Status: {diagnostics.status.toUpperCase()}
                  </span>
                </div>

                {/* Ringkasan Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Sisa Hari Trial</span>
                    <span className="font-bold text-slate-800">{diagnostics.trialDaysRemaining} Hari</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Tier Berbayar</span>
                    <span className="font-bold text-slate-800">{diagnostics.tier || 'None (Free/Trial)'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Modul Utama</span>
                    <span className="font-bold text-slate-800 uppercase">{diagnostics.selectedPrimaryModule}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Device ID</span>
                    <span className="font-mono font-bold text-[10px] text-slate-800 truncate block">{diagnostics.deviceId}</span>
                  </div>
                </div>

                {/* Akses Modul Ekosistem */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">Status Akses 5 Modul Ekosistem UsahaQu:</span>
                  <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                    {[
                      { key: 'bengkel', label: 'BengkelQu', icon: '🏍️' },
                      { key: 'kedai', label: 'KedaiQu', icon: '☕' },
                      { key: 'klinik', label: 'KlinikQu', icon: '🩺' },
                      { key: 'ritel', label: 'RitelQu', icon: '🛒' },
                      { key: 'titip', label: 'Titip Qu', icon: '📦' }
                    ].map((mod) => {
                      const hasAccess = (diagnostics.modulesAccess as Record<string, boolean>)[mod.key];
                      return (
                        <div
                          key={mod.key}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                            hasAccess
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                              : 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-70'
                          }`}
                        >
                          <span className="text-base">{mod.icon}</span>
                          <span className="font-extrabold text-[10px] leading-tight">{mod.label}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                            hasAccess ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                          }`}>
                            {hasAccess ? 'BUKA' : 'KUNCI'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Akses Fitur Premium */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">Akses Fitur Premium (Offline vs Cloud):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    {Object.entries(diagnostics.premiumFeaturesAccess).map(([feat, allowed]) => (
                      <div key={feat} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-mono text-[10px] text-slate-700">{feat}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          allowed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {allowed ? 'Aktif' : 'Batas'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ================= TAB 4: RESET (PASTIKAN HAPUS BERSIH TIDAK TERSISA) ================= */}
        {activeTab === 'setting-reset' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Pusat Reset & Penghapusan Data</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih opsi di bawah untuk mengosongkan seluruh data operasional tanpa tersisa, atau memuat ulang data demo/sampel untuk pelatihan tim bengkel.
              </p>
            </div>

            {resetSuccessNotice && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{resetSuccessNotice}</span>
              </div>
            )}

            {/* OPSI UTAMA 1: HAPUS BERSIH TOTAL (TIDAK TERSISA SAMA SEKALI) */}
            <div className="bg-rose-50/50 border-2 border-rose-300 rounded-2xl p-4 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-xs">
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Bersih Total (Kosongkan Data - Tidak Ada Tersisa)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Menghapus seluruh antrian servis, riwayat kasir, suku cadang, pelanggan CRM, log barang rusak, dan kas kecil menjadi <strong>0 data (kosong total)</strong>. Cocok untuk bengkel baru yang siap mulai operasional nyata dari awal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalMode('clean_slate')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs active:scale-95 shadow-md shadow-rose-700/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Bersih Total (0 Data Tersisa)</span>
              </button>
            </div>

            {/* OPSI 2: Muat Ulang Data Sampel / Demo Pabrik */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-emerald-200 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#008952] font-bold text-xs">
                    <RefreshCw className="w-4 h-4" />
                    <span>Muat Ulang Data Sampel / Demo Pabrik</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mengisi kembali data contoh motor matic, katalog oli & sparepart, serta transaksi kasir untuk latihan/simulasi tim kasir dan mekanik.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalMode('factory')}
                className="bg-emerald-50 hover:bg-emerald-100 text-[#008952] border border-emerald-300 font-bold px-3 py-2 rounded-xl text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Data Demo Pabrik</span>
              </button>
            </div>

            {/* OPSI 3: Bersihkan Shift Hari Ini Saja */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Bersihkan Shift & Transaksi Selesai Hari Ini</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Menghapus antrian yang selesai dan riwayat transaksi hari ini tanpa menghapus katalog barang dan data pelanggan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalMode('daily')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-2 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
              >
                Bersihkan Shift Hari Ini Saja
              </button>
            </div>

            {/* Info Akun Google */}
            {userSession && (
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-800">Akun Google Terhubung</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {userSession.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{userSession.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{userSession.email}</span>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Keluar / Logout
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: STATUS FULL VERSION ================= */}
        {activeTab === 'setting-aktivasi' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#008952] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Bengkel Qu Full Version</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Seluruh modul operasional, kasir POS, antrian servis, inventaris, CRM pelanggan, marketing, manajemen cabang & multi-HP aktif penuh tanpa batasan kuota.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>Status Aplikasi:</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Permanen Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-900">
                  <span>Device ID Perangkat:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[11px]">{deviceId}</span>
                    <button
                      type="button"
                      onClick={handleCopyDeviceId}
                      className="text-[#008952] hover:underline text-[10px] font-bold cursor-pointer"
                    >
                      {copiedDeviceId ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
              </div>

              {onNavigateToDevices && (
                <button
                  type="button"
                  onClick={onNavigateToDevices}
                  className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Laptop className="w-4 h-4" />
                  <span>Kelola Tautkan HP & Sinkronisasi</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: INFO APP, PWA & UPDATE RESILIENCE ================= */}
        {activeTab === 'setting-update' && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Header Update Resilience */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#008952]" />
                <h3 className="font-bold text-slate-900 text-sm">Pembaruan Aman & Ketahanan Data (Update Resilience)</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                UsahaQu v1.83 dilengkapi arsitektur <strong>Update Resilience</strong>. Pembaruan aset web di-cache menggunakan strategi <em>Stale-While-Revalidate</em> tanpa menyentuh IndexedDB atau LocalStorage tempat data transaksi kasir Anda tersimpan.
              </p>
            </div>

            {/* Notification Bar */}
            {migrationStatus && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>{migrationStatus.msg}</span>
              </div>
            )}

            {swStatusMsg && (
              <div className="p-3 bg-blue-50 border border-blue-300 text-blue-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{swStatusMsg}</span>
                </div>
                {swUpdateAvailable && (
                  <button
                    type="button"
                    onClick={handleApplySWUpdate}
                    className="py-1 px-2.5 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                  >
                    Pasang Sekarang
                  </button>
                )}
              </div>
            )}

            {/* Card Service Worker & PWA Caching Strategy */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">PWA Service Worker & Cache API</span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                  Stale-While-Revalidate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Versi Cache Shell</span>
                  <span className="font-mono font-bold text-slate-900">v1.83.2-shell</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Jaminan Keamanan Data</span>
                  <span className="font-bold text-[#008952]">Zero Data Loss</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCheckSWUpdate}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cek Update Service Worker</span>
                </button>
                {swUpdateAvailable && (
                  <button
                    type="button"
                    onClick={handleApplySWUpdate}
                    className="flex-1 bg-[#008952] hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Terapkan Versi Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* CARD PEMBARUAN APLIKASI (GITHUB ACTIONS AUTO-RELEASE & APK IN-APP UPDATE) */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-blue-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Pembaruan Versi & Rilis APK Otomatis</span>
                </div>
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-[10px]">
                  v{CURRENT_APP_VERSION} (Build #{CURRENT_VERSION_CODE})
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap kali Anda melakukan <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono text-[11px]">git push</code> ke GitHub, GitHub Actions otomatis menghitung kenaikan versi (Besar/Sedang/Kecil), mengompilasi APK baru, dan menerbitkan rilis. HP pengguna dapat langsung memperbarui aplikasi dari tombol di bawah.
              </p>

              {appUpdateStatusMsg && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{appUpdateStatusMsg}</span>
                  </div>
                  {appUpdateInfo?.isUpdateAvailable && (
                    <a
                      href={appUpdateInfo.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] shrink-0 active:scale-95 transition cursor-pointer"
                    >
                      Unduh APK
                    </a>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCheckAppRelease}
                  disabled={isCheckingAppUpdate}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isCheckingAppUpdate ? 'animate-spin' : ''}`} />
                  <span>{isCheckingAppUpdate ? 'Memeriksa...' : 'Periksa Rilis APK Baru'}</span>
                </button>
                {appUpdateInfo?.downloadUrl && (
                  <a
                    href={appUpdateInfo.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Halaman Rilis</span>
                  </a>
                )}
              </div>
            </div>

            {/* AUDIT KEUTUHAN PENYIMPANAN DATA (STORAGE INTEGRITY AUDIT) */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#008952]" />
                  <span className="font-bold text-slate-900">Audit Integritas Storage Lokal</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunStorageAudit}
                  disabled={isAuditing}
                  className="text-[10px] font-bold text-[#008952] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>Audit Ulang</span>
                </button>
              </div>

              {storageAudit && (
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Stores IndexedDB</span>
                      <span className="font-extrabold text-slate-900 text-sm">{storageAudit.totalStoresCount}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Total Data Record</span>
                      <span className="font-extrabold text-[#008952] text-sm">{storageAudit.totalRecordsCount}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Kunci LocalStorage</span>
                      <span className="font-extrabold text-slate-900 text-sm">{storageAudit.localStorageKeysCount}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-[11px] text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#008952] shrink-0" />
                      <span>{storageAudit.resilienceGuarantee}</span>
                    </div>
                    <p className="text-[10px] text-emerald-800 leading-normal pl-5">
                      Pembersihan cache aset antarmuka hanya memutakhirkan file statis aplikasi. Seluruh 21 tabel transaksi kasir dan master data tetap 100% utuh tanpa risiko reset.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Link ke POS Core Offline usahaku.html */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-2.5">
              <span className="font-bold text-xs text-slate-800 block">Pintasan Antarmuka POS Core Standalone:</span>
              <a 
                href="/usahaku.html" 
                className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>⚡ Buka Antarmuka Kasir POS Core Offline (usahaku.html) &rarr;</span>
              </a>
            </div>

            {/* Auto-Migration Schema Button */}
            <button
              type="button"
              onClick={handleRunMigrationCheck}
              className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sinkronkan & Sesuaikan Skema Data Sekarang</span>
            </button>
          </div>
        )}

        {/* ================= TAB 7: CUSTOMER CARE AI & TROUBLESHOOT ================= */}
        {activeTab === 'setting-customer-care' && (
          <div className="-m-4">
            <CustomerCareView
              onBack={() => setActiveTab('setting-tema')}
              profile={profile}
              userSession={userSession}
              queues={queues}
              spareparts={spareparts}
              transactions={transactions}
            />
          </div>
        )}

      </div>

      {/* Confirmation Modal for Reset */}
      {resetModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 p-5 space-y-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
              resetModalMode === 'clean_slate' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-[#008952]'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {resetModalMode === 'clean_slate'
                  ? 'Konfirmasi Hapus Bersih Total (0 Tersisa)'
                  : resetModalMode === 'factory'
                  ? 'Konfirmasi Muat Ulang Data Sampel Pabrik'
                  : 'Konfirmasi Bersihkan Shift Hari Ini'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {resetModalMode === 'clean_slate'
                  ? 'PERINGATAN: Seluruh antrian, barang, pelanggan, dan transaksi akan dikosongkan total tanpa ada data yang tersisa.'
                  : 'Data akan dimuat ulang ke kondisi standar.'}
              </p>
              <p className="text-xs font-bold text-slate-700 mt-2">
                Ketik kata <span className="font-black text-rose-600">HAPUS</span> atau <span className="font-black text-rose-600">RESET</span> di bawah untuk melanjutkan:
              </p>
            </div>

            <input
              type="text"
              value={resetConfirmationText}
              onChange={(e) => setResetConfirmationText(e.target.value)}
              placeholder="Ketik HAPUS atau RESET"
              className="w-full text-center bg-slate-50 border border-slate-300 rounded-xl py-2 font-mono text-sm uppercase font-bold tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setResetModalMode(null);
                  setResetConfirmationText('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  resetConfirmationText.trim().toUpperCase() !== 'RESET' &&
                  resetConfirmationText.trim().toUpperCase() !== 'HAPUS'
                }
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Ya, Eksekusi Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
