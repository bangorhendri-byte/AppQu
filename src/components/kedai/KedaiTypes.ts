export type KedaiMenuTab = 
  | 'denah' 
  | 'kasir' 
  | 'menu' 
  | 'bahan' 
  | 'marketing' 
  | 'pelanggan' 
  | 'laporan' 
  | 'setting';

export type KasirSubTab = 'pos' | 'kds' | 'bill';

export type TableArea = 'Indoor AC' | 'Outdoor' | 'VIP Room' | 'Bar';
export type TableStatus = 'kosong' | 'terisi' | 'billing' | 'reservasi';

export interface OrderItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  qty: number;
  variant?: string;
  toppings?: string[];
  notes?: string;
  totalPrice: number;
}

export interface KedaiTable {
  id: string;
  name: string;
  area: TableArea;
  chairs: number;
  status: TableStatus;
  customerName?: string;
  pax?: number;
  orderTotal?: number;
  orderItems?: OrderItem[];
  occupiedSince?: string;
  x: number;
  y: number;
}

export interface MenuVariantOption {
  label: string;
  extraPrice: number;
}

export interface MenuVariantGroup {
  name: string;
  required?: boolean;
  options: MenuVariantOption[];
}

export interface MenuTopping {
  id: string;
  name: string;
  price: number;
}

export interface KedaiMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  imageIcon: string;
  stock: number;
  isPopular?: boolean;
  available: boolean;
  description?: string;
  variantGroups?: MenuVariantGroup[];
  toppings?: MenuTopping[];
  photoUrl?: string;
  showInOnlineStore?: boolean;
}

export interface KDSTicket {
  id: string;
  invoiceNumber: string;
  tableId?: string;
  tableName: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  orderTime: string;
  createdAtTimestamp: number;
  status: 'antri' | 'memasak' | 'siap' | 'selesai';
  waiterName?: string;
  items: {
    name: string;
    qty: number;
    notes?: string;
    variant?: string;
    toppings?: string[];
    isDone?: boolean;
  }[];
}

export interface KedaiOrder {
  id: string;
  invoiceNumber: string;
  tableId?: string;
  tableName?: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  tax: number;
  total: number;
  paymentMethod?: 'tunai' | 'qris' | 'transfer' | 'debit';
  amountPaid?: number;
  change?: number;
  status: 'unpaid' | 'paid' | 'cancelled';
  createdAt: string;
  cashierName?: string;
}

export interface KedaiIngredient {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  costPerUnit: number;
  supplier?: string;
  lastUpdated: string;
}

export interface KedaiShoppingRecord {
  id: string;
  date: string;
  ingredientName: string;
  qty: number;
  unit: string;
  totalCost: number;
  supplier: string;
  notes?: string;
}

export interface KedaiPromo {
  id: string;
  code: string;
  title: string;
  type: 'percent' | 'nominal';
  value: number;
  minOrder: number;
  validUntil: string;
  active: boolean;
  usedCount: number;
}

export interface KedaiCustomer {
  id: string;
  name: string;
  phone: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  points: number;
  totalVisits: number;
  totalSpent: number;
  notes?: string;
  lastVisit: string;
}

export interface KedaiDebt {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  date: string;
  amount: number;
  notes: string;
  status: 'belum_lunas' | 'lunas';
  settledAt?: string;
}

export interface KedaiExpense {
  id: string;
  date: string;
  category: 'Bahan Baku' | 'Operasional' | 'Listrik & Air' | 'Gaji & Upah' | 'Lain-lain';
  description: string;
  amount: number;
  recordedBy: string;
}

export interface KedaiStaff {
  id: string;
  name: string;
  role: 'Kasir' | 'Barista' | 'Koki' | 'Pelayan' | 'Manager';
  phone: string;
  pin: string;
  permissions: {
    canDiscount: boolean;
    canVoid: boolean;
    canOpenDrawer: boolean;
    canViewReport: boolean;
  };
  shift: string;
  active: boolean;
}

export interface KedaiSettings {
  storeName: string;
  slogan: string;
  address: string;
  phone: string;
  instagram: string;
  wifiName: string;
  wifiPassword: string;
  receiptFooter: string;
  printerType: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  printKitchenTicket: boolean;
  taxPercent: number;
}
