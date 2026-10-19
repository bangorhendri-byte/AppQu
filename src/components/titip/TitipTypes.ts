/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TitipMenuTab = 
  | 'produksi'
  | 'karyawan'
  | 'kemitraan'
  | 'penjualan'
  | 'bagi_hasil'
  | 'marketing'
  | 'laporan'
  | 'setting';

// 1. Raw Materials & Production Recipes
export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string; // kg, gram, liter, meter, pcs, lembar
  costPerUnit: number;
  stock: number;
  minStock: number;
  supplierName: string;
}

export interface RecipeMaterialItem {
  materialId: string;
  materialName: string;
  qty: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface ProductRecipe {
  id: string;
  sku: string;
  name: string;
  category: string;
  rawMaterials: RecipeMaterialItem[];
  materialsCost: number; // Subtotal bahan baku
  laborCostPerPcs: number; // Upah borongan pengerjaan
  overheadCostPerPcs: number; // Listrik, gas, packaging
  hppPerPcs: number; // HPP Total = Materials + Labor + Overhead
  sellingPriceRetail: number; // Harga Jual Langsung (Direct POS)
  consignmentPrice: number; // Harga Dasar Titipan Konsinyasi
  resellerPrice: number; // Harga Khusus Reseller
  currentStock: number;
  unit: string;
  notes?: string;
  photoUrl?: string;
  showInOnlineStore?: boolean;
  description?: string;
  vendorName?: string;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string; // BTH-202610-001
  recipeId: string;
  productName: string;
  targetQty: number;
  actualQty: number;
  startDate: string;
  status: 'proses' | 'selesai' | 'dibatalkan';
  totalHpp: number;
  operatorName: string;
  notes?: string;
}

// 2. Employees & Wages (Karyawan & Upah)
export interface Employee {
  id: string;
  code: string;
  name: string;
  role: 'Produksi' | 'Finishing' | 'Packaging' | 'Admin & Kurir';
  wageType: 'borongan' | 'harian' | 'bulanan';
  ratePerUnit: number; // Nilai rupiah per pcs pengerjaan
  dailyRate: number;
  monthlyRate: number;
  phone: string;
  status: 'aktif' | 'cuti';
  joinDate: string;
}

export interface DailyOutputLog {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  recipeId: string;
  productName: string;
  outputQty: number;
  wageEarned: number;
  status: 'pending' | 'dibayar';
}

export interface PayrollRecord {
  id: string;
  period: string;
  date: string;
  employeeId: string;
  employeeName: string;
  totalOutput: number;
  totalWage: number;
  bonus: number;
  deduction: number;
  netWage: number;
  status: 'lunas' | 'pending';
}

// 3. Partnerships (Kemitraan Toko Titipan & Reseller)
export interface ConsignmentStore {
  id: string;
  code: string;
  name: string;
  picName: string;
  phone: string;
  address: string;
  commissionPercent: number; // Contoh: 15% atau 20% untuk toko titipan
  totalStockDeposited: number;
  totalSoldQty: number;
  currentBalanceDue: number; // Saldo omzet belum dicairkan
  contractValidUntil: string;
  status: 'aktif' | 'vakum';
  notes?: string;
}

export interface ResellerPartner {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Distributor';
  discountPercent: number; // 10%, 15%, 25%
  minOrderQty: number;
  totalOrdersCount: number;
  totalSpent: number;
  joinDate: string;
  status: 'aktif' | 'nonaktif';
}

export interface PartnershipContract {
  id: string;
  contractNo: string;
  partnerType: 'toko_titip' | 'reseller';
  partnerName: string;
  startDate: string;
  endDate: string;
  profitTerms: string;
  returnPolicy: string;
  status: 'aktif' | 'berakhir';
}

// 4. Sales & Deliveries (Kasir & Penjualan)
export interface SalesItem {
  recipeId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  hpp: number;
  total: number;
}

export interface SalesTransaction {
  id: string;
  invoiceNumber: string;
  date: string;
  timestamp: number;
  channel: 'direct_pos' | 'konsinyasi' | 'reseller';
  partnerOrCustomerName: string;
  items: SalesItem[];
  subtotal: number;
  discount: number;
  commissionPercent?: number;
  commissionAmount?: number;
  grandTotal: number;
  paymentMethod: 'tunai' | 'transfer' | 'tempo';
  status: 'lunas' | 'tempo';
  notes?: string;
}

export interface DeliveryItem {
  recipeId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface DeliveryOrder {
  id: string;
  doNumber: string; // SJ-20261014-01
  date: string;
  partnerType: 'toko_titip' | 'reseller';
  partnerId: string;
  partnerName: string;
  address: string;
  driverName: string;
  vehicleNo: string;
  items: DeliveryItem[];
  totalQty: number;
  status: 'terkirim' | 'diterima' | 'selesai';
  notes?: string;
}

export interface ProductReturn {
  id: string;
  returnNumber: string;
  date: string;
  partnerId: string;
  partnerName: string;
  productName: string;
  qty: number;
  reason: 'kadaluwarsa' | 'kemasan_rusak' | 'tidak_laku';
  action: 'ganti_stok' | 'potong_tagihan' | 'pemusnahan';
  notes?: string;
}

// 5. Profit Sharing & Payout (Bagi Hasil & Payout)
export interface PayoutRecord {
  id: string;
  payoutNumber: string;
  date: string;
  storeId: string;
  storeName: string;
  periodSales: number;
  commissionPercent: number;
  commissionEarned: number; // Hak Toko Titipan
  netDisbursedToProducer: number; // Hak Bersih Produsen
  bankAccount: string;
  status: 'lunas' | 'pending';
  notes?: string;
}

// 6. Marketing
export interface ResellerCatalogAsset {
  id: string;
  title: string;
  category: string;
  wholesalePrice: number;
  suggestedRetailPrice: number;
  marginBenefit: number;
  tagline: string;
  shareUrl?: string;
}

export interface BundlingPromo {
  id: string;
  code: string;
  title: string;
  itemsIncluded: string;
  promoPrice: number;
  normalPrice: number;
  validUntil: string;
  isActive: boolean;
}

// 7. Store Profile & Setting
export interface TitipStoreProfile {
  brandName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  legalNumber?: string;
  letterheadHeader: string;
  letterheadFooter: string;
  bankAccountInfo: string;
  paperSize: '58mm' | '80mm' | 'A4';
  autoPrintDO: boolean;
}
