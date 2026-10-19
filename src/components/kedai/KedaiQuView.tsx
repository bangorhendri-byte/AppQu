import React, { useState, useEffect } from 'react';
import { 
  Menu as MenuIcon, 
  X, 
  Layers, 
  ArrowLeft, 
  Sparkles, 
  Crown, 
  Coffee, 
  Bell, 
  Store, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
  ShoppingCart,
  Package,
  BarChart3
} from 'lucide-react';
import { 
  KedaiMenuTab, 
  KasirSubTab, 
  KedaiTable, 
  KedaiMenuItem, 
  KDSTicket, 
  KedaiOrder, 
  KedaiIngredient, 
  KedaiShoppingRecord, 
  KedaiPromo, 
  KedaiCustomer, 
  KedaiDebt, 
  KedaiExpense, 
  KedaiStaff, 
  KedaiSettings,
  OrderItem
} from './KedaiTypes';
import { 
  STORAGE_KEYS, 
  DEFAULT_TABLES, 
  DEFAULT_MENU, 
  DEFAULT_CATEGORIES, 
  DEFAULT_KDS, 
  DEFAULT_INGREDIENTS, 
  DEFAULT_SHOPPING, 
  DEFAULT_PROMOS, 
  DEFAULT_CUSTOMERS, 
  DEFAULT_DEBTS, 
  DEFAULT_EXPENSES, 
  DEFAULT_STAFF, 
  DEFAULT_SETTINGS,
  getKedaiStorage,
  setKedaiStorage
} from './KedaiStorage';

import { DenahView } from './views/DenahView';
import { KasirView } from './views/KasirView';
import { MenuView } from './views/MenuView';
import { BahanView } from './views/BahanView';
import { MarketingView } from './views/MarketingView';
import { PelangganView } from './views/PelangganView';
import { LaporanView } from './views/LaporanView';
import { SettingView } from './views/SettingView';

interface KedaiQuViewProps {
  onBackToBengkel?: () => void;
  onOpenMasterSwitcher: () => void;
  onOpenOnlineCatalog?: () => void;
}

