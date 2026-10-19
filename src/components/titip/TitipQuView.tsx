/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Users, 
  Handshake, 
  ShoppingCart, 
  Wallet, 
  Tag, 
  BarChart3, 
  Settings, 
  Layers, 
  Clock, 
  ArrowLeft, 
  Crown,
  Sparkles
} from 'lucide-react';
import { 
  TitipMenuTab, 
  RawMaterial, 
  ProductRecipe, 
  ProductionBatch, 
  Employee, 
  DailyOutputLog, 
  PayrollRecord, 
  ConsignmentStore, 
  ResellerPartner, 
  PartnershipContract, 
  SalesTransaction, 
  DeliveryOrder, 
  ProductReturn, 
  PayoutRecord, 
  ResellerCatalogAsset, 
  BundlingPromo, 
  TitipStoreProfile 
} from './TitipTypes';
import { 
  TITIP_STORAGE_KEYS, 
  getTitipStorage, 
  setTitipStorage,
  DEFAULT_TITIP_PROFILE,
  DEFAULT_RAW_MATERIALS,
  DEFAULT_PRODUCT_RECIPES,
  DEFAULT_PRODUCTION_BATCHES,
  DEFAULT_EMPLOYEES,
  DEFAULT_OUTPUT_LOGS,
  DEFAULT_CONSIGNMENT_STORES,
  DEFAULT_RESELLERS,
  DEFAULT_CONTRACTS,
  DEFAULT_SALES,
  DEFAULT_DELIVERIES,
  DEFAULT_PAYOUTS,
  DEFAULT_CATALOG_ASSETS,
  DEFAULT_PROMOS
} from './TitipStorage';

import { ProduksiHppView } from './views/ProduksiHppView';
import { KaryawanUpahView } from './views/KaryawanUpahView';
import { KemitraanView } from './views/KemitraanView';
import { KasirPenjualanView } from './views/KasirPenjualanView';
import { BagiHasilPayoutView } from './views/BagiHasilPayoutView';
import { MarketingView } from './views/MarketingView';
import { LaporanView } from './views/LaporanView';
import { SettingView } from './views/SettingView';

interface TitipQuViewProps {
  onBackToBengkel?: () => void;
  onOpenMasterSwitcher: () => void;
  onOpenOnlineCatalog?: () => void;
}

