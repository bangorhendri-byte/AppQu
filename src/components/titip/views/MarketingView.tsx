/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Tag, 
  Crown, 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  MessageSquare, 
  Sparkles, 
  Download, 
  TrendingUp,
  Package
} from 'lucide-react';
import { 
  BundlingPromo, 
  ResellerCatalogAsset, 
  ResellerPartner, 
  ConsignmentStore 
} from '../TitipTypes';
import { TokoOnlineMarketingPanel } from '../../marketing/TokoOnlineMarketingPanel';
import { Store } from 'lucide-react';

interface MarketingViewProps {
  promos: BundlingPromo[];
  assets: ResellerCatalogAsset[];
  resellers: ResellerPartner[];
  stores: ConsignmentStore[];
  onAddPromo: (promo: BundlingPromo) => void;
  onTogglePromo: (id: string) => void;
  onOpenOnlineCatalog?: () => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  promos,
  assets,
  resellers,
  stores,
  onAddPromo,
  onTogglePromo,
  onOpenOnlineCatalog
}) => {
  const [subTab, setSubTab] = useState<'toko-online' | 'bundling' | 'katalog' | 'broadcast'>('toko-online');

  // Promo modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoItems, setPromoItems] = useState('');
  const [promoPrice, setPromoPrice] = useState(500000);
  const [normalPrice, setNormalPrice] = useState(600000);

  // Broadcast state
  const [templateType, setTemplateType] = useState<'rekrut_reseller' | 'restock_titipan' | 'promo_cuan'>('rekrut_reseller');

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    const newPrm: BundlingPromo = {
      id: `prm-${Date.now()}`,
      code: promoCode.trim().toUpperCase() || `PKT-${Date.now().toString().slice(-4)}`,
      title: promoTitle.trim(),
      itemsIncluded: promoItems.trim(),
      promoPrice: Number(promoPrice),
      normalPrice: Number(normalPrice),
      validUntil: '2027-12-31',
      isActive: true
    };

    onAddPromo(newPrm);
    setIsPromoModalOpen(false);
  };

  const getBroadcastMessage = () => {
    if (templateType === 'rekrut_reseller') {
      return `📢 *PELUANG BISNIS RESELLER CAMILAN NUSANTARA!*\n\nHalo Sahabat Wirausaha! Mau mulai bisnis oleh-oleh tanpa repot produksi sendiri?\n\n✨ Modal mulai Rp 500.000 (Paket Usaha 50 Pcs Campur)\n✨ Potensi profit margin keuntungan hingga 44% per pcs!\n✨ Diberikan materi foto katalog & bimbingan jualan live TikTok/Shopee.\n\nYuk gabung jadi mitra resmi Reseller kami sekarang! Klik untuk info katalog lengkap: wa.me/6281233445566 🚀`;
    }
    if (templateType === 'restock_titipan') {
      return `📦 *JADWAL PENGIRIMAN RESTOCK TITIPAN WEEKEND*\n\nSelamat siang Bapak/Ibu Pengelola Toko & Galeri Mitra!\n\nUntuk mengantisipasi lonjakan wisatawan akhir pekan, tim Dapur Titip Qu akan melakukan kunjungan restock stok konsinyasi besok pagi.\n\nMohon konfirmasi jika ada item best seller yang perlu ditambahkan ya! Terima kasih atas kerjasama yang baik. 🙏`;
    }
    return `🔥 *PROMO SPESIAL TEBUS MURAH RESELLER!*\n\nKhusus pembelanjaan minimal 30 pcs minggu ini, dapatkan potongan langsung Rp 70.000 per karton!\n\nStok terbatas untuk batch masak baru. Amankan jatah tokomu sekarang juga! 🛒`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubTab('toko-online')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              subTab === 'toko-online'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-500" />
            <span>Toko Online & QR Standee</span>
          </button>

          <button
            onClick={() => setSubTab('bundling')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              subTab === 'bundling'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promo Bundling Paket Usaha</span>
          </button>

          <button
            onClick={() => setSubTab('katalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              subTab === 'katalog'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Assets Katalog Reseller</span>
          </button>

          <button
            onClick={() => setSubTab('broadcast')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              subTab === 'broadcast'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Broadcast WA Promo</span>
            <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5" />
              PRO
            </span>
          </button>
        </div>

        {subTab === 'bundling' && (
          <button
            onClick={() => setIsPromoModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Buat Paket Usaha</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 0: Toko Online & QR Standee */}
      {subTab === 'toko-online' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <TokoOnlineMarketingPanel
              moduleKey="titip"
              moduleTitle="TitipQu Konsinyasi & Reseller"
              themeColor="orange"
              onOpenCatalog={onOpenOnlineCatalog}
            />
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: Promo Bundling Paket Usaha */}
      {subTab === 'bundling' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {promos.map((p) => (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                    p.isActive ? 'border-[#C2410C] ring-1 ring-orange-100' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        {p.code}
                      </span>
                      <button
                        onClick={() => onTogglePromo(p.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.isActive ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mb-1">
                      {p.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 mb-3">
                      Isi Paket: {p.itemsIncluded}
                    </p>

                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Harga Normal:</span>
                        <span className="line-through">Rp {p.normalPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between font-black text-[#C2410C]">
                        <span>Harga Promo Paket:</span>
                        <span>Rp {p.promoPrice.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <span className="text-[10px] text-slate-400">Hemat Rp {(p.normalPrice - p.promoPrice).toLocaleString('id-ID')}</span>
                    <button
                      onClick={() => onTogglePromo(p.id)}
                      className="text-[#C2410C] font-bold hover:underline cursor-pointer"
                    >
                      {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Assets Katalog Reseller */}
      {subTab === 'katalog' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((ast) => (
                <div key={ast.id} className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {ast.category}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-2 mb-1">
                      {ast.title}
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">{ast.tagline}</p>

                    <div className="grid grid-cols-3 gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Harga Grosir</span>
                        <span className="font-extrabold text-indigo-700">Rp {ast.wholesalePrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">HET Retail</span>
                        <span className="font-extrabold text-slate-800">Rp {ast.suggestedRetailPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Potensi Margin</span>
                        <span className="font-black text-emerald-600">+Rp {ast.marginBenefit.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`*${ast.title}*\nHarga Modal Reseller: Rp ${ast.wholesalePrice.toLocaleString('id-ID')}\nHET Jual: Rp ${ast.suggestedRetailPrice.toLocaleString('id-ID')}\nPotensi Cuan: Rp ${ast.marginBenefit.toLocaleString('id-ID')}/pcs!`);
                        alert('Teks materi katalog disalin!');
                      }}
                      className="text-xs font-bold text-[#C2410C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Salin Info Cuan
                    </button>
                    <span className="text-[10px] text-slate-400">Siap Share ke Reseller</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Broadcast WA Promo (Badge Pro 👑) */}
      {subTab === 'broadcast' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-6 h-6 text-amber-100" />
                <div>
                  <h3 className="font-extrabold text-sm">Fitur Pro 👑: WhatsApp Partner Broadcast</h3>
                  <p className="text-xs text-amber-100">
                    Kirim pesan broadcast penawaran kemitraan ke calon reseller dan pengingat restock toko titipan secara cepat.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">Pilih Template Kemitraan:</span>

                <button
                  onClick={() => setTemplateType('rekrut_reseller')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    templateType === 'rekrut_reseller'
                      ? 'border-[#C2410C] bg-amber-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">Rekrutmen Reseller & Peluang Usaha</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Penawaran paket usaha margin 44%.</p>
                </button>

                <button
                  onClick={() => setTemplateType('restock_titipan')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    templateType === 'restock_titipan'
                      ? 'border-[#C2410C] bg-amber-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">Pengingat Restock Toko Titipan</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Konfirmasi penambahan stok weekend.</p>
                </button>

                <button
                  onClick={() => setTemplateType('promo_cuan')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    templateType === 'promo_cuan'
                      ? 'border-[#C2410C] bg-amber-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">Tebus Murah Karton Reseller</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Diskon order kuota 30 pcs.</p>
                </button>
              </div>

              {/* Message preview */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-amber-200 p-4 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-800">Pratinjau Pesan WA:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getBroadcastMessage());
                        alert('Teks pesan broadcast disalin!');
                      }}
                      className="text-[11px] text-[#C2410C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Salin Teks
                    </button>
                  </div>

                  <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {getBroadcastMessage()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Kirim ke mitra: {resellers[0]?.name || stores[0]?.name}
                  </span>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(getBroadcastMessage())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Broadcast via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Buat Paket Usaha */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#F59E0B]" />
              Buat Paket Usaha Bundling Reseller
            </h3>

            <form onSubmit={handleSavePromo} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Kode Paket:</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="PKT-MTR-50"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Judul Paket Usaha:</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Paket Usaha Reseller Pemula"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Isi Produk Bundling:</label>
                <input
                  type="text"
                  value={promoItems}
                  onChange={(e) => setPromoItems(e.target.value)}
                  placeholder="Contoh: 25 Pcs Keripik + 25 Pcs Basreng"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Harga Normal (Rp):</label>
                  <input
                    type="number"
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Harga Paket Promo (Rp):</label>
                  <input
                    type="number"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black text-[#C2410C]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Simpan Paket Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
