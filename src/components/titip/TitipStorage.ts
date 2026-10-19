/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
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

export const TITIP_STORAGE_KEYS = {
  MATERIALS: 'usahaku_data_titip_materials',
  RECIPES: 'usahaku_data_titip_recipes',
  BATCHES: 'usahaku_data_titip_batches',
  EMPLOYEES: 'usahaku_data_titip_employees',
  OUTPUTS: 'usahaku_data_titip_outputs',
  PAYROLLS: 'usahaku_data_titip_payrolls',
  STORES: 'usahaku_data_titip_stores',
  RESELLERS: 'usahaku_data_titip_resellers',
  CONTRACTS: 'usahaku_data_titip_contracts',
  SALES: 'usahaku_data_titip_sales',
  DELIVERIES: 'usahaku_data_titip_deliveries',
  RETURNS: 'usahaku_data_titip_returns',
  PAYOUTS: 'usahaku_data_titip_payouts',
  PROMOS: 'usahaku_data_titip_promos',
  PROFILE: 'usahaku_data_titip_profile',
} as const;

export function getTitipStorage<T>(key: string, fallback: T): T {
  try {
    let raw = localStorage.getItem(key);
    // Backward compatibility with legacy storage keys (collab / titipqu)
    if (!raw) {
      const altKey1 = key.replace('_titip_', '_titipqu_');
      const altKey2 = key.replace('_titip_', '_collab_');
      raw = localStorage.getItem(altKey1) || localStorage.getItem(altKey2);
      if (raw) {
        // Automatically migrate to new key
        localStorage.setItem(key, raw);
      }
    }
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading titip storage ${key}:`, e);
    return fallback;
  }
}

export function setTitipStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving titip storage ${key}:`, e);
  }
}

export const DEFAULT_TITIP_PROFILE: TitipStoreProfile = {
  brandName: 'Dapur Titip Qu Nusantara',
  tagline: 'Pusat Produksi Camilan & Kemitraan Konsinyasi UMKM',
  ownerName: 'Hendra & Tim Produsen',
  phone: '0812-3344-5566',
  address: 'Kawasan Sentra Kuliner UMKM No. 24, Yogyakarta',
  legalNumber: 'NIB: 9120001234567 | P-IRT No: 2063273010998',
  letterheadHeader: 'DAPUR TITIP QU NUSANTARA - SURAT JALAN & KONSINYASI\nSentra Produksi Oleh-Oleh & Kerjasama Reseller Indonesia',
  letterheadFooter: 'Barang titipan konsinyasi tercatat sah berdasarkan tanda tangan penerima di atas surat jalan.\nRekap penjualan & bagi hasil dilakukan secara berkala sesuai akad.',
  bankAccountInfo: 'BCA 8090123456 a.n Dapur Titip Qu Nusantara',
  paperSize: 'A4',
  autoPrintDO: true
};

export const DEFAULT_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'mat-1',
    code: 'BAHAN-01',
    name: 'Singkong Mentega Pilihan',
    category: 'Bahan Pokok',
    unit: 'kg',
    costPerUnit: 4500,
    stock: 120,
    minStock: 30,
    supplierName: 'Petani Singkong Gunungkidul'
  },
  {
    id: 'mat-2',
    code: 'BAHAN-02',
    name: 'Minyak Goreng Nabati Curah 1st Grade',
    category: 'Minyak & Lemak',
    unit: 'liter',
    costPerUnit: 15500,
    stock: 65,
    minStock: 20,
    supplierName: 'Distributor Minyak Berkah'
  },
  {
    id: 'mat-3',
    code: 'BAHAN-03',
    name: 'Bumbu Bubuk Balado Pedas Manis',
    category: 'Bumbu & Perisa',
    unit: 'kg',
    costPerUnit: 42000,
    stock: 18,
    minStock: 5,
    supplierName: 'Sentra Rempah Jaya'
  },
  {
    id: 'mat-4',
    code: 'BAHAN-04',
    name: 'Standing Pouch Alumunium Foil + Zipper 200g',
    category: 'Packaging',
    unit: 'pcs',
    costPerUnit: 1200,
    stock: 450,
    minStock: 100,
    supplierName: 'Pabrik Kemasan Bandung'
  },
  {
    id: 'mat-5',
    code: 'BAHAN-05',
    name: 'Stiker Label Matte Full Color 7x10 cm',
    category: 'Packaging',
    unit: 'lembar',
    costPerUnit: 450,
    stock: 600,
    minStock: 150,
    supplierName: 'Percetakan Offset Grafika'
  }
];

