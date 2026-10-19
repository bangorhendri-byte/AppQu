/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MENU_MODULES, 
  INITIAL_QUEUES, 
  INITIAL_SPAREPARTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_MECHANICS, 
  INITIAL_CUSTOMERS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE,
  INITIAL_PERMISSIONS,
  INITIAL_BRANCHES,
  INITIAL_DAMAGED_GOODS,
  INITIAL_PROCUREMENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_VOUCHERS,
  INITIAL_STAFF,
  INITIAL_COMMISSIONS
} from './data/mockData';
import { 
  MenuModuleConfig, 
  SubMenuItemConfig, 
  ServiceQueue, 
  ServiceItem,
  Sparepart, 
  Transaction, 
  ServiceStatus, 
  CustomerVehicle, 
  NotificationItem,
  WorkshopProfile,
  RolePermissionConfig,
  BranchItem,
  UserSession,
  DamagedGood,
  ProcurementRecord,
  MarketingCampaign,
  PromoVoucher,
  ExpenseItem,
  SubscriptionPlanId,
  SubscriptionState,
  ProDurationOption,
  StaffMember,
  MechanicCommissionRecord
} from './types';
import { 
  getOrCreateDeviceId, 
  validateSerialNumber, 
  checkAndMigrateAppData,
  PRO_TIERS
} from './utils/licenseManager';
import { AndroidFrame } from './components/common/AndroidFrame';
import { BottomNavBar } from './components/common/BottomNavBar';
import { HomeDashboard } from './components/home/HomeDashboard';
import { SubMenuPage } from './components/submenu/SubMenuPage';
import { ServiceDetailView } from './components/views/ServiceDetailView';
import { CashierPOSView } from './components/views/CashierPOSView';
import { InventoryView } from './components/views/InventoryView';
import { CustomerView } from './components/views/CustomerView';
import { MarketingView } from './components/views/MarketingView';
import { ReportView } from './components/views/ReportView';
import { StaffView } from './components/views/StaffView';
import { BasicProfileView } from './components/views/BasicProfileView';
import { CorePermissionsView } from './components/views/CorePermissionsView';
import { CorporateBranchesView } from './components/views/CorporateBranchesView';
import { DeviceSyncView } from './components/views/DeviceSyncView';
import { SettingView } from './components/views/SettingView';
import { CustomerCareView } from './components/views/CustomerCareView';
import { LoginScreen } from './components/auth/LoginScreen';
import { NewQueueModal } from './components/modals/NewQueueModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { KedaiQuView } from './components/kedai/KedaiQuView';
import { KlinikQuView } from './components/klinik/KlinikQuView';
import { RitelQuView } from './components/ritel/RitelQuView';
import { TitipQuView } from './components/titip/TitipQuView';
import { MasterSwitcherModal, EcosystemId } from './components/common/MasterSwitcherModal';
import { EcosystemPreviewView } from './components/views/EcosystemPreviewView';
import { BusinessTypeOnboardingModal } from './components/modals/BusinessTypeOnboardingModal';
import { OnlineCatalogView } from './components/catalog/OnlineCatalogView';
import { UniversalTopHeader } from './components/common/UniversalTopHeader';
import { ModuleTemplateDrawerModal, UsahaQuFeatureTarget } from './components/common/ModuleTemplateDrawerModal';
import { CustomerQuView } from './components/customerqu/CustomerQuView';
import { PaguyubanQuView } from './components/komunitas/PaguyubanQuView';
import { getSavedBuyerPings } from './components/customerqu/CustomerQuStorage';
import { openDatabase, seedInitialDataIfEmpty } from './db/indexedDbManager';
import { getLicense, setPrimaryModule } from './engine/licenseEngine';

