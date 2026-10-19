/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Tag, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  Layers, 
  Clock, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Crown
} from 'lucide-react';
import { 
  RitelMenuTab, 
  RitelProduct, 
  RitelTransaction, 
  HeldCart, 
  RitelSupplier, 
  RitelPurchaseOrder, 
  RitelPromo, 
  RitelCustomer, 
  StockOpnameSession, 
  DamagedGoodRecord, 
  RitelStoreProfile, 
  StockOpnameItem 
} from './RitelTypes';
import { 
  RITEL_STORAGE_KEYS, 
  getRitelStorage, 
  setRitelStorage,
  DEFAULT_RITEL_PROFILE,
  DEFAULT_RITEL_PRODUCTS,
  DEFAULT_RITEL_SUPPLIERS,
  DEFAULT_RITEL_CUSTOMERS,
  DEFAULT_RITEL_PROMOS,
  DEFAULT_RITEL_TRANSACTIONS,
  DEFAULT_RITEL_PURCHASES,
  DEFAULT_RITEL_DAMAGED,
  DEFAULT_RITEL_OPNAMES
} from './RitelStorage';

import { KasirView } from './views/KasirView';
import { StokInventoryView } from './views/StokInventoryView';
import { SupplierPurchasesView } from './views/SupplierPurchasesView';
import { MarketingPromoView } from './views/MarketingPromoView';
import { PelangganView } from './views/PelangganView';
import { StokOpnameView } from './views/StokOpnameView';
import { LaporanView } from './views/LaporanView';
import { SettingView } from './views/SettingView';

interface RitelQuViewProps {
  onBackToBengkel?: () => void;
  onOpenMasterSwitcher: () => void;
  onOpenOnlineCatalog?: () => void;
}

