import React, { useState, useEffect, useId } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  AlertTriangle, 
  Boxes, 
  Check, 
  Barcode, 
  Truck, 
  PackageX, 
  PlusCircle, 
  Calendar, 
  Sparkles, 
  Clock, 
  Info,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Warehouse,
  History,
  FileText,
  Globe,
  Download,
  ExternalLink,
  ShoppingCart
} from 'lucide-react';
import { Sparepart, DamagedGood, ProcurementRecord, WorkshopProfile } from '../../types';
import { INITIAL_PROFILE } from '../../data/mockData';
import { downloadOfflineStoreHtml, openOfflineStoreInNewTab } from '../../utils/offlineStoreGenerator';
import { ImageUploadWithCompression } from '../common/ImageUploadWithCompression';
import { OnlineStoreToggle } from '../common/OnlineStoreToggle';

interface InventoryViewProps {
  initialTab?: string;
  spareparts: Sparepart[];
  damagedGoods: DamagedGood[];
  procurements: ProcurementRecord[];
  profile?: WorkshopProfile;
  onBack: () => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onAddNewPart: (newPart: Omit<Sparepart, 'id'>) => void;
  onSaveInboundStock: (itemData: {
    code: string;
    name: string;
    category: Sparepart['category'];
    brand: string;
    stockToAdd: number;
    minStock: number;
    buyPrice: number;
    sellPrice: number;
    unit: string;
    rackLocation: string;
    supplier?: string;
    poNumber?: string;
    notes?: string;
    photoUrl?: string;
    showInOnlineStore?: boolean;
    description?: string;
  }) => void;
  onReportDamagedGood: (report: {
    sparepartId?: string;
    code: string;
    name: string;
    qty: number;
    unit: string;
    damageReason: string;
    reportedBy: string;
    notes?: string;
  }) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  initialTab = 'sparepart-datang',
  spareparts,
  damagedGoods,
  procurements,
  profile = INITIAL_PROFILE,
  onBack,
  onUpdateStock,
  onAddNewPart,
  onSaveInboundStock,
  onReportDamagedGood
}) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Map legacy ids if needed
    if (initialTab === 'tambah-sparepart') return 'sparepart-datang';
    if (initialTab === 'stok-menipis') return 'stok-kritis';
    if (initialTab === 'pengadaan-suplier') return 'riwayat-pengadaan';
    return initialTab || 'sparepart-datang';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'tambah-sparepart') setActiveTab('sparepart-datang');
      else if (initialTab === 'stok-menipis') setActiveTab('stok-kritis');
      else if (initialTab === 'pengadaan-suplier') setActiveTab('riwayat-pengadaan');
      else setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Dynamic header title and subtitle based on active sub-menu
  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'sparepart-datang':
        return {
          title: 'Sparepart Datang (Inbound)',
          subtitle: 'Pintu Masuk Stok Baru & Tambah Qty'
        };
      case 'katalog-sparepart':
        return {
          title: 'Katalog Sparepart (Master)',
          subtitle: 'Master Stok Seluruh Suku Cadang'
        };
      case 'stok-kritis':
        return {
          title: 'Stok Kritis',
          subtitle: 'Suku Cadang Menipis di Bawah Minimum'
        };
      case 'barang-rusak':
        return {
          title: 'Barang Rusak (Damaged)',
          subtitle: 'Pengajuan & Pencatatan Barang Cacat / Rusak'
        };
      case 'riwayat-pengadaan':
        return {
          title: 'Riwayat Pengadaan',
          subtitle: 'Log Pembelian & Penerimaan Barang Suplier'
        };
      default:
        return {
          title: 'Inventaris & Sparepart',
          subtitle: 'Tata Kelola Logistik & Gudang Bengkel'
        };
    }
  };

  const headerMeta = getHeaderMeta();

  // Current date string
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Dynamic critical stock count
  const criticalItems = spareparts.filter((p) => p.stock <= p.minStock);

  // --------------------------------------------------------------------------
  // SUB-MENU A: INBOUND STATE (Sparepart Datang / Tambah Qty / Scan Masuk)
  // --------------------------------------------------------------------------
  const [inboundSearchCode, setInboundSearchCode] = useState('');
  const [inboundIsExistingFound, setInboundIsExistingFound] = useState(false);
  const [inboundExistingPart, setInboundExistingPart] = useState<Sparepart | null>(null);

  const [inboundCode, setInboundCode] = useState('');
  const [inboundName, setInboundName] = useState('');
  const [inboundCategory, setInboundCategory] = useState<Sparepart['category']>('Oli & Pelumas');
  const [inboundBrand, setInboundBrand] = useState('Honda Genuine Part');
  const [inboundStockToAdd, setInboundStockToAdd] = useState<number>(10);
  const [inboundMinStock, setInboundMinStock] = useState<number>(5);
  const [inboundBuyPrice, setInboundBuyPrice] = useState<number>(45000);
  const [inboundSellPrice, setInboundSellPrice] = useState<number>(55000);
  const [inboundUnit, setInboundUnit] = useState('Botol');
  const [inboundRack, setInboundRack] = useState('Rak A-1');
  const [inboundSupplier, setInboundSupplier] = useState('Distributor Resmi Bengkel');
  const [inboundNotes, setInboundNotes] = useState('');
  const [inboundPhotoUrl, setInboundPhotoUrl] = useState('');
  const [inboundShowOnline, setInboundShowOnline] = useState(true);
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);

  // Automatic populate if searched/scanned code matches
  const handleLookupCode = (queryCode: string) => {
    const cleanCode = queryCode.trim();
    if (!cleanCode) {
      setInboundIsExistingFound(false);
      setInboundExistingPart(null);
      return;
    }

    const found = spareparts.find(
      (p) =>
        p.code.toLowerCase() === cleanCode.toLowerCase() ||
        p.name.toLowerCase().includes(cleanCode.toLowerCase())
    );

    if (found) {
      setInboundIsExistingFound(true);
      setInboundExistingPart(found);
      setInboundCode(found.code);
      setInboundName(found.name);
      setInboundCategory(found.category);
      setInboundBrand(found.brand);
      setInboundMinStock(found.minStock);
      setInboundBuyPrice(found.buyPrice);
      setInboundSellPrice(found.sellPrice);
      setInboundUnit(found.unit);
      setInboundRack(found.rackLocation);
      if (found.supplier) setInboundSupplier(found.supplier);
      if (found.photoUrl) setInboundPhotoUrl(found.photoUrl);
      setInboundShowOnline(found.showInOnlineStore !== false);
    } else {
      setInboundIsExistingFound(false);
      setInboundExistingPart(null);
      // Keep code
      setInboundCode(cleanCode);
    }
  };

  const handleSimulateBarcodeScan = () => {
    setIsScanningSimulated(true);
    setTimeout(() => {
      // Pick random existing or generate sample barcode
      const sampleCodes = ['OIL-AHM-01', 'OIL-SHELL-01', 'REM-DAY-01', 'BS-NGK-01', 'CVT-VAN-01'];
      const picked = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
      setInboundSearchCode(picked);
      handleLookupCode(picked);
      setIsScanningSimulated(false);
      showToast(`Barcode terscan: ${picked} (Data otomatis terisi)`);
    }, 700);
  };

  const handleSaveInbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboundCode.trim() || !inboundName.trim()) {
      showToast('Harap isi kode dan nama sparepart!');
      return;
    }

    const wasLowStock = inboundExistingPart && inboundExistingPart.stock <= inboundExistingPart.minStock;

    onSaveInboundStock({
      code: inboundCode.trim().toUpperCase(),
      name: inboundName.trim(),
      category: inboundCategory,
      brand: inboundBrand.trim(),
      stockToAdd: Math.max(1, Number(inboundStockToAdd) || 1),
      minStock: Math.max(1, Number(inboundMinStock) || 1),
      buyPrice: Number(inboundBuyPrice) || 0,
      sellPrice: Number(inboundSellPrice) || 0,
      unit: inboundUnit.trim() || 'Pcs',
      rackLocation: inboundRack.trim() || 'Gudang Utama',
      supplier: inboundSupplier.trim() || 'Distributor Resmi',
      notes: inboundNotes.trim(),
      photoUrl: inboundPhotoUrl,
      showInOnlineStore: inboundShowOnline
    });

    const successMsg = inboundIsExistingFound
      ? `Stok ${inboundName} bertambah +${inboundStockToAdd} ${inboundUnit}! Data tersinkron ke Katalog${wasLowStock ? ' & dihapus dari Stok Kritis.' : '.'}`
      : `Sparepart baru ${inboundName} berhasil didaftarkan ke Katalog (${inboundStockToAdd} ${inboundUnit})!`;

    showToast(successMsg);

    // Reset Form
    setInboundSearchCode('');
    setInboundIsExistingFound(false);
    setInboundExistingPart(null);
    setInboundCode('');
    setInboundName('');
    setInboundStockToAdd(10);
    setInboundNotes('');
    setInboundPhotoUrl('');
    setInboundShowOnline(true);
  };

  // --------------------------------------------------------------------------
  // SUB-MENU B: KATALOG SPAREPART (Master Catalog - Read-Only List)
  // --------------------------------------------------------------------------
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('Semua');

  const categories = [
    'Semua',
    'Oli & Pelumas',
    'Sistem Rem',
    'Transmisi / CVT',
    'Busi & Kelistrikan',
    'Ban & Velg',
    'Filter & Karburator',
    'Bodi & Aksesoris'
  ];

  const filteredCatalog = spareparts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCategory === 'Semua' ? true : p.category === catalogCategory;
    return matchesSearch && matchesCat;
  });

  // --------------------------------------------------------------------------
  // SUB-MENU D: BARANG RUSAK (Submission Form + Minimalist List)
  // --------------------------------------------------------------------------
  const [dmgSelectedCode, setDmgSelectedCode] = useState('');
  const [dmgQty, setDmgQty] = useState<number>(1);
  const [dmgReason, setDmgReason] = useState('Segel bocor / kemasan rusak saat pengiriman');
  const [dmgReporter, setDmgReporter] = useState('Mas Dani (Mekanik)');
  const [dmgNotes, setDmgNotes] = useState('');

  const handleDamagedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmgSelectedCode) {
      showToast('Pilih suku cadang yang mengalami kerusakan!');
      return;
    }

    const targetPart = spareparts.find((p) => p.code === dmgSelectedCode);
    if (!targetPart) return;

    if (dmgQty > targetPart.stock) {
      showToast(`Jumlah rusak melebihi stok yang ada (${targetPart.stock} ${targetPart.unit})!`);
      return;
    }

    onReportDamagedGood({
      sparepartId: targetPart.id,
      code: targetPart.code,
      name: targetPart.name,
      qty: Number(dmgQty) || 1,
      unit: targetPart.unit,
      damageReason: dmgReason,
      reportedBy: dmgReporter,
      notes: dmgNotes
    });

    showToast(`Laporan barang rusak ${targetPart.name} berhasil diajukan! Stok master otomatis berkurang -${dmgQty}.`);
    setDmgSelectedCode('');
    setDmgQty(1);
    setDmgNotes('');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* =========================================================================
          1. COMPACT SUB-MENU HEADER
          - Reduced / shrunk header size (py-2.5)
          - Dynamically matches and displays the active sub-menu title & subtitle
          - All unnecessary sub-menu options/buttons removed from header area
      ========================================================================= */}
      <div 
        className="bg-[#008952] text-white px-4 py-2.5 shadow-sm sticky top-0 z-30"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-8 h-8 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
                {headerMeta.title}
              </h1>
              <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {criticalItems.length > 0 && (
              <button
                onClick={() => setActiveTab('stok-kritis')}
                title="Lihat Stok Kritis"
                className="px-2 py-1 rounded-lg bg-amber-400 text-amber-950 text-[10px] font-black flex items-center gap-1 cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                <span>{criticalItems.length} Kritis</span>
              </button>
            )}
            <div className="px-2 py-1 rounded-lg bg-emerald-800/40 text-[10px] font-bold text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-200" />
              <span>{todayStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 shadow-lg flex items-center justify-between gap-2 sticky top-[48px] z-20 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[10px] text-emerald-300 font-bold hover:underline shrink-0 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 space-y-4 max-w-3xl mx-auto w-full pb-20">

        {/* =====================================================================
            A. SPAREPART BARU / TAMBAH QTY / SPAREPART DATANG (INBOUND)
            - Mandatory entry point for any incoming stock
            - Large card format in Full Screen style
            - Barcode scanner or search functionality
            - Automated Logic: If existing item code searched/scanned, data auto-populates
            - Action & Flow: On Simpan, auto syncs to Katalog & removes from Stok Kritis
        ===================================================================== */}
        {activeTab === 'sparepart-datang' && (
          <div className="space-y-4">
            {/* Header Description Badge */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#008952] text-white flex items-center justify-center shrink-0">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h2 className="font-extrabold text-emerald-950">
                  Gerbang Logistik Masuk (Mandatory Inbound Entry)
                </h2>
                <p className="text-emerald-800 text-[11px] leading-relaxed mt-0.5">
                  Seluruh stok suku cadang baru maupun penambahan qty datang <strong>wajib</strong> melalui form ini. 
                  Stok katalog otomatis terupdate dan item akan hilang dari daftar stok kritis.
                </p>
              </div>
            </div>

            {/* FULL SCREEN LARGE CARD FORM */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
              
              {/* Top Section: Barcode Scanner / Search Bar */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    1. Scan Barcode / Cari Kode Suku Cadang
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Otomatisasi Deteksi Stok Master
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={inboundSearchCode}
                      onChange={(e) => {
                        setInboundSearchCode(e.target.value);
                        handleLookupCode(e.target.value);
                      }}
                      placeholder="Ketik kode part (cth: OIL-AHM-01) atau nama part..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008952] focus:bg-white font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateBarcodeScan}
                    disabled={isScanningSimulated}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-transform cursor-pointer"
                  >
                    <Barcode className={`w-4 h-4 text-emerald-400 ${isScanningSimulated ? 'animate-spin' : ''}`} />
                    <span>{isScanningSimulated ? 'Scanning...' : 'Scan Barcode'}</span>
                  </button>
                </div>

                {/* Auto Detection Status Banner */}
                {inboundIsExistingFound && inboundExistingPart && (
                  <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#008952] shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950">
                          Suku Cadang Ditemukan: {inboundExistingPart.name}
                        </span>
                        <p className="text-[10px] text-emerald-700">
                          Stok saat ini: <strong>{inboundExistingPart.stock} {inboundExistingPart.unit}</strong> • Rak: {inboundExistingPart.rackLocation} • {inboundExistingPart.stock <= inboundExistingPart.minStock ? '🚨 Status Kritis' : 'Normal'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 shrink-0">
                      Auto-Populated
                    </span>
                  </div>
                )}
              </div>

              {/* Inbound Form Fields */}
              <form onSubmit={handleSaveInbound} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kode Part */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Kode Suku Cadang (Part Code) *
                    </label>
                    <input
                      type="text"
                      required
                      value={inboundCode}
                      onChange={(e) => {
                        setInboundCode(e.target.value);
                        handleLookupCode(e.target.value);
                      }}
                      placeholder="Contoh: OIL-AHM-01 atau PRT-098"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs transition-colors focus:outline-none"
                    />
                  </div>

                  {/* Nama Part */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Nama Suku Cadang *
                    </label>
                    <input
                      type="text"
                      required
                      value={inboundName}
                      onChange={(e) => setInboundName(e.target.value)}
                      placeholder="Contoh: AHM Oil MPX2 0.8L (Matic)"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kategori */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Kategori
                    </label>
                    <select
                      value={inboundCategory}
                      onChange={(e) => setInboundCategory(e.target.value as any)}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                    >
                      {categories.filter((c) => c !== 'Semua').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand / Merk */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Merk / Brand
                    </label>
                    <input
                      type="text"
                      value={inboundBrand}
                      onChange={(e) => setInboundBrand(e.target.value)}
                      placeholder="Contoh: Honda Genuine Part, Shell, Yamalube"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                {/* Stock Addition Highlight Box */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                      Jumlah Masuk (Tambah Qty) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        required
                        value={inboundStockToAdd}
                        onChange={(e) => setInboundStockToAdd(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-black text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    {inboundExistingPart && (
                      <p className="text-[10px] text-emerald-700 mt-1">
                        Akan menjadi: <strong>{inboundExistingPart.stock + Number(inboundStockToAdd || 0)} {inboundUnit}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={inboundUnit}
                      onChange={(e) => setInboundUnit(e.target.value)}
                      placeholder="Botol / Pcs / Set"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#008952]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Batas Min. Stok (Alert)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={inboundMinStock}
                      onChange={(e) => setInboundMinStock(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#008952]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Harga Beli */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Harga Beli / Modal (Rp)
                    </label>
                    <input
                      type="number"
                      value={inboundBuyPrice}
                      onChange={(e) => setInboundBuyPrice(Number(e.target.value))}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs transition-colors focus:outline-none"
                    />
                  </div>

                  {/* Harga Jual */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Harga Jual Konsumen (Rp)
                    </label>
                    <input
                      type="number"
                      value={inboundSellPrice}
                      onChange={(e) => setInboundSellPrice(Number(e.target.value))}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-[#008952] font-black text-xs transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lokasi Rak */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Lokasi Rak / Penyimpanan
                    </label>
                    <input
                      type="text"
                      value={inboundRack}
                      onChange={(e) => setInboundRack(e.target.value)}
                      placeholder="Contoh: Rak A-1, Gudang Belakang"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                    />
                  </div>

                  {/* Suplier */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Suplier / Distributor Pengirim
                    </label>
                    <input
                      type="text"
                      value={inboundSupplier}
                      onChange={(e) => setInboundSupplier(e.target.value)}
                      placeholder="Contoh: PT Astra Honda Motor, PT Yamaha Jabar"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                {/* Catatan */}
                <div className="group">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Catatan Penerimaan / No. Surat Jalan Suplier
                  </label>
                  <input
                    type="text"
                    value={inboundNotes}
                    onChange={(e) => setInboundNotes(e.target.value)}
                    placeholder="Contoh: Pengiriman DO #SJ-8891, kemasan segel aman..."
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                  />
                </div>

                {/* Foto Produk & Auto-WebP Compression */}
                <div className="pt-2">
                  <ImageUploadWithCompression
                    value={inboundPhotoUrl}
                    onChange={setInboundPhotoUrl}
                    onClear={() => setInboundPhotoUrl('')}
                    label="Foto Suku Cadang (Auto-WebP ~30-50KB)"
                  />
                </div>

                {/* Sakelar Tampilkan di Toko Online */}
                <div className="pt-1">
                  <OnlineStoreToggle
                    checked={inboundShowOnline}
                    onChange={setInboundShowOnline}
                    label="Tampilkan di Toko Online Bengkel"
                    description="Sparepart ini akan muncul di katalog publik dan dapat dipesan pelanggan melalui WhatsApp."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-[#008952] hover:bg-emerald-700 active:scale-98 text-white font-extrabold py-3.5 rounded-2xl shadow-sm text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>
                      {inboundIsExistingFound
                        ? `Simpan Penambahan Stok (+${inboundStockToAdd} ${inboundUnit}) & Sinkron ke Katalog`
                        : `Simpan Suku Cadang Baru & Daftarkan ke Master Katalog`}
                    </span>
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-2">
                    * Data penerimaan akan tercatat otomatis ke dalam <strong>Riwayat Pengadaan</strong>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            B. KATALOG SPAREPART (MASTER CATALOG)
            - List view format displaying all available inventory
            - Stock qty only changes automatically through sales, damage reports, or inbound
        ===================================================================== */}
        {activeTab === 'katalog-sparepart' && (
          <div className="space-y-3">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Cari kode part, nama barang, atau merk..."
                  className="w-full bg-slate-50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-[#008952] font-medium"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      catalogCategory === cat
                        ? 'bg-[#008952] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Info & Export Toko Offline Button */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 text-xs">
                  Total Suku Cadang: {filteredCatalog.length} Item
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                  Stok Terkoneksi Realtime
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const shopName = profile.workshopName || 'BengkelQu';
                    const filename = `toko-${shopName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
                    downloadOfflineStoreHtml(profile, spareparts, filename);
                    showToast(`Berkas toko offline (${filename}) berhasil diunduh! Siap dibuka offline.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95"
                  title="Unduh file .html toko offline mandiri"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ekspor Toko Offline (.html)</span>
                </button>
                <button
                  type="button"
                  onClick={() => openOfflineStoreInNewTab(profile, spareparts)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008952] border border-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                  title="Preview toko offline di browser"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Preview</span>
                </button>
              </div>
            </div>

            {/* List View Master Catalog */}
            <div className="space-y-2">
              {filteredCatalog.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Tidak ada suku cadang ditemukan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Periksa kata kunci pencarian Anda</p>
                </div>
              ) : (
                filteredCatalog.map((item) => {
                  const isCritical = item.stock <= item.minStock;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.code}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800">
                            {item.category}
                          </span>
                          {isCritical && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[9px] flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Kritis
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {item.name}
                        </h3>

                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <span>Merk: <strong className="text-slate-700">{item.brand}</strong></span>
                          <span>• Lokasi: <strong className="text-slate-700">{item.rackLocation}</strong></span>
                          <span>• Modal: <span className="font-mono text-slate-600">Rp {item.buyPrice.toLocaleString('id-ID')}</span></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Harga Jual</span>
                          <span className="text-xs sm:text-sm font-black text-[#008952]">
                            Rp {item.sellPrice.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Stock Display Badge */}
                        <div className="text-right pl-3 sm:border-l border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">Stok Tersedia</span>
                          <span
                            className={`font-black text-sm px-2.5 py-0.5 rounded-lg inline-block ${
                              isCritical
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            {item.stock} <span className="text-[10px] font-medium">{item.unit}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            C. STOK KRITIS (CRITICAL STOCK)
            - List view displaying items with low stock levels
            - Automated Flow: Items automatically disappear once quantity increases
        ===================================================================== */}
        {activeTab === 'stok-kritis' && (
          <div className="space-y-3">
            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Peringatan Logistik: Stok Suku Cadang Kritis ({criticalItems.length} Item)
                </h3>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Item di bawah ini memiliki kuantitas di bawah batas aman minimum. 
                  Sistem akan <strong>otomatis menghapus item</strong> dari daftar ini begitu stok ditambah melalui menu <em>Sparepart Datang (Inbound)</em>.
                </p>
              </div>
            </div>

            {criticalItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
                <h3 className="font-extrabold text-slate-900 text-sm">Semua Stok Berada di Batas Aman!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Tidak ada suku cadang yang menipis saat ini. Semua persediaan di atas kuantitas minimum.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 shadow-xs border border-amber-200/80 hover:border-amber-400 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            {item.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Lokasi: {item.rackLocation}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mt-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {item.brand} • {item.category}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Sisa Stok</span>
                        <span className="text-base font-black text-rose-600">
                          {item.stock} <span className="text-xs font-normal text-slate-600">{item.unit}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">Min: {item.minStock} {item.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="text-[11px] text-slate-500">
                        Harga Beli Terakhir: <strong className="text-slate-800">Rp {item.buyPrice.toLocaleString('id-ID')}</strong>
                      </div>
                      <button
                        onClick={() => {
                          setInboundSearchCode(item.code);
                          handleLookupCode(item.code);
                          setActiveTab('sparepart-datang');
                        }}
                        className="bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-transform cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Inbound Masuk</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            D. BARANG RUSAK (DAMAGED GOODS)
            - Features: Submission form (pengajuan)
            - View: Minimalist list view with dynamic dates
        ===================================================================== */}
        {activeTab === 'barang-rusak' && (
          <div className="space-y-4">
            {/* Form Pengajuan Barang Rusak (Large Card Minimalist Underlines) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <PackageX className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      Formulir Pengajuan Barang Rusak / Cacat
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Stok master katalog akan otomatis dikurangi sesuai qty yang diajukan.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleDamagedSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Sparepart */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Pilih Suku Cadang Rusak *
                    </label>
                    <select
                      required
                      value={dmgSelectedCode}
                      onChange={(e) => setDmgSelectedCode(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-rose-600 focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs transition-colors focus:outline-none"
                    >
                      <option value="">-- Pilih Suku Cadang --</option>
                      {spareparts.map((p) => (
                        <option key={p.id} value={p.code}>
                          {p.code} - {p.name} (Tersedia: {p.stock} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Qty Rusak */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Kuantitas Rusak (Qty) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={dmgQty}
                      onChange={(e) => setDmgQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-rose-600 focus:ring-0 rounded-none py-1.5 px-0 text-rose-700 font-black text-xs transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Alasan Kerusakan */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Alasan Kerusakan / Cacat *
                    </label>
                    <select
                      value={dmgReason}
                      onChange={(e) => setDmgReason(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-rose-600 focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                    >
                      <option value="Segel bocor / rembes saat pengiriman suplier">Segel bocor / rembes saat pengiriman suplier</option>
                      <option value="Kemasan pecah / cacat pabrik / retak">Kemasan pecah / cacat pabrik / retak</option>
                      <option value="Jatuh / rusak di gudang bengkel">Jatuh / rusak di gudang bengkel</option>
                      <option value="Masa kedaluwarsa habis (expired)">Masa kedaluwarsa habis (expired)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Pelapor */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Nama Pelapor / Mekanik *
                    </label>
                    <input
                      type="text"
                      required
                      value={dmgReporter}
                      onChange={(e) => setDmgReporter(e.target.value)}
                      placeholder="Contoh: Mas Dani (Mekanik)"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-rose-600 focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                    />
                  </div>
                </div>

                {/* Catatan Tindak Lanjut */}
                <div className="group">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Catatan Tambahan (Opsi Klaim / Retur)
                  </label>
                  <input
                    type="text"
                    value={dmgNotes}
                    onChange={(e) => setDmgNotes(e.target.value)}
                    placeholder="Contoh: Ditaruh di rak retur suplier untuk klaim penggantian..."
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-rose-600 focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold py-3 rounded-2xl shadow-xs text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PackageX className="w-4 h-4" />
                  <span>Kirim Pengajuan Barang Rusak & Kurangi Stok</span>
                </button>
              </form>
            </div>

            {/* MINIMALIST LIST VIEW WITH DYNAMIC DATES */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-slate-700">
                  Log Pengajuan Barang Rusak ({damagedGoods.length})
                </h4>
                <span className="text-[10px] text-slate-400">Gaya Baris Minimalis Underline</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
                {damagedGoods.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Belum ada catatan barang rusak
                  </div>
                ) : (
                  damagedGoods.map((dmg) => (
                    <div key={dmg.id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-rose-700">
                              {dmg.code}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {dmg.date}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-slate-900 text-xs">
                            {dmg.name}
                          </h5>
                          <p className="text-[11px] text-slate-600 font-medium">
                            {dmg.damageReason}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Dilaporkan oleh: <strong className="text-slate-600">{dmg.reportedBy}</strong> {dmg.notes ? `• ${dmg.notes}` : ''}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                            -{dmg.qty} {dmg.unit}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-500 mt-1">
                            {dmg.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            E. RIWAYAT PENGADAAN (PROCUREMENT HISTORY)
            - Minimalist list view tracking procurement logs with dynamic dates
        ===================================================================== */}
        {activeTab === 'riwayat-pengadaan' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-extrabold text-slate-900">
                  Log Riwayat Pengadaan & Penerimaan Suplier
                </h4>
                <p className="text-[11px] text-slate-500">
                  Semua transaksi inbound otomatis tercatat secara kronologis.
                </p>
              </div>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {procurements.length} Faktur / PO
              </span>
            </div>

            {/* MINIMALIST LIST VIEW WITH DYNAMIC DATES */}
            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {procurements.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada log riwayat pengadaan
                </div>
              ) : (
                procurements.map((po) => (
                  <div key={po.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                            {po.poNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {po.date}
                          </span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {po.type}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {po.name}
                        </h5>

                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <span>Kode: <strong className="font-mono text-slate-700">{po.code}</strong></span>
                          <span>Suplier: <strong className="text-slate-700">{po.supplier}</strong></span>
                          <span>Penerima: <strong className="text-slate-700">{po.receiver}</strong></span>
                        </div>

                        {po.notes && (
                          <p className="text-[10px] text-slate-400 italic">
                            Catatan: {po.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          +{po.qty} {po.unit}
                        </span>
                        <div className="mt-1">
                          <span className="text-[10px] text-slate-400 block">Total Nilai Beli</span>
                          <span className="text-xs font-extrabold text-slate-900 font-mono">
                            Rp {po.totalCost.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
