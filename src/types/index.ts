export type ServiceStatus = 'menunggu' | 'proses' | 'selesai' | 'diambil';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  type: 'jasa' | 'part';
}

export interface ServiceQueue {
  id: string;
  queueNumber: string; // e.g. "BQ-01", "BQ-02"
  plateNumber: string; // e.g. "B 3829 TKR"
  customerName: string;
  customerPhone: string;
  vehicleModel: string; // e.g. "Honda Vario 160"
  vehicleType: 'Motor Matic' | 'Motor Bebek' | 'Motor Sport' | 'Mobil' | 'Lainnya';
  serviceCategory: 'Servis Ringan' | 'Servis Berkala' | 'Turun Mesin' | 'Ganti Oli & Filter' | 'Kelistrikan' | 'Custom';
  mechanicName: string;
  status: ServiceStatus;
  complaint: string;
  timeIn: string;
  date?: string;
  estimatedCompletion: string;
  items: ServiceItem[];
  progressPercent: number;
  totalCost: number;
  notes?: string;
}

export interface Sparepart {
  id: string;
  code: string;
  name: string;
  category: 'Oli & Pelumas' | 'Sistem Rem' | 'Transmisi / CVT' | 'Busi & Kelistrikan' | 'Ban & Velg' | 'Filter & Karburator' | 'Bodi & Aksesoris';
  brand: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
  unit: string; // e.g. "Botol", "Pcs", "Set"
  rackLocation: string;
  supplier?: string;
  barcode?: string;
  photoUrl?: string;
  showInOnlineStore?: boolean;
  description?: string;
}

export interface DamagedGood {
  id: string;
  sparepartId?: string;
  code: string;
  name: string;
  qty: number;
  unit: string;
  damageReason: string;
  reportedBy: string;
  date: string;
  timestamp: number;
  status: 'Diajukan' | 'Disetujui SPV' | 'Dimusnahkan' | 'Retur Suplier';
  notes?: string;
}

export interface ProcurementRecord {
  id: string;
  poNumber: string;
  code: string;
  name: string;
  category: string;
  supplier: string;
  qty: number;
  unit: string;
  buyPrice: number;
  totalCost: number;
  date: string;
  timestamp: number;
  receiver: string;
  type: 'Baru' | 'Restock';
  notes?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string; // e.g. "INV-20261006-001"
  date: string;
  customerName: string;
  plateNumber: string;
  vehicleModel: string;
  mechanicName: string;
  items: ServiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Tunai' | 'QRIS' | 'Transfer Bank' | 'Kartu Debit';
  cashPaid?: number;
  change?: number;
  status: 'Lunas' | 'Belum Lunas';
}

export type StaffRole = 'Mekanik' | 'Kasir' | 'Admin' | 'Supervisor';
export type StaffStatus = 'Aktif' | 'Non-Aktif';

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  commissionPercent: number; // Persentase komisi jasa servis (e.g. 20 untuk 20%)
  baseSalary?: number;       // Gaji pokok bulanan opsional
  joinDate: string;
  email?: string;
  address?: string;
  specialty?: string;        // Keahlian khusus, misal: CVT, Injeksi, Kelistrikan
  rating?: number;
  activeTasks?: number;
  completedToday?: number;
  avatarBg?: string;
  notes?: string;
}

export interface MechanicCommissionRecord {
  id: string;
  transactionId?: string;
  invoiceNumber: string;
  date: string;
  mechanicId?: string;
  mechanicName: string;
  customerName: string;
  plateNumber: string;
  vehicleModel: string;
  serviceLaborTotal: number;  // Total omset dari item bertipe 'jasa'
  commissionPercent: number;  // Persentase komisi mekanik (%)
  commissionAmount: number;   // Nominal komisi = (serviceLaborTotal * commissionPercent) / 100
  payoutStatus: 'Pending' | 'Dibayar';
  paidAt?: string;
  notes?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  role: string;
  phone: string;
  activeTasks: number;
  completedToday: number;
  rating: number;
  avatarBg: string;
  status?: StaffStatus;
  commissionPercent?: number;
}