export const DEFAULT_PRODUCT_RECIPES: ProductRecipe[] = [
  {
    id: 'rec-1',
    sku: 'TQ-KRP-BALADO',
    name: 'Keripik Singkong Balado Renyah 200g',
    category: 'Camilan Gurih',
    unit: 'Pouch',
    rawMaterials: [
      { materialId: 'mat-1', materialName: 'Singkong Mentega', qty: 0.4, unit: 'kg', unitCost: 4500, subtotal: 1800 },
      { materialId: 'mat-2', materialName: 'Minyak Goreng', qty: 0.1, unit: 'liter', unitCost: 15500, subtotal: 1550 },
      { materialId: 'mat-3', materialName: 'Bumbu Balado', qty: 0.03, unit: 'kg', unitCost: 42000, subtotal: 1260 },
      { materialId: 'mat-4', materialName: 'Standing Pouch', qty: 1, unit: 'pcs', unitCost: 1200, subtotal: 1200 },
      { materialId: 'mat-5', materialName: 'Stiker Label', qty: 1, unit: 'lembar', unitCost: 450, subtotal: 450 }
    ],
    materialsCost: 6260,
    laborCostPerPcs: 1500, // Upah pengerjaan borongan
    overheadCostPerPcs: 800, // Gas, listrik & seal
    hppPerPcs: 8560,
    sellingPriceRetail: 18000, // Margin direct 110%
    consignmentPrice: 15000, // Harga patokan ke toko titipan (toko jual 18k, komisi toko 3k)
    resellerPrice: 12500, // Harga grosir reseller (margin produsen 46%)
    currentStock: 85,
    notes: 'Produk unggulan fast moving di 6 toko oleh-oleh'
  },
  {
    id: 'rec-2',
    sku: 'TQ-BASO-GORENG',
    name: 'Basreng Pedas Daun Jeruk 150g',
    category: 'Camilan Pedas',
    unit: 'Pouch',
    rawMaterials: [
      { materialId: 'mat-4', materialName: 'Standing Pouch', qty: 1, unit: 'pcs', unitCost: 1200, subtotal: 1200 },
      { materialId: 'mat-5', materialName: 'Stiker Label', qty: 1, unit: 'lembar', unitCost: 450, subtotal: 450 }
    ],
    materialsCost: 5800,
    laborCostPerPcs: 1200,
    overheadCostPerPcs: 600,
    hppPerPcs: 7600,
    sellingPriceRetail: 16000,
    consignmentPrice: 13500,
    resellerPrice: 11000,
    currentStock: 64,
    notes: 'Favorit reseller online anak muda'
  },
  {
    id: 'rec-3',
    sku: 'TQ-MAKARONI-LVL',
    name: 'Makaroni Panggang Keju Crispy 180g',
    category: 'Camilan Gurih',
    unit: 'Pouch',
    rawMaterials: [
      { materialId: 'mat-4', materialName: 'Standing Pouch', qty: 1, unit: 'pcs', unitCost: 1200, subtotal: 1200 }
    ],
    materialsCost: 5100,
    laborCostPerPcs: 1000,
    overheadCostPerPcs: 600,
    hppPerPcs: 6700,
    sellingPriceRetail: 15000,
    consignmentPrice: 12500,
    resellerPrice: 10000,
    currentStock: 50,
    notes: 'Sangat disukai anak sekolah dan kafe'
  }
];

