/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - License Testing Simulator (Development Tool)
 * Helper pengujian status lisensi offline-first:
 * 1. simulateExpireTrial(): Memajukan tanggal trial_ends_at ke masa lalu
 *    untuk menguji fungsi auto-downgrade ke status 'free_lifetime'.
 * 2. simulatePaymentSuccess(): Mengubah lisensi lokal langsung ke 'paid_plan'
 *    ('pro_active') untuk menguji pembukaan seluruh modul ekosistem UsahaQu.
 * 3. simulateResetTrial(): Mengembalikan masa trial ke 10 hari baru.
 * 4. simulateSwitchPrimaryModule(): Mengubah modul terpilih saat free_lifetime.
 * 5. getLicenseDiagnostics(): Laporan rinci status lisensi & matriks akses fitur.
 */

import { 
  getLicense, 
  saveLicense, 
  LicenseMetadata, 
  EcosystemModule, 
  canAccessModule, 
  canAccessFeature, 
  getTrialDaysRemaining,
  PREMIUM_FEATURES,
  normalizeModuleName
} from '../engine/licenseEngine';

export interface LicenseDiagnostics {
  status: string;
  isPaid: boolean;
  tier: string | null;
  registeredAt: string;
  trialEndsAt: string;
  trialDaysRemaining: number;
  paidExpiresAt: string | null;
  selectedPrimaryModule: EcosystemModule;
  modulesAccess: Record<EcosystemModule, boolean>;
  premiumFeaturesAccess: Record<string, boolean>;
  deviceId: string;
}

/**
 * 1. simulateExpireTrial()
 * Memajukan tanggal trial_ends_at ke masa lalu (misal 3 hari yang lalu),
 * menyetel is_paid = false, lalu memanggil evaluasi lisensi sehingga
 * otomatis terjadi downgrade ke 'free_lifetime'.
 */
export function simulateExpireTrial(): LicenseMetadata {
  const current = getLicense();
  const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 hari lalu

  current.is_paid = false;
  current.status = 'free_lifetime';
  current.trial_ends_at = pastDate.toISOString();
  current.paid_expires_at = null;
  current.paid_tier = null;
  current.last_validated_at = new Date().toISOString();

  saveLicense(current);

  // Sinkronkan ke bq_subscription untuk kompatibilitas UI React
  if (typeof window !== 'undefined') {
    const subState = {
      planId: 'free',
      planName: `Free Lifetime (${current.selected_primary_module.toUpperCase()})`,
      dailyRate: 0,
      trialStartDate: new Date(current.registered_at).getTime(),
      trialDurationDays: 10,
      isTrialActive: false,
      trialDaysRemaining: 0,
      isSubscribed: false,
      deviceId: current.device_id
    };
    localStorage.setItem('bq_subscription', JSON.stringify(subState));

    // Pancarkan event notifikasi update
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', { detail: current }));
  }

  console.log('[LicenseSimulator] Masa trial berhasil diakhiri! Status sekarang:', current.status);
  return current;
}

/**
 * 2. simulatePaymentSuccess()
 * Mengubah lisensi lokal langsung ke 'paid_plan' ('pro_active') dengan tier Corporate,
 * membuka seluruh 5 modul ekosistem (BengkelQu, KedaiQu, KlinikQu, RitelQu, TitipQu)
 * serta mengaktifkan seluruh fitur premium tanpa batasan.
 */
