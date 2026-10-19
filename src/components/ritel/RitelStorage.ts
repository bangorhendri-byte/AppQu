/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  RitelProduct, 
  RitelTransaction, 
  HeldCart, 
  RitelSupplier, 
  RitelPurchaseOrder, 
  RitelPromo, 
  RitelCustomer, 
  StockOpnameSession, 
  DamagedGoodRecord, 
  RitelStoreProfile 
} from './RitelTypes';

export const RITEL_STORAGE_KEYS = {
  PRODUCTS: 'usahaku_data_ritel_products',
  TRANSACTIONS: 'usahaku_data_ritel_transactions',
  HELD_CARTS: 'usahaku_data_ritel_held_carts',
  SUPPLIERS: 'usahaku_data_ritel_suppliers',
  PURCHASES: 'usahaku_data_ritel_purchases',
  PROMOS: 'usahaku_data_ritel_promos',
  CUSTOMERS: 'usahaku_data_ritel_customers',
  OPNAMES: 'usahaku_data_ritel_opnames',
  DAMAGED: 'usahaku_data_ritel_damaged',
  PROFILE: 'usahaku_data_ritel_profile',
} as const;

export function getRitelStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
    return fallback;
  }
}

export function setRitelStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving storage key ${key}:`, e);
  }
}

// Initial Sample Data for Minimarket / Retail
export const DEFAULT_RITEL_PROFILE: RitelStoreProfile = {
  storeName: 'RitelQu Mart & Minimarket',
  slogan: 'Belanja Lengkap, Harga Hemat & Pelayanan Bersahabat',
  address: 'Jl. Raya Sudirman No. 88, Blok Niaga Kav. 3',
  phone: '0812-9876-5432',
  receiptHeader: 'Selamat Datang di RitelQu Mart\nKasir Cepat & Pembayaran Fleksibel',
  receiptFooter: 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.\nSimpan struk ini sebagai bukti pembayaran yang sah.\nTerima Kasih Atas Kunjungan Anda!',
  npwp: '09.123.456.7-890.000',
  paperSize: '58mm',
  autoPrint: true,
  scannerMode: 'usb_hid',
  pointMultiplier: 10000 // 1 poin tiap Rp 10.000
};

export const DEFAULT_RITEL_PRODUCTS: RitelProduct[] = [
  {
    id: 'prod-1',
    sku: '899999900101',
    name: 'Minyak Goreng Bimoli Spesial 2 Liter',
    category: 'Sembako',
    costPrice: 33500,
    sellPrice: 38500,
    wholesalePrice: 37000,
    wholesaleMinQty: 6,
    stock: 45,
    minStock: 12,
    unit: 'Pouch',
    shelfLocation: 'Rak Sembako A1',
    expiryDate: '2027-08-20',
    supplierId: 'sup-1',
    supplierName: 'PT Indomarco Adi Prima'
  },
  {
    id: 'prod-2',
    sku: '899234500102',
    name: 'Beras Ramos Super Pandan Wangi 5 Kg',
    category: 'Sembako',
    costPrice: 66000,
    sellPrice: 74500,
    wholesalePrice: 71500,
    wholesaleMinQty: 5,
    stock: 28,
    minStock: 8,
    unit: 'Sak',
    shelfLocation: 'Rak Beras B1',
    expiryDate: '2027-11-15',
    supplierId: 'sup-2',
    supplierName: 'Grosir Beras Jaya Mandiri'
  },
  {
    id: 'prod-3',
    sku: '899886611003',
    name: 'Indomie Goreng Original 85g',
    category: 'Makanan Instan',
    costPrice: 2800,
    sellPrice: 3500,
    wholesalePrice: 3100,
    wholesaleMinQty: 40,
    stock: 180,
    minStock: 50,
    unit: 'Bungkus',
    shelfLocation: 'Rak Mi Instan C1',
    expiryDate: '2027-06-30',
    supplierId: 'sup-1',
    supplierName: 'PT Indomarco Adi Prima'
  },
  {
    id: 'prod-4',
    sku: '899886611004',
    name: 'Indomie Kuah Soto Mie 70g',
    category: 'Makanan Instan',
    costPrice: 2750,
    sellPrice: 3500,
    wholesalePrice: 3050,
    wholesaleMinQty: 40,
    stock: 120,
    minStock: 40,
    unit: 'Bungkus',
    shelfLocation: 'Rak Mi Instan C1',
    expiryDate: '2027-06-25',
    supplierId: 'sup-1',
    supplierName: 'PT Indomarco Adi Prima'
  },
  {
    id: 'prod-5',
    sku: '899276100105',
    name: 'Teh Pucuk Harum Melati Botol 350ml',
    category: 'Minuman',
    costPrice: 3100,
    sellPrice: 4000,
    wholesalePrice: 3500,
    wholesaleMinQty: 24,
    stock: 64,
    minStock: 20,
    unit: 'Botol',
    shelfLocation: 'Chiller Minuman 1',
    expiryDate: '2027-04-10',
    supplierId: 'sup-3',
    supplierName: 'PT Mayora Indah Tbk'
  },
  {
    id: 'prod-6',
    sku: '899999900106',
    name: 'Aqua Air Mineral Botol 600ml',
    category: 'Minuman',
    costPrice: 2600,
    sellPrice: 3500,
    wholesalePrice: 3000,
    wholesaleMinQty: 24,
    stock: 92,
    minStock: 24,
    unit: 'Botol',
    shelfLocation: 'Chiller Minuman 2',
    expiryDate: '2028-01-10',
    supplierId: 'sup-4',
    supplierName: 'Distributor Tirta Investama'
  },
  {
    id: 'prod-7',
    sku: '8991002100107',
    name: 'Sunlight Pencuci Piring Jeruk Nipis 750ml',
    category: 'Pembersih Rumah',
    costPrice: 13500,
    sellPrice: 16500,
    wholesalePrice: 15200,
    wholesaleMinQty: 12,
    stock: 35,
    minStock: 10,
    unit: 'Pouch',
    shelfLocation: 'Rak Sabun & Pembersih D2',
    expiryDate: '2028-09-01',
    supplierId: 'sup-5',
    supplierName: 'Unilever Distributor Resmi'
  },
  {
    id: 'prod-8',
    sku: '899999900108',
    name: 'Sabun Mandi Lifebuoy Total 10 Batang 110g',
    category: 'Perawatan Tubuh',
    costPrice: 4200,
    sellPrice: 5500,
    wholesalePrice: 4800,
    wholesaleMinQty: 12,
    stock: 50,
    minStock: 15,
    unit: 'Batang',
    shelfLocation: 'Rak Toiletries D1',
    expiryDate: '2028-05-15',
    supplierId: 'sup-5',
    supplierName: 'Unilever Distributor Resmi'
  },
  {
    id: 'prod-9',
    sku: '899123400109',
    name: 'Gula Pasir Kristal Putih Gulaku 1 Kg',
    category: 'Sembako',
    costPrice: 15800,
    sellPrice: 18000,
    wholesalePrice: 17200,
    wholesaleMinQty: 10,
    stock: 14,
    minStock: 20, // Menipis alert
    unit: 'Kg',
    shelfLocation: 'Rak Sembako A2',
    expiryDate: '2027-10-30',
    supplierId: 'sup-2',
    supplierName: 'Grosir Beras Jaya Mandiri'
  },
  {
    id: 'prod-10',
    sku: '899345600110',
    name: 'Telur Ayam Negeri Segar 1 Kg',
    category: 'Sembako',
    costPrice: 26500,
    sellPrice: 29500,
    wholesalePrice: 28500,
    wholesaleMinQty: 5,
    stock: 6, // Alert menipis
    minStock: 15,
    unit: 'Kg',
    shelfLocation: 'Display Depan Telur',
    expiryDate: '2026-10-28',
    supplierId: 'sup-6',
    supplierName: 'Peternakan Unggas Berkah'
  },
  {
    id: 'prod-11',
    sku: '899789000111',
    name: 'Kopi Kapal Api Spesial Mix 1 Renteng (10 sachet)',
    category: 'Minuman',
    costPrice: 12500,
    sellPrice: 15500,
    wholesalePrice: 14000,
    wholesaleMinQty: 5,
    stock: 3, // Alert kritis
    minStock: 10,
    unit: 'Renteng',
    shelfLocation: 'Rak Kopi C2',
    expiryDate: '2027-12-10',
    supplierId: 'sup-7',
    supplierName: 'PT Santos Jaya Abadi'
  },
  {
    id: 'prod-12',
    sku: '899890100112',
    name: 'Chitato Sapi Panggang 68g',
    category: 'Makanan Instan',
    costPrice: 9200,
    sellPrice: 11500,
    wholesalePrice: 10500,
    wholesaleMinQty: 10,
    stock: 42,
    minStock: 12,
    unit: 'Bungkus',
    shelfLocation: 'Rak Snack B2',
    expiryDate: '2027-05-18',
    supplierId: 'sup-1',
    supplierName: 'PT Indomarco Adi Prima'
  }
];

export const DEFAULT_RITEL_SUPPLIERS: RitelSupplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-IDM',
    name: 'PT Indomarco Adi Prima',
    contactPerson: 'Bapak Hendra Setiawan',
    phone: '0813-8877-6655',
    address: 'Kawasan Industri Pulo Gadung Kav. 12, Jakarta Timur',
    paymentTermDays: 14,
    leadTimeDays: 2
  },
  {
    id: 'sup-2',
    code: 'SUP-BJM',
    name: 'Grosir Beras & Gula Jaya Mandiri',
    contactPerson: 'Haji Rahmat S.',
    phone: '0812-4455-8899',
    address: 'Pasar Induk Beras Cipinang Blok C No. 5',
    paymentTermDays: 7,
    leadTimeDays: 1
  },
  {
    id: 'sup-3',
    code: 'SUP-MYR',
    name: 'PT Mayora Indah Tbk Distro',
    contactPerson: 'Ibu Desi Natalia',
    phone: '0857-1122-3344',
    address: 'Jl. Daan Mogot KM 18, Kalideres',
    paymentTermDays: 30,
    leadTimeDays: 3
  },
  {
    id: 'sup-4',
    code: 'SUP-TRT',
    name: 'Distributor Tirta Investama (Aqua)',
    contactPerson: 'Bapak Agus Salim',
    phone: '0818-0909-1212',
    address: 'Jl. Pemuda No. 45, Rawamangun',
    paymentTermDays: 7,
    leadTimeDays: 1
  },
  {
    id: 'sup-5',
    code: 'SUP-ULV',
    name: 'Unilever Distributor Resmi',
    contactPerson: 'Ibu Maya Lestari',
    phone: '0811-2233-4455',
    address: 'BSD Industrial Park Blok B2',
    paymentTermDays: 14,
    leadTimeDays: 2
  },
  {
    id: 'sup-6',
    code: 'SUP-TLR',
    name: 'Peternakan Unggas Berkah',
    contactPerson: 'Kang Asep Sudrajat',
    phone: '0856-7890-1234',
    address: 'Kp. Pasir Angin No. 20, Parung',
    paymentTermDays: 0, // COD
    leadTimeDays: 1
  }
];

export const DEFAULT_RITEL_CUSTOMERS: RitelCustomer[] = [
  {
    id: 'cust-1',
    memberCode: 'RQ-MBR-001',
    name: 'Ibu Hj. Aminah',
    phone: '0812-1122-3344',
    address: 'Jl. Kenanga No. 12 RT 03/05 (Dekat Pos RW)',
    tier: 'Gold',
    points: 185,
    totalSpend: 1850000,
    debtBalance: 75000, // Ada Bon belum lunas
    joinDate: '2025-01-15'
  },
  {
    id: 'cust-2',
    memberCode: 'RQ-MBR-002',
    name: 'Pak RT Bambang Santoso',
    phone: '0813-9988-7766',
    address: 'Perumahan Graha Asri Blok C2/08',
    tier: 'Silver',
    points: 92,
    totalSpend: 920000,
    debtBalance: 0,
    joinDate: '2025-02-10'
  },
  {
    id: 'cust-3',
    memberCode: 'RQ-MBR-003',
    name: 'Warung Bu Dewi (Pelanggan Grosir)',
    phone: '0857-3344-5566',
    address: 'Jl. Mawar Raya No. 4',
    tier: 'VIP',
    points: 340,
    totalSpend: 4200000,
    debtBalance: 120000, // Ada Bon tempo
    joinDate: '2024-11-01'
  },
  {
    id: 'cust-4',
    memberCode: 'RQ-MBR-004',
    name: 'Sdr. Kevin Pradana',
    phone: '0878-1234-5678',
    address: 'Kost Graha Kostel Kamar 204',
    tier: 'Reguler',
    points: 24,
    totalSpend: 240000,
    debtBalance: 0,
    joinDate: '2026-03-01'
  }
];

export const DEFAULT_RITEL_PROMOS: RitelPromo[] = [
  {
    id: 'prm-1',
    code: 'DISKON10SEMB',
    title: 'Diskon 10% Sembako Murah',
    type: 'diskon_persen',
    value: 10,
    minSpend: 100000,
    validUntil: '2026-12-31',
    isActive: true,
    description: 'Potongan 10% untuk belanja sembako minimal Rp 100.000 khusus member terdaftar.'
  },
  {
    id: 'prm-2',
    code: 'BUNDLING-JUMAT',
    title: 'Bundling Jumat Berkah (Bimoli + Beras 5Kg)',
    type: 'bundling',
    value: 5000,
    minSpend: 110000,
    validUntil: '2026-11-30',
    isActive: true,
    description: 'Potongan langsung Rp 5.000 pembelian paket Minyak Bimoli 2L + Beras Ramos 5Kg.'
  },
  {
    id: 'prm-3',
    code: 'TEBUSMURAHMIE',
    title: 'Tebus Murah Indomie Rp 2.500',
    type: 'beli_gratis',
    value: 1000,
    minSpend: 50000,
    validUntil: '2026-10-31',
    isActive: true,
    description: 'Belanja apa saja min Rp 50.000 berhak tebus Indomie Goreng hanya Rp 2.500.'
  }
];

export const DEFAULT_RITEL_TRANSACTIONS: RitelTransaction[] = [
  {
    id: 'tx-1001',
    invoiceNumber: 'RQ-20261014-001',
    timestamp: Date.now() - 1000 * 60 * 180,
    date: '14 Okt 2026, 08:30 WIB',
    cashierName: 'Rina - Kasir 1',
    customerId: 'cust-1',
    customerName: 'Ibu Hj. Aminah',
    items: [
      {
        productId: 'prod-1',
        sku: '899999900101',
        name: 'Minyak Goreng Bimoli Spesial 2 Liter',
        unit: 'Pouch',
        costPrice: 33500,
        price: 38500,
        qty: 1,
        isWholesale: false,
        discount: 0,
        total: 38500
      },
      {
        productId: 'prod-3',
        sku: '899886611003',
        name: 'Indomie Goreng Original 85g',
        unit: 'Bungkus',
        costPrice: 2800,
        price: 3500,
        qty: 5,
        isWholesale: false,
        discount: 0,
        total: 17500
      }
    ],
    subtotal: 56000,
    discountTotal: 0,
    grandTotal: 56000,
    paymentMethod: 'tunai',
    cashPaid: 60000,
    cashChange: 4000,
    status: 'lunas',
    notes: 'Belanja pagi'
  },
  {
    id: 'tx-1002',
    invoiceNumber: 'RQ-20261014-002',
    timestamp: Date.now() - 1000 * 60 * 90,
    date: '14 Okt 2026, 10:15 WIB',
    cashierName: 'Rina - Kasir 1',
    customerId: 'cust-2',
    customerName: 'Pak RT Bambang Santoso',
    items: [
      {
        productId: 'prod-2',
        sku: '899234500102',
        name: 'Beras Ramos Super Pandan Wangi 5 Kg',
        unit: 'Sak',
        costPrice: 66000,
        price: 74500,
        qty: 1,
        isWholesale: false,
        discount: 0,
        total: 74500
      },
      {
        productId: 'prod-6',
        sku: '899999900106',
        name: 'Aqua Air Mineral Botol 600ml',
        unit: 'Botol',
        costPrice: 2600,
        price: 3500,
        qty: 2,
        isWholesale: false,
        discount: 0,
        total: 7000
      }
    ],
    subtotal: 81500,
    discountTotal: 0,
    grandTotal: 81500,
    paymentMethod: 'qris',
    cashPaid: 81500,
    cashChange: 0,
    status: 'lunas',
    notes: 'Bayar via QRIS BCA'
  },
  {
    id: 'tx-1003',
    invoiceNumber: 'RQ-20261014-003',
    timestamp: Date.now() - 1000 * 60 * 30,
    date: '14 Okt 2026, 11:20 WIB',
    cashierName: 'Rina - Kasir 1',
    customerId: 'cust-1',
    customerName: 'Ibu Hj. Aminah',
    items: [
      {
        productId: 'prod-9',
        sku: '899123400109',
        name: 'Gula Pasir Kristal Putih Gulaku 1 Kg',
        unit: 'Kg',
        costPrice: 15800,
        price: 18000,
        qty: 2,
        isWholesale: false,
        discount: 0,
        total: 36000
      },
      {
        productId: 'prod-10',
        sku: '899345600110',
        name: 'Telur Ayam Negeri Segar 1 Kg',
        unit: 'Kg',
        costPrice: 26500,
        price: 29500,
        qty: 1,
        isWholesale: false,
        discount: 0,
        total: 29500
      }
    ],
    subtotal: 65500,
    discountTotal: 0,
    grandTotal: 65500,
    paymentMethod: 'bon',
    cashPaid: 0,
    cashChange: 0,
    status: 'bon_piutang',
    notes: 'Bon belanja harian, janji bayar akhir pekan'
  }
];

export const DEFAULT_RITEL_PURCHASES: RitelPurchaseOrder[] = [
  {
    id: 'po-201',
    poNumber: 'PO-IDM-20261010-01',
    supplierId: 'sup-1',
    supplierName: 'PT Indomarco Adi Prima',
    date: '10 Okt 2026',
    dueDate: '24 Okt 2026',
    items: [
      {
        productId: 'prod-1',
        sku: '899999900101',
        name: 'Minyak Goreng Bimoli Spesial 2 Liter',
        qty: 24,
        unit: 'Pouch',
        costPrice: 33500,
        subtotal: 804000
      },
      {
        productId: 'prod-3',
        sku: '899886611003',
        name: 'Indomie Goreng Original 85g',
        qty: 120,
        unit: 'Bungkus',
        costPrice: 2800,
        subtotal: 336000
      }
    ],
    totalAmount: 1140000,
    paidAmount: 500000,
    status: 'tempo',
    notes: 'Faktur tempo 14 hari, sisa hutang Rp 640.000'
  },
  {
    id: 'po-202',
    poNumber: 'PO-TLR-20261012-02',
    supplierId: 'sup-6',
    supplierName: 'Peternakan Unggas Berkah',
    date: '12 Okt 2026',
    dueDate: '12 Okt 2026',
    items: [
      {
        productId: 'prod-10',
        sku: '899345600110',
        name: 'Telur Ayam Negeri Segar 1 Kg',
        qty: 25,
        unit: 'Kg',
        costPrice: 26500,
        subtotal: 662500
      }
    ],
    totalAmount: 662500,
    paidAmount: 662500,
    status: 'lunas',
    notes: 'Bayar Cash saat kirim (COD)'
  }
];

export const DEFAULT_RITEL_DAMAGED: DamagedGoodRecord[] = [
  {
    id: 'dmg-1',
    date: '13 Okt 2026',
    productId: 'prod-5',
    sku: '899276100105',
    name: 'Teh Pucuk Harum Melati Botol 350ml',
    qty: 2,
    unit: 'Botol',
    type: 'bocor',
    costPrice: 3100,
    reportedBy: 'Rina Kasir',
    action: 'retur_supplier',
    notes: 'Kardus tertimpa saat unloading pengiriman, tutup botol pecah'
  }
];

export const DEFAULT_RITEL_OPNAMES: StockOpnameSession[] = [
  {
    id: 'opn-1',
    opnameNumber: 'SO-202610-01',
    date: '12 Okt 2026',
    checkerName: 'Supervisor Anton',
    status: 'disesuaikan',
    totalDiffValue: -9300,
    notes: 'Opname rutin mingguan kategori Minuman & Sembako',
    items: [
      {
        productId: 'prod-6',
        sku: '899999900106',
        name: 'Aqua Air Mineral Botol 600ml',
        systemStock: 95,
        physicalStock: 92,
        difference: -3,
        costPrice: 2600,
        diffValue: -7800,
        reason: 'Kurang 3 botol, kemungkinan selisih hitung kasir'
      },
      {
        productId: 'prod-5',
        sku: '899276100105',
        name: 'Teh Pucuk Harum Melati Botol 350ml',
        systemStock: 65,
        physicalStock: 64,
        difference: -1,
        costPrice: 3100,
        diffValue: -3100,
        reason: 'Pecah saat display'
      }
    ]
  }
];
