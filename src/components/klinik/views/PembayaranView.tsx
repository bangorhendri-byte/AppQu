/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  DollarSign, 
  Filter, 
  User, 
  Stethoscope, 
  Pill, 
  ShieldCheck,
  FileSpreadsheet,
  QrCode,
  Banknote,
  Building
} from 'lucide-react';
import { 
  TagihanKlinik, 
  KlinikProfil, 
  TipePenjamin 
} from '../KlinikTypes';

interface PembayaranViewProps {
  tagihanList: TagihanKlinik[];
  profilKlinik: KlinikProfil;
  onUpdateStatusBayar: (
    id: string, 
    metode: 'Tunai' | 'QRIS Medis' | 'Transfer Bank' | 'Klaim BPJS' | 'Asuransi Swasta', 
    dibayar: number
  ) => void;
  onAddNewTagihanManual: (tagihan: TagihanKlinik) => void;
}

export const PembayaranView: React.FC<PembayaranViewProps> = ({
  tagihanList,
  profilKlinik,
  onUpdateStatusBayar,
  onAddNewTagihanManual
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPenjamin, setFilterPenjamin] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Active Selected Invoice for Payment or Receipt Modal
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanKlinik | null>(tagihanList[0] || null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Payment Form state
  const [metodeBayar, setMetodeBayar] = useState<'Tunai' | 'QRIS Medis' | 'Transfer Bank' | 'Klaim BPJS' | 'Asuransi Swasta'>('Tunai');
  const [nominalBayarInput, setNominalBayarInput] = useState<number>(selectedTagihan?.rincian.totalBersih || 0);

  const handleSelectInvoice = (item: TagihanKlinik) => {
    setSelectedTagihan(item);
    setNominalBayarInput(item.rincian.totalBersih);
  };

  const handleProcessPayment = () => {
    if (!selectedTagihan) return;
    onUpdateStatusBayar(selectedTagihan.id, metodeBayar, Number(nominalBayarInput));
    alert(`✅ Pembayaran Invoice ${selectedTagihan.noInvoice} atas nama ${selectedTagihan.namaPasien} BERHASIL diproses!`);
    setIsReceiptModalOpen(true);
  };

  const filteredTagihan = tagihanList.filter(t => {
    const matchSearch = 
      t.namaPasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.noInvoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.noRM.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPenjamin = filterPenjamin === 'Semua' || t.penjamin === filterPenjamin;
    const matchStatus = filterStatus === 'Semua' || t.statusPembayaran === filterStatus;
    return matchSearch && matchPenjamin && matchStatus;
  });

  // Financial summary
  const totalOmsetHariIni = tagihanList
    .filter(t => t.statusPembayaran === 'Lunas')
    .reduce((sum, curr) => sum + curr.rincian.totalBersih, 0);

  const totalPiutangPending = tagihanList
    .filter(t => t.statusPembayaran !== 'Lunas')
    .reduce((sum, curr) => sum + curr.rincian.totalBersih, 0);

  return (
    <div className="space-y-6">
      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kasir Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Rp {totalOmsetHariIni.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Transaksi terverifikasi lunas hari ini
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Klaim & Piutang Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            Rp {totalPiutangPending.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Menunggu pembayaran kasir / verifikasi klaim BPJS
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F4C5C] flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4 text-[#10B981]" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {tagihanList.length} <span className="text-xs font-bold text-slate-400">Nota</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rawat jalan & tebus farmasi
          </p>
        </div>
      </div>

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Invoice List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari pasien, invoice, No RM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterPenjamin}
                onChange={(e) => setFilterPenjamin(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
              >
                <option value="Semua">Semua Penjamin</option>
                <option value="Umum">Umum</option>
                <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                <option value="Asuransi Swasta">Asuransi Swasta</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
          </div>

          {/* List Cards */}
          <div className="space-y-3">
            {filteredTagihan.map((inv) => {
              const isSelected = selectedTagihan?.id === inv.id;

              return (
                <div
                  key={inv.id}
                  onClick={() => handleSelectInvoice(inv)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#10B981] ring-2 ring-[#10B981]/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0F4C5C] bg-teal-50 px-2 py-0.5 rounded">
                          {inv.noInvoice}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.penjamin === 'BPJS Kesehatan' ? 'bg-emerald-100 text-emerald-800' :
                          inv.penjamin === 'Asuransi Swasta' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {inv.penjamin}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base mt-1.5">
                        {inv.namaPasien}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        RM: <span className="font-mono font-bold">{inv.noRM}</span> • {inv.poli} • {inv.tglTagihan} {inv.jamTagihan} WIB
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-slate-900">
                        Rp {inv.rincian.totalBersih.toLocaleString('id-ID')}
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.statusPembayaran === 'Lunas' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.statusPembayaran}
                      </span>
                    </div>
                  </div>

                  {/* Summary items pill */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">
                      {inv.rincian.tindakanItems.length} Tindakan • {inv.rincian.obatItems.length} Resep Obat
                    </span>
                    <span className="text-[11px] font-medium text-[#0F4C5C] hover:underline">
                      Lihat Rincian & Kasir →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Bill & Cashier Terminal (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedTagihan ? (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Rincian Tagihan Medis
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedTagihan.statusPembayaran === 'Lunas' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedTagihan.statusPembayaran}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mt-1">
                  {selectedTagihan.namaPasien}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invoice: <span className="font-mono font-bold text-[#0F4C5C]">{selectedTagihan.noInvoice}</span>
                </p>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3 text-xs">
                {/* 1. Administrasi & Konsultasi */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#0F4C5C]" />
                    Biaya Pelayanan Dasar
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Registrasi & Administrasi</span>
                    <span>Rp {selectedTagihan.rincian.biayaRegistrasi.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Konsultasi Dokter ({selectedTagihan.dokterNama})</span>
                    <span>Rp {selectedTagihan.rincian.biayaKonsultasi.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* 2. Tindakan Medis */}
                {selectedTagihan.rincian.tindakanItems.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="font-bold text-slate-700">Tindakan Medis</div>
                    {selectedTagihan.rincian.tindakanItems.map((t, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>{t.nama}</span>
                        <span>Rp {t.biaya.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Farmasi & Resep Obat */}
                {selectedTagihan.rincian.obatItems.length > 0 && (
                  <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-1.5">
                    <div className="font-bold text-teal-900 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-[#10B981]" />
                      Farmasi / Obat-obatan ({selectedTagihan.rincian.obatItems.length})
                    </div>
                    {selectedTagihan.rincian.obatItems.map((o, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <div>
                          <div>{o.nama} <span className="text-[10px] text-slate-500">x{o.qty}</span></div>
                          <div className="text-[10px] text-slate-500">{o.aturanPakai}</div>
                        </div>
                        <span className="font-medium">Rp {o.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Summary */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Kotor</span>
                    <span>Rp {selectedTagihan.rincian.totalKotor.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Diskon Klinik</span>
                    <span>- Rp {selectedTagihan.rincian.diskonNominal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Tagihan Bersih</span>
                    <span className="text-[#0F4C5C]">Rp {selectedTagihan.rincian.totalBersih.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Terminal Form (if not paid) */}
              {selectedTagihan.statusPembayaran !== 'Lunas' ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Pilih Metode Pembayaran
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMetodeBayar('Tunai')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        metodeBayar === 'Tunai'
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-[#34D399]" />
                      Tunai (Cash)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodeBayar('QRIS Medis')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        metodeBayar === 'QRIS Medis'
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-[#34D399]" />
                      QRIS Medis
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodeBayar('Transfer Bank')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        metodeBayar === 'Transfer Bank'
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <Building className="w-4 h-4 text-[#34D399]" />
                      Transfer Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodeBayar('Klaim BPJS')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        metodeBayar === 'Klaim BPJS'
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                      Klaim BPJS
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Jumlah Uang Diterima (Rp)
                    </label>
                    <input
                      type="number"
                      value={nominalBayarInput}
                      onChange={(e) => setNominalBayarInput(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Proses Pelunasan Tagihan
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Lunas via {selectedTagihan.metodePembayaran}
                  </div>
                  <button
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="px-3 py-1.5 bg-[#0F4C5C] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#34D399]" />
                    Cetak Nota
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Pilih salah satu tagihan untuk melihat rincian & proses kasir</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CETAK NOTA / KWITANSI RESMI */}
      {isReceiptModalOpen && selectedTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            {/* Kop Nota */}
            <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-black uppercase text-[#0F4C5C] tracking-tight">
                {profilKlinik.namaKlinik}
              </h3>
              <p className="text-[11px] text-slate-600">
                {profilKlinik.alamat}, {profilKlinik.kota} • Telp: {profilKlinik.telepon}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Kwitansi Medis Resmi Pembayaran Pasien
              </p>
            </div>

            {/* Info Kwitansi */}
            <div className="text-xs space-y-1 mb-4 text-slate-700">
              <div className="flex justify-between">
                <span>No. Kwitansi</span>
                <span className="font-mono font-bold text-slate-900">{selectedTagihan.noInvoice}</span>
              </div>
              <div className="flex justify-between">
                <span>Nama Pasien</span>
                <span className="font-bold text-slate-900">{selectedTagihan.namaPasien}</span>
              </div>
              <div className="flex justify-between">
                <span>No. RM</span>
                <span className="font-mono font-bold text-[#0F4C5C]">{selectedTagihan.noRM}</span>
              </div>
              <div className="flex justify-between">
                <span>Penjamin</span>
                <span className="font-semibold">{selectedTagihan.penjamin}</span>
              </div>
              <div className="flex justify-between">
                <span>Dokter Pemeriksa</span>
                <span>{selectedTagihan.dokterNama}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{selectedTagihan.tglTagihan} {selectedTagihan.jamTagihan} WIB</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t border-b border-slate-200 py-3 my-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Registrasi & Konsultasi</span>
                <span>Rp {(selectedTagihan.rincian.biayaRegistrasi + selectedTagihan.rincian.biayaKonsultasi).toLocaleString('id-ID')}</span>
              </div>

              {selectedTagihan.rincian.tindakanItems.map((t, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{t.nama}</span>
                  <span>Rp {t.biaya.toLocaleString('id-ID')}</span>
                </div>
              ))}

              {selectedTagihan.rincian.obatItems.map((o, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{o.nama} ({o.qty} pcs)</span>
                  <span>Rp {o.subtotal.toLocaleString('id-ID')}</span>
                </div>
              ))}

              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>TOTAL DIBAYAR</span>
                <span className="text-[#0F4C5C]">Rp {selectedTagihan.rincian.totalBersih.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Stempel Lunas */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center my-3">
              <span className="text-xs font-black tracking-widest text-emerald-800 uppercase">
                ★ TELAH DIBAYAR LUNAS ({selectedTagihan.metodePembayaran}) ★
              </span>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                Kasir: {selectedTagihan.kasirNama}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-[#34D399]" />
                Cetak Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