export const DEFAULT_PRODUCTION_BATCHES: ProductionBatch[] = [
  {
    id: 'bth-1',
    batchNumber: 'BTH-202610-01',
    recipeId: 'rec-1',
    productName: 'Keripik Singkong Balado Renyah 200g',
    targetQty: 100,
    actualQty: 100,
    startDate: '12 Okt 2026',
    status: 'selesai',
    totalHpp: 856000,
    operatorName: 'Siti Rahma (Tim Masak)',
    notes: 'Hasil renyah sempurna, selesai tepat waktu'
  },
  {
    id: 'bth-2',
    batchNumber: 'BTH-202610-02',
    recipeId: 'rec-2',
    productName: 'Basreng Pedas Daun Jeruk 150g',
    targetQty: 80,
    actualQty: 78,
    startDate: '14 Okt 2026',
    status: 'proses',
    totalHpp: 592800,
    operatorName: 'Agus Santoso',
    notes: 'Sedang tahap bumbu dan packaging'
  }
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    code: 'EMP-01',
    name: 'Siti Rahmawati',
    role: 'Produksi',
    wageType: 'borongan',
    ratePerUnit: 1500, // Rp 1.500 per bungkus jadi
    dailyRate: 0,
    monthlyRate: 0,
    phone: '0812-9988-7711',
    status: 'aktif',
    joinDate: '2025-01-10'
  },
  {
    id: 'emp-2',
    code: 'EMP-02',
    name: 'Agus Santoso',
    role: 'Finishing',
    wageType: 'borongan',
    ratePerUnit: 1200,
    dailyRate: 0,
    monthlyRate: 0,
    phone: '0857-4433-2211',
    status: 'aktif',
    joinDate: '2025-02-15'
  },
  {
    id: 'emp-3',
    code: 'EMP-03',
    name: 'Dewi Lestari',
    role: 'Packaging',
    wageType: 'harian',
    ratePerUnit: 0,
    dailyRate: 85000,
    monthlyRate: 0,
    phone: '0878-1122-3344',
    status: 'aktif',
    joinDate: '2025-04-01'
  },
  {
    id: 'emp-4',
    code: 'EMP-04',
    name: 'Budi Kurir',
    role: 'Admin & Kurir',
    wageType: 'bulanan',
    ratePerUnit: 0,
    dailyRate: 0,
    monthlyRate: 2500000,
    phone: '0813-5566-7788',
    status: 'aktif',
    joinDate: '2024-11-01'
  }
];

export const DEFAULT_OUTPUT_LOGS: DailyOutputLog[] = [
  {
    id: 'out-1',
    date: '14 Okt 2026',
    employeeId: 'emp-1',
    employeeName: 'Siti Rahmawati',
    recipeId: 'rec-1',
    productName: 'Keripik Singkong Balado Renyah',
    outputQty: 60,
    wageEarned: 90000, // 60 x 1500
    status: 'pending'
  },
  {
    id: 'out-2',
    date: '14 Okt 2026',
    employeeId: 'emp-2',
    employeeName: 'Agus Santoso',
    recipeId: 'rec-2',
    productName: 'Basreng Pedas Daun Jeruk',
    outputQty: 50,
    wageEarned: 60000, // 50 x 1200
    status: 'pending'
  }
];

export const DEFAULT_CONSIGNMENT_STORES: ConsignmentStore[] = [
  {
    id: 'store-1',
    code: 'TKO-01',
    name: 'Toko Oleh-Oleh Malioboro Indah',
    picName: 'Ibu Ratna',
    phone: '0812-3456-7890',
    address: 'Jl. Malioboro No. 45, Yogyakarta',
    commissionPercent: 20, // 20% bagi hasil toko
    totalStockDeposited: 120,
    totalSoldQty: 95,
    currentBalanceDue: 1368000, // Saldo penjualan belum ditransfer toko ke produsen
    contractValidUntil: '2027-12-31',
    status: 'aktif',
    notes: 'Toko ramai turis, perputaran cepat tiap weekend'
  },
  {
    id: 'store-2',
    code: 'TKO-02',
    name: 'Rest Area KM 429 Cafe & Gallery',
    picName: 'Pak Joko M.',
    phone: '0813-8899-0011',
    address: 'Rest Area Tol Ungaran KM 429 Jalur A',
    commissionPercent: 15,
    totalStockDeposited: 80,
    totalSoldQty: 60,
    currentBalanceDue: 918000,
    contractValidUntil: '2027-08-31',
    status: 'aktif',
    notes: 'Konsinyasi camilan perjalanan luar kota'
  },
  {
    id: 'store-3',
    code: 'TKO-03',
    name: 'Kantin Koperasi Pegawai RSUD',
    picName: 'Ibu Heni',
    phone: '0857-1234-9988',
    address: 'Gedung Koperasi RSUD Lantai 1',
    commissionPercent: 15,
    totalStockDeposited: 50,
    totalSoldQty: 35,
    currentBalanceDue: 535500,
    contractValidUntil: '2027-06-30',
    status: 'aktif',
    notes: 'Pencairan tempo per tanggal 1 setiap bulan'
  }
];

