/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Tag, 
  Crown, 
  Gift, 
  MessageSquare, 
  Plus, 
  Share2, 
  Check, 
  Calendar, 
  Sparkles, 
  Percent, 
  Copy,
  Users,
  Coins
} from 'lucide-react';
import { RitelPromo, RitelCustomer } from '../RitelTypes';
import { TokoOnlineMarketingPanel } from '../../marketing/TokoOnlineMarketingPanel';
import { Store } from 'lucide-react';

interface MarketingPromoViewProps {
  promos: RitelPromo[];
  customers: RitelCustomer[];
  onAddPromo: (promo: Omit<RitelPromo, 'id'>) => void;
  onTogglePromo: (promoId: string) => void;
  onDeletePromo: (promoId: string) => void;
  onOpenOnlineCatalog?: () => void;
}

export const MarketingPromoView: React.FC<MarketingPromoViewProps> = ({
  promos,
  customers,
  onAddPromo,
  onTogglePromo,
  onDeletePromo,
  onOpenOnlineCatalog
}) => {
  const [subTab, setSubTab] = useState<'toko-online' | 'promo' | 'poin' | 'broadcast'>('toko-online');

  // Promo modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoType, setPromoType] = useState<RitelPromo['type']>('diskon_persen');
  const [promoValue, setPromoValue] = useState(10);
  const [promoMinSpend, setPromoMinSpend] = useState(50000);
  const [promoValidUntil, setPromoValidUntil] = useState('2026-12-31');
  const [promoDesc, setPromoDesc] = useState('');

  // Broadcast state
  const [selectedTemplate, setSelectedTemplate] = useState<'weekend' | 'sembako' | 'member'>('weekend');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'gold' | 'selected'>('all');
  const [customMsg, setCustomMsg] = useState('');

  const handleOpenAddPromo = () => {
    setPromoCode(`PROMO${Math.floor(100 + Math.random() * 900)}`);
    setPromoTitle('');
    setPromoType('diskon_persen');
    setPromoValue(10);
    setPromoMinSpend(50000);
    setPromoValidUntil('2026-12-31');
    setPromoDesc('');
    setIsModalOpen(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || !promoTitle.trim()) return;

    onAddPromo({
      code: promoCode.trim().toUpperCase(),
      title: promoTitle.trim(),
      type: promoType,
      value: Number(promoValue),
      minSpend: Number(promoMinSpend),
      validUntil: promoValidUntil,
      isActive: true,
      description: promoDesc.trim() || 'Promo spesial belanja hemat RitelQu.'
    });

    setIsModalOpen(false);
  };

  // Broadcast template texts
  const getBroadcastText = () => {
    if (selectedTemplate === 'weekend') {
      return `🎉 *PROMO AKHIR PEKAN RITELQU MART!*\n\nHalo Sahabat RitelQu! Nikmati promo heboh diskon sembako dan minyak goreng akhir pekan ini.\n\n✨ Diskon hingga 10% untuk pembelanjaan mulai Rp 100.000\n✨ Dapatkan Poin Belanja 2x Lipat khusus Member!\n\nKunjungi RitelQu Mart sekarang juga sebelum kehabisan! 🛒`;
    }
    if (selectedTemplate === 'sembako') {
      return `🌾 *HARGA TEBUS MURAH SEMBAKO RITELQU!*\n\nStok beras, minyak goreng & mi instan di rumah mulai menipis? Belanja di RitelQu Mart dijamin paling hemat & lengkap!\n\n📍 Jl. Raya Sudirman No. 88 (Buka Setiap Hari 07.00 - 22.00 WIB)\n\nTerima pesanan antar via WhatsApp ya Bunda!`;
    }
    return `👑 *KABAR GEMBIRA KHUSUS MEMBER SETIA RITELQU!*\n\nCek saldo poin belanja Anda sekarang! Kumpulkan dan tukarkan poin Anda dengan voucher belanja hemat atau minyak goreng gratis!\n\nTerima kasih selalu setia berbelanja di RitelQu Mart.`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sub navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('toko-online')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'toko-online'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-500" />
            <span>Toko Online & QR Standee</span>
          </button>

          <button
            onClick={() => setSubTab('promo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'promo'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Diskon & Promo Bundling</span>
          </button>

          <button
            onClick={() => setSubTab('poin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'poin'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Member & Poin Belanja</span>
          </button>

          <button
            onClick={() => setSubTab('broadcast')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'broadcast'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Broadcast WA Promo</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 text-amber-600" />
              PRO
            </span>
          </button>
        </div>

        {subTab === 'promo' && (
          <button
            onClick={handleOpenAddPromo}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F97316]" />
            <span>Buat Promo Baru</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 0: Toko Online & QR Standee */}
      {subTab === 'toko-online' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <TokoOnlineMarketingPanel
              moduleKey="ritel"
              moduleTitle="RitelQu Mart & Kelontong"
              themeColor="blue"
              onOpenCatalog={onOpenOnlineCatalog}
            />
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: Diskon & Promo Bundling */}
      {subTab === 'promo' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {promos.map((prm) => (
                <div
                  key={prm.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                    prm.isActive ? 'border-[#1E3A8A]/40 ring-1 ring-blue-50' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        {prm.code}
                      </span>
                      <button
                        onClick={() => onTogglePromo(prm.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          prm.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {prm.isActive ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mb-1">
                      {prm.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                      {prm.description}
                    </p>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nilai Promo:</span>
                        <span className="font-extrabold text-[#1E3A8A]">
                          {prm.type === 'diskon_persen' ? `${prm.value}%` : `Rp ${prm.value.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min. Belanja:</span>
                        <span className="font-semibold text-slate-700">
                          Rp {prm.minSpend.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Berlaku Sampai:</span>
                        <span className="font-mono text-slate-600">{prm.validUntil}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <button
                      onClick={() => onTogglePromo(prm.id)}
                      className="text-[11px] font-bold text-[#1E3A8A] hover:underline cursor-pointer"
                    >
                      {prm.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus promo ${prm.title}?`)) onDeletePromo(prm.id);
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

      {/* SUB-VIEW 2: Member & Poin Belanja */}
      {subTab === 'poin' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-[#1E3A8A] text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-blue-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#F97316]" />
                  Loyalitas Poin Pelanggan
                </span>
                <h3 className="text-lg font-black mt-1">1 Poin Tiap Belanja Rp 10.000</h3>
                <p className="text-xs text-blue-100 mt-1 max-w-md">
                  Poin otomatis dihitung dan diakumulasikan setiap kali kasir memilih data member saat checkout transaksi.
                </p>
              </div>

              <div className="bg-white/10 px-4 py-3 rounded-2xl text-center backdrop-blur-xs">
                <div className="text-[11px] text-blue-200">Total Member Terdaftar</div>
                <div className="text-2xl font-black">{customers.length} Orang</div>
              </div>
            </div>

            {/* Top Poin Customers */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-800">
                Peringkat Akumulasi Poin Member
              </div>
              <div className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
                        {c.tier[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{c.name}</span>
                          <span className="text-[10px] bg-blue-50 text-[#1E3A8A] px-1.5 py-0.2 rounded font-mono">
                            {c.memberCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Total Belanja: Rp {c.totalSpend.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-amber-600 flex items-center justify-end gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{c.points} Poin</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Setara Kupon Rp {(c.points * 100).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <h3 className="font-extrabold text-sm">Fitur Unggulan Pro 👑: WhatsApp Promo Engine</h3>
                  <p className="text-xs text-amber-100">
                    Kirim pesan penawaran promo dan diskon langsung ke WhatsApp pelanggan tanpa ribet simpan kontak satu per satu.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left: Template choices */}
              <div className="md:col-span-5 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Pilih Template Pesan:</span>
                
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('weekend')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTemplate === 'weekend'
                      ? 'border-[#1E3A8A] bg-blue-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">Promo Akhir Pekan (Weekend Sale)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Penawaran diskon sembako dan poin 2x lipat.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('sembako')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTemplate === 'sembako'
                      ? 'border-[#1E3A8A] bg-blue-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">Tebus Murah Sembako</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ajakan restock beras, minyak dan mi instan.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('member')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTemplate === 'member'
                      ? 'border-[#1E3A8A] bg-blue-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">Apresiasi & Tukar Poin Member</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pengingat penukaran poin hadiah loyalitas.</p>
                </button>
              </div>

              {/* Right: Message preview & Send */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">Pratinjau Pesan Siap Kirim:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getBroadcastText());
                        alert('Teks promo berhasil disalin ke clipboard!');
                      }}
                      className="text-[11px] text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Salin Teks
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {getBroadcastText()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Kirim ke member: {customers[0]?.name}
                  </span>

                  <a
                    href={`https://wa.me/${customers[0]?.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getBroadcastText())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Kirim Broadcast via WA</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Promo Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#F97316]" />
              Buat Program Diskon & Promo Baru
            </h3>

            <form onSubmit={handleSavePromo} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Kode Promo:</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tipe Promo:</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="diskon_persen">Diskon Persen (%)</option>
                    <option value="diskon_nominal">Diskon Nominal (Rp)</option>
                    <option value="bundling">Promo Bundling</option>
                    <option value="beli_gratis">Tebus Murah / Gratis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Judul Promo:</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Contoh: Diskon 10% Minyak Goreng"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Nilai ({promoType === 'diskon_persen' ? '%' : 'Rp'}):
                  </label>
                  <input
                    type="number"
                    value={promoValue}
                    onChange={(e) => setPromoValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Min. Belanja (Rp):</label>
                  <input
                    type="number"
                    value={promoMinSpend}
                    onChange={(e) => setPromoMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Keterangan / Syarat:</label>
                <input
                  type="text"
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  placeholder="Khusus member terdaftar"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 cursor-pointer"
                >
                  Simpan Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
