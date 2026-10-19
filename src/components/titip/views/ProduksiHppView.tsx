/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Factory, 
  Calculator, 
  Boxes, 
  Plus, 
  Check, 
  Trash2, 
  Play, 
  Clock, 
  AlertTriangle, 
  Layers,
  Sparkles,
  TrendingUp,
  Tag,
  Globe
} from 'lucide-react';
import { 
  RawMaterial, 
  ProductRecipe, 
  ProductionBatch, 
  RecipeMaterialItem 
} from '../TitipTypes';
import { ImageUploadWithCompression } from '../../common/ImageUploadWithCompression';
import { OnlineStoreToggle } from '../../common/OnlineStoreToggle';

interface ProduksiHppViewProps {
  recipes: ProductRecipe[];
  materials: RawMaterial[];
  batches: ProductionBatch[];
  onAddRecipe: (recipe: ProductRecipe) => void;
  onUpdateRecipe: (recipe: ProductRecipe) => void;
  onAddMaterial: (mat: RawMaterial) => void;
  onUpdateMaterial: (mat: RawMaterial) => void;
  onCreateBatch: (batch: ProductionBatch) => void;
  onCompleteBatch: (batchId: string, actualQty: number) => void;
}

export const ProduksiHppView: React.FC<ProduksiHppViewProps> = ({
  recipes,
  materials,
  batches,
  onAddRecipe,
  onUpdateRecipe,
  onAddMaterial,
  onUpdateMaterial,
  onCreateBatch,
  onCompleteBatch
}) => {
  const [subTab, setSubTab] = useState<'kalkulator' | 'bahan' | 'batch'>('kalkulator');

  // Modal Recipe State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Camilan');
  const [unit, setUnit] = useState('Pouch');
  const [recipeMaterials, setRecipeMaterials] = useState<RecipeMaterialItem[]>([]);
  const [laborCost, setLaborCost] = useState(1500);
  const [overheadCost, setOverheadCost] = useState(800);
  const [retailPrice, setRetailPrice] = useState(18000);
  const [consignmentPrice, setConsignmentPrice] = useState(15000);
  const [resellerPrice, setResellerPrice] = useState(12500);
  const [recipePhotoUrl, setRecipePhotoUrl] = useState('');
  const [recipeShowOnline, setRecipeShowOnline] = useState(true);
  const [recipeVendorName, setRecipeVendorName] = useState('');

  // Material item to add into recipe
  const [selectedMatId, setSelectedMatId] = useState(materials[0]?.id || '');
  const [selectedMatQty, setSelectedMatQty] = useState(0.1);

  // Modal New Raw Material
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [matName, setMatName] = useState('');
  const [matUnit, setMatUnit] = useState('kg');
  const [matCost, setMatCost] = useState(10000);
  const [matStock, setMatStock] = useState(50);
  const [matMin, setMatMin] = useState(10);
  const [matSupplier, setMatSupplier] = useState('');

  // Modal New Batch
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRecipeId, setBatchRecipeId] = useState(recipes[0]?.id || '');
  const [batchTargetQty, setBatchTargetQty] = useState(100);
  const [batchOperator, setBatchOperator] = useState('Tim Masak & Produksi');
  const [batchNotes, setBatchNotes] = useState('');

  // Calculate Materials Subtotal in Modal
  const calculatedMaterialsCost = recipeMaterials.reduce((sum, item) => sum + item.subtotal, 0);
  const calculatedHpp = calculatedMaterialsCost + Number(laborCost) + Number(overheadCost);

  const handleAddMaterialToRecipe = () => {
    const mat = materials.find((m) => m.id === selectedMatId);
    if (!mat) return;

    const subtotal = mat.costPerUnit * Number(selectedMatQty);
    setRecipeMaterials((prev) => [
      ...prev,
      {
        materialId: mat.id,
        materialName: mat.name,
        qty: Number(selectedMatQty),
        unit: mat.unit,
        unitCost: mat.costPerUnit,
        subtotal
      }
    ]);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRecipe: ProductRecipe = {
      id: `rec-${Date.now()}`,
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      category,
      unit,
      rawMaterials: recipeMaterials,
      materialsCost: calculatedMaterialsCost,
      laborCostPerPcs: Number(laborCost),
      overheadCostPerPcs: Number(overheadCost),
      hppPerPcs: calculatedHpp,
      sellingPriceRetail: Number(retailPrice),
      consignmentPrice: Number(consignmentPrice),
      resellerPrice: Number(resellerPrice),
      currentStock: 0,
      photoUrl: recipePhotoUrl || undefined,
      showInOnlineStore: recipeShowOnline,
      vendorName: recipeVendorName.trim() || undefined
    };

    onAddRecipe(newRecipe);
    setIsRecipeModalOpen(false);
    // Reset
    setName('');
    setRecipeMaterials([]);
    setRecipePhotoUrl('');
    setRecipeShowOnline(true);
    setRecipeVendorName('');
  };

  const handleSaveRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName.trim()) return;

    const newMat: RawMaterial = {
      id: `mat-${Date.now()}`,
      code: `BAHAN-${Math.floor(100 + Math.random() * 900)}`,
      name: matName.trim(),
      category: 'Bahan Pokok',
      unit: matUnit,
      costPerUnit: Number(matCost),
      stock: Number(matStock),
      minStock: Number(matMin),
      supplierName: matSupplier.trim() || 'Pemasok Lokal'
    };

    onAddMaterial(newMat);
    setIsMatModalOpen(false);
    setMatName('');
  };

  const handleStartBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find((r) => r.id === batchRecipeId);
    if (!recipe) return;

    const newBatch: ProductionBatch = {
      id: `bth-${Date.now()}`,
      batchNumber: `BTH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      recipeId: recipe.id,
      productName: recipe.name,
      targetQty: Number(batchTargetQty),
      actualQty: Number(batchTargetQty),
      startDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'proses',
      totalHpp: recipe.hppPerPcs * Number(batchTargetQty),
      operatorName: batchOperator,
      notes: batchNotes
    };

    onCreateBatch(newBatch);
    setIsBatchModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub-tab switcher */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('kalkulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'kalkulator'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator HPP & Resep</span>
          </button>

          <button
            onClick={() => setSubTab('bahan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'bahan'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Stok Bahan Baku ({materials.length})</span>
          </button>

          <button
            onClick={() => setSubTab('batch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'batch'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Batch Produksi ({batches.length})</span>
          </button>
        </div>

        {subTab === 'kalkulator' && (
          <button
            onClick={() => setIsRecipeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Buat Resep / Produk Baru</span>
          </button>
        )}

        {subTab === 'bahan' && (
          <button
            onClick={() => setIsMatModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Tambah Bahan Baku</span>
          </button>
        )}

        {subTab === 'batch' && (
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#F59E0B] fill-current" />
            <span>Mulai Batch Produksi</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: Formulasi Resep & Kalkulator HPP */}
      {subTab === 'kalkulator' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {recipes.map((rcp) => {
                const marginRetail = rcp.sellingPriceRetail > 0 ? (((rcp.sellingPriceRetail - rcp.hppPerPcs) / rcp.sellingPriceRetail) * 100).toFixed(0) : 0;
                const marginReseller = rcp.resellerPrice > 0 ? (((rcp.resellerPrice - rcp.hppPerPcs) / rcp.resellerPrice) * 100).toFixed(0) : 0;

                return (
                  <div
                    key={rcp.id}
                    className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs hover:border-[#C2410C] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          {rcp.sku}
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                          Stok Jadi: {rcp.currentStock} {rcp.unit}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 mb-2">
                        {rcp.name}
                      </h4>

                      {/* HPP Breakdown Pill */}
                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 space-y-1.5 text-[11px] mb-3">
                        <div className="flex justify-between text-slate-600">
                          <span>Biaya Bahan Baku:</span>
                          <span className="font-semibold text-slate-800">
                            Rp {rcp.materialsCost.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Upah Tenaga/Pcs:</span>
                          <span className="font-semibold text-slate-800">
                            Rp {rcp.laborCostPerPcs.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Overhead & Kemasan:</span>
                          <span className="font-semibold text-slate-800">
                            Rp {rcp.overheadCostPerPcs.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-amber-200 flex justify-between font-extrabold text-xs text-[#C2410C]">
                          <span>HPP TOTAL / PCS:</span>
                          <span>Rp {rcp.hppPerPcs.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {/* Selling Channel Tiering Prices */}
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">Direct POS</span>
                          <span className="font-extrabold text-emerald-700 text-xs">
                            Rp {rcp.sellingPriceRetail.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[9px] text-emerald-600 block">+{marginRetail}%</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">Titipan</span>
                          <span className="font-extrabold text-amber-700 text-xs">
                            Rp {rcp.consignmentPrice.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[9px] text-amber-600 block">Bagi Hasil</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">Reseller</span>
                          <span className="font-extrabold text-indigo-700 text-xs">
                            Rp {rcp.resellerPrice.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[9px] text-indigo-600 block">+{marginReseller}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{rcp.rawMaterials.length} Bahan Komposisi</span>
                      <button
                        onClick={() => {
                          setBatchRecipeId(rcp.id);
                          setIsBatchModalOpen(true);
                        }}
                        className="text-[#C2410C] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Produksi Ini
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Stok Bahan Baku */}
      {subTab === 'bahan' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/80 text-amber-950 uppercase text-[10px] font-bold border-b border-amber-200">
                  <tr>
                    <th className="px-4 py-3">Kode & Nama Bahan</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-right">Harga Pokok / Satuan</th>
                    <th className="px-4 py-3 text-center">Stok Gudang</th>
                    <th className="px-4 py-3">Pemasok / Supplier</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materials.map((mat) => {
                    const isLow = mat.stock <= mat.minStock;

                    return (
                      <tr key={mat.id} className="hover:bg-amber-50/40">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div>{mat.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{mat.code}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{mat.category}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-[#C2410C]">
                          Rp {mat.costPerUnit.toLocaleString('id-ID')} / {mat.unit}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">
                          {mat.stock} {mat.unit}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{mat.supplierName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isLow ? 'MENIPIS' : 'AMAN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Batch Produksi */}
      {subTab === 'batch' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {batches.map((bth) => (
              <div
                key={bth.id}
                className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#C2410C]">
                      {bth.batchNumber}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      • {bth.productName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Mulai: {bth.startDate}</span>
                    <span>PJ: {bth.operatorName}</span>
                    <span className="font-semibold text-slate-700">
                      Target: {bth.targetQty} Pcs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Total HPP Batch:</div>
                    <div className="text-xs font-black text-slate-900">
                      Rp {bth.totalHpp.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {bth.status === 'proses' ? (
                    <button
                      onClick={() => onCompleteBatch(bth.id, bth.targetQty)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesaikan Batch</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      SELESAI (Masuk Stok)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Formulasi Resep & HPP Produk */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#F59E0B]" />
              Formulasi Resep & Kalkulasi HPP Otomatis
            </h3>

            <form onSubmit={handleSaveRecipe} className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">SKU Produk:</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="TQ-KRP-01"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Kategori:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Camilan / Makanan"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Produk:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Keripik Singkong Keju Balado"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Recipe Materials Composer */}
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold text-amber-950 block">Komposisi Bahan Baku (per Pcs):</span>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <select
                      value={selectedMatId}
                      onChange={(e) => setSelectedMatId(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} (Rp {m.costPerUnit}/{m.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="any"
                      value={selectedMatQty}
                      onChange={(e) => setSelectedMatQty(Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddMaterialToRecipe}
                      className="w-full py-1.5 bg-[#C2410C] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Selected Materials List */}
                <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                  {recipeMaterials.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] bg-white p-1.5 rounded border border-amber-100">
                      <span>{it.qty} {it.unit} {it.materialName}</span>
                      <span className="font-bold text-slate-800">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor & Overhead */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Upah Tenaga Kerja/Pcs:</label>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Overhead & Kemasan/Pcs:</label>
                  <input
                    type="number"
                    value={overheadCost}
                    onChange={(e) => setOverheadCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Calculated HPP Banner */}
              <div className="bg-[#C2410C] text-white p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-orange-200 uppercase tracking-wider block">HPP Pokok per Pcs</span>
                  <span className="text-base font-black">Rp {calculatedHpp.toLocaleString('id-ID')}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">
                  Bahan: Rp {calculatedMaterialsCost}
                </span>
              </div>

              {/* Channel Pricing */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Harga Retail (POS):</label>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Harga Titipan:</label>
                  <input
                    type="number"
                    value={consignmentPrice}
                    onChange={(e) => setConsignmentPrice(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Harga Reseller:</label>
                  <input
                    type="number"
                    value={resellerPrice}
                    onChange={(e) => setResellerPrice(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700"
                  />
                </div>
              </div>

              {/* Vendor / Mitra Titipan */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Vendor / Supplier Titipan (Opsional):</label>
                <input
                  type="text"
                  value={recipeVendorName}
                  onChange={(e) => setRecipeVendorName(e.target.value)}
                  placeholder="Contoh: Dapur Bu Siti, Keripik Nusantara"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Foto Produk (Auto-WebP Compression) */}
              <div className="pt-2">
                <ImageUploadWithCompression
                  value={recipePhotoUrl}
                  onChange={setRecipePhotoUrl}
                  onClear={() => setRecipePhotoUrl('')}
                  label="Foto Produk Konsinyasi (Auto-WebP ~30-50KB)"
                />
              </div>

              {/* Sakelar Tampilkan di Toko Online */}
              <div className="pt-1">
                <OnlineStoreToggle
                  checked={recipeShowOnline}
                  onChange={setRecipeShowOnline}
                  label="Tampilkan di Toko Online TitipQu"
                  description="Produk ini akan muncul di katalog publik dan dapat dipesan pelanggan / reseller via WA."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Simpan Formulasi Resep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Bahan Baku */}
      {isMatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#F59E0B]" />
              Tambah Stok Bahan Baku
            </h3>

            <form onSubmit={handleSaveRawMaterial} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Bahan Baku:</label>
                <input
                  type="text"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  placeholder="Singkong Mentega / Cabai Kering"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Satuan Ukuran:</label>
                  <select
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="liter">Liter</option>
                    <option value="gram">Gram</option>
                    <option value="pcs">Pcs / Lembar</option>
                    <option value="meter">Meter</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Harga Beli / Satuan:</label>
                  <input
                    type="number"
                    value={matCost}
                    onChange={(e) => setMatCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Stok Masuk:</label>
                  <input
                    type="number"
                    value={matStock}
                    onChange={(e) => setMatStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Batas Minimal Stok:</label>
                  <input
                    type="number"
                    value={matMin}
                    onChange={(e) => setMatMin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Pemasok / Supplier:</label>
                <input
                  type="text"
                  value={matSupplier}
                  onChange={(e) => setMatSupplier(e.target.value)}
                  placeholder="Petani / Distributor Langganan"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMatModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Mulai Batch Produksi */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-[#F59E0B] fill-current" />
              Mulai Batch Produksi Masak / Jahit
            </h3>

            <form onSubmit={handleStartBatch} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Resep Produk:</label>
                <select
                  value={batchRecipeId}
                  onChange={(e) => setBatchRecipeId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} (HPP: Rp {r.hppPerPcs})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Jumlah Output (Pcs):</label>
                <input
                  type="number"
                  value={batchTargetQty}
                  onChange={(e) => setBatchTargetQty(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Penanggung Jawab / Operator:</label>
                <input
                  type="text"
                  value={batchOperator}
                  onChange={(e) => setBatchOperator(e.target.value)}
                  placeholder="Siti Rahma / Tim Masak"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Catatan Batch:</label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Contoh: Batch persiapan titipan weekend toko Malioboro"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Mulai Proses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