export const RitelQuView: React.FC<RitelQuViewProps> = ({
  onBackToBengkel,
  onOpenMasterSwitcher,
  onOpenOnlineCatalog
}) => {
  // Navigation State: 8 Main Menus
  const [activeTab, setActiveTab] = useState<RitelMenuTab>('kasir');

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Isolated Persistent State with prefix usahaku_data_ritel_*
  const [profile, setProfile] = useState<RitelStoreProfile>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.PROFILE, DEFAULT_RITEL_PROFILE)
  );

  const [products, setProducts] = useState<RitelProduct[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.PRODUCTS, DEFAULT_RITEL_PRODUCTS)
  );

  const [transactions, setTransactions] = useState<RitelTransaction[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.TRANSACTIONS, DEFAULT_RITEL_TRANSACTIONS)
  );

  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.HELD_CARTS, [])
  );

  const [suppliers, setSuppliers] = useState<RitelSupplier[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.SUPPLIERS, DEFAULT_RITEL_SUPPLIERS)
  );

  const [purchases, setPurchases] = useState<RitelPurchaseOrder[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.PURCHASES, DEFAULT_RITEL_PURCHASES)
  );

  const [promos, setPromos] = useState<RitelPromo[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.PROMOS, DEFAULT_RITEL_PROMOS)
  );

  const [customers, setCustomers] = useState<RitelCustomer[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.CUSTOMERS, DEFAULT_RITEL_CUSTOMERS)
  );

  const [opnames, setOpnames] = useState<StockOpnameSession[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.OPNAMES, DEFAULT_RITEL_OPNAMES)
  );

  const [damaged, setDamaged] = useState<DamagedGoodRecord[]>(() =>
    getRitelStorage(RITEL_STORAGE_KEYS.DAMAGED, DEFAULT_RITEL_DAMAGED)
  );

  // Sync to Isolated LocalStorage
  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.HELD_CARTS, heldCarts);
  }, [heldCarts]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.SUPPLIERS, suppliers);
  }, [suppliers]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.PURCHASES, purchases);
  }, [purchases]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.PROMOS, promos);
  }, [promos]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.OPNAMES, opnames);
  }, [opnames]);

  useEffect(() => {
    setRitelStorage(RITEL_STORAGE_KEYS.DAMAGED, damaged);
  }, [damaged]);

  // Handle Checkout Transaction Completion
  const handleCompleteTransaction = (newTx: RitelTransaction) => {
    setTransactions([newTx, ...transactions]);

    // Automatically reduce product stocks in master catalog
    setProducts((prev) =>
      prev.map((prod) => {
        const itemSold = newTx.items.find((it) => it.productId === prod.id);
        if (itemSold) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - itemSold.qty)
          };
        }
        return prod;
      })
    );

    // If customer selected: update loyalty points & debt if bon
    if (newTx.customerId) {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id === newTx.customerId) {
            const addedPoints = Math.floor(newTx.grandTotal / (profile.pointMultiplier || 10000));
            const newDebt = newTx.paymentMethod === 'bon' ? cust.debtBalance + newTx.grandTotal : cust.debtBalance;
            return {
              ...cust,
              points: cust.points + addedPoints,
              totalSpend: cust.totalSpend + newTx.grandTotal,
              debtBalance: newDebt
            };
          }
          return cust;
        })
      );
    }
  };

  // Held Cart Handlers
  const handleHoldCart = (newHeld: HeldCart) => {
    setHeldCarts([newHeld, ...heldCarts]);
  };

  const handleRestoreHeldCart = (heldId: string) => {
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldId));
  };

  const handleDeleteHeldCart = (heldId: string) => {
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldId));
  };

  // Product Catalog Handlers
  const handleAddProduct = (prodData: Omit<RitelProduct, 'id'>) => {
    const newProd: RitelProduct = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts([newProd, ...products]);
  };

  const handleUpdateProduct = (updated: RitelProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Supplier & PO Handlers
  const handleAddSupplier = (supData: Omit<RitelSupplier, 'id'>) => {
    const newSup: RitelSupplier = {
      ...supData,
      id: `sup-${Date.now()}`
    };
    setSuppliers([...suppliers, newSup]);
  };

  const handleUpdateSupplier = (updated: RitelSupplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddPurchase = (newPo: RitelPurchaseOrder) => {
    setPurchases([newPo, ...purchases]);

    // Automatically increase product stock in catalog
    setProducts((prev) =>
      prev.map((prod) => {
        const itemReceived = newPo.items.find((it) => it.productId === prod.id || it.sku === prod.sku);
        if (itemReceived) {
          return {
            ...prod,
            stock: prod.stock + itemReceived.qty,
            costPrice: itemReceived.costPrice || prod.costPrice
          };
        }
        return prod;
      })
    );
  };

  const handlePaySupplierDebt = (poId: string, amount: number) => {
    setPurchases((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          const newPaid = po.paidAmount + amount;
          return {
            ...po,
            paidAmount: newPaid,
            status: newPaid >= po.totalAmount ? 'lunas' : 'tempo'
          };
        }
        return po;
      })
    );
  };

  // Marketing & Promo Handlers
  const handleAddPromo = (promoData: Omit<RitelPromo, 'id'>) => {
    const newPromo: RitelPromo = {
      ...promoData,
      id: `prm-${Date.now()}`
    };
    setPromos([newPromo, ...promos]);
  };

  const handleTogglePromo = (promoId: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleDeletePromo = (promoId: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== promoId));
  };

  // Customer Handlers
  const handleAddCustomer = (cData: Omit<RitelCustomer, 'id'>) => {
    const newCust: RitelCustomer = {
      ...cData,
      id: `cust-${Date.now()}`
    };
    setCustomers([newCust, ...customers]);
  };

  const handlePayCustomerDebt = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            debtBalance: Math.max(0, c.debtBalance - amount)
          };
        }
        return c;
      })
    );
  };

  // Stock Opname Handlers
  const handleSaveOpname = (session: StockOpnameSession) => {
    setOpnames([session, ...opnames]);
  };

  const handleAddDamaged = (newDmg: DamagedGoodRecord) => {
    setDamaged([newDmg, ...damaged]);

    // Automatically reduce product stock
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === newDmg.productId) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - newDmg.qty)
          };
        }
        return prod;
      })
    );
  };

  const handleApplyStockAdjustment = (items: StockOpnameItem[]) => {
    setProducts((prev) =>
      prev.map((prod) => {
        const adjustedItem = items.find((it) => it.productId === prod.id);
        if (adjustedItem) {
          return {
            ...prod,
            stock: adjustedItem.physicalStock
          };
        }
        return prod;
      })
    );
  };

  // Reset & Reload Ritel Data
  const handleResetRitelData = () => {
    setProducts([]);
    setTransactions([]);
    setHeldCarts([]);
    setSuppliers([]);
    setPurchases([]);
    setPromos([]);
    setCustomers([]);
    setOpnames([]);
    setDamaged([]);

    localStorage.removeItem(RITEL_STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(RITEL_STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(RITEL_STORAGE_KEYS.HELD_CARTS);
    localStorage.removeItem(RITEL_STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(RITEL_STORAGE_KEYS.PURCHASES);
    localStorage.removeItem(RITEL_STORAGE_KEYS.PROMOS);
    localStorage.removeItem(RITEL_STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(RITEL_STORAGE_KEYS.OPNAMES);
    localStorage.removeItem(RITEL_STORAGE_KEYS.DAMAGED);
  };

  const handleReloadDemoData = () => {
    setProducts(DEFAULT_RITEL_PRODUCTS);
    setTransactions(DEFAULT_RITEL_TRANSACTIONS);
    setSuppliers(DEFAULT_RITEL_SUPPLIERS);
    setCustomers(DEFAULT_RITEL_CUSTOMERS);
    setPromos(DEFAULT_RITEL_PROMOS);
    setPurchases(DEFAULT_RITEL_PURCHASES);
    setDamaged(DEFAULT_RITEL_DAMAGED);
    setOpnames(DEFAULT_RITEL_OPNAMES);
    setProfile(DEFAULT_RITEL_PROFILE);
    setHeldCarts([]);
  };

  // 8 Main Navigation Tabs Definition
  const NAV_MENUS: { id: RitelMenuTab; label: string; icon: any; isPro?: boolean }[] = [
    { id: 'kasir', label: 'Kasir POS', icon: ShoppingCart },
    { id: 'stok', label: 'Stok / Inventory', icon: Package },
    { id: 'supplier', label: 'Supplier & Purchases', icon: Truck },
    { id: 'marketing', label: 'Marketing & Promo', icon: Tag, isPro: true },
    { id: 'pelanggan', label: 'Pelanggan', icon: Users },
    { id: 'opname', label: 'Stok Opname', icon: ClipboardCheck },
    { id: 'laporan', label: 'Laporan', icon: BarChart3, isPro: true },
    { id: 'setting', label: 'Setting', icon: Settings, isPro: true },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans select-none">
      {/* 1. TOP BRAND NAVBAR (Deep Royal Navy Blue #1E3A8A) */}
      <header 
        style={{ paddingTop: 'calc(0.625rem + env(safe-area-inset-top, 0px))' }}
        className="bg-[#1E3A8A] text-white px-4 pb-2.5 shadow-md flex items-center justify-between shrink-0 z-30"
      >
        {/* Brand & Store Info */}
        <div className="flex items-center gap-3">
          {/* Logo Ikon "RQ" */}
          <div 
            onClick={onOpenMasterSwitcher}
            className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md shadow-orange-900/30 cursor-pointer active:scale-95 transition-transform"
            title="Klik untuk Buka UsahaQu Master Switcher"
          >
            RQ
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base tracking-tight leading-none text-white">
                RitelQu
              </h1>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F97316] text-white tracking-wide">
                MINIMARKET POS
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-200 hidden md:inline">
                v1.82
              </span>
            </div>
            <p className="text-[11px] text-blue-200 truncate max-w-[220px] sm:max-w-md mt-0.5">
              {profile.storeName} • {profile.slogan}
            </p>
          </div>
        </div>

        {/* Right Header Status & Ecosystem Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-100 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#F97316]" />
            <span>
              {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })} • {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
            </span>
          </div>

          {/* Master Switcher Button */}
          <button
            onClick={onOpenMasterSwitcher}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
            title="Ganti Ekosistem UsahaQu"
          >
            <Layers className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="hidden sm:inline">Ganti Modul</span>
          </button>

          {/* Back to Bengkel button if present */}
          {onBackToBengkel && (
            <button
              onClick={onBackToBengkel}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Kembali ke BengkelQu"
            >
              <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">BengkelQu</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. MAIN BODY VIEW AREA (Crisp Light Gray #F8FAFC) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'kasir' && (
          <KasirView
            products={products}
            customers={customers}
            transactions={transactions}
            heldCarts={heldCarts}
            profile={profile}
            onCompleteTransaction={handleCompleteTransaction}
            onHoldCart={handleHoldCart}
            onRestoreHeldCart={handleRestoreHeldCart}
            onDeleteHeldCart={handleDeleteHeldCart}
          />
        )}

        {activeTab === 'stok' && (
          <StokInventoryView
            products={products}
            suppliers={suppliers}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'supplier' && (
          <SupplierPurchasesView
            suppliers={suppliers}
            purchases={purchases}
            products={products}
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onAddPurchase={handleAddPurchase}
            onPayDebt={handlePaySupplierDebt}
          />
        )}

        {activeTab === 'marketing' && (
          <MarketingPromoView
            promos={promos}
            customers={customers}
            onAddPromo={handleAddPromo}
            onTogglePromo={handleTogglePromo}
            onDeletePromo={handleDeletePromo}
            onOpenOnlineCatalog={onOpenOnlineCatalog}
          />
        )}

        {activeTab === 'pelanggan' && (
          <PelangganView
            customers={customers}
            transactions={transactions}
            onAddCustomer={handleAddCustomer}
            onPayDebt={handlePayCustomerDebt}
          />
        )}

        {activeTab === 'opname' && (
          <StokOpnameView
            products={products}
            opnames={opnames}
            damaged={damaged}
            onSaveOpname={handleSaveOpname}
            onAddDamaged={handleAddDamaged}
            onApplyStockAdjustment={handleApplyStockAdjustment}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanView
            transactions={transactions}
            products={products}
          />
        )}

        {activeTab === 'setting' && (
          <SettingView
            profile={profile}
            onSaveProfile={(updated) => setProfile(updated)}
            onResetRitelData={handleResetRitelData}
            onReloadDemoData={handleReloadDemoData}
          />
        )}
      </main>

      {/* 2. NAVBAR BOTTOM (Icon-Only Compact Nav) PERMANEN - 8 Menu Utama RitelQu */}
      <nav 
        aria-label="RitelQu Bottom Navigation"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        className="bg-[#1E3A8A] border-t border-blue-900/80 px-2 sm:px-4 py-1.5 flex items-center justify-around sm:justify-center shrink-0 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-around w-full max-w-md sm:max-w-xl mx-auto gap-1 sm:gap-2">
          {NAV_MENUS.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeTab === menu.id;

            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => setActiveTab(menu.id)}
                title={menu.label}
                aria-label={menu.label}
                className={`p-2.5 rounded-xl transition-all duration-150 relative flex items-center justify-center cursor-pointer select-none group ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-md shadow-orange-950/40 ring-2 ring-orange-300/40 scale-105'
                    : 'text-blue-200/75 hover:text-white hover:bg-blue-900/60 active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {menu.isPro && (
                  <span className="absolute -top-1 -right-1 text-amber-300 drop-shadow-xs" title="Fitur PRO">
                    <Crown className="w-2.5 h-2.5 fill-amber-300 text-amber-400" />
                  </span>
                )}
                {/* Desktop hover micro tooltip */}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
                  {menu.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
