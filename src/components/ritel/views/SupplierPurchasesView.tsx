/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  FileText, 
  DollarSign, 
  Calendar, 
  Phone, 
  MapPin, 
  Check, 
  AlertCircle, 
  X, 
  Search,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  RitelSupplier, 
  RitelPurchaseOrder, 
  RitelProduct, 
  RitelPurchaseItem 
} from '../RitelTypes';

interface SupplierPurchasesViewProps {
  suppliers: RitelSupplier[];
  purchases: RitelPurchaseOrder[];
  products: RitelProduct[];
  onAddSupplier: (sup: Omit<RitelSupplier, 'id'>) => void;
  onUpdateSupplier: (sup: RitelSupplier) => void;
  onDeleteSupplier: (id: string) => void;
  onAddPurchase: (po: RitelPurchaseOrder) => void;
  onPayDebt: (poId: string, amount: number) => void;
}

export const SupplierPurchasesView: React.FC<SupplierPurchasesViewProps> = ({
  suppliers,
  purchases,
  products,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddPurchase,
  onPayDebt
}) => {
  const [subTab, setSubTab] = useState<'supplier' | 'inbound' | 'hutang'>('supplier');

  // Supplier modal
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supCode, setSupCode] = useState('');
  const [supPic, setSupPic] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supTop, setSupTop] = useState(14);

  // Inbound PO Form modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poStatus, setPoStatus] = useState<'lunas' | 'tempo'>('tempo');
  const [poPaidAmount, setPoPaidAmount] = useState(0);
  const [poItems, setPoItems] = useState<RitelPurchaseItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(10);
  const [itemCost, setItemCost] = useState(0);

  // Debt Payment modal
  const [selectedPoForPay, setSelectedPoForPay] = useState<RitelPurchaseOrder | null>(null);
  const [debtPayAmount, setDebtPayAmount] = useState<number>(0);

  // Total Tempo Debts
  const tempoPurchases = purchases.filter((po) => po.status === 'tempo' || po.paidAmount < po.totalAmount);
  const totalHutangUsaha = tempoPurchases.reduce((acc, po) => acc + (po.totalAmount - po.paidAmount), 0);

  const handleOpenAddSupplier = () => {
    setSupName('');
    setSupCode(`SUP-${Math.floor(100 + Math.random() * 900)}`);
    setSupPic('');
    setSupPhone('');
    setSupAddress('');
    setSupTop(14);
    setIsSupModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    onAddSupplier({
      code: supCode,
      name: supName,
      contactPerson: supPic,
      phone: supPhone,
      address: supAddress,
      paymentTermDays: Number(supTop),
      leadTimeDays: 2
    });

    setIsSupModalOpen(false);
  };

  const handleOpenInbound = () => {
    const now = new Date();
    setPoNumber(`PO-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
    setPoSupplierId(suppliers[0]?.id || '');
    setPoStatus('tempo');
    setPoPaidAmount(0);
    setPoItems([]);
    if (products[0]) {
      setSelectedProductId(products[0].id);
      setItemCost(products[0].costPrice);
    }
    setIsPoModalOpen(true);
  };

  const handleAddItemToPo = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const subtotal = itemCost * itemQty;
    setPoItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        qty: Number(itemQty),
        unit: prod.unit,
        costPrice: Number(itemCost),
        subtotal
      }
    ]);
  };

  const handleSaveInboundPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert('Tambahkan minimal 1 barang masuk ke dalam faktur.');
      return;
    }

    const sup = suppliers.find((s) => s.id === poSupplierId);
    const totalAmount = poItems.reduce((acc, it) => acc + it.subtotal, 0);

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (sup?.paymentTermDays || 14));

    const newPO: RitelPurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: poSupplierId,
      supplierName: sup?.name || 'Supplier Mitra',
      date: now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: poItems,
      totalAmount,
      paidAmount: poStatus === 'lunas' ? totalAmount : Number(poPaidAmount),
      status: poStatus === 'lunas' || Number(poPaidAmount) >= totalAmount ? 'lunas' : 'tempo',
      notes: 'Faktur barang masuk otomatis menambah stok katalog.'
    };

    onAddPurchase(newPO);
    setIsPoModalOpen(false);
  };

  const handleConfirmPayDebt = () => {
    if (!selectedPoForPay || debtPayAmount <= 0) return;
    onPayDebt(selectedPoForPay.id, debtPayAmount);
    setSelectedPoForPay(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sub-tab navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('supplier')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'supplier'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Daftar Supplier ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setSubTab('inbound')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'inbound'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Faktur Barang Masuk (PO)</span>
          </button>

          <button
            onClick={() => setSubTab('hutang')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer ${
              subTab === 'hutang'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Catatan Hutang Usaha</span>
            {totalHutangUsaha > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        {subTab === 'supplier' && (
          <button
            onClick={handleOpenAddSupplier}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F97316]" />
            <span>Tambah Supplier</span>
          </button>
        )}

        {subTab === 'inbound' && (
          <button
            onClick={handleOpenInbound}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F97316]" />
            <span>Input Barang Masuk</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Daftar Supplier */}
      {subTab === 'supplier' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#1E3A8A] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded">
                        {sup.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        TOP: {sup.paymentTermDays === 0 ? 'COD Tunai' : `${sup.paymentTermDays} Hari`}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 mb-1">
                      {sup.name}
                    </h4>

                    <div className="space-y-1 text-[11px] text-slate-600 my-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">PIC:</span>
                        <span className="font-semibold text-slate-800">{sup.contactPerson || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{sup.phone}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-slate-500">{sup.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                    <a
                      href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      Chat WA
                    </a>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus supplier ${sup.name}?`)) onDeleteSupplier(sup.id);
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Faktur Barang Masuk (PO) */}
      {subTab === 'inbound' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">No. Faktur PO</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3 text-center">Item Masuk</th>
                      <th className="px-4 py-3 text-right">Nilai Faktur</th>
                      <th className="px-4 py-3 text-right">Terbayar</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#1E3A8A]">
                          {po.poNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {po.date}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {po.supplierName}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {po.items.reduce((sum, it) => sum + it.qty, 0)} Pcs
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                          Rp {po.totalAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                          Rp {po.paidAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.status === 'lunas'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {po.status === 'lunas' ? 'LUNAS' : `TEMPO (Jt: ${po.dueDate})`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Catatan Hutang Usaha */}
      {subTab === 'hutang' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Summary Banner */}
            <div className="bg-[#1E3A8A] text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-200 font-bold uppercase tracking-wider">
                  Total Hutang Dagang / Usaha Tempo
                </span>
                <div className="text-2xl font-black mt-1">
                  Rp {totalHutangUsaha.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold">
                  {tempoPurchases.length} Faktur Belum Lunas
                </span>
              </div>
            </div>

            {/* Tempo List */}
            <div className="space-y-3">
              {tempoPurchases.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <Check className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">Semua Faktur Supplier Lunas</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tidak ada tunggakan hutang barang masuk ke supplier.
                  </p>
                </div>
              ) : (
                tempoPurchases.map((po) => {
                  const sisaHutang = po.totalAmount - po.paidAmount;

                  return (
                    <div
                      key={po.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[#1E3A8A]">
                            {po.poNumber}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            • {po.supplierName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span>Tgl Faktur: {po.date}</span>
                          <span className="text-rose-600 font-bold">
                            Jatuh Tempo: {po.dueDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Sisa Hutang:</div>
                          <div className="text-sm font-black text-rose-600">
                            Rp {sisaHutang.toLocaleString('id-ID')}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPoForPay(po);
                            setDebtPayAmount(sisaHutang);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-[#F97316]" />
                          <span>Bayar Hutang</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Supplier */}
      {isSupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#F97316]" />
              Tambah Supplier Baru
            </h3>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Supplier / PT:</label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="PT Indomarco / Agen Telur"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama PIC:</label>
                  <input
                    type="text"
                    value={supPic}
                    onChange={(e) => setSupPic(e.target.value)}
                    placeholder="Bapak Hendra"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">No. HP / WA:</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Termin Pembayaran (TOP):</label>
                <select
                  value={supTop}
                  onChange={(e) => setSupTop(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                >
                  <option value={0}>COD (Bayar Tunai saat kirim)</option>
                  <option value={7}>Tempo 7 Hari</option>
                  <option value={14}>Tempo 14 Hari</option>
                  <option value={30}>Tempo 30 Hari</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Gudang / Kantor:</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="Kawasan Industri / Pasar Induk"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 cursor-pointer"
                >
                  Simpan Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Input Faktur Masuk (PO) */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F97316]" />
              Input Faktur Penerimaan Barang Masuk (PO)
            </h3>

            <form onSubmit={handleSaveInboundPo} className="space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">No. Faktur PO:</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Supplier:</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add item to PO */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Tambah Barang Masuk:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const p = products.find((pr) => pr.id === e.target.value);
                        if (p) setItemCost(p.costPrice);
                      }}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-600">
                    Harga Beli Satuan: Rp {itemCost.toLocaleString('id-ID')}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemToPo}
                    className="px-3 py-1 rounded-lg bg-[#1E3A8A] text-white text-xs font-bold cursor-pointer"
                  >
                    + Masukkan ke List
                  </button>
                </div>
              </div>

              {/* Added Items List */}
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {poItems.map((it, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex justify-between">
                    <span>{it.qty} {it.unit} x {it.name}</span>
                    <span className="font-extrabold text-slate-800">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              {/* Payment status */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Status Pembayaran:</label>
                  <select
                    value={poStatus}
                    onChange={(e) => setPoStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="tempo">Tempo (Hutang Dagang)</option>
                    <option value="lunas">Lunas Cash/Transfer Langsung</option>
                  </select>
                </div>

                {poStatus === 'tempo' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Uang Muka / Cicil (DP):</label>
                    <input
                      type="number"
                      value={poPaidAmount}
                      onChange={(e) => setPoPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 cursor-pointer"
                >
                  Simpan & Tambah Stok Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bayar Hutang Usaha */}
      {selectedPoForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#F97316]" />
              Pelunasan Hutang Dagang
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Faktur: {selectedPoForPay.poNumber} ({selectedPoForPay.supplierName})
            </p>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nominal Pembayaran (Rp):
              </label>
              <input
                type="number"
                value={debtPayAmount}
                onChange={(e) => setDebtPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPoForPay(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPayDebt}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 cursor-pointer"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
