/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';

export interface OnlineStoreConfig {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  address: string;
  operationalHours: string;
  isOpen: boolean;
  slug: string;
  announcement: string;
  allowTakeaway: boolean;
  allowDineIn: boolean;
  allowDelivery: boolean;
  updatedAt?: number;
}

export interface CatalogOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit?: string;
  variant?: string;
  notes?: string;
  photoUrl?: string;
  type?: 'product' | 'service' | 'medicine' | 'consultation';
}

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'booking_service';
  tableNumber?: string;
  bookingDate?: string;
  bookingTime?: string;
  vehiclePlate?: string;
  vehicleComplaint?: string;
  deliveryAddress?: string;
  notes?: string;
  items: CatalogOrderItem[];
  subtotal: number;
  total: number;
}

const STORAGE_KEY_PREFIX = 'usahaqu_store_cfg_';

export const DEFAULT_STORE_CONFIGS: Record<string, OnlineStoreConfig> = {
  bengkel: {
    storeName: 'BengkelQu Servis & Sparepart',
    tagline: 'Perawatan Berkala, Ganti Oli & Sparepart Asli',
    whatsappNumber: '6281234567890',
    address: 'Jl. Ahmad Yani No. 88, Sentra Otomotif',
    operationalHours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
    isOpen: true,
    slug: 'bengkelqu',
    announcement: 'Dapatkan diskon jasa servis 10% untuk booking hari ini!',
    allowTakeaway: true,
    allowDineIn: false,
    allowDelivery: true
  },
  kedai: {
    storeName: 'KedaiQu Kopi & Resto',
    tagline: 'Cita Rasa Nusantara & Racikan Kopi Istimewa',
    whatsappNumber: '6281234567890',
    address: 'Jl. Merdeka No. 45, Komplek Kuliner',
    operationalHours: 'Setiap Hari: 10:00 - 22:00 WIB',
    isOpen: true,
    slug: 'kedaiqu',
    announcement: 'Free WiFi & tempat nongkrong nyaman. Buka setiap hari!',
    allowTakeaway: true,
    allowDineIn: true,
    allowDelivery: true
  },
  ritel: {
    storeName: 'RitelQu Mart & Kelontong',
    tagline: 'Belanja Kebutuhan Harian Murah & Lengkap',
    whatsappNumber: '6281234567890',
    address: 'Jl. Gatot Subroto No. 12',
    operationalHours: 'Setiap Hari: 07:00 - 21:30 WIB',
    isOpen: true,
    slug: 'ritelqu',
    announcement: 'Siap antar untuk pesanan sekitar komplek!',
    allowTakeaway: true,
    allowDineIn: false,
    allowDelivery: true
  },
  klinik: {
    storeName: 'KlinikQu & Apotek Medika',
    tagline: 'Praktek Dokter, Resep & Suplemen Kesehatan',
    whatsappNumber: '6281234567890',
    address: 'Jl. Kesehatan No. 20',
    operationalHours: 'Senin - Sabtu: 08:00 - 21:00 WIB',
    isOpen: true,
    slug: 'klinikqu',
    announcement: 'Layanan konsultasi dokter umum & gigi tersedia.',
    allowTakeaway: true,
    allowDineIn: false,
    allowDelivery: true
  },
  titip: {
    storeName: 'TitipQu Sentra UMKM & Konsinyasi',
    tagline: 'Produk Lokal Pilihan, Camilan & Oleh-Oleh',
    whatsappNumber: '6281234567890',
    address: 'Jl. Diponegoro No. 101',
    operationalHours: 'Setiap Hari: 08:30 - 20:00 WIB',
    isOpen: true,
    slug: 'titipqu',
    announcement: 'Menerima pesanan grosir, reseller & kemitraan.',
    allowTakeaway: true,
    allowDineIn: false,
    allowDelivery: true
  }
};

/**
 * Normalisasi nomor WhatsApp ke standar internasional (62...)
 */
export function normalizeWhatsAppNumber(rawNumber: string): string {
  let cleaned = rawNumber.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned || '6281234567890';
}

/**
 * Format nomor WhatsApp untuk tampilan ramah pengguna (misal: 0812-3456-7890)
 */
export function formatDisplayPhone(rawNumber: string): string {
  let cleaned = rawNumber.replace(/\D/g, '');
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2);
  }
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  }
  return cleaned;
}

/**
 * Ambil konfigurasi toko online berdasarkan modul aktif
 */
