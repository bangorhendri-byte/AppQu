/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Crown, 
  Printer, 
  FileSpreadsheet, 
  DollarSign, 
  Pill, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Trash2,
  Download,
  Filter
} from 'lucide-react';
import { 
  TagihanKlinik, 
  KlinikPengeluaran, 
  KlinikObat, 
  RekamMedisRecord, 
  KlinikProfil 
} from '../KlinikTypes';

interface LaporanViewProps {
  tagihanList: TagihanKlinik[];
  pengeluaranList: KlinikPengeluaran[];
  obatList: KlinikObat[];
  rekamMedisList: RekamMedisRecord[];
  profilKlinik: KlinikProfil;
  onAddPengeluaran: (pengeluaran: KlinikPengeluaran) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  tagihanList,
  pengeluaranList,
  obatList,
  rekamMedisList,
  profilKlinik,
  onAddPengeluaran
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'omset' | 'obat' | 'pengeluaran' | 'ekspor'>('omset');

  // Modal Pengeluaran Form
  const [isAddPengeluaranOpen, setIsAddPengeluaranOpen] = useState(false);
  const [pengeluaranJudul, setPengeluaranJudul] = useState('');
  const [pengeluaranNominal, setPengeluaranNominal] = useState<number>(150000);
  const [pengeluaranKategori, setPengeluaranKategori] = useState<KlinikPengeluaran['kategori']>('Operasional');
  const [pengeluaranPic, setPengeluaranPic] = useState('Siti Nurhaliza (Adm)');

  // Calculations
  const totalOmsetPendapatan = tagihanList
    .filter(t => t.statusPembayaran === 'Lunas')
    .reduce((sum, curr) => sum + curr.rincian.totalBersih, 0);

  const totalPengeluaranNominal = pengeluaranList
    .reduce((sum, curr) => sum + curr.nominal, 0);

  const labaBersihOperasional = totalOmsetPendapatan - totalPengeluaranNominal;

  // Breakdown Pendapatan
  const pendapatanFarmasi = tagihanList
    .filter(t => t.statusPembayaran === 'Lunas')
    .reduce((sum, curr) => sum + curr.rincian.obatItems.reduce((acc, o) => acc + o.subtotal, 0), 0);

  const pendapatanJasaMedis = totalOmsetPendapatan - pendapatanFarmasi;

