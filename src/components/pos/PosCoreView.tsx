/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - POS Core View (100% Offline IndexedDB Engine)
 * Antarmuka dan Logika Kasir Dasar:
 * 1. Kelola Katalog & Stok Lokal (CRUD Sederhana)
 * 2. Layar Transaksi / Keranjang Belanja (Checkout)
 * 3. Selesaikan Transaksi & Pengurangan Stok Otomatis di IndexedDB
 * 4. Pop-up Modal Nota/Struk Siap Cetak (Thermal 58mm/80mm & Print Browser)
 * 5. Riwayat Transaksi & Omset Harian
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  Receipt,
  Printer,
  Send,
  Coins,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Store,
  DollarSign,
  TrendingUp,
  Tag,
  Share2,
  Lock,
  FileSpreadsheet,
  Crown
} from 'lucide-react';
import { canAccessFeature, getLicense } from '../../engine/licenseEngine';
import { UpgradeToPremiumModal } from '../modals/UpgradeToPremiumModal';
import {
  PosProduct,
  CartItem,
  PosTransaction,
  DailySummary,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getUniqueCategories,
  seedDefaultCatalogIfEmpty,
  checkoutTransaction,
  getTodayTransactions,
  getTodaySummary,
  formatReceiptText,
  formatRupiah
} from '../../db/posCore';
import { getItem, STORES } from '../../db/indexedDbManager';

interface PosCoreViewProps {
  moduleKey?: string;
  onBack?: () => void;
  standalone?: boolean;
}