export const TitipQuView: React.FC<TitipQuViewProps> = ({
  onBackToBengkel,
  onOpenMasterSwitcher,
  onOpenOnlineCatalog
}) => {
  // Navigation State (Active Menu Tab)
  const [activeTab, setActiveTab] = useState<TitipMenuTab>('produksi');

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Isolated Persistent State with prefix usahaku_data_titip_*
  const [profile, setProfile] = useState<TitipStoreProfile>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.PROFILE, DEFAULT_TITIP_PROFILE)
  );

  const [materials, setMaterials] = useState<RawMaterial[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.MATERIALS, DEFAULT_RAW_MATERIALS)
  );

  const [recipes, setRecipes] = useState<ProductRecipe[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.RECIPES, DEFAULT_PRODUCT_RECIPES)
  );

  const [batches, setBatches] = useState<ProductionBatch[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.BATCHES, DEFAULT_PRODUCTION_BATCHES)
  );

  const [employees, setEmployees] = useState<Employee[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES)
  );

  const [outputs, setOutputs] = useState<DailyOutputLog[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.OUTPUTS, DEFAULT_OUTPUT_LOGS)
  );

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.PAYROLLS, [])
  );

  const [stores, setStores] = useState<ConsignmentStore[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.STORES, DEFAULT_CONSIGNMENT_STORES)
  );

  const [resellers, setResellers] = useState<ResellerPartner[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.RESELLERS, DEFAULT_RESELLERS)
  );

  const [contracts, setContracts] = useState<PartnershipContract[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.CONTRACTS, DEFAULT_CONTRACTS)
  );

  const [sales, setSales] = useState<SalesTransaction[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.SALES, DEFAULT_SALES)
  );

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.DELIVERIES, DEFAULT_DELIVERIES)
  );

  const [returns, setReturns] = useState<ProductReturn[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.RETURNS, [])
  );

  const [payouts, setPayouts] = useState<PayoutRecord[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.PAYOUTS, DEFAULT_PAYOUTS)
  );

  const [promos, setPromos] = useState<BundlingPromo[]>(() =>
    getTitipStorage(TITIP_STORAGE_KEYS.PROMOS, DEFAULT_PROMOS)
  );

  const [assets] = useState<ResellerCatalogAsset[]>(DEFAULT_CATALOG_ASSETS);

  // Sync to Storage
  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.MATERIALS, materials);
  }, [materials]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.RECIPES, recipes);
  }, [recipes]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.BATCHES, batches);
  }, [batches]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.EMPLOYEES, employees);
  }, [employees]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.OUTPUTS, outputs);
  }, [outputs]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.PAYROLLS, payrolls);
  }, [payrolls]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.STORES, stores);
  }, [stores]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.RESELLERS, resellers);
  }, [resellers]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.CONTRACTS, contracts);
  }, [contracts]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.SALES, sales);
  }, [sales]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.DELIVERIES, deliveries);
  }, [deliveries]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.RETURNS, returns);
  }, [returns]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.PAYOUTS, payouts);
  }, [payouts]);

  useEffect(() => {
    setTitipStorage(TITIP_STORAGE_KEYS.PROMOS, promos);
  }, [promos]);

  // Production Handlers
  const handleAddRecipe = (newRcp: ProductRecipe) => {
    setRecipes([...recipes, newRcp]);
  };

  const handleUpdateRecipe = (updated: ProductRecipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleAddMaterial = (newMat: RawMaterial) => {
    setMaterials([...materials, newMat]);
  };

  const handleUpdateMaterial = (updated: RawMaterial) => {
    setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleCreateBatch = (newBth: ProductionBatch) => {
    setBatches([newBth, ...batches]);
  };

  const handleCompleteBatch = (batchId: string, actualQty: number) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: 'selesai', actualQty } : b))
    );

    const bth = batches.find((b) => b.id === batchId);
    if (bth) {
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === bth.recipeId
            ? { ...r, currentStock: r.currentStock + actualQty }
            : r
        )
      );
    }
  };

  // Employee Handlers
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees([...employees, newEmp]);
  };

  const handleAddOutputLog = (newLog: DailyOutputLog) => {
    setOutputs([newLog, ...outputs]);
  };

  const handlePayWage = (newPay: PayrollRecord) => {
    setPayrolls([newPay, ...payrolls]);
    setOutputs((prev) =>
      prev.map((o) => (o.employeeId === newPay.employeeId ? { ...o, status: 'dibayar' } : o))
    );
  };

  // Partnership Handlers
  const handleAddStore = (newStore: ConsignmentStore) => {
    setStores([...stores, newStore]);
  };

  const handleAddReseller = (newRes: ResellerPartner) => {
    setResellers([...resellers, newRes]);
  };

  const handleAddContract = (newContract: PartnershipContract) => {
    setContracts([newContract, ...contracts]);
  };

  // Sales & Delivery Handlers
  const handleCompleteSale = (newSale: SalesTransaction) => {
    setSales([newSale, ...sales]);

    // Reduce stock
    setRecipes((prev) =>
      prev.map((r) => {
        const item = newSale.items.find((it) => it.recipeId === r.id);
        return item ? { ...r, currentStock: Math.max(0, r.currentStock - item.qty) } : r;
      })
    );
  };

  const handleCreateDelivery = (newDO: DeliveryOrder) => {
    setDeliveries([newDO, ...deliveries]);

    // If sent to consignment store: update store stock & reduce producer stock
    if (newDO.partnerType === 'toko_titip') {
      setStores((prev) =>
        prev.map((st) =>
          st.id === newDO.partnerId
            ? {
                ...st,
                totalStockDeposited: st.totalStockDeposited + newDO.totalQty,
                currentBalanceDue: st.currentBalanceDue + newDO.items.reduce((s, it) => s + it.total, 0)
              }
            : st
        )
      );
    }

    setRecipes((prev) =>
      prev.map((r) => {
        const item = newDO.items.find((it) => it.recipeId === r.id);
        return item ? { ...r, currentStock: Math.max(0, r.currentStock - item.qty) } : r;
      })
    );
  };

  const handleAddReturn = (newRet: ProductReturn) => {
    setReturns([newRet, ...returns]);
  };

  const handleDisbursePayout = (newPayout: PayoutRecord) => {
    setPayouts([newPayout, ...payouts]);
    setStores((prev) =>
      prev.map((st) =>
        st.id === newPayout.storeId
          ? {
              ...st,
              currentBalanceDue: Math.max(0, st.currentBalanceDue - newPayout.periodSales)
            }
          : st
      )
    );
  };

  // Marketing Promo Handlers
  const handleAddPromo = (newPrm: BundlingPromo) => {
    setPromos([...promos, newPrm]);
  };

  const handleTogglePromo = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Data management
  const handleResetTitipData = () => {
    setMaterials([]);
    setRecipes([]);
    setBatches([]);
    setEmployees([]);
    setOutputs([]);
    setPayrolls([]);
    setStores([]);
    setResellers([]);
    setContracts([]);
    setSales([]);
    setDeliveries([]);
    setReturns([]);
    setPayouts([]);
    setPromos([]);

    localStorage.removeItem(TITIP_STORAGE_KEYS.MATERIALS);
    localStorage.removeItem(TITIP_STORAGE_KEYS.RECIPES);
    localStorage.removeItem(TITIP_STORAGE_KEYS.BATCHES);
    localStorage.removeItem(TITIP_STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(TITIP_STORAGE_KEYS.OUTPUTS);
    localStorage.removeItem(TITIP_STORAGE_KEYS.PAYROLLS);
    localStorage.removeItem(TITIP_STORAGE_KEYS.STORES);
    localStorage.removeItem(TITIP_STORAGE_KEYS.RESELLERS);
    localStorage.removeItem(TITIP_STORAGE_KEYS.CONTRACTS);
    localStorage.removeItem(TITIP_STORAGE_KEYS.SALES);
    localStorage.removeItem(TITIP_STORAGE_KEYS.DELIVERIES);
    localStorage.removeItem(TITIP_STORAGE_KEYS.RETURNS);
    localStorage.removeItem(TITIP_STORAGE_KEYS.PAYOUTS);
    localStorage.removeItem(TITIP_STORAGE_KEYS.PROMOS);
  };

  const handleReloadDemoData = () => {
    setMaterials(DEFAULT_RAW_MATERIALS);
    setRecipes(DEFAULT_PRODUCT_RECIPES);
    setBatches(DEFAULT_PRODUCTION_BATCHES);
    setEmployees(DEFAULT_EMPLOYEES);
    setOutputs(DEFAULT_OUTPUT_LOGS);
    setStores(DEFAULT_CONSIGNMENT_STORES);
    setResellers(DEFAULT_RESELLERS);
    setContracts(DEFAULT_CONTRACTS);
    setSales(DEFAULT_SALES);
    setDeliveries(DEFAULT_DELIVERIES);
    setPayouts(DEFAULT_PAYOUTS);
    setPromos(DEFAULT_PROMOS);
    setProfile(DEFAULT_TITIP_PROFILE);
    setPayrolls([]);
    setReturns([]);
  };

  // 8 Main Navigation Menus
  const NAV_MENUS: { id: TitipMenuTab; label: string; icon: any; isPro?: boolean }[] = [
    { id: 'produksi', label: 'Produksi & HPP', icon: Factory },
    { id: 'karyawan', label: 'Karyawan & Upah', icon: Users },
    { id: 'kemitraan', label: 'Kemitraan', icon: Handshake },
    { id: 'penjualan', label: 'Kasir & Penjualan', icon: ShoppingCart },
    { id: 'bagi_hasil', label: 'Bagi Hasil & Payout', icon: Wallet },
    { id: 'marketing', label: 'Marketing', icon: Tag, isPro: true },
    { id: 'laporan', label: 'Laporan', icon: BarChart3, isPro: true },
    { id: 'setting', label: 'Setting', icon: Settings }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFBEB]/30 text-slate-800 overflow-hidden font-sans select-none">
      {/* 1. TOP NAVBAR (Warm Terracotta #C2410C) */}
      <header 
        style={{ paddingTop: 'calc(0.625rem + env(safe-area-inset-top, 0px))' }}
        className="bg-[#C2410C] text-white px-4 pb-2.5 shadow-md flex items-center justify-between shrink-0 z-30"
      >
        <div className="flex items-center gap-3">
          {/* Logo Ikon "TQ" */}
          <div
            onClick={onOpenMasterSwitcher}
            className="w-10 h-10 rounded-xl bg-[#F59E0B] text-slate-900 flex items-center justify-center font-black text-sm tracking-wider shadow-md shadow-orange-950/30 cursor-pointer active:scale-95 transition-transform"
            title="Klik untuk Buka Master Ecosystem Switcher"
          >
            TQ
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base tracking-tight leading-none text-white">
                Titip Qu
              </h1>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B] text-slate-900 tracking-wide">
                KONSINYASI & MAKLON
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-950/40 text-orange-200 hidden md:inline">
                v1.82
              </span>
            </div>
            <p className="text-[11px] text-orange-100 truncate max-w-[220px] sm:max-w-md mt-0.5">
              {profile.brandName} • {profile.tagline}
            </p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/40 text-orange-100 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
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
            <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
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



      {/* 3. MAIN BODY VIEW AREA (Soft Cream / Warm Slate #FFFBEB) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'produksi' && (
          <ProduksiHppView
            recipes={recipes}
            materials={materials}
            batches={batches}
            onAddRecipe={handleAddRecipe}
            onUpdateRecipe={handleUpdateRecipe}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onCreateBatch={handleCreateBatch}
            onCompleteBatch={handleCompleteBatch}
          />
        )}

        {activeTab === 'karyawan' && (
          <KaryawanUpahView
            employees={employees}
            outputs={outputs}
            payrolls={payrolls}
            recipes={recipes}
            onAddEmployee={handleAddEmployee}
            onAddOutputLog={handleAddOutputLog}
            onPayWage={handlePayWage}
          />
        )}

        {activeTab === 'kemitraan' && (
          <KemitraanView
            stores={stores}
            resellers={resellers}
            contracts={contracts}
            onAddStore={handleAddStore}
            onAddReseller={handleAddReseller}
            onAddContract={handleAddContract}
          />
        )}

        {activeTab === 'penjualan' && (
          <KasirPenjualanView
            recipes={recipes}
            stores={stores}
            resellers={resellers}
            sales={sales}
            deliveries={deliveries}
            returns={returns}
            profile={profile}
            onCompleteSale={handleCompleteSale}
            onCreateDelivery={handleCreateDelivery}
            onAddReturn={handleAddReturn}
          />
        )}

        {activeTab === 'bagi_hasil' && (
          <BagiHasilPayoutView
            stores={stores}
            payouts={payouts}
            onDisbursePayout={handleDisbursePayout}
          />
        )}

        {activeTab === 'marketing' && (
          <MarketingView
            promos={promos}
            assets={assets}
            resellers={resellers}
            stores={stores}
            onAddPromo={handleAddPromo}
            onTogglePromo={handleTogglePromo}
            onOpenOnlineCatalog={onOpenOnlineCatalog}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanView
            sales={sales}
            recipes={recipes}
          />
        )}

        {activeTab === 'setting' && (
          <SettingView
            profile={profile}
            onSaveProfile={(updated) => setProfile(updated)}
            onResetTitipData={handleResetTitipData}
            onReloadDemoData={handleReloadDemoData}
          />
        )}
      </main>

      {/* 2. NAVBAR BOTTOM (Horizontal Scannable Nav) PERMANEN - 8 Menu Utama */}
      <nav 
        aria-label="Titip Qu Bottom Navigation"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        className="bg-[#C2410C] border-t border-orange-800/80 px-2 sm:px-4 flex items-center overflow-x-auto custom-scroll shrink-0 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-center space-x-1 sm:space-x-2 py-0 min-w-max mx-auto sm:mx-0">
          {NAV_MENUS.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeTab === menu.id;

            return (
              <button
                key={menu.id}
                onClick={() => setActiveTab(menu.id)}
                className={`py-2.5 px-3 sm:px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer select-none ${
                  isActive
                    ? 'text-white border-t-3 border-[#F59E0B] bg-orange-800/50 shadow-inner'
                    : 'text-orange-100/80 hover:text-white hover:bg-orange-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-orange-200'}`} />
                <span className="whitespace-nowrap">{menu.label}</span>
                {menu.isPro && (
                  <span className="text-[9px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Crown className="w-2.5 h-2.5" />
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
