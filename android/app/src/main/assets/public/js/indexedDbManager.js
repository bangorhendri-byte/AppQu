/**
 * UsahaQu v1.83 - IndexedDB Local Database Architecture (Vanilla ES6 Module)
 * Terisolasi dari penimpaan file update dan mendukung 5 Master Data Global
 * serta 14 Master Data Spesifik Modul.
 */

export const DB_NAME = 'UsahaQu_v183_LocalDB';
export const DB_VERSION = 2;

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
};

export const DB_SCHEMAS = {
  [STORES.GLOBAL_STAFF]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_email', keyPath: 'email', unique: false },
      { name: 'by_role', keyPath: 'role', unique: false },
      { name: 'by_status', keyPath: 'status', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false }
    ]
  },
  [STORES.GLOBAL_CUSTOMERS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_phone', keyPath: 'phone', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_type', keyPath: 'type', unique: false },
      { name: 'by_nik', keyPath: 'nik', unique: false }
    ]
  },
  [STORES.GLOBAL_SUPPLIERS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_phone', keyPath: 'phone', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false }
    ]
  },
  [STORES.GLOBAL_PAYMENT_METHODS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_type', keyPath: 'type', unique: false },
      { name: 'by_active', keyPath: 'isActive', unique: false }
    ]
  },
  [STORES.GLOBAL_CATEGORIES_UNITS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_kind', keyPath: 'kind', unique: false },
      { name: 'by_module', keyPath: 'module', unique: false },
      { name: 'by_code', keyPath: 'code', unique: false }
    ]
  },
  [STORES.BENGKEL_SERVICES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_fee', keyPath: 'standardFee', unique: false }
    ]
  },
  [STORES.BENGKEL_SPAREPARTS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_part_number', keyPath: 'partNumber', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false }
    ]
  },
  [STORES.BENGKEL_VEHICLES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_plate', keyPath: 'plateNumber', unique: false },
      { name: 'by_brand', keyPath: 'brand', unique: false },
      { name: 'by_customer', keyPath: 'customerId', unique: false }
    ]
  },
  [STORES.KEDAI_MENU]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_available', keyPath: 'isAvailable', unique: false }
    ]
  },
  [STORES.KEDAI_RECIPES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_menu', keyPath: 'menuId', unique: false },
      { name: 'by_ingredient', keyPath: 'ingredientId', unique: false }
    ]
  },
  [STORES.KEDAI_TABLES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_table_no', keyPath: 'tableNo', unique: false },
      { name: 'by_area', keyPath: 'area', unique: false },
      { name: 'by_status', keyPath: 'status', unique: false }
    ]
  },
  [STORES.KLINIK_SERVICES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_poli', keyPath: 'poliId', unique: false }
    ]
  },
  [STORES.KLINIK_MEDICINES]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_sku', keyPath: 'sku', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_type', keyPath: 'type', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false }
    ]
  },
  [STORES.KLINIK_DOCTORS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_specialization', keyPath: 'specialization', unique: false },
      { name: 'by_sip', keyPath: 'sipNumber', unique: false }
    ]
  },
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
  [STORES.RITEL_PROMOS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_code', keyPath: 'code', unique: false },
      { name: 'by_type', keyPath: 'type', unique: false },
      { name: 'by_active', keyPath: 'isActive', unique: false }
    ]
  },
  [STORES.TITIP_VENDORS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_phone', keyPath: 'phone', unique: false },
      { name: 'by_commission', keyPath: 'commissionRate', unique: false }
    ]
  },
  [STORES.TITIP_CONSIGNMENT_ITEMS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_vendor', keyPath: 'vendorId', unique: false },
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false },
      { name: 'by_price', keyPath: 'consignmentPrice', unique: false }
    ]
  },
  [STORES.TITIP_PARTNERS]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_store_name', keyPath: 'storeName', unique: false },
      { name: 'by_pic', keyPath: 'pic', unique: false },
      { name: 'by_partner_type', keyPath: 'partnerType', unique: false }
    ]
  },
  [STORES.POS_CATALOG]: {
    keyPath: 'id',
    indexes: [
      { name: 'by_name', keyPath: 'name', unique: false },
      { name: 'by_category', keyPath: 'category', unique: false },
      { name: 'by_stock', keyPath: 'stock', unique: false },
      { name: 'by_module', keyPath: 'module', unique: false }
    ]
  },
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

let dbInstance = null;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung di browser ini'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      Object.entries(DB_SCHEMAS).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, {
            keyPath: config.keyPath,
            autoIncrement: config.autoIncrement || false
          });
          config.indexes.forEach((idx) => {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique || false });
          });
        }
      });
    };
    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function getStore(storeName, mode = 'readonly') {
  return openDatabase().then((db) => {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  });
}

export async function addItem(storeName, data) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.add(data);
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
}

export async function getItem(storeName, id) {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function updateItem(storeName, data) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(data);
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(storeName, id) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems(storeName, filterFn) {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      let results = request.result || [];
      if (typeof filterFn === 'function') {
        results = results.filter(filterFn);
      }
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function bulkAddItems(storeName, items) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
    tx.oncomplete = () => resolve(items.length);
    tx.onerror = () => reject(tx.error);
  });
}

export async function countItems(storeName) {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}
