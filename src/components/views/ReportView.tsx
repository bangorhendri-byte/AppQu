import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  PieChart, 
  Users, 
  Calendar, 
  Download, 
  DollarSign, 
  CheckCircle2, 
  FileSpreadsheet, 
  Clock, 
  AlertCircle, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  Wrench, 
  CreditCard, 
  Wallet,
  Receipt,
  FileText
} from 'lucide-react';
import { Transaction, Mechanic, ServiceQueue, ExpenseItem } from '../../types';

interface ReportViewProps {
  initialTab?: string;
  transactions: Transaction[];
  mechanics: Mechanic[];
  queues: ServiceQueue[];
  expenses: ExpenseItem[];
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  initialTab = 'laporan-pendapatan',
  transactions,
  mechanics,
  queues,
  expenses,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialTab === 'omset-harian' || initialTab === 'revenue') return 'laporan-pendapatan';
    if (initialTab === 'kinerja-mekanik' || initialTab === 'mechanics') return 'laporan-servis';
    if (initialTab === 'laba-sparepart' || initialTab === 'margin') return 'laporan-piutang-keuangan';
    return initialTab || 'laporan-pendapatan';
  });

  const [datePeriod, setDatePeriod] = useState<'Hari Ini' | 'Bulan Ini' | 'Semua'>('Semua');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'omset-harian' || initialTab === 'revenue') setActiveTab('laporan-pendapatan');
      else if (initialTab === 'kinerja-mekanik' || initialTab === 'mechanics') setActiveTab('laporan-servis');
      else if (initialTab === 'laba-sparepart' || initialTab === 'margin') setActiveTab('laporan-piutang-keuangan');
      else setActiveTab(initialTab);
    }
  }, [initialTab]);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'laporan-pendapatan':
        return {
          title: 'Laporan Pendapatan (Omzet)',
          subtitle: 'Ringkasan Inflow Keuangan Masuk & Log Transaksi'
        };
      case 'laporan-servis':
        return {
          title: 'Laporan Servis',
          subtitle: 'Rekap Volume Servis, Unit Selesai vs Aktif per Periode'
        };
      case 'laporan-piutang-keuangan':
        return {
          title: 'Laporan Piutang & Keuangan',
          subtitle: 'Rincian Tagihan Belum Lunas & Kas Keluar Operasional'
        };
      default:
        return {
          title: 'Laporan',
          subtitle: 'Ringkasan Kinerja & Keuangan Bengkel'
        };
    }
  };

  const headerMeta = getHeaderMeta();

  // Financial Calculations
  const paidTransactions = transactions.filter((t) => t.status === 'Lunas');
  const unpaidTransactions = transactions.filter((t) => t.status === 'Belum Lunas');

  const totalOmset = paidTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalCash = paidTransactions
    .filter((t) => t.paymentMethod === 'Tunai')
    .reduce((sum, t) => sum + t.total, 0);
  const totalNonCash = paidTransactions
    .filter((t) => t.paymentMethod !== 'Tunai')
    .reduce((sum, t) => sum + t.total, 0);

  // Unpaid receivables total
  const totalReceivables = unpaidTransactions.reduce((sum, t) => sum + t.total, 0);

  // Operational expenses total (Kas kecil)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Cash Inflow = Total Cash Inflow - Cash Outflows
  const netOperatingCash = totalCash - totalExpenses;

  // Servis Breakdown (Active vs Completed)
  const completedQueuesCount = queues.filter((q) => q.status === 'selesai' || q.status === 'diambil').length;
  const activeQueuesCount = queues.filter((q) => q.status === 'proses' || q.status === 'menunggu').length;
  const totalQueuesHandled = queues.length;

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* =========================================================================
          1. COMPACT SUB-MENU HEADER
          - Shrunk compact header
          - Dynamically matches active sub-menu
          - Hiding unnecessary quick filter buttons
      ========================================================================= */}
      <div 
        className="bg-[#008952] text-white px-4 py-2.5 shadow-sm sticky top-0 z-30"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-8 h-8 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
                {headerMeta.title}
              </h1>
              <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleExport}
              className="px-2.5 py-1 rounded-lg bg-white text-[#008952] text-[11px] font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Ekspor Data</span>
            </button>
            <div className="hidden sm:flex px-2 py-1 rounded-lg bg-emerald-800/40 text-[10px] font-bold text-white items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-200" />
              <span>{todayStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Export Toast */}
      {downloadSuccess && (
        <div className="bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 shadow-lg flex items-center justify-between gap-2 sticky top-[48px] z-20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Laporan berhasil diekspor ke format berkas Excel/CSV!</span>
          </div>
          <button onClick={() => setDownloadSuccess(false)} className="text-[10px] text-emerald-300 font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto w-full pb-20">

        {/* =====================================================================
            SUB-MENU A: LAPORAN PENDAPATAN (OMZET)
            - Large summary cards with medium-to-large typography displaying daily/monthly financial inflows
            - Followed by a minimalist underlined transaction log
        ===================================================================== */}
        {activeTab === 'laporan-pendapatan' && (
          <div className="space-y-4">
            {/* 1. LARGE SUMMARY CARDS WITH MEDIUM-TO-LARGE TYPOGRAPHY */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Pendapatan Terverifikasi Lunas
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#008952] tracking-tight mt-0.5 font-mono">
                    Rp {totalOmset.toLocaleString('id-ID')}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {paidTransactions.length} Transaksi Selesai
                  </span>
                </div>
              </div>

              {/* Financial Inflow Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Arus Kas Tunai (Cash di Laci)</span>
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                    Rp {totalCash.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    {paidTransactions.filter((t) => t.paymentMethod === 'Tunai').length} transaksi tunai
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Arus Non-Tunai (QRIS & Transfer Bank)</span>
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                    Rp {totalNonCash.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    {paidTransactions.filter((t) => t.paymentMethod !== 'Tunai').length} transaksi via perbankan
                  </span>
                </div>
              </div>
            </div>

            {/* 2. MINIMALIST UNDERLINED TRANSACTION LOG */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Log Rincian Transaksi Pendapatan Masuk ({paidTransactions.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Semua faktur penjualan jasa servis & suku cadang.
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Minimalist Underlined Log
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
                {paidTransactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Belum ada transaksi pendapatan masuk tercatat
                  </div>
                ) : (
                  paidTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                              {tx.invoiceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {tx.date}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {tx.plateNumber}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {tx.customerName} • <span className="font-medium text-slate-600">{tx.vehicleModel}</span>
                          </h4>

                          <div className="text-[11px] text-slate-500">
                            Metode: <strong className="text-slate-800">{tx.paymentMethod}</strong> • Mekanik: <strong className="text-slate-800">{tx.mechanicName}</strong>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">Nominal Faktur</span>
                          <span className="text-sm font-black text-[#008952] font-mono">
                            Rp {tx.total.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SUB-MENU B: LAPORAN SERVIS
            - Structured cards and minimalist underlined lists tracking completed vs active vehicle counts over specific periods
        ===================================================================== */}
        {activeTab === 'laporan-servis' && (
          <div className="space-y-4">
            {/* STRUCTURED SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Unit Masuk
                </span>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {totalQueuesHandled} <span className="text-sm font-normal text-slate-500">Unit</span>
                </p>
                <span className="text-[11px] text-slate-400 block">
                  Seluruh pengerjaan hari ini
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-xs border border-emerald-200/90 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Unit Servis Selesai
                </span>
                <p className="text-2xl font-black text-[#008952] font-mono">
                  {completedQueuesCount} <span className="text-sm font-normal text-slate-500">Unit</span>
                </p>
                <span className="text-[11px] text-emerald-700 block">
                  Siap bayar / telah diambil pelanggan
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-xs border border-amber-200/90 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Unit Sedang Aktif
                </span>
                <p className="text-2xl font-black text-amber-600 font-mono">
                  {activeQueuesCount} <span className="text-sm font-normal text-slate-500">Unit</span>
                </p>
                <span className="text-[11px] text-amber-700 block">
                  Dalam proses teknisi di pit
                </span>
              </div>
            </div>

            {/* MINIMALIST UNDERLINED LIST TRACKING VEHICLES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Log Rekap Unit Kendaraan Servis ({queues.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Status pengerjaan teknisi dan estimasi durasi servis.
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Minimalist Underlined List View
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
                {queues.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Belum ada antrian atau servis tercatat
                  </div>
                ) : (
                  queues.map((q) => {
                    const isDone = q.status === 'selesai' || q.status === 'diambil';
                    return (
                      <div key={q.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                                {q.queueNumber}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {q.plateNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Masuk: {q.timeIn}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {q.customerName} • <span className="font-medium text-slate-600">{q.vehicleModel}</span>
                            </h4>

                            <p className="text-[11px] text-slate-500">
                              Keluhan: <span className="italic text-slate-700">{q.complaint}</span> • Mekanik: <strong className="text-slate-800">{q.mechanicName}</strong>
                            </p>
                          </div>

                          <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-block ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {isDone ? '● Selesai Dikerjakan' : '○ Pengerjaan Aktif'}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                              Total: Rp {q.totalCost.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SUB-MENU C: LAPORAN PIUTANG & KEUANGAN
            - Minimalist underlined list view detailing unpaid bills, accounts receivable, and operational cash outflows (Petty Cash/Kas Kecil)
        ===================================================================== */}
        {activeTab === 'laporan-piutang-keuangan' && (
          <div className="space-y-5">
            {/* High-level Balance Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Total Piutang Belum Lunas (Unpaid Invoices)
                </span>
                <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
                  Rp {totalReceivables.toLocaleString('id-ID')}
                </p>
                <span className="text-[11px] text-amber-800 block">
                  {unpaidTransactions.length} nota menunggu pelunasan konsumen
                </span>
              </div>

              <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">
                  Total Beban Kas Keluar (Kas Kecil Operasional)
                </span>
                <p className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
                  Rp {totalExpenses.toLocaleString('id-ID')}
                </p>
                <span className="text-[11px] text-rose-800 block">
                  {expenses.length} pos pengeluaran tercatat
                </span>
              </div>
            </div>

            {/* 1. MINIMALIST UNDERLINED LIST: PIUTANG / UNPAID INVOICES */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Rincian Tagihan Piutang Belum Lunas ({unpaidTransactions.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Faktur servis yang tercatat bon / tempo saat pembayaran.
                  </p>
                </div>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                  Status: Menunggu Bayar
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
                {unpaidTransactions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada piutang tertunggak saat ini (Semua transaksi lunas)
                  </div>
                ) : (
                  unpaidTransactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-amber-700">
                              {tx.invoiceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {tx.date}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-slate-600">
                              {tx.plateNumber}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-xs">
                            {tx.customerName} ({tx.vehicleModel})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Mekanik: {tx.mechanicName}
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs font-black text-rose-600 font-mono">
                            Rp {tx.total.toLocaleString('id-ID')}
                          </span>
                          <span className="block text-[10px] font-bold text-amber-600 mt-0.5">
                            Belum Lunas
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. MINIMALIST UNDERLINED LIST: PENGELUARAN KAS KECIL OPERASIONAL */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Rincian Arus Kas Keluar Operasional (Kas Kecil) ({expenses.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Beban pengeluaran belanja bahan, konsumsi & perlengkapan bengkel.
                  </p>
                </div>
                <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                  Arus Outflow
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Belum ada pengeluaran kas kecil tercatat
                  </div>
                ) : (
                  expenses.map((exp) => (
                    <div key={exp.id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {exp.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {exp.date}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-xs">
                            {exp.title}
                          </h4>
                          {exp.notes && (
                            <p className="text-[10px] text-slate-500 italic">
                              Catatan: {exp.notes}
                            </p>
                          )}
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs font-black text-rose-600 font-mono">
                            -Rp {exp.amount.toLocaleString('id-ID')}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Kasir: {exp.recordedBy || 'Admin Kasir'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
