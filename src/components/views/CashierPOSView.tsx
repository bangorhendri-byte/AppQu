import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  X, 
  Printer, 
  Send, 
  CheckCircle2, 
  Clock, 
  Coins, 
  CreditCard, 
  QrCode, 
  Building2, 
  DollarSign, 
  Receipt, 
  Calculator, 
  FileText, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Calendar, 
  User, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ShoppingCart,
  Wrench
} from 'lucide-react';
import { ServiceItem, Sparepart, Transaction, ServiceQueue, ExpenseItem, PettyCashConfig, ClosingRecord, ServiceStatus, StaffMember } from '../../types';
import { INITIAL_STAFF } from '../../data/mockData';
import { PosCoreView } from '../pos/PosCoreView';

interface CashierPOSViewProps {
  initialTab?: string;
  onBack: () => void;
  spareparts: Sparepart[];
  transactions: Transaction[];
  queues: ServiceQueue[];
  onCompleteTransaction: (newTx: Transaction) => void;
  onOpenReceipt: (tx: Transaction) => void;
  preselectedQueue?: ServiceQueue | null;
  onUpdateQueueStatus?: (id: string, status: ServiceStatus, progress?: number) => void;
  onAddQueue?: (newQueue: ServiceQueue) => void;
  staff?: StaffMember[];
}