export function getOnlineStoreConfig(moduleKey: string = 'bengkel'): OnlineStoreConfig {
  const key = `${STORAGE_KEY_PREFIX}${moduleKey}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return { ...DEFAULT_STORE_CONFIGS[moduleKey] || DEFAULT_STORE_CONFIGS.bengkel, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
  }
  return DEFAULT_STORE_CONFIGS[moduleKey] || DEFAULT_STORE_CONFIGS.bengkel;
}

/**
 * Simpan konfigurasi toko online
 */
export function saveOnlineStoreConfig(moduleKey: string, config: Partial<OnlineStoreConfig>): OnlineStoreConfig {
  const current = getOnlineStoreConfig(moduleKey);
  const updated: OnlineStoreConfig = {
    ...current,
    ...config,
    updatedAt: Date.now()
  };
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${moduleKey}`, JSON.stringify(updated));
  return updated;
}

/**
 * Buat URL Publik Toko Online
 */
export function getPublicStoreUrl(moduleKey: string, slug?: string): string {
  const cfg = getOnlineStoreConfig(moduleKey);
  const targetSlug = slug || cfg.slug || moduleKey;
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?toko=${encodeURIComponent(targetSlug)}&modul=${encodeURIComponent(moduleKey)}`;
}

/**
 * Generate QR Code data URL (PNG) resolusi tinggi menggunakan library qrcode
 */
export async function generateQrCodeDataUrl(url: string, size = 512): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('[QRCode Generate Error]:', err);
    throw err;
  }
}

/**
 * Unduh QR Code sebagai berkas PNG langsung
 */
export async function downloadQrCodePng(url: string, filename = 'qrcode-toko-online.png'): Promise<void> {
  const dataUrl = await generateQrCodeDataUrl(url, 600);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Format Pesanan Checkout ke Pesan WhatsApp Terstruktur
 */
export function buildWhatsAppOrderMessage(
  checkout: CheckoutData,
  storeConfig: OnlineStoreConfig
): string {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `🛒 *PESANAN BARU - ${storeConfig.storeName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 Waktu: ${dateFormatted}, ${timeFormatted} WIB\n\n`;

  // Identitas Pelanggan
  message += `👤 *DATA PEMESAN:*\n`;
  message += `• Nama: *${checkout.customerName}*\n`;
  message += `• No. WhatsApp: ${checkout.customerPhone}\n`;

  // Tipe Pesanan
  if (checkout.orderType === 'dine_in') {
    message += `• Tipe: *Makan di Tempat (Dine-in)*\n`;
    if (checkout.tableNumber) {
      message += `• Nomor Meja: *Meja ${checkout.tableNumber}*\n`;
    }
  } else if (checkout.orderType === 'takeaway') {
    message += `• Tipe: *Bungkus / Ambil Sendiri (Takeaway)*\n`;
  } else if (checkout.orderType === 'delivery') {
    message += `• Tipe: *Pesan Antar (Delivery)*\n`;
    if (checkout.deliveryAddress) {
      message += `• Alamat Kirim: ${checkout.deliveryAddress}\n`;
    }
  } else if (checkout.orderType === 'booking_service') {
    message += `• Tipe: *Jadwal Booking Servis Otomotif*\n`;
    if (checkout.bookingDate) message += `• Tanggal: *${checkout.bookingDate}*\n`;
    if (checkout.bookingTime) message += `• Jam: *${checkout.bookingTime} WIB*\n`;
    if (checkout.vehiclePlate) message += `• No. Polisi/Plat: *${checkout.vehiclePlate}*\n`;
    if (checkout.vehicleComplaint) message += `• Keluhan Kendaraan: ${checkout.vehicleComplaint}\n`;
  }

  message += `\n📦 *DAFTAR ITEM BELANJA:*\n`;
  checkout.items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}* (x${item.qty})\n`;
    if (item.variant) {
      message += `   ↳ Varian: ${item.variant}\n`;
    }
    if (item.notes) {
      message += `   ↳ Catatan: ${item.notes}\n`;
    }
    message += `   ↳ Subtotal: Rp ${(item.price * item.qty).toLocaleString('id-ID')}\n`;
  });

  message += `\n💰 *TOTAL PEMBAYARAN:* *Rp ${checkout.total.toLocaleString('id-ID')}*\n`;

  if (checkout.notes) {
    message += `\n📝 *Catatan Khusus:*\n${checkout.notes}\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_Pesanan ini dibuat melalui Katalog Digital UsahaQu v1.85._\n`;
  message += `Mohon konfirmasi dan estimasi waktu penyiapan/pengerjaan ya kak. Terima kasih! 🙏`;

  return message;
}

/**
 * Buka percakapan WhatsApp langsung
 */
export function openWhatsAppCheckout(
  checkout: CheckoutData,
  storeConfig: OnlineStoreConfig
): void {
  const phone = normalizeWhatsAppNumber(storeConfig.whatsappNumber);
  const text = buildWhatsAppOrderMessage(checkout, storeConfig);
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