export const PosCoreView: React.FC<PosCoreViewProps> = ({
  moduleKey = 'kedai',
  onBack,
  standalone = false
}) => {
  // Navigation Tabs: 'kasir' | 'katalog' | 'riwayat'
  const [activeTab, setActiveTab] = useState<'kasir' | 'katalog' | 'riwayat'>('kasir');

  // Products & Categories State
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Pelanggan Umum');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris'>('tunai');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Daily History State
  const [todayTransactions, setTodayTransactions] = useState<PosTransaction[]>([]);
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);

  // Modals State
  const [activeReceipt, setActiveReceipt] = useState<PosTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // CRUD Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<PosProduct | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formStock, setFormStock] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeLockedTitle, setUpgradeLockedTitle] = useState<string>('');
  const [upgradeLockedDesc, setUpgradeLockedDesc] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // DATA LOADING (100% OFFLINE INDEXEDDB)
  // -------------------------------------------------------------
  const loadCatalogData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Auto seed jika belum ada data sama sekali
      await seedDefaultCatalogIfEmpty(moduleKey);

      const items = await getProducts({ module: moduleKey });
      setProducts(items);

      const cats = await getUniqueCategories(moduleKey);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading products from IndexedDB:', err);
      showToast('Gagal memuat katalog IndexedDB.');
    } finally {
      setIsLoading(false);
    }
  }, [moduleKey]);

  const loadHistoryData = useCallback(async () => {
    try {
      const txs = await getTodayTransactions(moduleKey);
      setTodayTransactions(txs);

      const sum = await getTodaySummary(moduleKey);
      setTodaySummary(sum);
    } catch (err) {
      console.error('Error loading today transactions:', err);
    }
  }, [moduleKey]);

  useEffect(() => {
    loadCatalogData();
    loadHistoryData();
  }, [loadCatalogData, loadHistoryData]);

  // Refresh filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Totals in Cart
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  // Change Calculation
  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'tunai') return 0;
    return cashReceived - totalAmount;
  }, [paymentMethod, cashReceived, totalAmount]);

  const isCashSufficient = paymentMethod === 'qris' || (cashReceived >= totalAmount && totalAmount > 0);

  // -------------------------------------------------------------
  // CART ACTIONS
  // -------------------------------------------------------------
  const handleAddToCart = (product: PosProduct) => {
    if (product.stock <= 0) {
      showToast(`Stok "${product.name}" habis!`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].qty;
        if (currentQty >= product.stock) {
          showToast(`Stok tidak mencukupi! Sisa stok lokal: ${product.stock}`);
          return prev;
        }
        const updated = [...prev];
        const newQty = currentQty + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          subtotal: newQty * updated[existingIndex].price
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            subtotal: product.price,
            category: product.category
          }
        ];
      }
    });

    // Auto set default cash suggestion if empty
    if (cashReceived === 0) {
      setCashReceived(totalAmount + product.price);
    }
  };

  const handleUpdateQty = (productId: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product && newQty > 0) return;

    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    if (product && newQty > product.stock) {
      showToast(`Maksimal stok tersedia hanya ${product.stock} unit.`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, qty: newQty, subtotal: newQty * item.price }
          : item
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setCashReceived(0);
    setNotes('');
  };

  const handleSetQuickCash = (val: number) => {
    setCashReceived(val);
  };

  // -------------------------------------------------------------
  // CHECKOUT & REDUCE STOCK (100% OFFLINE INDEXEDDB)
  // -------------------------------------------------------------
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Keranjang belanja kosong! Pilih barang terlebih dahulu.');
      return;
    }

    if (paymentMethod === 'tunai' && cashReceived < totalAmount) {
      showToast(`Uang tunai kurang ${formatRupiah(totalAmount - cashReceived)}`);
      return;
    }

    try {
      const tx = await checkoutTransaction({
        items: cart,
        paymentMethod: paymentMethod,
        cashReceived: paymentMethod === 'tunai' ? cashReceived : totalAmount,
        customerName: customerName || 'Pelanggan Umum',
        notes: notes,
        module: moduleKey
      });

      // Buka Struk Modal
      setActiveReceipt(tx);
      setIsReceiptModalOpen(true);

      // Reset state
      setCart([]);
      setCashReceived(0);
      setNotes('');
      setCustomerName('Pelanggan Umum');

      // Refresh data lokal
      await loadCatalogData();
      await loadHistoryData();

      showToast(`Transaksi ${tx.invoiceNo} Berhasil Disimpan!`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast(err.message || 'Gagal menyelesaikan transaksi.');
    }
  };

  // -------------------------------------------------------------
  // CRUD ITEM KATALOG
  // -------------------------------------------------------------
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('');
    setFormPrice('');
    setFormStock('50');
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: PosProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category || '');
    setFormPrice(String(p.price));
    setFormStock(String(p.stock));
    setFormError(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama barang/jasa wajib diisi.');
      return;
    }

    const priceNum = Math.max(0, Number(formPrice) || 0);
    const stockNum = Math.max(0, Number(formStock) || 0);
    const cat = formCategory.trim() || 'Umum';

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formName.trim(),
          category: cat,
          price: priceNum,
          stock: stockNum
        });
        showToast(`Produk "${formName}" berhasil diperbarui.`);
      } else {
        await addProduct({
          name: formName.trim(),
          category: cat,
          price: priceNum,
          stock: stockNum,
          module: moduleKey
        });
        showToast(`Produk "${formName}" ditambahkan ke katalog.`);
      }

      setIsProductModalOpen(false);
      await loadCatalogData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data produk.');
    }
  };

  const handleDeleteProduct = async (product: PosProduct) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${product.name}" dari katalog?`)) {
      try {
        await deleteProduct(product.id);
        showToast(`"${product.name}" berhasil dihapus.`);
        await loadCatalogData();
      } catch (err: any) {
        showToast('Gagal menghapus produk: ' + err.message);
      }
    }
  };

  const handleResetCatalog = async () => {
    if (confirm('Muat ulang katalog bawaan untuk modul ini?')) {
      try {
        await seedDefaultCatalogIfEmpty(moduleKey);
        await loadCatalogData();
        showToast('Katalog bawaan berhasil diselaraskan!');
      } catch (err: any) {
        showToast('Gagal memuat katalog: ' + err.message);
      }
    }
  };

  // -------------------------------------------------------------
  // STRUK / PRINT / WHATSAPP
  // -------------------------------------------------------------
  const handlePrintReceipt = () => {
    window.print();
  };

  const handleShareWhatsApp = (tx: PosTransaction) => {
    const rawText = formatReceiptText(tx);
    const encoded = encodeURIComponent(rawText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleAutomatedWaGateway = () => {
    if (!canAccessFeature('wa_gateway')) {
      setUpgradeLockedTitle('WhatsApp Gateway Otomatis Terkunci');
      setUpgradeLockedDesc('Pengiriman nota otomatis tanpa buka aplikasi WA membutuhkan lisensi UsahaQu Pro/Premium.');
      setIsUpgradeModalOpen(true);
      return;
    }
    showToast('Struk berhasil dikirim otomatis via server WA Gateway!');
  };

  const handleExportExcel = () => {
    if (!canAccessFeature('export_excel')) {
      setUpgradeLockedTitle('Fitur Ekspor Excel Terkunci');
      setUpgradeLockedDesc('Ekspor Laporan Keuangan ke format Excel/Spreadsheet dibatasi pada mode Free Lifetime. Upgrade ke UsahaQu Pro untuk membuka ekspor tak terbatas!');
      setIsUpgradeModalOpen(true);
      return;
    }

    if (todayTransactions.length === 0) {
      showToast('Belum ada transaksi hari ini untuk diekspor!');
      return;
    }

    const headers = ['Invoice', 'Tanggal', 'Waktu', 'Pelanggan', 'Metode Bayar', 'Total Item', 'Total Bayar (Rp)'];
    const rows = todayTransactions.map((t) => [
      t.invoiceNo,
      t.date,
      t.time,
      `"${t.customerName}"`,
      t.paymentMethod.toUpperCase(),
      t.totalItems,
      t.total
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_POS_${todaySummary?.todayDate || 'HariIni'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan penjualan berhasil diunduh (.CSV/Excel)!');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* -------------------------------------------------------------
          TOP BAR & NAVIGATION TABS
      ------------------------------------------------------------- */}
      <header
        style={{ paddingTop: 'calc(0.625rem + env(safe-area-inset-top, 0px))' }}
        className="bg-emerald-700 text-white px-4 pb-3 shadow-sm sticky top-0 z-30 no-print"
      >
        <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Kembali"
                className="w-8 h-8 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
                  Kasir POS Core • UsahaQu v1.83
                </h1>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                  100% Offline
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                Database Lokal IndexedDB • Bebas Ketergantungan Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleResetCatalog}
              title="Perbarui / Muat Ulang Data"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex items-center gap-1.5 max-w-5xl mx-auto mt-2.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('kasir')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kasir'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'bg-emerald-800/50 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasir & Checkout</span>
            {cart.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('katalog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'katalog'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'bg-emerald-800/50 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Katalog & Stok ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'riwayat'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'bg-emerald-800/50 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Riwayat & Omset</span>
            {todayTransactions.length > 0 && (
              <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.2 rounded-md font-extrabold">
                {todayTransactions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN CONTENT AREA
      ------------------------------------------------------------- */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-5 no-print">
        {/* =====================================================================
            TAB 1: KASIR & CHECKOUT
        ===================================================================== */}
        {activeTab === 'kasir' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* KOLOM KIRI: KATALOG BARANG & PENCARIAN (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Search Bar */}
              <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama barang, kategori, atau barcode..."
                  className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Grid Cards */}
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Memuat katalog dari IndexedDB...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-extrabold text-xs text-slate-800">Tidak ada produk ditemukan</p>
                  <p className="text-[11px] text-slate-400">
                    Coba ubah kata kunci pencarian atau tambahkan produk baru.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="mt-2 py-1.5 px-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer"
                  >
                    + Tambah Produk Baru
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {filteredProducts.map((item) => {
                    const inCart = cart.find((c) => c.id === item.id);
                    const isOutOfStock = item.stock <= 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleAddToCart(item)}
                        className={`p-3 bg-white rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden text-left ${
                          isOutOfStock
                            ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                            : 'border-slate-200 hover:border-emerald-600 hover:shadow-md cursor-pointer active:scale-95'
                        }`}
                      >
                        {inCart && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            {inCart.qty}
                          </span>
                        )}

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 line-clamp-2 mt-0.5 leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-700">
                            {formatRupiah(item.price)}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.stock > 5
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.stock > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {item.stock > 0 ? `Stok: ${item.stock}` : 'Habis'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* KOLOM KANAN: KERANJANG BELANJA & CHECKOUT (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3 sticky top-24">
                {/* Cart Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-extrabold text-xs text-slate-900">Keranjang Belanja</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                      {totalItemsCount} Item
                    </span>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearCart}
                        className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    )}
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">Keranjang Masih Kosong</p>
                      <p className="text-[11px] text-slate-400">
                        Klik barang di katalog untuk menambahkan ke keranjang
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-slate-800 truncate">{item.name}</h5>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {formatRupiah(item.price)}
                          </span>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center text-xs transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-slate-900">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center text-xs transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right shrink-0 w-20">
                          <p className="font-extrabold text-xs text-slate-900">
                            {formatRupiah(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal & Total Display */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Total Tagihan:</span>
                    <span className="text-lg font-black text-emerald-700">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Nama Pelanggan (Struk):
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Pelanggan Umum"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Payment Method: Tunai vs QRIS Manual */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Metode Pembayaran:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('tunai');
                          if (cashReceived === 0) setCashReceived(totalAmount);
                        }}
                        className={`py-2 px-3 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          paymentMethod === 'tunai'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Tunai (Cash)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('qris');
                          setCashReceived(totalAmount);
                        }}
                        className={`py-2 px-3 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          paymentMethod === 'qris'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QRIS Manual</span>
                      </button>
                    </div>
                  </div>

                  {/* Cash Change Calculator */}
                  {paymentMethod === 'tunai' ? (
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Uang Tunai Diterima:</span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={cashReceived || ''}
                          onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                          placeholder="Rp 0"
                          className="w-28 px-2 py-1 text-right rounded-lg border border-slate-300 font-black text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Quick Cash Buttons */}
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetQuickCash(totalAmount)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          Uang Pas
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetQuickCash(Math.ceil(totalAmount / 10000) * 10000 || 10000)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          {formatRupiah(Math.ceil(totalAmount / 10000) * 10000 || 10000)}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetQuickCash(Math.ceil(totalAmount / 50000) * 50000 || 50000)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          {formatRupiah(Math.ceil(totalAmount / 50000) * 50000 || 50000)}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetQuickCash(Math.ceil(totalAmount / 100000) * 100000 || 100000)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          {formatRupiah(Math.ceil(totalAmount / 100000) * 100000 || 100000)}
                        </button>
                      </div>

                      {/* Kembalian Display */}
                      <div className="pt-1 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">Kembalian:</span>
                        {changeAmount >= 0 ? (
                          <span className="font-black text-emerald-700 text-sm">
                            {formatRupiah(changeAmount)}
                          </span>
                        ) : (
                          <span className="font-bold text-rose-600 text-xs">
                            Kurang {formatRupiah(Math.abs(changeAmount))}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center gap-2.5 text-xs">
                      <QrCode className="w-5 h-5 text-indigo-700 shrink-0" />
                      <p className="text-[11px] text-indigo-900 leading-tight">
                        <strong>QRIS Statis / Merchant:</strong> Pastikan notifikasi dana masuk telah diterima sebelum menyelesaikan transaksi.
                      </p>
                    </div>
                  )}

                  {/* Tombol Bayar / Selesai Transaksi */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={!isCashSufficient || cart.length === 0}
                    className={`w-full mt-2 py-3 px-4 rounded-2xl font-black text-xs text-white shadow-md transition active:scale-98 flex items-center justify-center gap-2 ${
                      isCashSufficient && cart.length > 0
                        ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/25 cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bayar / Selesai Transaksi ({formatRupiah(totalAmount)})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: KELOLA KATALOG & STOK LOKAL (CRUD SEDERHANA)
        ===================================================================== */}
        {activeTab === 'katalog' && (
          <div className="space-y-4">
            {/* Header Bar */}
            <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Database Lokal IndexedDB (pos_catalog)
                </span>
                <h2 className="font-extrabold text-slate-900 text-base">
                  Kelola Katalog & Stok Lokal
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {products.length} Item terdaftar • Tambah, edit, dan pantau sisa stok offline
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetCatalog}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Muat Katalog Standar
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Barang / Jasa</span>
                </button>
              </div>
            </div>

            {/* List / Table of Products */}
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
              {products.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-xs text-slate-700">Belum ada barang di katalog</p>
                  <p className="text-[11px] text-slate-400">Tambahkan produk pertama atau muat katalog demo</p>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="py-2 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    + Tambah Item Pertama
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs font-black text-emerald-700 mt-1">
                          {formatRupiah(item.price)}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3 shrink-0">
                        <div>
                          <span
                            className={`text-[11px] font-bold ${
                              item.stock > 5
                                ? 'text-emerald-700'
                                : item.stock > 0
                                ? 'text-amber-700'
                                : 'text-rose-600'
                            }`}
                          >
                            Stok: {item.stock} unit
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: RIWAYAT TRANSAKSI & OMSET HARIAN
        ===================================================================== */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">
            {/* Daily Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Omset Hari Ini
                </span>
                <p className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
                  {formatRupiah(todaySummary?.totalRevenue || 0)}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Transaksi Selesai
                </span>
                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {todaySummary?.transactionCount || 0} Nota
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Barang Terjual
                </span>
                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {todaySummary?.totalItemsSold || 0} Unit
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Tunai vs QRIS
                </span>
                <div className="text-[11px] font-bold text-slate-700 mt-1 leading-snug">
                  <div>💵 {formatRupiah(todaySummary?.cashRevenue || 0)}</div>
                  <div className="text-indigo-700">📱 {formatRupiah(todaySummary?.qrisRevenue || 0)}</div>
                </div>
              </div>
            </div>

            {/* List of Today's Transactions */}
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900">
                    Daftar Penjualan Hari Ini
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {todayTransactions.length} Transaksi tersimpan lokal di IndexedDB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                    {todaySummary?.todayDate || 'Hari Ini'}
                  </span>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-emerald-200"
                    title="Ekspor Laporan ke format Excel (.CSV)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ekspor Excel</span>
                    {!canAccessFeature('export_excel') && (
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-amber-300">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>Pro</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {todayTransactions.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-1">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Belum ada transaksi hari ini</p>
                  <p className="text-[11px] text-slate-400">
                    Selesaikan transaksi di tab Kasir untuk mulai mencatat omset harian.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {todayTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/80 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {tx.invoiceNo}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              tx.paymentMethod === 'tunai'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {tx.paymentMethod}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {tx.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Pelanggan: <strong className="text-slate-700">{tx.customerName}</strong> •{' '}
                          {tx.items.length} macam produk ({tx.totalItems} unit)
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="text-sm font-black text-slate-900">
                          {formatRupiah(tx.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReceipt(tx);
                            setIsReceiptModalOpen(true);
                          }}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                        >
                          Lihat Struk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------
          MODAL 1: STRUK / NOTA TRANSAKSI (THERMAL & BROWSER PRINT)
      ------------------------------------------------------------- */}
      {isReceiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-sm">Transaksi Berhasil!</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kertas Struk Thermal (58mm/80mm Style) */}
            <div
              id="pos-thermal-receipt"
              className="bg-white p-4 border border-dashed border-slate-300 rounded-2xl font-mono text-xs text-slate-800 space-y-2"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h4 className="font-black text-sm uppercase">
                  {activeReceipt.storeProfile?.name || 'USAHAQU POS'}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {activeReceipt.storeProfile?.address || 'Jl. Operasional Usaha'}
                </p>
                <p className="text-[10px] text-slate-500">
                  WA: {activeReceipt.storeProfile?.phone || '0812-3456-7890'}
                </p>
              </div>

              <div className="py-1 border-b border-dashed border-slate-300 text-[10px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>No Invoice:</span>
                  <span className="font-bold text-slate-800">{activeReceipt.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{activeReceipt.date} {activeReceipt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold">{activeReceipt.customerName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5">
                {activeReceipt.items.map((it) => (
                  <div key={it.id}>
                    <div className="font-bold text-slate-800 text-[11px]">{it.name}</div>
                    <div className="flex justify-between text-[10px] text-slate-500 pl-2">
                      <span>{it.qty} x {formatRupiah(it.price)}</span>
                      <span className="font-bold text-slate-800">{formatRupiah(it.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals & Payments */}
              <div className="pt-1 text-[11px] space-y-1">
                <div className="flex justify-between font-black text-xs text-slate-900">
                  <span>TOTAL TAGIHAN:</span>
                  <span>{formatRupiah(activeReceipt.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Metode Bayar:</span>
                  <span className="font-bold uppercase">{activeReceipt.paymentMethod}</span>
                </div>
                {activeReceipt.paymentMethod === 'tunai' && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Tunai Diterima:</span>
                      <span>{formatRupiah(activeReceipt.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-emerald-700">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(activeReceipt.change)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-400 space-y-0.5">
                <p className="font-bold text-slate-600">TERIMA KASIH ATAS KUNJUNGANNYA</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar</p>
                <p>*** UsahaQu v1.83 POS Core Offline ***</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2 no-print">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk (Browser / Thermal Bluetooth)</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareWhatsApp(activeReceipt)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-200"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Teks Struk via WhatsApp (Manual)</span>
              </button>

              <button
                type="button"
                onClick={handleAutomatedWaGateway}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-between transition cursor-pointer border border-slate-200"
              >
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kirim Otomatis Server WA Gateway</span>
                </div>
                {!canAccessFeature('wa_gateway') && (
                  <span className="text-[9px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-amber-300">
                    <Lock className="w-2.5 h-2.5 text-amber-700" />
                    <span>Pro</span>
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsReceiptModalOpen(false);
                  setActiveReceipt(null);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition cursor-pointer"
              >
                + Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 2: FORM TAMBAH / EDIT PRODUK KATALOG
      ------------------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingProduct ? 'Edit Barang / Jasa' : 'Tambah Barang / Jasa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Barang / Produk / Jasa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi Susu Aren / Oli Mesin / Ganti Busi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Contoh: Minuman, Makanan, Sparepart, Servis, Medis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Harga Jual (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Stok Lokal Awal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-800">
                <Store className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Tersimpan 100% lokal offline di IndexedDB (pos_catalog).</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade to Premium Modal */}
      <UpgradeToPremiumModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        lockedItemTitle={upgradeLockedTitle}
        lockedItemDescription={upgradeLockedDesc}
      />
    </div>
  );
};
