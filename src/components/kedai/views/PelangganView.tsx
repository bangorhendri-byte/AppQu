import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MessageSquare, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  Crown,
  Share2
} from 'lucide-react';
import { KedaiCustomer, KedaiDebt } from '../KedaiTypes';

interface PelangganViewProps {
  customers: KedaiCustomer[];
  debts: KedaiDebt[];
  onAddCustomer: (customer: Omit<KedaiCustomer, 'id' | 'points' | 'totalVisits' | 'totalSpent' | 'lastVisit'>) => void;
  onAddDebt: (debt: Omit<KedaiDebt, 'id' | 'status'>) => void;
  onSettleDebt: (debtId: string) => void;
}

export const PelangganView: React.FC<PelangganViewProps> = ({
  customers,
  debts,
  onAddCustomer,
  onAddDebt,
  onSettleDebt
}) => {
  const [activeTab, setActiveTab] = useState<'daftar' | 'bon'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);

  // New Customer Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custTier, setCustTier] = useState<'Silver' | 'Gold' | 'Platinum'>('Silver');
  const [custNotes, setCustNotes] = useState('');

  // New Debt Form
  const [debtCustName, setDebtCustName] = useState('');
  const [debtPhone, setDebtPhone] = useState('');
  const [debtAmount, setDebtAmount] = useState<number>(50000);
  const [debtNotes, setDebtNotes] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const activeDebts = debts.filter(d => d.status === 'belum_lunas');
  const totalDebtUnpaid = activeDebts.reduce((sum, d) => sum + d.amount, 0);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) return;
    onAddCustomer({
      name: custName.trim(),
      phone: custPhone.trim(),
      tier: custTier,
      notes: custNotes.trim() || undefined
    });
    setCustName('');
    setCustPhone('');
    setIsAddCustomerOpen(false);
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtCustName.trim() || !debtAmount) return;
    onAddDebt({
      customerName: debtCustName.trim(),
      phone: debtPhone.trim() || '-',
      date: new Date().toISOString().split('T')[0],
      amount: debtAmount,
      notes: debtNotes.trim() || 'Kasbon pesanan kedai'
    });
    setDebtCustName('');
    setDebtPhone('');
    setIsAddDebtOpen(false);
  };

  const handleSendReminderWA = (debt: KedaiDebt) => {
    const text = `Halo ${debt.customerName}, salam hangat dari KedaiQu. 😊\n\nMengingatkan kembali untuk catatan tagihan/bon senilai *Rp ${debt.amount.toLocaleString('id-ID')}* (${debt.notes}) per tanggal ${debt.date}.\n\nPembayaran bisa melalui transfer BCA: 8820-123-4567 atau langsung ke kasir kedai. Terima kasih banyak ya Kak! 🙏✨`;
    const cleanPhone = debt.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7DFD5]">
        <div>
          <h2 className="text-xl font-bold text-[#1B3B2B] flex items-center gap-2">
            <span>👤 Database Pelanggan & Catatan Kasbon</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola profil pelanggan tetap, tingkat membership loyalty, riwayat kunjungan, serta pencatatan bon kedai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddDebtOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E7DFD5] bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 text-rose-600" />
            <span>+ Catat Bon / Hutang</span>
          </button>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-all flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#C59B27]" />
            <span>+ Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Underline */}
      <div className="flex items-center gap-2 border-b border-[#E7DFD5] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'daftar'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Daftar Pelanggan ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bon')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'bon'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-rose-600" />
          <span>Catatan Kasbon / Hutang</span>
          {activeDebts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
              {activeDebts.length}
            </span>
          )}
        </button>
      </div>

      {/* SUBTAB 1: DAFTAR PELANGGAN */}
      {activeTab === 'daftar' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau nomor WhatsApp pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7DFD5] bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCustomers.map(cust => (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs transition-all hover:border-[#C59B27] flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#1B3B2B]">{cust.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{cust.phone}</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cust.tier === 'Platinum'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : cust.tier === 'Gold'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      ★ {cust.tier}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 p-2 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5] text-center text-xs">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Poin</p>
                      <p className="font-black text-[#C59B27]">{cust.points}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Kunjungan</p>
                      <p className="font-bold text-slate-700">{cust.totalVisits}x</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">Belanja</p>
                      <p className="font-bold text-slate-700">Rp {(cust.totalSpent / 1000).toFixed(0)}k</p>
                    </div>
                  </div>

                  {cust.notes && (
                    <p className="text-[10px] text-slate-500 mt-2 italic bg-slate-50 p-1.5 rounded-lg">
                      "{cust.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Terakhir: {cust.lastVisit}</span>
                  <button
                    onClick={() => {
                      const text = `Halo Kak ${cust.name}! Salam hangat dari KedaiQu ☕✨ Ada promo kopi spesial untuk Kakak hari ini lho!`;
                      window.open(`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="px-2.5 py-1 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: CATATAN KASBON / HUTANG */}
      {activeTab === 'bon' && (
        <div className="space-y-3">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-800">Total Kasbon / Bon Pelanggan Belum Lunas:</p>
              <p className="text-2xl font-black text-rose-900 mt-0.5">
                Rp {totalDebtUnpaid.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="text-xs font-bold text-rose-800 bg-white px-3 py-1.5 rounded-xl border border-rose-300">
              {activeDebts.length} Catatan Tagihan
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs divide-y divide-slate-100 text-xs">
            {debts.map(debt => {
              const isUnpaid = debt.status === 'belum_lunas';
              return (
                <div key={debt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1B3B2B]">{debt.customerName}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUnpaid ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isUnpaid ? 'Belum Lunas' : 'Sudah Lunas'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tanggal: {debt.date} • No WA: {debt.phone}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 bg-[#FAF7F2] px-2 py-1 rounded-lg border border-[#E7DFD5] inline-block">
                      Keperluan: {debt.notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="font-black text-rose-700 text-base">
                        Rp {debt.amount.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isUnpaid ? (
                        <>
                          <button
                            onClick={() => handleSendReminderWA(debt)}
                            className="px-2.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1"
                            title="Kirim Pesan Pengingat Tagihan WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kirim WA</span>
                          </button>
                          <button
                            onClick={() => onSettleDebt(debt.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lunaskan</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Lunas pd {debt.settledAt || 'hari ini'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Tambah Pelanggan */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCustomer} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Tambah Pelanggan Baru</h3>
              <button 
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kak Rian Pratama"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Level Member Tier</label>
                <select
                  value={custTier}
                  onChange={(e) => setCustTier(e.target.value as 'Silver' | 'Gold' | 'Platinum')}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                >
                  <option value="Silver">Silver (Member Baru)</option>
                  <option value="Gold">Gold (Pelanggan Setia)</option>
                  <option value="Platinum">Platinum (VIP Kedai)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Selera / Preferensi</label>
                <input
                  type="text"
                  placeholder="Misal: Selalu pesan Americano no sugar"
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Simpan Pelanggan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Catat Kasbon Baru */}
      {isAddDebtOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveDebt} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Catat Bon / Kasbon Pelanggan</h3>
              <button 
                type="button"
                onClick={() => setIsAddDebtOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Peminjam / Kantor</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kantor Notaris / Pak Budi"
                  value={debtCustName}
                  onChange={(e) => setDebtCustName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No WhatsApp</label>
                <input
                  type="text"
                  placeholder="081299887766"
                  value={debtPhone}
                  onChange={(e) => setDebtPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Kasbon (Rp)</label>
                <input
                  type="number"
                  required
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keperluan / Keterangan Bon</label>
                <input
                  type="text"
                  placeholder="Misal: Pesanan makan siang tim & 4 kopi"
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddDebtOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Catat Bon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
