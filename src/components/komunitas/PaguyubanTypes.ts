/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PaguyubanQu & SiagaQu Types - Klaster Komunitas Warga AppQu
 * Terintegrasi penuh dengan Klaster UsahaQu (Bengkel, Kedai, Ritel, Klinik, CustomerQu)
 */

export type KomunitasRole = 
  | 'Warga'              // Warga Biasa
  | 'Ketua RT'           // Approver Surat & Tanggap Darurat Utama
  | 'Wakil RT'           // Backup Approver
  | 'Bendahara'          // Pengelola Kas & OCR Iuran
  | 'Sekretaris'         // Administrasi & Verifikator Surat WargaQu
  | 'Satpam / Ronda'     // Petugas Patroli QR & Emergency Responder
  | 'Pelaku Usaha'       // Mitra Lapak UsahaQu
  | 'Governance / Pemda';// Oversight Gubernur / Camat / Lurah (Dashboard Agregat)

export interface WargaMember {
  id: string;
  name: string;
  nikMasked: string;     // Misal: 3273********0004
  phone: string;
  alamatBlok: string;    // Misal: Blok B3 No. 08
  rtRw: string;          // RT 001 / RW 005
  statusHunian: 'Pemilik Tetap' | 'Warga Kontrak';
  roles: KomunitasRole[];
  avatar: string;
  emergencyContact?: string;
  golonganDarah?: string;
}

export interface CommunityFeedItem {
  id: string;
  authorName: string;
  authorRoleBadge: string;
  authorAvatar: string;
  type: 'PENGUMUMAN_RESMI' | 'KEGIATAN_AGENDA' | 'ASPIRASI_WARGA' | 'LAPAK_PROMO' | 'TANGGAP_DUKA';
  title: string;
  content: string;
  timestamp: string;
  eventDate?: string;
  eventLocation?: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  lapakProduct?: {
    businessName: string;
    productName: string;
    price: number;
    businessType: 'bengkel' | 'kedai' | 'ritel' | 'klinik' | 'titip' | 'keliling';
    phone: string;
    unit?: string;
  };
}

export interface KasTransactionItem {
  id: string;
  title: string;
  category: 'Iuran Bulanan' | 'Donasi Duka' | 'Kebersihan & Sampah' | 'Perbaikan Fasilitas' | 'Operasional Ronda' | 'Santunan Warga';
  amount: number;
  isIncome: boolean;
  payerName?: string;
  date: string;
  receiptNumber: string;
  proofImageUrl?: string;
  isOcrVerified?: boolean;
  status: 'Lunas' | 'Pending Verifikasi';
}

export interface SuratPengantarItem {
  id: string;
  letterNumber?: string;
  applicantName: string;
  applicantNikMasked: string;
  applicantAddress: string;
  type: 'Pengantar SKCK' | 'Keterangan Domisili' | 'Keterangan Kematian / Duka' | 'Keterangan Usaha (SKU)' | 'Pengantar Nikah';
  purpose: string;
  status: 'Menunggu Verifikasi' | 'Disetujui RT' | 'Selesai' | 'Ditolak';
  submittedDate: string;
  approvedBy?: string;
  notes?: string;
}

export interface EmergencyAlertItem {
  id: string;
  triggerName: string;
  triggerAddress: string;
  phone: string;
  coords: [number, number];
  type: 'KEMALINGAN' | 'KEBAKARAN' | 'MEDIS DARURAT' | 'KERIBUTAN';
  timestamp: number;
  status: 'ACTIVE_SIREN' | 'INVESTIGATING' | 'HANDLED';
  nearestCctv: string;
  cctvStreamUrl?: string;
}

export interface RondaCheckpointItem {
  id: string;
  qrCodeToken: string;
  name: string;
  locationDescription: string;
  lastScannedTime?: string;
  lastScannedBy?: string;
  status: 'Aman' | 'Belum Patroli' | 'Terlewat';
  targetSchedule: string;
}

export interface TanggapDukaItem {
  id: string;
  wargaName: string;
  familyContact: string;
  blokAddress: string;
  statusType: 'Duka Cita' | 'Warga Sakit / Rawat Inap';
  dateReported: string;
  description: string;
  donationTarget: number;
  donationCollected: number;
  piketTakziahList: string[];
}
