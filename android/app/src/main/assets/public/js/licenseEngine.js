/**
 * UsahaQu v1.83 - License & Entitlement Engine (licenseEngine.js)
 * ES6 Module murni untuk penanganan lisensi lokal, kalkulasi Trial 10 Hari,
 * Freemium Hybrid Fallback ('free_lifetime'), dan kontrol akses modul/fitur.
 */

export const LICENSE_STORAGE_KEY = 'usahaqu_license_v183';
export const APP_VERSION = '1.83';
export const TRIAL_DURATION_DAYS = 10;

/**
 * Daftar fitur berbayar (premium) yang dibatasi pada mode free_lifetime
 */
export const PREMIUM_FEATURES = [
  'wa_gateway',           // Broadcast WhatsApp / Notifikasi WA otomatis
  'cloud_sync',           // Sinkronisasi data cloud multi-perangkat
  'export_excel',         // Ekspor laporan format Excel / Spreadsheet
  'multi_branch',         // Multi-cabang & outlet
  'multi_device',         // Tautkan HP staf tanpa batas
  'custom_print_logo',    // Logo nota cetak kustom
  'auto_backup_cloud'     // Auto backup cloud harian
];

/**
 * Menormalisasi nama modul ke 5 id standar ekosistem UsahaQu
 * @param {string} rawName 
 * @returns {'bengkel' | 'kedai' | 'klinik' | 'ritel' | 'titip'}
 */
export function normalizeModuleName(rawName) {
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
 * @returns {string}
 */
export function getOrCreateDeviceId() {
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
 * Inisialisasi metadata lisensi baru saat pertama kali aplikasi diinstall.
 * Menghitung registered_at dan menetapkan trial_ends_at (+10 hari).
 * 
 * @param {string} [primaryModule='bengkel'] - Modul utama default terpilih
 * @param {string} [businessName='Usaha Mandiri Berkah'] - Nama usaha
 * @param {string} [ownerName='Pemilik Usaha'] - Nama pemilik
 * @returns {object} Metadata lisensi terinisialisasi
 */
export function initLicense(primaryModule = 'bengkel', businessName = 'Usaha Mandiri Berkah', ownerName = 'Pemilik Usaha') {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const newLicense = {
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
 * @param {object} license 
 */
export function saveLicense(license) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license));
  } catch (e) {
    console.error('Gagal menyimpan metadata lisensi UsahaQu:', e);
  }
}

/**
 * Mengambil dan mengevaluasi status lisensi saat ini.
 * 
 * LOGIKA FREEMIUM HYBRID FALLBACK:
 * - Jika tanggal saat ini melewati trial_ends_at dan is_paid = false,
 *   maka status lisensi otomatis dialihkan ke 'free_lifetime'.
 * - Jika is_paid = true dan masa berbayar habis, fallback ke 'free_lifetime'.
 * 
 * @returns {object} Metadata lisensi ter-update
 */
