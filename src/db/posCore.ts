/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - POS Core Offline Engine (TypeScript Module)
 * Logika dan Manajemen Kasir 100% Offline berbasis IndexedDB.
 * Bebas ketergantungan cloud/server.
 */

import { STORES, addItem, getItem, updateItem, deleteItem, getAllItems } from './indexedDbManager';

export interface PosProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  module: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  category?: string;
}

export interface PosTransaction {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: number;
  module: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  paymentMethod: 'tunai' | 'qris';
  cashReceived: number;
  change: number;
  customerName: string;
  notes?: string;
  storeProfile?: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface DailySummary {
  todayDate: string;
  transactionCount: number;
  totalRevenue: number;
  totalItemsSold: number;
  cashRevenue: number;
  qrisRevenue: number;
}

export function formatRupiah(amount: number): string {
  const val = Number(amount) || 0;
  return 'Rp ' + val.toLocaleString('id-ID');
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `UQ-${year}${month}${day}-${randomSuffix}`;
}

// =========================================================================
// 1. KELOLA KATALOG & STOK LOKAL (CRUD SEDERHANA DI INDEXEDDB)
// =========================================================================

export async function getProducts(options: {
  search?: string;
  category?: string;
  module?: string;
} = {}): Promise<PosProduct[]> {
  const { search = '', category = '', module = '' } = options;
  const items = (await getAllItems<PosProduct>(STORES.POS_CATALOG)) || [];

  return items.filter((item) => {
    if (module && module !== 'all' && item.module && item.module !== module) {
      return false;
    }
    if (category && category !== 'Semua' && item.category !== category) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchCategory = (item.category || '').toLowerCase().includes(q);
      const matchBarcode = (item.barcode || '').toLowerCase().includes(q);
      return matchName || matchCategory || matchBarcode;
    }
    return true;
  });
}

export async function getProductById(id: string): Promise<PosProduct | null> {
  return await getItem<PosProduct>(STORES.POS_CATALOG, id);
}

export async function addProduct(product: {
  name: string;
  price: number;
  stock: number;
  category: string;
  module?: string;
  barcode?: string;
}): Promise<PosProduct> {
  if (!product.name || !product.name.trim()) {
    throw new Error('Nama produk/jasa wajib diisi.');
  }

  const cleanPrice = Math.max(0, Number(product.price) || 0);
  const cleanStock = Math.max(0, Number(product.stock) || 0);
  const cleanCategory = (product.category || 'Umum').trim();

  const newProduct: PosProduct = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: product.name.trim(),
    price: cleanPrice,
    stock: cleanStock,
    category: cleanCategory,
    module: product.module || 'kedai',
    barcode: product.barcode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await addItem<PosProduct>(STORES.POS_CATALOG, newProduct);
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<PosProduct, 'id'>>
): Promise<PosProduct> {
  const existing = await getItem<PosProduct>(STORES.POS_CATALOG, id);
  if (!existing) {
    throw new Error(`Produk dengan ID ${id} tidak ditemukan.`);
  }

  const updatedItem: PosProduct = {
    ...existing,
    ...updates,
    id: existing.id,
    price: updates.price !== undefined ? Math.max(0, Number(updates.price) || 0) : existing.price,
    stock: updates.stock !== undefined ? Math.max(0, Number(updates.stock) || 0) : existing.stock,
    updatedAt: new Date().toISOString()
  };

  await updateItem<PosProduct>(STORES.POS_CATALOG, updatedItem);
  return updatedItem;
}

export async function deleteProduct(id: string): Promise<boolean> {
  return await deleteItem(STORES.POS_CATALOG, id);
}

export async function getUniqueCategories(module = ''): Promise<string[]> {
  const items = await getProducts({ module });
  const set = new Set<string>();
  items.forEach((p) => {
    if (p.category) set.add(p.category);
  });
  return ['Semua', ...Array.from(set)];
}

