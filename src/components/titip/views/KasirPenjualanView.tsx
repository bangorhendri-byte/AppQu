/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  FileText, 
  RotateCcw, 
  Plus, 
  Printer, 
  Truck, 
  Check, 
  Trash2, 
  DollarSign, 
  Search,
  User,
  X
} from 'lucide-react';
import { 
  ProductRecipe, 
  ConsignmentStore, 
  ResellerPartner, 
  SalesTransaction, 
  DeliveryOrder, 
  ProductReturn, 
  TitipStoreProfile, 
  SalesItem, 
  DeliveryItem 
} from '../TitipTypes';

interface KasirPenjualanViewProps {
  recipes: ProductRecipe[];
  stores: ConsignmentStore[];
  resellers: ResellerPartner[];
  sales: SalesTransaction[];
  deliveries: DeliveryOrder[];
  returns: ProductReturn[];
  profile: TitipStoreProfile;
  onCompleteSale: (sale: SalesTransaction) => void;
  onCreateDelivery: (delivery: DeliveryOrder) => void;
  onAddReturn: (ret: ProductReturn) => void;
}

export const KasirPenjualanView: React.FC<KasirPenjualanViewProps> = ({
  recipes,
  stores,
  resellers,
  sales,
  deliveries,
  returns,
  profile,
  onCompleteSale,
  onCreateDelivery,
  onAddReturn
}) => {
  const [subTab, setSubTab] = useState<'pos' | 'surat_jalan' | 'retur'>('pos');

  // POS State
  const [posCart, setPosCart] = useState<SalesItem[]>([]);
  const [posChannel, setPosChannel] = useState<'direct_pos' | 'konsinyasi' | 'reseller'>('direct_pos');
  const [customerName, setCustomerName] = useState('Pelanggan Umum');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer' | 'tempo'>('tunai');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<SalesTransaction | null>(null);

  // Delivery Order (Surat Jalan) State
  const [isDoModalOpen, setIsDoModalOpen] = useState(false);
  const [doPartnerType, setDoPartnerType] = useState<'toko_titip' | 'reseller'>('toko_titip');
  const [doPartnerId, setDoPartnerId] = useState(stores[0]?.id || '');
  const [doDriver, setDoDriver] = useState('Budi Kurir');
  const [doVehicle, setDoVehicle] = useState('AB 4521 XY');
  const [doItems, setDoItems] = useState<DeliveryItem[]>([]);
  const [selectedDoRecipeId, setSelectedDoRecipeId] = useState(recipes[0]?.id || '');
  const [selectedDoQty, setSelectedDoQty] = useState(20);
  const [activeDoToPrint, setActiveDoToPrint] = useState<DeliveryOrder | null>(null);

  // Return State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnPartnerName, setReturnPartnerName] = useState(stores[0]?.name || '');
  const [returnProductName, setReturnProductName] = useState(recipes[0]?.name || '');
  const [returnQty, setReturnQty] = useState(5);
  const [returnReason, setReturnReason] = useState<ProductReturn['reason']>('kadaluwarsa');
  const [returnAction, setReturnAction] = useState<ProductReturn['action']>('ganti_stok');

  // POS Cart Helpers
  const handleAddToCart = (recipe: ProductRecipe) => {
    let price = recipe.sellingPriceRetail;
    if (posChannel === 'konsinyasi') price = recipe.consignmentPrice;
    if (posChannel === 'reseller') price = recipe.resellerPrice;

    setPosCart((prev) => {
      const existing = prev.find((item) => item.recipeId === recipe.id);
      if (existing) {
        return prev.map((item) =>
          item.recipeId === recipe.id
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prev,
          {
            recipeId: recipe.id,
            productName: recipe.name,
            qty: 1,
            unitPrice: price,
            hpp: recipe.hppPerPcs,
            total: price
          }
        ];
      }
    });
  };

  const handleUpdateCartQty = (recipeId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((it) => {
          if (it.recipeId === recipeId) {
            const newQty = it.qty + delta;
            return newQty > 0 ? { ...it, qty: newQty, total: newQty * it.unitPrice } : null;
          }
          return it;
        })
        .filter(Boolean) as SalesItem[]
    );
  };

  const posSubtotal = posCart.reduce((sum, it) => sum + it.total, 0);

  const handleCheckoutPOS = () => {
    if (posCart.length === 0) return;

    const newSale: SalesTransaction = {
      id: `sls-${Date.now()}`,
      invoiceNumber: `INV-${posChannel === 'direct_pos' ? 'DIR' : posChannel === 'reseller' ? 'RSL' : 'KSN'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      date: `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      timestamp: Date.now(),
      channel: posChannel,
      partnerOrCustomerName: customerName,
      items: posCart,
      subtotal: posSubtotal,
      discount: 0,
      grandTotal: posSubtotal,
      paymentMethod,
      status: paymentMethod === 'tempo' ? 'tempo' : 'lunas',
      notes: `Penjualan channel ${posChannel.toUpperCase()}`
    };

    onCompleteSale(newSale);
    setActiveReceipt(newSale);
    setIsReceiptOpen(true);
    setPosCart([]);
  };

  // Delivery order item addition
  const handleAddItemToDo = () => {
    const rcp = recipes.find((r) => r.id === selectedDoRecipeId);
    if (!rcp) return;

    const unitPrice = doPartnerType === 'toko_titip' ? rcp.consignmentPrice : rcp.resellerPrice;
    setDoItems((prev) => [
      ...prev,
      {
        recipeId: rcp.id,
        productName: rcp.name,
        qty: Number(selectedDoQty),
        unitPrice,
        total: Number(selectedDoQty) * unitPrice
      }
    ]);
  };

  const handleSaveDeliveryOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (doItems.length === 0) {
      alert('Silakan tambahkan minimal 1 item barang yang akan dikirim.');
      return;
    }

    const partnerName = doPartnerType === 'toko_titip'
      ? stores.find((s) => s.id === doPartnerId)?.name || 'Toko Titipan'
      : resellers.find((r) => r.id === doPartnerId)?.name || 'Reseller Mitra';

    const address = doPartnerType === 'toko_titip'
      ? stores.find((s) => s.id === doPartnerId)?.address || '-'
      : resellers.find((r) => r.id === doPartnerId)?.address || '-';

    const newDO: DeliveryOrder = {
      id: `do-${Date.now()}`,
      doNumber: `SJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      partnerType: doPartnerType,
      partnerId: doPartnerId,
      partnerName,
      address,
      driverName: doDriver,
      vehicleNo: doVehicle,
      items: doItems,
      totalQty: doItems.reduce((sum, it) => sum + it.qty, 0),
      status: 'terkirim',
      notes: 'Barang titipan telah diserahterimakan dalam kondisi baik.'
    };

    onCreateDelivery(newDO);
    setIsDoModalOpen(false);
    setActiveDoToPrint(newDO);
    setDoItems([]);
  };

  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const newRet: ProductReturn = {
      id: `ret-${Date.now()}`,
      returnNumber: `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      partnerId: 'partner',
      partnerName: returnPartnerName,
      productName: returnProductName,
      qty: Number(returnQty),
      reason: returnReason,
      action: returnAction,
      notes: `Barang ditarik dari mitra karena ${returnReason}.`
    };

    onAddReturn(newRet);
    setIsReturnModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('pos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'pos'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasir / POS Direct & Mitra</span>
          </button>

          <button
            onClick={() => setSubTab('surat_jalan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'surat_jalan'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Surat Jalan Pengiriman ({deliveries.length})</span>
          </button>

          <button
            onClick={() => setSubTab('retur')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'retur'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Retur Barang Mitra ({returns.length})</span>
          </button>
        </div>

        {subTab === 'surat_jalan' && (
          <button
            onClick={() => setIsDoModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Buat Surat Jalan Kirim</span>
          </button>
        )}

        {subTab === 'retur' && (
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Retur Barang</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: POS Direct & Multi-Channel */}
      {subTab === 'pos' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Catalog Selection */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Channel Selector for Pricing */}
              <div className="bg-white p-3 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">Pilih Saluran Penjualan:</span>
                <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-xl">
                  <button
                    onClick={() => setPosChannel('direct_pos')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      posChannel === 'direct_pos' ? 'bg-[#C2410C] text-white shadow-xs' : 'text-slate-700'
                    }`}
                  >
                    Direct POS Retail
                  </button>
                  <button
                    onClick={() => setPosChannel('konsinyasi')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      posChannel === 'konsinyasi' ? 'bg-[#C2410C] text-white shadow-xs' : 'text-slate-700'
                    }`}
                  >
                    Toko Konsinyasi
                  </button>
                  <button
                    onClick={() => setPosChannel('reseller')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      posChannel === 'reseller' ? 'bg-[#C2410C] text-white shadow-xs' : 'text-slate-700'
                    }`}
                  >
                    Reseller / Agen
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {recipes.map((rcp) => {
                  let price = rcp.sellingPriceRetail;
                  if (posChannel === 'konsinyasi') price = rcp.consignmentPrice;
                  if (posChannel === 'reseller') price = rcp.resellerPrice;

                  return (
                    <button
                      key={rcp.id}
                      onClick={() => handleAddToCart(rcp)}
                      className="bg-white p-3.5 rounded-2xl border border-amber-200 hover:border-[#C2410C] hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-700 block mb-1">
                          {rcp.sku}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                          {rcp.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Harga {posChannel.toUpperCase()}</span>
                          <span className="text-xs font-extrabold text-[#C2410C]">
                            Rp {price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                          Stok: {rcp.currentStock}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Checkout Cart */}
          <div className="w-full lg:w-96 bg-white border-l border-amber-200 flex flex-col justify-between shrink-0 shadow-xs">
            <div className="p-3.5 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
              <span className="font-extrabold text-xs text-slate-900">
                Keranjang Kasir ({posCart.reduce((s, it) => s + it.qty, 0)} item)
              </span>
              <button
                onClick={() => setPosCart([])}
                className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Customer name */}
            <div className="p-3 border-b border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Nama Pembeli / Mitra:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Pelanggan Galeri / Reseller"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            {/* Cart Items */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {posCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ShoppingCart className="w-8 h-8 mb-2 stroke-1" />
                  <p>Keranjang masih kosong.</p>
                </div>
              ) : (
                posCart.map((it) => (
                  <div key={it.recipeId} className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/30 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-800 truncate max-w-[170px]">{it.productName}</div>
                      <div className="text-[10px] text-slate-500">
                        {it.qty} x Rp {it.unitPrice.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateCartQty(it.recipeId, -1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-black w-5 text-center">{it.qty}</span>
                      <button
                        onClick={() => handleUpdateCartQty(it.recipeId, 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Bottom */}
            <div className="p-3.5 bg-amber-50/50 border-t border-amber-200 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-extrabold text-slate-700">Total Tagihan:</span>
                <span className="text-lg font-black text-[#C2410C]">
                  Rp {posSubtotal.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {['tunai', 'transfer', 'tempo'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m as any)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                      paymentMethod === m
                        ? 'bg-[#C2410C] text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                disabled={posCart.length === 0}
                onClick={handleCheckoutPOS}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
                  posCart.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#C2410C] hover:bg-orange-800 text-white shadow-orange-900/20'
                }`}
              >
                Selesaikan Pembayaran & Potong Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Surat Jalan Pengiriman (DO) */}
      {subTab === 'surat_jalan' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/80 text-amber-950 uppercase text-[10px] font-bold border-b border-amber-200">
                  <tr>
                    <th className="px-4 py-3">No. Surat Jalan</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Tujuan Pengiriman</th>
                    <th className="px-4 py-3 text-center">Total Unit</th>
                    <th className="px-4 py-3">Kurir & Nopol</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-amber-50/40">
                      <td className="px-4 py-3 font-mono font-bold text-[#C2410C]">{d.doNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{d.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{d.partnerName}</td>
                      <td className="px-4 py-3 text-center font-extrabold">{d.totalQty} Pcs</td>
                      <td className="px-4 py-3 text-slate-600">{d.driverName} ({d.vehicleNo})</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setActiveDoToPrint(d)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-[#C2410C] hover:text-white text-[#C2410C] rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          Cetak SJ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Retur Barang */}
      {subTab === 'retur' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {returns.map((ret) => (
              <div key={ret.id} className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600">{ret.returnNumber}</span>
                    <span className="text-xs font-extrabold text-slate-900">• {ret.partnerName}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                    RETUR: {ret.reason.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-600 flex justify-between">
                  <span>{ret.productName} ({ret.qty} Pcs)</span>
                  <span className="font-semibold text-slate-700">Tindakan: {ret.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Buat Surat Jalan Baru */}
      {isDoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#F59E0B]" />
              Buat Surat Jalan Pengiriman Titipan / Reseller
            </h3>

            <form onSubmit={handleSaveDeliveryOrder} className="space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tipe Tujuan:</label>
                  <select
                    value={doPartnerType}
                    onChange={(e) => {
                      setDoPartnerType(e.target.value as any);
                      setDoPartnerId(e.target.value === 'toko_titip' ? stores[0]?.id || '' : resellers[0]?.id || '');
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="toko_titip">Toko Titipan Konsinyasi</option>
                    <option value="reseller">Reseller / Agen</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Mitra:</label>
                  <select
                    value={doPartnerId}
                    onChange={(e) => setDoPartnerId(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {doPartnerType === 'toko_titip'
                      ? stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                      : resellers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Add item to DO */}
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Tambah Barang Kiriman:</span>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-8">
                    <select
                      value={selectedDoRecipeId}
                      onChange={(e) => setSelectedDoRecipeId(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    >
                      {recipes.map((rcp) => (
                        <option key={rcp.id} value={rcp.id}>{rcp.name} (Stok: {rcp.currentStock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      value={selectedDoQty}
                      onChange={(e) => setSelectedDoQty(Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToDo}
                  className="w-full py-1.5 bg-[#C2410C] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  + Masukkan ke Daftar Surat Jalan
                </button>

                {/* Items in DO */}
                <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                  {doItems.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] bg-white p-1.5 rounded border border-amber-100">
                      <span>{it.qty} Pcs {it.productName}</span>
                      <span className="font-bold text-slate-800">Rp {it.total.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Driver / Kurir:</label>
                  <input
                    type="text"
                    value={doDriver}
                    onChange={(e) => setDoDriver(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nomor Polisi Kendaraan:</label>
                  <input
                    type="text"
                    value={doVehicle}
                    onChange={(e) => setDoVehicle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDoModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Terbitkan Surat Jalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Input Retur Barang */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-500" />
              Catat Retur Barang dari Mitra
            </h3>

            <form onSubmit={handleSaveReturn} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Mitra / Toko:</label>
                <input
                  type="text"
                  value={returnPartnerName}
                  onChange={(e) => setReturnPartnerName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Produk Retur:</label>
                <select
                  value={returnProductName}
                  onChange={(e) => setReturnProductName(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                >
                  {recipes.map((rcp) => (
                    <option key={rcp.id} value={rcp.name}>{rcp.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Jumlah Retur (Pcs):</label>
                  <input
                    type="number"
                    value={returnQty}
                    onChange={(e) => setReturnQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Alasan Retur:</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="kadaluwarsa">Mendekati Kadaluwarsa</option>
                    <option value="kemasan_rusak">Kemasan Rusak / Bocor</option>
                    <option value="tidak_laku">Tidak Laku / Slow Moving</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tindakan Penggantian:</label>
                <select
                  value={returnAction}
                  onChange={(e) => setReturnAction(e.target.value as any)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="ganti_stok">Ganti Barang Batch Baru</option>
                  <option value="potong_tagihan">Potong Tagihan Saldo Toko</option>
                  <option value="pemusnahan">Pemusnahan (Afkir)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Simpan Retur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Printable Surat Jalan (Format A4 Resmi) */}
      {activeDoToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 print:hidden">
              <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#C2410C]" />
                Pratinjau Surat Jalan Resmi (Kop Surat Produsen)
              </span>
              <button
                onClick={() => setActiveDoToPrint(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-4 overflow-y-auto space-y-3 font-serif text-slate-800 text-xs">
              <div className="text-center pb-3 border-b-2 border-slate-900">
                <h2 className="font-bold text-base uppercase tracking-wider">{profile.brandName}</h2>
                <p className="text-[11px] font-sans text-slate-600">{profile.address} | Telp: {profile.phone}</p>
                <p className="text-[10px] font-sans text-slate-500 font-mono">{profile.legalNumber}</p>
              </div>

              <div className="flex justify-between text-xs font-sans py-2 border-b border-slate-200">
                <div>
                  <div><b>No. Surat Jalan:</b> {activeDoToPrint.doNumber}</div>
                  <div><b>Tanggal Kirim:</b> {activeDoToPrint.date}</div>
                </div>
                <div className="text-right">
                  <div><b>Tujuan:</b> {activeDoToPrint.partnerName}</div>
                  <div><b>Alamat:</b> {activeDoToPrint.address}</div>
                </div>
              </div>

              <table className="w-full text-left font-sans text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300">
                  <tr>
                    <th className="p-2">No</th>
                    <th className="p-2">Nama Barang Titipan</th>
                    <th className="p-2 text-center">Jumlah</th>
                    <th className="p-2 text-right">Harga Satuan</th>
                    <th className="p-2 text-right">Nilai Barang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeDoToPrint.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2 font-bold">{it.productName}</td>
                      <td className="p-2 text-center">{it.qty} Pcs</td>
                      <td className="p-2 text-right">Rp {it.unitPrice.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right font-bold">Rp {it.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-6 text-center font-sans text-xs">
                <div>
                  <span>Pengirim / Gudang</span>
                  <div className="h-12" />
                  <span className="font-bold underline">( Tim Produksi )</span>
                </div>
                <div>
                  <span>Sopir / Kurir</span>
                  <div className="h-12" />
                  <span className="font-bold underline">( {activeDoToPrint.driverName} )</span>
                </div>
                <div>
                  <span>Penerima Toko Titipan</span>
                  <div className="h-12" />
                  <span className="font-bold underline">( {activeDoToPrint.partnerName} )</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => setActiveDoToPrint(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Surat Jalan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
