/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RitelMenuTab = 
  | 'kasir'
  | 'stok'
  | 'supplier'
  | 'marketing'
  | 'pelanggan'
  | 'opname'
  | 'laporan'
  | 'setting';

export interface RitelProduct {
  id: string;
  sku: string; // Barcode / SKU
  name: string;
  category: string;
  costPrice: number; // Harga Beli / Pokok
  sellPrice: number; // Harga Jual Eceran
  wholesalePrice: number; // Harga Jual Grosir
  wholesaleMinQty: number; // Min pembelian grosir
  stock: number;
  minStock: number; // Batas minimum peringatan stok tipis
  unit: string; // Pcs, Pack, Box, Renteng, Botol, Kg
  shelfLocation: string; // Misal: Rak A1, Rak B2, Chiller 1, Display Depan
  expiryDate?: string;
  supplierId?: string;
  supplierName?: string;
  photoUrl?: string;
  showInOnlineStore?: boolean;
  description?: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  qty: number;
  isWholesale: boolean;
  discount: number; // rupiah discount
  total: number;
}

export interface HeldCart {
  id: string;
  label: string; // e.g. "Keranjang #1 - Ibu Siti"
  heldAt: string;
  timestamp: number;
  items: CartItem[];
  customerId?: string;
  customerName?: string;
  note?: string;
}

export interface RitelTransactionItem {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  costPrice: number;
  price: number;
  qty: number;
  isWholesale: boolean;
  discount: number;
  total: number;
}

export interface RitelTransaction {
  id: string;
  invoiceNumber: string; // RQ-20261014-001
  timestamp: number;
  date: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  items: RitelTransactionItem[];
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: 'tunai' | 'qris' | 'debit' | 'bon';
  cashPaid: number;
  cashChange: number;
  status: 'lunas' | 'bon_piutang';
  notes?: string;
}

export interface RitelSupplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  paymentTermDays: number; // 0 = COD, 7 = 7 hari, 14 = 14 hari, 30 = 30 hari
  leadTimeDays: number;
}

export interface RitelPurchaseItem {
  productId?: string;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  costPrice: number;
  sellPrice?: number;
  subtotal: number;
}

export interface RitelPurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate: string;
  items: RitelPurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'lunas' | 'tempo';
  notes?: string;
}

export interface RitelPromo {
  id: string;
  code: string;
  title: string;
  type: 'diskon_persen' | 'diskon_nominal' | 'bundling' | 'beli_gratis';
  value: number; // Persentase (e.g. 10%) atau nominal (e.g. 5000)
  minSpend: number;
  validUntil: string;
  isActive: boolean;
  description: string;
}

export interface RitelCustomer {
  id: string;
  memberCode: string; // RQ-MBR-001
  name: string;
  phone: string;
  address: string;
  tier: 'Reguler' | 'Silver' | 'Gold' | 'VIP';
  points: number;
  totalSpend: number;
  debtBalance: number; // Total Bon / Piutang Belum Lunas
  joinDate: string;
}

export interface RitelDebtPayment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amountPaid: number;
  remainingDebt: number;
  notes?: string;
}

export interface StockOpnameItem {
  productId: string;
  sku: string;
  name: string;
  systemStock: number;
  physicalStock: number;
  difference: number; // physical - system
  costPrice: number;
  diffValue: number; // difference * costPrice
  reason?: string;
}

export interface StockOpnameSession {
  id: string;
  opnameNumber: string;
  date: string;
  checkerName: string;
  status: 'draft' | 'disesuaikan';
  items: StockOpnameItem[];
  totalDiffValue: number;
  notes?: string;
}

export interface DamagedGoodRecord {
  id: string;
  date: string;
  productId: string;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  type: 'rusak' | 'expired' | 'bocor' | 'hilang';
  costPrice: number;
  reportedBy: string;
  action: 'retur_supplier' | 'pemusnahan' | 'koreksi_stok';
  notes: string;
}

export interface RitelStoreProfile {
  storeName: string;
  slogan: string;
  address: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  npwp?: string;
  paperSize: '58mm' | '80mm';
  autoPrint: boolean;
  scannerMode: 'usb_hid' | 'camera';
  pointMultiplier: number; // 1 poin per kelipatan Rp 10.000
}