  const handleSavePengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengeluaranJudul) return;

    const now = new Date();
    const newPeng: KlinikPengeluaran = {
      id: `png-${Date.now()}`,
      tanggal: `${now.getDate()} Okt ${now.getFullYear()}`,
      kategori: pengeluaranKategori,
      keterangan: pengeluaranJudul,
      nominal: Number(pengeluaranNominal),
      dicatatOleh: pengeluaranPic
    };

    onAddPengeluaran(newPeng);
    setIsAddPengeluaranOpen(false);
    setPengeluaranJudul('');
    alert('✅ Biaya operasional klinik berhasil dicatat!');
  };

  const handleExportDummy = (format: 'PDF' | 'Excel') => {
    if (format === 'PDF') {
      window.print();
    } else {
      // CSV Export Simulator
      const headers = ['No Invoice', 'No RM', 'Nama Pasien', 'Penjamin', 'Poli', 'Total Tagihan', 'Status'];
      const rows = tagihanList.map(t => [
        t.noInvoice,
        t.noRM,
        `"${t.namaPasien}"`,
        t.penjamin,
        t.poli,
        t.rincian.totalBersih,
        t.statusPembayaran
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Keuangan_KlinikQu_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0F4C5C]" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Laporan & Akuntansi Klinik
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekap pendapatan harian, penggunaan obat fast-moving, beban operasional & ekspor laporan
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveSubTab('omset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'omset'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Kunjungan & Omset
          </button>
          <button
            onClick={() => setActiveSubTab('obat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'obat'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💊 Obat Terlaris
          </button>
          <button
            onClick={() => setActiveSubTab('pengeluaran')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'pengeluaran'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📉 Kas Operasional
          </button>
          <button
            onClick={() => setActiveSubTab('ekspor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'ekspor'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Ekspor
            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-400 text-slate-900">PRO</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Pendapatan (Omset)</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">+18.4%</span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2 tracking-tight">
            Rp {totalOmsetPendapatan.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Jasa Medis: Rp {pendapatanJasaMedis.toLocaleString('id-ID')}</span>
            <span>Farmasi: Rp {pendapatanFarmasi.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Beban Operasional</span>
            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">- Biaya</span>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2 tracking-tight">
            Rp {totalPengeluaranNominal.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {pengeluaranList.length} pos biaya (Alkes, BMHP, Utilitas)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Laba Bersih Klinik</span>
            <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">Net Profit</span>
          </div>
          <div className="text-2xl font-black text-[#0F4C5C] mt-2 tracking-tight">
            Rp {labaBersihOperasional.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2">
            Margin kesehatan keuangan klinik prima
          </p>
        </div>
      </div>

      {/* SUB-TAB 1: KUNJUNGAN & OMSET */}
      {activeSubTab === 'omset' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
            <h3 className="font-extrabold text-slate-800 text-base mb-4">
              Rekapitulasi Transaksi Pelayanan Hari Ini
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">No Invoice</th>
                    <th className="p-3">Pasien / RM</th>
                    <th className="p-3">Penjamin</th>
                    <th className="p-3">Poli / Dokter</th>
                    <th className="p-3">Metode Bayar</th>
                    <th className="p-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tagihanList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-[#0F4C5C]">{t.noInvoice}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{t.namaPasien}</div>
                        <div className="font-mono text-[10px] text-slate-400">{t.noRM}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">
                          {t.penjamin}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>{t.poli}</div>
                        <div className="text-[10px] text-slate-400">{t.dokterNama}</div>
                      </td>
                      <td className="p-3 font-medium">{t.metodePembayaran}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        Rp {t.rincian.totalBersih.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: OBAT TERLARIS (FAST-MOVING) */}
      {activeSubTab === 'obat' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Analisis Pemakaian Obat Terlaris (Fast-Moving Items)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring obat dengan perputaran stok tertinggi untuk pencegahan kekosongan (stockout)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {obatList.slice(0, 6).map((obat, idx) => (
                <div key={obat.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-[#0F4C5C] font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {obat.kodeObat}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{obat.namaObat}</h4>
                  <p className="text-xs text-slate-500">{obat.kategori} • {obat.bentukSediaan}</p>
                  
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                    <span className="text-slate-500">Sisa Stok</span>
                    <span className="font-bold text-slate-800">{obat.stok} {obat.satuan}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[#0F4C5C]">
                    <span>Harga Jual</span>
                    <span>Rp {obat.hargaJual.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PENGELUARAN OPERASIONAL */}
      {activeSubTab === 'pengeluaran' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddPengeluaranOpen(true)}
              className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#34D399]" />
              + Catat Pengeluaran Baru
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Kategori Pos</th>
                  <th className="p-4">Keterangan Pengeluaran</th>
                  <th className="p-4">Petugas (PIC)</th>
                  <th className="p-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pengeluaranList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-mono">{p.tanggal}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                        {p.kategori}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{p.keterangan}</td>
                    <td className="p-4 text-slate-500">{p.dicatatOleh}</td>
                    <td className="p-4 text-right font-bold text-red-600">
                      - Rp {p.nominal.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EKSPOR PDF & EXCEL (BADGE PRO 👑) */}
      {activeSubTab === 'ekspor' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center font-bold">
            <Crown className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 uppercase">
              Pro Feature 👑
            </span>
            <h3 className="text-lg font-black text-slate-800 mt-2">
              Ekspor Laporan Keuangan & Kunjungan Pasien
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Unduh rekapitulasi data dalam format Microsoft Excel (.csv/.xlsx) atau dokumen cetak PDF resmi ber-kop surat klinik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleExportDummy('PDF')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-[#0F4C5C] text-left transition-all group cursor-pointer"
            >
              <Printer className="w-6 h-6 text-[#0F4C5C] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-800">Cetak / Ekspor PDF Resmi</h4>
              <p className="text-xs text-slate-500 mt-1">Laporan lengkap dengan kop surat dan tanda tangan penanggung jawab</p>
            </button>

            <button
              onClick={() => handleExportDummy('Excel')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 text-left transition-all group cursor-pointer"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-slate-800">Unduh Spreadsheet Excel (.csv)</h4>
              <p className="text-xs text-slate-500 mt-1">Format tabular bersih untuk olah data akuntansi dan rekapitulasi pajak</p>
            </button>
          </div>
        </div>
      )}

      {/* MODAL CATAT PENGELUARAN */}
      {isAddPengeluaranOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-800 mb-4">
              Catat Beban Operasional Klinik
            </h3>

            <form onSubmit={handleSavePengeluaran} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Beban</label>
                <select
                  value={pengeluaranKategori}
                  onChange={(e) => setPengeluaranKategori(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Operasional">Operasional</option>
                  <option value="Bahan Medis Habis Pakai">Bahan Medis Habis Pakai (BMHP)</option>
                  <option value="Gaji & Lembur Staf">Gaji & Lembur Staf</option>
                  <option value="Listrik & Utilitas">Listrik, Air & Internet</option>
                  <option value="Kas Kecil & Kebersihan">Kas Kecil & Kebersihan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Keperluan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Beli Kasa Steril & Alkohol 70%"
                  value={pengeluaranJudul}
                  onChange={(e) => setPengeluaranJudul(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  value={pengeluaranNominal}
                  onChange={(e) => setPengeluaranNominal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dicatat Oleh (PIC)</label>
                <input
                  type="text"
                  value={pengeluaranPic}
                  onChange={(e) => setPengeluaranPic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPengeluaranOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  Simpan Beban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