export async function seedDefaultCatalogIfEmpty(moduleKey = 'kedai'): Promise<number> {
  const items = await getAllItems<PosProduct>(STORES.POS_CATALOG);
  if (items.length > 0) {
    return 0;
  }

  const defaultsByModule: Record<string, Omit<PosProduct, 'id' | 'createdAt' | 'updatedAt'>[]> = {
    kedai: [
      { name: 'Kopi Susu Gula Aren Spesial', price: 18000, stock: 45, category: 'Minuman Kopi', module: 'kedai' },
      { name: 'Mie Goreng Telur Sosis Spesial', price: 22000, stock: 30, category: 'Makanan', module: 'kedai' },
      { name: 'Teh Tarik Pandan Wangi Dingin', price: 14000, stock: 50, category: 'Non-Kopi', module: 'kedai' },
      { name: 'Roti Bakar Coklat Keju Crunchy', price: 20000, stock: 25, category: 'Camilan', module: 'kedai' },
      { name: 'Americano Dingin Arabika', price: 16000, stock: 40, category: 'Minuman Kopi', module: 'kedai' },
      { name: 'Nasi Goreng Kampung Spesial', price: 25000, stock: 20, category: 'Makanan', module: 'kedai' }
    ],
    ritel: [
      { name: 'Air Mineral Prima 600ml', price: 3500, stock: 96, category: 'Minuman', module: 'ritel' },
      { name: 'Mie Instan Goreng Spesial', price: 3500, stock: 120, category: 'Sembako', module: 'ritel' },
      { name: 'Minyak Goreng Pouch 2 Liter', price: 34000, stock: 24, category: 'Sembako', module: 'ritel' },
      { name: 'Sabun Cuci Piring Jeruk Nipis 750ml', price: 15000, stock: 35, category: 'Kebersihan', module: 'ritel' },
      { name: 'Gula Pasir Kristal Putih 1kg', price: 17500, stock: 40, category: 'Sembako', module: 'ritel' },
      { name: 'Biskuit Coklat Sandwich 120gr', price: 8500, stock: 30, category: 'Camilan', module: 'ritel' }
    ],
    bengkel: [
      { name: 'Servis Ringan + Tune Up Injeksi', price: 65000, stock: 999, category: 'Jasa Servis', module: 'bengkel' },
      { name: 'Oli Mesin MPX2 Matic 0.8L', price: 58000, stock: 24, category: 'Sparepart / Oli', module: 'bengkel' },
      { name: 'Ganti Kampas Rem Depan Vario/Beat', price: 45000, stock: 15, category: 'Sparepart', module: 'bengkel' },
      { name: 'Busi NGK CPR9EA-9 Karbu/FI', price: 25000, stock: 30, category: 'Sparepart', module: 'bengkel' },
      { name: 'Tambal Ban Tubeless Presisi', price: 20000, stock: 999, category: 'Jasa Servis', module: 'bengkel' },
      { name: 'Oli Gardan Gear Matic 120ml', price: 18000, stock: 30, category: 'Sparepart / Oli', module: 'bengkel' }
    ],
    klinik: [
      { name: 'Pemeriksaan Dokter Umum & Konsultasi', price: 50000, stock: 999, category: 'Tindakan Medis', module: 'klinik' },
      { name: 'Paracetamol 500mg Strip (10 Tab)', price: 12000, stock: 60, category: 'Obat Bebas', module: 'klinik' },
      { name: 'Amoxicillin 500mg Strip (10 Kap)', price: 24000, stock: 40, category: 'Obat Resep', module: 'klinik' },
      { name: 'Cek Gula Darah & Kolesterol Cepat', price: 35000, stock: 999, category: 'Laboratorium Mini', module: 'klinik' },
      { name: 'Vitamin C 500mg Botol 30 Tablet', price: 45000, stock: 25, category: 'Suplemen', module: 'klinik' },
      { name: 'Pembersihan Luka Ringan & Perban', price: 30000, stock: 999, category: 'Tindakan Medis', module: 'klinik' }
    ],
    titip: [
      { name: 'Keripik Singkong Pedas Gurih (Titip)', price: 15000, stock: 30, category: 'Konsinyasi', module: 'titip' },
      { name: 'Bakpia Kukus Coklat Box (Reseller)', price: 35000, stock: 20, category: 'Reseller', module: 'titip' },
      { name: 'Sambal Roa Khas Manado Botol 150gr', price: 32000, stock: 18, category: 'Konsinyasi', module: 'titip' },
      { name: 'Kue Kering Nastar Toples Premium', price: 65000, stock: 12, category: 'Produksi Mandiri', module: 'titip' },
      { name: 'Abon Sapi Gurih Manis 100gr', price: 28000, stock: 25, category: 'Konsinyasi', module: 'titip' },
      { name: 'Kripik Pisang Coklat Lumer 200gr', price: 20000, stock: 35, category: 'Reseller', module: 'titip' }
    ]
  };

  const initialList = defaultsByModule[moduleKey] || defaultsByModule.kedai;

  for (const item of initialList) {
    await addProduct(item);
  }

  return initialList.length;
}

