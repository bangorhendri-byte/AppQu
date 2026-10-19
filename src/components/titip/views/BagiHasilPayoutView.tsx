/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  Store, 
  ArrowUpRight, 
  Check, 
  Clock, 
  Wallet, 
  CreditCard, 
  Building2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { ConsignmentStore, PayoutRecord } from '../TitipTypes';

interface BagiHasilPayoutViewProps {
  stores: ConsignmentStore[];
  payouts: PayoutRecord[];
  onDisbursePayout: (payout: PayoutRecord) => void;
}

export const BagiHasilPayoutView: React.FC<BagiHasilPayoutViewProps> = ({
  stores,
  payouts,
  onDisbursePayout
}) => {
  const [subTab, setSubTab] = useState<'rekap' | 'riwayat'>('rekap');

  // Payout Modal
  const [selectedStore, setSelectedStore] = useState<ConsignmentStore | null>(null);
  const [salesPeriodAmount, setSalesPeriodAmount] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState('BCA 8090123456');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Calculations for active modal
  const commissionPercent = selectedStore ? selectedStore.commissionPercent : 20;
  const commissionEarned = (salesPeriodAmount * commissionPercent) / 100;
  const netProducerEarned = salesPeriodAmount - commissionEarned;

  const totalSaldoTertitip = stores.reduce((sum, s) => sum + s.currentBalanceDue, 0);

  const handleOpenDisburse = (store: ConsignmentStore) => {
    setSelectedStore(store);
    setSalesPeriodAmount(store.currentBalanceDue || 1000000);
    setPayoutNotes(`Pencairan hasil penjualan titipan periode ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.`);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || salesPeriodAmount <= 0) return;

    const newPayout: PayoutRecord = {
      id: `pay-${Date.now()}`,
      payoutNumber: `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      periodSales: Number(salesPeriodAmount),
      commissionPercent,
      commissionEarned,
      netDisbursedToProducer: netProducerEarned,
      bankAccount,
      status: 'lunas',
      notes: payoutNotes
    };

    onDisbursePayout(newPayout);
    setSelectedStore(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('rekap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'rekap'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Rekap Saldo Toko Titipan</span>
          </button>

          <button
            onClick={() => setSubTab('riwayat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'riwayat'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Riwayat Pencairan Dana ({payouts.length})</span>
          </button>
        </div>

        <div className="text-xs font-bold text-amber-950 hidden sm:flex items-center gap-2">
          <span>Total Saldo Tertampung:</span>
          <span className="text-[#C2410C] font-black text-sm">
            Rp {totalSaldoTertitip.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* SUB-VIEW 1: Rekap Saldo & Simulasi Bagi Hasil */}
      {subTab === 'rekap' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Banner Saldo */}
            <div className="bg-[#C2410C] text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-orange-200 uppercase tracking-wider font-bold">
                  Klaim Hak Bagi Hasil Konsinyasi
                </span>
                <h3 className="text-xl font-black mt-1">
                  Rp {totalSaldoTertitip.toLocaleString('id-ID')}
                </h3>
                <p className="text-xs text-orange-100 mt-1">
                  Akumulasi penjualan produk Anda di seluruh mitra toko oleh-oleh dan galeri rekanan.
                </p>
              </div>

              <div className="bg-white/10 px-4 py-3 rounded-2xl text-center backdrop-blur-xs">
                <span className="text-[11px] text-orange-200 block">Mitra Aktif Konsinyasi</span>
                <span className="text-xl font-black">{stores.length} Toko</span>
              </div>
            </div>

            {/* Store Consignment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {stores.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-xs text-slate-900 truncate max-w-[180px]">
                        {st.name}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        Komisi: {st.commissionPercent}%
                      </span>
                    </div>

                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 space-y-1.5 text-[11px] my-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Terjual:</span>
                        <span className="font-bold text-slate-800">{st.totalSoldQty} pcs</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Hak Komisi Toko:</span>
                        <span className="font-semibold text-amber-800">
                          Rp {((st.currentBalanceDue * st.commissionPercent) / 100).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-amber-200 flex justify-between font-black text-xs text-[#C2410C]">
                        <span>Hak Bersih Produsen:</span>
                        <span>
                          Rp {(st.currentBalanceDue - ((st.currentBalanceDue * st.commissionPercent) / 100)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">PIC: {st.picName}</span>
                    <button
                      onClick={() => handleOpenDisburse(st)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Cairkan Payout</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Riwayat Pencairan Dana Payout */}
      {subTab === 'riwayat' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/80 text-amber-950 uppercase text-[10px] font-bold border-b border-amber-200">
                  <tr>
                    <th className="px-4 py-3">No. Payout</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Nama Toko Mitra</th>
                    <th className="px-4 py-3 text-right">Penjualan Laku</th>
                    <th className="px-4 py-3 text-right">Bagi Hasil Toko</th>
                    <th className="px-4 py-3 text-right">Hak Bersih Produsen</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/40">
                      <td className="px-4 py-3 font-mono font-bold text-[#C2410C]">{p.payoutNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{p.date}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{p.storeName}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        Rp {p.periodSales.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-800 font-bold">
                        Rp {p.commissionEarned.toLocaleString('id-ID')} ({p.commissionPercent}%)
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700">
                        Rp {p.netDisbursedToProducer.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          LUNAS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pencairan Payout Bagi Hasil */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#F59E0B]" />
              Pencairan Dana Bagi Hasil: {selectedStore.name}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Perhitungan komisi toko ({selectedStore.commissionPercent}%) dan hak bersih transfer produsen.
            </p>

            <form onSubmit={handleConfirmPayout} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Nominal Penjualan Titipan Laku (Rp):
                </label>
                <input
                  type="number"
                  value={salesPeriodAmount}
                  onChange={(e) => setSalesPeriodAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black text-slate-900"
                />
              </div>

              {/* Breakdown */}
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Hak Komisi Toko ({commissionPercent}%):</span>
                  <span className="font-bold text-amber-800">Rp {commissionEarned.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-black text-[#C2410C]">
                  <span>Hak Bersih Produsen (Transfer):</span>
                  <span>Rp {netProducerEarned.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Rekening Tujuan Transfer:</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Catatan Pencairan:</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStore(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Konfirmasi Pencairan Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
