/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Printer, 
  Crown, 
  DollarSign, 
  Calendar, 
  FileSpreadsheet, 
  Package, 
  PieChart, 
  Layers
} from 'lucide-react';
import { RitelTransaction, RitelProduct } from '../RitelTypes';

interface LaporanViewProps {
  transactions: RitelTransaction[];
  products: RitelProduct[];
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  transactions,
  products
}) => {
  const [subTab, setSubTab] = useState<'profit' | 'fast' | 'slow' | 'ekspor'>('profit');
  const [period, setPeriod] = useState<'hari_ini' | 'bulan_ini' | 'semua'>('semua');

  // Aggregated Sales & Profit Calculations
  const totalOmzet = transactions.reduce((acc, tx) => acc + tx.grandTotal, 0);

  // Total HPP (Cost of goods sold)
  let totalHPP = 0;
  transactions.forEach((tx) => {
    tx.items.forEach((it) => {
      totalHPP += it.costPrice * it.qty;
    });
  });

  const grossProfit = totalOmzet - totalHPP;
  const marginPercentage = totalOmzet > 0 ? ((grossProfit / totalOmzet) * 100).toFixed(1) : '0';

  // Item sales map for Fast/Slow-Moving
  const itemSalesMap: { [productId: string]: { name: string; sku: string; qty: number; revenue: number } } = {};
  
  // Initialize with all products (0 sales)
  products.forEach((p) => {
    itemSalesMap[p.id] = { name: p.name, sku: p.sku, qty: 0, revenue: 0 };
  });

  // Accumulate transactions
  transactions.forEach((tx) => {
    tx.items.forEach((it) => {
      if (itemSalesMap[it.productId]) {
        itemSalesMap[it.productId].qty += it.qty;
        itemSalesMap[it.productId].revenue += it.total;
      }
    });
  });

  const salesArray = Object.entries(itemSalesMap).map(([id, data]) => ({
    id,
    ...data
  }));

  // Fast-Moving: sorted descending by quantity sold
  const fastMoving = [...salesArray].sort((a, b) => b.qty - a.qty).slice(0, 10);

  // Slow-Moving: sorted ascending by quantity sold
  const slowMoving = [...salesArray].sort((a, b) => a.qty - b.qty).slice(0, 10);

  // Export to CSV function
  const handleExportCSV = () => {
    let csv = 'No Faktur,Tanggal,Pelanggan,Metode,Total Belanja,Status\n';
    transactions.forEach((tx) => {
      csv += `"${tx.invoiceNumber}","${tx.date}","${tx.customerName || 'Umum'}","${tx.paymentMethod}",${tx.grandTotal},"${tx.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Penjualan_RitelQu_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sub navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('profit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'profit'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rekap Profit Margin</span>
          </button>

          <button
            onClick={() => setSubTab('fast')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'fast'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Barang Terlaris (Fast-Moving)</span>
          </button>

          <button
            onClick={() => setSubTab('slow')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'slow'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            <span>Barang Lambat (Slow-Moving)</span>
          </button>

          <button
            onClick={() => setSubTab('ekspor')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'ekspor'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Ekspor PDF / Excel</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 text-amber-600" />
              PRO
            </span>
          </button>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
        >
          <option value="hari_ini">Hari Ini</option>
          <option value="bulan_ini">Bulan Ini</option>
          <option value="semua">Semua Periode</option>
        </select>
      </div>

      {/* SUB-VIEW 1: Rekap Profit Margin */}
      {subTab === 'profit' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Total Omzet Penjualan
                </div>
                <div className="text-xl font-black text-[#1E3A8A] mt-1">
                  Rp {totalOmzet.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Dari {transactions.length} transaksi kasir
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Harga Pokok (HPP)
                </div>
                <div className="text-xl font-black text-slate-700 mt-1">
                  Rp {totalHPP.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Modal kulakan barang terjual
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Laba Kotor (Gross Profit)
                </div>
                <div className="text-xl font-black text-emerald-600 mt-1">
                  Rp {grossProfit.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  Omzet dikurangi HPP
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Profit Margin
                </div>
                <div className="text-xl font-black text-[#F97316] mt-1">
                  {marginPercentage}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Rata-rata margin ritel sehat
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-800">
                Rincian Penjualan Berdasarkan Metode Bayar
              </div>
              <div className="p-4 space-y-3">
                {['tunai', 'qris', 'debit', 'bon'].map((method) => {
                  const txMethod = transactions.filter((t) => t.paymentMethod === method);
                  const sumMethod = txMethod.reduce((s, t) => s + t.grandTotal, 0);
                  const pct = totalOmzet > 0 ? ((sumMethod / totalOmzet) * 100).toFixed(1) : 0;

                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="uppercase font-bold text-slate-700">
                          {method === 'bon' ? 'Bon / Piutang Pelanggan' : method}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          Rp {sumMethod.toLocaleString('id-ID')} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            method === 'tunai' ? 'bg-[#1E3A8A]' :
                            method === 'qris' ? 'bg-[#F97316]' :
                            method === 'debit' ? 'bg-indigo-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Barang Terlaris (Fast-Moving) */}
      {subTab === 'fast' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-800 flex items-center justify-between">
                <span>Top 10 Produk Paling Laris (Fast-Moving)</span>
                <span className="text-[10px] text-slate-500 font-normal">Prioritas restock rak</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Peringkat</th>
                    <th className="px-4 py-3">Nama Produk</th>
                    <th className="px-4 py-3 text-center">Terjual</th>
                    <th className="px-4 py-3 text-right">Omzet Produk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fastMoving.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-black text-[#1E3A8A]">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {it.name}
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-emerald-600">
                        {it.qty} unit
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-900">
                        Rp {it.revenue.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Barang Lambat (Slow-Moving) */}
      {subTab === 'slow' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-800 flex items-center justify-between">
                <span>Top 10 Produk Kurang Laku (Slow-Moving)</span>
                <span className="text-[10px] text-amber-700 font-semibold">Rekomendasi diberi diskon / promo bundling</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Produk</th>
                    <th className="px-4 py-3 text-center">Terjual</th>
                    <th className="px-4 py-3 text-right">Omzet Produk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slowMoving.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {it.name}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">
                        {it.qty} unit
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700">
                        Rp {it.revenue.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: Ekspor PDF / Excel (Badge Pro 👑) */}
      {subTab === 'ekspor' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-6 h-6 text-amber-100" />
                <div>
                  <h3 className="font-extrabold text-sm">Fitur Pro 👑: Ekspor & Arsip Laporan Ritel</h3>
                  <p className="text-xs text-amber-100">
                    Ekspor seluruh data transaksi kasir dan mutasi inventaris ke format spreadsheet atau cetak laporan PDF resmi.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                    Unduh Format Excel / CSV
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Data transaksi kasir, nama pelanggan, metode pembayaran, dan rincian omzet bersih dapat diolah langsung di Microsoft Excel atau Google Sheets.
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File CSV / Excel</span>
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mb-3">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                    Cetak Laporan PDF Resmi
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Cetak ringkasan laporan keuangan dan penjualan ritel dengan format kertas A4/Folio yang rapi dan profesional untuk arsip toko.
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
