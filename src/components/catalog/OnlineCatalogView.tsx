/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Search, 
  ShoppingCart, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  Wrench, 
  Coffee, 
  Pill, 
  Package, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  MessageCircle, 
  Sparkles, 
  Filter, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Flame,
  Stethoscope,
  Info
} from 'lucide-react';
import { 
  OnlineStoreConfig, 
  CatalogOrderItem, 
  CheckoutData, 
  getOnlineStoreConfig, 
  openWhatsAppCheckout, 
  getPublicStoreUrl,
  DEFAULT_STORE_CONFIGS
} from '../../services/onlineStoreService';
import { Sparepart } from '../../types';
import { QUICK_SERVICE_PACKAGES, INITIAL_SPAREPARTS } from '../../data/mockData';
import { KedaiMenuItem } from '../kedai/KedaiTypes';
import { STORAGE_KEYS as KEDAI_KEYS, DEFAULT_MENU, getKedaiStorage } from '../kedai/KedaiStorage';
import { RitelProduct } from '../ritel/RitelTypes';
import { RITEL_STORAGE_KEYS, DEFAULT_RITEL_PRODUCTS, getRitelStorage } from '../ritel/RitelStorage';
import { KlinikObat, KlinikDokter } from '../klinik/KlinikTypes';
import { KLINIK_STORAGE_KEYS, DEFAULT_KLINIK_OBAT, DEFAULT_KLINIK_DOKTER, getKlinikStorage } from '../klinik/KlinikStorage';
import { ProductRecipe, ConsignmentStore } from '../titip/TitipTypes';
import { TITIP_STORAGE_KEYS, DEFAULT_PRODUCT_RECIPES, DEFAULT_CONSIGNMENT_STORES, getTitipStorage } from '../titip/TitipStorage';

interface OnlineCatalogViewProps {
  initialModule?: 'bengkel' | 'kedai' | 'ritel' | 'klinik' | 'titip';
  onBackToAdmin?: () => void;
  // Master data sources
  bengkelParts?: Sparepart[];
  kedaiMenus?: KedaiMenuItem[];
  ritelProducts?: RitelProduct[];
  klinikMedicines?: KlinikObat[];
  klinikDoctors?: KlinikDokter[];
  titipRecipes?: ProductRecipe[];
  titipStores?: ConsignmentStore[];
}

