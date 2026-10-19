import React, { useState } from 'react';
import { 
  BarChart3, 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Download, 
  Printer, 
  Plus, 
  Calendar, 
  PieChart, 
  CheckCircle2, 
  X,
  CreditCard,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { KedaiOrder, KedaiExpense, KedaiMenuItem } from '../KedaiTypes';

interface LaporanViewProps {
  orders: KedaiOrder[];
  expenses: KedaiExpense[];
  menuItems: KedaiMenuItem[];
  onAddExpense: (expense: Omit<KedaiExpense, 'id'>) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  orders,
  expenses,
  menuItems,
  onAddExpense
}) => {
  const [activeTab, setActiveTab] = useState<'omset' | 'bestseller' | 'pengeluaran'>('omset');
  const [period, setPeriod] = useState<'hari_ini' | 'kemarin' | '7_hari' | 'bulan_ini'>('hari_ini');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // New Expense form
  const [expCategory, setExpCategory] = useState<'Operasional' | 'Bahan Baku' | 'Listrik & Air' | 'Gaji & Upah' | 'Lain-lain'>('Operasional');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(50000);
  const [expRecordedBy, setExpRecordedBy] = useState('Kasir');

  // Filtered orders & calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalTransactions = orders.length;
  const avgBasket = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  // Payment Breakdown
  const paymentBreakdown = {
    tunai: orders.filter(o => o.paymentMethod === 'tunai').reduce((s, o) => s + o.total, 0),
    qris: orders.filter(o => o.paymentMethod === 'qris').reduce((s, o) => s + o.total, 0),
    transfer: orders.filter(o => o.paymentMethod === 'transfer').reduce((s, o) => s + o.total, 0),
    debit: orders.filter(o => o.paymentMethod === 'debit').reduce((s, o) => s + o.total, 0)
  };

  // Best sellers
  const bestSellerMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach(ord => {
    ord.items.forEach(it => {
      if (!bestSellerMap[it.name]) {
        bestSellerMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
      }
      bestSellerMap[it.name].qty += it.qty;
      bestSellerMap[it.name].revenue += it.totalPrice;
    });
  });

  const bestSellerList = Object.values(bestSellerMap).sort((a, b) => b.qty - a.qty);

  // Hourly bars simulation
  const hourlyData = [
    { hour: '08:00', total: 68000 },
    { hour: '10:00', total: 145000 },
    { hour: '12:00', total: 320000 },
    { hour: '14:00', total: 460000 },
    { hour: '16:00', total: 580000 },
    { hour: '18:00', total: 720000 },
    { hour: '20:00', total: 640000 },
    { hour: '22:00', total: 290000 }
  ];
  const maxHourly = Math.max(...hourlyData.map(h => h.total));

  const handleExportCSV = () => {
    let csv = 'Invoice,Waktu,Meja/Tipe,Pelanggan,Metode,Total\n';
    orders.forEach(o => {
      csv += `"${o.invoiceNumber}","${o.createdAt}","${o.tableName}","${o.customerName}","${o.paymentMethod || 'tunai'}",${o.total}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_KedaiQu_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || !expAmount) return;
    onAddExpense({
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      description: expDesc.trim(),
      amount: expAmount,
      recordedBy: expRecordedBy.trim() || 'Kasir'
    });
    setExpDesc('');
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7DFD5]">
        <div>
          <h2 className="text-xl font-bold text-[#1B3B2B] flex items-center gap-2">
            <span>📊 Laporan Keuangan, Omset & Best-Seller</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#C59B27]" />
              <span>PRO 👑</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis performa penjualan, laba bersih estimasi, ranking menu terlaris, dan ekspor pembukuan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E7DFD5] bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-xs"
            title="Ekspor CSV untuk Excel"
          >
            <Download className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrintSummary}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-all flex items-center gap-1 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Cetak Ringkasan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-[#E7DFD5] shadow-xs">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Omset (Gross)</p>
          <p className="text-lg font-black text-[#1B3B2B] mt-1">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">🟢 {totalTransactions} Pesanan</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Estimasi Laba Bersih</p>
          <p className="text-lg font-black text-emerald-700 mt-1">
            Rp {netProfit.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Omset - Pengeluaran</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-rose-200 shadow-xs">
          <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Beban Pengeluaran</p>
          <p className="text-lg font-black text-rose-700 mt-1">
            Rp {totalExpenses.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{expenses.length} Catatan Biaya</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Rata-rata Struk (AOV)</p>
          <p className="text-lg font-black text-[#C59B27] mt-1">
            Rp {avgBasket.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Per Transaksi</p>
        </div>
      </div>

      {/* Sub Tabs Underline */}
      <div className="flex items-center gap-2 border-b border-[#E7DFD5] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('omset')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'omset'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Grafik & Metode Pembayaran</span>
        </button>

        <button
          onClick={() => setActiveTab('bestseller')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'bestseller'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Menu Terlaris (Best-Seller)</span>
        </button>

        <button
          onClick={() => setActiveTab('pengeluaran')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'pengeluaran'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-rose-600" />
          <span>Beban Operasional ({expenses.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: GRAFIK & METODE BAYAR */}
      {activeTab === 'omset' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Hourly chart */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs text-[#1B3B2B]">Distribusi Omset Jam Operasional</h3>
              <span className="text-[10px] text-slate-400">Peak hour jam 16:00 - 20:00</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
              {hourlyData.map(h => {
                const heightPercent = Math.max(15, Math.round((h.total / maxHourly) * 100));
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#1B3B2B] hover:bg-[#C59B27] rounded-t-md transition-all relative group"
                    >
                      <div className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                        Rp {(h.total / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 rotate-45 sm:rotate-0 origin-left sm:origin-center mt-1">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs text-[#1B3B2B]">Komposisi Metode Pembayaran</h3>
              <CreditCard className="w-3.5 h-3.5 text-[#C59B27]" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] flex justify-between items-center">
                <span className="font-semibold text-slate-700">💵 Uang Tunai</span>
                <span className="font-bold text-[#1B3B2B]">Rp {paymentBreakdown.tunai.toLocaleString('id-ID')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex justify-between items-center text-sky-900">
                <span className="font-semibold">📱 QRIS / E-Wallet</span>
                <span className="font-bold">Rp {paymentBreakdown.qris.toLocaleString('id-ID')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex justify-between items-center text-purple-900">
                <span className="font-semibold">🏦 Transfer Bank BCA</span>
                <span className="font-bold">Rp {paymentBreakdown.transfer.toLocaleString('id-ID')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center text-amber-900">
                <span className="font-semibold">💳 Kartu Debit EDC</span>
                <span className="font-bold">Rp {paymentBreakdown.debit.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MENU TERLARIS */}
      {activeTab === 'bestseller' && (
        <div className="bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-[#1B3B2B]">Peringkat Menu Paling Banyak Dipesan</h3>
            <span className="text-[10px] text-slate-400">Diurutkan berdasarkan porsi terjual</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {bestSellerList.map((item, idx) => (
              <div key={item.name} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center ${
                    idx === 0 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : idx === 1 
                      ? 'bg-slate-200 text-slate-700' 
                      : idx === 2 
                      ? 'bg-amber-50 text-amber-800' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <p className="text-[10px] text-slate-400">{item.qty} porsi terjual</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-[#1B3B2B]">
                    Rp {item.revenue.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-[#C59B27] font-semibold">
                    Kontribusi Omset
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: BEBAN PENGELUARAN */}
      {activeTab === 'pengeluaran' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
            <p className="text-xs text-slate-500">
              Catatan biaya es batu, gas LPG, listrik, gaji barista, dan belanja harian
            </p>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Pengeluaran</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs divide-y divide-slate-100 text-xs">
            {expenses.map(exp => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{exp.description}</h4>
                  <p className="text-[11px] text-slate-400">
                    {exp.date} • Kategori: <strong>{exp.category}</strong> • Dicatat: {exp.recordedBy}
                  </p>
                </div>
                <span className="font-bold text-rose-700 text-sm">
                  -Rp {exp.amount.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Catat Pengeluaran Baru */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveExpense} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Catat Beban Pengeluaran Kedai</h3>
              <button 
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                >
                  <option value="Operasional">Operasional (Es batu, Gas, Plastik, dll.)</option>
                  <option value="Bahan Baku">Bahan Baku & Pasar</option>
                  <option value="Listrik & Air">Listrik, Air & Internet WiFi</option>
                  <option value="Gaji & Upah">Gaji & Upah Harian</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan Biaya</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Beli Es Kristal 3 Bal"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Biaya (Rp)</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Petugas yang Mencatat</label>
                <input
                  type="text"
                  value={expRecordedBy}
                  onChange={(e) => setExpRecordedBy(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Simpan Pengeluaran
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
