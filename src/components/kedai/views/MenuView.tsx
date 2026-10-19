import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  Tag, 
  Sliders, 
  Sparkles,
  Coffee,
  DollarSign
} from 'lucide-react';
import { KedaiMenuItem, MenuVariantGroup, MenuTopping } from '../KedaiTypes';
import { ImageUploadWithCompression } from '../../common/ImageUploadWithCompression';
import { OnlineStoreToggle } from '../../common/OnlineStoreToggle';

interface MenuViewProps {
  menuItems: KedaiMenuItem[];
  categories: string[];
  onAddMenuItem: (item: Omit<KedaiMenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: KedaiMenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onAddCategory: (categoryName: string) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  menuItems,
  categories,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onAddCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<KedaiMenuItem | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[1] || 'Kopi Espresso');
  const [price, setPrice] = useState<number>(18000);
  const [costPrice, setCostPrice] = useState<number>(8000);
  const [imageIcon, setImageIcon] = useState<string>('☕');
  const [stock, setStock] = useState<number>(50);
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [available, setAvailable] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [showInOnlineStore, setShowInOnlineStore] = useState<boolean>(true);

  // New Category State
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const emojiList = ['☕', '🍵', '🍹', '🍫', '🍳', '🍜', '🍗', '🍟', '🥟', '🍞', '🥤', '🍰', '🥑', '🍨'];

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory(categories[1] || 'Kopi Espresso');
    setPrice(18000);
    setCostPrice(8000);
    setImageIcon('☕');
    setStock(50);
    setIsPopular(false);
    setAvailable(true);
    setDescription('');
    setPhotoUrl('');
    setShowInOnlineStore(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: KedaiMenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setCostPrice(item.costPrice);
    setImageIcon(item.imageIcon);
    setStock(item.stock);
    setIsPopular(item.isPopular || false);
    setAvailable(item.available);
    setDescription(item.description || '');
    setPhotoUrl(item.photoUrl || '');
    setShowInOnlineStore(item.showInOnlineStore !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      onUpdateMenuItem({
        ...editingItem,
        name: name.trim(),
        category,
        price,
        costPrice,
        imageIcon,
        stock,
        isPopular,
        available,
        description: description.trim(),
        photoUrl: photoUrl || undefined,
        showInOnlineStore
      });
    } else {
      onAddMenuItem({
        name: name.trim(),
        category,
        price,
        costPrice,
        imageIcon,
        stock,
        isPopular,
        available,
        description: description.trim(),
        photoUrl: photoUrl || undefined,
        showInOnlineStore
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7DFD5]">
        <div>
          <h2 className="text-xl font-bold text-[#1B3B2B] flex items-center gap-2">
            <span>📋 Daftar Menu, Varian & Kategori</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola katalog makanan, minuman, harga jual, margin modal (COGS), dan varian topping kedai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewCatModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E7DFD5] bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-xs"
          >
            <Tag className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>+ Kategori</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-all flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#C59B27]" />
            <span>+ Tambah Menu</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama menu atau minuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7DFD5] bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
          />
        </div>

        {/* Filter Kategori Underline */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                selectedCategory === cat
                  ? 'border-[#C59B27] text-[#1B3B2B] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map(item => {
          const margin = item.price - item.costPrice;
          const marginPercent = Math.round((margin / item.price) * 100);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-3.5 shadow-xs transition-all flex flex-col justify-between space-y-2.5 ${
                !item.available ? 'opacity-60 border-slate-200' : 'border-[#E7DFD5] hover:border-[#C59B27]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-[#E7DFD5] shrink-0" />
                    ) : (
                      <span className="text-3xl p-1.5 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5]">{item.imageIcon}</span>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-[#1B3B2B]">{item.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] text-slate-400">{item.category}</p>
                        {item.showInOnlineStore !== false && (
                          <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Toko Online
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.isPopular && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ★ Populer
                      </span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.available ? 'Tersedia' : 'Habis'}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Varian & Topping info jika ada */}
                {item.variantGroups && item.variantGroups.length > 0 && (
                  <div className="mt-2 text-[10px] text-slate-500 bg-[#FAF7F2] px-2 py-1 rounded-lg">
                    ✨ Varian: {item.variantGroups.map(v => v.name).join(', ')}
                  </div>
                )}
              </div>

              {/* Harga & Margin */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-sm text-[#C59B27]">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Modal: Rp {item.costPrice.toLocaleString('id-ID')} (Laba {marginPercent}%)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-semibold text-slate-500">
                    Sisa Stok: <strong className="text-slate-800">{item.stock} porsi</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#1B3B2B] hover:bg-slate-100"
                      title="Edit Menu"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus menu "${item.name}"?`)) {
                          onDeleteMenuItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus Menu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-[#E7DFD5]">
          <Coffee className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-600 text-sm">Tidak Ada Menu Ditemukan</p>
          <p className="text-[11px] mt-0.5">Coba ganti kata kunci pencarian atau tambah menu baru.</p>
        </div>
      )}

      {/* Modal Tambah / Edit Menu */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">
                {editingItem ? 'Edit Menu Kedai' : 'Tambah Menu Baru'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-80 overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Menu Makanan / Minuman</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kopi Susu Aren Gula Semut"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#C59B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Icon Emoji</label>
                  <div className="flex gap-1 overflow-x-auto p-1 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5]">
                    {emojiList.map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setImageIcon(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center ${
                          imageIcon === emoji ? 'bg-[#1B3B2B] text-white shadow-xs' : 'hover:bg-slate-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-bold text-[#1B3B2B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Modal / COGS (Rp)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Porsi / Stok Tersedia Hari Ini</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan bahan atau rasa menu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                  />
                  <span className="font-medium text-slate-700">Tandai Menu Best-Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                  />
                  <span className="font-medium text-slate-700">Tersedia untuk Dipesan</span>
                </label>
              </div>

              {/* Foto Menu (Auto-WebP Compression) */}
              <div className="pt-2">
                <ImageUploadWithCompression
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  onClear={() => setPhotoUrl('')}
                  label="Foto Menu Kuliner (Auto-WebP ~30-50KB)"
                />
              </div>

              {/* Toggle Toko Online */}
              <div className="pt-1">
                <OnlineStoreToggle
                  checked={showInOnlineStore}
                  onChange={setShowInOnlineStore}
                  label="Tampilkan di Toko Online Kedai"
                  description="Menu ini akan tampil di daftar katalog online untuk pemesanan dine-in & takeaway via WA."
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs"
              >
                {editingItem ? 'Simpan Perubahan' : 'Tambahkan Menu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {isNewCatModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCatName.trim()) {
                onAddCategory(newCatName.trim());
                setNewCatName('');
                setIsNewCatModalOpen(false);
              }
            }}
            className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#1B3B2B]">Tambah Kategori Menu</h3>
              <button
                type="button"
                onClick={() => setIsNewCatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <label className="block font-semibold text-slate-700">Nama Kategori Baru:</label>
              <input
                type="text"
                required
                placeholder="Misal: Mocktail & Soda, Artisan Tea..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#C59B27]"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsNewCatModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Simpan Kategori
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
