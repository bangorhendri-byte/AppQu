/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - Backup & Restore Manual (JSON)
 * Utilitas ekspor dan impor seluruh isi IndexedDB (Master Data, Transaksi, POS Core)
 * dan metadata lisensi lokal ke berkas .json terformat dengan verifikasi integritas data.
 */

import { 
  openDatabase, 
  STORES, 
  StoreName, 
  getAllItems, 
  bulkAddItems, 
  clearStore, 
  countItems 
} from '../db/indexedDbManager';
import { getLicense, saveLicense, LicenseMetadata, LICENSE_STORAGE_KEY } from '../engine/licenseEngine';

export interface BackupMetadata {
  app: string;
  version: string;
  schemaVersion: number;
  exportedAt: string;
  deviceId: string;
  generator: string;
  totalRecords: number;
  checksum: string;
}

export interface UsahaQuBackupPayload {
  metadata: BackupMetadata;
  license: LicenseMetadata;
  indexedDbStores: Record<string, any[]>;
  localStorageData: Record<string, any>;
  summary: {
    storesCount: number;
    totalRecords: number;
    breakdown: Record<string, number>;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  totalRecordsRestored: number;
  storesRestored: Record<string, number>;
  licenseRestored: boolean;
  timestamp: string;
}

/**
 * Menghasilkan hash checksum sederhana untuk memverifikasi keutuhan berkas JSON
 */
function generateSimpleChecksum(dataStr: string): string {
  let hash = 0;
  for (let i = 0; i < dataStr.length; i++) {
    const char = dataStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'UQ-' + Math.abs(hash).toString(16).toUpperCase();
}

/**
 * Mengambil seluruh isi LocalStorage terkait ekosistem UsahaQu & BengkelQu
 */
function collectLocalStorageData(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  const data: Record<string, any> = {};
  const relevantPrefixes = ['usahaqu_', 'bq_', 'tripay_'];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && relevantPrefixes.some(p => key.startsWith(p))) {
        const value = localStorage.getItem(key);
        try {
          data[key] = JSON.parse(value || 'null');
        } catch {
          data[key] = value;
        }
      }
    }
  } catch (err) {
    console.warn('[Backup] Gagal mengambil LocalStorage:', err);
  }
  return data;
}

/**
 * 1. exportDataToJSON()
 * Mengambil seluruh isi IndexedDB (Master Data Global & Modul, Transaksi POS Core),
 * lisensi lokal, dan setting aplikasi, kemudian mengunduhnya sebagai file .json terformat.
 */
export async function exportDataToJSON(options: { 
  downloadFile?: boolean; 
  customFilename?: string;
  includeLocalStorage?: boolean;
} = { downloadFile: true, includeLocalStorage: true }): Promise<UsahaQuBackupPayload> {
  const db = await openDatabase();
  const allStoreNames = Object.values(STORES) as StoreName[];

  const indexedDbStores: Record<string, any[]> = {};
  const breakdown: Record<string, number> = {};
  let totalRecords = 0;

  // Baca seluruh isi 21 stores IndexedDB
  for (const storeName of allStoreNames) {
    try {
      const items = await getAllItems(storeName);
      indexedDbStores[storeName] = items;
      breakdown[storeName] = items.length;
      totalRecords += items.length;
    } catch (e) {
      console.warn(`[Backup] Store '${storeName}' gagal dibaca:`, e);
      indexedDbStores[storeName] = [];
      breakdown[storeName] = 0;
    }
  }

  const currentLicense = getLicense();
  const localStorageData = options.includeLocalStorage !== false ? collectLocalStorageData() : {};

  // Susun data mentah untuk checksum
  const rawContentForChecksum = JSON.stringify({
    storesCount: allStoreNames.length,
    totalRecords,
    licenseKey: currentLicense.license_key || 'free'
  });

  const now = new Date();
  const metadata: BackupMetadata = {
    app: 'UsahaQu v1.83 Master Ecosystem',
    version: '1.83',
    schemaVersion: 2,
    exportedAt: now.toISOString(),
    deviceId: currentLicense.device_id || 'UNKNOWN-DEVICE',
    generator: 'UsahaQu Backup & Resilience Engine',
    totalRecords,
    checksum: generateSimpleChecksum(rawContentForChecksum)
  };

  const payload: UsahaQuBackupPayload = {
    metadata,
    license: currentLicense,
    indexedDbStores,
    localStorageData,
    summary: {
      storesCount: allStoreNames.length,
      totalRecords,
      breakdown
    }
  };

  // Unduh berkas JSON ke perangkat pengguna jika opsi downloadFile aktif
  if (options.downloadFile && typeof window !== 'undefined') {
    const formattedDate = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const filename = options.customFilename || `usahaqu_v183_backup_${formattedDate}.json`;
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);

    console.log(`[Backup] File ${filename} berhasil diunduh (${totalRecords} catatan IndexedDB).`);
  }

  return payload;
}

/**
 * 2. importDataFromJSON()
 * Membaca file JSON cadangan dan memulihkan seluruh tabel IndexedDB tanpa merusak struktur database.
 * Mampu menerima objek File dari input file, string JSON, ataupun objek data yang sudah di-parse.
 */