export const DEFAULT_RESELLERS: ResellerPartner[] = [
  {
    id: 'res-1',
    code: 'RSL-01',
    name: 'Kak Rere Snack Online',
    phone: '0819-0909-8877',
    address: 'Solo Baru, Sukoharjo (Live Shopee & TikTok)',
    tier: 'Platinum',
    discountPercent: 20,
    minOrderQty: 30,
    totalOrdersCount: 14,
    totalSpent: 4250000,
    joinDate: '2025-03-01',
    status: 'aktif'
  },
  {
    id: 'res-2',
    code: 'RSL-02',
    name: 'Warung Bu Endang',
    phone: '0821-3322-1100',
    address: 'Perumahan Sendangmulyo Blok C4',
    tier: 'Gold',
    discountPercent: 15,
    minOrderQty: 15,
    totalOrdersCount: 8,
    totalSpent: 1850000,
    joinDate: '2025-05-10',
    status: 'aktif'
  },
  {
    id: 'res-3',
    code: 'RSL-03',
    name: 'Dimas Kuliner Nusantara',
    phone: '0877-6655-4433',
    address: 'Jl. Kaliurang KM 9, Sleman',
    tier: 'Silver',
    discountPercent: 10,
    minOrderQty: 10,
    totalOrdersCount: 4,
    totalSpent: 850000,
    joinDate: '2026-01-15',
    status: 'aktif'
  }
];

export const DEFAULT_CONTRACTS: PartnershipContract[] = [
  {
    id: 'cnt-1',
    contractNo: 'AKAD-KONSIN-2026-001',
    partnerType: 'toko_titip',
    partnerName: 'Toko Oleh-Oleh Malioboro Indah',
    startDate: '01 Jan 2026',
    endDate: '31 Des 2026',
    profitTerms: 'Sistem Konsinyasi Murni: Komisi toko 20% dari harga retail Rp 18.000. Hak bersih produsen Rp 14.400.',
    returnPolicy: 'Barang tidak laku dapat diretur atau diganti batch baru maksimal 14 hari sebelum masa kadaluwarsa.',
    status: 'aktif'
  },
  {
    id: 'cnt-2',
    contractNo: 'AKAD-RESELLER-2026-002',
    partnerType: 'reseller',
    partnerName: 'Kak Rere Snack Online',
    startDate: '01 Mar 2026',
    endDate: '01 Mar 2027',
    profitTerms: 'Harga tier Platinum: Diskon 20% dari HET resmi dengan minimal order 30 pcs per transaksi.',
    returnPolicy: 'Garansi kemasan bocor saat pengiriman diganti 100% oleh produsen.',
    status: 'aktif'
  }
];

export const DEFAULT_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'do-1',
    doNumber: 'SJ-20261012-01',
    date: '12 Okt 2026',
    partnerType: 'toko_titip',
    partnerId: 'store-1',
    partnerName: 'Toko Oleh-Oleh Malioboro Indah',
    address: 'Jl. Malioboro No. 45, Yogyakarta',
    driverName: 'Budi Santoso',
    vehicleNo: 'AB 4521 XY',
    totalQty: 50,
    status: 'selesai',
    notes: 'Kirim restock weekend, barang diterima dalam kondisi baik',
    items: [
      { recipeId: 'rec-1', productName: 'Keripik Singkong Balado Renyah 200g', qty: 30, unitPrice: 15000, total: 450000 },
      { recipeId: 'rec-2', productName: 'Basreng Pedas Daun Jeruk 150g', qty: 20, unitPrice: 13500, total: 270000 }
    ]
  }
];

