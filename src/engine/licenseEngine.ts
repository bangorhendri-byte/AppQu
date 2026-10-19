/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - License & Entitlement Engine (licenseEngine)
 * Mengelola lisensi lokal, kalkulasi masa Trial 10 Hari,
 * Freemium Hybrid Fallback ('free_lifetime'), pembatasan modul,
 * dan kontrol otorisasi fitur premium offline-first.
 */

export const LICENSE_STORAGE_KEY = 'usahaqu_license_v183';
export const APP_VERSION = '1.83';
export const TRIAL_DURATION_DAYS = 10;

export type LicenseStatus = 'trial' | 'free_lifetime' | 'pro_active' | 'expired';

export type EcosystemModule = 'bengkel' | 'kedai' | 'klinik' | 'ritel' | 'titip';

export interface LicenseMetadata {
  device_id: string;
  app_version: string;
  status: LicenseStatus;
  registered_at: string;      // ISO 8601 Timestamp saat pertama install
  trial_ends_at: string;      // ISO 8601 Timestamp (+10 hari)
  is_paid: boolean;           // True jika sudah membeli lisensi aktif
  paid_tier: 'basic' | 'core' | 'corporate' | null;
  paid_expires_at: string | null;
  license_key: string | null;
  selected_primary_module: EcosystemModule; // Modul utama yang tetap aktif di free_lifetime
  business_name: string;
  owner_name: string;
  last_validated_at: string;
}

/**
 * Daftar fitur berbayar / premium yang dibatasi pada mode free_lifetime
 */
export const PREMIUM_FEATURES = [
  'wa_gateway',           // Broadcast WhatsApp / Notifikasi WA otomatis
  'cloud_sync',           // Sinkronisasi data cloud multi-perangkat
  'export_excel',         // Ekspor laporan ke format Excel / Spreadsheet
  'multi_branch',         // Manajemen banyak cabang / outlet
  'multi_device',         // Tautkan HP staf tanpa batas
  'custom_print_logo',    // Kustomisasi logo nota & watermark cetak
  'auto_backup_cloud'     // Cadangan cloud otomatis harian
] as const;

export type PremiumFeatureKey = typeof PREMIUM_FEATURES[number] | string;

/**
 * Normalisasi nama modul ke 5 id standar ekosistem UsahaQu
 */
export function normalizeModuleName(rawName: string): EcosystemModule {
  const clean = (rawName || '').trim().toLowerCase();
  if (clean.includes('bengkel')) return 'bengkel';
  if (clean.includes('kedai') || clean.includes('kuliner') || clean.includes('resto') || clean.includes('cafe')) return 'kedai';
  if (clean.includes('klinik') || clean.includes('apotek') || clean.includes('medis')) return 'klinik';
  if (clean.includes('ritel') || clean.includes('retail') || clean.includes('toko') || clean.includes('swalayan')) return 'ritel';
  if (clean.includes('titip') || clean.includes('konsinyasi') || clean.includes('reseller') || clean.includes('collab')) return 'titip';
  return 'bengkel';
}

/**
 * Mendapatkan atau membuat Device ID unik lokal
 */
function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'UQ-NODE-SERVER';
  const existing = localStorage.getItem('usahaqu_device_id');
  if (existing) return existing;

  const generated = 'UQ-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
  try {
    localStorage.setItem('usahaqu_device_id', generated);
  } catch (e) {
    console.warn('Gagal menyimpan device id ke local storage:', e);
  }
  return generated;
}

/**
 * Inisialisasi metadata lisensi baru saat pertama kali aplikasi dipasang
 */
export function initLicense(
  primaryModule: string = 'bengkel',
  businessName: string = 'Usaha Mandiri Berkah',
  ownerName: string = 'Pemilik Usaha'
): LicenseMetadata {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const newLicense: LicenseMetadata = {
    device_id: getOrCreateDeviceId(),
    app_version: APP_VERSION,
    status: 'trial',
    registered_at: now.toISOString(),
    trial_ends_at: trialEnd.toISOString(),
    is_paid: false,
    paid_tier: null,
    paid_expires_at: null,
    license_key: null,
    selected_primary_module: normalizeModuleName(primaryModule),
    business_name: businessName,
    owner_name: ownerName,
    last_validated_at: now.toISOString()
  };

  saveLicense(newLicense);
  return newLicense;
}

/**
 * Menyimpan metadata lisensi ke LocalStorage
 */
