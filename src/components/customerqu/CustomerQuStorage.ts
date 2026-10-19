/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQu Storage & Utilities
 * - Database sinkronisasi lokal offline-first
 * - Audio Chime Synthesizer (Web Audio API murni tanpa asset eksternal)
 * - Pembersihan otomatis riwayat chat setelah 24 jam
 * - Perhitungan jarak geolokasi (Haversine Formula)
 */

import { 
  SellerMarker, 
  CustomerQuProduct, 
  BuyerPingAlert, 
  InAppChatMessage, 
  BookingOrder 
} from './CustomerQuTypes';

// Titik Pusat Default Peta (Bandung Kota / Area Urban Ramai)
export const DEFAULT_MAP_CENTER: [number, number] = [-6.917464, 107.619122];

/**
 * 1. SYNTHESIZER AUDIO BELL CHIME (Web Audio API)
 * Menghasilkan suara dering bel pintu / chime jernih saat tombol [ 🔔 Panggil Ke Sini ] ditekan.
 * Berjalan 100% offline di semua browser tanpa perlu file MP3 eksternal.
 */
export function playCustomerPingChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Nada pertama (High Chime: 880Hz / A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Nada kedua (Warm Bell: 659.25Hz / E5) setelah delay 150ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.9);
  } catch (err) {
    console.warn('[AudioChime] Tidak dapat memutar audio:', err);
  }
}

/**
 * 2. CHIME NOTIFIKASI PESAN IN-APP CHAT
 */
export function playMessageAlertChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn('[MessageAudio] Gagal play audio:', err);
  }
}

/**
 * 3. HAVERSINE FORMULA (Hitung Jarak Koordinat dalam Meter / Km)
 */
