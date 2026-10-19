/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - IndexedDB Local Database Architecture
 * Arsitektur penyimpanan data lokal offline-first berbasis IndexedDB.
 * Terisolasi dari penimpaan file update dan mendukung 5 Master Data Global
 * serta 14 Master Data Spesifik Modul.
 */

export const DB_NAME = 'UsahaQu_v183_LocalDB';
export const DB_VERSION = 2;

/**
 * Daftar Konstanta Nama Store IndexedDB
 */
export const STORES = {
  // 5 Master Data Global
  GLOBAL_STAFF: 'global_staff',
  GLOBAL_CUSTOMERS: 'global_customers',
  GLOBAL_SUPPLIERS: 'global_suppliers',
  GLOBAL_PAYMENT_METHODS: 'global_payment_methods',
  GLOBAL_CATEGORIES_UNITS: 'global_categories_units',

  // 14 Master Data Spesifik Modul
  // BengkelQu
  BENGKEL_SERVICES: 'bengkel_services',
  BENGKEL_SPAREPARTS: 'bengkel_spareparts',
  BENGKEL_VEHICLES: 'bengkel_vehicles',

  // KedaiQu
  KEDAI_MENU: 'kedai_menu',
  KEDAI_RECIPES: 'kedai_recipes',
  KEDAI_TABLES: 'kedai_tables',

  // KlinikQu
  KLINIK_SERVICES: 'klinik_services',
  KLINIK_MEDICINES: 'klinik_medicines',
  KLINIK_DOCTORS: 'klinik_doctors',

  // RitelQu
  RITEL_PRODUCTS: 'ritel_products',
  RITEL_PROMOS: 'ritel_promos',

  // Titip Qu
  TITIP_VENDORS: 'titip_vendors',
  TITIP_CONSIGNMENT_ITEMS: 'titip_consignment_items',
  TITIP_PARTNERS: 'titip_partners',

  // POS Core Offline (Katalog & Transaksi Lokal)
  POS_CATALOG: 'pos_catalog',
  POS_TRANSACTIONS: 'pos_transactions',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

/**
 * Konfigurasi Skema Toko & Indeks untuk Pembuatan Database
 */
interface StoreSchemaConfig {
  keyPath: string;
  autoIncrement?: boolean;
  indexes: { name: string; keyPath: string | string[]; unique?: boolean }[];
}

export const DB_SCHEMAS: Record<StoreName, StoreSchemaConfig> = {
  // 1. Staff / Pengguna Global
  [STORES.GLOBAL_STAFF]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_email', keyPath: 'email', unique: false },
      { name: 'by_role', keyPath: 'role', unique: false },
      { name: 'by_status', keyPath: 'status', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false }
    ]
  },

  // 2. Pelanggan / Pasien Global
  [STORES.GLOBAL_CUSTOMERS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_phone', keyPath: 'phone', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_type', keyPath: 'type', unique: false }, // umum, member, pasien, reseller
      { name: 'by_nik', keyPath: 'nik', unique: false }
    ]
  },

  // 3. Supplier Global
  [STORES.GLOBAL_SUPPLIERS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_phone', keyPath: 'phone', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false }
    ]
  },

  // 4. Kas / Metode Pembayaran Global
  [STORES.GLOBAL_PAYMENT_METHODS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_type', keyPath: 'type', unique: false }, // tunai, transfer, qris, debit, piutang
      { name: 'by_active', keyPath: 'isActive', unique: false }
    ]
  },

  // 5. Kategori & Satuan Global
  [STORES.GLOBAL_CATEGORIES_UNITS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_kind', keyPath: 'kind', unique: false }, // 'category' | 'unit'
      { name: 'by_module', keyPath: 'module', unique: false }, // 'all' | 'bengkel' | 'kedai' | etc.
      { name: 'by_code', keyPath: 'code', unique: false }
    ]
  },

  // --- BENGKELQU (3 Stores) ---
  // 6. Jasa / Servis
  [STORES.BENGKEL_SERVICES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_fee', keyPath: 'standardFee', unique: false }
    ]
  },
  // 7. Sparepart
  [STORES.BENGKEL_SPAREPARTS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_part_number', keyPath: 'partNumber', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false }
    ]
  },
  // 8. Merek & Kendaraan
  [STORES.BENGKEL_VEHICLES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_plate', keyPath: 'plateNumber', unique: false },
      { name: 'by_brand', keyPath: 'brand', unique: false },
      { name: 'by_customer', keyPath: 'customerId', unique: false }
    ]
  },

  // --- KEDAIQU (3 Stores) ---
  // 9. Menu Makanan & Minuman
  [STORES.KEDAI_MENU]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_available', keyPath: 'isAvailable', unique: false }
    ]
  },
  // 10. Resep / BOM (Bill of Materials)
  [STORES.KEDAI_RECIPES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_menu', keyPath: 'menuId', unique: false },
      { name: 'by_ingredient', keyPath: 'ingredientId', unique: false }
    ]
  },
  // 11. Layout Meja & Ruangan
  [STORES.KEDAI_TABLES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_table_no', keyPath: 'tableNo', unique: false },
      { name: 'by_area', keyPath: 'area', unique: false },
      { name: 'by_status', keyPath: 'status', unique: false }
    ]
  },

  // --- KLINIKQU (3 Stores) ---
  // 12. Layanan Medis & Tarif Tindakan
  [STORES.KLINIK_SERVICES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_poli', keyPath: 'poliId', unique: false }
    ]
  },
  // 13. Obat & Alat Kesehatan
  [STORES.KLINIK_MEDICINES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_sku', keyPath: 'sku', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_type', keyPath: 'type', unique: false }, // tablet, sirup, alkes
      { name: 'by_stock', keyPath: 'stock', unique: false }
    ]
  },
  // 14. Poliklinik & Dokter Staf
  [STORES.KLINIK_DOCTORS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_specialization', keyPath: 'specialization', unique: false },
      { name: 'by_sip', keyPath: 'sipNumber', unique: false }
    ]
  },

  // --- RITELQU (2 Stores) ---
  // 15. Barang / Barcode SKU Minimarket
  [STORES.RITEL_PRODUCTS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_barcode', keyPath: 'barcode', unique: false },
      { name: 'by_sku', keyPath: 'sku', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false }
    ]
  },
  // 16. Diskon & Promosi
  [STORES.RITEL_PROMOS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_code', keyPath: 'code', unique: false },
      { name: 'by_type', keyPath: 'type', unique: false },
      { name: 'by_active', keyPath: 'isActive', unique: false }
    ]
  },

  // --- TITIPQU (3 Stores) ---
  // 17. Vendor Konsinyasi
  [STORES.TITIP_VENDORS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_phone', keyPath: 'phone', unique: false },
      { name: 'by_commission', keyPath: 'commissionRate', unique: false }
    ]
  },
  // 18. Barang Titipan Konsinyasi
  [STORES.TITIP_CONSIGNMENT_ITEMS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_vendor', keyPath: 'vendorId', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false },
      { name: 'by_price', keyPath: 'consignmentPrice', unique: false }
    ]
  },
  // 19. Mitra / Toko Cabang Konsinyasi
  [STORES.TITIP_PARTNERS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_store_name', keyPath: 'storeName', unique: false },
      { name: 'by_pic', keyPath: 'pic', unique: false },
      { name: 'by_partner_type', keyPath: 'partnerType', unique: false } // 'toko_titip' | 'reseller'
    ]
  },
  // 20. POS Core: Katalog & Stok Barang/Jasa Lokal
  [STORES.POS_CATALOG]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false },
      { name: 'by_module', keyPath: 'module', unique: false }
    ]
  },
  // 21. POS Core: Riwayat Transaksi & Penjualan Kasir Lokal
  [STORES.POS_TRANSACTIONS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_invoice', keyPath: 'invoiceNo', unique: false },
      { name: 'by_date', keyPath: 'date', unique: false },
      { name: 'by_timestamp', keyPath: 'timestamp', unique: false },
      { name: 'by_payment_method', keyPath: 'paymentMethod', unique: false },
      { name: 'by_module', keyPath: 'module', unique: false }
    ]
  }
};