export function saveLicense(license: LicenseMetadata): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license));
  } catch (e) {
    console.error('Gagal menyimpan metadata lisensi UsahaQu:', e);
  }
}

/**
 * Mengambil dan memvalidasi metadata lisensi saat ini.
 * Menerapkan LOGIKA FREEMIUM HYBRID FALLBACK:
 * Jika tanggal saat ini melewati trial_ends_at dan is_paid = false,
 * status otomatis dialihkan ke 'free_lifetime'.
 */
export function getLicense(): LicenseMetadata {
  if (typeof window === 'undefined') {
    return initLicense();
  }

  const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
  let license: LicenseMetadata;

  if (!raw) {
    // Ambil preferensi modul dari onboarding sebelumnya jika ada
    const savedType = localStorage.getItem('usahaqu_type') || 'bengkel';
    license = initLicense(savedType);
  } else {
    try {
      license = JSON.parse(raw);
    } catch (e) {
      console.warn('Metadata lisensi rusak, membuat inisialisasi ulang:', e);
      license = initLicense();
    }
  }

  const nowMs = Date.now();
  let hasChanged = false;

  // Logika 1: Jika lisensi berbayar aktif, cek masa kedaluwarsa langganan Pro
  if (license.is_paid) {
    if (license.paid_expires_at) {
      const expiresMs = new Date(license.paid_expires_at).getTime();
      if (nowMs > expiresMs) {
        // Langganan habis -> fallback ke free_lifetime
        license.is_paid = false;
        license.status = 'free_lifetime';
        hasChanged = true;
      } else {
        license.status = 'pro_active';
      }
    } else {
      // Pembelian permanen / lifetime pro
      license.status = 'pro_active';
    }
  } else {
    // Logika 2: Jika BELUM bayar (Mode Trial vs Free Lifetime)
    const trialEndMs = new Date(license.trial_ends_at).getTime();
    if (nowMs > trialEndMs) {
      // Masa trial 10 hari berakhir -> beralih ke 'free_lifetime'
      if (license.status !== 'free_lifetime') {
        license.status = 'free_lifetime';
        hasChanged = true;
      }
    } else {
      // Masih dalam masa trial 10 hari
      if (license.status !== 'trial') {
        license.status = 'trial';
        hasChanged = true;
      }
    }
  }

  license.last_validated_at = new Date().toISOString();

  if (hasChanged) {
    saveLicense(license);
  }

  return license;
}

/**
 * Helper Pengecekan Akses Modul: canAccessModule(moduleName)
 * - Pada status 'pro_active' & 'trial': Semua modul dapat diakses (mengembalikan true).
 * - Pada status 'free_lifetime': Hanya modul utama terpilih (selected_primary_module) yang mengembalikan true.
 *   Modul lain mengembalikan false.
 */
export function canAccessModule(moduleName: string): boolean {
  // CustomerQu adalah modul publik & gratis untuk semua pengguna (Pembeli & Pedagang)
  if ((moduleName || '').toLowerCase().includes('customer')) {
    return true;
  }

  const license = getLicense();
  const targetModule = normalizeModuleName(moduleName);

  // 1. Pro Berbayar Aktif: Akses Penuh ke seluruh ekosistem
  if (license.is_paid && license.status === 'pro_active') {
    return true;
  }

  // 2. Masa Trial 10 Hari Aktif: Akses Penuh tanpa batas
  if (license.status === 'trial') {
    return true;
  }

  // 3. Status Freemium Hybrid Fallback ('free_lifetime'):
  // Hanya modul utama yang dipilih saat pendaftaran/onboarding yang aktif selamanya!
  if (license.status === 'free_lifetime') {
    return license.selected_primary_module === targetModule;
  }

  return false;
}

/**
 * Helper Pengecekan Akses Fitur: canAccessFeature(featureKey)
 * Membatasi fitur premium (seperti 'wa_gateway', 'cloud_sync', 'export_excel') berdasarkan status lisensi.
 * - 'pro_active': Mengembalikan true untuk seluruh fitur.
 * - 'trial': Mengembalikan true untuk seluruh fitur (full experience uji coba).
 * - 'free_lifetime': Fitur premium mengembalikan false, fitur operasional dasar mengembalikan true.
 */