export const DEFAULT_SALES: SalesTransaction[] = [
  {
    id: 'sls-1',
    invoiceNumber: 'INV-DIR-20261014-01',
    date: '14 Okt 2026, 09:30 WIB',
    timestamp: Date.now() - 1000 * 60 * 120,
    channel: 'direct_pos',
    partnerOrCustomerName: 'Pelanggan Galeri Pusat (Ibu Tina)',
    items: [
      { recipeId: 'rec-1', productName: 'Keripik Singkong Balado Renyah 200g', qty: 3, unitPrice: 18000, hpp: 8560, total: 54000 },
      { recipeId: 'rec-2', productName: 'Basreng Pedas Daun Jeruk 150g', qty: 2, unitPrice: 16000, hpp: 7600, total: 32000 }
    ],
    subtotal: 86000,
    discount: 0,
    grandTotal: 86000,
    paymentMethod: 'tunai',
    status: 'lunas',
    notes: 'Belanja langsung di galeri'
  },
  {
    id: 'sls-2',
    invoiceNumber: 'INV-RSL-20261013-02',
    date: '13 Okt 2026, 14:15 WIB',
    timestamp: Date.now() - 1000 * 60 * 1400,
    channel: 'reseller',
    partnerOrCustomerName: 'Kak Rere Snack Online (Reseller Platinum)',
    items: [
      { recipeId: 'rec-1', productName: 'Keripik Singkong Balado Renyah 200g', qty: 30, unitPrice: 12500, hpp: 8560, total: 375000 }
    ],
    subtotal: 375000,
    discount: 0,
    grandTotal: 375000,
    paymentMethod: 'transfer',
    status: 'lunas',
    notes: 'Pengiriman via ekspedisi kargo'
  }
];

export const DEFAULT_PAYOUTS: PayoutRecord[] = [
  {
    id: 'pay-1',
    payoutNumber: 'PO-TKO-20261005-01',
    date: '05 Okt 2026',
    storeId: 'store-1',
    storeName: 'Toko Oleh-Oleh Malioboro Indah',
    periodSales: 1800000, // Total omzet laku di toko
    commissionPercent: 20,
    commissionEarned: 360000, // Hak toko
    netDisbursedToProducer: 1440000, // Produsen terima
    bankAccount: 'BCA 8090123456 a.n Dapur Titip Qu',
    status: 'lunas',
    notes: 'Bagi hasil penjualan titipan periode akhir September'
  }
];

export const DEFAULT_CATALOG_ASSETS: ResellerCatalogAsset[] = [
  {
    id: 'ast-1',
    title: 'Keripik Singkong Balado 200g (Best Seller)',
    category: 'Camilan Gurih',
    wholesalePrice: 12500,
    suggestedRetailPrice: 18000,
    marginBenefit: 5500,
    tagline: 'Renyah renyah pedas manis nagih! Margin keuntungan hingga 44% per pouch.'
  },
  {
    id: 'ast-2',
    title: 'Basreng Pedas Daun Jeruk 150g',
    category: 'Camilan Pedas',
    wholesalePrice: 11000,
    suggestedRetailPrice: 16000,
    marginBenefit: 5000,
    tagline: 'Aroma daun jeruk sedap, bumbu cabai asli bukan perisa buatan.'
  }
];

export const DEFAULT_PROMOS: BundlingPromo[] = [
  {
    id: 'prm-1',
    code: 'PAKET-MITRA-100',
    title: 'Paket Usaha Reseller Pemula (50 Pcs Campur)',
    itemsIncluded: '25 Keripik Balado + 25 Basreng Daun Jeruk',
    promoPrice: 580000,
    normalPrice: 650000,
    validUntil: '2026-12-31',
    isActive: true
  }
];