export function calculateDistanceMeters(
  coords1: [number, number],
  coords2: [number, number]
): number {
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistanceString(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * 4. SEED DATA PEDAGANG KELILING, MANGKAL & TOKO OFFLINE
 */
export const INITIAL_SELLERS: SellerMarker[] = [
  {
    id: 'seller-1',
    name: 'Bakso Malang & Siomay Mang Bejo',
    ownerName: 'Mang Bejo',
    phone: '081298765432',
    category: 'Kuliner',
    type: 'keliling',
    status: 'moving',
    coords: [-6.9182, 107.6185],
    avatar: '🍜',
    vehicleType: 'gerobak_motor',
    speedKmh: 12,
    addressDescription: 'Sedang melintas di Jl. Braga arah Asia Afrika',
    rating: 4.9,
    reviewCount: 142,
    products: [
      { id: 'p1-1', name: 'Bakso Campur Komplit Urat', category: 'Makanan', price: 18000, stock: 14, unit: 'Porsi', isAvailable: true },
      { id: 'p1-2', name: 'Siomay Kukus Bumbu Kacang', category: 'Makanan', price: 15000, stock: 4, unit: 'Porsi', isAvailable: true },
      { id: 'p1-3', name: 'Pangsit Goreng Renyah (3 pcs)', category: 'Camilan', price: 6000, stock: 2, unit: 'Bks', isAvailable: true },
      { id: 'p1-4', name: 'Es Teh Manis Segar', category: 'Minuman', price: 5000, stock: 0, unit: 'Cup', isAvailable: false }
    ],
    lastMovedTimestamp: Date.now()
  },
  {
    id: 'seller-2',
    name: 'Sayur Segar & Tahu Tempe Bu Aminah',
    ownerName: 'Ibu Aminah',
    phone: '081387654321',
    category: 'Sayur & Sembako',
    type: 'keliling',
    status: 'moving',
    coords: [-6.9161, 107.6208],
    avatar: '🥬',
    vehicleType: 'gerobak_dorong',
    speedKmh: 4,
    addressDescription: 'Memasuki Gang Kebon Sirih No. 4',
    rating: 4.8,
    reviewCount: 96,
    products: [
      { id: 'p2-1', name: 'Kangkung & Bayam Segar Ikat', category: 'Sayuran', price: 4000, stock: 8, unit: 'Ikat', isAvailable: true },
      { id: 'p2-2', name: 'Tempe Daun Tradisional Gurih', category: 'Lauk', price: 5000, stock: 3, unit: 'Papan', isAvailable: true },
      { id: 'p2-3', name: 'Tahu Sutra Putih Bersih (10 pcs)', category: 'Lauk', price: 7000, stock: 5, unit: 'Bks', isAvailable: true },
      { id: 'p2-4', name: 'Cabai Rawit Merah Segar (100g)', category: 'Bumbu', price: 6000, stock: 0, unit: 'Pack', isAvailable: false }
    ],
    lastMovedTimestamp: Date.now()
  },
  {
    id: 'seller-3',
    name: 'Es Cendol & Cincau Segar Mang Ujang',
    ownerName: 'Mang Ujang',
    phone: '081577889900',
    category: 'Kuliner',
    type: 'keliling',
    status: 'moving',
    coords: [-6.9198, 107.6225],
    avatar: '🍧',
    vehicleType: 'sepeda',
    speedKmh: 8,
    addressDescription: 'Di depan SD Karangpawitan Jl. Veteran',
    rating: 4.9,
    reviewCount: 88,
    products: [
      { id: 'p3-1', name: 'Es Cendol Nangka Santan Murni', category: 'Minuman', price: 10000, stock: 20, unit: 'Gelas', isAvailable: true },
      { id: 'p3-2', name: 'Es Cincau Hijau Gula Aren', category: 'Minuman', price: 9000, stock: 3, unit: 'Gelas', isAvailable: true },
      { id: 'p3-3', name: 'Topping Durian Asli', category: 'Tambahan', price: 5000, stock: 0, unit: 'Porsi', isAvailable: false }
    ],
    lastMovedTimestamp: Date.now()
  },
  {
    id: 'seller-4',
    name: 'Bengkel & Tambal Ban Keliling Mas Anto',
    ownerName: 'Mas Anto',
    phone: '081912345678',
    category: 'Jasa Keliling',
    type: 'keliling',
    status: 'moving',
    coords: [-6.9152, 107.6162],
    avatar: '🏍️',
    vehicleType: 'gerobak_motor',
    speedKmh: 20,
    addressDescription: 'Siap dipanggil servis mogok sekitar Tamblong - Otista',
    rating: 5.0,
    reviewCount: 114,
    products: [
      { id: 'p4-1', name: 'Jasa Tambal Ban Tubeless Cepat', category: 'Servis', price: 15000, stock: 25, unit: 'Titik', isAvailable: true },
      { id: 'p4-2', name: 'Ganti Ban Dalam Motor Matic', category: 'Part', price: 45000, stock: 2, unit: 'Pcs', isAvailable: true },
      { id: 'p4-3', name: 'Jumper Aki / Cas Motor Mogok', category: 'Servis', price: 25000, stock: 10, unit: 'Kali', isAvailable: true },
      { id: 'p4-4', name: 'Oli Mesin Matic 0.8L (Bawaan)', category: 'Part', price: 55000, stock: 4, unit: 'Botol', isAvailable: true }
    ],
    lastMovedTimestamp: Date.now()
  },
  {
    id: 'seller-5',
    name: 'Nasi Goreng & Mie Dok-Dok Mas Sigit',
    ownerName: 'Mas Sigit',
    phone: '081399887766',
    category: 'Kuliner',
    type: 'ngetem',
    status: 'parked',
    coords: [-6.9192, 107.6158],
    avatar: '🍳',
    vehicleType: 'gerobak_motor',
    speedKmh: 0,
    addressDescription: 'Ngetem di Pertigaan Pos Kamling Jl. Naripan',
    rating: 4.7,
    reviewCount: 205,
    products: [
      { id: 'p5-1', name: 'Nasi Goreng Spesial Telur Ceplok', category: 'Makanan', price: 16000, stock: 22, unit: 'Porsi', isAvailable: true },
      { id: 'p5-2', name: 'Mie Dok-Dok Kuah Nyemek Pedas', category: 'Makanan', price: 17000, stock: 5, unit: 'Porsi', isAvailable: true },
      { id: 'p5-3', name: 'Kwetiau Goreng Seafood', category: 'Makanan', price: 20000, stock: 0, unit: 'Porsi', isAvailable: false }
    ],
    lastMovedTimestamp: Date.now()
  },
  {
    id: 'seller-6',
    name: 'Bengkel Qu Motor Berkah Jaya (Toko Utama)',
    ownerName: 'Bpk. Ahmad Fauzi',
    phone: '081234567890',
    category: 'Otomotif & Servis',
    type: 'toko_offline',
    status: 'open',
    coords: [-6.917464, 107.619122],
    avatar: '🏬',
    vehicleType: 'toko_fisik',
    speedKmh: 0,
    addressDescription: 'Jl. Otto Iskandardinata No. 128 (Toko Fisik Buka)',
    rating: 4.9,
    reviewCount: 380,
    isLivePOSLinked: true,
    isCurrentMerchant: true,
    products: [
      { id: 'sp-1', name: 'Oli Mesin MPX2 Matic 0.8L', category: 'Oli & Pelumas', price: 54000, stock: 18, unit: 'Botol', isAvailable: true },
      { id: 'sp-2', name: 'Kampas Rem Depan Honda Beat/Vario', category: 'Sistem Rem', price: 42000, stock: 7, unit: 'Set', isAvailable: true },
      { id: 'sp-3', name: 'Busi Standar Denso U24EPR9', category: 'Kelistrikan', price: 18000, stock: 3, unit: 'Pcs', isAvailable: true },
      { id: 'sp-4', name: 'Ban Luar Tubeless Tubetype 90/90-14', category: 'Ban', price: 185000, stock: 2, unit: 'Pcs', isAvailable: true }
    ],
    lastMovedTimestamp: Date.now()
  },
  {
    id: 'seller-7',
    name: 'Toko Kelontong & Sembako Berkah RitelQu',
    ownerName: 'Ibu Hj. Maryam',
    phone: '081288776655',
    category: 'Kelontong',
    type: 'toko_offline',
    status: 'open',
    coords: [-6.9168, 107.6235],
    avatar: '🏪',
    vehicleType: 'toko_fisik',
    speedKmh: 0,
    addressDescription: 'Jl. Tamblong No. 45 (Buka 07:00 - 22:00)',
    rating: 4.8,
    reviewCount: 165,
    isLivePOSLinked: true,
    products: [
      { id: 'rt-1', name: 'Beras Premium Ramos 5 Kg', category: 'Sembako', price: 74000, stock: 12, unit: 'Karung', isAvailable: true },
      { id: 'rt-2', name: 'Minyak Goreng Refill 2 Liter', category: 'Sembako', price: 34000, stock: 4, unit: 'Pouch', isAvailable: true },
      { id: 'rt-3', name: 'Gula Pasir Kristal 1 Kg', category: 'Sembako', price: 17500, stock: 1, unit: 'Bks', isAvailable: true },
      { id: 'rt-4', name: 'Telur Ayam Negeri Fresh 1 Kg', category: 'Sembako', price: 29000, stock: 0, unit: 'Kg', isAvailable: false }
    ],
    lastMovedTimestamp: Date.now()
  }
];

/**
 * 5. GET & SAVE SELLERS DENGAN SINKRONISASI STOK POS
 */
export function getSavedSellers(): SellerMarker[] {
  try {
    const raw = localStorage.getItem('cq_sellers_data');
    if (!raw) {
      localStorage.setItem('cq_sellers_data', JSON.stringify(INITIAL_SELLERS));
      return INITIAL_SELLERS;
    }
    const sellers: SellerMarker[] = JSON.parse(raw);

    // Sinkronisasi stok dari POS spareparts jika ada
    const posSparepartsRaw = localStorage.getItem('bq_spareparts');
    if (posSparepartsRaw) {
      try {
        const spareparts = JSON.parse(posSparepartsRaw);
        return sellers.map((s) => {
          if (s.isLivePOSLinked && s.isCurrentMerchant) {
            const updatedProducts = s.products.map((p) => {
              const matched = spareparts.find((sp: any) => sp.id === p.id || sp.name === p.name);
              if (matched) {
                return {
                  ...p,
                  stock: matched.stock,
                  price: matched.sellPrice || p.price,
                  isAvailable: matched.stock > 0
                };
              }
              return p;
            });
            return { ...s, products: updatedProducts };
          }
          return s;
        });
      } catch (e) {
        return sellers;
      }
    }

    return sellers;
  } catch (err) {
    return INITIAL_SELLERS;
  }
}

export function saveSellers(sellers: SellerMarker[]): void {
  localStorage.setItem('cq_sellers_data', JSON.stringify(sellers));
}

/**
 * 6. SIMULASI GERAKAN PEDAGANG KELILING (GPS Drift Update 15-30 detik)
 * Menggeser koordinat pedagang keliling secara halus di sepanjang jalan.
 */
export function simulateSellersMovement(sellers: SellerMarker[]): SellerMarker[] {
  const now = Date.now();
  return sellers.map((seller) => {
    if (seller.type !== 'keliling' || seller.status !== 'moving') {
      return seller;
    }

    // Pergeseran kecil realistis (sekitar 15-30 meter)
    const latDelta = (Math.random() - 0.5) * 0.00035;
    const lngDelta = (Math.random() - 0.5) * 0.00035;

    const newLat = seller.coords[0] + latDelta;
    const newLng = seller.coords[1] + lngDelta;
    const newSpeed = Math.floor(Math.random() * 8) + 6; // 6 - 14 km/h

    return {
      ...seller,
      coords: [newLat, newLng],
      speedKmh: newSpeed,
      lastMovedTimestamp: now
    };
  });
}

/**
 * 7. PING ALERT PEMBELI (TOMBOL PANGGIL KE SINI)
 */
export function getSavedBuyerPings(): BuyerPingAlert[] {
  try {
    const raw = localStorage.getItem('cq_buyer_pings');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveBuyerPing(ping: BuyerPingAlert): BuyerPingAlert[] {
  const current = getSavedBuyerPings();
  const updated = [ping, ...current];
  localStorage.setItem('cq_buyer_pings', JSON.stringify(updated));
  return updated;
}

export function updateBuyerPingStatus(
  pingId: string, 
  status: BuyerPingAlert['status']
): BuyerPingAlert[] {
  const current = getSavedBuyerPings();
  const updated = current.map((p) => p.id === pingId ? { ...p, status } : p);
  localStorage.setItem('cq_buyer_pings', JSON.stringify(updated));
  return updated;
}

/**
 * 8. IN-APP CHAT WITH AUTOMATIC 24-HOUR CLEANUP
 */
export function getSavedChatMessages(sellerId?: string): InAppChatMessage[] {
  try {
    const raw = localStorage.getItem('cq_chat_messages');
    if (!raw) return [];
    const all: InAppChatMessage[] = JSON.parse(raw);

    // Auto cleanup chat older than 24 hours
    const now = Date.now();
    const valid = all.filter((m) => m.expiresAt > now);

    if (valid.length !== all.length) {
      localStorage.setItem('cq_chat_messages', JSON.stringify(valid));
    }

    if (sellerId) {
      return valid.filter((m) => m.sellerId === sellerId);
    }
    return valid;
  } catch (err) {
    return [];
  }
}

export function saveChatMessage(msg: InAppChatMessage): InAppChatMessage[] {
  const current = getSavedChatMessages();
  const updated = [...current, msg];
  localStorage.setItem('cq_chat_messages', JSON.stringify(updated));
  return updated;
}

/**
 * 9. QUICK REPLY DRAFTS (BALASAN CEPAT 1-KLIK)
 */
export const BUYER_QUICK_REPLIES = [
  'Bisa mampir ke rumah saya sekarang?',
  'Tolong tunggu sebentar ya, saya keluar rumah.',
  'Masih ada porsi / stok yang tersedia?',
  'Saya ada di depan pagar rumah warna putih.',
  'Bisa bayar pakai QRIS / Tunai?'
];

export const SELLER_QUICK_REPLIES = [
  'Siap kak! Saya langsung meluncur ke lokasi Anda.',
  'Sudah dekat nih, sekitar 2 menit lagi sampai.',
  'Masih ada stok, mau pesan berapa porsi kak?',
  'Mohon ditunggu sebentar ya di depan.',
  'Bisa kak, terima QRIS maupun uang pas.'
];

/**
 * 10. BOOKING / PRE-ORDER RUTIN
 */
export function getSavedBookings(): BookingOrder[] {
  try {
    const raw = localStorage.getItem('cq_booking_orders');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveBookingOrder(booking: BookingOrder): BookingOrder[] {
  const current = getSavedBookings();
  const updated = [booking, ...current];
  localStorage.setItem('cq_booking_orders', JSON.stringify(updated));
  return updated;
}
