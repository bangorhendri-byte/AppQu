import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  CheckCircle2, 
  Calendar, 
  DollarSign,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { KedaiIngredient, KedaiShoppingRecord } from '../KedaiTypes';

interface BahanViewProps {
  ingredients: KedaiIngredient[];
  shoppingRecords: KedaiShoppingRecord[];
  onUpdateIngredient: (ingredient: KedaiIngredient) => void;
  onAddIngredient: (ingredient: Omit<KedaiIngredient, 'id'>) => void;
  onAddShoppingRecord: (record: Omit<KedaiShoppingRecord, 'id'>) => void;
}

export const BahanView: React.FC<BahanViewProps> = ({
  ingredients,
  shoppingRecords,
  onUpdateIngredient,
  onAddIngredient,
  onAddShoppingRecord
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stok' | 'belanja'>('stok');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddBahanOpen, setIsAddBahanOpen] = useState(false);
  const [isAddShoppingOpen, setIsAddShoppingOpen] = useState(false);

  // New Ingredient form
  const [newBahanName, setNewBahanName] = useState('');
  const [newBahanCategory, setNewBahanCategory] = useState('Kopi');
  const [newBahanStock, setNewBahanStock] = useState<number>(10);
  const [newBahanUnit, setNewBahanUnit] = useState('Kg');
  const [newBahanMinStock, setNewBahanMinStock] = useState<number>(3);
  const [newBahanCost, setNewBahanCost] = useState<number>(50000);
  const [newBahanSupplier, setNewBahanSupplier] = useState('');

  // Shopping form
  const [shopIngredientName, setShopIngredientName] = useState('');
  const [shopQty, setShopQty] = useState<number>(1);
  const [shopUnit, setShopUnit] = useState('Kg');
  const [shopCost, setShopCost] = useState<number>(50000);
  const [shopSupplier, setShopSupplier] = useState('Pasar Tradisional');
  const [shopNotes, setShopNotes] = useState('');

  // Warnings
  const lowStockIngredients = ingredients.filter(ing => ing.stock <= ing.minStock);

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustStock = (ing: KedaiIngredient, delta: number) => {
    const updatedStock = Math.max(0, Number((ing.stock + delta).toFixed(2)));
    onUpdateIngredient({
      ...ing,
      stock: updatedStock,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const handleSaveBahan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBahanName.trim()) return;
    onAddIngredient({
      name: newBahanName.trim(),
      category: newBahanCategory,
      stock: newBahanStock,
      unit: newBahanUnit,
      minStock: newBahanMinStock,
      costPerUnit: newBahanCost,
      supplier: newBahanSupplier.trim() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    setNewBahanName('');
    setIsAddBahanOpen(false);
  };

  const handleSaveShopping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopIngredientName.trim()) return;
    onAddShoppingRecord({
      date: new Date().toISOString().split('T')[0],
      ingredientName: shopIngredientName.trim(),
      qty: shopQty,
      unit: shopUnit,
      totalCost: shopCost,
      supplier: shopSupplier.trim(),
      notes: shopNotes.trim() || undefined
    });

    // Also auto-restock ingredient if it matches
    const matchingIng = ingredients.find(i => i.name.toLowerCase() === shopIngredientName.trim().toLowerCase());
    if (matchingIng) {
      onUpdateIngredient({
        ...matchingIng,
        stock: matchingIng.stock + shopQty,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }

    setShopIngredientName('');
    setIsAddShoppingOpen(false);
  };

  const openQuickShoppingForLowStock = (ing: KedaiIngredient) => {
    setShopIngredientName(ing.name);
    setShopUnit(ing.unit);
    setShopQty(Math.ceil(ing.minStock * 2));
    setShopCost(Math.round(ing.costPerUnit * Math.ceil(ing.minStock * 2)));
    setShopSupplier(ing.supplier || 'Pasar Tradisional');
    setIsAddShoppingOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7DFD5]">
        <div>
          <h2 className="text-xl font-bold text-[#1B3B2B] flex items-center gap-2">
            <span>📦 Manajemen Stok Bahan Baku & Belanja</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring stok biji kopi, susu, sirup aren, kemasan cup, serta catatan belanja pasar kedai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddShoppingOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E7DFD5] bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>+ Catat Belanja Pasar</span>
          </button>

          <button
            onClick={() => setIsAddBahanOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-all flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#C59B27]" />
            <span>+ Tambah Bahan</span>
          </button>
        </div>
      </div>

      {/* Warning Alert Banner jika ada stok kritis */}
      {lowStockIngredients.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-rose-900">
                Peringatan: {lowStockIngredients.length} Bahan Baku Menipis di Bawah Batas Minimum!
              </h4>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Segera jadwalkan belanja pasar agar operasional kopi & dapur tidak terganggu.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {lowStockIngredients.map(ing => (
                  <span key={ing.id} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-rose-300 text-rose-800">
                    {ing.name}: sisa {ing.stock} {ing.unit} (min {ing.minStock} {ing.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => openQuickShoppingForLowStock(lowStockIngredients[0])}
            className="px-3 py-1.5 bg-rose-700 text-white rounded-xl font-bold text-xs hover:bg-rose-800 transition-colors shrink-0 shadow-xs flex items-center gap-1"
          >
            <span>Belanja Bahan Menipis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub Tabs: Stok Bahan vs Riwayat Belanja */}
      <div className="flex items-center gap-2 border-b border-[#E7DFD5] pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('stok')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'stok'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Daftar Stok Bahan Baku ({ingredients.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('belanja')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'belanja'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Riwayat Belanja Pasar ({shoppingRecords.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: DAFTAR STOK */}
      {activeSubTab === 'stok' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari bahan baku (misal: kopi, susu, cup, ayam)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7DFD5] bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredIngredients.map(ing => {
              const isLow = ing.stock <= ing.minStock;

              return (
                <div
                  key={ing.id}
                  className={`bg-white rounded-2xl border p-3.5 shadow-xs transition-all flex flex-col justify-between space-y-2.5 ${
                    isLow ? 'border-rose-300 ring-1 ring-rose-200' : 'border-[#E7DFD5]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#1B3B2B]">{ing.name}</h4>
                        <p className="text-[10px] text-slate-400">{ing.category} • Supplier: {ing.supplier || 'Lokal'}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLow ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isLow ? 'Stok Menipis' : 'Stok Aman'}
                      </span>
                    </div>

                    <div className="mt-3 p-2 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500">Sisa Stok:</p>
                        <p className={`text-base font-black ${isLow ? 'text-rose-700' : 'text-[#1B3B2B]'}`}>
                          {ing.stock} {ing.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500">Batas Minimal:</p>
                        <p className="text-xs font-semibold text-slate-700">{ing.minStock} {ing.unit}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      @ Rp {ing.costPerUnit.toLocaleString('id-ID')}/{ing.unit}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustStock(ing, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                        title="Kurangi 1 unit"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(ing, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                        title="Tambah 1 unit"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => openQuickShoppingForLowStock(ing)}
                        className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold hover:bg-amber-200 ml-1"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: RIWAYAT BELANJA PASAR */}
      {activeSubTab === 'belanja' && (
        <div className="bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-bold text-[#1B3B2B]">Catatan Belanja Bahan & Pasar Terakhir</span>
            <span className="text-slate-500">
              Total Pengeluaran: <strong>Rp {shoppingRecords.reduce((s, r) => s + r.totalCost, 0).toLocaleString('id-ID')}</strong>
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {shoppingRecords.map(rec => (
              <div key={rec.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{rec.ingredientName}</h4>
                  <p className="text-[11px] text-slate-400">
                    {rec.date} • {rec.qty} {rec.unit} • Toko: {rec.supplier}
                  </p>
                  {rec.notes && <p className="text-[10px] italic text-slate-500 mt-0.5">"{rec.notes}"</p>}
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-700 text-sm">
                    -Rp {rec.totalCost.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Tercatat di Beban</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tambah Bahan Baru */}
      {isAddBahanOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBahan} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Tambah Bahan Baku Baru</h3>
              <button 
                type="button"
                onClick={() => setIsAddBahanOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Susu Oat Barista Edition"
                  value={newBahanName}
                  onChange={(e) => setNewBahanName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newBahanCategory}
                    onChange={(e) => setNewBahanCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  >
                    <option value="Kopi">Kopi</option>
                    <option value="Dairy">Dairy / Susu</option>
                    <option value="Sirup">Sirup & Flavour</option>
                    <option value="Dapur">Dapur Makanan</option>
                    <option value="Kemasan">Kemasan & Cup</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan Unit</label>
                  <input
                    type="text"
                    value={newBahanUnit}
                    onChange={(e) => setNewBahanUnit(e.target.value)}
                    placeholder="Kg / Liter / Pcs / Dus"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={newBahanStock}
                    onChange={(e) => setNewBahanStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Minimal Warning</label>
                  <input
                    type="number"
                    value={newBahanMinStock}
                    onChange={(e) => setNewBahanMinStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Harga Beli Rata-rata (Rp)</label>
                <input
                  type="number"
                  value={newBahanCost}
                  onChange={(e) => setNewBahanCost(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Toko Langganan</label>
                <input
                  type="text"
                  placeholder="Misal: Roastery Jaya / Pasar Minggu"
                  value={newBahanSupplier}
                  onChange={(e) => setNewBahanSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddBahanOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Simpan Bahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Catat Belanja Pasar */}
      {isAddShoppingOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveShopping} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Catat Belanja Pasar & Bahan</h3>
              <button 
                type="button"
                onClick={() => setIsAddShoppingOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Bahan yang Dibeli</label>
                <input
                  type="text"
                  required
                  placeholder="Nama bahan..."
                  value={shopIngredientName}
                  onChange={(e) => setShopIngredientName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah</label>
                  <input
                    type="number"
                    required
                    value={shopQty}
                    onChange={(e) => setShopQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={shopUnit}
                    onChange={(e) => setShopUnit(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Biaya Belanja (Rp)</label>
                <input
                  type="number"
                  required
                  value={shopCost}
                  onChange={(e) => setShopCost(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Toko / Tempat Belanja</label>
                <input
                  type="text"
                  value={shopSupplier}
                  onChange={(e) => setShopSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Keterangan..."
                  value={shopNotes}
                  onChange={(e) => setShopNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddShoppingOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Simpan & Tambah Stok
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
