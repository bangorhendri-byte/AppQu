/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu In-App Auto-Update Checker
 * Memeriksa pembaruan rilis terbaru dari server / GitHub Releases secara otomatis
 * dan memberikan opsi unduh & pasang langsung di HP pengguna.
 */

export interface AppVersionInfo {
  appName: string;
  version: string;
  versionCode: number;
  releaseDate: string;
  minSupportedVersion?: string;
  changelog: string;
  downloadUrl: string;
  isUpdateAvailable?: boolean;
}

export const CURRENT_APP_VERSION = '1.87.1';
export const CURRENT_VERSION_CODE = 88;

/**
 * Bandingkan dua versi semver (misal '1.86.0' vs '1.87.0')
 * Mengembalikan:
 *  1 jika v1 > v2
 * -1 jika v1 < v2
 *  0 jika sama
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const clean2 = v2.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(clean1.length, clean2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = clean1[i] || 0;
    const num2 = clean2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Periksa rilis pembaruan aplikasi
 * Sumber pengecekan:
 * 1. File `/version.json` dari host server aplikasi
 * 2. Fallback ke GitHub Releases API jika repo dikonfigurasi
 */
export async function checkForAppUpdate(repoSlug?: string): Promise<AppVersionInfo | null> {
  try {
    // 1. Coba periksa file version.json lokal / hosting
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (res.ok) {
      const data: AppVersionInfo = await res.json();
      const hasNewer = compareSemver(data.version, CURRENT_APP_VERSION) > 0 || Boolean(data.versionCode && data.versionCode > CURRENT_VERSION_CODE);
      return {
        ...data,
        isUpdateAvailable: Boolean(hasNewer)
      };
    }
  } catch (err) {
    console.warn('[UpdateChecker] Gagal memeriksa version.json lokal:', err);
  }

  // 2. Fallback jika repoSlug disediakan (contoh: "usahaqu/usahaqu-app")
  if (repoSlug) {
    try {
      const gitRes = await fetch(`https://api.github.com/repos/${repoSlug}/releases/latest`, {
        cache: 'no-cache'
      });
      if (gitRes.ok) {
        const release = await gitRes.json();
        const releaseTag = (release.tag_name || '').replace(/^v/, '');
        const apkAsset = (release.assets || []).find((a: any) => a.name.endsWith('.apk'));
        const downloadUrl = apkAsset ? apkAsset.browser_download_url : release.html_url;

        const hasNewer = compareSemver(releaseTag, CURRENT_APP_VERSION) > 0;
        return {
          appName: 'Usaha Qu',
          version: releaseTag || CURRENT_APP_VERSION,
          versionCode: CURRENT_VERSION_CODE + (hasNewer ? 1 : 0),
          releaseDate: release.published_at ? release.published_at.slice(0, 10) : 'Terbaru',
          changelog: release.body || 'Pembaruan fitur & perbaikan bug.',
          downloadUrl: downloadUrl || 'https://github.com',
          isUpdateAvailable: hasNewer
        };
      }
    } catch (err) {
      console.warn('[UpdateChecker] Gagal memeriksa GitHub Release:', err);
    }
  }

  return null;
}