export function getLicense() {
  if (typeof window === 'undefined') {
    return initLicense();
  }

  const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
  let license;

  if (!raw) {
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

  // Evaluasi lisensi berbayar
  if (license.is_paid) {
    if (license.paid_expires_at) {
      const expiresMs = new Date(license.paid_expires_at).getTime();
      if (nowMs > expiresMs) {
        license.is_paid = false;
        license.status = 'free_lifetime';
        hasChanged = true;
      } else {
        license.status = 'pro_active';
      }
    } else {
      license.status = 'pro_active';
    }
  } else {
    // Evaluasi Trial vs Free Lifetime
    const trialEndMs = new Date(license.trial_ends_at).getTime();
    if (nowMs > trialEndMs) {
      // Melewati masa trial 10 hari -> aktifkan free_lifetime
      if (license.status !== 'free_lifetime') {
        license.status = 'free_lifetime';
        hasChanged = true;
      }
    } else {
      // Masih dalam 10 hari trial
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
 * Fungsi Helper Pengecekan Akses Modul: canAccessModule(moduleName)
 * 
 * Aturan Otorisasi:
 * - Pada status 'pro_active' & 'trial': Semua modul ekosistem mengembalikan TRUE.
 * - Pada status 'free_lifetime': Hanya modul utama terpilih (selected_primary_module)
 *   yang mengembalikan TRUE. Modul lain mengembalikan FALSE.
 * 
 * @param {string} moduleName - Nama modul ('bengkel' | 'kedai' | 'klinik' | 'ritel' | 'titip')
 * @returns {boolean} Apakah pengguna berhak mengakses modul ini
 */
export function canAccessModule(moduleName) {
  const license = getLicense();
  const targetModule = normalizeModuleName(moduleName);

  // 1. Pro Berbayar Aktif: Bebas akses semua modul
  if (license.is_paid && license.status === 'pro_active') {
    return true;
  }

  // 2. Masa Trial 10 Hari: Bebas akses semua modul
  if (license.status === 'trial') {
    return true;
  }

  // 3. Status 'free_lifetime': Hanya modul utama terpilih yang boleh dibuka
  if (license.status === 'free_lifetime') {
    return license.selected_primary_module === targetModule;
  }

  return false;
}

/**
 * Fungsi Helper Pengecekan Akses Fitur: canAccessFeature(featureKey)
 * 
 * Membatasi fitur premium berdasarkan status lisensi:
 * - 'pro_active': Mengembalikan TRUE untuk semua fitur.
 * - 'trial': Mengembalikan TRUE untuk semua fitur selama 10 hari masa uji coba.
 * - 'free_lifetime': Fitur premium ('wa_gateway', 'cloud_sync', 'export_excel', dll)
 *   mengembalikan FALSE. Fitur dasar kasir/stok lokal mengembalikan TRUE.
 * 
 * @param {string} featureKey - Kunci fitur yang ingin diperiksa
 * @returns {boolean} Apakah fitur diizinkan dibuka
 */
export function canAccessFeature(featureKey) {
  const license = getLicense();

  // 1. Lisensi Pro atau Trial aktif bebas membuka seluruh fitur
  if (license.status === 'pro_active' || license.status === 'trial') {
    return true;
  }

  // 2. Pada status 'free_lifetime', tolak fitur yang terdaftar dalam PREMIUM_FEATURES
  const isPremium = PREMIUM_FEATURES.includes(featureKey);
  if (isPremium) {
    return false;
  }

  // Fitur operasional lokal dasar diizinkan gratis selamanya
  return true;
}

/**
 * Menghitung sisa hari masa trial 10 hari
 * @returns {number} Sisa hari trial (0 jika sudah berakhir atau sudah pro)
 */
export function getTrialDaysRemaining() {
  const license = getLicense();
  if (license.is_paid || license.status !== 'trial') return 0;

  const nowMs = Date.now();
  const endMs = new Date(license.trial_ends_at).getTime();
  const diffMs = endMs - nowMs;

  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Mengubah modul utama terpilih untuk status free_lifetime
 * @param {string} moduleName 
 * @returns {object} Metadata lisensi ter-update
 */
export function setPrimaryModule(moduleName) {
  const license = getLicense();
  license.selected_primary_module = normalizeModuleName(moduleName);
  saveLicense(license);
  return license;
}

/**
 * Mengaktifkan Lisensi Pro dengan Serial Key
 * @param {string} serialKey 
 * @param {'basic' | 'core' | 'corporate'} [tier='corporate'] 
 * @param {number} [durationMonths=12] 
 * @returns {{ success: boolean, message: string, license?: object }}
 */
export function activateLicenseKey(serialKey, tier = 'corporate', durationMonths = 12) {
  const cleanKey = (serialKey || '').trim().toUpperCase();

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
 * Simulasi masa trial habis untuk keperluan pengujian / demo
 * @returns {object} Metadata lisensi dengan status 'free_lifetime'
 */
export function simulateTrialExpiryForTesting() {
  const license = getLicense();
  license.is_paid = false;
  license.status = 'free_lifetime';
  license.trial_ends_at = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  saveLicense(license);
  return license;
}

/**
 * Reset masa trial ke 10 hari baru untuk keperluan pengujian / demo
 * @returns {object} Metadata lisensi dengan status 'trial'
 */
export function resetTrialForTesting() {
  const license = getLicense();
  const now = new Date();
  license.is_paid = false;
  license.status = 'trial';
  license.registered_at = now.toISOString();
  license.trial_ends_at = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  license.paid_expires_at = null;
  license.license_key = null;
  saveLicense(license);
  return license;
}
