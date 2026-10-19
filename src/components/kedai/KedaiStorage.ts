import {
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
  KedaiSettings
} from './KedaiTypes';

export const STORAGE_KEYS = {
  TABLES: 'usahaku_data_kedai_tables',
  MENU: 'usahaku_data_kedai_menu',
  CATEGORIES: 'usahaku_data_kedai_categories',
  KDS: 'usahaku_data_kedai_kds',
  ORDERS: 'usahaku_data_kedai_orders',
  INGREDIENTS: 'usahaku_data_kedai_ingredients',
  SHOPPING: 'usahaku_data_kedai_shopping',
  PROMOS: 'usahaku_data_kedai_promos',
  CUSTOMERS: 'usahaku_data_kedai_customers',
  DEBTS: 'usahaku_data_kedai_debts',
  EXPENSES: 'usahaku_data_kedai_expenses',
  STAFF: 'usahaku_data_kedai_staff',
  SETTINGS: 'usahaku_data_kedai_settings',
} as const;

// Default initial seeds
export const DEFAULT_TABLES: KedaiTable[] = [
  {
    id: 'tbl-1',
    name: 'Meja 01',
    area: 'Indoor AC',
    chairs: 4,
    status: 'terisi',
    customerName: 'Mas Dimas',
    pax: 3,
    orderTotal: 68000,
    occupiedSince: '14:20',
    x: 40,
    y: 40,
    orderItems: [
      { id: 'oi-1', menuId: 'm-1', name: 'Kopi Susu Aren Spesial', price: 18000, qty: 2, variant: 'Normal Ice / Less Sugar', totalPrice: 36000 },
      { id: 'oi-2', menuId: 'm-11', name: 'French Fries Bolognese', price: 22000, qty: 1, notes: 'Saus dipisah', totalPrice: 22000 },
      { id: 'oi-3', menuId: 'm-6', name: 'Lemon Tea Segar', price: 10000, qty: 1, totalPrice: 10000 }
    ]
  },
  {
    id: 'tbl-2',
    name: 'Meja 02',
    area: 'Indoor AC',
    chairs: 2,
    status: 'kosong',
    x: 200,
    y: 40
  },
  {
    id: 'tbl-3',
    name: 'Meja 03',
    area: 'Indoor AC',
    chairs: 4,
    status: 'billing',
    customerName: 'Bu Sarah & Rekan',
    pax: 4,
    orderTotal: 114000,
    occupiedSince: '13:45',
    x: 40,
    y: 200,
    orderItems: [
      { id: 'oi-4', menuId: 'm-5', name: 'Matcha Latte Creamy', price: 22000, qty: 2, totalPrice: 44000 },
      { id: 'oi-5', menuId: 'm-8', name: 'Nasi Goreng Spesial Kedai', price: 28000, qty: 2, totalPrice: 56000 },
      { id: 'oi-6', menuId: 'm-12', name: 'Cireng Krispi Bumbu Rujak', price: 14000, qty: 1, totalPrice: 14000 }
    ]
  },
  {
    id: 'tbl-4',
    name: 'Meja 04',
    area: 'Outdoor',
    chairs: 6,
    status: 'kosong',
    x: 200,
    y: 200
  },
  {
    id: 'tbl-5',
    name: 'VIP 01',
    area: 'VIP Room',
    chairs: 10,
    status: 'reservasi',
    customerName: 'Bpk. Irfan (Meeting 16:30)',
    pax: 8,
    occupiedSince: '16:30',
    x: 40,
    y: 360
  },
  {
    id: 'tbl-6',
    name: 'Meja Bar 01',
    area: 'Bar',
    chairs: 2,
    status: 'kosong',
    x: 200,
    y: 360
  }
];

export const DEFAULT_CATEGORIES: string[] = [
  'Semua',
  'Kopi Espresso',
  'Non-Kopi',
  'Makanan Utama',
  'Snack & Camilan',
  'Dessert'
];

