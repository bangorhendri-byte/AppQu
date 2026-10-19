/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - Progressive Web App Service Worker
 * Strategi Caching: Stale-While-Revalidate untuk File App Shell (HTML, CSS, JS, Assets)
 * 
 * ============================================================================
 * KEAMANAN PENYIMPANAN DATA (UPDATE RESILIENCE GUARANTEE):
 * Service Worker ini HANYA mengelola Cache Storage browser (Cache API) untuk aset statis.
 * Service Worker ini SAMA SEKALI TIDAK MENGUTAK-ATIK, TIDAK MERESET, DAN TIDAK MENGHAPUS:
 * 1. IndexedDB ('UsahaQu_v183_LocalDB' beserta seluruh 21 Stores Master & Transaksi)
 * 2. LocalStorage browser tempat preferensi, sesi, dan lisensi tersimpan
 * ============================================================================
 */

const CACHE_VERSION = 'v1.87.1';
const CACHE_NAME = `usahaqu-shell-${CACHE_VERSION}`;

// Aset statis inti untuk precaching
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/usahaku.html',
  '/manifest.json',
  '/icon.svg',
  '/public/manifest.json',
  '/public/icon.svg',
  '/public/js/indexedDbManager.js',
  '/public/js/licenseEngine.js',
  '/public/js/posCore.js'
];

/**
 * 1. INSTALL EVENT
 * Mengunduh aset penting ke Cache API dan langsung melewati masa tunggu
 */
self.addEventListener('install', (event) => {
  console.log(`[UsahaQu SW] Menginstall Service Worker (${CACHE_NAME})...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[UsahaQu SW] Menjalankan precache app shell...');
      // Menggunakan allSettled atau looping agar kegagalan 1 file tidak menggagalkan seluruh install
      return Promise.all(
        PRECACHE_ASSETS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`[UsahaQu SW] Precache lewati untuk ${url}:`, err);
          });
        })
      );
    }).then(() => {
      // Izinkan worker baru langsung aktif saat diminta
      return self.skipWaiting();
    })
  );
});

/**
 * 2. ACTIVATE EVENT
 * Membersihkan cache lama di Cache API.
 * PENTING: Proses ini terisolasi murni pada Cache API dan TIDAK MENYENTUH IndexedDB / LocalStorage!
 */
self.addEventListener('activate', (event) => {
  console.log(`[UsahaQu SW] Mengaktifkan Service Worker (${CACHE_NAME})...`);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name.startsWith('usahaqu-')) {
            console.log(`[UsahaQu SW] Menghapus cache versi usang: ${name} (IndexedDB & LocalStorage 100% Terjaga Aman)`);
            return caches.delete(name);
          }
          return Promise.resolve(false);
        })
      );
    }).then(() => {
      console.log('[UsahaQu SW] Mengambil alih klien (clients.claim)...');
      return self.clients.claim();
    })
  );
});

/**
 * 3. FETCH EVENT: Stale-While-Revalidate Strategy
 * - Permintaan API (/api/*) atau ekstensi chrome: dilewatkan langsung ke Network
 * - Aset Navigasi / HTML / CSS / JS / Media: kembalikan dari Cache seketika (Stale),
 *   sambil mengunduh pembaruan terbaru di latar belakang (Revalidate) dan memperbarui Cache.
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan tangani permintaan non-HTTP (misal chrome-extension:// atau socket://)
  if (!url.protocol.startsWith('http')) return;

  // Endpoint API backend dan TriPay Webhook: Network Only (tidak dicache agar selalu real-time)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Khusus method POST/PUT/DELETE: Network only
  if (request.method !== 'GET') {
    return;
  }

  // STRATEGI STALE-WHILE-REVALIDATE:
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);

      // Jalankan network fetch di latar belakang untuk memperbarui cache
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            // Update cache dengan respon terbaru
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch((fetchError) => {
          // Jika offline dan gagal fetch, tetap tenang karena cachedResponse akan digunakan
          return cachedResponse;
        });

      // Kembalikan versi cache langsung jika tersedia (Stale), atau tunggu fetch jika belum pernah dicache
      return cachedResponse || fetchPromise;
    })
  );
});

/**
 * 4. MESSAGE EVENT
 * Mendukung sinyal SKIP_WAITING dari UI aplikasi saat pengguna menekan tombol pembaruan
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[UsahaQu SW] Menerima instruksi SKIP_WAITING dari aplikasi...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'PING_VERSION') {
    event.ports[0]?.postMessage({
      version: CACHE_VERSION,
      cacheName: CACHE_NAME,
      status: 'active'
    });
  }
});