export function simulatePaymentSuccess(
  tier: 'basic' | 'core' | 'corporate' = 'corporate',
  durationMonths: number = 12
): LicenseMetadata {
  const current = getLicense();
  const now = new Date();
  const expires = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
  const simulatedKey = `UQ-${tier.toUpperCase()}-SIM-${Date.now().toString(36).toUpperCase()}`;

  current.is_paid = true;
  current.status = 'pro_active';
  current.paid_tier = tier;
  current.paid_expires_at = expires.toISOString();
  current.license_key = simulatedKey;
  current.last_validated_at = now.toISOString();

  saveLicense(current);

  // Sinkronkan ke bq_subscription untuk komponen React
  if (typeof window !== 'undefined') {
    const subState = {
      planId: tier,
      planName: `Full Pro Versi (${tier.toUpperCase()} - Terverifikasi)`,
      dailyRate: 0,
      trialStartDate: now.getTime(),
      trialDurationDays: 365,
      isTrialActive: false,
      trialDaysRemaining: 0,
      isSubscribed: true,
      deviceId: current.device_id
    };
    localStorage.setItem('bq_subscription', JSON.stringify(subState));

    // Pancarkan event notifikasi update
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', { detail: current }));
  }

  console.log(`[LicenseSimulator] Pembayaran sukses disimulasikan! Seluruh modul kini PRO AKTIF (${tier.toUpperCase()}).`);
  return current;
}

/**
 * 3. simulateResetTrial()
 * Mengembalikan masa percobaan ke 10 hari penuh dari sekarang.
 */
export function simulateResetTrial(): LicenseMetadata {
  const current = getLicense();
  const now = new Date();
  const endTrial = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  current.is_paid = false;
  current.status = 'trial';
  current.registered_at = now.toISOString();
  current.trial_ends_at = endTrial.toISOString();
  current.paid_expires_at = null;
  current.paid_tier = null;
  current.license_key = null;
  current.last_validated_at = now.toISOString();

  saveLicense(current);

  if (typeof window !== 'undefined') {
    const subState = {
      planId: 'trial',
      planName: 'Trial Premium (10 Hari)',
      dailyRate: 0,
      trialStartDate: now.getTime(),
      trialDurationDays: 10,
      isTrialActive: true,
      trialDaysRemaining: 10,
      isSubscribed: false,
      deviceId: current.device_id
    };
    localStorage.setItem('bq_subscription', JSON.stringify(subState));
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', { detail: current }));
  }

  console.log('[LicenseSimulator] Lisensi di-reset ke status Trial 10 Hari.');
  return current;
}

/**
 * 4. simulateSwitchPrimaryModule()
 * Mengubah modul utama saat status 'free_lifetime' untuk menguji modul mana yang terkunci vs terbuka.
 */
export function simulateSwitchPrimaryModule(moduleName: string): LicenseMetadata {
  const current = getLicense();
  current.selected_primary_module = normalizeModuleName(moduleName);
  saveLicense(current);

  if (typeof window !== 'undefined') {
    localStorage.setItem('usahaqu_type', current.selected_primary_module);
    window.dispatchEvent(new CustomEvent('usahaqu:license-updated', { detail: current }));
  }

  console.log(`[LicenseSimulator] Modul utama diubah menjadi: ${current.selected_primary_module}`);
  return current;
}

/**
 * 5. getLicenseDiagnostics()
 * Mengumpulkan diagnosa lengkap mengenai status lisensi, hak akses modul, dan fitur premium.
 */
export function getLicenseDiagnostics(): LicenseDiagnostics {
  const license = getLicense();
  const allModules: EcosystemModule[] = ['bengkel', 'kedai', 'klinik', 'ritel', 'titip'];

  const modulesAccess: Record<EcosystemModule, boolean> = {
    bengkel: canAccessModule('bengkel'),
    kedai: canAccessModule('kedai'),
    klinik: canAccessModule('klinik'),
    ritel: canAccessModule('ritel'),
    titip: canAccessModule('titip')
  };

  const premiumFeaturesAccess: Record<string, boolean> = {};
  PREMIUM_FEATURES.forEach(feature => {
    premiumFeaturesAccess[feature] = canAccessFeature(feature);
  });

  return {
    status: license.status,
    isPaid: license.is_paid,
    tier: license.paid_tier,
    registeredAt: license.registered_at,
    trialEndsAt: license.trial_ends_at,
    trialDaysRemaining: getTrialDaysRemaining(),
    paidExpiresAt: license.paid_expires_at,
    selectedPrimaryModule: license.selected_primary_module,
    modulesAccess,
    premiumFeaturesAccess,
    deviceId: license.device_id
  };
}