// =========================================================================
// 2. CHECKOUT & STOCK REDUCTION ENGINE (100% OFFLINE INDEXEDDB)
// =========================================================================

export async function checkoutTransaction(payload: {
  items: CartItem[];
  paymentMethod?: 'tunai' | 'qris';
  cashReceived?: number;
  customerName?: string;
  notes?: string;
  module?: string;
  storeProfile?: {
    name: string;
    address: string;
    phone: string;
  } | null;
}): Promise<PosTransaction> {
  const {
    items,
    paymentMethod = 'tunai',
    cashReceived = 0,
    customerName = 'Pelanggan Umum',
    notes = '',
    module = 'kedai',
    storeProfile = null
  } = payload;

  if (!items || items.length === 0) {
    throw new Error('Keranjang belanja kosong! Pilih minimal 1 barang.');
  }

  let subtotal = 0;
  const processedItems: CartItem[] = [];

  for (const cartItem of items) {
    const qty = Math.max(1, Number(cartItem.qty) || 1);
    const price = Math.max(0, Number(cartItem.price) || 0);
    const itemSubtotal = qty * price;
    subtotal += itemSubtotal;

    processedItems.push({
      id: cartItem.id,
      name: cartItem.name,
      price: price,
      qty: qty,
      subtotal: itemSubtotal,
      category: cartItem.category || 'Umum'
    });
  }

  const total = subtotal;
  let calculatedChange = 0;
  let finalCashReceived = cashReceived;

  if (paymentMethod === 'tunai') {
    if (finalCashReceived < total) {
      throw new Error(`Uang tunai kurang! Tagihan: ${formatRupiah(total)}, Diterima: ${formatRupiah(finalCashReceived)}`);
    }
    calculatedChange = finalCashReceived - total;
  } else {
    finalCashReceived = total;
    calculatedChange = 0;
  }

  // Kurangi Stok di IndexedDB (pos_catalog)
  for (const item of processedItems) {
    const productInDb = await getItem<PosProduct>(STORES.POS_CATALOG, item.id);
    if (productInDb) {
      const currentStock = Number(productInDb.stock) || 0;
      const newStock = Math.max(0, currentStock - item.qty);
      await updateItem<PosProduct>(STORES.POS_CATALOG, {
        ...productInDb,
        stock: newStock,
        updatedAt: new Date().toISOString()
      });
    }
  }

  const savedProfile = storeProfile || (() => {
    try {
      const raw = localStorage.getItem('usahaqu_store_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })() || {
    storeName: 'UsahaQu Mandiri',
    address: 'Jl. Utama No. 88',
    phone: '0812-3456-7890'
  };

  const todayDate = getTodayDateString();
  const currentTime = getCurrentTimeString();
  const invoiceNo = generateInvoiceNumber();

  const transactionRecord: PosTransaction = {
    id: 'TRX_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    invoiceNo: invoiceNo,
    date: todayDate,
    time: currentTime,
    timestamp: Date.now(),
    module: module || 'kedai',
    items: processedItems,
    totalItems: processedItems.reduce((acc, it) => acc + it.qty, 0),
    subtotal: subtotal,
    total: total,
    paymentMethod: paymentMethod,
    cashReceived: finalCashReceived,
    change: calculatedChange,
    customerName: (customerName || 'Pelanggan Umum').trim(),
    notes: notes ? notes.trim() : '',
    storeProfile: {
      name: savedProfile.storeName || 'UsahaQu Mandiri',
      address: savedProfile.address || '-',
      phone: savedProfile.phone || '-'
    }
  };

  await addItem<PosTransaction>(STORES.POS_TRANSACTIONS, transactionRecord);
  return transactionRecord;
}

// =========================================================================
// 3. RIWAYAT TRANSAKSI & OMSET HARIAN
// =========================================================================

export async function getTodayTransactions(moduleFilter = ''): Promise<PosTransaction[]> {
  const todayStr = getTodayDateString();
  const allTx = (await getAllItems<PosTransaction>(STORES.POS_TRANSACTIONS)) || [];

  const filtered = allTx.filter((tx) => {
    const isToday = tx.date === todayStr;
    const matchModule = !moduleFilter || moduleFilter === 'all' || tx.module === moduleFilter;
    return isToday && matchModule;
  });

  filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return filtered;
}

export async function getTodaySummary(moduleFilter = ''): Promise<DailySummary> {
  const todayTx = await getTodayTransactions(moduleFilter);

  let totalRevenue = 0;
  let totalItemsSold = 0;
  let cashRevenue = 0;
  let qrisRevenue = 0;

  for (const tx of todayTx) {
    totalRevenue += Number(tx.total) || 0;
    totalItemsSold += Number(tx.totalItems) || 0;
    if (tx.paymentMethod === 'tunai') {
      cashRevenue += Number(tx.total) || 0;
    } else if (tx.paymentMethod === 'qris') {
      qrisRevenue += Number(tx.total) || 0;
    }
  }

  return {
    todayDate: getTodayDateString(),
    transactionCount: todayTx.length,
    totalRevenue,
    totalItemsSold,
    cashRevenue,
    qrisRevenue
  };
}

export function formatReceiptText(tx: PosTransaction): string {
  const width = 32;
  const divider = '='.repeat(width);
  const thinDivider = '-'.repeat(width);

  const center = (text: string) => {
    const str = String(text || '').slice(0, width);
    const space = Math.max(0, Math.floor((width - str.length) / 2));
    return ' '.repeat(space) + str;
  };

  const lineLR = (left: string, right: string) => {
    const l = String(left || '');
    const r = String(right || '');
    const spaces = Math.max(1, width - l.length - r.length);
    return l + ' '.repeat(spaces) + r;
  };

  const lines: string[] = [];
  lines.push(center((tx.storeProfile?.name || 'USAHAQU POS').toUpperCase()));
  if (tx.storeProfile?.address) lines.push(center(tx.storeProfile.address));
  if (tx.storeProfile?.phone) lines.push(center('WA: ' + tx.storeProfile.phone));
  lines.push(divider);
  lines.push(lineLR('No:', tx.invoiceNo || '-'));
  lines.push(lineLR('Waktu:', `${tx.date || ''} ${tx.time || ''}`));
  lines.push(lineLR('Pelanggan:', tx.customerName || 'Umum'));
  lines.push(thinDivider);

  (tx.items || []).forEach((item) => {
    lines.push(item.name.slice(0, width));
    lines.push(lineLR(`  ${item.qty} x ${item.price.toLocaleString('id-ID')}`, item.subtotal.toLocaleString('id-ID')));
  });

  lines.push(thinDivider);
  lines.push(lineLR('TOTAL TAGIHAN:', 'Rp ' + Number(tx.total).toLocaleString('id-ID')));
  lines.push(lineLR('Metode Bayar:', (tx.paymentMethod || 'TUNAI').toUpperCase()));
  if (tx.paymentMethod === 'tunai') {
    lines.push(lineLR('Tunai Diterima:', 'Rp ' + Number(tx.cashReceived).toLocaleString('id-ID')));
    lines.push(lineLR('Kembalian:', 'Rp ' + Number(tx.change).toLocaleString('id-ID')));
  }
  lines.push(divider);
  lines.push(center('TERIMA KASIH ATAS KUNJUNGANNYA'));
  lines.push(center('Barang yg dibeli tdk dpt ditukar'));
  lines.push(center('*** UsahaQu POS v1.83 ***'));

  return lines.join('\n');
}
