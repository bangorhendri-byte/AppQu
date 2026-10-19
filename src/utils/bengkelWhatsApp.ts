/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkshopProfile } from '../types';

export interface BengkelQueueMessageParams {
  queueNumber: string;
  plateNumber: string;
  customerName: string;
  customerPhone?: string;
  vehicleModel: string;
  vehicleType?: string;
  serviceCategory?: string;
  mechanicName?: string;
  timeIn?: string;
  date?: string;
  estimatedCompletion?: string;
  complaint?: string;
}

export interface BengkelWhatsAppResult {
  message: string;
  waUrl: string;
  catalogUrl: string;
  offlineCatalogUrl: string;
  rawPhone: string;
}

/**
 * Normalisasi nomor telepon ke format WhatsApp internasional (62xxxx)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Format pesan WhatsApp resmi tiket antrian servis dan katalog offline BengkelQu
 */
export function formatBengkelQueueWhatsAppMessage(
  queue: BengkelQueueMessageParams,
  profile?: WorkshopProfile
): BengkelWhatsAppResult {
  const workshopName = profile?.workshopName || 'Bengkel Qu Motor Berkah';
  const workshopPhone = profile?.phone || '081234567890';
  const workshopAddress = profile?.address || 'Jl. Raya Otomotif No. 88, Sentra Servis';

  const rawPhone = normalizeWhatsAppNumber(queue.customerPhone || '');
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Link Katalog Online Bengkel
  const catalogUrl = `${origin}${pathname}?toko=bengkelqu&modul=bengkel`;
  // Link Katalog Offline Mandiri (Single-File HTML yang siap diakses tanpa kuota)
  const offlineCatalogUrl = `${origin}/toko-bengkel.html`;

  const cleanComplaint = queue.complaint ? queue.complaint.trim() : 'Pemeriksaan rutin & servis berkala';

  const message = `*${workshopName.toUpperCase()}*
*BUKTI PENDAFTARAN & TIKET ANTRIAN SERVIS*
================================

Halo Bpk/Ibu *${queue.customerName}*,
Terima kasih telah melakukan pendaftaran servis di *${workshopName}*. Kendaraan Anda telah tercatat dalam sistem operasional antrian kami:

📋 *DETAIL TIKET ANTRIAN:*
• *Nomor Antrian : ${queue.queueNumber}*
• *Plat Nomor    : ${queue.plateNumber}*
• *Kendaraan     : ${queue.vehicleModel}${queue.vehicleType ? ` (${queue.vehicleType})` : ''}*
• *Kategori      : ${queue.serviceCategory || 'Servis Berkala'}*
• *Mekanik       : ${queue.mechanicName || 'Mekanik Ditugaskan'}*
• *Jam Masuk     : ${queue.timeIn || 'Hari Ini'} WIB*
• *Estimasi      : ${queue.estimatedCompletion || '45 Menit'}*
• *Keluhan       : ${cleanComplaint}*
--------------------------------
Status: *MENUNGGU SERVIS* ⏳

📖 *KATALOG SUKU CADANG & AKSESORIS:*
Sambil bersantai menunggu kendaraan dikerjakan, Anda dapat melihat daftar harga suku cadang asli, oli mesin resmi, aksesoris, serta paket perawatan kami melalui tautan berikut:
👉 *Katalog Digital :* ${catalogUrl}

🌐 *Katalog Offline Mandiri (Hemat Kuota):*
👉 *Akses Offline  :* ${offlineCatalogUrl}

Jika ada suku cadang yang perlu konfirmasi penggantian, teknisi kami akan segera mengabari Anda melalui nomor WhatsApp ini.

📍 *${workshopName}*
${workshopAddress}
Layanan Pelanggan: wa.me/${normalizeWhatsAppNumber(workshopPhone)}

_Semoga berkendara selalu aman dan nyaman!_ 🙏`;

  const waUrl = rawPhone
    ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return {
    message,
    waUrl,
    catalogUrl,
    offlineCatalogUrl,
    rawPhone
  };
}

/**
 * Salin pesan ke clipboard
 */
export async function copyMessageToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Gagal menyalin teks ke clipboard:', err);
    return false;
  }
}
