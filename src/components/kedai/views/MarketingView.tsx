import React, { useState } from 'react';
import { 
  Tag, 
  Crown, 
  Gift, 
  Send, 
  Plus, 
  Share2, 
  MessageCircle, 
  CheckCircle2, 
  Percent, 
  DollarSign, 
  Copy,
  Users,
  X
} from 'lucide-react';
import { KedaiPromo, KedaiCustomer } from '../KedaiTypes';
import { TokoOnlineMarketingPanel } from '../../marketing/TokoOnlineMarketingPanel';
import { Store, QrCode } from 'lucide-react';

interface MarketingViewProps {
  promos: KedaiPromo[];
  customers: KedaiCustomer[];
  onAddPromo: (promo: Omit<KedaiPromo, 'id' | 'usedCount'>) => void;
  onTogglePromo: (id: string) => void;
  onOpenOnlineCatalog?: () => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  promos,
  customers,
  onAddPromo,
  onTogglePromo,
  onOpenOnlineCatalog
}) => {
  const [activeTab, setActiveTab] = useState<'toko-online' | 'promo' | 'poin' | 'wa'>('toko-online');
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);

  // New promo form
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoType, setPromoType] = useState<'percent' | 'nominal'>('percent');
  const [promoValue, setPromoValue] = useState<number>(15);
  const [promoMinOrder, setPromoMinOrder] = useState<number>(50000);
  const [promoValidUntil, setPromoValidUntil] = useState('2026-12-31');

  // WA Broadcast state
  const [selectedTemplate, setSelectedTemplate] = useState<'jumat' | 'weekend' | 'kangen' | 'poin'>('weekend');
  const [customMsg, setCustomMsg] = useState('');

  const waTemplates = {
    weekend: `☕ *PROMO SPESIAL AKHIR PEKAN - KEDAIQU* ☕\n\nHalo Sahabat KedaiQu! Akhir pekan saatnya santai bareng teman dan keluarga.\n\nDapatkan diskon *15%* untuk semua varian Kopi & Makanan dengan kode voucher *NGOPIHEMAT*.\n\n📍 Jl. Merdeka No. 45 (Sentra Kuliner)\n📶 Free WiFi Super Cepat & Tempat Nyaman Indoor AC/Outdoor.\n\nDitunggu kedatangannya ya! ✨`,
    jumat: `🕌 *JUMAT BERKAH - KEDAIQU* 🕌\n\nSpesial hari Jumat penuh berkah, beli 2 Cup Kopi Susu Aren GRATIS 1 Cireng Krispi Bumbu Rujak!\n\nBerlaku untuk Dine In maupun Take Away mulai pukul 13.00 WIB.\nYuk mampir ke KedaiQu! ☕✨`,
    kangen: `Halo Kak! 😊 Kami kangen kehadiran Kakak nongkrong di *KedaiQu* nih.\n\nSpesial untuk Kakak, tunjukkan pesan WhatsApp ini ke kasir dan dapatkan *GRATIS Extra Topping Boba / Espresso Shot* untuk minuman favorit Kakak!\n\nSampai jumpa nanti yaa! ☕`,
    poin: `🎉 *UPDATE POIN LOYALTY MEMBER KEDAIQU* 🎉\n\nTerima kasih sudah menjadi pelanggan setia KedaiQu!\nSetiap transaksi kelipatan Rp 10.000 bernilai 1 Poin yang bisa ditukar dengan makanan & minuman gratis pilihan Kakak.`
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    onAddPromo({
      code: promoCode.trim().toUpperCase(),
      title: promoTitle.trim() || `Promo ${promoCode.toUpperCase()}`,
      type: promoType,
      value: promoValue,
      minOrder: promoMinOrder,
      validUntil: promoValidUntil,
      active: true
    });
    setPromoCode('');
    setPromoTitle('');
    setIsAddPromoOpen(false);
  };

  const handleOpenWhatsApp = (text: string, phone?: string) => {
    const encoded = encodeURIComponent(text);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7DFD5]">
        <div>
          <h2 className="text-xl font-bold text-[#1B3B2B] flex items-center gap-2">
            <span>🏷️ Marketing, Promo & Broadcast</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#C59B27]" />
              <span>PRO 👑</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tingkatkan omset kedai dengan kupon diskon, sistem loyalitas poin, dan broadcast promo WhatsApp otomatis
          </p>
        </div>

        <button
          onClick={() => setIsAddPromoOpen(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C59B27]" />
          <span>+ Buat Kupon Diskon</span>
        </button>
      </div>

      {/* Sub Tabs Underline */}
      <div className="flex items-center gap-2 border-b border-[#E7DFD5] pb-2 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('toko-online')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'toko-online'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>Toko Online & QR Standee</span>
        </button>

        <button
          onClick={() => setActiveTab('promo')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'promo'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Kupon Diskon & Promo ({promos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('poin')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'poin'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Program Poin Member</span>
        </button>

        <button
          onClick={() => setActiveTab('wa')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'wa'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kirim Promo WhatsApp</span>
        </button>
      </div>

      {/* SUBTAB 0: TOKO ONLINE & QR STANDEE */}
      {activeTab === 'toko-online' && (
        <TokoOnlineMarketingPanel
          moduleKey="kedai"
          moduleTitle="KedaiQu Kopi & Resto"
          onOpenCatalog={onOpenOnlineCatalog}
        />
      )}
      {activeTab === 'promo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {promos.map(promo => (
            <div
              key={promo.id}
              className={`bg-white rounded-2xl border p-3.5 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                promo.active ? 'border-[#E7DFD5] hover:border-[#C59B27]' : 'border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-amber-50 text-[#1B3B2B] border border-[#C59B27]/40">
                    {promo.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    promo.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {promo.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-[#1B3B2B] mt-2.5">{promo.title}</h4>
                <p className="text-[11px] text-[#C59B27] font-bold mt-0.5">
                  {promo.type === 'percent' ? `Diskon ${promo.value}%` : `Potongan Rp ${promo.value.toLocaleString('id-ID')}`}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Minimal belanja: Rp {promo.minOrder.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  Dipakai: <strong>{promo.usedCount}x</strong>
                </span>
                <button
                  onClick={() => onTogglePromo(promo.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    promo.active ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {promo.active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: PROGRAM POIN MEMBER */}
      {activeTab === 'poin' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7DFD5] p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#C59B27]" />
              <h3 className="font-bold text-sm text-[#1B3B2B]">Aturan Poin Pelanggan Kedai</h3>
            </div>
            <p className="text-xs text-slate-600">
              Setiap pembelanjaan senilai <strong>Rp 10.000</strong>, pelanggan otomatis mendapatkan <strong>1 Poin Loyalty</strong> yang tersimpan di profil nomor WhatsApp mereka.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5] space-y-1">
                <span className="text-2xl">☕</span>
                <h4 className="font-bold text-xs text-[#1B3B2B]">Tukar 20 Poin</h4>
                <p className="text-[11px] text-slate-500">1 Cup Kopi Susu Aren Spesial Gratis</p>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5] space-y-1">
                <span className="text-2xl">🍟</span>
                <h4 className="font-bold text-xs text-[#1B3B2B]">Tukar 25 Poin</h4>
                <p className="text-[11px] text-slate-500">1 Porsi French Fries Bolognese Gratis</p>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5] space-y-1">
                <span className="text-2xl">🍳</span>
                <h4 className="font-bold text-xs text-[#1B3B2B]">Tukar 35 Poin</h4>
                <p className="text-[11px] text-slate-500">1 Porsi Nasi Goreng Spesial Komplit Gratis</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7DFD5] p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-[#1B3B2B]">Peringkat Poin Member Tertinggi</h4>
            <div className="divide-y divide-slate-100 text-xs">
              {customers.slice(0, 5).map((c, i) => (
                <div key={c.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.phone} • Tier {c.tier}</p>
                    </div>
                  </div>
                  <span className="font-black text-[#C59B27] text-sm">
                    {c.points} Poin
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: KIRIM PROMO WHATSAPP */}
      {activeTab === 'wa' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs space-y-2.5">
            <h3 className="font-bold text-xs text-[#1B3B2B] flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Pilih Template Promosi WhatsApp</span>
            </h3>

            {(['weekend', 'jumat', 'kangen', 'poin'] as const).map(key => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedTemplate === key
                    ? 'border-[#C59B27] bg-amber-50 text-[#1B3B2B] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {key === 'weekend' ? '🎉 Promo Spesial Akhir Pekan' : key === 'jumat' ? '🕌 Promo Jumat Berkah' : key === 'kangen' ? '💌 Kangen Nongkrong di KedaiQu' : '🎁 Update Saldo Poin Member'}
              </button>
            ))}
          </div>

          <div className="md:col-span-7 bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-bold text-xs text-[#1B3B2B]">Pratinjau Pesan WhatsApp</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(waTemplates[selectedTemplate]);
                    alert('Teks promosi disalin ke clipboard!');
                  }}
                  className="text-xs text-[#C59B27] hover:underline font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={10}
                value={waTemplates[selectedTemplate]}
                className="w-full p-3 rounded-xl border border-slate-200 bg-[#FAF7F2] font-mono text-xs text-slate-700 leading-relaxed focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleOpenWhatsApp(waTemplates[selectedTemplate])}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Buka WhatsApp & Kirim Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Kupon Diskon Baru */}
      {isAddPromoOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePromo} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Buat Kupon Diskon Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddPromoOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Voucher / Promo</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: NGOPIHEMAT20"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] uppercase font-bold text-[#1B3B2B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul / Keterangan Promo</label>
                <input
                  type="text"
                  placeholder="Misal: Diskon Kopi 20% Akhir Pekan"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Potongan</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as 'percent' | 'nominal')}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  >
                    <option value="percent">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nilai Diskon</label>
                  <input
                    type="number"
                    required
                    value={promoValue}
                    onChange={(e) => setPromoValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-bold text-[#C59B27]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimal Belanja (Rp)</label>
                <input
                  type="number"
                  value={promoMinOrder}
                  onChange={(e) => setPromoMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Berlaku Sampai Tanggal</label>
                <input
                  type="date"
                  value={promoValidUntil}
                  onChange={(e) => setPromoValidUntil(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddPromoOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Simpan Promo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