export const CashierPOSView: React.FC<CashierPOSViewProps> = ({
  initialTab = 'kasir',
  onBack,
  spareparts,
  transactions,
  queues,
  onCompleteTransaction,
  onOpenReceipt,
  preselectedQueue,
  onUpdateQueueStatus,
  onAddQueue,
  staff = INITIAL_STAFF
}) => {
  // Normalize active tab
  const getNormalizedTab = (tab: string) => {
    if (tab === 'pos-core') return 'pos-core';
    if (tab === 'pos-checkout' || tab === 'kasir') return 'kasir';
    if (tab === 'pos-receivable' || tab === 'piutang') return 'piutang';
    if (tab === 'pos-history' || tab === 'riwayat-transaksi') return 'riwayat-transaksi';
    if (tab === 'pos-pettycash' || tab === 'petty-cash') return 'petty-cash';
    if (tab === 'pos-expenses' || tab === 'kas-kecil') return 'kas-kecil';
    if (tab === 'pos-closing' || tab === 'closingan') return 'closingan';
    return 'kasir';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getNormalizedTab(initialTab));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Today Date Helper
  const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  // -------------------------------------------------------------
  // STATE: 1. KASIR (POS Checkout)
  // -------------------------------------------------------------
  const [kasirMode, setKasirMode] = useState<'list' | 'checkout'>(() => {
    return preselectedQueue && preselectedQueue.status === 'selesai' ? 'checkout' : 'list';
  });
  const [selectedQueueId, setSelectedQueueId] = useState<string>(preselectedQueue?.id || '');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Transfer Bank'>('Tunai');
  const [cashierNotes, setCashierNotes] = useState<string>('');
  const [cashierResponsible, setCashierResponsible] = useState<string>('Bpk. Ahmad Fauzi (Kasir Utama)');
  const [selectedMechanicName, setSelectedMechanicName] = useState<string>(() => preselectedQueue?.mechanicName || '');

  // -------------------------------------------------------------
  // STATE: 2. PETTY CASH (Modal & Kembalian)
  // -------------------------------------------------------------
  const [pettyCash, setPettyCash] = useState<PettyCashConfig>(() => {
    const saved = localStorage.getItem('bq_petty_cash');
    return saved ? JSON.parse(saved) : {
      initialCapital: 300000,
      denominations: {
        '100000': 1,
        '50000': 2,
        '20000': 3,
        '10000': 3,
        '5000': 2,
        '2000': 0,
        '1000': 0
      },
      updatedAt: todayStr
    };
  });

  // -------------------------------------------------------------
  // STATE: 3. KAS KECIL (Small Expenses)
  // -------------------------------------------------------------
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('bq_kas_kecil');
    return saved ? JSON.parse(saved) : [
      { id: 'exp-1', title: 'Bensin Pertalite Tes Motor Tarikan', category: 'BBM / Transport', amount: 25000, date: todayStr, notes: 'Tes motor KLX BQ-05' },
      { id: 'exp-2', title: 'Beli Air Mineral Galon & Gelas Kasir', category: 'Konsumsi', amount: 22000, date: todayStr, notes: 'Konsumsi bengkel' }
    ];
  });

  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseItem['category']>('Operasional');
  const [expAmount, setExpAmount] = useState<number>(15000);
  const [expNotes, setExpNotes] = useState('');

  // -------------------------------------------------------------
  // STATE: 4. CLOSINGAN (End-of-day Reconciliation)
  // -------------------------------------------------------------
  const [actualDrawerCash, setActualDrawerCash] = useState<number>(0);
  const [closingShiftName, setClosingShiftName] = useState<string>('Shift Pagi - Sore (Utama)');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [isClosingComplete, setIsClosingComplete] = useState<boolean>(false);

  // Search filter inside History & Piutang
  const [searchHistory, setSearchHistory] = useState<string>('');

  // Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync initial tab when changed from props
  useEffect(() => {
    setActiveTab(getNormalizedTab(initialTab));
  }, [initialTab]);

  // Persist Petty Cash
  useEffect(() => {
    localStorage.setItem('bq_petty_cash', JSON.stringify(pettyCash));
  }, [pettyCash]);

  // Persist Kas Kecil
  useEffect(() => {
    localStorage.setItem('bq_kas_kecil', JSON.stringify(expenses));
  }, [expenses]);

  // Dynamic Header Title & Subtitle based on active sub-menu
  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'pos-core':
        return { title: 'Kasir POS Offline', subtitle: 'Katalog, Checkout & Struk (100% Offline IndexedDB)' };
      case 'kasir':
        if (kasirMode === 'checkout' && activeSelectedQueue) {
          return {
            title: `Kasir • ${activeSelectedQueue.plateNumber}`,
            subtitle: `Rincian Biaya & Pembayaran (${activeSelectedQueue.queueNumber})`
          };
        }
        return { title: 'Kasir', subtitle: 'Log Servis Selesai & Pembayaran POS' };
      case 'piutang':
        return { title: 'Piutang', subtitle: 'Daftar Tagihan Belum Lunas (Tempo)' };
      case 'riwayat-transaksi':
        return { title: 'Riwayat Transaksi', subtitle: 'Log Riwayat Pembayaran & Faktur' };
      case 'petty-cash':
        return { title: 'Petty Cash', subtitle: 'Modal Awal & Uang Kembalian Laci' };
      case 'kas-kecil':
        return { title: 'Kas Kecil', subtitle: 'Biaya Pengeluaran Operasional Harian' };
      case 'closingan':
        return { title: 'Closingan', subtitle: 'Tutup Kasir & Rekonsiliasi Shift' };
      default:
        return { title: 'Kasir POS', subtitle: 'Sistem Keuangan Kasir' };
    }
  };

  // Completed services ready for payment in Kasir
  const completedQueues = queues.filter((q) => q.status === 'selesai');
  const activeSelectedQueue = completedQueues.find((q) => q.id === selectedQueueId) || (kasirMode === 'checkout' ? completedQueues[0] : null);

  const headerMeta = getHeaderMeta();

  // Auto-sync selected queue when preselectedQueue changes
  useEffect(() => {
    if (preselectedQueue && preselectedQueue.status === 'selesai') {
      setSelectedQueueId(preselectedQueue.id);
      setSelectedMechanicName(preselectedQueue.mechanicName || '');
      setKasirMode('checkout');
    }
  }, [preselectedQueue]);

  // Sync selected mechanic when active queue changes
  useEffect(() => {
    if (activeSelectedQueue) {
      setSelectedMechanicName(activeSelectedQueue.mechanicName || '');
    }
  }, [activeSelectedQueue?.id]);

  // Header Back handler
  const handleHeaderBack = () => {
    if (activeTab === 'kasir' && kasirMode === 'checkout') {
      setKasirMode('list');
      return;
    }
    onBack();
  };

  // Helper to add sample finished unit if empty (matching BQ-02 & BQ-03)
  const handleAddSampleCompletedQueue = () => {
    if (!onAddQueue) return;
    const sample1: ServiceQueue = {
      id: `q-sample-bq02-${Date.now()}`,
      queueNumber: 'BQ-02',
      plateNumber: 'B 3190 TKL',
      customerName: 'Siti Rahmawati',
      customerPhone: '08571238990',
      vehicleModel: 'Yamaha NMAX 155 Connected',
      vehicleType: 'Motor Matic',
      serviceCategory: 'Ganti Oli & Filter',
      mechanicName: 'Mas Eko',
      status: 'selesai',
      complaint: 'Ganti oli mesin rutin dan cek bohlam rem.',
      timeIn: '08:45 WIB',
      estimatedCompletion: '09:30 WIB',
      progressPercent: 100,
      notes: 'Pengerjaan selesai sempurna, siap bayar.',
      totalCost: 125000,
      items: [
        { id: 'it-1', name: 'Yamalube Super Matic 1.0L', price: 78000, qty: 1, type: 'part' },
        { id: 'it-2', name: 'Bohlam Rem Belakang T10 Osram', price: 17000, qty: 1, type: 'part' },
        { id: 'it-3', name: 'Jasa Ganti Oli & Cek Ringan', price: 30000, qty: 1, type: 'jasa' }
      ]
    };

    const sample2: ServiceQueue = {
      id: `q-sample-bq03-${Date.now() + 1}`,
      queueNumber: 'BQ-03',
      plateNumber: 'D 2819 KHG',
      customerName: 'Bambang Supriyanto',
      customerPhone: '081399...',
      vehicleModel: 'Honda BeAT eSP Fi (2020)',
      vehicleType: 'Motor Matic',
      serviceCategory: 'Servis Ringan',
      mechanicName: 'Mas Dani',
      status: 'selesai',
      complaint: 'Starter susah hidup, ganti busi NGK.',
      timeIn: '08:00 WIB',
      estimatedCompletion: '08:50 WIB',
      progressPercent: 100,
      notes: 'Busi kotor diganti baru NGK MR9C.',
      totalCost: 85000,
      items: [
        { id: 'it-4', name: 'Busi NGK MR9C-9N Original', price: 35000, qty: 1, type: 'part' },
        { id: 'it-5', name: 'Jasa Tune Up Injeksi & Reset ECU', price: 50000, qty: 1, type: 'jasa' }
      ]
    };

    onAddQueue(sample1);
    onAddQueue(sample2);
    setSelectedQueueId(sample1.id);
    showToast(`Daftar servis siap bayar (BQ-02 & BQ-03) berhasil dimuat!`);
  };

  // Auto-calculated current invoice figures
  const currentSubtotal = activeSelectedQueue?.totalCost || 0;
  const currentTotal = Math.max(0, currentSubtotal - discountAmount);
  const currentChange = Math.max(0, cashGiven - currentTotal);

  // Unpaid transactions (Piutang)
  const unpaidTransactions = transactions.filter((t) => t.status === 'Belum Lunas');
  const totalReceivables = unpaidTransactions.reduce((sum, t) => sum + t.total, 0);

  // Closing figures calculation
  const totalCashSales = transactions
    .filter((t) => t.status === 'Lunas' && t.paymentMethod === 'Tunai')
    .reduce((sum, t) => sum + t.total, 0);

  const totalNonCashSales = transactions
    .filter((t) => t.status === 'Lunas' && t.paymentMethod !== 'Tunai')
    .reduce((sum, t) => sum + t.total, 0);

  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Expected cash in drawer: Modal awal + Penjualan tunai - Pengeluaran kas kecil
  const expectedCashInDrawer = (pettyCash.initialCapital || 0) + totalCashSales - totalExpensesAmount;
  const cashDifference = actualDrawerCash - expectedCashInDrawer;

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------

  // 1. KASIR: Process Paid Payment
  const handleProcessPayment = () => {
    if (!activeSelectedQueue) {
      showToast('Pilih kendaraan yang selesai diservis terlebih dahulu!');
      return;
    }

    const resolvedMechanic = selectedMechanicName.trim() || activeSelectedQueue.mechanicName;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${todayStr}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      customerName: activeSelectedQueue.customerName,
      plateNumber: activeSelectedQueue.plateNumber,
      vehicleModel: activeSelectedQueue.vehicleModel,
      mechanicName: resolvedMechanic,
      items: activeSelectedQueue.items,
      subtotal: currentSubtotal,
      discount: discountAmount,
      total: currentTotal,
      paymentMethod: selectedPaymentMethod,
      cashPaid: selectedPaymentMethod === 'Tunai' ? cashGiven : currentTotal,
      change: selectedPaymentMethod === 'Tunai' ? currentChange : 0,
      status: 'Lunas'
    };

    onCompleteTransaction(newTx);

    // Update queue status to 'diambil'
    if (onUpdateQueueStatus) {
      onUpdateQueueStatus(activeSelectedQueue.id, 'diambil', 100);
    }

    showToast(`Transaksi ${newTx.invoiceNumber} Lunas (Mekanik: ${resolvedMechanic})!`);
    onOpenReceipt(newTx);
    setKasirMode('list');
    setSelectedQueueId('');
  };

  // 1. KASIR: Mark as Unpaid (Save to Piutang)
  const handleSaveAsUnpaid = () => {
    if (!activeSelectedQueue) return;

    const resolvedMechanic = selectedMechanicName.trim() || activeSelectedQueue.mechanicName;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: `${todayStr}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      customerName: activeSelectedQueue.customerName,
      plateNumber: activeSelectedQueue.plateNumber,
      vehicleModel: activeSelectedQueue.vehicleModel,
      mechanicName: resolvedMechanic,
      items: activeSelectedQueue.items,
      subtotal: currentSubtotal,
      discount: discountAmount,
      total: currentTotal,
      paymentMethod: 'Tunai',
      status: 'Belum Lunas'
    };

    onCompleteTransaction(newTx);

    if (onUpdateQueueStatus) {
      onUpdateQueueStatus(activeSelectedQueue.id, 'diambil', 100);
    }

    showToast(`Faktur dicatat sebagai Piutang! Pindah ke menu Piutang.`);
    // Automated Flow: Move directly to Piutang sub-menu
    setKasirMode('list');
    setSelectedQueueId('');
    setActiveTab('piutang');
  };

  // 1. KASIR: Send WhatsApp Receipt
  const handleSendWhatsAppReceipt = (queue: ServiceQueue) => {
    const phone = queue.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;

    const itemsSummary = queue.items
      .map((it, idx) => `${idx + 1}. ${it.name} (${it.qty}x) = Rp ${(it.price * it.qty).toLocaleString('id-ID')}`)
      .join('\n');

    const msg = `*STRUK RESMI KASIR BENGKEL QU*
============================
No. Plat    : ${queue.plateNumber}
Pelanggan   : ${queue.customerName}
Kendaraan   : ${queue.vehicleModel}
Tanggal     : ${todayStr}
Mekanik     : ${queue.mechanicName}

*RINCIAN BIAYA:*
${itemsSummary}
----------------------------
Subtotal    : Rp ${currentSubtotal.toLocaleString('id-ID')}
Diskon      : Rp ${discountAmount.toLocaleString('id-ID')}
*TOTAL BAYAR: Rp ${currentTotal.toLocaleString('id-ID')}*
============================
Terima kasih telah mempercayakan perawatan kendaraan Anda kepada Bengkel Qu!`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // 2. PIUTANG: Settle Unpaid Invoice
  const handleSettlePiutang = (tx: Transaction) => {
    tx.status = 'Lunas';
    showToast(`Piutang faktur ${tx.invoiceNumber} berhasil dilunasi!`);
    onOpenReceipt(tx);
  };

  // 3. KAS KECIL: Add Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) return;

    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount),
      date: todayStr,
      notes: expNotes.trim()
    };

    setExpenses([newExp, ...expenses]);
    setExpTitle('');
    setExpNotes('');
    setExpAmount(15000);
    showToast(`Pengeluaran Rp ${newExp.amount.toLocaleString('id-ID')} dicatat ke Kas Kecil.`);
  };

  // 4. PETTY CASH: Update Denominations
  const handleUpdateDenomination = (denom: string, count: number) => {
    const updatedDenoms = { ...pettyCash.denominations, [denom]: Math.max(0, count) };
    const calculatedSum = Object.entries(updatedDenoms).reduce((sum, [key, qty]) => sum + Number(key) * qty, 0);

    setPettyCash({
      initialCapital: calculatedSum,
      denominations: updatedDenoms,
      updatedAt: todayStr
    });
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* =========================================================================
          1. COMPACT SUB-MENU HEADER
          - Reduced & compact header size
          - Dynamically matches and displays the name of the active sub-menu
          - Filter buttons completely removed
      ========================================================================= */}
      <div 
        className="bg-[#008952] text-white px-4 py-2.5 shadow-sm sticky top-0 z-30"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={handleHeaderBack}
              aria-label="Kembali"
              className="w-8 h-8 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="min-w-0">
              {/* Dynamic Header Title */}
              <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
                {headerMeta.title}
              </h1>
              <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2 py-1 rounded-lg bg-emerald-800/40 text-[10px] font-bold text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-200" />
              <span>{todayStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          2. SUB-MENU CONTENTS & WORKFLOWS
      ========================================================================= */}
      <div className="flex-1 flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full">
        {/* TAB: POS CORE OFFLINE (100% INDEXEDDB) */}
        {activeTab === 'pos-core' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('pos-core')}
                  className="py-1.5 px-3.5 rounded-xl text-xs font-black transition bg-white text-emerald-800 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Kasir POS Offline (IndexedDB)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('kasir')}
                  className="py-1.5 px-3.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Log Servis Bengkel ({completedQueues.length})
                </button>
              </div>
            </div>

            <PosCoreView moduleKey="bengkel" onBack={() => setActiveTab('kasir')} />
          </div>
        )}

        {/* =====================================================================
            A. KASIR (Log Servis Selesai & Full-Screen Checkout)
        ===================================================================== */}
        {activeTab === 'kasir' && kasirMode === 'list' && (
          <div className="space-y-4">
            {/* Quick Switcher to POS Core */}
            <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl w-full sm:w-auto self-start">
              <button
                type="button"
                onClick={() => setActiveTab('kasir')}
                className="flex-1 sm:flex-initial py-1.5 px-3.5 rounded-xl text-xs font-black transition bg-white text-[#008952] shadow-xs cursor-pointer"
              >
                Log Servis Bengkel ({completedQueues.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pos-core')}
                className="flex-1 sm:flex-initial py-1.5 px-3.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kasir POS Offline (IndexedDB)</span>
              </button>
            </div>

            {/* LOG SERVIS SIAP BAYAR (Clean Minimalist Underline Style - No Boxes) */}
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs">
              {/* Header with Underline Divider */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#008952]" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Log Servis Siap Bayar
                  </h3>
                  <span className="text-[11px] font-bold bg-emerald-100 text-[#008952] px-2.5 py-0.5 rounded-full ml-1">
                    {completedQueues.length} Unit
                  </span>
                </div>
                {onAddQueue && (
                  <button
                    type="button"
                    onClick={handleAddSampleCompletedQueue}
                    className="text-[11px] font-semibold text-[#008952] hover:text-[#007545] border-b border-[#008952] hover:border-[#007545] pb-0.5 transition-colors cursor-pointer"
                  >
                    + Muat Data Siap Bayar
                  </button>
                )}
              </div>

              {completedQueues.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#008952] flex items-center justify-center mx-auto mb-2.5">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Tidak Ada Servis Menunggu Pembayaran</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Semua servis yang telah diselesaikan di menu Servis akan otomatis masuk ke log daftar ini.
                  </p>
                  {onAddQueue && (
                    <button
                      type="button"
                      onClick={handleAddSampleCompletedQueue}
                      className="mt-4 inline-flex items-center gap-1.5 bg-[#008952] hover:bg-[#007545] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Muat Unit Siap Bayar (BQ-02 & BQ-03)</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {completedQueues.map((q) => {
                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setSelectedQueueId(q.id);
                          setDiscountAmount(0);
                          setCashGiven(0);
                          setKasirMode('checkout');
                        }}
                        className="py-3.5 px-1 sm:px-2 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Sisi Kiri: Informasi Utama & Kendaraan */}
                          <div className="flex-1 min-w-0 pr-2">
                            {/* Baris 1: Kode Servis (Underline Aksen) & Plat Nomor */}
                            <div className="flex items-baseline gap-2.5">
                              <span className="font-black text-xs text-[#008952] tracking-wider uppercase border-b-2 border-[#008952] pb-0.5">
                                {q.queueNumber}
                              </span>
                              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                                {q.plateNumber}
                              </span>
                            </div>

                            {/* Baris 2: Nama & Tipe Kendaraan */}
                            <p className="text-[13px] font-semibold text-slate-700 mt-1.5 leading-snug truncate">
                              {q.vehicleModel}
                            </p>

                            {/* Baris 3: Pemilik & Nomor Kontak */}
                            <p className="text-xs text-slate-500 mt-1 leading-snug truncate">
                              <span className="font-medium text-slate-700">{q.customerName}</span>
                              <span className="mx-1.5 text-slate-300">•</span>
                              <span>{q.customerPhone}</span>
                            </p>

                            {/* Baris 4: Mekanik Penanggung Jawab */}
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                              Mekanik: <span className="text-slate-800 font-medium">{q.mechanicName}</span>
                            </p>
                          </div>

                          {/* Sisi Kanan: Total Biaya & Tombol Aksi Bayar */}
                          <div className="flex flex-col items-end justify-between self-stretch shrink-0 text-right">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none">
                                Total Biaya
                              </span>
                              <span className="text-base sm:text-lg font-black text-[#008952] tracking-tight leading-normal mt-0.5 block">
                                Rp {q.totalCost.toLocaleString('id-ID')}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQueueId(q.id);
                                setDiscountAmount(0);
                                setCashGiven(0);
                                setKasirMode('checkout');
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 bg-[#008952] hover:bg-[#007545] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <span>Bayar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            DEDICATED FULL-SCREEN VIEW: RINCIAN BIAYA & PEMBAYARAN KASIR
            - Dedicated page transition when a vehicle is selected
            - Displays full cost breakdown, editing options & payment interface
        ===================================================================== */}
        {activeTab === 'kasir' && kasirMode === 'checkout' && activeSelectedQueue && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Back navigation breadcrumb */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setKasirMode('list')}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#008952] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#008952]" />
                <span>Kembali ke Daftar Servis</span>
              </button>

              <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>Halaman Pembayaran</span>
              </div>
            </div>

            {/* LARGE CARD: Detailed Cost Breakdown with Minimalist Underlines */}
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 space-y-5">
              {/* Card Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-xl bg-[#008952] text-white flex flex-col items-center justify-center shadow-xs">
                    <span className="text-[9px] font-bold uppercase text-emerald-200">Antrian</span>
                    <span className="text-base font-black leading-none mt-0.5">{activeSelectedQueue.queueNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeSelectedQueue.plateNumber}</h2>
                      <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                        {activeSelectedQueue.vehicleModel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pelanggan: <strong className="text-slate-800 font-bold">{activeSelectedQueue.customerName}</strong> ({activeSelectedQueue.customerPhone})
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2 ml-auto w-full sm:w-auto min-w-[270px] shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Mekanik Penanggung Jawab</span>
                    </span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-950 font-black px-1.5 py-0.2 rounded uppercase">
                      Auto Komisi
                    </span>
                  </div>

                  <select
                    value={selectedMechanicName || activeSelectedQueue.mechanicName}
                    onChange={(e) => setSelectedMechanicName(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shadow-2xs"
                  >
                    {staff
                      .filter((s) => s.role === 'Mekanik')
                      .map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} (Komisi: {m.commissionPercent || 20}%)
                        </option>
                      ))}
                    {!staff.some((s) => s.name === (selectedMechanicName || activeSelectedQueue.mechanicName)) && (
                      <option value={activeSelectedQueue.mechanicName}>
                        {activeSelectedQueue.mechanicName} (20%)
                      </option>
                    )}
                  </select>

                  {(() => {
                    const laborSum = activeSelectedQueue.items
                      .filter((it) => it.type === 'jasa')
                      .reduce((sum, it) => sum + (it.price * it.qty), 0);
                    const chosenMechanicName = selectedMechanicName || activeSelectedQueue.mechanicName;
                    const matchedMechanic = staff.find((s) => s.name.toLowerCase() === chosenMechanicName.toLowerCase());
                    const rate = matchedMechanic?.commissionPercent !== undefined ? matchedMechanic.commissionPercent : 20;
                    const estCommission = Math.round((laborSum * rate) / 100);

                    return (
                      <div className="pt-1.5 border-t border-emerald-200 flex items-center justify-between text-[11px] flex-wrap gap-1">
                        <span className="text-emerald-900 font-semibold">
                          Jasa: <strong>Rp {laborSum.toLocaleString('id-ID')}</strong> ({rate}%)
                        </span>
                        <span className="font-black text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-300 shadow-2xs flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-500" />
                          <span>+ Rp {estCommission.toLocaleString('id-ID')}</span>
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Detailed Items Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Rincian Jasa & Suku Cadang Terpasang
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {activeSelectedQueue.items.map((it, idx) => (
                    <div key={it.id || idx} className="p-3 flex items-center justify-between text-xs bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                          it.type === 'part' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {it.type}
                        </span>
                        <span className="font-semibold text-slate-800">{it.name}</span>
                        <span className="text-slate-400 font-medium text-[11px]">x{it.qty}</span>
                      </div>
                      <span className="font-black text-slate-900">
                        Rp {(it.price * it.qty).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimalist Underlined Payment Interaction Fields */}
              <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-slate-100 space-y-4">
                {/* Subtotal Display */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Subtotal Jasa & Part</span>
                  <span>Rp {currentSubtotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Underlined Discount Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Diskon / Potongan Manual (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={discountAmount || ''}
                      onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-sm transition-colors focus:outline-none"
                    />
                  </div>

                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-sm transition-colors focus:outline-none cursor-pointer"
                    >
                      <option value="Tunai">💵 Uang Tunai (Cash)</option>
                      <option value="QRIS">📱 QRIS / GoPay / OVO</option>
                      <option value="Transfer Bank">🏦 Transfer Bank (BCA/Mandiri/BRI)</option>
                    </select>
                  </div>
                </div>

                {/* Total Tagihan Banner */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs font-black text-slate-800 uppercase">Grand Total Tagihan</span>
                  <span className="text-xl font-black text-[#008952]">Rp {currentTotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Underlined Cash Paid Input if Cash Method */}
                {selectedPaymentMethod === 'Tunai' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Uang Diterima dari Pelanggan (Rp) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={cashGiven || ''}
                          onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                          placeholder={`Contoh: ${currentTotal}`}
                          className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-900 font-black text-base transition-colors focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Kembalian</span>
                        <span className={`text-base font-black ${currentChange >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          Rp {currentChange.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Quick Cash Chips */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">Pilihan Cepat:</span>
                      <button
                        type="button"
                        onClick={() => setCashGiven(currentTotal)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Uang Pas (Rp {currentTotal.toLocaleString('id-ID')})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashGiven(Math.ceil(currentTotal / 50000) * 50000)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Rp {(Math.ceil(currentTotal / 50000) * 50000).toLocaleString('id-ID')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashGiven(Math.ceil(currentTotal / 100000) * 100000)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Rp {(Math.ceil(currentTotal / 100000) * 100000).toLocaleString('id-ID')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Underlined Notes Input */}
                <div className="group pt-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Catatan Transaksi / Keterangan Nota
                  </label>
                  <input
                    type="text"
                    value={cashierNotes}
                    onChange={(e) => setCashierNotes(e.target.value)}
                    placeholder="Contoh: Sudah termasuk garansi servis 1 minggu..."
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-medium text-xs transition-colors focus:outline-none"
                  />
                </div>
              </div>

              {/* Output Options & Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {/* Output: Cetak Struk */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Cetak Struk</span>
                  </button>

                  {/* Output: Kirim via WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppReceipt(activeSelectedQueue)}
                    className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {/* Simpan sebagai Piutang */}
                  <button
                    type="button"
                    onClick={handleSaveAsUnpaid}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-amber-200 active:scale-95 transition-all cursor-pointer"
                  >
                    Belum Bayar (Piutang)
                  </button>

                  {/* Bayar Lunas */}
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="bg-[#008952] hover:bg-[#007545] text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md shadow-emerald-700/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bayar (Lunas)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kasir' && kasirMode === 'checkout' && !activeSelectedQueue && (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm">Tidak ada unit servis yang dipilih</h4>
            <p className="text-xs text-slate-400">Silakan kembali ke daftar servis untuk memilih unit yang akan dibayar.</p>
            <button
              type="button"
              onClick={() => setKasirMode('list')}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#008952] px-4 py-2 rounded-xl shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Log Servis</span>
            </button>
          </div>
        )}

        {/* =====================================================================
            B. PIUTANG (Accounts Receivable)
            - Minimalist underlined list/log of unpaid transactions
            - Pulled directly from cashier session when invoice is marked unpaid
            - Options to settle (Bayar Sekarang) or send WhatsApp payment reminder
        ===================================================================== */}
        {activeTab === 'piutang' && (
          <div className="space-y-4">
            {/* Summary Banner */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Total Piutang Belum Lunas
                </span>
                <span className="text-2xl font-black text-amber-900 mt-0.5 block">
                  Rp {totalReceivables.toLocaleString('id-ID')}
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                  {unpaidTransactions.length} Tagihan invoice berstatus tempo / belum dibayar pelanggan.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* List of Unpaid Transactions */}
            {unpaidTransactions.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#008952] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ada Piutang Tertunggak</h3>
                <p className="text-xs text-slate-400 mt-1">Seluruh tagihan pelanggan telah lunas!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidTransactions.map((tx) => (
                  <div key={tx.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">{tx.plateNumber}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                            Belum Lunas
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">{tx.customerName} • {tx.vehicleModel}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">No. Faktur: {tx.invoiceNumber} • {tx.date}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Tagihan Piutang</span>
                        <span className="text-base font-black text-amber-600">Rp {tx.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Itemized List */}
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                      {tx.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>{it.name} x{it.qty}</span>
                          <span className="font-bold">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions: Pelunasan & WhatsApp Reminder */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          const msg = `Halo ${tx.customerName}, mengingatkan tagihan servis ${tx.plateNumber} di Bengkel Qu sebesar Rp ${tx.total.toLocaleString('id-ID')}. Terima kasih!`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Send className="w-3.5 h-3.5 text-slate-500" />
                        <span>Kirim Tagihan WA</span>
                      </button>

                      <button
                        onClick={() => handleSettlePiutang(tx)}
                        className="bg-[#008952] hover:bg-[#007545] text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Pelunasan (Bayar Sekarang)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            C. RIWAYAT TRANSAKSI (Transaction History)
            - Clean, minimalist underlined log tracking all historical transactions
        ===================================================================== */}
        {activeTab === 'riwayat-transaksi' && (
          <div className="space-y-4">
            {/* Search Box */}
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder="Cari nomor invoice, plat nomor, atau nama pelanggan..."
                className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#008952] focus:ring-0 rounded-none py-1 px-0 text-slate-800 text-xs font-semibold focus:outline-none"
              />
            </div>

            {/* Transaction Cards */}
            <div className="space-y-3">
              {transactions
                .filter(t => 
                  !searchHistory || 
                  t.invoiceNumber.toLowerCase().includes(searchHistory.toLowerCase()) ||
                  t.plateNumber.toLowerCase().includes(searchHistory.toLowerCase()) ||
                  t.customerName.toLowerCase().includes(searchHistory.toLowerCase())
                )
                .map((tx) => (
                  <div key={tx.id} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{tx.invoiceNumber}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            tx.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.status}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                            {tx.paymentMethod}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-1">{tx.plateNumber} • {tx.customerName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{tx.date}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Transaksi</span>
                        <span className="text-base font-black text-[#008952]">Rp {tx.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">{tx.items.length} Rincian Item (Jasa & Part)</span>
                      <button
                        onClick={() => onOpenReceipt(tx)}
                        className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat & Cetak Faktur</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            D. PETTY CASH (Modal & Kembalian)
            - Minimalist underlined form/display for managing initial capital & change
        ===================================================================== */}
        {activeTab === 'petty-cash' && (
          <div className="space-y-4">
            {/* Large Card for Petty Cash Management */}
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-[#008952] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                    Kas Laci Kasir (Cash Drawer)
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-1.5">Manajemen Modal & Uang Kembalian</h2>
                  <p className="text-xs text-slate-400">Atur uang kas awal shift agar kasir siap memberi uang kembalian.</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Modal Kasir</span>
                  <span className="text-2xl font-black text-[#008952]">
                    Rp {pettyCash.initialCapital.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Minimalist Underlined Input Table for Currency Denominations */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Rincian Pecahan Uang Fisik di Laci Kasir
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(pettyCash.denominations).map(([denom, count]) => (
                    <div key={denom} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          Pecahan Rp {Number(denom).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Total: Rp {(Number(denom) * count).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="w-24 group">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah (Lembar)</label>
                        <input
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => handleUpdateDenomination(denom, parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1 px-0 text-slate-900 font-black text-sm text-right focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast('Data modal awal petty cash berhasil disimpan!')}
                  className="w-full bg-[#008952] hover:bg-[#007545] text-white font-extrabold text-xs py-3.5 px-5 rounded-2xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  <span>Simpan & Kunci Modal Awal Laci</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            E. KAS KECIL (Small Expenses)
            - Large card form styled with minimalist underlines
            - Detailed list tracking operational expense outflows
        ===================================================================== */}
        {activeTab === 'kas-kecil' && (
          <div className="space-y-5">
            {/* LARGE CARD FORM: Minimalist Underlined Input Form */}
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md">
                    Pengeluaran Operasional
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-1.5">Input Pengeluaran Kas Kecil</h2>
                  <p className="text-xs text-slate-400">Catat pembelian bensin, konsumsi, majun, atau kebutuhan darurat bengkel.</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Hari Ini</span>
                  <span className="text-xl font-black text-red-600">
                    Rp {totalExpensesAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Underlined Expense Title */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Nama Pengeluaran / Kebutuhan *
                    </label>
                    <input
                      type="text"
                      required
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="Contoh: Beli Bensin Tes Unit Motor"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-2 px-0 text-slate-800 font-bold text-sm transition-colors focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
                    />
                  </div>

                  {/* Underlined Category */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Kategori Pengeluaran
                    </label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as any)}
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-2 px-0 text-slate-800 font-bold text-sm transition-colors focus:outline-none cursor-pointer"
                    >
                      <option value="Operasional">Operasional Bengkel</option>
                      <option value="BBM / Transport">BBM / Transportasi</option>
                      <option value="Bahan / Perlengkapan">Bahan / Perlengkapan (Majun/Sabun)</option>
                      <option value="Konsumsi">Konsumsi Mekanik & Tamu</option>
                      <option value="Lainnya">Lain-lain</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Underlined Amount */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Nominal Pengeluaran (Rp) *
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      required
                      value={expAmount || ''}
                      onChange={(e) => setExpAmount(Number(e.target.value) || 0)}
                      placeholder="15000"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-2 px-0 text-slate-900 font-black text-sm transition-colors focus:outline-none"
                    />
                  </div>

                  {/* Underlined Notes */}
                  <div className="group">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Catatan / PIC Pembeli
                    </label>
                    <input
                      type="text"
                      value={expNotes}
                      onChange={(e) => setExpNotes(e.target.value)}
                      placeholder="Nama kasir atau mekanik yang membeli"
                      className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-2 px-0 text-slate-800 font-semibold text-xs transition-colors focus:outline-none placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-3 px-5 rounded-2xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Catat Pengeluaran Kas Kecil</span>
                  </button>
                </div>
              </form>
            </div>

            {/* View/Log of Expenses */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Riwayat Pengeluaran Kas Kecil ({expenses.length})</h3>
              <div className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{exp.title}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                          {exp.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{exp.date} • {exp.notes || 'Tanpa catatan'}</p>
                    </div>

                    <span className="font-black text-red-600 text-sm shrink-0">
                      - Rp {exp.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            F. CLOSINGAN (End-of-Day Reconciliation)
            - Large-sized summary card designed with minimalist underlines
            - Neat typography, structured accounting format, and clean copywriting
        ===================================================================== */}
        {activeTab === 'closingan' && (
          <div className="space-y-5">
            {/* LARGE-SIZED SUMMARY CARD: REKONSILIASI KASIR */}
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 space-y-6">
              {/* Header Card */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                    Rekonsiliasi Kas & Tutup Kasir
                  </span>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 mt-2 tracking-tight">
                    Laporan Closing Kasir Harian
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verifikasi dan rekonsiliasi uang fisik di laci kasir terhadap seluruh pembukuan transaksi sistem.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Status Shift</span>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs ${
                    isClosingComplete ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {isClosingComplete ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{isClosingComplete ? 'Shift Selesai Ditutup' : 'Shift Aktif Berjalan'}</span>
                  </span>
                </div>
              </div>

              {/* IDENTITAS SHIFT & PETUGAS KASIR (MINIMALIST UNDERLINES) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Nama Shift Kerja
                  </label>
                  <select
                    value={closingShiftName}
                    onChange={(e) => setClosingShiftName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs transition-colors focus:outline-none cursor-pointer"
                  >
                    <option value="Shift Pagi - Sore (Utama)">Shift Pagi - Sore (08:00 - 16:00 WIB)</option>
                    <option value="Shift Sore - Malam">Shift Sore - Malam (16:00 - 21:00 WIB)</option>
                    <option value="Shift Penuh (Full Day)">Shift Penuh / Seharian Penuh</option>
                  </select>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Petugas Kasir (PIC)
                  </label>
                  <input
                    type="text"
                    value={cashierResponsible}
                    onChange={(e) => setCashierResponsible(e.target.value)}
                    placeholder="Nama petugas kasir"
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-1.5 px-0 text-slate-800 font-bold text-xs transition-colors focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Waktu Pembukuan
                  </label>
                  <div className="py-1.5 text-slate-700 font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{todayStr}</span>
                  </div>
                </div>
              </div>

              {/* MATRIKS REKONSILIASI KAS FISIK LACI (TABEL RAPI) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    I. Arus Kas Tunai Laci (Cash Drawer Ledger)
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Berdasarkan pencatatan hari ini</span>
                </div>

                <div className="bg-slate-50/90 rounded-2xl p-4 md:p-5 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/70">
                    <div>
                      <span className="font-extrabold text-slate-800 block">1. Modal Awal Kasir (Petty Cash)</span>
                      <span className="text-[11px] text-slate-400">Saldo uang pecahan modal buka kasir & kembalian</span>
                    </div>
                    <span className="font-black text-slate-800 text-sm">
                      + Rp {pettyCash.initialCapital.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/70">
                    <div>
                      <span className="font-extrabold text-emerald-800 block">2. Total Penjualan Tunai (Cash Inflow)</span>
                      <span className="text-[11px] text-slate-400">Total penerimaan uang tunai dari nota servis lunas</span>
                    </div>
                    <span className="font-black text-emerald-700 text-sm">
                      + Rp {totalCashSales.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/70">
                    <div>
                      <span className="font-extrabold text-red-700 block">3. Total Pengeluaran Kas Kecil (Cash Outflow)</span>
                      <span className="text-[11px] text-slate-400">Biaya operasional harian: BBM, konsumsi & perlengkapan</span>
                    </div>
                    <span className="font-black text-red-600 text-sm">
                      - Rp {totalExpensesAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* TARGET FISIK UANG DI LACI BANNER (PROMINENT HIGHLIGHT) */}
                  <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block">
                        Target Uang Fisik di Laci Kasir (Expected Cash)
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Rumus: Modal Awal + Penjualan Tunai - Pengeluaran Kas Kecil
                      </span>
                    </div>
                    <span className="text-xl md:text-2xl font-black text-[#008952] shrink-0">
                      Rp {expectedCashInDrawer.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* INFORMASI TAMBAHAN: NON-TUNAI & PIUTANG */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  II. Ringkasan Non-Tunai & Piutang (Non-Laci)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Penjualan Non-Tunai (QRIS & Bank)
                    </span>
                    <span className="text-lg font-black text-slate-800 block">
                      Rp {totalNonCashSales.toLocaleString('id-ID')}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Uang masuk langsung ke rekening bank bengkel, tidak ada fisik uang di laci.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                      Tagihan Piutang Servis (Tempo)
                    </span>
                    <span className="text-lg font-black text-amber-700 block">
                      Rp {totalReceivables.toLocaleString('id-ID')}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {unpaidTransactions.length} faktur servis belum dilunasi oleh pelanggan.
                    </p>
                  </div>
                </div>
              </div>

              {/* INPUT HITUNGAN FISIK LACI & KOTAK STATUS SELISIH (MINIMALIST UNDERLINES) */}
              <div className="space-y-4 pt-1 border-t border-slate-100">
                <div className="group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      Hitungan Fisik Uang Tunai di Laci Kasir (Actual Cash) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setActualDrawerCash(expectedCashInDrawer)}
                      className="text-[11px] font-extrabold text-[#008952] hover:underline cursor-pointer"
                    >
                      Cocokkan Target: Rp {expectedCashInDrawer.toLocaleString('id-ID')}
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={actualDrawerCash || ''}
                    onChange={(e) => setActualDrawerCash(Number(e.target.value) || 0)}
                    placeholder={`Masukkan nominal uang fisik di laci (Target: Rp ${expectedCashInDrawer.toLocaleString('id-ID')})`}
                    className="w-full bg-transparent border-0 border-b-2 border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-2 px-0 text-slate-900 font-black text-lg md:text-xl transition-colors focus:outline-none placeholder:text-slate-300 placeholder:text-sm placeholder:font-normal"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Hitung seluruh uang lembaran dan koin di laci kasir, lalu ketik total nominalnya di sini.
                  </span>
                </div>

                {/* KOTAK STATUS SELISIH YANG SANGAT RAPI */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  cashDifference === 0
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : cashDifference > 0
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                        Status Rekonsiliasi Kas
                      </span>
                      <h4 className="text-sm font-black mt-0.5">
                        {cashDifference === 0
                          ? 'STATUS: SALDO PAS (BALANCE / COCOK)'
                          : cashDifference > 0
                          ? `STATUS: KAS BERLEBIH (+Rp ${cashDifference.toLocaleString('id-ID')})`
                          : `STATUS: KAS KURANG (-Rp ${Math.abs(cashDifference).toLocaleString('id-ID')})`}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                        {cashDifference === 0
                          ? 'Hitungan uang fisik di laci cocok 100% dengan target sistem pembukuan. Tidak ada selisih kas (Rp 0).'
                          : cashDifference > 0
                          ? `Uang fisik di laci kasir berlebih sebesar Rp ${cashDifference.toLocaleString('id-ID')}. Mohon cek kembali jika ada transaksi belum tercatat.`
                          : `Uang fisik di laci kasir kurang sebesar Rp ${Math.abs(cashDifference).toLocaleString('id-ID')}. Mohon cek pengeluaran kas kecil yang belum diinput.`}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className={`text-xs font-black px-3 py-1.5 rounded-xl bg-white shadow-2xs border ${
                        cashDifference === 0
                          ? 'text-emerald-700 border-emerald-200'
                          : cashDifference > 0
                          ? 'text-blue-700 border-blue-200'
                          : 'text-rose-700 border-rose-200'
                      }`}>
                        {cashDifference === 0 ? 'COCOK ✓' : 'SELISIH !'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UNDERLINED CLOSING NOTES */}
                <div className="group">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Catatan Kasir / Keterangan Serah Terima Shift
                  </label>
                  <input
                    type="text"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder="Contoh: Laci kasir telah direkonsiliasi dan diserahkan dalam kondisi rapi ke shift berikutnya..."
                    className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#008952] focus:ring-0 rounded-none py-2 px-0 text-slate-800 font-semibold text-xs transition-colors focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>

                {/* TOMBOL AKSI TUTUP KASIR */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Cetak Lembar Closing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = `*LAPORAN CLOSING KASIR - BENGKEL QU*
================================
Tanggal          : ${todayStr}
Shift            : ${closingShiftName}
Petugas Kasir    : ${cashierResponsible}
--------------------------------
1. Modal Awal    : Rp ${pettyCash.initialCapital.toLocaleString('id-ID')}
2. Penjualan Tunai: Rp ${totalCashSales.toLocaleString('id-ID')}
3. Kas Kecil     : Rp ${totalExpensesAmount.toLocaleString('id-ID')}
--------------------------------
Target Fisik Laci: Rp ${expectedCashInDrawer.toLocaleString('id-ID')}
Hitungan Riil Laci: Rp ${actualDrawerCash.toLocaleString('id-ID')}
Status Selisih   : Rp ${cashDifference.toLocaleString('id-ID')} (${cashDifference === 0 ? 'BALANCE' : cashDifference > 0 ? 'SURPLUS' : 'DEFISIT'})
--------------------------------
Non-Tunai (Bank) : Rp ${totalNonCashSales.toLocaleString('id-ID')}
Piutang Tempo    : Rp ${totalReceivables.toLocaleString('id-ID')}
================================
Catatan: ${closingNotes || 'Semua pembukuan shift telah diselesaikan dengan rapi.'}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim Rekap WA ke Owner</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsClosingComplete(true);
                      showToast('Tutup kasir shift hari ini berhasil dibukukan & disahkan!');
                    }}
                    className="bg-[#008952] hover:bg-[#007545] text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-emerald-700/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tutup Shift & Sahkan Laporan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
