/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  Coins, 
  Receipt, 
  DollarSign, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { RitelCustomer, RitelTransaction } from '../RitelTypes';

interface PelangganViewProps {
  customers: RitelCustomer[];
  transactions: RitelTransaction[];
  onAddCustomer: (c: Omit<RitelCustomer, 'id'>) => void;
  onPayDebt: (customerId: string, amount: number) => void;
}

export const PelangganView: React.FC<PelangganViewProps> = ({
  customers,
  transactions,
  onAddCustomer,
  onPayDebt
}) => {
  const [subTab, setSubTab] = useState<'member' | 'riwayat' | 'bon'>('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<RitelCustomer | null>(null);

  // Add customer modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState<RitelCustomer['tier']>('Reguler');

  // Pelunasan Bon modal
  const [isPayBonOpen, setIsPayBonOpen] = useState(false);
  const [bonCustomer, setBonCustomer] = useState<RitelCustomer | null>(null);
  const [bonPayAmount, setBonPayAmount] = useState<number>(0);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const customersWithDebt = customers.filter((c) => c.debtBalance > 0);
  const totalPiutangPelanggan = customersWithDebt.reduce((sum, c) => sum + c.debtBalance, 0);

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCustomer({
      memberCode: `RQ-MBR-${(customers.length + 1).toString().padStart(3, '0')}`,
      name: name.trim(),
      phone: phone.trim() || '-',
      address: address.trim() || '-',
      tier,
      points: 10, // Welcome points
      totalSpend: 0,
      debtBalance: 0,
      joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    });

    setIsAddModalOpen(false);
  };

  const handleConfirmPayBon = () => {
    if (!bonCustomer || bonPayAmount <= 0) return;
    onPayDebt(bonCustomer.id, bonPayAmount);
    setIsPayBonOpen(false);
    setBonCustomer(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('member')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'member'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Pelanggan & Member ({customers.length})</span>
          </button>

          <button
            onClick={() => setSubTab('riwayat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'riwayat'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Riwayat Transaksi Belanja</span>
          </button>

          <button
            onClick={() => setSubTab('bon')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer ${
              subTab === 'bon'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>Catatan Bon / Piutang</span>
            {totalPiutangPelanggan > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        {subTab === 'member' && (
          <button
            onClick={() => {
              setName('');
              setPhone('');
              setAddress('');
              setTier('Reguler');
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F97316]" />
            <span>Daftar Member Baru</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Data Pelanggan & Member */}
      {subTab === 'member' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3.5">
            {/* Search */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, no HP, atau kode member..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#1E3A8A] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded">
                        {c.memberCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.tier === 'VIP' ? 'bg-purple-100 text-purple-800' :
                        c.tier === 'Gold' ? 'bg-amber-100 text-amber-800' :
                        c.tier === 'Silver' ? 'bg-slate-200 text-slate-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {c.tier}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mb-0.5">
                      {c.name}
                    </h4>

                    <div className="space-y-1 text-[11px] text-slate-600 my-2.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{c.phone}</span>
                      </div>
                      <div className="text-slate-500 line-clamp-1">{c.address}</div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Poin Belanja:</span>
                        <span className="font-extrabold text-amber-600 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {c.points} Pts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Belanja:</span>
                        <span className="font-bold text-slate-800">
                          Rp {c.totalSpend.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {c.debtBalance > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold">
                          <span>Sisa Bon:</span>
                          <span>Rp {c.debtBalance.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <span className="text-[10px] text-slate-400">Gabung: {c.joinDate}</span>
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      Hubungi WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Riwayat Transaksi Belanja */}
      {subTab === 'riwayat' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Faktur</th>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Nama Pelanggan</th>
                      <th className="px-4 py-3">Jumlah Item</th>
                      <th className="px-4 py-3 text-right">Total Belanja</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#1E3A8A]">
                          {tx.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{tx.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {tx.customerName || 'Pelanggan Umum'}
                        </td>
                        <td className="px-4 py-3">
                          {tx.items.reduce((s, it) => s + it.qty, 0)} pcs
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-900">
                          Rp {tx.grandTotal.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'lunas'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {tx.status.toUpperCase()}
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

      {/* SUB-VIEW 3: Catatan Bon / Piutang */}
      {subTab === 'bon' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-[#1E3A8A] text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-200 font-bold uppercase tracking-wider">
                  Total Buku Piutang / Bon Pelanggan
                </span>
                <div className="text-2xl font-black mt-1">
                  Rp {totalPiutangPelanggan.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold">
                  {customersWithDebt.length} Pelanggan Memiliki Bon
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {customersWithDebt.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">Semua Bon Pelanggan Lunas</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tidak ada catatan piutang belanja yang belum tertagih.
                  </p>
                </div>
              ) : (
                customersWithDebt.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-[#1E3A8A]">
                          {c.memberCode}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          • {c.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>No. HP: {c.phone}</span>
                        <span>Alamat: {c.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Sisa Bon:</div>
                        <div className="text-sm font-black text-rose-600">
                          Rp {c.debtBalance.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setBonCustomer(c);
                          setBonPayAmount(c.debtBalance);
                          setIsPayBonOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pelunasan Bon</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Member Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F97316]" />
              Daftar Member Pelanggan Baru
            </h3>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Pelanggan"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">No. WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Kategori Member:</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Reguler">Reguler</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Domisili:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Mawar No. 12"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 cursor-pointer"
                >
                  Daftarkan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pelunasan Bon */}
      {isPayBonOpen && bonCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Bayar Pelunasan Bon
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Pelanggan: {bonCustomer.name} (Total Bon: Rp {bonCustomer.debtBalance.toLocaleString('id-ID')})
            </p>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nominal Setoran Pelunasan (Rp):
              </label>
              <input
                type="number"
                value={bonPayAmount}
                onChange={(e) => setBonPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPayBonOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPayBon}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Simpan Pelunasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