export const DEFAULT_MENU: KedaiMenuItem[] = [
  {
    id: 'm-1',
    name: 'Kopi Susu Aren Spesial',
    category: 'Kopi Espresso',
    price: 18000,
    costPrice: 7500,
    imageIcon: '☕',
    stock: 65,
    isPopular: true,
    available: true,
    description: 'Espresso double blend dengan susu fresh UHT dan sirup gula aren murni.',
    variantGroups: [
      {
        name: 'Suhu & Es',
        options: [
          { label: 'Dingin (Normal Ice)', extraPrice: 0 },
          { label: 'Dingin (Less Ice)', extraPrice: 0 },
          { label: 'Panas (Hot Cup)', extraPrice: 0 }
        ]
      },
      {
        name: 'Tingkat Manis',
        options: [
          { label: 'Normal Sweet (100%)', extraPrice: 0 },
          { label: 'Less Sugar (50%)', extraPrice: 0 },
          { label: 'No Sugar (0%)', extraPrice: 0 }
        ]
      }
    ],
    toppings: [
      { id: 'top-1', name: 'Extra Shot Espresso', price: 5000 },
      { id: 'top-2', name: 'Boba Brown Sugar', price: 4000 },
      { id: 'top-3', name: 'Jelly Karamel', price: 3000 }
    ]
  },
  {
    id: 'm-2',
    name: 'Caramel Macchiato Ice',
    category: 'Kopi Espresso',
    price: 24000,
    costPrice: 9000,
    imageIcon: '☕',
    stock: 40,
    isPopular: true,
    available: true,
    description: 'Paduan espresso, vanilla syrup, fresh milk berbusa lembut dengan saus caramel drizzle.',
    toppings: [
      { id: 'top-1', name: 'Extra Shot Espresso', price: 5000 }
    ]
  },
  {
    id: 'm-3',
    name: 'Americano Klasik',
    category: 'Kopi Espresso',
    price: 15000,
    costPrice: 4000,
    imageIcon: '☕',
    stock: 80,
    available: true,
    description: 'Espresso murni arabika dipadukan air mineral murni, pilihan dingin atau panas.'
  },
  {
    id: 'm-4',
    name: 'Creamy Avocado Coffee',
    category: 'Kopi Espresso',
    price: 26000,
    costPrice: 11000,
    imageIcon: '🥑',
    stock: 25,
    available: true,
    description: 'Jus alpukat mentega creamy dengan siraman espresso kental dan es krim coklat.'
  },
  {
    id: 'm-5',
    name: 'Matcha Latte Creamy',
    category: 'Non-Kopi',
    price: 22000,
    costPrice: 8500,
    imageIcon: '🍵',
    stock: 45,
    isPopular: true,
    available: true,
    description: 'Matcha Uji Jepang premium dipadu susu segar dan foam manis lembut.',
    toppings: [
      { id: 'top-2', name: 'Boba Brown Sugar', price: 4000 },
      { id: 'top-4', name: 'Keju Parut Creamy', price: 4000 }
    ]
  },
  {
    id: 'm-6',
    name: 'Lemon Tea Segar',
    category: 'Non-Kopi',
    price: 12000,
    costPrice: 3500,
    imageIcon: '🍹',
    stock: 90,
    available: true,
    description: 'Seduhan teh melati wangi dengan perasan sari lemon asli dan mint.'
  },
  {
    id: 'm-7',
    name: 'Coklat Belgia Melted',
    category: 'Non-Kopi',
    price: 20000,
    costPrice: 7000,
    imageIcon: '🍫',
    stock: 35,
    available: true,
    description: 'Coklat dark pekat dengan susu hangat/dingin gurih memanjakan.'
  },
  {
    id: 'm-8',
    name: 'Nasi Goreng Spesial Kedai',
    category: 'Makanan Utama',
    price: 28000,
    costPrice: 12000,
    imageIcon: '🍳',
    stock: 50,
    isPopular: true,
    available: true,
    description: 'Nasi goreng racikan bumbu khas kedai, telur mata sapi, ayam suwir, dan kerupuk udang.',
    variantGroups: [
      {
        name: 'Tingkat Pedas',
        options: [
          { label: 'Tidak Pedas', extraPrice: 0 },
          { label: 'Sedang (Pedas Gurih)', extraPrice: 0 },
          { label: 'Pedas Nendang', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'm-9',
    name: 'Mie Dok-Dok Nyemek',
    category: 'Makanan Utama',
    price: 22000,
    costPrice: 8000,
    imageIcon: '🍜',
    stock: 35,
    available: true,
    description: 'Mie kuah kental gurih pedas manis dengan kocokan telur, sawi hijau, dan sosis.'
  },
  {
    id: 'm-10',
    name: 'Ayam Geprek Sambal Korek',
    category: 'Makanan Utama',
    price: 25000,
    costPrice: 11000,
    imageIcon: '🍗',
    stock: 30,
    available: true,
    description: 'Ayam krispi gurih digeprek sambal bawang pedas segar + lalapan kol & timun.'
  },
  {
    id: 'm-11',
    name: 'French Fries Bolognese',
    category: 'Snack & Camilan',
    price: 22000,
    costPrice: 9000,
    imageIcon: '🍟',
    stock: 40,
    isPopular: true,
    available: true,
    description: 'Kentang goreng shoestring renyah dengan siraman saus daging bolognese & keju.'
  },
  {
    id: 'm-12',
    name: 'Cireng Krispi Bumbu Rujak',
    category: 'Snack & Camilan',
    price: 15000,
    costPrice: 5000,
    imageIcon: '🥟',
    stock: 45,
    available: true,
    description: 'Cireng renyah di luar kenyal di dalam disajikan dengan sambal rujak asam manis pedas.'
  },
  {
    id: 'm-13',
    name: 'Roti Bakar Coklat Keju Susu',
    category: 'Dessert',
    price: 18000,
    costPrice: 6500,
    imageIcon: '🍞',
    stock: 30,
    available: true,
    description: 'Roti tebal panggang butter wangi bertabur meses coklat, keju cheddar gurih dan susu kental manis.'
  }
];

export const DEFAULT_KDS: KDSTicket[] = [
  {
    id: 'kds-101',
    invoiceNumber: 'INV-2610-001',
    tableId: 'tbl-1',
    tableName: 'Meja 01',
    orderType: 'dine_in',
    orderTime: '14:22',
    createdAtTimestamp: Date.now() - 12 * 60 * 1000,
    status: 'memasak',
    waiterName: 'Agus',
    items: [
      { name: 'Kopi Susu Aren Spesial', qty: 2, variant: 'Normal Ice / Less Sugar', isDone: true },
      { name: 'French Fries Bolognese', qty: 1, notes: 'Saus sambal dipisah', isDone: false },
      { name: 'Lemon Tea Segar', qty: 1, isDone: false }
    ]
  },
  {
    id: 'kds-102',
    invoiceNumber: 'INV-2610-002',
    tableName: 'Take Away #04',
    orderType: 'take_away',
    orderTime: '14:30',
    createdAtTimestamp: Date.now() - 4 * 60 * 1000,
    status: 'antri',
    waiterName: 'Siti',
    items: [
      { name: 'Caramel Macchiato Ice', qty: 1, notes: 'Paper bag + sedotan', isDone: false },
      { name: 'Roti Bakar Coklat Keju Susu', qty: 1, notes: 'Kotak takeaway', isDone: false }
    ]
  }
];

export const DEFAULT_INGREDIENTS: KedaiIngredient[] = [
  { id: 'ing-1', name: 'Biji Kopi Arabika House Blend', category: 'Kopi', stock: 11.5, unit: 'Kg', minStock: 3.0, costPerUnit: 140000, supplier: 'Roastery Nusantara', lastUpdated: '2026-10-14' },
  { id: 'ing-2', name: 'Susu UHT Fresh Full Cream', category: 'Dairy', stock: 18, unit: 'Liter', minStock: 8, costPerUnit: 19500, supplier: 'Distributor Susu Segar', lastUpdated: '2026-10-14' },
  { id: 'ing-3', name: 'Sirup Gula Aren Asli', category: 'Sirup', stock: 6.0, unit: 'Liter', minStock: 2.0, costPerUnit: 35000, supplier: 'Gula Aren Organik', lastUpdated: '2026-10-13' },
  { id: 'ing-4', name: 'Cup Sablon 16oz + Tutup Dome', category: 'Kemasan', stock: 45, unit: 'Pcs', minStock: 100, costPerUnit: 850, supplier: 'Plastik Packaging', lastUpdated: '2026-10-14' }, // LOW STOCK!
  { id: 'ing-5', name: 'Beras Ramos Super', category: 'Dapur', stock: 35, unit: 'Kg', minStock: 15, costPerUnit: 14500, supplier: 'Toko Beras Barokah', lastUpdated: '2026-10-12' },
  { id: 'ing-6', name: 'Daging Ayam Fillet', category: 'Dapur', stock: 2.5, unit: 'Kg', minStock: 5.0, costPerUnit: 48000, supplier: 'Pasar Induk', lastUpdated: '2026-10-14' }, // LOW STOCK!
  { id: 'ing-7', name: 'Sedotan Steril Kertas', category: 'Kemasan', stock: 120, unit: 'Pcs', minStock: 50, costPerUnit: 150, supplier: 'Plastik Packaging', lastUpdated: '2026-10-14' }
];

export const DEFAULT_SHOPPING: KedaiShoppingRecord[] = [
  { id: 'shop-1', date: '2026-10-14', ingredientName: 'Susu UHT Fresh Full Cream', qty: 24, unit: 'Liter', totalCost: 468000, supplier: 'Distributor Susu Segar', notes: 'Restock mingguan' },
  { id: 'shop-2', date: '2026-10-13', ingredientName: 'Sirup Gula Aren Asli', qty: 10, unit: 'Liter', totalCost: 350000, supplier: 'Gula Aren Organik', notes: 'Gula aren murni nira' },
  { id: 'shop-3', date: '2026-10-12', ingredientName: 'Biji Kopi Arabika House Blend', qty: 15, unit: 'Kg', totalCost: 2100000, supplier: 'Roastery Nusantara', notes: 'Medium roast' }
];

export const DEFAULT_PROMOS: KedaiPromo[] = [
  { id: 'prm-1', code: 'JUMATBERKAH', title: 'Jumat Berkah Diskon 15%', type: 'percent', value: 15, minOrder: 50000, validUntil: '2026-12-31', active: true, usedCount: 42 },
  { id: 'prm-2', code: 'NGOPIHEMAT', title: 'Potongan Langsung Rp 5.000', type: 'nominal', value: 5000, minOrder: 30000, validUntil: '2026-12-31', active: true, usedCount: 78 },
  { id: 'prm-3', code: 'MEMBERVIP', title: 'Promo Khusus Member Gold 20%', type: 'percent', value: 20, minOrder: 75000, validUntil: '2026-12-31', active: true, usedCount: 19 }
];

export const DEFAULT_CUSTOMERS: KedaiCustomer[] = [
  { id: 'cst-1', name: 'Dimas Wicaksono', phone: '081234567891', tier: 'Gold', points: 34, totalVisits: 14, totalSpent: 620000, notes: 'Suka Kopi Susu Less Sugar', lastVisit: 'Hari ini' },
  { id: 'cst-2', name: 'Sarah Amanda', phone: '081398765432', tier: 'Platinum', points: 85, totalVisits: 28, totalSpent: 1450000, notes: 'Pelanggan tetap komunitas buku', lastVisit: 'Hari ini' },
  { id: 'cst-3', name: 'dr. Hendra Pratama', phone: '085712345678', tier: 'Silver', points: 15, totalVisits: 6, totalSpent: 280000, notes: 'Sering pesan takeaway pagi', lastVisit: 'Kemarin' },
  { id: 'cst-4', name: 'Bpk. Irfan Maulana', phone: '082198761234', tier: 'Gold', points: 48, totalVisits: 19, totalSpent: 890000, notes: 'Suka booking VIP room rapat', lastVisit: '2 hari lalu' }
];

export const DEFAULT_DEBTS: KedaiDebt[] = [
  { id: 'dbt-1', customerName: 'Kantor Notaris Sebelah (Pak Agus)', phone: '081299887766', date: '2026-10-12', amount: 165000, notes: 'Pesanan snack meeting & 6 kopi susu', status: 'belum_lunas' },
  { id: 'dbt-2', customerName: 'Klinik SMB Sebelah (dr. Ryan)', phone: '081388776655', date: '2026-10-13', amount: 84000, notes: 'Makan siang 3 porsi mie dok-dok', status: 'belum_lunas' },
  { id: 'dbt-3', customerName: 'Ferry Bengkel Sebelah', phone: '085611223344', date: '2026-10-10', amount: 45000, notes: 'Kopi & ropang sore', status: 'lunas', settledAt: '2026-10-11' }
];

export const DEFAULT_EXPENSES: KedaiExpense[] = [
  { id: 'exp-1', date: '2026-10-14', category: 'Operasional', description: 'Beli Es Batu Kristal 4 Bal', amount: 40000, recordedBy: 'Dian Permana' },
  { id: 'exp-2', date: '2026-10-14', category: 'Bahan Baku', description: 'Belanja sayur & bumbu dapur pasar', amount: 125000, recordedBy: 'Chef Junaidi' },
  { id: 'exp-3', date: '2026-10-13', category: 'Operasional', description: 'Gas LPG 3Kg (2 Tabung)', amount: 46000, recordedBy: 'Agus' },
  { id: 'exp-4', date: '2026-10-10', category: 'Listrik & Air', description: 'Token Listrik PLN Kedai', amount: 300000, recordedBy: 'Manager Budi' }
];

export const DEFAULT_STAFF: KedaiStaff[] = [
  { id: 'stf-1', name: 'Budi Santoso', role: 'Manager', phone: '081234567890', pin: '1234', permissions: { canDiscount: true, canVoid: true, canOpenDrawer: true, canViewReport: true }, shift: 'Pagi - Siang', active: true },
  { id: 'stf-2', name: 'Dian Permana', role: 'Barista', phone: '081398765432', pin: '2345', permissions: { canDiscount: false, canVoid: false, canOpenDrawer: true, canViewReport: false }, shift: 'Pagi (08:00 - 16:00)', active: true },
  { id: 'stf-3', name: 'Chef Junaidi', role: 'Koki', phone: '085712345678', pin: '3456', permissions: { canDiscount: false, canVoid: false, canOpenDrawer: false, canViewReport: false }, shift: 'Sore (15:00 - 23:00)', active: true },
  { id: 'stf-4', name: 'Agus Prasetyo', role: 'Pelayan', phone: '082198761234', pin: '4567', permissions: { canDiscount: false, canVoid: false, canOpenDrawer: false, canViewReport: false }, shift: 'Pagi (08:00 - 16:00)', active: true },
  { id: 'stf-5', name: 'Siti Rahmawati', role: 'Kasir', phone: '087812349876', pin: '5678', permissions: { canDiscount: true, canVoid: false, canOpenDrawer: true, canViewReport: false }, shift: 'Full Day', active: true }
];

export const DEFAULT_SETTINGS: KedaiSettings = {
  storeName: 'KedaiQu Kopi & Resto',
  slogan: 'Nongkrong Santai, Rasa Premium',
  address: 'Jl. Merdeka No. 45, Sentra Kuliner Berkah',
  phone: '0812-3456-7890',
  instagram: '@kedaiqu.official',
  wifiName: 'KedaiQu_FreeWifi',
  wifiPassword: 'kopienakbanget',
  receiptFooter: 'Terima kasih atas kunjungannya!\nWiFi: KedaiQu_FreeWifi / Pass: kopienakbanget\nFollow Instagram: @kedaiqu.official',
  printerType: '58mm',
  autoPrintReceipt: true,
  printKitchenTicket: true,
  taxPercent: 0
};

// Generic storage helper
export function getKedaiStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to load kedai storage key: ${key}`, e);
    return defaultValue;
  }
}

export function setKedaiStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save kedai storage key: ${key}`, e);
  }
}

// Backup all KedaiQu data
export function exportKedaiData(): string {
  const backup: Record<string, unknown> = {};
  for (const [_, val] of Object.entries(STORAGE_KEYS)) {
    const raw = localStorage.getItem(val);
    if (raw) {
      try {
        backup[val] = JSON.parse(raw);
      } catch {
        backup[val] = raw;
      }
    }
  }
  return JSON.stringify(backup, null, 2);
}

// Restore KedaiQu data
export function importKedaiData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    for (const [key, val] of Object.entries(parsed)) {
      if (key.startsWith('usahaku_data_kedai_')) {
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to import KedaiQu data:', e);
    return false;
  }
}