/**
 * Singleton instance koneksi database
 */
let dbInstance: IDBDatabase | null = null;

/**
 * Membuka koneksi ke IndexedDB UsahaQu v1.83.
 * Menginisialisasi seluruh store dan index jika versi belum terpasang.
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada browser ini'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Inisialisasi setiap store jika belum ada
      Object.entries(DB_SCHEMAS).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, {
            keyPath: config.keyPath,
            autoIncrement: config.autoIncrement || false
          });

          // Buat indeks pencarian
          config.indexes.forEach((idx) => {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique || false });
          });
        }
      });
    };

    request.onsuccess = (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      console.error('Gagal membuka IndexedDB UsahaQu:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Helper generik: Menjalankan transaksi pada store tertentu
 */
function getStore(storeName: StoreName, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
  return openDatabase().then((db) => {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  });
}

/**
 * Menambahkan data item baru ke store
 */
export async function addItem<T extends { id: string | number }>(storeName: StoreName, data: T): Promise<T> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.add(data);
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mengambil satu data item berdasarkan ID
 */
export async function getItem<T>(storeName: StoreName, id: string | number): Promise<T | null> {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve((request.result as T) || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Memperbarui data item (atau menambahkannya jika belum ada)
 */
export async function updateItem<T extends { id: string | number }>(storeName: StoreName, data: T): Promise<T> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(data);
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Menghapus satu item berdasarkan ID
 */
export async function deleteItem(storeName: StoreName, id: string | number): Promise<boolean> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mengambil seluruh isi store dengan filter opsional
 */
export async function getAllItems<T>(storeName: StoreName, filterFn?: (item: T) => boolean): Promise<T[]> {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      let results = (request.result as T[]) || [];
      if (filterFn) {
        results = results.filter(filterFn);
      }
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Menambahkan banyak item sekaligus (bulk insert)
 */
export async function bulkAddItems<T extends { id: string | number }>(storeName: StoreName, items: T[]): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    items.forEach((item) => store.put(item));

    tx.oncomplete = () => resolve(items.length);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Menghitung total data pada store
 */
export async function countItems(storeName: StoreName): Promise<number> {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mengosongkan isi seluruh store
 */
export async function clearStore(storeName: StoreName): Promise<boolean> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mencari data berdasarkan indeks IndexedDB
 */
export async function queryByIndex<T>(
  storeName: StoreName, 
  indexName: string, 
  queryValue: IDBValidKey | IDBKeyRange
): Promise<T[]> {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const index = store.index(indexName);
    const request = index.getAll(queryValue);
    request.onsuccess = () => resolve((request.result as T[]) || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Seed data awal UsahaQu v1.83 jika database masih kosong
 */
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  const staffCount = await countItems(STORES.GLOBAL_STAFF);
  if (staffCount > 0) {
    return false; // Database sudah terisi
  }

  // 1. Global Staff
  await bulkAddItems(STORES.GLOBAL_STAFF, [
    { id: 'usr-1', name: 'Bpk. Ahmad Fauzi', email: 'ahmad.fauzi@usahaqu.id', role: 'Owner', status: 'active', phone: '081234567890' },
    { id: 'usr-2', name: 'SMB Syariah SPV', email: 'smbsyariah@gmail.com', role: 'Supervisor', status: 'active', phone: '081398765432' },
    { id: 'usr-3', name: 'Kasir Operasional', email: 'kasir@usahaqu.id', role: 'Kasir', status: 'active', phone: '081512344321' }
  ]);

  // 2. Global Customers
  await bulkAddItems(STORES.GLOBAL_CUSTOMERS, [
    { id: 'cst-1', name: 'Budi Hartono', phone: '081299887766', type: 'member', address: 'Jl. Merdeka No. 12', nik: '320101992830001' },
    { id: 'cst-2', name: 'Siti Aminah', phone: '085711223344', type: 'pasien', address: 'Komplek Permata Hijau B-4', nik: '320101882910002' },
    { id: 'cst-3', name: 'Warung Bu Siti', phone: '081377889900', type: 'reseller', address: 'Pasar Baru Blok A No. 5', nik: '320101772910003' }
  ]);

  // 3. Global Suppliers
  await bulkAddItems(STORES.GLOBAL_SUPPLIERS, [
    { id: 'sup-1', name: 'PT Astra Motor Part', phone: '021-889977', category: 'Otomotif & Sparepart', contactPerson: 'Hendra' },
    { id: 'sup-2', name: 'CV Berkah Bahan Pangan', phone: '022-778899', category: 'F&B dan Bumbu', contactPerson: 'Dewi' },
    { id: 'sup-3', name: 'Distributor Farmasi Kimia Medika', phone: '021-554433', category: 'Obat & Medis', contactPerson: 'dr. Farhan' }
  ]);

  // 4. Global Payment Methods
  await bulkAddItems(STORES.GLOBAL_PAYMENT_METHODS, [
    { id: 'pay-1', name: 'Kas Tunai Kasir', type: 'tunai', isActive: true, accountNo: 'CASH-MAIN' },
    { id: 'pay-2', name: 'QRIS Statis Toko', type: 'qris', isActive: true, accountNo: 'NMID-9928381' },
    { id: 'pay-3', name: 'BCA Virtual Account / Transfer', type: 'transfer', isActive: true, accountNo: '8090123456' },
    { id: 'pay-4', name: 'Piutang / Tempo Pelanggan', type: 'piutang', isActive: true, accountNo: 'TEMPO-REC' }
  ]);

  // 5. Global Categories & Units
  await bulkAddItems(STORES.GLOBAL_CATEGORIES_UNITS, [
    { id: 'cat-1', name: 'Jasa & Servis', kind: 'category', module: 'bengkel', code: 'JSA' },
    { id: 'cat-2', name: 'Minuman Kopi & Teh', kind: 'category', module: 'kedai', code: 'MNM' },
    { id: 'cat-3', name: 'Obat Bebas & Resep', kind: 'category', module: 'klinik', code: 'MED' },
    { id: 'cat-4', name: 'Sembako & Makanan Ringan', kind: 'category', module: 'ritel', code: 'SMB' },
    { id: 'cat-5', name: 'Camilan Titipan Konsinyasi', kind: 'category', module: 'titip', code: 'TTP' },
    { id: 'unt-1', name: 'Pcs / Buah', kind: 'unit', module: 'all', code: 'PCS' },
    { id: 'unt-2', name: 'Kilogram (Kg)', kind: 'unit', module: 'all', code: 'KG' },
    { id: 'unt-3', name: 'Botol / Pack', kind: 'unit', module: 'all', code: 'PCK' }
  ]);

  // 6. BengkelQu: Services
  await bulkAddItems(STORES.BENGKEL_SERVICES, [
    { id: 'bs-1', name: 'Servis Ringan & Tune Up Karbu/Injeksi', category: 'Servis Berkala', standardFee: 65000, estimatedDurationMin: 45 },
    { id: 'bs-2', name: 'Ganti Oli Mesin & Gardan', category: 'Ganti Oli', standardFee: 15000, estimatedDurationMin: 15 },
    { id: 'bs-3', name: 'Ganti Kampas Rem Depan/Belakang', category: 'Rem', standardFee: 25000, estimatedDurationMin: 30 }
  ]);

  // 7. BengkelQu: Spareparts
  await bulkAddItems(STORES.BENGKEL_SPAREPARTS, [
    { id: 'bsp-1', partNumber: 'OLI-MPX2-08', name: 'Oli AHM MPX2 Matic 0.8L', category: 'Oli', costPrice: 48000, sellPrice: 58000, stock: 24 },
    { id: 'bsp-2', partNumber: 'KMP-VAR-DEP', name: 'Kampas Rem Depan Vario/Beat FI', category: 'Pengereman', costPrice: 32000, sellPrice: 45000, stock: 12 },
    { id: 'bsp-3', partNumber: 'BUSI-CPR9-EA', name: 'Busi NGK CPR9EA-9 Karbu/FI', category: 'Kelistrikan', costPrice: 18000, sellPrice: 25000, stock: 30 }
  ]);

  // 8. BengkelQu: Vehicles
  await bulkAddItems(STORES.BENGKEL_VEHICLES, [
    { id: 'bv-1', plateNumber: 'B 4120 KDX', brand: 'Honda', model: 'Vario 125 ESP', year: 2021, customerId: 'cst-1' },
    { id: 'bv-2', plateNumber: 'D 6991 SAB', brand: 'Yamaha', model: 'NMAX 155 Connected', year: 2022, customerId: 'cst-1' }
  ]);

  // 9. KedaiQu: Menu
  await bulkAddItems(STORES.KEDAI_MENU, [
    { id: 'km-1', name: 'Kopi Susu Gula Aren Spesial', category: 'Kopi Dingin', price: 18000, isAvailable: true },
    { id: 'km-2', name: 'Mie Goreng Telur Sosis Spesial', category: 'Makanan', price: 22000, isAvailable: true },
    { id: 'km-3', name: 'Teh Tarik Pandan Wangi', category: 'Non-Kopi', price: 14000, isAvailable: true }
  ]);

  // 10. KedaiQu: Recipes
  await bulkAddItems(STORES.KEDAI_RECIPES, [
    { id: 'kr-1', menuId: 'km-1', ingredientId: 'ing-espresso', ingredientName: 'Espresso Blend', amount: 30, unit: 'ml', cost: 3500 },
    { id: 'kr-2', menuId: 'km-1', ingredientId: 'ing-susu', ingredientName: 'Susu Fresh Milk', amount: 120, unit: 'ml', cost: 2400 },
    { id: 'kr-3', menuId: 'km-1', ingredientId: 'ing-aren', ingredientName: 'Sirup Gula Aren', amount: 25, unit: 'ml', cost: 1000 }
  ]);

  // 11. KedaiQu: Tables
  await bulkAddItems(STORES.KEDAI_TABLES, [
    { id: 'kt-1', tableNo: 'M-01', area: 'Indoor AC', capacity: 4, status: 'kosong' },
    { id: 'kt-2', tableNo: 'M-02', area: 'Indoor AC', capacity: 2, status: 'kosong' },
    { id: 'kt-3', tableNo: 'O-01', area: 'Outdoor Smoking', capacity: 6, status: 'kosong' }
  ]);

  // 12. KlinikQu: Services
  await bulkAddItems(STORES.KLINIK_SERVICES, [
    { id: 'ks-1', name: 'Pemeriksaan Dokter Umum & Konsultasi', category: 'Rawat Jalan', poliId: 'poli-umum', tarif: 50000 },
    { id: 'ks-2', name: 'Pembersihan & Jahit Luka Ringan (Hecting)', category: 'Tindakan Medis', poliId: 'poli-umum', tarif: 85000 },
    { id: 'ks-3', name: 'Pemeriksaan Gula Darah & Kolesterol Sewaktu', category: 'Laboratorium Mini', poliId: 'poli-lab', tarif: 35000 }
  ]);

  // 13. KlinikQu: Medicines
  await bulkAddItems(STORES.KLINIK_MEDICINES, [
    { id: 'kmed-1', sku: 'MED-PCM-500', name: 'Paracetamol 500mg Tablet', type: 'tablet', stock: 240, price: 1500, unit: 'tablet' },
    { id: 'kmed-2', sku: 'MED-AMX-500', name: 'Amoxicillin 500mg Kapsul', type: 'kapsul', stock: 120, price: 3000, unit: 'kapsul' },
    { id: 'kmed-3', sku: 'MED-BND-01', name: 'Kasa Steril & Plester Cepat', type: 'alkes', stock: 45, price: 5000, unit: 'pack' }
  ]);

  // 14. KlinikQu: Doctors
  await bulkAddItems(STORES.KLINIK_DOCTORS, [
    { id: 'kd-1', name: 'dr. Farhan Al-Ghifari', specialization: 'Dokter Umum Penanggung Jawab', sipNumber: 'SIP.440/129/DINKES/2024', status: 'praktek' },
    { id: 'kd-2', name: 'drg. Maya Anggraeni', specialization: 'Dokter Gigi', sipNumber: 'SIP.440/301/DINKES/2023', status: 'praktek' }
  ]);

  // 15. RitelQu: Products
  await bulkAddItems(STORES.RITEL_PRODUCTS, [
    { id: 'rp-1', barcode: '8999999123451', sku: 'RT-MIN-01', name: 'Air Mineral Prima 600ml', category: 'Minuman', costPrice: 2400, sellPrice: 3500, stock: 48 },
    { id: 'rp-2', barcode: '8999999234562', sku: 'RT-MIE-02', name: 'Mie Instan Goreng Spesial', category: 'Sembako', costPrice: 2800, sellPrice: 3500, stock: 120 },
    { id: 'rp-3', barcode: '8999999345673', sku: 'RT-SBN-03', name: 'Sabun Cuci Piring Jeruk Nipis 750ml', category: 'Kebersihan', costPrice: 12500, sellPrice: 15000, stock: 18 }
  ]);

  // 16. RitelQu: Promos
  await bulkAddItems(STORES.RITEL_PROMOS, [
    { id: 'rpr-1', code: 'JUMATBERKAH', name: 'Diskon Belanja Jumat Berkah 10%', type: 'percentage', discountValue: 10, minPurchase: 50000, isActive: true },
    { id: 'rpr-2', code: 'BUY2GET1', name: 'Beli 2 Gratis 1 Air Mineral', type: 'buy_x_get_y', discountValue: 0, minPurchase: 0, isActive: true }
  ]);

  // 17. Titip Qu: Vendors
  await bulkAddItems(STORES.TITIP_VENDORS, [
    { id: 'tv-1', name: 'Dapur Keripik Mak Icih', phone: '081288771122', address: 'Cimahi, Bandung Barat', commissionRate: 15, pic: 'Ibu Icih' },
    { id: 'tv-2', name: 'Bakpia Pathok Berkah Jogja', phone: '081399002233', address: 'Bantul, D.I Yogyakarta', commissionRate: 20, pic: 'Pak Joko' }
  ]);

  // 18. Titip Qu: Consignment Items
  await bulkAddItems(STORES.TITIP_CONSIGNMENT_ITEMS, [
    { id: 'tci-1', vendorId: 'tv-1', name: 'Keripik Singkong Pedas Gurih 250gr', consignmentPrice: 12000, suggestedRetailPrice: 15000, stock: 50, unit: 'bungkus' },
    { id: 'tci-2', vendorId: 'tv-2', name: 'Bakpia Kukus Cokelat Keju Box Isi 10', consignmentPrice: 28000, suggestedRetailPrice: 35000, stock: 25, unit: 'box' }
  ]);

  // 19. Titip Qu: Partners
  await bulkAddItems(STORES.TITIP_PARTNERS, [
    { id: 'tp-1', storeName: 'Toko Oleh-Oleh Terminal Bus', pic: 'Bpk. Ridwan', phone: '081544332211', partnerType: 'toko_titip', address: 'Terminal Bus Jalur Keberangkatan', commissionShare: 15 },
    { id: 'tp-2', storeName: 'Reseller Warung Pojok Sejahtera', pic: 'Ibu Ratna', phone: '081622334455', partnerType: 'reseller', address: 'Komplek Griya Asri No. 10', commissionShare: 10 }
  ]);

  return true;
}

// Re-export Backup & Restore Utilities
export { exportDataToJSON, importDataFromJSON } from '../utils/backupRestoreManager';