export default function App() {
  // Online Store & Digital Catalog Public View State
  const [isOnlineCatalogOpen, setIsOnlineCatalogOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('toko') || params.has('modul') || params.get('view') === 'catalog';
    }
    return false;
  });

  const [onlineCatalogInitialModule, setOnlineCatalogInitialModule] = useState<'bengkel' | 'kedai' | 'ritel' | 'klinik' | 'titip'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get('modul');
      if (mod === 'bengkel' || mod === 'kedai' || mod === 'ritel' || mod === 'klinik' || mod === 'titip') {
        return mod;
      }
      const toko = params.get('toko')?.toLowerCase();
      if (toko?.includes('kedai')) return 'kedai';
      if (toko?.includes('ritel')) return 'ritel';
      if (toko?.includes('klinik')) return 'klinik';
      if (toko?.includes('titip')) return 'titip';
    }
    return 'bengkel';
  });

  // Persistence state
  const [queues, setQueues] = useState<ServiceQueue[]>(() => {
    const saved = localStorage.getItem('bq_queues');
    return saved ? JSON.parse(saved) : INITIAL_QUEUES;
  });

  const [spareparts, setSpareparts] = useState<Sparepart[]>(() => {
    const saved = localStorage.getItem('bq_spareparts');
    return saved ? JSON.parse(saved) : INITIAL_SPAREPARTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bq_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [customers, setCustomers] = useState<CustomerVehicle[]>(() => {
    const saved = localStorage.getItem('bq_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('bq_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [damagedGoods, setDamagedGoods] = useState<DamagedGood[]>(() => {
    const saved = localStorage.getItem('bq_damaged_goods');
    return saved ? JSON.parse(saved) : INITIAL_DAMAGED_GOODS;
  });

  const [procurements, setProcurements] = useState<ProcurementRecord[]>(() => {
    const saved = localStorage.getItem('bq_procurements');
    return saved ? JSON.parse(saved) : INITIAL_PROCUREMENTS;
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const saved = localStorage.getItem('bq_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [vouchers, setVouchers] = useState<PromoVoucher[]>(() => {
    const saved = localStorage.getItem('bq_vouchers');
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('bq_kas_kecil');
    return saved ? JSON.parse(saved) : [
      { id: 'exp-1', title: 'Bensin Pertalite Tes Motor Tarikan', category: 'BBM / Transport', amount: 25000, date: 'Hari Ini', notes: 'Tes motor KLX BQ-05' },
      { id: 'exp-2', title: 'Beli Air Mineral Galon & Gelas Kasir', category: 'Konsumsi', amount: 22000, date: 'Hari Ini', notes: 'Konsumsi bengkel' }
    ];
  });

  const [profile, setProfile] = useState<WorkshopProfile>(() => {
    const saved = localStorage.getItem('bq_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [permissions, setPermissions] = useState<RolePermissionConfig[]>(() => {
    const saved = localStorage.getItem('bq_permissions');
    return saved ? JSON.parse(saved) : INITIAL_PERMISSIONS;
  });

  const [branches, setBranches] = useState<BranchItem[]>(() => {
    const saved = localStorage.getItem('bq_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  // Master Data Karyawan & Komisi Mekanik
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('bq_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [commissions, setCommissions] = useState<MechanicCommissionRecord[]>(() => {
    const saved = localStorage.getItem('bq_commissions');
    return saved ? JSON.parse(saved) : INITIAL_COMMISSIONS;
  });

  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('bq_user_session');
    return saved ? JSON.parse(saved) : {
      name: 'Bpk. Ahmad Fauzi (SPV)',
      email: 'owner@bengkelqu.id',
      role: 'Supervisor',
      autoLogin: true,
      loginTime: 'Hari Ini'
    };
  });

  // Status Aplikasi: Full Versi Permanen (Bebas Kuota & Semua Fitur Terbuka Penuh)
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    const currentDeviceId = getOrCreateDeviceId();
    const fullState: SubscriptionState = {
      planId: 'corporate',
      planName: 'Full Versi Permanen',
      dailyRate: 0,
      trialStartDate: Date.now(),
      trialDurationDays: 3650,
      isTrialActive: false,
      trialDaysRemaining: 0,
      isSubscribed: true,
      deviceId: currentDeviceId
    };
    localStorage.setItem('bq_subscription', JSON.stringify(fullState));
    return fullState;
  });

  // Auto-adapt data schema & inisialisasi IndexedDB UsahaQu v1.83 (19 Master Stores)
  useEffect(() => {
    checkAndMigrateAppData();
    getLicense();
    openDatabase()
      .then(() => seedInitialDataIfEmpty())
      .catch((err) => console.warn('[IndexedDB Init]:', err));

    // Listener otomatis pembaruan lisensi dari TriPay Webhook / Polling
    const handleLicenseUpdate = (event: any) => {
      console.log('[App] Lisensi diperbarui via TriPay:', event.detail);
      const newLicense = getLicense();
      if (newLicense.is_paid) {
        setSubscription((prev) => ({
          ...prev,
          planId: 'corporate',
          planName: 'Full Versi Permanen (TriPay Terverifikasi)',
          isTrialActive: false,
          isSubscribed: true
        }));
      }
    };

    window.addEventListener('usahaqu:license-updated', handleLicenseUpdate);
    return () => {
      window.removeEventListener('usahaqu:license-updated', handleLicenseUpdate);
    };
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem('bq_user_session', JSON.stringify(session));
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('bq_user_session');
    setCurrentScreen('dashboard');
    setSelectedModule(null);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bq_queues', JSON.stringify(queues));
  }, [queues]);

  useEffect(() => {
    localStorage.setItem('bq_spareparts', JSON.stringify(spareparts));
  }, [spareparts]);

  useEffect(() => {
    localStorage.setItem('bq_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bq_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('bq_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bq_damaged_goods', JSON.stringify(damagedGoods));
  }, [damagedGoods]);

  useEffect(() => {
    localStorage.setItem('bq_procurements', JSON.stringify(procurements));
  }, [procurements]);

  useEffect(() => {
    localStorage.setItem('bq_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('bq_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('bq_kas_kecil', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('bq_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('bq_permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('bq_branches', JSON.stringify(branches));
  }, [branches]);

  // UsahaQu Master Ecosystem State: 'bengkel' | 'kedai' | 'klinik' | 'ritel' | 'titip'
  // Fokus Modul BengkelQu (Otomotif & Servis POS)
  const [activeEcosystem, setActiveEcosystem] = useState<EcosystemId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get('modul') as EcosystemId;
      if (mod === 'bengkel' || mod === 'kedai' || mod === 'ritel' || mod === 'klinik' || mod === 'titip' || mod === 'paguyubanqu') {
        return mod;
      }
    }
    const savedType = localStorage.getItem('usahaqu_type');
    if (savedType === 'bengkel') return 'bengkel';
    if (savedType === 'kuliner' || savedType === 'kedai') return 'kedai';
    if (savedType === 'retail' || savedType === 'ritel') return 'ritel';
    if (savedType === 'klinik') return 'klinik';
    if (savedType === 'titip' || savedType === 'titipqu' || savedType === 'collab') return 'titip';
    if (savedType === 'paguyuban' || savedType === 'paguyubanqu') return 'paguyubanqu';

    const saved = localStorage.getItem('uq_active_ecosystem');
    if (saved === 'titipqu' || saved === 'collab') return 'titip';
    if (saved === 'kedai' || saved === 'ritel' || saved === 'klinik' || saved === 'paguyubanqu') return saved as EcosystemId;
    return 'bengkel'; // Default fokus BengkelQu
  });
  const [isMasterSwitcherOpen, setIsMasterSwitcherOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const handleSelectBusinessType = (ecoId: EcosystemId, typeKey: string) => {
    localStorage.setItem('usahaqu_type', typeKey);
    localStorage.setItem('uq_active_ecosystem', ecoId);
    setPrimaryModule(ecoId);
    setActiveEcosystem(ecoId);
    setIsOnboardingModalOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('uq_active_ecosystem', activeEcosystem);
    if (!localStorage.getItem('usahaqu_type')) {
      localStorage.setItem('usahaqu_type', 'bengkel');
    }
  }, [activeEcosystem]);

  // Navigation state
  // screen: 'dashboard' | 'submenu' | 'feature'
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'submenu' | 'feature'>('dashboard');
  const [selectedModule, setSelectedModule] = useState<MenuModuleConfig | null>(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState<SubMenuItemConfig | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [preselectedQueueForPOS, setPreselectedQueueForPOS] = useState<ServiceQueue | null>(null);

  // Modals state
  const [isNewQueueModalOpen, setIsNewQueueModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // CustomerQu & Module Drawer State
  const [isCustomerQuActive, setIsCustomerQuActive] = useState(false);
  const [isModuleDrawerOpen, setIsModuleDrawerOpen] = useState(false);
  const [buyerPings, setBuyerPings] = useState(() => getSavedBuyerPings());

  useEffect(() => {
    const handleSyncPings = () => {
      setBuyerPings(getSavedBuyerPings());
    };
    window.addEventListener('storage', handleSyncPings);
    const interval = setInterval(handleSyncPings, 6000);
    return () => {
      window.removeEventListener('storage', handleSyncPings);
      clearInterval(interval);
    };
  }, []);

  const handleQuickToggleCustomerQu = () => {
    if (isCustomerQuActive) {
      setIsCustomerQuActive(false);
      const kasirMod = MENU_MODULES.find((m) => m.id === 'kasir');
      if (kasirMod) {
        setSelectedModule(kasirMod);
        const posSub = kasirMod.subMenus.find((s) => s.id === 'pos-core') || kasirMod.subMenus[0];
        setSelectedSubMenu(posSub);
        setCurrentScreen('feature');
      }
    } else {
      setIsCustomerQuActive(true);
    }
  };

  const handleSelectFeatureFromDrawer = (target: UsahaQuFeatureTarget) => {
    switch (target) {
      case 'pos-kasir': {
        setIsCustomerQuActive(false);
        const kasirMod = MENU_MODULES.find((m) => m.id === 'kasir');
        if (kasirMod) {
          setSelectedModule(kasirMod);
          const posSub = kasirMod.subMenus.find((s) => s.id === 'pos-core') || kasirMod.subMenus[0];
          setSelectedSubMenu(posSub);
          setCurrentScreen('feature');
        }
        break;
      }
      case 'customerqu':
      case 'template-keliling': {
        setIsCustomerQuActive(true);
        break;
      }
      case 'paguyubanqu': {
        setIsCustomerQuActive(false);
        setActiveEcosystem('paguyubanqu');
        break;
      }
      case 'stok-inventaris': {
        setIsCustomerQuActive(false);
        const invMod = MENU_MODULES.find((m) => m.id === 'inventaris');
        if (invMod) {
          setSelectedModule(invMod);
          setSelectedSubMenu(invMod.subMenus[0]);
          setCurrentScreen('feature');
        }
        break;
      }
      case 'chat-panggilan': {
        setIsCustomerQuActive(true);
        break;
      }
      case 'laporan-keuangan': {
        setIsCustomerQuActive(false);
        const repMod = MENU_MODULES.find((m) => m.id === 'laporan');
        if (repMod) {
          setSelectedModule(repMod);
          setSelectedSubMenu(repMod.subMenus[0]);
          setCurrentScreen('feature');
        }
        break;
      }
      case 'template-kuliner': {
        setIsCustomerQuActive(false);
        handleSelectBusinessType('kedai', 'kuliner');
        break;
      }
      case 'template-sayur': {
        setIsCustomerQuActive(false);
        handleSelectBusinessType('ritel', 'retail');
        break;
      }
      case 'template-toko': {
        setIsCustomerQuActive(false);
        handleSelectBusinessType('bengkel', 'bengkel');
        break;
      }
    }
  };

  // Navigation handlers
  const handleSelectModule = (mod: MenuModuleConfig) => {
    setSelectedModule(mod);
    setCurrentTab(mod.id);
    setCurrentScreen('submenu');
  };

  const handleSelectSubMenu = (subItem: SubMenuItemConfig) => {
    setSelectedSubMenu(subItem);
    setCurrentScreen('feature');
  };

  const handleBack = () => {
    if (currentScreen === 'feature') {
      setCurrentScreen('submenu');
    } else if (currentScreen === 'submenu') {
      setCurrentScreen('dashboard');
      setSelectedModule(null);
      setSelectedSubMenu(null);
      setCurrentTab('dashboard');
    }
  };

  const handleGoHome = () => {
    setCurrentScreen('dashboard');
    setSelectedModule(null);
    setSelectedSubMenu(null);
    setCurrentTab('dashboard');
  };

  const handleBottomTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (tabId === 'dashboard') {
      handleGoHome();
    } else {
      const targetMod = MENU_MODULES.find((m) => m.id === tabId);
      if (targetMod) {
        setSelectedModule(targetMod);
        setCurrentScreen('submenu');
      }
    }
  };

  // Queue actions
  const handleAddQueue = (newQ: ServiceQueue) => {
    setQueues([newQ, ...queues]);
    // Also check if customer exists, otherwise add
    const existingCust = customers.find((c) => c.plateNumber === newQ.plateNumber);
    if (!existingCust) {
      setCustomers([
        {
          id: `c-${Date.now()}`,
          name: newQ.customerName,
          phone: newQ.customerPhone,
          plateNumber: newQ.plateNumber,
          vehicleModel: newQ.vehicleModel,
          year: '2024',
          lastServiceDate: 'Hari Ini',
          totalVisits: 1,
          loyaltyPoints: 20,
          notes: newQ.complaint
        },
        ...customers
      ]);
    }
  };

  const handleUpdateQueueStatus = (id: string, status: ServiceStatus, progress?: number) => {
    setQueues((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const newProgress = progress !== undefined ? progress : status === 'selesai' ? 100 : q.progressPercent;
          return { ...q, status, progressPercent: newProgress };
        }
        return q;
      })
    );
  };

  const handleUpdateQueueItems = (queueId: string, items: ServiceItem[], totalCost: number) => {
    setQueues((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, items, totalCost } : q))
    );
  };

  const handleResetDailyQueues = () => {
    setQueues([]);
  };

  const handlePayQueueAtPOS = (queue: ServiceQueue) => {
    setPreselectedQueueForPOS(queue);
    // Switch directly to POS feature (Pilih sub-menu Kasir Servis agar langsung checkout antrean)
    const kasirMod = MENU_MODULES.find((m) => m.id === 'kasir');
    if (kasirMod) {
      setSelectedModule(kasirMod);
      const bayarSubMenu = kasirMod.subMenus.find((s) => s.id === 'kasir') || kasirMod.subMenus[0];
      setSelectedSubMenu(bayarSubMenu);
      setCurrentScreen('feature');
    }
  };

  // Staff & Commission Handlers
  const handleAddStaff = (newStaff: StaffMember) => {
    const updated = [newStaff, ...staff];
    setStaff(updated);
    localStorage.setItem('bq_staff', JSON.stringify(updated));
  };

  const handleUpdateStaff = (updatedMember: StaffMember) => {
    const updated = staff.map((s) => (s.id === updatedMember.id ? updatedMember : s));
    setStaff(updated);
    localStorage.setItem('bq_staff', JSON.stringify(updated));
  };

  const handleDeleteStaff = (id: string) => {
    const updated = staff.filter((s) => s.id !== id);
    setStaff(updated);
    localStorage.setItem('bq_staff', JSON.stringify(updated));
  };

  const handleAddCommission = (newRecord: MechanicCommissionRecord) => {
    const updated = [newRecord, ...commissions];
    setCommissions(updated);
    localStorage.setItem('bq_commissions', JSON.stringify(updated));
  };

  const handleUpdateCommissionStatus = (id: string, status: 'Pending' | 'Dibayar') => {
    const now = new Date();
    const paidAt = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    const updated = commissions.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          payoutStatus: status,
          paidAt: status === 'Dibayar' ? paidAt : undefined
        };
      }
      return c;
    });
    setCommissions(updated);
    localStorage.setItem('bq_commissions', JSON.stringify(updated));
  };

  const handleSwitchUserRole = (role: UserSession['role']) => {
    const newSession: UserSession = userSession
      ? { ...userSession, role }
      : {
          name: role === 'Kasir' ? 'Siti Rahma (Kasir)' : role === 'Mekanik' ? 'Mas Joko (Mekanik)' : 'Bpk. Ahmad Fauzi (SPV)',
          email: `${role.toLowerCase()}@bengkelqu.id`,
          role,
          autoLogin: true,
          loginTime: 'Hari Ini'
        };
    setUserSession(newSession);
    localStorage.setItem('bq_user_session', JSON.stringify(newSession));
  };

  // Transaction action: pencatatan transaksi & perhitungan komisi mekanik otomatis
  const handleCompleteTransaction = (newTx: Transaction) => {
    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('bq_transactions', JSON.stringify(updatedTransactions));

    // Hitung komisi mekanik otomatis jika terdapat item bertipe jasa servis ('jasa')
    const laborItems = newTx.items.filter((i) => i.type === 'jasa');
    const serviceLaborTotal = laborItems.reduce((sum, i) => sum + (i.price * i.qty), 0);

    if (serviceLaborTotal > 0 && newTx.mechanicName) {
      const matchedMechanic = staff.find(
        (s) => s.name.trim().toLowerCase() === newTx.mechanicName.trim().toLowerCase()
      );
      // Ambil persentase komisi spesifik mekanik (default 20%)
      const commissionPercent = matchedMechanic?.commissionPercent !== undefined ? matchedMechanic.commissionPercent : 20;
      const commissionAmount = Math.round((serviceLaborTotal * commissionPercent) / 100);

      const autoCommissionRecord: MechanicCommissionRecord = {
        id: `com-${Date.now()}`,
        transactionId: newTx.id,
        invoiceNumber: newTx.invoiceNumber,
        date: newTx.date,
        mechanicId: matchedMechanic?.id,
        mechanicName: newTx.mechanicName,
        customerName: newTx.customerName,
        plateNumber: newTx.plateNumber,
        vehicleModel: newTx.vehicleModel,
        serviceLaborTotal,
        commissionPercent,
        commissionAmount,
        payoutStatus: 'Pending',
        notes: `Komisi otomatis jasa servis faktur ${newTx.invoiceNumber} (${laborItems.map((l) => l.name).join(', ')})`
      };

      setCommissions((prev) => {
        const next = [autoCommissionRecord, ...prev];
        localStorage.setItem('bq_commissions', JSON.stringify(next));
        return next;
      });

      // Update data performa mekanik: tugas aktif berkurang dan jumlah selesai hari ini bertambah
      setStaff((prevStaff) => {
        const updatedStaff = prevStaff.map((s) => {
          if (s.name.trim().toLowerCase() === newTx.mechanicName.trim().toLowerCase()) {
            return {
              ...s,
              completedToday: (s.completedToday || 0) + 1,
              activeTasks: Math.max(0, (s.activeTasks || 1) - 1)
            };
          }
          return s;
        });
        localStorage.setItem('bq_staff', JSON.stringify(updatedStaff));
        return updatedStaff;
      });
    }

    // Potong stok suku cadang / barang yang terjual secara real-time dari database POS
    if (newTx.items && newTx.items.length > 0) {
      setSpareparts((prevParts) => {
        let changed = false;
        const updated = prevParts.map((sp) => {
          const sold = newTx.items.find(
            (item) => item.type === 'part' && (item.id === sp.id || item.name.toLowerCase() === sp.name.toLowerCase())
          );
          if (sold) {
            changed = true;
            return {
              ...sp,
              stock: Math.max(0, sp.stock - (sold.qty || 1))
            };
          }
          return sp;
        });
        if (changed) {
          localStorage.setItem('bq_spareparts', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
        }
        return changed ? updated : prevParts;
      });
    }

    // If it corresponds to a queue, mark it as 'diambil'
    if (preselectedQueueForPOS) {
      handleUpdateQueueStatus(preselectedQueueForPOS.id, 'diambil', 100);
      setPreselectedQueueForPOS(null);
    }
  };

  const handleOpenReceipt = (tx: Transaction) => {
    setActiveReceiptTx(tx);
    setIsReceiptModalOpen(true);
  };

  // Inventory actions
  const handleUpdateStock = (id: string, newStock: number) => {
    setSpareparts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
  };

  const handleAddNewPart = (newPartData: Omit<Sparepart, 'id'>) => {
    const newPart: Sparepart = {
      ...newPartData,
      id: `p-${Date.now()}`
    };
    setSpareparts([newPart, ...spareparts]);
  };

  // Inbound arrival: syncs existing or adds new, logs procurement
  const handleSaveInboundStock = (
    itemData: {
      code: string;
      name: string;
      category: Sparepart['category'];
      brand: string;
      stockToAdd: number;
      minStock: number;
      buyPrice: number;
      sellPrice: number;
      unit: string;
      rackLocation: string;
      supplier?: string;
      poNumber?: string;
      notes?: string;
      photoUrl?: string;
      showInOnlineStore?: boolean;
      description?: string;
    }
  ) => {
    const existingIndex = spareparts.findIndex(
      (p) => p.code.trim().toLowerCase() === itemData.code.trim().toLowerCase()
    );

    let resolvedPartName = itemData.name;
    let resolvedCategory = itemData.category;
    let isRestock = false;

    if (existingIndex >= 0) {
      isRestock = true;
      const current = spareparts[existingIndex];
      resolvedPartName = current.name;
      resolvedCategory = current.category;
      const updatedList = [...spareparts];
      updatedList[existingIndex] = {
        ...current,
        name: itemData.name || current.name,
        category: itemData.category || current.category,
        brand: itemData.brand || current.brand,
        stock: current.stock + itemData.stockToAdd,
        minStock: itemData.minStock || current.minStock,
        buyPrice: itemData.buyPrice || current.buyPrice,
        sellPrice: itemData.sellPrice || current.sellPrice,
        unit: itemData.unit || current.unit,
        rackLocation: itemData.rackLocation || current.rackLocation,
        supplier: itemData.supplier || current.supplier,
        photoUrl: itemData.photoUrl !== undefined ? itemData.photoUrl : current.photoUrl,
        showInOnlineStore: itemData.showInOnlineStore !== undefined ? itemData.showInOnlineStore : current.showInOnlineStore,
        description: itemData.description || current.description
      };
      setSpareparts(updatedList);
    } else {
      const newPart: Sparepart = {
        id: `p-${Date.now()}`,
        code: itemData.code,
        name: itemData.name,
        category: itemData.category,
        brand: itemData.brand,
        stock: itemData.stockToAdd,
        minStock: itemData.minStock,
        buyPrice: itemData.buyPrice,
        sellPrice: itemData.sellPrice,
        unit: itemData.unit,
        rackLocation: itemData.rackLocation,
        supplier: itemData.supplier,
        photoUrl: itemData.photoUrl,
        showInOnlineStore: itemData.showInOnlineStore !== undefined ? itemData.showInOnlineStore : true,
        description: itemData.description
      };
      setSpareparts([newPart, ...spareparts]);
    }

    // Automatically record procurement log
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    const newPO: ProcurementRecord = {
      id: `po-${Date.now()}`,
      poNumber: itemData.poNumber || `INB-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
      code: itemData.code,
      name: resolvedPartName,
      category: resolvedCategory,
      supplier: itemData.supplier || 'Distributor Resmi Bengkel',
      qty: itemData.stockToAdd,
      unit: itemData.unit || 'Pcs',
      buyPrice: itemData.buyPrice,
      totalCost: itemData.buyPrice * itemData.stockToAdd,
      date: dateFormatted,
      timestamp: Date.now(),
      receiver: userSession?.name || 'Admin Logistik Bengkel',
      type: isRestock ? 'Restock' : 'Baru',
      notes: itemData.notes || (isRestock ? 'Penambahan stok inbound' : 'Suku cadang baru katalog')
    };
    setProcurements([newPO, ...procurements]);
  };

  // Damaged goods reporting: automatically reduces stock from master catalog
  const handleReportDamagedGood = (
    report: {
      sparepartId?: string;
      code: string;
      name: string;
      qty: number;
      unit: string;
      damageReason: string;
      reportedBy: string;
      notes?: string;
    }
  ) => {
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    const newDamage: DamagedGood = {
      id: `dmg-${Date.now()}`,
      sparepartId: report.sparepartId,
      code: report.code,
      name: report.name,
      qty: report.qty,
      unit: report.unit,
      damageReason: report.damageReason,
      reportedBy: report.reportedBy || userSession?.name || 'Mekanik / Tim Bengkel',
      date: dateFormatted,
      timestamp: Date.now(),
      status: 'Diajukan',
      notes: report.notes
    };
    setDamagedGoods([newDamage, ...damagedGoods]);

    // Automatically reduce master catalog stock
    if (report.code) {
      setSpareparts((prev) =>
        prev.map((p) => {
          if (p.code.toLowerCase() === report.code.toLowerCase() || p.id === report.sparepartId) {
            return { ...p, stock: Math.max(0, p.stock - report.qty) };
          }
          return p;
        })
      );
    }
  };

  // Quick search from dashboard
  const handleQuickSearchPlat = (query: string) => {
    // Open service module with search prefilled
    const servMod = MENU_MODULES.find((m) => m.id === 'servis');
    if (servMod) {
      setSelectedModule(servMod);
      setSelectedSubMenu(servMod.subMenus[0]);
      setCurrentScreen('feature');
    }
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const handleRestoreData = (backupData: any) => {
    if (backupData.queues) setQueues(backupData.queues);
    if (backupData.spareparts) setSpareparts(backupData.spareparts);
    if (backupData.transactions) setTransactions(backupData.transactions);
    if (backupData.customers) setCustomers(backupData.customers);
    if (backupData.damagedGoods) setDamagedGoods(backupData.damagedGoods);
    if (backupData.procurements) setProcurements(backupData.procurements);
    if (backupData.campaigns) setCampaigns(backupData.campaigns);
    if (backupData.vouchers) setVouchers(backupData.vouchers);
    if (backupData.expenses) setExpenses(backupData.expenses);
    if (backupData.profile) setProfile(backupData.profile);
    if (backupData.permissions) setPermissions(backupData.permissions);
    if (backupData.branches) setBranches(backupData.branches);
    if (backupData.staff) {
      setStaff(backupData.staff);
      localStorage.setItem('bq_staff', JSON.stringify(backupData.staff));
    }
    if (backupData.commissions) {
      setCommissions(backupData.commissions);
      localStorage.setItem('bq_commissions', JSON.stringify(backupData.commissions));
    }
    if (backupData.subscription) {
      setSubscription(backupData.subscription);
      localStorage.setItem('bq_subscription', JSON.stringify(backupData.subscription));
    }
  };

  const handleResetData = (mode: 'daily' | 'factory' | 'clean_slate') => {
    if (mode === 'daily') {
      // Clear completed queues and today's transactions
      setQueues((prev) => prev.filter((q) => q.status === 'menunggu' || q.status === 'proses'));
      setTransactions([]);
    } else if (mode === 'clean_slate') {
      // REQUIREMENT: Pastikan reset berfungsi hapus data tidak tersisa (0 records left)
      setQueues([]);
      setSpareparts([]);
      setTransactions([]);
      setCustomers([]);
      setDamagedGoods([]);
      setProcurements([]);
      setCampaigns([]);
      setVouchers([]);
      setExpenses([]);
      setNotifications([]);
      setStaff([]);
      setCommissions([]);

      localStorage.setItem('bq_queues', '[]');
      localStorage.setItem('bq_spareparts', '[]');
      localStorage.setItem('bq_transactions', '[]');
      localStorage.setItem('bq_customers', '[]');
      localStorage.setItem('bq_damaged_goods', '[]');
      localStorage.setItem('bq_procurements', '[]');
      localStorage.setItem('bq_campaigns', '[]');
      localStorage.setItem('bq_vouchers', '[]');
      localStorage.setItem('bq_kas_kecil', '[]');
      localStorage.setItem('bq_notifs', '[]');
      localStorage.setItem('bq_staff', '[]');
      localStorage.setItem('bq_commissions', '[]');
    } else if (mode === 'factory') {
      // Muat ulang data sampel / demo pabrik lengkap
      setQueues(INITIAL_QUEUES);
      setSpareparts(INITIAL_SPAREPARTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setCustomers(INITIAL_CUSTOMERS);
      setDamagedGoods(INITIAL_DAMAGED_GOODS);
      setProcurements(INITIAL_PROCUREMENTS);
      setCampaigns(INITIAL_CAMPAIGNS);
      setVouchers(INITIAL_VOUCHERS);
      setProfile(INITIAL_PROFILE);
      setPermissions(INITIAL_PERMISSIONS);
      setBranches(INITIAL_BRANCHES);
      setNotifications(INITIAL_NOTIFICATIONS);
      setStaff(INITIAL_STAFF);
      setCommissions(INITIAL_COMMISSIONS);

      localStorage.setItem('bq_queues', JSON.stringify(INITIAL_QUEUES));
      localStorage.setItem('bq_spareparts', JSON.stringify(INITIAL_SPAREPARTS));
      localStorage.setItem('bq_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('bq_customers', JSON.stringify(INITIAL_CUSTOMERS));
      localStorage.setItem('bq_damaged_goods', JSON.stringify(INITIAL_DAMAGED_GOODS));
      localStorage.setItem('bq_procurements', JSON.stringify(INITIAL_PROCUREMENTS));
      localStorage.setItem('bq_campaigns', JSON.stringify(INITIAL_CAMPAIGNS));
      localStorage.setItem('bq_vouchers', JSON.stringify(INITIAL_VOUCHERS));
      localStorage.setItem('bq_profile', JSON.stringify(INITIAL_PROFILE));
      localStorage.setItem('bq_permissions', JSON.stringify(INITIAL_PERMISSIONS));
      localStorage.setItem('bq_branches', JSON.stringify(INITIAL_BRANCHES));
      localStorage.setItem('bq_notifs', JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem('bq_staff', JSON.stringify(INITIAL_STAFF));
      localStorage.setItem('bq_commissions', JSON.stringify(INITIAL_COMMISSIONS));
    }
  };

  // Active mechanics derived dynamically from staff with fallback to INITIAL_MECHANICS
  const activeMechanics = React.useMemo(() => {
    const fromStaff = staff
      .filter((s) => s.role === 'Mekanik' && s.status === 'Aktif')
      .map((s) => ({
        id: s.id,
        name: s.name,
        role: s.specialty || 'Mekanik Servis',
        phone: s.phone,
        activeTasks: s.activeTasks || 0,
        completedToday: s.completedToday || 0,
        rating: s.rating || 4.9,
        avatarBg: s.avatarBg || 'bg-emerald-600',
        status: s.status,
        commissionPercent: s.commissionPercent
      }));
    return fromStaff.length > 0 ? fromStaff : INITIAL_MECHANICS;
  }, [staff]);

  // Decide which screen to render
  const renderCurrentView = () => {
    if (currentScreen === 'dashboard') {
      return (
        <HomeDashboard
          modules={MENU_MODULES}
          onSelectModule={handleSelectModule}
          queues={queues}
          onOpenNewQueue={() => setIsNewQueueModalOpen(true)}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          unreadNotifsCount={unreadNotifsCount}
          onSelectQueueItem={(q) => {
            const servMod = MENU_MODULES.find((m) => m.id === 'servis');
            if (servMod) {
              setSelectedModule(servMod);
              setSelectedSubMenu(servMod.subMenus[0]);
              setCurrentScreen('feature');
            }
          }}
          onQuickSearchPlat={handleQuickSearchPlat}
          profile={profile}
          userSession={userSession}
          onLogout={handleLogout}
          onSwitchUserRole={handleSwitchUserRole}
          subscription={subscription}
          onOpenEcosystemSwitcher={() => setIsMasterSwitcherOpen(true)}
          onOpenPosCore={() => {
            const kasirMod = MENU_MODULES.find((m) => m.id === 'kasir');
            if (kasirMod) {
              setSelectedModule(kasirMod);
              const posSub = kasirMod.subMenus.find((s) => s.id === 'pos-core') || kasirMod.subMenus[0];
              setSelectedSubMenu(posSub);
              setCurrentScreen('feature');
            }
          }}
          onOpenPaguyuban={() => setActiveEcosystem('paguyubanqu')}
        />
      );
    }

    if (currentScreen === 'submenu' && selectedModule) {
      return (
        <SubMenuPage
          module={selectedModule}
          onBack={handleBack}
          onSelectSubMenu={handleSelectSubMenu}
          activeSubMenuId={selectedSubMenu?.id}
        />
      );
    }

    if (currentScreen === 'feature' && selectedModule) {
      switch (selectedModule.id) {
        case 'servis':
          return (
            <ServiceDetailView
              initialTab={selectedSubMenu?.id || 'registrasi'}
              queues={queues}
              onBack={handleBack}
              onAddQueue={handleAddQueue}
              onUpdateQueueStatus={handleUpdateQueueStatus}
              onUpdateQueueItems={handleUpdateQueueItems}
              onSelectQueueForInvoice={handlePayQueueAtPOS}
              onResetDailyQueues={handleResetDailyQueues}
              spareparts={spareparts}
              mechanics={activeMechanics}
              profile={profile}
            />
          );
        case 'kasir':
          return (
            <CashierPOSView
              initialTab={selectedSubMenu?.id || 'kasir'}
              onBack={handleBack}
              spareparts={spareparts}
              transactions={transactions}
              queues={queues}
              onCompleteTransaction={handleCompleteTransaction}
              onOpenReceipt={handleOpenReceipt}
              preselectedQueue={preselectedQueueForPOS}
              onUpdateQueueStatus={handleUpdateQueueStatus}
              onAddQueue={handleAddQueue}
              staff={staff}
            />
          );
        case 'inventaris':
          return (
            <InventoryView
              initialTab={selectedSubMenu?.id || 'sparepart-datang'}
              spareparts={spareparts}
              damagedGoods={damagedGoods}
              procurements={procurements}
              onBack={handleBack}
              onUpdateStock={handleUpdateStock}
              onAddNewPart={handleAddNewPart}
              onSaveInboundStock={handleSaveInboundStock}
              onReportDamagedGood={handleReportDamagedGood}
              profile={profile}
            />
          );
        case 'pelanggan':
          return (
            <CustomerView
              initialTab={selectedSubMenu?.id || 'daftar-pelanggan'}
              customers={customers}
              queues={queues}
              transactions={transactions}
              onBack={handleBack}
              onAddNewCustomer={(c) => setCustomers([c, ...customers])}
            />
          );
        case 'marketing':
          return (
            <MarketingView
              initialTab={selectedSubMenu?.id || 'toko-online'}
              customers={customers}
              campaigns={campaigns}
              vouchers={vouchers}
              onBack={handleBack}
              onSendCampaign={(newCmp) => setCampaigns([newCmp, ...campaigns])}
              onAddVoucher={(newVch) => setVouchers([newVch, ...vouchers])}
              onToggleVoucherActive={(vchId) =>
                setVouchers((prev) =>
                  prev.map((v) => (v.id === vchId ? { ...v, isActive: !v.isActive } : v))
                )
              }
              onOpenOnlineCatalog={() => {
                setOnlineCatalogInitialModule('bengkel');
                setIsOnlineCatalogOpen(true);
              }}
              spareparts={spareparts}
              profile={profile}
            />
          );
        case 'laporan':
          return (
            <ReportView
              initialTab={selectedSubMenu?.id || 'laporan-pendapatan'}
              transactions={transactions}
              mechanics={INITIAL_MECHANICS}
              queues={queues}
              expenses={expenses}
              onBack={handleBack}
            />
          );
        case 'basic':
          return (
            <BasicProfileView
              onBack={handleBack}
              profile={profile}
              onSaveProfile={(updated) => setProfile(updated)}
            />
          );
        case 'core':
          if (selectedSubMenu?.id === 'core-profile') {
            return (
              <BasicProfileView
                onBack={handleBack}
                profile={profile}
                onSaveProfile={(updated) => setProfile(updated)}
              />
            );
          }
          if (selectedSubMenu?.id === 'core-devices') {
            return (
              <DeviceSyncView
                onBack={handleBack}
                subscription={subscription}
                workshopProfile={profile}
              />
            );
          }
          return (
            <CorePermissionsView
              onBack={handleBack}
              permissions={permissions}
              onUpdatePermissions={(updated) => setPermissions(updated)}
            />
          );
        case 'corporate':
          if (selectedSubMenu?.id === 'corp-profile') {
            return (
              <BasicProfileView
                onBack={handleBack}
                profile={profile}
                onSaveProfile={(updated) => setProfile(updated)}
              />
            );
          }
          if (selectedSubMenu?.id === 'corp-permissions') {
            return (
              <CorePermissionsView
                onBack={handleBack}
                permissions={permissions}
                onUpdatePermissions={(updated) => setPermissions(updated)}
              />
            );
          }
          if (selectedSubMenu?.id === 'corp-devices') {
            return (
              <DeviceSyncView
                onBack={handleBack}
                subscription={subscription}
                workshopProfile={profile}
              />
            );
          }
          return (
            <CorporateBranchesView
              onBack={handleBack}
              branches={branches}
              onSaveBranches={(updated) => setBranches(updated)}
            />
          );
        case 'setting':
          if (selectedSubMenu?.id === 'setting-profil' || selectedSubMenu?.id === 'basic-profile' || selectedSubMenu?.id === 'core-profile' || selectedSubMenu?.id === 'corp-profile') {
            return (
              <BasicProfileView
                onBack={handleBack}
                profile={profile}
                onSaveProfile={(updated) => setProfile(updated)}
              />
            );
          }
          if (selectedSubMenu?.id === 'setting-akses' || selectedSubMenu?.id === 'core-permissions' || selectedSubMenu?.id === 'corp-permissions') {
            return (
              <CorePermissionsView
                onBack={handleBack}
                permissions={permissions}
                onUpdatePermissions={(updated) => setPermissions(updated)}
                onNavigateToDevices={() => {
                  setSelectedSubMenu({
                    id: 'setting-perangkat',
                    title: 'Tautkan HP & Sinkron',
                    subtitle: 'Hubungkan HP Karyawan (QR Code)',
                    iconName: 'Smartphone',
                    badge: 'Multi-HP',
                    targetView: 'setting-perangkat'
                  });
                }}
              />
            );
          }
          if (selectedSubMenu?.id === 'setting-cabang' || selectedSubMenu?.id === 'corp-branches') {
            return (
              <CorporateBranchesView
                onBack={handleBack}
                branches={branches}
                onSaveBranches={(updated) => setBranches(updated)}
                onNavigateToDevices={() => {
                  setSelectedSubMenu({
                    id: 'setting-perangkat',
                    title: 'Tautkan HP & Sinkron',
                    subtitle: 'Hubungkan HP Karyawan (QR Code)',
                    iconName: 'Smartphone',
                    badge: 'Multi-HP',
                    targetView: 'setting-perangkat'
                  });
                }}
              />
            );
          }
          if (selectedSubMenu?.id === 'setting-perangkat' || selectedSubMenu?.id === 'core-devices' || selectedSubMenu?.id === 'corp-devices') {
            return (
              <DeviceSyncView
                onBack={handleBack}
                subscription={subscription}
                workshopProfile={profile}
              />
            );
          }
          if (selectedSubMenu?.id === 'setting-customer-care' || selectedSubMenu?.id === 'customer-care') {
            return (
              <CustomerCareView
                onBack={handleBack}
                profile={profile}
                userSession={userSession}
                queues={queues}
                spareparts={spareparts}
                transactions={transactions}
              />
            );
          }
          return (
            <SettingView
              initialTab={selectedSubMenu?.id || 'setting-tema'}
              onBack={handleBack}
              queues={queues}
              spareparts={spareparts}
              transactions={transactions}
              customers={customers}
              damagedGoods={damagedGoods}
              procurements={procurements}
              campaigns={campaigns}
              vouchers={vouchers}
              expenses={expenses}
              profile={profile}
              permissions={permissions}
              branches={branches}
              onRestoreData={handleRestoreData}
              onResetData={handleResetData}
              userSession={userSession}
              onLogout={handleLogout}
              subscription={subscription}
              onReloadDemoData={() => handleResetData('factory')}
              onNavigateToDevices={() => {
                setSelectedSubMenu({
                  id: 'setting-perangkat',
                  title: 'Tautkan HP & Sinkron',
                  subtitle: 'Hubungkan HP Karyawan (QR Code)',
                  iconName: 'Smartphone',
                  badge: 'Multi-HP',
                  targetView: 'setting-perangkat'
                });
              }}
              onNavigateToProfile={() => {
                setSelectedSubMenu({
                  id: 'setting-profil',
                  title: 'Profil Bengkel',
                  subtitle: 'Nama Bengkel, Alamat, Pemilik & Kontak',
                  iconName: 'Store',
                  badge: 'Profil',
                  targetView: 'setting-profil'
                });
              }}
              onNavigateToPermissions={() => {
                setSelectedSubMenu({
                  id: 'setting-akses',
                  title: 'Hak Akses & Role',
                  subtitle: 'Otorisasi Supervisor & Kasir',
                  iconName: 'Key',
                  badge: 'SPV & Kasir',
                  targetView: 'setting-akses'
                });
              }}
              onNavigateToBranches={() => {
                setSelectedSubMenu({
                  id: 'setting-cabang',
                  title: 'Manajemen Cabang',
                  subtitle: 'Kelola Kantor Cabang & Outlet',
                  iconName: 'Building2',
                  badge: 'Cabang',
                  targetView: 'setting-cabang'
                });
              }}
              onNavigateToCustomerCare={() => {
                setSelectedSubMenu({
                  id: 'setting-customer-care',
                  title: 'Customer Care & AI Support',
                  subtitle: 'Troubleshooting Teknis Gratis & Kirim Email',
                  iconName: 'Headphones',
                  badge: 'AI Gratis',
                  targetView: 'setting-customer-care'
                });
              }}
            />
          );
        case 'staff':
          return (
            <StaffView
              initialTab={selectedSubMenu?.id || 'data-karyawan'}
              onBack={handleBack}
              staff={staff}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
              commissions={commissions}
              onUpdateCommissionStatus={handleUpdateCommissionStatus}
              onAddCommission={handleAddCommission}
              permissions={permissions}
              onUpdatePermissions={(updated) => {
                setPermissions(updated);
                localStorage.setItem('bq_permissions', JSON.stringify(updated));
              }}
              userSession={userSession}
              onSwitchUserRole={handleSwitchUserRole}
              profile={profile}
              transactions={transactions}
            />
          );
        default:
          return (
            <SubMenuPage
              module={selectedModule}
              onBack={handleBack}
              onSelectSubMenu={handleSelectSubMenu}
            />
          );
      }
    }

    return null;
  };

  // Tampilkan Halaman Toko Online Publik jika sedang membuka katalog publik / URL params (?toko= / ?modul=)
  if (isOnlineCatalogOpen) {
    return (
      <OnlineCatalogView
        initialModule={onlineCatalogInitialModule}
        onBackToAdmin={() => {
          setIsOnlineCatalogOpen(false);
          if (window.history.pushState) {
            window.history.pushState({}, '', window.location.pathname);
          }
        }}
        bengkelParts={spareparts}
      />
    );
  }

  // Tampilkan Halaman Login Auto Google Account terlebih dahulu sebelum masuk ke Halaman Utama
  if (!userSession) {
    return (
      <AndroidFrame canGoBack={false} topSafeAreaColor="#f8fafc">
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          defaultEmail="smbsyariah@gmail.com"
        />
      </AndroidFrame>
    );
  }

  // Modul CustomerQu (Peta Radar Real-Time & Pedagang Keliling Multi-Role)
  if (isCustomerQuActive) {
    return (
      <AndroidFrame
        activeModuleName="CustomerQu - Peta Radar & Pedagang Keliling"
        topSafeAreaColor="#008952"
        onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        onHomePress={handleGoHome}
        onBackPress={() => setIsCustomerQuActive(false)}
        canGoBack={true}
      >
        {/* Top Header Bar Konsisten di Semua Halaman UsahaQu */}
        <UniversalTopHeader
          currentViewName="CustomerQu Radar"
          isCustomerQuActive={true}
          onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
          onQuickToggleCustomerQu={handleQuickToggleCustomerQu}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
          activePingsCount={buyerPings.filter((p) => p.status === 'active').length}
        />

        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          <CustomerQuView
            onBack={() => setIsCustomerQuActive(false)}
            onOpenCashierPOS={() => {
              setIsCustomerQuActive(false);
              const kasirMod = MENU_MODULES.find((m) => m.id === 'kasir');
              if (kasirMod) {
                setSelectedModule(kasirMod);
                const posSub = kasirMod.subMenus.find((s) => s.id === 'pos-core') || kasirMod.subMenus[0];
                setSelectedSubMenu(posSub);
                setCurrentScreen('feature');
              }
            }}
            onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
            initialMode="buyer"
          />
        </div>

        {/* Global Modals */}
        <ModuleTemplateDrawerModal
          isOpen={isModuleDrawerOpen}
          onClose={() => setIsModuleDrawerOpen(false)}
          onSelectFeature={handleSelectFeatureFromDrawer}
          currentActiveFeature="customerqu"
        />

        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          buyerPings={buyerPings}
          onSelectPing={() => {
            // Sudah berada di tampilan CustomerQu
          }}
        />

        <MasterSwitcherModal
          isOpen={isMasterSwitcherOpen}
          onClose={() => setIsMasterSwitcherOpen(false)}
          activeEcosystem={activeEcosystem}
          onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        <BusinessTypeOnboardingModal
          isOpen={isOnboardingModalOpen}
          onSelectBusiness={handleSelectBusinessType}
          onClose={() => setIsOnboardingModalOpen(false)}
          allowClose={!!localStorage.getItem('usahaqu_type')}
          currentActive={activeEcosystem}
        />
      </AndroidFrame>
    );
  }

  // UsahaQu Master Ecosystem Routing: Tampilkan KedaiQu (Sidebar Layout) jika dipilih
  if (activeEcosystem === 'kedai') {
    return (
      <AndroidFrame
        activeModuleName="KedaiQu - Cafe & F&B Modern"
        topSafeAreaColor="#008952"
        onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        onHomePress={handleGoHome}
        onBackPress={() => setActiveEcosystem('bengkel')}
        canGoBack={false}
      >
        <UniversalTopHeader
          currentViewName="KedaiQu (F&B)"
          isCustomerQuActive={false}
          onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
          onQuickToggleCustomerQu={handleQuickToggleCustomerQu}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
          activePingsCount={buyerPings.filter((p) => p.status === 'active').length}
        />

        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          <KedaiQuView
            onBackToBengkel={() => setActiveEcosystem('bengkel')}
            onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
            onOpenOnlineCatalog={() => {
              setOnlineCatalogInitialModule('kedai');
              setIsOnlineCatalogOpen(true);
            }}
          />
        </div>

        <ModuleTemplateDrawerModal
          isOpen={isModuleDrawerOpen}
          onClose={() => setIsModuleDrawerOpen(false)}
          onSelectFeature={handleSelectFeatureFromDrawer}
          currentActiveFeature="template-kuliner"
        />

        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          buyerPings={buyerPings}
          onSelectPing={() => {
            setIsCustomerQuActive(true);
          }}
        />

        <MasterSwitcherModal
          isOpen={isMasterSwitcherOpen}
          onClose={() => setIsMasterSwitcherOpen(false)}
          activeEcosystem={activeEcosystem}
          onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        <BusinessTypeOnboardingModal
          isOpen={isOnboardingModalOpen}
          onSelectBusiness={handleSelectBusinessType}
          onClose={() => setIsOnboardingModalOpen(false)}
          allowClose={!!localStorage.getItem('usahaqu_type')}
          currentActive={activeEcosystem}
        />
      </AndroidFrame>
    );
  }

  // UsahaQu Master Ecosystem Routing: Tampilkan KlinikQu (Sidebar Layout Medis) jika dipilih
  if (activeEcosystem === 'klinik') {
    return (
      <AndroidFrame
        activeModuleName="KlinikQu - Klinik & Apotek"
        topSafeAreaColor="#008952"
        onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        onHomePress={handleGoHome}
        onBackPress={() => setActiveEcosystem('bengkel')}
        canGoBack={false}
      >
        <UniversalTopHeader
          currentViewName="KlinikQu (Medis)"
          isCustomerQuActive={false}
          onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
          onQuickToggleCustomerQu={handleQuickToggleCustomerQu}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
          activePingsCount={buyerPings.filter((p) => p.status === 'active').length}
        />

        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          <KlinikQuView
            onBackToBengkel={() => setActiveEcosystem('bengkel')}
            onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
            onOpenOnlineCatalog={() => {
              setOnlineCatalogInitialModule('klinik');
              setIsOnlineCatalogOpen(true);
            }}
          />
        </div>

        <ModuleTemplateDrawerModal
          isOpen={isModuleDrawerOpen}
          onClose={() => setIsModuleDrawerOpen(false)}
          onSelectFeature={handleSelectFeatureFromDrawer}
          currentActiveFeature="klinik"
        />

        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          buyerPings={buyerPings}
          onSelectPing={() => {
            setIsCustomerQuActive(true);
          }}
        />

        <MasterSwitcherModal
          isOpen={isMasterSwitcherOpen}
          onClose={() => setIsMasterSwitcherOpen(false)}
          activeEcosystem={activeEcosystem}
          onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        <BusinessTypeOnboardingModal
          isOpen={isOnboardingModalOpen}
          onSelectBusiness={handleSelectBusinessType}
          onClose={() => setIsOnboardingModalOpen(false)}
          allowClose={!!localStorage.getItem('usahaqu_type')}
          currentActive={activeEcosystem}
        />
      </AndroidFrame>
    );
  }

  // UsahaQu Master Ecosystem Routing: Tampilkan RitelQu (Navbar Layout Ritel) jika dipilih
  if (activeEcosystem === 'ritel') {
    return (
      <AndroidFrame
        activeModuleName="RitelQu - Minimarket & Kelontong"
        topSafeAreaColor="#008952"
        onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        onHomePress={handleGoHome}
        onBackPress={() => setActiveEcosystem('bengkel')}
        canGoBack={false}
      >
        <UniversalTopHeader
          currentViewName="RitelQu (Kelontong)"
          isCustomerQuActive={false}
          onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
          onQuickToggleCustomerQu={handleQuickToggleCustomerQu}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
          activePingsCount={buyerPings.filter((p) => p.status === 'active').length}
        />

        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          <RitelQuView
            onBackToBengkel={() => setActiveEcosystem('bengkel')}
            onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
            onOpenOnlineCatalog={() => {
              setOnlineCatalogInitialModule('ritel');
              setIsOnlineCatalogOpen(true);
            }}
          />
        </div>

        <ModuleTemplateDrawerModal
          isOpen={isModuleDrawerOpen}
          onClose={() => setIsModuleDrawerOpen(false)}
          onSelectFeature={handleSelectFeatureFromDrawer}
          currentActiveFeature="template-sayur"
        />

        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          buyerPings={buyerPings}
          onSelectPing={() => {
            setIsCustomerQuActive(true);
          }}
        />

        <MasterSwitcherModal
          isOpen={isMasterSwitcherOpen}
          onClose={() => setIsMasterSwitcherOpen(false)}
          activeEcosystem={activeEcosystem}
          onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        <BusinessTypeOnboardingModal
          isOpen={isOnboardingModalOpen}
          onSelectBusiness={handleSelectBusinessType}
          onClose={() => setIsOnboardingModalOpen(false)}
          allowClose={!!localStorage.getItem('usahaqu_type')}
          currentActive={activeEcosystem}
        />
      </AndroidFrame>
    );
  }

  // UsahaQu Master Ecosystem Routing: Tampilkan Titip Qu jika dipilih
  if (activeEcosystem === 'titip') {
    return (
      <AndroidFrame
        activeModuleName="Titip Qu - Konsinyasi & Reseller"
        topSafeAreaColor="#008952"
        onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        onHomePress={handleGoHome}
        onBackPress={() => setActiveEcosystem('bengkel')}
        canGoBack={false}
      >
        <UniversalTopHeader
          currentViewName="Titip Qu (Konsinyasi)"
          isCustomerQuActive={false}
          onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
          onQuickToggleCustomerQu={handleQuickToggleCustomerQu}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
          activePingsCount={buyerPings.filter((p) => p.status === 'active').length}
        />

        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          <TitipQuView
            onBackToBengkel={() => setActiveEcosystem('bengkel')}
            onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
            onOpenOnlineCatalog={() => {
              setOnlineCatalogInitialModule('titip');
              setIsOnlineCatalogOpen(true);
            }}
          />
        </div>

        <ModuleTemplateDrawerModal
          isOpen={isModuleDrawerOpen}
          onClose={() => setIsModuleDrawerOpen(false)}
          onSelectFeature={handleSelectFeatureFromDrawer}
          currentActiveFeature="titip"
        />

        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          buyerPings={buyerPings}
          onSelectPing={() => {
            setIsCustomerQuActive(true);
          }}
        />

        <MasterSwitcherModal
          isOpen={isMasterSwitcherOpen}
          onClose={() => setIsMasterSwitcherOpen(false)}
          activeEcosystem={activeEcosystem}
          onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        <BusinessTypeOnboardingModal
          isOpen={isOnboardingModalOpen}
          onSelectBusiness={handleSelectBusinessType}
          onClose={() => setIsOnboardingModalOpen(false)}
          allowClose={!!localStorage.getItem('usahaqu_type')}
          currentActive={activeEcosystem}
        />
      </AndroidFrame>
    );
  }

  // Klaster Komunitas Warga: PaguyubanQu & Smart SiagaQu
  if (activeEcosystem === 'paguyubanqu') {
    return (
      <AndroidFrame
        activeModuleName="PaguyubanQu & Smart SiagaQu"
        topSafeAreaColor="#0F5257"
        onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        onHomePress={handleGoHome}
        onBackPress={() => setActiveEcosystem('bengkel')}
        canGoBack={false}
      >
        <UniversalTopHeader
          currentViewName="PaguyubanQu (Warga)"
          isCustomerQuActive={false}
          isPaguyubanActive={true}
          onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
          onQuickToggleCustomerQu={handleQuickToggleCustomerQu}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
          activePingsCount={buyerPings.filter((p) => p.status === 'active').length}
        />

        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
          <PaguyubanQuView
            onBackToMain={() => setActiveEcosystem('bengkel')}
            onOpenUsahaModule={(moduleKey) => {
              if (moduleKey === 'customerqu') {
                setIsCustomerQuActive(true);
              } else {
                setActiveEcosystem(moduleKey as EcosystemId);
              }
            }}
          />
        </div>

        <ModuleTemplateDrawerModal
          isOpen={isModuleDrawerOpen}
          onClose={() => setIsModuleDrawerOpen(false)}
          onSelectFeature={handleSelectFeatureFromDrawer}
          currentActiveFeature="paguyubanqu"
        />

        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          buyerPings={buyerPings}
          onSelectPing={() => {
            setIsCustomerQuActive(true);
          }}
        />

        <MasterSwitcherModal
          isOpen={isMasterSwitcherOpen}
          onClose={() => setIsMasterSwitcherOpen(false)}
          activeEcosystem={activeEcosystem}
          onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        <BusinessTypeOnboardingModal
          isOpen={isOnboardingModalOpen}
          onSelectBusiness={handleSelectBusinessType}
          onClose={() => setIsOnboardingModalOpen(false)}
          allowClose={!!localStorage.getItem('usahaqu_type')}
          currentActive={activeEcosystem}
        />
      </AndroidFrame>
    );
  }

  // Modul Ekosistem Lainnya Fallback
  if (activeEcosystem !== 'bengkel') {
    return (
      <AndroidFrame
        activeModuleName="UsahaQu Ekosistem"
        onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        onHomePress={handleGoHome}
        onBackPress={() => setActiveEcosystem('bengkel')}
        canGoBack={false}
      >
        <EcosystemPreviewView
          ecosystemId={activeEcosystem}
          onBackToBengkel={() => setActiveEcosystem('bengkel')}
          onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
        />

        <MasterSwitcherModal
          isOpen={isMasterSwitcherOpen}
          onClose={() => setIsMasterSwitcherOpen(false)}
          activeEcosystem={activeEcosystem}
          onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
          onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        />

        <BusinessTypeOnboardingModal
          isOpen={isOnboardingModalOpen}
          onSelectBusiness={handleSelectBusinessType}
          onClose={() => setIsOnboardingModalOpen(false)}
          allowClose={!!localStorage.getItem('usahaqu_type')}
          currentActive={activeEcosystem}
        />
      </AndroidFrame>
    );
  }

  return (
    <AndroidFrame
      activeModuleName="BengkelQu - Otomotif & Servis"
      topSafeAreaColor="#008952"
      onOpenMasterSwitcher={() => setIsMasterSwitcherOpen(true)}
      onHomePress={handleGoHome}
      onBackPress={handleBack}
      canGoBack={currentScreen !== 'dashboard'}
      bottomBar={
        <BottomNavBar
          currentTab={currentTab}
          onTabChange={handleBottomTabChange}
          activeQueueCount={queues.filter((q) => q.status !== 'diambil').length}
          userRole={userSession?.role}
        />
      }
    >
      {/* 1. STRUKTUR HEADER & NAVIGASI MODUL: Top Header Bar yang konsisten di semua halaman */}
      <UniversalTopHeader
        currentViewName={
          currentScreen === 'dashboard'
            ? 'BengkelQu'
            : selectedModule?.title || 'BengkelQu'
        }
        isCustomerQuActive={false}
        onOpenModuleDrawer={() => setIsModuleDrawerOpen(true)}
        onQuickToggleCustomerQu={handleQuickToggleCustomerQu}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        unreadCount={notifications.filter((n) => !n.read).length}
        activePingsCount={buyerPings.filter((p) => p.status === 'active').length}
      />

      {/* Active Screen View - Scrollable Viewport BengkelQu (Lancar di-scroll, aman di bawah jam & batre bawaan HP) */}
      <div 
        className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto overscroll-contain"
      >
        {renderCurrentView()}
      </div>

      {/* Global Modals */}
      <NewQueueModal
        isOpen={isNewQueueModalOpen}
        onClose={() => setIsNewQueueModalOpen(false)}
        onAddQueue={handleAddQueue}
        mechanics={INITIAL_MECHANICS}
        existingQueueCount={queues.length}
        profile={profile}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setActiveReceiptTx(null);
        }}
        transaction={activeReceiptTx}
      />

      {/* Modal Overlay / Drawer "Pusat Modul & Template" */}
      <ModuleTemplateDrawerModal
        isOpen={isModuleDrawerOpen}
        onClose={() => setIsModuleDrawerOpen(false)}
        onSelectFeature={handleSelectFeatureFromDrawer}
        currentActiveFeature={selectedModule?.id || 'kasir'}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotifsRead}
        buyerPings={buyerPings}
        onSelectPing={() => {
          setIsCustomerQuActive(true);
        }}
      />

      {/* Master Ecosystem Switcher Modal (Diakses langsung via Logo BQ) */}
      <MasterSwitcherModal
        isOpen={isMasterSwitcherOpen}
        onClose={() => setIsMasterSwitcherOpen(false)}
        activeEcosystem={activeEcosystem}
        onSelectEcosystem={(eco) => setActiveEcosystem(eco)}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
      />

      {/* Onboarding Setup Awal & Ganti Jenis Usaha Modal */}
      <BusinessTypeOnboardingModal
        isOpen={isOnboardingModalOpen}
        onSelectBusiness={handleSelectBusinessType}
        onClose={() => setIsOnboardingModalOpen(false)}
        allowClose={!!localStorage.getItem('usahaqu_type')}
        currentActive={activeEcosystem}
      />
    </AndroidFrame>
  );
}