export const KedaiQuView: React.FC<KedaiQuViewProps> = ({
  onBackToBengkel,
  onOpenMasterSwitcher,
  onOpenOnlineCatalog
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<KedaiMenuTab>('denah');
  const [kasirInitialSubTab, setKasirInitialSubTab] = useState<KasirSubTab>('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTableForPOS, setSelectedTableForPOS] = useState<KedaiTable | null>(null);

  // Isolated Persistent State with prefix usahaku_data_kedai_*
  const [tables, setTables] = useState<KedaiTable[]>(() => 
    getKedaiStorage(STORAGE_KEYS.TABLES, DEFAULT_TABLES)
  );
  const [menuItems, setMenuItems] = useState<KedaiMenuItem[]>(() => 
    getKedaiStorage(STORAGE_KEYS.MENU, DEFAULT_MENU)
  );
  const [categories, setCategories] = useState<string[]>(() => 
    getKedaiStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  );
  const [kdsTickets, setKdsTickets] = useState<KDSTicket[]>(() => 
    getKedaiStorage(STORAGE_KEYS.KDS, DEFAULT_KDS)
  );
  const [orders, setOrders] = useState<KedaiOrder[]>(() => 
    getKedaiStorage(STORAGE_KEYS.ORDERS, [])
  );
  const [ingredients, setIngredients] = useState<KedaiIngredient[]>(() => 
    getKedaiStorage(STORAGE_KEYS.INGREDIENTS, DEFAULT_INGREDIENTS)
  );
  const [shoppingRecords, setShoppingRecords] = useState<KedaiShoppingRecord[]>(() => 
    getKedaiStorage(STORAGE_KEYS.SHOPPING, DEFAULT_SHOPPING)
  );
  const [promos, setPromos] = useState<KedaiPromo[]>(() => 
    getKedaiStorage(STORAGE_KEYS.PROMOS, DEFAULT_PROMOS)
  );
  const [customers, setCustomers] = useState<KedaiCustomer[]>(() => 
    getKedaiStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS)
  );
  const [debts, setDebts] = useState<KedaiDebt[]>(() => 
    getKedaiStorage(STORAGE_KEYS.DEBTS, DEFAULT_DEBTS)
  );
  const [expenses, setExpenses] = useState<KedaiExpense[]>(() => 
    getKedaiStorage(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES)
  );
  const [staffList, setStaffList] = useState<KedaiStaff[]>(() => 
    getKedaiStorage(STORAGE_KEYS.STAFF, DEFAULT_STAFF)
  );
  const [settings, setSettings] = useState<KedaiSettings>(() => 
    getKedaiStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  // Sync to localStorage
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.TABLES, tables); }, [tables]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.MENU, menuItems); }, [menuItems]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.CATEGORIES, categories); }, [categories]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.KDS, kdsTickets); }, [kdsTickets]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.ORDERS, orders); }, [orders]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.INGREDIENTS, ingredients); }, [ingredients]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.SHOPPING, shoppingRecords); }, [shoppingRecords]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.PROMOS, promos); }, [promos]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.CUSTOMERS, customers); }, [customers]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.DEBTS, debts); }, [debts]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.EXPENSES, expenses); }, [expenses]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.STAFF, staffList); }, [staffList]);
  useEffect(() => { setKedaiStorage(STORAGE_KEYS.SETTINGS, settings); }, [settings]);

  // Low stock warning count
  const lowStockCount = ingredients.filter(i => i.stock <= i.minStock).length;
  const activeKDSCount = kdsTickets.filter(t => t.status !== 'selesai').length;
  const activeTableCount = tables.filter(t => t.status === 'terisi' || t.status === 'billing').length;

  // Handlers
  const handleUpdateTable = (updated: KedaiTable) => {
    setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleAddTable = (newTableData: Omit<KedaiTable, 'id'>) => {
    const newTable: KedaiTable = {
      ...newTableData,
      id: `tbl-${Date.now()}`
    };
    setTables(prev => [...prev, newTable]);
  };

  const handleSelectTableForOrder = (table: KedaiTable) => {
    setSelectedTableForPOS(table);
    setKasirInitialSubTab('pos');
    setActiveTab('kasir');
  };

  const handlePayTableBill = (table: KedaiTable) => {
    setSelectedTableForPOS(table);
    setKasirInitialSubTab('bill');
    setActiveTab('kasir');
  };

  const handleSendToKDS = (ticket: KDSTicket, tableId?: string, orderItems?: OrderItem[]) => {
    setKdsTickets(prev => [ticket, ...prev]);
    if (tableId && orderItems) {
      setTables(prev => prev.map(tbl => {
        if (tbl.id === tableId) {
          const currentItems = tbl.orderItems || [];
          const merged = [...currentItems, ...orderItems];
          const total = merged.reduce((s, it) => s + it.totalPrice, 0);
          return {
            ...tbl,
            status: 'terisi',
            orderItems: merged,
            orderTotal: total,
            customerName: tbl.customerName || ticket.waiterName || 'Tamu',
            occupiedSince: tbl.occupiedSince || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return tbl;
      }));
    }
  };

  const handleCompleteOrder = (order: KedaiOrder, targetTableId?: string) => {
    setOrders(prev => [order, ...prev]);
    // If order was for a table, free up the table
    if (targetTableId) {
      setTables(prev => prev.map(tbl => {
        if (tbl.id === targetTableId) {
          return {
            ...tbl,
            status: 'kosong',
            customerName: undefined,
            pax: undefined,
            orderTotal: undefined,
            orderItems: [],
            occupiedSince: undefined
          };
        }
        return tbl;
      }));
    }
    // Record customer visit/points if matched
    if (order.customerName) {
      const matchCust = customers.find(c => c.name.toLowerCase() === order.customerName.toLowerCase());
      if (matchCust) {
        const addedPoints = Math.floor(order.total / 10000);
        setCustomers(prev => prev.map(c => {
          if (c.id === matchCust.id) {
            return {
              ...c,
              totalVisits: c.totalVisits + 1,
              totalSpent: c.totalSpent + order.total,
              points: c.points + addedPoints,
              lastVisit: 'Hari ini'
            };
          }
          return c;
        }));
      }
    }
  };

  const handleResetKedaiDemo = () => {
    setTables(DEFAULT_TABLES);
    setMenuItems(DEFAULT_MENU);
    setCategories(DEFAULT_CATEGORIES);
    setKdsTickets(DEFAULT_KDS);
    setOrders([]);
    setIngredients(DEFAULT_INGREDIENTS);
    setShoppingRecords(DEFAULT_SHOPPING);
    setPromos(DEFAULT_PROMOS);
    setCustomers(DEFAULT_CUSTOMERS);
    setDebts(DEFAULT_DEBTS);
    setExpenses(DEFAULT_EXPENSES);
    setStaffList(DEFAULT_STAFF);
    setSettings(DEFAULT_SETTINGS);
    alert('Data KedaiQu telah direset ke demo awal.');
  };

  // 8 Main Menus
  const navItems = [
    { id: 'denah', label: 'Denah', icon: '🗺️', desc: 'Layout Meja & Status Area', badge: activeTableCount > 0 ? `${activeTableCount} aktif` : undefined },
    { id: 'kasir', label: 'Kasir', icon: '🛒', desc: 'POS, KDS Dapur & Bill Meja', badge: activeKDSCount > 0 ? `${activeKDSCount} antri` : undefined },
    { id: 'menu', label: 'Menu', icon: '📋', desc: 'Katalog, Topping & Varian', badge: undefined },
    { id: 'bahan', label: 'Bahan', icon: '📦', desc: 'Stok Baku, Belanja & Warning', badge: lowStockCount > 0 ? `⚠️ ${lowStockCount}` : undefined },
    { id: 'marketing', label: 'Marketing', icon: '🏷️', desc: 'Diskon, Poin & Promo WA', isPro: true },
    { id: 'pelanggan', label: 'Pelanggan', icon: '👤', desc: 'Member Loyalty & Kasbon', badge: debts.filter(d => d.status === 'belum_lunas').length > 0 ? 'Bon' : undefined },
    { id: 'laporan', label: 'Laporan', icon: '📊', desc: 'Omset, Best-Seller & Ekspor', isPro: true },
    { id: 'setting', label: 'Setting', icon: '⚙️', desc: 'Nota, Bluetooth, Staf & Backup', isPro: true }
  ];

  // Elevated & Enlarged Bottom Navigation Tabs with Clear Icons
  const bottomNavTabs = [
    { id: 'denah', label: 'Denah', icon: LayoutGrid, badge: activeTableCount > 0 ? activeTableCount : undefined },
    { id: 'kasir', label: 'Kasir', icon: ShoppingCart, badge: activeKDSCount > 0 ? activeKDSCount : undefined },
    { id: 'menu', label: 'Menu', icon: Coffee, badge: undefined },
    { id: 'bahan', label: 'Bahan', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'laporan', label: 'Laporan', icon: BarChart3, badge: undefined },
    { id: 'more', label: 'Lainnya', icon: MenuIcon, badge: undefined }
  ];

  return (
    <div className="flex-1 flex h-full w-full bg-[#FAF7F2] text-slate-800 font-sans antialiased overflow-hidden select-none">
      {/* ===================== SIDEBAR KIRI (Forest Green #1B3B2B) ===================== */}
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside 
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        className={`
        fixed lg:static top-0 left-0 h-full z-50
        w-64 bg-[#1B3B2B] text-slate-200 shadow-2xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        flex flex-col justify-between shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header Sidebar */}
        <div>
          <div className="p-4 border-b border-[#254F3A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                onClick={onOpenMasterSwitcher}
                className="w-9 h-9 rounded-xl bg-[#C59B27] text-[#1B3B2B] font-black text-sm flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform"
                title="Buka Master Ecosystem Switcher"
              >
                KQ
              </div>
              <div>
                <h1 className="font-bold text-sm text-[#FAF7F2] flex items-center gap-1.5 leading-tight">
                  <span>KedaiQu</span>
                </h1>
                <p className="text-[10px] text-[#C59B27] font-medium tracking-wide">
                  Kopi & Resto • Modern POS
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden w-7 h-7 rounded-lg bg-[#254F3A] text-slate-300 flex items-center justify-center hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Shop Status Bar */}
          <div className="px-3.5 py-2.5 bg-[#163023] border-b border-[#254F3A] text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kedai Buka • Kasir Aktif</span>
            </div>
            <span className="text-[10px] text-[#C59B27] font-bold">WiFi Ready</span>
          </div>

          {/* Daftar 8 Menu Utama (Minimalis Tanpa Tumpukan Kotak / Box-Ception) */}
          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-220px)] text-xs">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as KedaiMenuTab);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between
                    transition-all duration-150 group
                    ${isActive 
                      ? 'bg-[#254F3A] text-[#FAF7F2] border-l-4 border-[#C59B27] font-bold shadow-xs' 
                      : 'text-slate-300 hover:bg-[#254F3A]/60 hover:text-white font-medium border-l-4 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <span className={`block text-xs leading-tight ${isActive ? 'text-[#FAF7F2]' : 'text-slate-200'}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-none">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.isPro && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#C59B27]/20 text-[#C59B27] border border-[#C59B27]/40">
                        👑
                      </span>
                    )}
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badge.includes('⚠️') || item.badge === 'Bon'
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                          : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar: Tombol Switcher Ekosistem */}
        <div 
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
          className="p-3 border-t border-[#254F3A] bg-[#163023] space-y-2 text-xs"
        >
          <button
            onClick={onOpenMasterSwitcher}
            className="w-full py-2 px-3 rounded-xl bg-[#254F3A] hover:bg-[#2e6248] text-slate-200 font-semibold transition-all flex items-center justify-between group shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#C59B27]" />
              <span className="text-[11px]">Ganti Modul UsahaQu</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onBackToBengkel && (
            <button
              onClick={onBackToBengkel}
              className="w-full py-1.5 px-3 rounded-lg text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Kembali ke BengkelQu</span>
            </button>
          )}
        </div>
      </aside>

      {/* ===================== MAIN VIEWPORT CONTAINER (Warm Cream #FAF7F2) ===================== */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#FAF7F2]">
        {/* Top App Header (Aman di bawah jam & batre bawaan HP) */}
        <header 
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0.625rem)' }}
          className="bg-white border-b border-[#E7DFD5] px-4 pb-2.5 flex items-center justify-between shrink-0 z-30 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              title="Buka Navigasi Kedai"
            >
              <MenuIcon className="w-5 h-5 text-[#1B3B2B]" />
            </button>

            {/* Logo KedaiQu (Sama dengan Logo di Sidebar: Kotak Emas KQ) & Title */}
            <div className="flex items-center gap-2.5">
              <div 
                onClick={onOpenMasterSwitcher}
                className="w-9 h-9 rounded-xl bg-[#C59B27] text-[#1B3B2B] font-black text-sm flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0"
                title="Buka Master Ecosystem Switcher"
              >
                KQ
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-black text-base sm:text-lg text-[#1B3B2B] leading-none tracking-tight">
                    KedaiQu
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C59B27]/15 text-[#C59B27] border border-[#C59B27]/30">
                    Kopi & Resto
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Right Header: Slogan & Status (Ringkas tanpa tombol tumpuk) */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1B3B2B]/80 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E7DFD5]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{settings.slogan || 'Nongkrong Santai, Rasa Premium'}</span>
            </span>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="max-w-6xl mx-auto pb-28">
            {/* 1. Denah */}
            {activeTab === 'denah' && (
              <DenahView
                tables={tables}
                onUpdateTable={handleUpdateTable}
                onAddTable={handleAddTable}
                onSelectTableForOrder={handleSelectTableForOrder}
                onPayTableBill={handlePayTableBill}
              />
            )}

            {/* 2. Kasir */}
            {activeTab === 'kasir' && (
              <KasirView
                menuItems={menuItems}
                categories={categories}
                tables={tables}
                kdsTickets={kdsTickets}
                promos={promos}
                settings={settings}
                selectedTableForPOS={selectedTableForPOS}
                onClearSelectedTable={() => setSelectedTableForPOS(null)}
                onUpdateKDS={(updated) => setKdsTickets(updated)}
                onCompleteOrder={handleCompleteOrder}
                onSendToKDS={handleSendToKDS}
                initialSubTab={kasirInitialSubTab}
              />
            )}

            {/* 3. Menu */}
            {activeTab === 'menu' && (
              <MenuView
                menuItems={menuItems}
                categories={categories}
                onAddMenuItem={(item) => {
                  const newMenu: KedaiMenuItem = { ...item, id: `m-${Date.now()}` };
                  setMenuItems(prev => [...prev, newMenu]);
                }}
                onUpdateMenuItem={(item) => {
                  setMenuItems(prev => prev.map(m => m.id === item.id ? item : m));
                }}
                onDeleteMenuItem={(id) => {
                  setMenuItems(prev => prev.filter(m => m.id !== id));
                }}
                onAddCategory={(cat) => {
                  if (!categories.includes(cat)) {
                    setCategories(prev => [...prev, cat]);
                  }
                }}
              />
            )}

            {/* 4. Bahan */}
            {activeTab === 'bahan' && (
              <BahanView
                ingredients={ingredients}
                shoppingRecords={shoppingRecords}
                onUpdateIngredient={(ing) => {
                  setIngredients(prev => prev.map(i => i.id === ing.id ? ing : i));
                }}
                onAddIngredient={(ing) => {
                  const newIng: KedaiIngredient = { ...ing, id: `ing-${Date.now()}` };
                  setIngredients(prev => [...prev, newIng]);
                }}
                onAddShoppingRecord={(rec) => {
                  const newRec: KedaiShoppingRecord = { ...rec, id: `shop-${Date.now()}` };
                  setShoppingRecords(prev => [newRec, ...prev]);
                  // Also record to expenses
                  const newExp: KedaiExpense = {
                    id: `exp-${Date.now()}`,
                    date: rec.date,
                    category: 'Bahan Baku',
                    description: `Belanja ${rec.ingredientName} (${rec.qty} ${rec.unit}) - ${rec.supplier}`,
                    amount: rec.totalCost,
                    recordedBy: 'Kasir / Petugas Belanja'
                  };
                  setExpenses(prev => [newExp, ...prev]);
                }}
              />
            )}

            {/* 5. Marketing */}
            {activeTab === 'marketing' && (
              <MarketingView
                promos={promos}
                customers={customers}
                onAddPromo={(p) => {
                  const newP: KedaiPromo = { ...p, id: `prm-${Date.now()}`, usedCount: 0 };
                  setPromos(prev => [...prev, newP]);
                }}
                onTogglePromo={(id) => {
                  setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
                }}
                onOpenOnlineCatalog={onOpenOnlineCatalog}
              />
            )}

            {/* 6. Pelanggan */}
            {activeTab === 'pelanggan' && (
              <PelangganView
                customers={customers}
                debts={debts}
                onAddCustomer={(c) => {
                  const newC: KedaiCustomer = {
                    ...c,
                    id: `cst-${Date.now()}`,
                    points: 0,
                    totalVisits: 1,
                    totalSpent: 0,
                    lastVisit: 'Hari ini'
                  };
                  setCustomers(prev => [...prev, newC]);
                }}
                onAddDebt={(d) => {
                  const newD: KedaiDebt = { ...d, id: `dbt-${Date.now()}`, status: 'belum_lunas' };
                  setDebts(prev => [newD, ...prev]);
                }}
                onSettleDebt={(debtId) => {
                  setDebts(prev => prev.map(d => d.id === debtId ? {
                    ...d,
                    status: 'lunas',
                    settledAt: new Date().toLocaleDateString('id-ID')
                  } : d));
                }}
              />
            )}

            {/* 7. Laporan */}
            {activeTab === 'laporan' && (
              <LaporanView
                orders={orders}
                expenses={expenses}
                menuItems={menuItems}
                onAddExpense={(exp) => {
                  const newE: KedaiExpense = { ...exp, id: `exp-${Date.now()}` };
                  setExpenses(prev => [newE, ...prev]);
                }}
              />
            )}

            {/* 8. Setting */}
            {activeTab === 'setting' && (
              <SettingView
                settings={settings}
                staffList={staffList}
                onUpdateSettings={(newSet) => setSettings(newSet)}
                onAddStaff={(stf) => {
                  const newStf: KedaiStaff = { ...stf, id: `stf-${Date.now()}` };
                  setStaffList(prev => [...prev, newStf]);
                }}
                onUpdateStaff={(stf) => {
                  setStaffList(prev => prev.map(s => s.id === stf.id ? stf : s));
                }}
                onResetKedaiDemo={handleResetKedaiDemo}
              />
            )}
          </div>
        </main>

        {/* Bottom Navigation Bar KedaiQu (Terkunci Permanen di Bawah - Tidak Bergerak / Tidak Bergeser / Tidak Tertutup) */}
        <nav 
          aria-label="KedaiQu Bottom Navigation"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.625rem)' }}
          className="shrink-0 w-full bg-white border-t-2 border-[#E7DFD5] px-2 sm:px-4 pt-2.5 pb-2.5 flex items-center justify-around z-40 shadow-[0_-6px_24px_rgba(0,0,0,0.1)] select-none"
        >
          <div className="flex items-center justify-around w-full max-w-lg mx-auto gap-1 sm:gap-2">
            {bottomNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'more') {
                      setIsSidebarOpen(true);
                    } else {
                      setActiveTab(tab.id as KedaiMenuTab);
                    }
                  }}
                  className={`flex-1 py-2 px-1 min-w-[50px] max-w-[80px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 relative cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[#1B3B2B] text-white shadow-md shadow-[#1B3B2B]/35 scale-105 ring-2 ring-[#C59B27]/40'
                      : 'text-slate-600 hover:text-[#1B3B2B] hover:bg-slate-100/90'
                  }`}
                  title={tab.label}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'text-[#C59B27] stroke-[2.5]' : 'text-slate-600 stroke-2'}`} />
                    {tab.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9.5px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] leading-none tracking-tight ${
                    isActive ? 'font-black text-[#FAF7F2]' : 'font-semibold text-slate-700'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