export function canAccessFeature(featureKey: PremiumFeatureKey): boolean {
  const license = getLicense();

  // 1. Lisensi Pro atau Trial aktif bebas membuka semua fitur
  if (license.status === 'pro_active' || license.status === 'trial') {
    return true;
  }

  // 2. Pada status 'free_lifetime', batasi fitur dalam daftar PREMIUM_FEATURES
  const isPremium = (PREMIUM_FEATURES as readonly string[]).includes(featureKey);
  if (isPremium) {
    return false;
  }

  // Fitur dasar lokal (kasir, inventaris lokal, cetak nota Bluetooth, dll) selalu diizinkan
  return true;
}

/**
 * Menghitung sisa hari masa trial 10 hari
 */
export function getTrialDaysRemaining(): number {
  const license = getLicense();
  if (license.is_paid) return 0;
  if (license.status !== 'trial') return 0;

  const nowMs = Date.now();
  const endMs = new Date(license.trial_ends_at).getTime();
  const diffMs = endMs - nowMs;

  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Mengubah modul utama pilihan pengguna untuk mode free_lifetime
 */
export function setPrimaryModule(moduleName: string): LicenseMetadata {
  const license = getLicense();
  license.selected_primary_module = normalizeModuleName(moduleName);
  saveLicense(license);
  return license;
}

/**
 * Mengaktifkan lisensi Pro dengan Serial Key
 */
export function activateLicenseKey(
  serialKey: string,
  tier: 'basic' | 'core' | 'corporate' = 'corporate',
  durationMonths: number = 12
): { success: boolean; message: string; license?: LicenseMetadata } {
  const cleanKey = (serialKey || '').trim().toUpperCase();

  // Validasi format minimal serial key (misal: UQ-xxxx-xxxx atau PRO-xxxx)
  if (cleanKey.length < 8) {
    return {
      success: false,
      message: 'Format serial number lisensi tidak valid (minimal 8 karakter)'
    };
  }

  const license = getLicense();
  const now = new Date();
  const expireDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  license.is_paid = true;
  license.status = 'pro_active';
  license.paid_tier = tier;
  license.paid_expires_at = expireDate.toISOString();
  license.license_key = cleanKey;
  license.last_validated_at = now.toISOString();

  saveLicense(license);

  return {
    success: true,
    message: `Lisensi ${tier.toUpperCase()} Pro berhasil diaktifkan hingga ${expireDate.toLocaleDateString('id-ID')}!`,
    license
  };
}

/**
 * Utilitas simulator uji coba status lisensi (Development Tools)
 */

/**
 * 1. simulateExpireTrial()
 * Memajukan tanggal trial_ends_at ke masa lalu untuk menguji fungsi auto-downgrade ke 'free_lifetime'.
 */
export function simulateExpireTrial(): LicenseMetadata {
  const license = getLicense();
  license.is_paid = false;
  license.status = 'free_lifetime';
  // Tetapkan trial_ends_at 3 hari yang lalu
  license.trial_ends_at = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  license.paid_expires_at = null;
  license.paid_tier = null;
  license.last_validated_at = new Date().toISOString();
  saveLicense(license);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', { detail: license }));
  }
  return license;
}

/**
 * Alias untuk backward compatibility
 */
export const simulateTrialExpiryForTesting = simulateExpireTrial;

/**
 * 2. simulatePaymentSuccess()
 * Mengubah lisensi lokal langsung ke 'paid_plan' ('pro_active') untuk menguji pembukaan seluruh modul ekosistem.
 */
export function simulatePaymentSuccess(
  tier: 'basic' | 'core' | 'corporate' = 'corporate',
  durationMonths: number = 12
): LicenseMetadata {
  const license = getLicense();
  const now = new Date();
  const expireDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  license.is_paid = true;
  license.status = 'pro_active';
  license.paid_tier = tier;
  license.paid_expires_at = expireDate.toISOString();
  license.license_key = `UQ-PAY-${tier.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  license.last_validated_at = now.toISOString();
  saveLicense(license);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', { detail: license }));
  }
  return license;
}

/**
 * Reset masa trial ke 10 hari baru (khusus demonstrasi / pengujian)
 */
export function resetTrialForTesting(): LicenseMetadata {
  const license = getLicense();
  const now = new Date();
  license.is_paid = false;
  license.status = 'trial';
  license.registered_at = now.toISOString();
  license.trial_ends_at = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  license.paid_expires_at = null;
  license.license_key = null;
  saveLicense(license);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', { detail: license }));
  }
  return license;
}

