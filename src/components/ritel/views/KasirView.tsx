/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Barcode, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  PauseCircle, 
  Play, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Receipt, 
  User, 
  Tag, 
  Printer, 
  Check, 
  X, 
  ShoppingBag, 
  Clock, 
  AlertCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import { 
  RitelProduct, 
  CartItem, 
  HeldCart, 
  RitelTransaction, 
  RitelCustomer, 
  RitelStoreProfile 
} from '../RitelTypes';

interface KasirViewProps {
  products: RitelProduct[];
  customers: RitelCustomer[];
  transactions: RitelTransaction[];
  heldCarts: HeldCart[];
  profile: RitelStoreProfile;
  onCompleteTransaction: (tx: RitelTransaction) => void;
  onHoldCart: (held: HeldCart) => void;
  onRestoreHeldCart: (heldId: string) => void;
  onDeleteHeldCart: (heldId: string) => void;
}

export const KasirView: React.FC<KasirViewProps> = ({
  products,
  customers,
  transactions,
  heldCarts,
  profile,
  onCompleteTransaction,
  onHoldCart,
  onRestoreHeldCart,
  onDeleteHeldCart
}) => {
  // Active Sub-tab inside Kasir
  const [subTab, setSubTab] = useState<'pos' | 'held' | 'history'>('pos');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'debit' | 'bon'>('tunai');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<RitelTransaction | null>(null);

  // Hold Cart Modal
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdLabel, setHoldLabel] = useState('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto focus barcode input on mount & tab change
  useEffect(() => {
    if (subTab === 'pos') {
      barcodeInputRef.current?.focus();
    }
  }, [subTab]);

  // Categories list
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products for catalog shelf
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchQuery = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  // Add Product to Cart
  const handleAddToCart = (product: RitelProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = existing.qty + 1;
        const isWholesale = product.wholesalePrice > 0 && newQty >= product.wholesaleMinQty;
        const unitPrice = isWholesale ? product.wholesalePrice : product.sellPrice;
        const total = (unitPrice * newQty) - existing.discount;
        return prev.map((item) => 
          item.productId === product.id 
            ? { ...item, qty: newQty, isWholesale, sellPrice: unitPrice, total }
            : item
        );
      } else {
        const isWholesale = product.wholesalePrice > 0 && 1 >= product.wholesaleMinQty;
        const unitPrice = isWholesale ? product.wholesalePrice : product.sellPrice;
        return [
          ...prev,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            unit: product.unit,
            costPrice: product.costPrice,
            sellPrice: unitPrice,
            wholesalePrice: product.wholesalePrice,
            wholesaleMinQty: product.wholesaleMinQty,
            qty: 1,
            isWholesale,
            discount: 0,
            total: unitPrice
          }
        ];
      }
    });
  };

  // Barcode / SKU Scan submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const code = barcodeInput.trim().toLowerCase();
    const match = products.find(
      (p) => p.sku.toLowerCase() === code || p.name.toLowerCase() === code
    );

    if (match) {
      handleAddToCart(match);
      setBarcodeInput('');
    } else {
      alert(`Produk dengan Barcode / SKU "${barcodeInput}" tidak ditemukan di database.`);
    }
  };

  // Update item qty
  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => 
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            const isWholesale = item.wholesalePrice > 0 && newQty >= item.wholesaleMinQty;
            const unitPrice = isWholesale ? item.wholesalePrice : item.sellPrice;
            const total = (unitPrice * newQty) - item.discount;
            return { ...item, qty: newQty, isWholesale, total };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove from cart
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.sellPrice * item.qty), 0);
  const discountTotal = cart.reduce((acc, item) => acc + item.discount, 0);
  const grandTotal = Math.max(0, subtotal - discountTotal);
  const totalItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Quick cash buttons
  const cashChange = Math.max(0, cashGiven - grandTotal);

  // Handle Hold Current Cart
  const handleConfirmHoldCart = () => {
    if (cart.length === 0) return;
    const selectedCust = customers.find((c) => c.id === selectedCustomerId);
    const newHeld: HeldCart = {
      id: `held-${Date.now()}`,
      label: holdLabel.trim() || `Pelanggan #${heldCarts.length + 1} (${cart.length} item)`,
      heldAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      items: [...cart],
      customerId: selectedCustomerId || undefined,
      customerName: selectedCust?.name || undefined,
      note: paymentNote
    };
    onHoldCart(newHeld);
    setCart([]);
    setSelectedCustomerId('');
    setPaymentNote('');
    setHoldLabel('');
    setIsHoldModalOpen(false);
  };

  // Restore held cart
  const handleRestore = (held: HeldCart) => {
    setCart(held.items);
    if (held.customerId) setSelectedCustomerId(held.customerId);
    if (held.note) setPaymentNote(held.note);
    onDeleteHeldCart(held.id);
    setSubTab('pos');
  };

  // Process and finalize payment
  const handleFinalizePayment = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'tunai' && cashGiven < grandTotal) {
      alert('Nominal uang tunai yang diberikan masih kurang dari total belanja.');
      return;
    }
    if (paymentMethod === 'bon' && !selectedCustomerId) {
      alert('Untuk pembayaran Bon / Piutang, Anda wajib memilih data Pelanggan / Member.');
      return;
    }

    const selectedCust = customers.find((c) => c.id === selectedCustomerId);
    const invoiceNumber = `RQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx: RitelTransaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      timestamp: Date.now(),
      date: `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      cashierName: 'Kasir Utama',
      customerId: selectedCustomerId || undefined,
      customerName: selectedCust?.name || (paymentMethod === 'bon' ? 'Pelanggan Bon' : 'Pelanggan Umum'),
      items: cart.map((c) => ({
        productId: c.productId,
        sku: c.sku,
        name: c.name,
        unit: c.unit,
        costPrice: c.costPrice,
        price: c.sellPrice,
        qty: c.qty,
        isWholesale: c.isWholesale,
        discount: c.discount,
        total: c.total
      })),
      subtotal,
      discountTotal,
      grandTotal,
      paymentMethod,
      cashPaid: paymentMethod === 'tunai' ? cashGiven : grandTotal,
      cashChange: paymentMethod === 'tunai' ? cashChange : 0,
      status: paymentMethod === 'bon' ? 'bon_piutang' : 'lunas',
      notes: paymentNote
    };

    onCompleteTransaction(newTx);
    setActiveReceiptTx(newTx);
    setIsPayModalOpen(false);
    setIsReceiptModalOpen(true);

    // Reset current POS
    setCart([]);
    setSelectedCustomerId('');
    setCashGiven(0);
    setPaymentNote('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Kasir Sub-Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubTab('pos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'pos'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Kasir / Scan POS</span>
          </button>

          <button
            onClick={() => setSubTab('held')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer ${
              subTab === 'held'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Tahan Transaksi</span>
            {heldCarts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center">
                {heldCarts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'history'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Hari Ini</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              {transactions.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Scanner Ready (Tekan Enter pada Barcode)</span>
        </div>
      </div>

      {/* SUB-VIEW 1: Kasir & Scan POS */}
      {subTab === 'pos' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: Product Catalog & Fast Search Shelf */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-200">
            {/* Barcode & Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 mb-3">
              {/* Scan Barcode SKU Direct Input */}
              <form onSubmit={handleBarcodeSubmit} className="md:col-span-7 relative">
                <div className="relative">
                  <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1E3A8A]" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan Barcode SKU (Tekan Enter)..."
                    className="w-full pl-9 pr-20 py-2.5 bg-white border-2 border-indigo-100 focus:border-[#1E3A8A] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none shadow-xs transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1E3A8A] text-white rounded-lg text-[11px] font-bold hover:bg-blue-900 transition-colors cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </form>

              {/* Text Search Filter */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama barang / rak..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[#1E3A8A] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Category Quick Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 custom-scroll mb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid / Shelf */}
            <div className="flex-1 overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mb-2 stroke-1" />
                  <p>Tidak ada produk yang cocok dengan pencarian.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stock <= p.minStock;
                    const isOutOfStock = p.stock <= 0;

                    return (
                      <button
                        key={p.id}
                        onClick={() => !isOutOfStock && handleAddToCart(p)}
                        disabled={isOutOfStock}
                        className={`text-left p-3 rounded-xl border bg-white transition-all group flex flex-col justify-between relative cursor-pointer ${
                          isOutOfStock 
                            ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                            : 'hover:border-[#1E3A8A] hover:shadow-md border-slate-200 active:scale-[0.98]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                            <span className="truncate max-w-[90px]">{p.sku}</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-sans">
                              {p.shelfLocation || 'Rak'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#1E3A8A]">
                            {p.name}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400">Harga Jual</div>
                            <div className="text-xs font-extrabold text-[#1E3A8A]">
                              Rp {p.sellPrice.toLocaleString('id-ID')}
                            </div>
                            {p.wholesalePrice > 0 && (
                              <div className="text-[9px] text-[#F97316] font-medium">
                                Grosir: Rp {p.wholesalePrice.toLocaleString('id-ID')} (≥{p.wholesaleMinQty})
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isOutOfStock ? 'bg-rose-100 text-rose-700' :
                              isLowStock ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-50 text-emerald-700'
                            }`}>
                              Stok {p.stock} {p.unit}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Active Cart, Customer & Checkout Panel */}
          <div className="w-full lg:w-[390px] bg-white flex flex-col border-l border-slate-200 shrink-0">
            {/* Cart Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#1E3A8A]" />
                <h3 className="font-extrabold text-xs text-slate-800">
                  Keranjang Kasir ({totalItemCount} Item)
                </h3>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Customer Picker for Member & Bon */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                <User className="w-3 h-3 text-[#1E3A8A]" />
                Pelanggan / Member (Opsional):
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="">Pelanggan Umum (Tanpa Member)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.memberCode}) - Poin: {c.points} {c.debtBalance > 0 ? `| Bon: Rp ${c.debtBalance.toLocaleString('id-ID')}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <Barcode className="w-6 h-6 stroke-1" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Keranjang Masih Kosong</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scan barcode produk atau klik dari katalog barang di sebelah kiri.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {item.name}
                        </span>
                        {item.isWholesale && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            Grosir
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Rp {item.sellPrice.toLocaleString('id-ID')} / {item.unit}
                      </div>
                    </div>

                    {/* Qty Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateQty(item.productId, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-extrabold text-slate-900">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.productId, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Total & Delete */}
                    <div className="text-right pl-2">
                      <div className="text-xs font-extrabold text-[#1E3A8A]">
                        Rp {item.total.toLocaleString('id-ID')}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 mt-0.5 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Actions */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal ({totalItemCount} item):</span>
                <span className="font-semibold text-slate-800">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-xs text-rose-600">
                  <span>Diskon Promo:</span>
                  <span className="font-semibold">- Rp {discountTotal.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-xs font-extrabold text-slate-800">Total Bayar:</span>
                <span className="text-lg font-black text-[#1E3A8A]">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => setIsHoldModalOpen(true)}
                  className={`py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    cart.length === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <PauseCircle className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Tahan Transaksi</span>
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => {
                    setCashGiven(grandTotal);
                    setIsPayModalOpen(true);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    cart.length === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#1E3A8A] hover:bg-blue-900 active:scale-95 text-white shadow-blue-900/20'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Bayar Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Tahan / Pending Transaksi List */}
      {subTab === 'held' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Transaksi Ditahan (Pending Hold)
                </h3>
                <p className="text-xs text-slate-500">
                  Antrian transaksi yang sedang dipending sementara menunggu barang tambahan atau pelanggan lain.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-lg">
                {heldCarts.length} Tertahan
              </span>
            </div>

            {heldCarts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <PauseCircle className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <h4 className="text-xs font-bold text-slate-700">Tidak Ada Transaksi Ditahan</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gunakan tombol "Tahan Transaksi" di Kasir untuk menaruh keranjang ke antrian pending.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {heldCarts.map((held) => {
                  const heldTotal = held.items.reduce((sum, it) => sum + it.total, 0);
                  const heldCount = held.items.reduce((sum, it) => sum + it.qty, 0);

                  return (
                    <div
                      key={held.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#1E3A8A] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {held.label}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            {held.heldAt}
                          </span>
                        </div>

                        {held.customerName && (
                          <div className="text-[11px] text-indigo-700 font-semibold mb-2 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{held.customerName}</span>
                          </div>
                        )}

                        <div className="space-y-1 my-2 max-h-32 overflow-y-auto pr-1">
                          {held.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                              <span className="truncate max-w-[200px]">
                                {item.qty}x {item.name}
                              </span>
                              <span className="font-semibold text-slate-800">
                                Rp {item.total.toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                        <div>
                          <div className="text-[10px] text-slate-400">Total ({heldCount} item)</div>
                          <div className="text-xs font-black text-[#1E3A8A]">
                            Rp {heldTotal.toLocaleString('id-ID')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onDeleteHeldCart(held.id)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Transaksi Ditahan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRestore(held)}
                            className="px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 text-[#F97316] fill-current" />
                            <span>Lanjutkan Kasir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Riwayat Transaksi Kasir Hari Ini */}
      {subTab === 'history' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Riwayat Transaksi Penjualan
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar transaksi kasir yang tercatat di database lokal RitelQu.
                </p>
              </div>
              <div className="text-xs text-slate-600 font-semibold">
                Total Transaksi: <span className="font-bold text-[#1E3A8A]">{transactions.length} Struk</span>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-xs font-bold text-slate-700">Belum Ada Transaksi</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lakukan transaksi di menu Kasir untuk melihat riwayat struk penjualan di sini.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3">No. Faktur</th>
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3">Pelanggan</th>
                        <th className="px-4 py-3">Metode</th>
                        <th className="px-4 py-3 text-right">Total Belanja</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#1E3A8A]">
                            {tx.invoiceNumber}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {tx.date}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {tx.customerName || 'Pelanggan Umum'}
                          </td>
                          <td className="px-4 py-3 uppercase text-[11px] font-semibold text-slate-700">
                            {tx.paymentMethod}
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                            Rp {tx.grandTotal.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'lunas'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {tx.status === 'lunas' ? 'LUNAS' : 'BON / TEMPO'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                setActiveReceiptTx(tx);
                                setIsReceiptModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#1E3A8A] hover:text-white text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              Struk
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Hold Cart Dialog */}
      {isHoldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-[#F97316]" />
              Tahan Keranjang Belanja
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Beri tanda / nama pelanggan untuk transaksi pending ini:
            </p>

            <input
              type="text"
              value={holdLabel}
              onChange={(e) => setHoldLabel(e.target.value)}
              placeholder="Contoh: Ibu Rina (Ambil Telur lagi)"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A] mb-4"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsHoldModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmHoldCart}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 cursor-pointer"
              >
                Simpan ke Antrian Pending
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1E3A8A] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Pembayaran Kasir
                </span>
                <h3 className="text-base font-extrabold">
                  Total Tagihan: Rp {grandTotal.toLocaleString('id-ID')}
                </h3>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
              {/* Payment Method Switcher */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Pilih Cara Pembayaran:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tunai')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'tunai'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-extrabold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-[11px]">Tunai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-extrabold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[11px]">QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debit')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'debit'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-extrabold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px]">Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bon')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'bon'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-extrabold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-[11px]">Bon/Piutang</span>
                  </button>
                </div>
              </div>

              {/* Cash Options (Tunai) */}
              {paymentMethod === 'tunai' && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Uang Diterima dari Pembeli:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={cashGiven || ''}
                        onChange={(e) => setCashGiven(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Preset quick cash buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCashGiven(grandTotal)}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#1E3A8A] rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Uang Pas (Rp {grandTotal.toLocaleString('id-ID')})
                    </button>
                    {[50000, 100000, 150000, 200000].map((nominal) => {
                      if (nominal >= grandTotal) {
                        return (
                          <button
                            key={nominal}
                            type="button"
                            onClick={() => setCashGiven(nominal)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#1E3A8A] rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            Rp {nominal.toLocaleString('id-ID')}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Kembalian Calculation */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Kembalian:</span>
                    <span className={`text-base font-black ${
                      cashGiven < grandTotal ? 'text-rose-500' : 'text-emerald-600'
                    }`}>
                      {cashGiven < grandTotal
                        ? `Kurang Rp ${(grandTotal - cashGiven).toLocaleString('id-ID')}`
                        : `Rp ${cashChange.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              )}

              {/* QRIS Dynamic Display */}
              {paymentMethod === 'qris' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                    <QrCode className="w-28 h-28 text-slate-800" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Scan QRIS RitelQu Mart
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Support BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay.
                  </div>
                </div>
              )}

              {/* Bon / Piutang Alert */}
              {paymentMethod === 'bon' && (
                <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 space-y-2 text-rose-900">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Catatan Hutang / Bon Pelanggan</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    Nilai belanja sebesar <b>Rp {grandTotal.toLocaleString('id-ID')}</b> akan otomatis ditambahkan ke buku piutang pelanggan bersangkutan.
                  </p>
                  {!selectedCustomerId && (
                    <p className="text-[11px] font-bold text-rose-800 underline">
                      * Silakan pilih data pelanggan di form atas terlebih dahulu!
                    </p>
                  )}
                </div>
              )}

              {/* Optional Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Catatan Transaksi (Opsional):
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Misal: Dikasih diskon tetangga / Bayar pakai uang receh"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleFinalizePayment}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#1E3A8A] hover:bg-blue-900 active:scale-95 text-white shadow-md shadow-blue-900/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#F97316]" />
                <span>Selesaikan Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Thermal Receipt (Struk Belanja Kasir Ritel) */}
      {isReceiptModalOpen && activeReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-[#F97316]" />
                Pratinjau Struk Kasir ({profile.paperSize})
              </span>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thermal Receipt Body */}
            <div className="p-4 bg-slate-50 overflow-y-auto max-h-[70vh]">
              <div className="bg-white p-4 shadow-sm border border-slate-200 font-mono text-[11px] text-slate-800 space-y-2">
                {/* Store Header */}
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <div className="font-black text-xs uppercase tracking-wide">
                    {profile.storeName}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 whitespace-pre-line">
                    {profile.address}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Telp: {profile.phone}
                  </div>
                </div>

                {/* Meta */}
                <div className="text-[10px] text-slate-600 space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                  <div className="flex justify-between">
                    <span>No. Faktur:</span>
                    <span className="font-bold">{activeReceiptTx.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span>{activeReceiptTx.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{activeReceiptTx.cashierName}</span>
                  </div>
                  {activeReceiptTx.customerName && (
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span>{activeReceiptTx.customerName}</span>
                    </div>
                  )}
                </div>

                {/* Item List */}
                <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300">
                  {activeReceiptTx.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-[11px] truncate">{item.name}</div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>
                          {item.qty} x Rp {item.price.toLocaleString('id-ID')}
                        </span>
                        <span className="font-semibold text-slate-900">
                          Rp {item.total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {activeReceiptTx.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {activeReceiptTx.discountTotal > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Diskon:</span>
                      <span>- Rp {activeReceiptTx.discountTotal.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-200">
                    <span>TOTAL:</span>
                    <span>Rp {activeReceiptTx.grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Bayar ({activeReceiptTx.paymentMethod.toUpperCase()}):</span>
                    <span>Rp {activeReceiptTx.cashPaid.toLocaleString('id-ID')}</span>
                  </div>
                  {activeReceiptTx.cashChange > 0 && (
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Kembalian:</span>
                      <span>Rp {activeReceiptTx.cashChange.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {/* Footer Message */}
                <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-500 whitespace-pre-line leading-relaxed">
                  {profile.receiptFooter}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Cetak Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
