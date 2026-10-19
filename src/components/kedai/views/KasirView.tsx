import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Utensils, 
  ChefHat, 
  Clock, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Sparkles,
  QrCode,
  DollarSign,
  Tag,
  AlertCircle,
  X,
  Printer,
  Share2,
  Bell,
  Coffee,
  Check
} from 'lucide-react';
import { 
  KedaiMenuItem, 
  OrderItem, 
  KedaiTable, 
  KDSTicket, 
  KedaiOrder, 
  KedaiPromo, 
  KasirSubTab,
  KedaiSettings
} from '../KedaiTypes';

interface KasirViewProps {
  menuItems: KedaiMenuItem[];
  categories: string[];
  tables: KedaiTable[];
  kdsTickets: KDSTicket[];
  promos: KedaiPromo[];
  settings: KedaiSettings;
  selectedTableForPOS: KedaiTable | null;
  onClearSelectedTable: () => void;
  onUpdateKDS: (updatedTickets: KDSTicket[]) => void;
  onCompleteOrder: (order: KedaiOrder, targetTableId?: string) => void;
  onSendToKDS: (ticket: KDSTicket, tableId?: string, orderItems?: OrderItem[]) => void;
  initialSubTab?: KasirSubTab;
}

export const KasirView: React.FC<KasirViewProps> = ({
  menuItems,
  categories,
  tables,
  kdsTickets,
  promos,
  settings,
  selectedTableForPOS,
  onClearSelectedTable,
  onUpdateKDS,
  onCompleteOrder,
  onSendToKDS,
  initialSubTab = 'pos'
}) => {
  const [subTab, setSubTab] = useState<KasirSubTab>(initialSubTab);

  // POS State
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<'dine_in' | 'take_away' | 'delivery'>('dine_in');
  const [activeTableId, setActiveTableId] = useState<string>(selectedTableForPOS?.id || (tables[0]?.id || ''));
  const [customerName, setCustomerName] = useState<string>(selectedTableForPOS?.customerName || '');
  const [cart, setCart] = useState<OrderItem[]>(() => {
    if (selectedTableForPOS?.orderItems && selectedTableForPOS.orderItems.length > 0) {
      return [...selectedTableForPOS.orderItems];
    }
    return [];
  });

  // Variant Modal State
  const [activeMenuForVariant, setActiveMenuForVariant] = useState<KedaiMenuItem | null>(null);
  const [selectedVariantOption, setSelectedVariantOption] = useState<string>('');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [variantNotes, setVariantNotes] = useState<string>('');

  // Promo & Payment Modal
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<KedaiPromo | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'transfer' | 'debit'>('tunai');
  const [cashAmountPaid, setCashAmountPaid] = useState<number>(0);
  const [receiptModalOrder, setReceiptModalOrder] = useState<KedaiOrder | null>(null);

  // KDS Filter
  const [kdsFilter, setKdsFilter] = useState<'semua' | 'antri' | 'memasak' | 'siap'>('semua');

  // Filter Menu
  const filteredMenu = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedPromo.value) / 100);
    } else {
      discountAmount = appliedPromo.value;
    }
  }
  const taxAmount = settings.taxPercent > 0 ? Math.round(((subtotal - discountAmount) * settings.taxPercent) / 100) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  const cashChange = Math.max(0, cashAmountPaid - grandTotal);

  // Add Item Click
  const handleItemClick = (menu: KedaiMenuItem) => {
    if (!menu.available || menu.stock <= 0) return;
    if ((menu.variantGroups && menu.variantGroups.length > 0) || (menu.toppings && menu.toppings.length > 0)) {
      setActiveMenuForVariant(menu);
      setSelectedVariantOption(menu.variantGroups?.[0]?.options[0]?.label || '');
      setSelectedToppings([]);
      setVariantNotes('');
    } else {
      addToCartDirect(menu);
    }
  };

  const addToCartDirect = (menu: KedaiMenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuId === menu.id && !item.variant && (!item.toppings || item.toppings.length === 0));
      if (existing) {
        return prev.map(item => item === existing ? { ...item, qty: item.qty + 1, totalPrice: (item.qty + 1) * item.price } : item);
      }
      return [...prev, {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        qty: 1,
        totalPrice: menu.price
      }];
    });
  };

  const handleConfirmVariant = () => {
    if (!activeMenuForVariant) return;
    const extraPriceToppings = selectedToppings.reduce((sum, topName) => {
      const topObj = activeMenuForVariant.toppings?.find(t => t.name === topName);
      return sum + (topObj?.price || 0);
    }, 0);

    const basePrice = activeMenuForVariant.price;
    const finalUnitPrice = basePrice + extraPriceToppings;

    setCart(prev => [
      ...prev,
      {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuId: activeMenuForVariant.id,
        name: activeMenuForVariant.name,
        price: finalUnitPrice,
        qty: 1,
        variant: selectedVariantOption || undefined,
        toppings: selectedToppings.length > 0 ? selectedToppings : undefined,
        notes: variantNotes.trim() || undefined,
        totalPrice: finalUnitPrice
      }
    ]);
    setActiveMenuForVariant(null);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty, totalPrice: newQty * item.price } : null;
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const handleApplyPromo = () => {
    const promo = promos.find(p => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase() && p.active);
    if (!promo) {
      alert('Kode promo tidak ditemukan atau sudah tidak aktif!');
      return;
    }
    if (subtotal < promo.minOrder) {
      alert(`Minimal pembelanjaan untuk promo ini adalah Rp ${promo.minOrder.toLocaleString('id-ID')}`);
      return;
    }
    setAppliedPromo(promo);
  };

  // Kirim Pesanan ke KDS Dapur
  const handleSendKDS = () => {
    if (cart.length === 0) {
      alert('Keranjang pesanan masih kosong!');
      return;
    }
    const currentTable = tables.find(t => t.id === activeTableId);
    const tableName = orderType === 'dine_in' ? (currentTable?.name || 'Meja') : 'Take Away';

    const newTicket: KDSTicket = {
      id: `kds-${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
      tableId: orderType === 'dine_in' ? activeTableId : undefined,
      tableName: tableName,
      orderType: orderType,
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtTimestamp: Date.now(),
      status: 'antri',
      waiterName: customerName || 'Kasir',
      items: cart.map(c => ({
        name: c.name,
        qty: c.qty,
        notes: c.notes,
        variant: c.variant,
        toppings: c.toppings,
        isDone: false
      }))
    };

    onSendToKDS(newTicket, orderType === 'dine_in' ? activeTableId : undefined, cart);
    alert(`Pesanan berhasil dikirim ke Antrian Dapur (KDS) untuk ${tableName}!`);
  };

  // Finalisasi Pembayaran
  const handleFinalizePayment = () => {
    if (cart.length === 0) return;
    const currentTable = tables.find(t => t.id === activeTableId);
    const currentTableName = orderType === 'dine_in' ? (currentTable?.name || 'Meja') : 'Take Away';

    const newOrder: KedaiOrder = {
      id: `ord-${Date.now()}`,
      invoiceNumber: `KDI-${Date.now().toString().slice(-6)}`,
      tableId: orderType === 'dine_in' ? activeTableId : undefined,
      tableName: currentTableName,
      orderType: orderType,
      customerName: customerName || 'Pelanggan Kedai',
      items: [...cart],
      subtotal,
      discount: discountAmount,
      promoCode: appliedPromo?.code,
      tax: taxAmount,
      total: grandTotal,
      paymentMethod,
      amountPaid: paymentMethod === 'tunai' ? cashAmountPaid || grandTotal : grandTotal,
      change: paymentMethod === 'tunai' ? Math.max(0, (cashAmountPaid || grandTotal) - grandTotal) : 0,
      status: 'paid',
      createdAt: new Date().toLocaleString('id-ID'),
      cashierName: 'Kasir Kedai'
    };

    onCompleteOrder(newOrder, orderType === 'dine_in' ? activeTableId : undefined);
    setIsPaymentModalOpen(false);
    setReceiptModalOrder(newOrder);
    setCart([]);
    setAppliedPromo(null);
    setPromoCodeInput('');
  };

  // KDS ticket transitions
  const updateTicketStatus = (ticketId: string, nextStatus: 'memasak' | 'siap' | 'selesai') => {
    const updated = kdsTickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: nextStatus };
      }
      return t;
    });
    onUpdateKDS(updated);
  };

  const toggleKDSItemDone = (ticketId: string, itemIdx: number) => {
    const updated = kdsTickets.map(t => {
      if (t.id === ticketId) {
        const items = [...t.items];
        items[itemIdx].isDone = !items[itemIdx].isDone;
        return { ...t, items };
      }
      return t;
    });
    onUpdateKDS(updated);
  };

  // Active bills
  const activeBillTables = tables.filter(t => t.status === 'terisi' || t.status === 'billing');

  return (
    <div className="space-y-4">
      {/* Sub-tab Switcher Berbasis Underline Minimalis */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('pos')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              subTab === 'pos'
                ? 'border-[#C59B27] text-[#1B3B2B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Kasir POS</span>
          </button>

          <button
            onClick={() => setSubTab('kds')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              subTab === 'kds'
                ? 'border-[#C59B27] text-[#1B3B2B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Antrian Dapur (KDS)</span>
            {kdsTickets.filter(t => t.status !== 'selesai').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                {kdsTickets.filter(t => t.status !== 'selesai').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('bill')}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              subTab === 'bill'
                ? 'border-[#C59B27] text-[#1B3B2B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Pesanan Berjalan / Bill Meja</span>
            {activeBillTables.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {activeBillTables.length}
              </span>
            )}
          </button>
        </div>

        {selectedTableForPOS && (
          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-[#C59B27]/40 text-xs text-[#1B3B2B]">
            <span className="font-bold">Meja Terpilih: {selectedTableForPOS.name}</span>
            <button onClick={onClearSelectedTable} className="text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ======================= TAB 1: KASIR POS ======================= */}
      {subTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Kolom Kiri: Menu & Katalog (7 / 12) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Top Bar POS: Search & Tipe Pesanan */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kopi, makanan, snack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7DFD5] bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                />
              </div>

              {/* Mode Pesanan */}
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E7DFD5] text-xs">
                {(['dine_in', 'take_away', 'delivery'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                      orderType === type 
                        ? 'bg-[#1B3B2B] text-[#FAF7F2]' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {type === 'dine_in' ? 'Dine In' : type === 'take_away' ? 'Bungkus' : 'Delivery'}
                  </button>
                ))}
              </div>
            </div>

            {/* Jika Dine In: Pilih Meja */}
            {orderType === 'dine_in' && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E7DFD5] text-xs">
                <span className="font-semibold text-slate-600 whitespace-nowrap">Pilih Meja:</span>
                <select
                  value={activeTableId}
                  onChange={(e) => setActiveTableId(e.target.value)}
                  className="flex-1 bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg px-2 py-1 font-semibold text-[#1B3B2B] focus:outline-none focus:ring-1 focus:ring-[#C59B27]"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.area} - {t.status})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nama Tamu (opsional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-36 px-2 py-1 rounded-lg border border-[#E7DFD5] bg-[#FAF7F2] text-xs"
                />
              </div>
            )}

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#1B3B2B] text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-[#EAE4DC] border border-[#E7DFD5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredMenu.map(menu => {
                const isOutOfStock = !menu.available || menu.stock <= 0;
                return (
                  <div
                    key={menu.id}
                    onClick={() => handleItemClick(menu)}
                    className={`bg-white p-2.5 rounded-xl border border-[#E7DFD5] transition-all flex flex-col justify-between cursor-pointer ${
                      isOutOfStock 
                        ? 'opacity-50 grayscale cursor-not-allowed' 
                        : 'hover:border-[#C59B27] hover:shadow-xs active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{menu.imageIcon}</span>
                        {menu.isPopular && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            ★ Populer
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-[#1B3B2B] line-clamp-1">{menu.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{menu.description || menu.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                      <span className="font-bold text-xs text-[#C59B27]">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isOutOfStock ? 'Habis' : `Stok ${menu.stock}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Struk / Cart (5 / 12) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#C59B27]" />
                  <span className="font-bold text-xs text-[#1B3B2B]">Ringkasan Struk Kasir</span>
                </div>
                {cart.length > 0 && (
                  <button 
                    onClick={() => setCart([])}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-medium"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* List Item Cart */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-2">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <Coffee className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>Belum ada item dipilih.</p>
                    <p className="text-[10px]">Klik menu di sebelah kiri untuk menambah pesanan.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="py-2 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-xs text-[#1B3B2B] leading-tight">{item.name}</p>
                          {item.variant && (
                            <p className="text-[10px] text-amber-700 font-medium">✨ {item.variant}</p>
                          )}
                          {item.toppings && item.toppings.length > 0 && (
                            <p className="text-[10px] text-slate-500">+ {item.toppings.join(', ')}</p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] italic text-slate-400">"{item.notes}"</p>
                          )}
                        </div>
                        <span className="font-bold text-xs text-slate-800 whitespace-nowrap">
                          Rp {item.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">@ Rp {item.price.toLocaleString('id-ID')}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Perhitungan Biaya & Tombol Aksi */}
            <div className="space-y-2.5 pt-2 border-t border-[#E7DFD5]">
              {/* Kupon Promo */}
              <div className="flex gap-1.5 text-xs">
                <input
                  type="text"
                  placeholder="Kode Promo (misal: NGOPIHEMAT)"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded-lg border border-[#E7DFD5] uppercase text-xs focus:outline-none focus:ring-1 focus:ring-[#C59B27]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold hover:bg-amber-200"
                >
                  Pakai
                </button>
              </div>

              {/* Rincian Angka */}
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Promo ({appliedPromo.code})</span>
                    <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {settings.taxPercent > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak Resto ({settings.taxPercent}%)</span>
                    <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#1B3B2B] pt-1 border-t border-slate-100">
                  <span>Total Tagihan</span>
                  <span className="text-[#C59B27]">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Aksi Kasir: Kirim KDS & Bayar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendKDS}
                  disabled={cart.length === 0}
                  className="py-2.5 rounded-xl border border-[#C59B27] text-[#1B3B2B] font-bold text-xs hover:bg-amber-50 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  <ChefHat className="w-4 h-4 text-[#C59B27]" />
                  <span>Kirim ke Dapur</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCashAmountPaid(grandTotal);
                    setIsPaymentModalOpen(true);
                  }}
                  disabled={cart.length === 0}
                  className="py-2.5 rounded-xl bg-[#1B3B2B] text-white font-bold text-xs hover:bg-[#152e22] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CreditCard className="w-4 h-4 text-[#C59B27]" />
                  <span>Bayar Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: ANTRIAN DAPUR (KDS DISPLAY) ======================= */}
      {subTab === 'kds' && (
        <div className="space-y-3">
          {/* Filter Status KDS */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
            <div className="flex gap-1.5 text-xs">
              {(['semua', 'antri', 'memasak', 'siap'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setKdsFilter(status)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                    kdsFilter === status
                      ? 'bg-[#1B3B2B] text-white'
                      : 'bg-white text-slate-600 border border-[#E7DFD5] hover:bg-slate-50'
                  }`}
                >
                  {status === 'semua' ? 'Semua Tiket' : status === 'antri' ? '⏳ Antri Baru' : status === 'memasak' ? '🍳 Sedang Masak' : '✅ Siap Saji'}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Real-time Kitchen Display</span>
            </div>
          </div>

          {/* Tiket KDS Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kdsTickets
              .filter(ticket => ticket.status !== 'selesai')
              .filter(ticket => kdsFilter === 'semua' || ticket.status === kdsFilter)
              .map(ticket => {
                const elapsedMins = Math.floor((Date.now() - ticket.createdAtTimestamp) / 60000);
                const isUrgent = elapsedMins > 15;

                return (
                  <div
                    key={ticket.id}
                    className={`bg-white rounded-2xl border p-3.5 shadow-xs space-y-2.5 flex flex-col justify-between ${
                      isUrgent 
                        ? 'border-rose-300 ring-1 ring-rose-200' 
                        : ticket.status === 'siap' 
                        ? 'border-emerald-300 bg-emerald-50/20' 
                        : 'border-[#E7DFD5]'
                    }`}
                  >
                    <div>
                      {/* Header Tiket */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <span className="font-bold text-xs text-[#1B3B2B]">{ticket.tableName}</span>
                          <p className="text-[10px] text-slate-400">Order #{ticket.invoiceNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.status === 'antri'
                              ? 'bg-amber-100 text-amber-800'
                              : ticket.status === 'memasak'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ticket.status === 'antri' ? 'Antri' : ticket.status === 'memasak' ? 'Memasak' : 'Siap Saji'}
                          </span>
                          <p className={`text-[10px] font-semibold mt-0.5 ${isUrgent ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                            ⏱️ {elapsedMins} mnt lalu
                          </p>
                        </div>
                      </div>

                      {/* Item Checklist */}
                      <div className="py-2 space-y-1.5 divide-y divide-slate-50 text-xs">
                        {ticket.items.map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => toggleKDSItemDone(ticket.id, idx)}
                            className="pt-1.5 flex items-start gap-2 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={item.isDone || false}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                            />
                            <div className="flex-1">
                              <p className={`font-semibold ${item.isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {item.qty}x {item.name}
                              </p>
                              {item.variant && (
                                <p className="text-[10px] text-amber-700">{item.variant}</p>
                              )}
                              {item.notes && (
                                <p className="text-[10px] italic text-slate-500">"{item.notes}"</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aksi Tombol KDS */}
                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      {ticket.status === 'antri' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'memasak')}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <ChefHat className="w-3.5 h-3.5 text-[#C59B27]" />
                          <span>Mulai Masak</span>
                        </button>
                      )}
                      {ticket.status === 'memasak' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'siap')}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Bell className="w-3.5 h-3.5 text-white" />
                          <span>Siap Saji / Panggil Waiter</span>
                        </button>
                      )}
                      {ticket.status === 'siap' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'selesai')}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Selesai / Sudah Diantar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {kdsTickets.filter(t => t.status !== 'selesai').length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-[#E7DFD5]">
              <ChefHat className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600 text-sm">Semua Pesanan Dapur Telah Selesai!</p>
              <p className="text-[11px] mt-0.5">Tiket baru yang dikirim dari kasir akan muncul di sini secara otomatis.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: PESANAN BERJALAN / BILL MEJA ======================= */}
      {subTab === 'bill' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
            <p className="text-xs text-slate-500">
              Daftar seluruh meja yang sedang aktif nongkrong dan belum melunasi tagihan
            </p>
            <span className="text-xs font-bold text-[#1B3B2B] bg-amber-50 px-2.5 py-1 rounded-lg border border-[#C59B27]/30">
              {activeBillTables.length} Meja Sedang Berjalan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeBillTables.map(tbl => (
              <div
                key={tbl.id}
                className="bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-sm text-[#1B3B2B]">{tbl.name}</h4>
                      <p className="text-[10px] text-slate-400">Area {tbl.area} • {tbl.chairs} Kursi</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tbl.status === 'billing' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tbl.status === 'billing' ? 'Minta Struk' : 'Masih Santai'}
                    </span>
                  </div>

                  <div className="py-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tamu / Pelanggan:</span>
                      <span className="font-semibold text-slate-800">{tbl.customerName || 'Tamu'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mulai Masuk:</span>
                      <span className="font-semibold text-slate-800">{tbl.occupiedSince || '-'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">Total Tagihan:</span>
                      <span className="font-bold text-[#1B3B2B] text-sm">
                        Rp {(tbl.orderTotal || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {tbl.orderItems && tbl.orderItems.length > 0 && (
                    <div className="max-h-24 overflow-y-auto space-y-0.5 text-[11px] text-slate-500 pr-1">
                      {tbl.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.qty}x {item.name}</span>
                          <span>Rp {item.totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveTableId(tbl.id);
                      setCustomerName(tbl.customerName || '');
                      setCart(tbl.orderItems ? [...tbl.orderItems] : []);
                      setSubTab('pos');
                    }}
                    className="py-2 rounded-xl text-xs font-semibold border border-[#C59B27] text-[#1B3B2B] hover:bg-amber-50"
                  >
                    + Tambah Item
                  </button>
                  <button
                    onClick={() => {
                      setActiveTableId(tbl.id);
                      setCustomerName(tbl.customerName || '');
                      setCart(tbl.orderItems ? [...tbl.orderItems] : []);
                      setCashAmountPaid(tbl.orderTotal || 0);
                      setIsPaymentModalOpen(true);
                    }}
                    className="py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs"
                  >
                    Bayar di Kasir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeBillTables.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-[#E7DFD5]">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600 text-sm">Tidak Ada Tagihan Berjalan</p>
              <p className="text-[11px] mt-0.5">Semua meja saat ini kosong atau telah lunas.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================= MODAL PILIH VARIAN & TOPPING ======================= */}
      {activeMenuForVariant && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-[#1B3B2B]">{activeMenuForVariant.name}</h3>
                <p className="text-xs text-[#C59B27] font-semibold">
                  Rp {activeMenuForVariant.price.toLocaleString('id-ID')}
                </p>
              </div>
              <button 
                onClick={() => setActiveMenuForVariant(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
              {/* Grup Varian */}
              {activeMenuForVariant.variantGroups?.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <label className="block font-bold text-slate-700">{group.name}:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.options.map((opt, oIdx) => (
                      <button
                        type="button"
                        key={oIdx}
                        onClick={() => setSelectedVariantOption(opt.label)}
                        className={`p-2 rounded-xl border text-left text-xs transition-all ${
                          selectedVariantOption === opt.label
                            ? 'border-[#C59B27] bg-amber-50 text-[#1B3B2B] font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Topping Tambahan */}
              {activeMenuForVariant.toppings && activeMenuForVariant.toppings.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Ekstra Topping:</label>
                  <div className="space-y-1">
                    {activeMenuForVariant.toppings.map(top => {
                      const isSelected = selectedToppings.includes(top.name);
                      return (
                        <div
                          key={top.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedToppings(prev => prev.filter(t => t !== top.name));
                            } else {
                              setSelectedToppings(prev => [...prev, top.name]);
                            }
                          }}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'border-[#C59B27] bg-amber-50/60 font-semibold text-[#1B3B2B]' 
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{top.name}</span>
                          <span className="text-[11px] text-[#C59B27]">+Rp {top.price.toLocaleString('id-ID')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Catatan Khusus */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Khusus:</label>
                <input
                  type="text"
                  placeholder="Misal: Less ice, jangan pedas, sendok 2..."
                  value={variantNotes}
                  onChange={(e) => setVariantNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] text-xs focus:outline-none focus:ring-1 focus:ring-[#C59B27]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveMenuForVariant(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmVariant}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs"
              >
                Tambahkan ke Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL PEMBAYARAN KASIR ======================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Selesaikan Pembayaran</h3>
              <button 
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E7DFD5] text-center space-y-0.5">
              <p className="text-[11px] text-slate-500">Total Tagihan Pelanggan</p>
              <p className="text-2xl font-black text-[#1B3B2B]">
                Rp {grandTotal.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Pilihan Metode Pembayaran */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-700">Metode Bayar:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['tunai', 'qris', 'debit', 'transfer'] as const).map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                      paymentMethod === m
                        ? 'border-[#C59B27] bg-[#1B3B2B] text-white shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m === 'qris' ? 'QRIS' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Tampilan Sesuai Metode */}
            {paymentMethod === 'tunai' && (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nominal Diterima:</label>
                  <input
                    type="number"
                    value={cashAmountPaid || ''}
                    onChange={(e) => setCashAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-base font-bold rounded-xl border border-[#E7DFD5] text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                  />
                </div>

                {/* Uang Pas / Pilihan Cepat */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCashAmountPaid(grandTotal)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAmountPaid(50000)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold"
                  >
                    50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAmountPaid(100000)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold"
                  >
                    100.000
                  </button>
                </div>

                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-800">Kembalian:</span>
                  <span className="text-base font-black text-emerald-800">
                    Rp {cashChange.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'qris' && (
              <div className="text-center py-2 space-y-2">
                <div className="w-32 h-32 mx-auto bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center shadow-xs">
                  <QrCode className="w-28 h-28 text-slate-800" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Scan QRIS dengan BCA, Mandiri, GoPay, OVO, Dana, ShopeePay
                </p>
              </div>
            )}

            {(paymentMethod === 'debit' || paymentMethod === 'transfer') && (
              <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1">
                <p className="font-bold">BCA KedaiQu: 8820-123-4567</p>
                <p className="text-[11px] text-sky-700">Atas Nama: PT Kuliner Kedai Sukses</p>
                <p className="text-[10px] text-slate-400">Verifikasi bukti transfer dari mesin EDC atau mobile banking</p>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleFinalizePayment}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Konfirmasi Lunas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL STRUK SUKSES ======================= */}
      {receiptModalOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="text-center pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#1B3B2B]">Pembayaran Berhasil!</h3>
              <p className="text-xs text-slate-400">{receiptModalOrder.invoiceNumber}</p>
            </div>

            {/* Preview Struk Thermal */}
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-700 space-y-1">
              <div className="text-center pb-1 border-b border-slate-200">
                <p className="font-bold text-xs">{settings.storeName}</p>
                <p className="text-[10px] text-slate-500">{settings.address}</p>
              </div>

              <div className="pt-1 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{receiptModalOrder.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipe / Meja:</span>
                  <span>{receiptModalOrder.tableName}</span>
                </div>
              </div>

              <div className="py-1 border-t border-b border-slate-200 space-y-1">
                {receiptModalOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.qty}x {it.name}</span>
                    <span>Rp {it.totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 pt-1 text-xs font-bold">
                <div className="flex justify-between">
                  <span>TOTAL:</span>
                  <span>Rp {receiptModalOrder.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-normal text-slate-500">
                  <span>Metode:</span>
                  <span className="uppercase">{receiptModalOrder.paymentMethod}</span>
                </div>
              </div>

              <p className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-200">
                {settings.receiptFooter}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  alert('Simulasi mencetak ke printer thermal Bluetooth 58mm/80mm...');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold border border-[#C59B27] text-[#1B3B2B] hover:bg-amber-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Cetak Thermal</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptModalOrder(null)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
