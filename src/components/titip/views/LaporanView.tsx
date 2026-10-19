/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Printer, 
  Crown, 
  DollarSign, 
  Layers, 
  PieChart, 
  FileSpreadsheet,
  Store,
  Users,
  ShoppingCart
} from 'lucide-react';
import { SalesTransaction, ProductRecipe } from '../TitipTypes';

interface LaporanViewProps {
  sales: SalesTransaction[];
  recipes: ProductRecipe[];
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  sales,
  recipes
}) => {
  const [subTab, setSubTab] = useState<'channel' | 'ringkasan' | 'ekspor'>('channel');

  // Aggregated Sales per Channel: Direct POS, Konsinyasi, Reseller
  const directSales = sales.filter((s) => s.channel === 'direct_pos');
  const konsinSales = sales.filter((s) => s.channel === 'konsinyasi');
  const resellerSales = sales.filter((s) => s.channel === 'reseller');

  const calcChannelMetrics = (channelSales: SalesTransaction[]) => {
    let revenue = 0;
    let hpp = 0;
    channelSales.forEach((s) => {
      revenue += s.grandTotal;
      s.items.forEach((it) => {
        hpp += it.hpp * it.qty;
      });
    });
    const grossProfit = revenue - hpp;
    const marginPct = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : '0';
    return { revenue, hpp, grossProfit, marginPct, count: channelSales.length };
  };

  const directMetrics = calcChannelMetrics(directSales);
  const konsinMetrics = calcChannelMetrics(konsinSales);
  const resellerMetrics = calcChannelMetrics(resellerSales);

  const totalRevenue = directMetrics.revenue + konsinMetrics.revenue + resellerMetrics.revenue;
  const totalHpp = directMetrics.hpp + konsinMetrics.hpp + resellerMetrics.hpp;
  const totalGrossProfit = totalRevenue - totalHpp;
  const overallMargin = totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const handleExportCSV = () => {
    let csv = 'No Faktur,Tanggal,Saluran,Mitra / Pembeli,Total Belanja,Metode,Status\n';
    sales.forEach((s) => {
      csv += `"${s.invoiceNumber}","${s.date}","${s.channel.toUpperCase()}","${s.partnerOrCustomerName}",${s.grandTotal},"${s.paymentMethod}","${s.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Kemitraan_Titip_Qu_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('channel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'channel'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Profit Margin per Channel</span>
          </button>

          <button
            onClick={() => setSubTab('ringkasan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'ringkasan'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Rekap Keseluruhan</span>
          </button>

          <button
            onClick={() => setSubTab('ekspor')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'ekspor'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel / PDF</span>
            <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5" />
              PRO
            </span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Profit Margin per Channel */}
      {subTab === 'channel' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Direct POS Card */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Direct POS (Sendiri)
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      Margin: {directMetrics.marginPct}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs my-3 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Omzet Penjualan:</span>
                      <span className="font-extrabold text-slate-900">
                        Rp {directMetrics.revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya HPP:</span>
                      <span className="font-semibold text-slate-700">
                        Rp {directMetrics.hpp.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-emerald-200 flex justify-between font-black text-emerald-700">
                      <span>Laba Kotor:</span>
                      <span>Rp {directMetrics.grossProfit.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  {directMetrics.count} Transaksi Toko Sendiri
                </div>
              </div>

              {/* Toko Titipan (Konsinyasi) Card */}
              <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      Toko Konsinyasi
                    </span>
                    <span className="text-xs font-extrabold text-[#C2410C]">
                      Margin: {konsinMetrics.marginPct}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs my-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                    <div className="flex justify-between text-slate-600">
                      <span>Omzet Penjualan:</span>
                      <span className="font-extrabold text-slate-900">
                        Rp {konsinMetrics.revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya HPP:</span>
                      <span className="font-semibold text-slate-700">
                        Rp {konsinMetrics.hpp.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-amber-200 flex justify-between font-black text-[#C2410C]">
                      <span>Laba Kotor:</span>
                      <span>Rp {konsinMetrics.grossProfit.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  {konsinMetrics.count} Pengiriman Titipan Laku
                </div>
              </div>

              {/* Reseller Partner Card */}
              <div className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Jaringan Reseller
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600">
                      Margin: {resellerMetrics.marginPct}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs my-3 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Omzet Penjualan:</span>
                      <span className="font-extrabold text-slate-900">
                        Rp {resellerMetrics.revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya HPP:</span>
                      <span className="font-semibold text-slate-700">
                        Rp {resellerMetrics.hpp.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-indigo-200 flex justify-between font-black text-indigo-700">
                      <span>Laba Kotor:</span>
                      <span>Rp {resellerMetrics.grossProfit.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  {resellerMetrics.count} Orderan Reseller
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Rekap Keseluruhan */}
      {subTab === 'ringkasan' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Omzet Gabungan</span>
                <span className="text-lg font-black text-[#C2410C] mt-1 block">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Biaya Pokok (HPP)</span>
                <span className="text-lg font-black text-slate-700 mt-1 block">
                  Rp {totalHpp.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Laba Kotor Total</span>
                <span className="text-lg font-black text-emerald-600 mt-1 block">
                  Rp {totalGrossProfit.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Net Profit Margin</span>
                <span className="text-lg font-black text-[#F59E0B] mt-1 block">
                  {overallMargin}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Ekspor Excel / PDF (Badge Pro 👑) */}
      {subTab === 'ekspor' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-6 h-6 text-amber-100" />
                <div>
                  <h3 className="font-extrabold text-sm">Fitur Pro 👑: Ekspor Laporan & Arsip Kemitraan</h3>
                  <p className="text-xs text-amber-100">
                    Unduh file rekap penjualan konsinyasi dan reseller format Excel atau cetak laporan keuangan resmi.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                    Download File Excel / CSV
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Data transaksi, channel saluran, pembagian komisi toko, dan keuntungan produsen rapi siap olah di Excel.
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File CSV / Spreadsheet</span>
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#C2410C] flex items-center justify-center mb-3">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                    Cetak Laporan PDF Resmi
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Cetak dokumen rekap kinerja kemitraan dan bagi hasil toko konsinyasi format A4 siap print.
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
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
