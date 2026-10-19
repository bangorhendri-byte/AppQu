/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - POS Core Offline Engine (ES6 Module)
 * Logika dan Manajemen Kasir 100% Offline berbasis IndexedDB.
 * Bebas ketergantungan cloud/server.
 */

import { STORES, openDatabase, addItem, getItem, updateItem, deleteItem, getAllItems } from './indexedDbManager.js';

/**
 * Format angka ke format mata uang Rupiah
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  const val = Number(amount) || 0;
  return 'Rp ' + val.toLocaleString('id-ID');
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
 * @returns {string}
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mendapatkan format waktu sekarang HH:mm:ss
 * @returns {string}
 */
export function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

/**
 * Membuat nomor invoice unik: UQ-YYYYMMDD-XXXX
 * @returns {string}
 */
export function generateInvoiceNumber() {
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

/**
 * Mengambil semua produk katalog dengan opsi filter pencarian, kategori, dan modul
 * @param {Object} options
 * @param {string} [options.search]
 * @param {string} [options.category]
 * @param {string} [options.module]
 * @returns {Promise<Array>}
 */
export async function getProducts(options = {}) {
  const { search = '', category = '', module = '' } = options;
  const items = await getAllItems(STORES.POS_CATALOG);

  return items.filter((item) => {
    // Filter Modul jika dispesifikasikan (kecuali 'all')
    if (module && module !== 'all' && item.module && item.module !== module) {
      return false;
    }

    // Filter Kategori
    if (category && category !== 'Semua' && item.category !== category) {
      return false;
    }

    // Filter Pencarian Teks (Nama atau Kategori)
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

/**
 * Mengambil 1 item produk berdasarkan ID
 * @param {string|number} id
 * @returns {Promise<Object|null>}
 */
export async function getProductById(id) {
  return await getItem(STORES.POS_CATALOG, id);
}

/**
 * Menambah item baru ke katalog lokal
 * @param {Object} product
 * @param {string} product.name - Nama item/produk/jasa
 * @param {number} product.price - Harga jual
 * @param {number} product.stock - Stok lokal awal
 * @param {string} product.category - Kategori
 * @param {string} [product.module] - Modul pemilik (kedai, ritel, bengkel, klinik, titip)
 * @returns {Promise<Object>}
 */
export async function addProduct({ name, price, stock, category, module = 'kedai' }) {
  if (!name || !name.trim()) {
    throw new Error('Nama produk/jasa wajib diisi.');
  }

  const cleanPrice = Math.max(0, Number(price) || 0);
  const cleanStock = Math.max(0, Number(stock) || 0);
  const cleanCategory = (category || 'Umum').trim();

  const newProduct = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    price: cleanPrice,
    stock: cleanStock,
    category: cleanCategory,
    module: module || 'kedai',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await addItem(STORES.POS_CATALOG, newProduct);
  return newProduct;
}

/**
 * Memperbarui item produk/jasa yang sudah ada di IndexedDB
 * @param {string|number} id
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateProduct(id, updates) {
  const existing = await getItem(STORES.POS_CATALOG, id);
  if (!existing) {
    throw new Error(`Produk dengan ID ${id} tidak ditemukan.`);
  }

  const updatedItem = {
    ...existing,
    ...updates,
    id: existing.id, // Pastikan ID tidak berubah
    price: updates.price !== undefined ? Math.max(0, Number(updates.price) || 0) : existing.price,
    stock: updates.stock !== undefined ? Math.max(0, Number(updates.stock) || 0) : existing.stock,
    updatedAt: new Date().toISOString()
  };

  await updateItem(STORES.POS_CATALOG, updatedItem);
  return updatedItem;
}

/**
 * Menghapus produk dari katalog lokal
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function deleteProduct(id) {
  return await deleteItem(STORES.POS_CATALOG, id);
}

/**
 * Mengambil daftar kategori unik yang tersedia
 * @param {string} [module]
 * @returns {Promise<Array<string>>}
 */
export async function getUniqueCategories(module = '') {
  const items = await getProducts({ module });
  const set = new Set();
  items.forEach((p) => {
    if (p.category) set.add(p.category);
  });
  return ['Semua', ...Array.from(set)];
}

/**
 * Seed data katalog bawaan jika store masih kosong sesuai modul yang dipilih
 * @param {string} moduleKey
 * @returns {Promise<number>} Jumlah item yang di-seed
 */
export async function seedDefaultCatalogIfEmpty(moduleKey = 'kedai') {
  const items = await getAllItems(STORES.POS_CATALOG);
  if (items.length > 0) {
    return 0; // Sudah terisi
  }

  const defaultsByModule = {
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
// 2. LAYAR TRANSAKSI & CHECKOUT ENGINE (100% OFFLINE INDEXEDDB)
// =========================================================================

/**
 * Menyelesaikan transaksi kasir:
 * 1. Validasi keranjang dan nominal pembayaran
 * 2. Kurangi stok setiap item di IndexedDB (pos_catalog)
 * 3. Simpan record transaksi ke pos_transactions di IndexedDB
 * 4. Kembalikan data transaksi lengkap untuk nota/struk
 * 
 * @param {Object} payload
 * @param {Array} payload.items - Daftar item keranjang [{ id, name, price, qty, category }]
 * @param {string} payload.paymentMethod - 'tunai' | 'qris'
 * @param {number} payload.cashReceived - Uang yang diserahkan pelanggan (khusus tunai)
 * @param {string} [payload.customerName] - Nama pelanggan opsional
 * @param {string} [payload.notes] - Catatan transaksi
 * @param {string} [payload.module] - Modul aktif
 * @param {Object} [payload.storeProfile] - Profil toko untuk tercetak di struk
 * @returns {Promise<Object>} Data transaksi lengkap yang berhasil disimpan
 */
export async function checkoutTransaction({
  items,
  paymentMethod = 'tunai',
  cashReceived = 0,
  customerName = 'Pelanggan Umum',
  notes = '',
  module = 'kedai',
  storeProfile = null
}) {
  if (!items || items.length === 0) {
    throw new Error('Keranjang belanja kosong! Pilih minimal 1 barang.');
  }

  // Hitung Subtotal & Total
  let subtotal = 0;
  const processedItems = [];

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

  const total = subtotal; // Dapat ditambah pajak/diskon jika ada
  let calculatedChange = 0;
  let finalCashReceived = cashReceived;

  if (paymentMethod === 'tunai') {
    if (finalCashReceived < total) {
      throw new Error(`Uang tunai kurang! Tagihan: ${formatRupiah(total)}, Diterima: ${formatRupiah(finalCashReceived)}`);
    }
    calculatedChange = finalCashReceived - total;
  } else {
    // QRIS pembayaran otomatis pas
    finalCashReceived = total;
    calculatedChange = 0;
  }

  // Validasi & Kurangi Stok Barang di IndexedDB
  for (const item of processedItems) {
    const productInDb = await getItem(STORES.POS_CATALOG, item.id);
    if (productInDb) {
      // Kurangi stok, stok tidak boleh negatif
      const currentStock = Number(productInDb.stock) || 0;
      const newStock = Math.max(0, currentStock - item.qty);
      await updateItem(STORES.POS_CATALOG, {
        ...productInDb,
        stock: newStock,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Ambil profil toko dari parameter atau localStorage
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

  // Susun record transaksi lokal
  const transactionRecord = {
    id: 'TRX_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    invoiceNo: invoiceNo,
    date: todayDate,
    time: currentTime,
    timestamp: Date.now(),
    module: module || 'kedai',
    items: processedItems,
    totalItems: processedItems.reduce((acc, it) => acc + it.qty, 0),
    subtotal: subtotal,
    total: total,
    paymentMethod: paymentMethod, // 'tunai' | 'qris'
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

  // Simpan record ke tabel POS_TRANSACTIONS di IndexedDB
  await addItem(STORES.POS_TRANSACTIONS, transactionRecord);

  return transactionRecord;
}

// =========================================================================
// 3. RIWAYAT TRANSAKSI & TOTAL OMSET HARIAN
// =========================================================================

/**
 * Mengambil daftar transaksi kasir hari ini (Urut dari yang terbaru)
 * @param {string} [moduleFilter] - Filter berdasarkan modul (opsional)
 * @returns {Promise<Array>}
 */
export async function getTodayTransactions(moduleFilter = '') {
  const todayStr = getTodayDateString();
  const allTx = await getAllItems(STORES.POS_TRANSACTIONS);

  const filtered = allTx.filter((tx) => {
    const isToday = tx.date === todayStr;
    const matchModule = !moduleFilter || moduleFilter === 'all' || tx.module === moduleFilter;
    return isToday && matchModule;
  });

  // Urutkan dari transaksi paling baru ke paling lama
  filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return filtered;
}

/**
 * Menghitung ringkasan omset dan metrik penjualan hari ini
 * @param {string} [moduleFilter]
 * @returns {Promise<Object>}
 */
export async function getTodaySummary(moduleFilter = '') {
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
    totalRevenue: totalRevenue,
    totalItemsSold: totalItemsSold,
    cashRevenue: cashRevenue,
    qrisRevenue: qrisRevenue
  };
}

// =========================================================================
// 4. GENERATOR STRUK / NOTA THERMAL BLUETOOTH & PRINT BROWSER
// =========================================================================

/**
 * Menghasilkan teks ASCII bersih untuk printer Thermal ESC/POS Bluetooth 58mm / WhatsApp Share
 * @param {Object} tx - Record transaksi
 * @returns {string}
 */
export function formatReceiptText(tx) {
  const width = 32; // Standar 32 karakter kertas thermal 58mm
  const divider = '='.repeat(width);
  const thinDivider = '-'.repeat(width);

  const center = (text) => {
    const str = String(text || '').slice(0, width);
    const space = Math.max(0, Math.floor((width - str.length) / 2));
    return ' '.repeat(space) + str;
  };

  const lineLR = (left, right) => {
    const l = String(left || '');
    const r = String(right || '');
    const spaces = Math.max(1, width - l.length - r.length);
    return l + ' '.repeat(spaces) + r;
  };

  let lines = [];
  lines.push(center((tx.storeProfile?.name || 'USAHAQU POS').toUpperCase()));
  if (tx.storeProfile?.address) lines.push(center(tx.storeProfile.address));
  if (tx.storeProfile?.phone) lines.push(center('WA: ' + tx.storeProfile.phone));
  lines.push(divider);
  lines.push(lineLR('No:', tx.invoiceNo || '-'));
  lines.push(lineLR('Waktu:', `${tx.date || ''} ${tx.time || ''}`));
  lines.push(lineLR('Pelanggan:', tx.customerName || 'Umum'));
  lines.push(thinDivider);

  // Rincian Item
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