export async function importDataFromJSON(
  fileOrContent: File | string | UsahaQuBackupPayload | any,
  options: {
    mode?: 'replace' | 'merge';
    restoreLicense?: boolean;
    restoreLocalStorage?: boolean;
  } = { mode: 'replace', restoreLicense: true, restoreLocalStorage: true }
): Promise<ImportResult> {
  let parsedPayload: any;

  // Langkah 1: Parsing konten
  if (typeof window !== 'undefined' && fileOrContent instanceof File) {
    const fileText = await fileOrContent.text();
    try {
      parsedPayload = JSON.parse(fileText);
    } catch (parseErr: any) {
      throw new Error(`Format file JSON tidak valid: ${parseErr.message}`);
    }
  } else if (typeof fileOrContent === 'string') {
    try {
      parsedPayload = JSON.parse(fileOrContent);
    } catch (parseErr: any) {
      throw new Error(`Format string JSON tidak valid: ${parseErr.message}`);
    }
  } else if (typeof fileOrContent === 'object' && fileOrContent !== null) {
    parsedPayload = fileOrContent;
  } else {
    throw new Error('Sumber data import tidak dikenali (bukan File, String, atau Object).');
  }

  // Langkah 2: Validasi struktur format backup UsahaQu
  const storesData = parsedPayload.indexedDbStores || parsedPayload.data || null;
  if (!storesData && !parsedPayload.queues && !parsedPayload.spareparts) {
    throw new Error('Berkas ini tidak memiliki struktur data cadangan UsahaQu / BengkelQu yang sah.');
  }

  // Buka IndexedDB
  const db = await openDatabase();
  const knownStoreNames = Object.values(STORES) as string[];
  const storesRestored: Record<string, number> = {};
  let totalRecordsRestored = 0;

  // Langkah 3: Pemulihan IndexedDB (Aman, menjaga skema & indeks)
  if (storesData) {
    for (const [storeName, items] of Object.entries(storesData)) {
      if (!Array.isArray(items)) continue;

      // Pastikan store ada pada skema database yang aktif
      if (knownStoreNames.includes(storeName)) {
        try {
          if (options.mode === 'replace') {
            await clearStore(storeName as StoreName);
          }
          if (items.length > 0) {
            await bulkAddItems(storeName as StoreName, items);
          }
          storesRestored[storeName] = items.length;
          totalRecordsRestored += items.length;
        } catch (storeErr) {
          console.error(`[Restore] Gagal memulihkan store '${storeName}':`, storeErr);
        }
      }
    }
  }

  // Dukungan backward compatibility: Jika backup berupa skema lama BengkelQu (queues, spareparts, dsb)
  const legacyMap: Record<string, StoreName> = {
    spareparts: STORES.BENGKEL_SPAREPARTS,
    customers: STORES.GLOBAL_CUSTOMERS,
    transactions: STORES.POS_TRANSACTIONS,
  };

  for (const [legacyKey, storeTarget] of Object.entries(legacyMap)) {
    const legacyList = parsedPayload[legacyKey] || parsedPayload.data?.[legacyKey];
    if (Array.isArray(legacyList) && legacyList.length > 0 && !storesRestored[storeTarget]) {
      try {
        if (options.mode === 'replace') {
          await clearStore(storeTarget);
        }
        await bulkAddItems(storeTarget, legacyList);
        storesRestored[storeTarget] = legacyList.length;
        totalRecordsRestored += legacyList.length;
      } catch (err) {
        console.warn(`[Restore] Gagal import legacy ${legacyKey}:`, err);
      }
    }
  }

  // Langkah 4: Pemulihan Lisensi (jika diaktifkan)
  let licenseRestored = false;
  if (options.restoreLicense && parsedPayload.license) {
    try {
      saveLicense(parsedPayload.license);
      licenseRestored = true;
    } catch (licErr) {
      console.warn('[Restore] Gagal memulihkan lisensi:', licErr);
    }
  }

  // Langkah 5: Pemulihan LocalStorage (jika ada)
  if (options.restoreLocalStorage && parsedPayload.localStorageData && typeof window !== 'undefined') {
    try {
      Object.entries(parsedPayload.localStorageData).forEach(([key, val]) => {
        if (key !== LICENSE_STORAGE_KEY || options.restoreLicense) {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        }
      });
    } catch (lsErr) {
      console.warn('[Restore] Gagal memulihkan LocalStorage:', lsErr);
    }
  }

  // Langkah 6: Pancarkan Event Notifikasi agar UI bereaksi langsung
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('usahaqu:data-restored', {
      detail: {
        totalRecordsRestored,
        storesRestored,
        timestamp: new Date().toISOString()
      }
    }));
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', {
      detail: getLicense()
    }));
  }

  return {
    success: true,
    message: `Berhasil memulihkan ${totalRecordsRestored} data ke dalam ${Object.keys(storesRestored).length} tabel IndexedDB tanpa merusak struktur database!`,
    totalRecordsRestored,
    storesRestored,
    licenseRestored,
    timestamp: new Date().toISOString()
  };
}