export interface CustomerVehicle {
  id: string;
  name: string;
  phone: string;
  address?: string;
  plateNumber: string;
  vehicleBrand?: string; // e.g. "Honda", "Yamaha", "Suzuki"
  vehicleType?: string; // e.g. "Vario 160", "BeAT eSP", "NMAX 155"
  vehicleModel: string;
  year: string;
  lastServiceDate: string;
  totalVisits: number;
  loyaltyPoints: number;
  notes: string;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  channel: 'WhatsApp' | 'SMS' | 'Broadcast';
  targetAudience: string;
  messageContent: string;
  sentDate: string;
  recipientCount: number;
  status: 'Terkirim' | 'Terjadwal' | 'Draft';
  deliveredPercent: number;
}

export interface PromoVoucher {
  id: string;
  code: string;
  title: string;
  discountType: 'Persen' | 'Nominal';
  discountValue: number;
  minTransaction: number;
  validUntil: string;
  category: 'Semua' | 'Jasa Servis' | 'Sparepart' | 'Oli';
  quota: number;
  usedCount: number;
  isActive: boolean;
  notes?: string;
}

export interface SubMenuItemConfig {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  badge?: string;
  targetView: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: 'Operasional' | 'Bahan / Perlengkapan' | 'Konsumsi' | 'BBM / Transport' | 'Lainnya';
  amount: number;
  date: string;
  notes?: string;
  recordedBy?: string;
}

export interface PettyCashConfig {
  initialCapital: number;
  denominations: { [key: string]: number };
  updatedAt: string;
}

export interface ClosingRecord {
  id: string;
  date: string;
  shift: string;
  cashierName: string;
  initialCash: number;
  totalCashSales: number;
  totalNonCashSales: number;
  totalExpenses: number;
  totalUnpaidReceivables: number;
  expectedCashInDrawer: number;
  actualCashInDrawer: number;
  difference: number;
  notes?: string;
  status: 'Selesai' | 'Disetujui SPV';
}

export interface MenuModuleConfig {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  badgeCount?: string | number;
  badgeColor?: string;
  description: string;
  subMenus: SubMenuItemConfig[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'service' | 'stock' | 'payment' | 'system';
}

export interface WorkshopProfile {
  workshopName: string;
  address: string;
  ownerName: string;
  phone: string;
  email: string;
}

export interface RolePermissionConfig {
  id: string;
  category: string;
  permissionName: string;
  spv: boolean;
  kasir: boolean;
  mekanik: boolean;
  description: string;
}

export interface BranchItem {
  id: string;
  branchName: string;
  address: string;
  spvName: string;
  phone: string;
  email: string;
  isActive?: boolean;
}

export interface UserSession {
  name: string;
  email: string;
  avatar?: string;
  role: 'Supervisor' | 'Owner' | 'Kasir' | 'Mekanik' | 'Admin';
  autoLogin: boolean;
  loginTime: string;
}

export type SubscriptionPlanId = 'trial' | 'free' | 'basic' | 'core' | 'corporate';

export type ProTierOption = 'basic' | 'core' | 'corporate';

export type ProDurationOption = 1 | 3 | 6 | 12;

export interface SubscriptionState {
  planId: SubscriptionPlanId;
  planName: string;
  dailyRate: number; // 0 for free/trial, 1000 for basic, 2000 for core, 3000 for corporate
  trialStartDate: number;
  trialDurationDays: number;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  subscriptionExpiryDate?: number;
  isSubscribed: boolean;
  deviceId?: string;
  activeSerialKey?: string;
  subscriptionDurationMonths?: ProDurationOption;
  activatedAt?: number;
}

export type DeviceSlotRole = 'Owner' | 'Supervisor' | 'Kasir' | 'Mekanik';

export interface DeviceSlotInfo {
  slotNumber: number; // 1..3 for Core, 1..9 for Enterprise
  deviceId: string;
  deviceName: string;
  role: DeviceSlotRole;
  branchId?: string;
  branchName?: string;
  status: 'active' | 'empty' | 'revoked';
  isCurrentDevice: boolean;
  lastSyncTime: string;
}

export interface DevicePairingToken {
  workshopId: string;
  workshopName: string;
  licenseKey?: string;
  tier: 'core' | 'corporate';
  slotNumber: number;
  role: DeviceSlotRole;
  branchId?: string;
  branchName?: string;
  createdAt: number;
  pairingCode: string; // 6 digit quick code
}


