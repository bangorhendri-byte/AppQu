/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Plus, 
  Check, 
  FileText, 
  Clock, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  RitelProduct, 
  StockOpnameSession, 
  DamagedGoodRecord, 
  StockOpnameItem 
} from '../RitelTypes';

interface StokOpnameViewProps {
  products: RitelProduct[];
  opnames: StockOpnameSession[];
  damaged: DamagedGoodRecord[];
  onSaveOpname: (session: StockOpnameSession) => void;
  onAddDamaged: (dmg: DamagedGoodRecord) => void;
  onApplyStockAdjustment: (items: StockOpnameItem[]) => void;
}

export const StokOpnameView: React.FC<StokOpnameViewProps> = ({
  products,
  opnames,
  damaged,
  onSaveOpname,
  onAddDamaged,
  onApplyStockAdjustment
}) => {
  const [subTab, setSubTab] = useState<'input' | 'damaged' | 'adjustment'>('input');
  const [searchQuery, setSearchQuery] = useState('');

  // Physical Counts in progress: mapping productId -> physical count
  const [physicalCounts, setPhysicalCounts] = useState<{ [id: string]: number }>(() => {
    const initial: { [id: string]: number } = {};
    products.forEach((p) => {
      initial[p.id] = p.stock;
    });
    return initial;
  });

  // Damaged modal
  const [isDmgModalOpen, setIsDmgModalOpen] = useState(false);
  const [dmgProductId, setDmgProductId] = useState(products[0]?.id || '');
  const [dmgQty, setDmgQty] = useState(1);
  const [dmgType, setDmgType] = useState<DamagedGoodRecord['type']>('rusak');
  const [dmgAction, setDmgAction] = useState<DamagedGoodRecord['action']>('pemusnahan');
  const [dmgNotes, setDmgNotes] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdatePhysical = (id: string, value: number) => {
    setPhysicalCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, value)
    }));
  };

  // Execute adjustment & save session
  const handleExecuteAdjustment = () => {
    const items: StockOpnameItem[] = products.map((p) => {
      const physical = physicalCounts[p.id] !== undefined ? physicalCounts[p.id] : p.stock;
      const difference = physical - p.stock;
      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        systemStock: p.stock,
        physicalStock: physical,
        difference,
        costPrice: p.costPrice,
        diffValue: difference * p.costPrice,
        reason: difference < 0 ? 'Selisih minus opname' : difference > 0 ? 'Selisih lebih opname' : 'Sesuai'
      };
    });

    const diffItems = items.filter((it) => it.difference !== 0);
    const totalDiffValue = diffItems.reduce((acc, it) => acc + it.diffValue, 0);

    const now = new Date();
    const newSession: StockOpnameSession = {
      id: `opn-${Date.now()}`,
      opnameNumber: `SO-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`,
      date: now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      checkerName: 'Supervisor Toko',
      status: 'disesuaikan',
      items: diffItems,
      totalDiffValue,
      notes: `Penyesuaian stok fisik otomatis untuk ${diffItems.length} produk.`
    };

    onSaveOpname(newSession);
    onApplyStockAdjustment(items);
    alert('Penyesuaian stok berhasil diterapkan ke master katalog!');
  };

  const handleSaveDamaged = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === dmgProductId);
    if (!prod) return;

    const newDmg: DamagedGoodRecord = {
      id: `dmg-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      productId: prod.id,
      sku: prod.sku,
      name: prod.name,
      qty: Number(dmgQty),
      unit: prod.unit,
      type: dmgType,
      costPrice: prod.costPrice,
      reportedBy: 'Kasir / Staff Display',
      action: dmgAction,
      notes: dmgNotes || 'Pencatatan kerusakan barang operasional.'
    };

    onAddDamaged(newDmg);
    setIsDmgModalOpen(false);
    setDmgNotes('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('input')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'input'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Input Opname Fisik Rak</span>
          </button>

          <button
            onClick={() => setSubTab('damaged')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'damaged'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Barang Rusak / Expired ({damaged.length})</span>
          </button>

          <button
            onClick={() => setSubTab('adjustment')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'adjustment'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Riwayat Sesi Adjustment</span>
          </button>
        </div>

        {subTab === 'input' && (
          <button
            onClick={handleExecuteAdjustment}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Eksekusi Penyesuaian Stok</span>
          </button>
        )}

        {subTab === 'damaged' && (
          <button
            onClick={() => setIsDmgModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Barang Rusak</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Input Opname Fisik */}
      {subTab === 'input' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-3.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-80 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari SKU atau nama barang..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="text-xs text-slate-500">
                Ketik jumlah fisik di kolom <b>Hitung Fisik</b>. Selisih dan nilai rupiah dihitung otomatis.
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">SKU & Rak</th>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3 text-center">Stok Sistem</th>
                      <th className="px-4 py-3 text-center">Hitung Fisik Rak</th>
                      <th className="px-4 py-3 text-center">Selisih Unit</th>
                      <th className="px-4 py-3 text-right">Nilai Selisih (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const physical = physicalCounts[p.id] !== undefined ? physicalCounts[p.id] : p.stock;
                      const diff = physical - p.stock;
                      const diffRp = diff * p.costPrice;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#1E3A8A]">
                            <div>{p.sku}</div>
                            <div className="text-[10px] text-slate-400 font-sans">{p.shelfLocation}</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {p.name}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700">
                            {p.stock} {p.unit}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              value={physical}
                              onChange={(e) => handleUpdatePhysical(p.id, Number(e.target.value))}
                              className="w-20 text-center py-1 px-2 border-2 border-slate-200 focus:border-[#1E3A8A] rounded-lg font-black text-slate-900"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              diff === 0 ? 'bg-slate-100 text-slate-600' :
                              diff > 0 ? 'bg-emerald-100 text-emerald-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {diff > 0 ? `+${diff}` : diff} {p.unit}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-black ${
                            diffRp === 0 ? 'text-slate-400' :
                            diffRp > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            Rp {diffRp.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Laporan Barang Rusak / Expired */}
      {subTab === 'damaged' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3 text-center">Qty Rusak</th>
                      <th className="px-4 py-3 text-center">Tipe Kerusakan</th>
                      <th className="px-4 py-3 text-center">Tindakan</th>
                      <th className="px-4 py-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {damaged.map((dmg) => (
                      <tr key={dmg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-600">{dmg.date}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{dmg.name}</td>
                        <td className="px-4 py-3 text-center font-bold text-rose-600">
                          {dmg.qty} {dmg.unit}
                        </td>
                        <td className="px-4 py-3 text-center uppercase text-[10px] font-bold text-slate-700">
                          {dmg.type}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-50 text-[#1E3A8A] font-bold text-[10px] px-2 py-0.5 rounded">
                            {dmg.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{dmg.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Riwayat Sesi Adjustment */}
      {subTab === 'adjustment' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {opnames.map((opn) => (
              <div key={opn.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#1E3A8A]">
                      {opn.opnameNumber}
                    </span>
                    <span className="text-xs text-slate-500">• {opn.date}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    DISETUJUI & DISESUAIKAN
                  </span>
                </div>

                <div className="text-xs text-slate-600 mb-2">
                  Penanggung Jawab: <b>{opn.checkerName}</b> ({opn.items.length} item disesuaikan)
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  {opn.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{it.name} (Sistem: {it.systemStock} ➔ Fisik: {it.physicalStock})</span>
                      <span className={it.difference >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {it.difference >= 0 ? `+${it.difference}` : it.difference} (Rp {it.diffValue.toLocaleString('id-ID')})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Input Barang Rusak */}
      {isDmgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Catat Barang Rusak / Expired
            </h3>

            <form onSubmit={handleSaveDamaged} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Produk:</label>
                <select
                  value={dmgProductId}
                  onChange={(e) => setDmgProductId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Jumlah Rusak:</label>
                  <input
                    type="number"
                    value={dmgQty}
                    onChange={(e) => setDmgQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tipe Kendala:</label>
                  <select
                    value={dmgType}
                    onChange={(e) => setDmgType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="rusak">Kemasan Rusak / Pecah</option>
                    <option value="expired">Kadaluwarsa (Expired)</option>
                    <option value="bocor">Bocor / Rembes</option>
                    <option value="hilang">Hilang / Selisih</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tindakan Lanjutan:</label>
                <select
                  value={dmgAction}
                  onChange={(e) => setDmgAction(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="pemusnahan">Pemusnahan (Buang)</option>
                  <option value="retur_supplier">Retur ke Distributor / Supplier</option>
                  <option value="koreksi_stok">Koreksi Stok Saja</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Keterangan Tambahan:</label>
                <input
                  type="text"
                  value={dmgNotes}
                  onChange={(e) => setDmgNotes(e.target.value)}
                  placeholder="Contoh: Jatuh tersenggol saat display rak"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDmgModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                >
                  Simpan & Potong Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