export const OnlineCatalogView: React.FC<OnlineCatalogViewProps> = ({
  initialModule = 'bengkel',
  onBackToAdmin,
  bengkelParts = [],
  kedaiMenus = [],
  ritelProducts = [],
  klinikMedicines = [],
  klinikDoctors = [],
  titipRecipes = [],
  titipStores = []
}) => {
  const [activeModule, setActiveModule] = useState<'bengkel' | 'kedai' | 'ritel' | 'klinik' | 'titip'>(initialModule);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'services'>('items');
  const [selectedVendor, setSelectedVendor] = useState<string>('Semua');

  // Online Store Configuration for the active module
  const [storeConfig, setStoreConfig] = useState<OnlineStoreConfig>(() => getOnlineStoreConfig(initialModule));

  // Cart state
  const [cart, setCart] = useState<CatalogOrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Variant Modal state (for KedaiQu F&B)
  const [variantModalItem, setVariantModalItem] = useState<KedaiMenuItem | null>(null);
  const [selectedTemp, setSelectedTemp] = useState<'Hot' | 'Ice'>('Ice');
  const [selectedSpicy, setSelectedSpicy] = useState<number>(1);
  const [variantItemNote, setVariantItemNote] = useState('');

  // Booking schedule modal state (for BengkelQu / KlinikQu)
  const [bookingModalItem, setBookingModalItem] = useState<{ id: string; name: string; price: number; type: 'service' | 'consultation' } | null>(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('09:00');
  const [bookingPlate, setBookingPlate] = useState('');
  const [bookingComplaint, setBookingComplaint] = useState('');

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery' | 'booking_service'>(
    initialModule === 'kedai' ? 'dine_in' : 'takeaway'
  );
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [copyToast, setCopyToast] = useState(false);

  // Update store config when active module changes
  const handleSwitchModule = (mod: 'bengkel' | 'kedai' | 'ritel' | 'klinik' | 'titip') => {
    setActiveModule(mod);
    setStoreConfig(getOnlineStoreConfig(mod));
    setSelectedCategory('Semua');
    setSearchQuery('');
    setActiveSubTab('items');
    if (mod === 'kedai') setOrderType('dine_in');
    else if (mod === 'bengkel') setOrderType('booking_service');
    else setOrderType('takeaway');
  };

  // Cart Helpers
  const addToCart = (item: CatalogOrderItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.variant === item.variant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += item.qty;
        return updated;
      }
      return [...prev, item];
    });
  };

  const updateCartQty = (id: string, delta: number, variant?: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.variant === variant) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CatalogOrderItem[]
    );
  };

  const removeCartItem = (id: string, variant?: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.variant === variant)));
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Copy Public Link
  const handleCopyLink = () => {
    const url = getPublicStoreUrl(activeModule, storeConfig.slug);
    navigator.clipboard.writeText(url).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    });
  };

  const handleShareLink = () => {
    const url = getPublicStoreUrl(activeModule, storeConfig.slug);
    if (navigator.share) {
      navigator.share({
        title: storeConfig.storeName,
        text: `Kunjungi katalog digital & pesan online di ${storeConfig.storeName}:`,
        url: url
      }).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  // WhatsApp Checkout Trigger
  const handleProceedWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Harap isi nama lengkap pemesan!');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Harap isi nomor WhatsApp aktif!');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang belanja Anda masih kosong!');
      return;
    }

    const checkoutData: CheckoutData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      bookingDate: orderType === 'booking_service' ? bookingDate : undefined,
      bookingTime: orderType === 'booking_service' ? bookingTime : undefined,
      vehiclePlate: orderType === 'booking_service' ? bookingPlate : undefined,
      vehicleComplaint: orderType === 'booking_service' ? bookingComplaint : undefined,
      notes: checkoutNotes.trim(),
      items: cart,
      subtotal: cartSubtotal,
      total: cartSubtotal
    };

    openWhatsAppCheckout(checkoutData, storeConfig);
  };

  // ---------------------------------------------------------------------------
  // FILTERED DATA ENGINE PER MODULE
  // ---------------------------------------------------------------------------

  // Safe data source fallbacks
  const effectiveBengkelParts = useMemo<Sparepart[]>(() => {
    if (bengkelParts && bengkelParts.length > 0) return bengkelParts;
    try {
      const saved = localStorage.getItem('bq_spareparts');
      return saved ? (JSON.parse(saved) as Sparepart[]) : INITIAL_SPAREPARTS;
    } catch {
      return INITIAL_SPAREPARTS;
    }
  }, [bengkelParts]);

  const effectiveKedaiMenus = useMemo<KedaiMenuItem[]>(() => {
    if (kedaiMenus && kedaiMenus.length > 0) return kedaiMenus;
    return getKedaiStorage(KEDAI_KEYS.MENU, DEFAULT_MENU);
  }, [kedaiMenus]);

  const effectiveRitelProducts = useMemo<RitelProduct[]>(() => {
    if (ritelProducts && ritelProducts.length > 0) return ritelProducts;
    return getRitelStorage(RITEL_STORAGE_KEYS.PRODUCTS, DEFAULT_RITEL_PRODUCTS);
  }, [ritelProducts]);

  const effectiveKlinikMeds = useMemo<KlinikObat[]>(() => {
    if (klinikMedicines && klinikMedicines.length > 0) return klinikMedicines;
    return getKlinikStorage(KLINIK_STORAGE_KEYS.OBAT, DEFAULT_KLINIK_OBAT);
  }, [klinikMedicines]);

  const effectiveKlinikDocs = useMemo<KlinikDokter[]>(() => {
    if (klinikDoctors && klinikDoctors.length > 0) return klinikDoctors;
    return getKlinikStorage(KLINIK_STORAGE_KEYS.DOKTER, DEFAULT_KLINIK_DOKTER);
  }, [klinikDoctors]);

  const effectiveTitipRecipes = useMemo<ProductRecipe[]>(() => {
    if (titipRecipes && titipRecipes.length > 0) return titipRecipes;
    return getTitipStorage(TITIP_STORAGE_KEYS.RECIPES, DEFAULT_PRODUCT_RECIPES);
  }, [titipRecipes]);

  // 1. BengkelQu Data
  const bengkelSparepartsList = useMemo<Sparepart[]>(() => {
    return effectiveBengkelParts.filter((p: Sparepart) => {
      const isOnline = p.showInOnlineStore !== false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      return isOnline && matchesSearch && matchesCat;
    });
  }, [effectiveBengkelParts, searchQuery, selectedCategory]);

  const bengkelCategories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(effectiveBengkelParts.map((p) => p.category)));
    return ['Semua', ...cats];
  }, [effectiveBengkelParts]);

  // 2. KedaiQu Data
  const kedaiFilteredMenus = useMemo<KedaiMenuItem[]>(() => {
    return effectiveKedaiMenus.filter((m: KedaiMenuItem) => {
      const isOnline = m.showInOnlineStore !== false;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Semua' || m.category === selectedCategory;
      return isOnline && matchesSearch && matchesCat;
    });
  }, [effectiveKedaiMenus, searchQuery, selectedCategory]);

  const kedaiCategories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(effectiveKedaiMenus.map((m) => m.category)));
    return ['Semua', ...cats];
  }, [effectiveKedaiMenus]);

  // 3. RitelQu Data
  const ritelFilteredProducts = useMemo<RitelProduct[]>(() => {
    return effectiveRitelProducts.filter((p: RitelProduct) => {
      const isOnline = p.showInOnlineStore !== false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      return isOnline && matchesSearch && matchesCat;
    });
  }, [effectiveRitelProducts, searchQuery, selectedCategory]);

  const ritelCategories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(effectiveRitelProducts.map((p) => p.category)));
    return ['Semua', ...cats];
  }, [effectiveRitelProducts]);

  // 4. KlinikQu Data
  const klinikFilteredMeds = useMemo<KlinikObat[]>(() => {
    return effectiveKlinikMeds.filter((m: KlinikObat) => {
      const isOnline = m.showInOnlineStore !== false;
      const matchesSearch = m.namaObat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.kodeObat.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Semua' || m.kategori === selectedCategory;
      return isOnline && matchesSearch && matchesCat;
    });
  }, [effectiveKlinikMeds, searchQuery, selectedCategory]);

  const klinikCategories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(effectiveKlinikMeds.map((m) => m.kategori)));
    return ['Semua', ...cats];
  }, [effectiveKlinikMeds]);

  // 5. TitipQu Data
  const titipFilteredRecipes = useMemo<ProductRecipe[]>(() => {
    return effectiveTitipRecipes.filter((r: ProductRecipe) => {
      const isOnline = r.showInOnlineStore !== false;
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Semua' || r.category === selectedCategory;
      const matchesVendor = selectedVendor === 'Semua' || r.vendorName === selectedVendor;
      return isOnline && matchesSearch && matchesCat && matchesVendor;
    });
  }, [effectiveTitipRecipes, searchQuery, selectedCategory, selectedVendor]);

  const titipCategories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(effectiveTitipRecipes.map((r) => r.category)));
    return ['Semua', ...cats];
  }, [effectiveTitipRecipes]);

  const titipVendors = useMemo<string[]>(() => {
    const vendors = Array.from(new Set(effectiveTitipRecipes.map((r) => r.vendorName).filter(Boolean))) as string[];
    return ['Semua', ...vendors];
  }, [effectiveTitipRecipes]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-24 text-slate-800">
      {/* 1. PUBLIC TOP HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        {/* Safe Area Top Native Buffer for Mobile Phone Status Bar */}
        <div 
          style={{ height: 'max(env(safe-area-inset-top, 0px), 3rem)' }}
          className="shrink-0 w-full select-none pointer-events-none md:hidden bg-slate-900"
        />
        {/* Top Mini Bar with Admin Back Link & Share */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          {onBackToAdmin ? (
            <button
              onClick={onBackToAdmin}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dasbor Admin</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-slate-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Katalog Digital UsahaQu</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Salin Tautan Toko"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              {copyToast ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="text-[11px] font-medium">{copyToast ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
            <button
              onClick={handleShareLink}
              title="Bagikan Tautan Toko"
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Store Profile Hero Banner */}
        <div className="px-4 pt-4 pb-3 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg border border-emerald-400/40 shrink-0">
              {activeModule === 'kedai' ? '☕' :
               activeModule === 'klinik' ? '🩺' :
               activeModule === 'ritel' ? '🛒' :
               activeModule === 'titip' ? '📦' : '🔧'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight truncate">
                  {storeConfig.storeName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    storeConfig.isOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${storeConfig.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {storeConfig.isOpen ? 'Buka Sekarang' : 'Tutup Sementara'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {storeConfig.tagline}
              </p>

              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{storeConfig.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{storeConfig.operationalHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Bar */}
          {storeConfig.announcement && (
            <div className="mt-3 bg-emerald-950/60 border border-emerald-600/40 rounded-xl px-3 py-1.5 text-xs text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{storeConfig.announcement}</span>
            </div>
          )}
        </div>

        {/* 2. ECOSYSTEM MODULE SWITCHER TABS (Browse Different Store Sections) */}
        <div className="bg-slate-950 px-3 py-1.5 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleSwitchModule('bengkel')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'bengkel'
                ? 'bg-[#008952] text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3 h-3" />
            <span>BengkelQu</span>
          </button>

          <button
            onClick={() => handleSwitchModule('kedai')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'kedai'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-3 h-3" />
            <span>KedaiQu</span>
          </button>

          <button
            onClick={() => handleSwitchModule('ritel')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'ritel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            <span>RitelQu</span>
          </button>

          <button
            onClick={() => handleSwitchModule('klinik')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'klinik'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            <span>KlinikQu</span>
          </button>

          <button
            onClick={() => handleSwitchModule('titip')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'titip'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>TitipQu</span>
          </button>
        </div>
      </header>

      {/* 3. SEARCH & SUB-TABS BAR */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 sticky top-[138px] z-20 shadow-xs">
        {/* Module Sub-Tabs for BengkelQu & KlinikQu */}
        {activeModule === 'bengkel' && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setActiveSubTab('items')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeSubTab === 'items'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⚙️ Suku Cadang & Oli
            </button>
            <button
              onClick={() => setActiveSubTab('services')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeSubTab === 'services'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔧 Jasa Servis & Booking
            </button>
          </div>
        )}

        {activeModule === 'klinik' && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setActiveSubTab('items')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeSubTab === 'items'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              💊 Obat & Produk Apotek
            </button>
            <button
              onClick={() => setActiveSubTab('services')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeSubTab === 'services'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🩺 Jadwal Praktek Dokter
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari menu / produk di ${storeConfig.storeName}...`}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        {activeSubTab === 'items' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
            {(activeModule === 'bengkel' ? bengkelCategories :
              activeModule === 'kedai' ? kedaiCategories :
              activeModule === 'ritel' ? ritelCategories :
              activeModule === 'klinik' ? klinikCategories :
              titipCategories).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* TitipQu Vendor Filter Pill */}
        {activeModule === 'titip' && titipVendors.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 border-t border-slate-100 mt-2">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Vendor:</span>
            {titipVendors.map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVendor(v)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedVendor === v
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. MAIN PRODUCT CATALOG CONTENT */}
      <main className="flex-1 px-4 py-4 max-w-4xl mx-auto w-full">
        {/* =================================================================== */}
        {/* MODUL 1: BENGKELQU OTOMOTIF */}
        {/* =================================================================== */}
        {activeModule === 'bengkel' && (
          <>
            {activeSubTab === 'items' ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Suku Cadang & Oli Motor ({bengkelSparepartsList.length} Item)
                  </h2>
                </div>

                {bengkelSparepartsList.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                    <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Produk tidak ditemukan</p>
                    <p className="text-xs text-slate-500 mt-0.5">Coba gunakan kata kunci pencarian lain.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {bengkelSparepartsList.map((part) => (
                      <div
                        key={part.id}
                        className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2 flex items-center justify-center">
                            {part.photoUrl ? (
                              <img
                                src={part.photoUrl}
                                alt={part.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-300">
                                <Wrench className="w-8 h-8" />
                                <span className="text-[10px] font-bold mt-1 text-slate-400">BengkelQu</span>
                              </div>
                            )}
                            <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold uppercase bg-slate-900/80 text-white px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                              {part.category.split(' ')[0]}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                            {part.brand}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 leading-snug mt-1 line-clamp-2">
                            {part.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{part.code}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Harga</span>
                            <span className="text-xs font-extrabold text-slate-900">
                              Rp {part.sellPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              addToCart({
                                id: part.id,
                                name: part.name,
                                price: part.sellPrice,
                                qty: 1,
                                unit: part.unit,
                                photoUrl: part.photoUrl,
                                type: 'product'
                              })
                            }
                            className="w-8 h-8 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer"
                            title="Tambah ke Keranjang"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Bengkel Service Packages & Booking Form */
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Pilihan Paket Servis Cepat & Berkala
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Pilih paket servis di bawah ini untuk booking jadwal tanpa antri di bengkel:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUICK_SERVICE_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ⏱️ {pkg.timeEst}
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            Rp {pkg.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-2">
                          {pkg.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Pengecekan komponen, pembersihan menyeluruh, dan garansi pengerjaan bengkel resmi.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setBookingModalItem({
                              id: pkg.id,
                              name: pkg.name,
                              price: pkg.price,
                              type: 'service'
                            });
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-colors cursor-pointer"
                        >
                          Booking Jadwal Servis
                        </button>
                        <button
                          onClick={() =>
                            addToCart({
                              id: pkg.id,
                              name: pkg.name,
                              price: pkg.price,
                              qty: 1,
                              type: 'service'
                            })
                          }
                          className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* =================================================================== */}
        {/* MODUL 2: KEDAIQU F&B / CAFE */}
        {/* =================================================================== */}
        {activeModule === 'kedai' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Daftar Menu Kuliner & Minuman ({kedaiFilteredMenus.length} Menu)
              </h2>
            </div>

            {kedaiFilteredMenus.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Menu belum tersedia</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {kedaiFilteredMenus.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative w-full aspect-square rounded-xl bg-amber-50 border border-amber-100 overflow-hidden mb-2 flex items-center justify-center">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">{item.imageIcon || '☕'}</span>
                        )}
                        {item.isPopular && (
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                            <Flame className="w-2.5 h-2.5" /> Best Seller
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug mt-1 line-clamp-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Harga</span>
                        <span className="text-xs font-extrabold text-slate-900">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setVariantModalItem(item);
                          setSelectedTemp('Ice');
                          setSelectedSpicy(1);
                          setVariantItemNote('');
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pesan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODUL 3: RITELQU SWALAYAN & TOKO */}
        {/* =================================================================== */}
        {activeModule === 'ritel' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Etalase Produk Ritel ({ritelFilteredProducts.length} Produk)
              </h2>
            </div>

            {ritelFilteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Produk ritel tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ritelFilteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2 flex items-center justify-center">
                        {prod.photoUrl ? (
                          <img
                            src={prod.photoUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <ShoppingCart className="w-8 h-8" />
                            <span className="text-[10px] font-bold mt-1 text-slate-400">RitelQu</span>
                          </div>
                        )}
                        <span className={`absolute bottom-1.5 right-1.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          prod.stock > 5 ? 'bg-emerald-500 text-white' : prod.stock > 0 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {prod.stock > 0 ? `Stok: ${prod.stock}` : 'Habis'}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md">
                        {prod.category}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug mt-1 line-clamp-2">
                        {prod.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Satuan: {prod.unit}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Harga</span>
                        <span className="text-xs font-extrabold text-slate-900">
                          Rp {prod.sellPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          addToCart({
                            id: prod.id,
                            name: prod.name,
                            price: prod.sellPrice,
                            qty: 1,
                            unit: prod.unit,
                            photoUrl: prod.photoUrl,
                            type: 'product'
                          })
                        }
                        disabled={prod.stock <= 0}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-all cursor-pointer ${
                          prod.stock > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-90'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODUL 4: KLINIKQU KESEHATAN & APOTEK */}
        {/* =================================================================== */}
        {activeModule === 'klinik' && (
          <>
            {activeSubTab === 'items' ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Katalog Obat & Vitamin Apotek ({klinikFilteredMeds.length} Produk)
                  </h2>
                </div>

                {klinikFilteredMeds.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                    <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Obat tidak ditemukan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {klinikFilteredMeds.map((med) => (
                      <div
                        key={med.id}
                        className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative w-full aspect-square rounded-xl bg-teal-50 border border-teal-100 overflow-hidden mb-2 flex items-center justify-center">
                            {med.photoUrl ? (
                              <img
                                src={med.photoUrl}
                                alt={med.namaObat}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-teal-400">
                                <Pill className="w-8 h-8" />
                                <span className="text-[10px] font-bold mt-1 text-teal-600">Apotek</span>
                              </div>
                            )}
                          </div>

                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-md">
                            {med.kategori}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 leading-snug mt-1 line-clamp-2">
                            {med.namaObat}
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">{med.bentukSediaan} ({med.satuan})</p>
                          {med.aturanStandar && (
                            <p className="text-[9px] text-slate-400 mt-1 line-clamp-1 italic">
                              {med.aturanStandar}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Harga</span>
                            <span className="text-xs font-extrabold text-slate-900">
                              Rp {med.hargaJual.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              addToCart({
                                id: med.id,
                                name: med.namaObat,
                                price: med.hargaJual,
                                qty: 1,
                                unit: med.satuan,
                                photoUrl: med.photoUrl,
                                type: 'medicine'
                              })
                            }
                            className="w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Doctors consultation reservation */
              <div className="space-y-3">
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                  <h3 className="text-xs font-black text-teal-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    Reservasi Konsultasi Dokter Klinik
                  </h3>
                  <p className="text-xs text-teal-800 mt-1">
                    Pilih jadwal dokter dan poli untuk reservasi nomor antrian secara online:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {klinikDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
                            👨‍⚕️
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {doc.nama}, {doc.gelar}
                            </h4>
                            <p className="text-xs text-teal-700 font-semibold">{doc.spesialisasi} - {doc.poli}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SIP: {doc.noSIP}</p>
                          </div>
                        </div>

                        <div className="mt-3 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 flex items-center justify-between">
                          <span>Biaya Registrasi & Konsultasi:</span>
                          <span className="font-extrabold text-slate-900">Rp 50.000</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setBookingModalItem({
                              id: doc.id,
                              name: `Konsultasi ${doc.nama} (${doc.poli})`,
                              price: 50000,
                              type: 'consultation'
                            });
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold text-center transition-colors cursor-pointer"
                        >
                          Reservasi Jadwal Dokter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* =================================================================== */}
        {/* MODUL 5: TITIPQU KONSINYASI & UMKM */}
        {/* =================================================================== */}
        {activeModule === 'titip' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Katalog Produk Titipan & Reseller ({titipFilteredRecipes.length} Produk)
              </h2>
            </div>

            {titipFilteredRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Produk titipan tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {titipFilteredRecipes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative w-full aspect-square rounded-xl bg-amber-50 border border-amber-100 overflow-hidden mb-2 flex items-center justify-center">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-amber-500">
                            <Package className="w-8 h-8" />
                            <span className="text-[10px] font-bold mt-1 text-amber-700">TitipQu</span>
                          </div>
                        )}
                        {item.vendorName && (
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold uppercase bg-amber-600 text-white px-1.5 py-0.5 rounded-md shadow-xs">
                            {item.vendorName}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug mt-1 line-clamp-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">Satuan: {item.unit}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Eceran</span>
                          <span className="text-xs font-extrabold text-slate-900">
                            Rp {item.sellingPriceRetail.toLocaleString('id-ID')}
                          </span>
                        </div>
                        {item.resellerPrice > 0 && (
                          <div className="text-right">
                            <span className="text-[9px] text-amber-600 block font-semibold">Reseller</span>
                            <span className="text-[11px] font-bold text-amber-700">
                              Rp {item.resellerPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.sellingPriceRetail,
                            qty: 1,
                            unit: item.unit,
                            photoUrl: item.photoUrl,
                            type: 'product'
                          })
                        }
                        className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Beli / Titip Pesan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. FLOATING BOTTOM CART BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Total ({totalCartCount} item)</span>
                <span className="text-base font-black text-slate-900 leading-none">
                  Rp {cartSubtotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span>Lihat Keranjang</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL VARIANT SELECTION (KEDAIQU F&B) */}
      {variantModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 overflow-hidden flex items-center justify-center text-2xl shrink-0">
                  {variantModalItem.photoUrl ? (
                    <img src={variantModalItem.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{variantModalItem.imageIcon || '☕'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{variantModalItem.name}</h3>
                  <span className="text-xs font-black text-amber-700">
                    Rp {variantModalItem.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setVariantModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option: Suhu / Temperature */}
            <div className="mt-4">
              <label className="text-xs font-bold text-slate-700 block mb-2">Varian Penyajian:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemp('Ice')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTemp === 'Ice'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ❄️ Dingin (Ice)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTemp('Hot')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTemp === 'Hot'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🔥 Panas (Hot)
                </button>
              </div>
            </div>

            {/* Option: Level Pedas (Makanan) */}
            <div className="mt-4">
              <label className="text-xs font-bold text-slate-700 block mb-2">Tingkat Pedas / Manis:</label>
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                {[0, 1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedSpicy(lvl)}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedSpicy === lvl
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl === 0 ? 'Level 0' : `Level ${lvl} 🌶️`}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Note */}
            <div className="mt-4">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Catatan Khusus (Opsional):</label>
              <input
                type="text"
                value={variantItemNote}
                onChange={(e) => setVariantItemNote(e.target.value)}
                placeholder="Misal: Less sugar / jangan pakai seledri..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const variantLabel = `${selectedTemp}, Pedas Lv.${selectedSpicy}`;
                  addToCart({
                    id: variantModalItem.id,
                    name: variantModalItem.name,
                    price: variantModalItem.price,
                    qty: 1,
                    variant: variantLabel,
                    notes: variantItemNote.trim(),
                    photoUrl: variantModalItem.photoUrl,
                    type: 'product'
                  });
                  setVariantModalItem(null);
                }}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL BOOKING SCHEDULE (BENGKELQU / KLINIKQU) */}
      {bookingModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{bookingModalItem.name}</h3>
                <span className="text-xs font-black text-emerald-700">
                  Rp {bookingModalItem.price.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={() => setBookingModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Tanggal Kunjungan:</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Jam Kedatangan:</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="08:30">08:30 WIB (Pagi)</option>
                  <option value="09:30">09:30 WIB</option>
                  <option value="10:30">10:30 WIB</option>
                  <option value="11:30">11:30 WIB</option>
                  <option value="13:30">13:30 WIB (Siang)</option>
                  <option value="14:30">14:30 WIB</option>
                  <option value="15:30">15:30 WIB (Sore)</option>
                </select>
              </div>

              {bookingModalItem.type === 'service' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Polisi / Plat Motor:</label>
                    <input
                      type="text"
                      value={bookingPlate}
                      onChange={(e) => setBookingPlate(e.target.value.toUpperCase())}
                      placeholder="Misal: D 1234 ABC"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Keluhan Tambahan:</label>
                    <input
                      type="text"
                      value={bookingComplaint}
                      onChange={(e) => setBookingComplaint(e.target.value)}
                      placeholder="Misal: Rem belakang bunyi, tarikan berat..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Keluhan / Gejala Utama:</label>
                  <input
                    type="text"
                    value={bookingComplaint}
                    onChange={(e) => setBookingComplaint(e.target.value)}
                    placeholder="Misal: Batuk demam 3 hari, sakit tenggorokan..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  const variantDesc = `Jadwal: ${bookingDate} pk ${bookingTime} WIB ${bookingPlate ? `(Plat: ${bookingPlate})` : ''}`;
                  addToCart({
                    id: bookingModalItem.id,
                    name: bookingModalItem.name,
                    price: bookingModalItem.price,
                    qty: 1,
                    variant: variantDesc,
                    notes: bookingComplaint.trim(),
                    type: bookingModalItem.type
                  });
                  setBookingModalItem(null);
                  setIsCartOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Jadwal ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. SLIDE-OVER CHECKOUT DRAWER & WHATSAPP SENDER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Top Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black tracking-tight">Keranjang Belanja</h3>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {totalCartCount} item
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Item List */}
              <div className="space-y-2.5">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.id}-${item.variant}-${idx}`}
                    className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-start gap-2.5"
                  >
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0 text-sm">
                        📦
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                        {item.name}
                      </h4>
                      {item.variant && (
                        <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          {item.variant}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          "{item.notes}"
                        </p>
                      )}
                      <span className="text-xs font-extrabold text-slate-900 block mt-1">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Qty stepper */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, -1, item.variant)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, 1, item.variant)}
                        className="w-6 h-6 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-700 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id, item.variant)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Type Selector */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-2">Tipe Pengambilan / Layanan:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeModule === 'kedai' && (
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        orderType === 'dine_in'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      🍽️ Dine-in (Meja)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      orderType === 'takeaway'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    🛍️ Takeaway (Bungkus)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      orderType === 'delivery'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    🛵 Pesan Antar
                  </button>
                  {activeModule === 'bengkel' && (
                    <button
                      type="button"
                      onClick={() => setOrderType('booking_service')}
                      className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        orderType === 'booking_service'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      🔧 Booking Servis
                    </button>
                  )}
                </div>

                {orderType === 'dine_in' && (
                  <div className="mt-3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Nomor Meja Anda:</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Contoh: Meja 05"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div className="mt-3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Alamat Pengiriman Lengkap:</label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Customer Contact Details */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800">Data Pemesan (Wajib Diisi):</h4>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Nomor WhatsApp Aktif:</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Catatan Tambahan (Opsional):</label>
                  <input
                    type="text"
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    placeholder="Catatan untuk kasir / toko..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Bottom Checkout Action */}
            <div className="p-4 bg-white border-t border-slate-200 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Total Pembayaran:</span>
                <span className="text-lg font-black text-slate-900">
                  Rp {cartSubtotal.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={handleProceedWhatsApp}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Pesan Sekarang via WhatsApp</span>
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Pesanan akan langsung diteruskan ke WhatsApp resmi toko untuk konfirmasi pembayaran & penyiapan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
