/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Barcode, 
  AlertTriangle, 
  Check, 
  X, 
  Filter, 
  Layers, 
  Grid, 
  Tag, 
  Calendar,
  Sparkles,
  Globe
} from 'lucide-react';
import { RitelProduct, RitelSupplier } from '../RitelTypes';
import { ImageUploadWithCompression } from '../../common/ImageUploadWithCompression';
import { OnlineStoreToggle } from '../../common/OnlineStoreToggle';

interface StokInventoryViewProps {
  products: RitelProduct[];
  suppliers: RitelSupplier[];
  onAddProduct: (prod: Omit<RitelProduct, 'id'>) => void;
  onUpdateProduct: (prod: RitelProduct) => void;
  onDeleteProduct: (id: string) => void;
}

export const StokInventoryView: React.FC<StokInventoryViewProps> = ({
  products,
  suppliers,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [subTab, setSubTab] = useState<'katalog' | 'rak' | 'label'>('katalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState<'semua' | 'menipis' | 'aman' | 'habis'>('semua');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RitelProduct | null>(null);

  // Form State
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Sembako');
  const [formCostPrice, setFormCostPrice] = useState(0);
  const [formSellPrice, setFormSellPrice] = useState(0);
  const [formWholesalePrice, setFormWholesalePrice] = useState(0);
  const [formWholesaleMinQty, setFormWholesaleMinQty] = useState(6);
  const [formStock, setFormStock] = useState(10);
  const [formMinStock, setFormMinStock] = useState(5);
  const [formUnit, setFormUnit] = useState('Pcs');
  const [formShelfLocation, setFormShelfLocation] = useState('Rak A1');
  const [formExpiryDate, setFormExpiryDate] = useState('2027-12-31');
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formShowOnline, setFormShowOnline] = useState(true);

  // Selected products for Cetak Label Harga
  const [selectedLabelProductIds, setSelectedLabelProductIds] = useState<string[]>([]);

  // List of all categories
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  // List of racks
  const shelfLocations = Array.from(new Set(products.map((p) => p.shelfLocation || 'Rak Umum')));

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchStock = true;
    if (stockFilter === 'habis') matchStock = p.stock <= 0;
    else if (stockFilter === 'menipis') matchStock = p.stock > 0 && p.stock <= p.minStock;
    else if (stockFilter === 'aman') matchStock = p.stock > p.minStock;

    return matchCat && matchSearch && matchStock;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormSku(`899${Math.floor(100000000 + Math.random() * 900000000)}`);
    setFormName('');
    setFormCategory('Sembako');
    setFormCostPrice(10000);
    setFormSellPrice(12500);
    setFormWholesalePrice(11500);
    setFormWholesaleMinQty(6);
    setFormStock(20);
    setFormMinStock(5);
    setFormUnit('Pcs');
    setFormShelfLocation('Rak Sembako A1');
    setFormExpiryDate('2027-12-31');
    setFormSupplierId(suppliers[0]?.id || '');
    setFormPhotoUrl('');
    setFormShowOnline(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: RitelProduct) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormCostPrice(p.costPrice);
    setFormSellPrice(p.sellPrice);
    setFormWholesalePrice(p.wholesalePrice);
    setFormWholesaleMinQty(p.wholesaleMinQty);
    setFormStock(p.stock);
    setFormMinStock(p.minStock);
    setFormUnit(p.unit);
    setFormShelfLocation(p.shelfLocation);
    setFormExpiryDate(p.expiryDate || '');
    setFormSupplierId(p.supplierId || '');
    setFormPhotoUrl(p.photoUrl || '');
    setFormShowOnline(p.showInOnlineStore !== false);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formName.trim()) {
      alert('Mohon isi SKU/Barcode dan Nama Produk dengan benar.');
      return;
    }

    const sup = suppliers.find((s) => s.id === formSupplierId);

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        sku: formSku.trim(),
        name: formName.trim(),
        category: formCategory,
        costPrice: Number(formCostPrice),
        sellPrice: Number(formSellPrice),
        wholesalePrice: Number(formWholesalePrice),
        wholesaleMinQty: Number(formWholesaleMinQty),
        stock: Number(formStock),
        minStock: Number(formMinStock),
        unit: formUnit,
        shelfLocation: formShelfLocation,
        expiryDate: formExpiryDate,
        supplierId: formSupplierId || undefined,
        supplierName: sup?.name || undefined,
        photoUrl: formPhotoUrl || undefined,
        showInOnlineStore: formShowOnline
      });
    } else {
      onAddProduct({
        sku: formSku.trim(),
        name: formName.trim(),
        category: formCategory,
        costPrice: Number(formCostPrice),
        sellPrice: Number(formSellPrice),
        wholesalePrice: Number(formWholesalePrice),
        wholesaleMinQty: Number(formWholesaleMinQty),
        stock: Number(formStock),
        minStock: Number(formMinStock),
        unit: formUnit,
        shelfLocation: formShelfLocation,
        expiryDate: formExpiryDate,
        supplierId: formSupplierId || undefined,
        supplierName: sup?.name || undefined,
        photoUrl: formPhotoUrl || undefined,
        showInOnlineStore: formShowOnline
      });
    }

    setIsModalOpen(false);
  };

  // Toggle label selection for printing
  const toggleSelectLabel = (id: string) => {
    setSelectedLabelProductIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllLabels = () => {
    if (selectedLabelProductIds.length === filteredProducts.length) {
      setSelectedLabelProductIds([]);
    } else {
      setSelectedLabelProductIds(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sub-Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('katalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'katalog'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Master Katalog & SKU</span>
          </button>

          <button
            onClick={() => setSubTab('rak')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'rak'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Kategori & Rak Display</span>
          </button>

          <button
            onClick={() => setSubTab('label')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'label'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Label Harga (Shelf Talker)</span>
          </button>
        </div>

        {subTab === 'katalog' && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F97316]" />
            <span>Tambah Produk</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Master Katalog Produk & Barcode SKU */}
      {subTab === 'katalog' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-3.5">
            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari SKU, Nama Barang, atau Rak..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#1E3A8A]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Stock Status Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setStockFilter('semua')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                      stockFilter === 'semua' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setStockFilter('menipis')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                      stockFilter === 'menipis' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Menipis
                  </button>
                  <button
                    onClick={() => setStockFilter('habis')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                      stockFilter === 'habis' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Habis
                  </button>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Barcode / SKU</th>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3">Kategori & Rak</th>
                      <th className="px-4 py-3 text-right">Harga Beli</th>
                      <th className="px-4 py-3 text-right">Harga Jual</th>
                      <th className="px-4 py-3 text-center">Stok</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                          Tidak ada produk yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isOutOfStock = p.stock <= 0;
                        const isLowStock = p.stock > 0 && p.stock <= p.minStock;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-[#1E3A8A]">
                              <div className="flex items-center gap-1.5">
                                <Barcode className="w-3.5 h-3.5 text-slate-400" />
                                <span>{p.sku}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900">
                              <div>{p.name}</div>
                              {p.wholesalePrice > 0 && (
                                <div className="text-[10px] text-[#F97316] font-normal">
                                  Grosir: Rp {p.wholesalePrice.toLocaleString('id-ID')} (≥{p.wholesaleMinQty})
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold mr-1.5">
                                {p.category}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {p.shelfLocation}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-600 font-medium">
                              Rp {p.costPrice.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-right font-extrabold text-[#1E3A8A]">
                              Rp {p.sellPrice.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800">
                              {p.stock} {p.unit}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isOutOfStock ? 'bg-rose-100 text-rose-800' :
                                isLowStock ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-50 text-emerald-700'
                              }`}>
                                {isOutOfStock ? 'HABIS' : isLowStock ? 'MENIPIS' : 'AMAN'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="p-1 rounded-lg text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-100 cursor-pointer"
                                  title="Edit Produk"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus produk "${p.name}" dari katalog?`)) {
                                      onDeleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                  title="Hapus Produk"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Kategori & Rak Display */}
      {subTab === 'rak' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Tata Letak Rak Display & Kategori Produk
              </h3>
              <p className="text-xs text-slate-500">
                Kelompokkan produk ritel per rak lorong (aisle) untuk mempermudah pencarian dan restock kasir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shelfLocations.map((shelf) => {
                const shelfProducts = products.filter((p) => p.shelfLocation === shelf);
                const totalStock = shelfProducts.reduce((sum, p) => sum + p.stock, 0);

                return (
                  <div
                    key={shelf}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                            <Grid className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-xs text-slate-900">
                            {shelf}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {shelfProducts.length} Produk
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {shelfProducts.map((p) => (
                          <div key={p.id} className="flex justify-between text-[11px] text-slate-600">
                            <span className="truncate max-w-[180px]">{p.name}</span>
                            <span className="font-bold text-slate-800">{p.stock} {p.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total Unit:</span>
                      <span className="font-extrabold text-[#1E3A8A]">{totalStock} pcs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Cetak Label Harga (Shelf Talker / Price Tag) */}
      {subTab === 'label' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Label Harga & Barcode Rak (Shelf Talker)
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih produk untuk dicetak sebagai price tag resmi standar minimarket modern.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllLabels}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {selectedLabelProductIds.length === filteredProducts.length ? 'Batal Semua' : 'Pilih Semua'}
                </button>
                <button
                  onClick={() => window.print()}
                  disabled={selectedLabelProductIds.length === 0}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedLabelProductIds.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#1E3A8A] text-white hover:bg-blue-900 shadow-md'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Cetak {selectedLabelProductIds.length} Label</span>
                </button>
              </div>
            </div>

            {/* Price Tags Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-3">
              {filteredProducts.map((p) => {
                const isSelected = selectedLabelProductIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelectLabel(p.id)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#1E3A8A] bg-blue-50/40 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div className="absolute right-2 top-2 print:hidden">
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-[#1E3A8A] text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Shelf Tag Format */}
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-500 mb-0.5">
                        {p.shelfLocation} • {p.category}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-slate-400">Harga:</span>
                        <div className="text-base font-black text-[#1E3A8A]">
                          Rp {p.sellPrice.toLocaleString('id-ID')}
                        </div>
                      </div>

                      {/* Barcode Mock Rendering */}
                      <div className="mt-2 text-center bg-white p-1 rounded border border-slate-200">
                        <div className="font-mono text-[9px] tracking-widest font-black text-slate-800">
                          |||||||| | ||||||||||| | |||
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 tracking-wider">
                          {p.sku}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-[#1E3A8A] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Package className="w-4 h-4 text-[#F97316]" />
                {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Barcode / SKU:
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Kategori:
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Sembako, Minuman, dsb"
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Nama Produk:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Minyak Bimoli 2 Liter"
                  required
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Harga Beli / Pokok:
                  </label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Harga Jual Eceran:
                  </label>
                  <input
                    type="number"
                    value={formSellPrice}
                    onChange={(e) => setFormSellPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-[#1E3A8A] focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Harga Jual Grosir:
                  </label>
                  <input
                    type="number"
                    value={formWholesalePrice}
                    onChange={(e) => setFormWholesalePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Min. Qty Grosir:
                  </label>
                  <input
                    type="number"
                    value={formWholesaleMinQty}
                    onChange={(e) => setFormWholesaleMinQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Stok Saat Ini:
                  </label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Batas Min. Stok:
                  </label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Satuan:
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Bungkus">Bungkus</option>
                    <option value="Botol">Botol</option>
                    <option value="Pouch">Pouch</option>
                    <option value="Sak">Sak</option>
                    <option value="Kg">Kg</option>
                    <option value="Renteng">Renteng</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Lokasi Rak Display:
                  </label>
                  <input
                    type="text"
                    value={formShelfLocation}
                    onChange={(e) => setFormShelfLocation(e.target.value)}
                    placeholder="Contoh: Rak A1"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Tanggal Expired:
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Supplier Produk:
                </label>
                <select
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                >
                  <option value="">Pilih Supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Foto Produk (Auto-WebP Compression) */}
              <div className="pt-2">
                <ImageUploadWithCompression
                  value={formPhotoUrl}
                  onChange={setFormPhotoUrl}
                  onClear={() => setFormPhotoUrl('')}
                  label="Foto Produk Ritel (Auto-WebP ~30-50KB)"
                />
              </div>

              {/* Sakelar Tampilkan di Toko Online */}
              <div className="pt-1">
                <OnlineStoreToggle
                  checked={formShowOnline}
                  onChange={setFormShowOnline}
                  label="Tampilkan di Toko Online Ritel"
                  description="Produk ini akan tampil di katalog digital dan dapat dipesan pelanggan melalui WhatsApp."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1E3A8A] hover:bg-blue-900 text-white cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
