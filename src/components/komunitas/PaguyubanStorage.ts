/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PaguyubanStorage - Offline-First Storage & Service Layer untuk PaguyubanQu & SiagaQu
 * - Sinkronisasi otomatis Katalog Produk UsahaQu ke Lapak Warga
 * - Data Induk Warga, Kas Transparan, Surat Pengantar, Checkpoint Ronda & Panic Button
 */

import { 
  WargaMember, 
  CommunityFeedItem, 
  KasTransactionItem, 
  SuratPengantarItem, 
  EmergencyAlertItem, 
  RondaCheckpointItem,
  TanggapDukaItem,
  KomunitasRole
} from './PaguyubanTypes';

export const INITIAL_MEMBERS: WargaMember[] = [
  {
    id: 'w-1',
    name: 'Bpk. Ahmad Fauzi',
    nikMasked: '3273********0001',
    phone: '081234567890',
    alamatBlok: 'Blok A1 No. 04',
    rtRw: 'RT 001 / RW 005',
    statusHunian: 'Pemilik Tetap',
    roles: ['Ketua RT', 'Pelaku Usaha', 'Warga'],
    avatar: '👨‍💼',
    emergencyContact: '081234567891 (Istri)',
    golonganDarah: 'O'
  },
  {
    id: 'w-2',
    name: 'Ibu Hj. Siti Aminah',
    nikMasked: '3273********0002',
    phone: '081387654321',
    alamatBlok: 'Blok B2 No. 12',
    rtRw: 'RT 001 / RW 005',
    statusHunian: 'Pemilik Tetap',
    roles: ['Bendahara', 'Warga'],
    avatar: '👩‍💼',
    emergencyContact: '081387654329 (Suami)',
    golonganDarah: 'A'
  },
  {
    id: 'w-3',
    name: 'Bpk. Hendra Gunawan',
    nikMasked: '3273********0003',
    phone: '081599887766',
    alamatBlok: 'Blok C3 No. 07',
    rtRw: 'RT 001 / RW 005',
    statusHunian: 'Pemilik Tetap',
    roles: ['Sekretaris', 'Warga'],
    avatar: '📝',
    emergencyContact: '081599887760',
    golonganDarah: 'B'
  },
  {
    id: 'w-4',
    name: 'Pak Sugeng (Komandan Ronda)',
    nikMasked: '3273********0004',
    phone: '085711223344',
    alamatBlok: 'Pos Satpam Utama',
    rtRw: 'RT 001 / RW 005',
    statusHunian: 'Pemilik Tetap',
    roles: ['Satpam / Ronda'],
    avatar: '👮',
    emergencyContact: '085711223340',
    golonganDarah: 'AB'
  },
  {
    id: 'w-5',
    name: 'Mang Bejo (Bakso Malang)',
    nikMasked: '3273********0005',
    phone: '081298765432',
    alamatBlok: 'Gang Melati No. 02',
    rtRw: 'RT 001 / RW 005',
    statusHunian: 'Warga Kontrak',
    roles: ['Pelaku Usaha', 'Warga'],
    avatar: '🍜',
    emergencyContact: '081298765430',
    golonganDarah: 'O'
  },
  {
    id: 'w-6',
    name: 'Drs. H. Bambang Soediro (Lurah)',
    nikMasked: '3273********0099',
    phone: '081122334455',
    alamatBlok: 'Kantor Kelurahan Merdeka',
    rtRw: 'Kelurahan Sukamaju',
    statusHunian: 'Pemilik Tetap',
    roles: ['Governance / Pemda'],
    avatar: '🏛️',
    emergencyContact: '022-778899 (Piket Kelurahan)',
    golonganDarah: 'A'
  }
];

export const INITIAL_FEEDS: CommunityFeedItem[] = [
  {
    id: 'f-1',
    authorName: 'Bpk. Ahmad Fauzi (Ketua RT 01)',
    authorRoleBadge: 'Ketua RT',
    authorAvatar: '👨‍💼',
    type: 'PENGUMUMAN_RESMI',
    title: '📢 Jadwal Kerja Bakti & Pengasapan (Fogging) DBD Serentak',
    content: 'Diberitahukan kepada seluruh warga RT 001 / RW 005, hari Minggu ini pukul 07.30 WIB akan diadakan kerja bakti serentak pembersihan saluran air dan fogging jentik nyamuk. Mohon pintu pagar dan penampungan air disiapkan.',
    timestamp: '2 jam yang lalu',
    eventDate: 'Minggu, 25 Oktober 2026',
    eventLocation: 'Lapangan Balai Warga RT 01',
    likeCount: 24,
    commentCount: 8
  },
  {
    id: 'f-2',
    authorName: 'Ibu Hj. Siti Aminah (Bendahara RT)',
    authorRoleBadge: 'Bendahara',
    authorAvatar: '👩‍💼',
    type: 'ASPIRASI_WARGA',
    title: '💰 Laporan Rekapitulasi Kas & Iuran Warga Bulan Berjalan',
    content: 'Alhamdulillah rekap penerimaan iuran keamanan dan kebersihan bulan ini mencapai Rp 4.250.000 (85% warga telah lunas). Sisa saldo kas tersimpan aman untuk perbaikan lampu PJU gang 3.',
    timestamp: 'Kemarin',
    likeCount: 31,
    commentCount: 4
  },
  {
    id: 'f-3',
    authorName: 'Bengkel Qu Motor Berkah Jaya',
    authorRoleBadge: 'Lapak UsahaQu',
    authorAvatar: '🏍️',
    type: 'LAPAK_PROMO',
    title: '🏪 Diskon Spesial Servis & Ganti Oli untuk Warga RT 01/RW 05',
    content: 'Promo khusus tetangga warga sekitar: Diskon jasa servis 20% dan gratis cek angin ban nitrogen cukup tunjukkan akun AppQu Anda di kasir bengkel!',
    timestamp: '1 hari lalu',
    likeCount: 19,
    commentCount: 5,
    lapakProduct: {
      businessName: 'Bengkel Qu Berkah Jaya',
      productName: 'Paket Servis Ringan + Oli MPX2 Matic',
      price: 65000,
      businessType: 'bengkel',
      phone: '081234567890',
      unit: 'Paket Servis'
    }
  },
  {
    id: 'f-4',
    authorName: 'Mang Bejo (Bakso Malang Keliling)',
    authorRoleBadge: 'Lapak UsahaQu',
    authorAvatar: '🍜',
    type: 'LAPAK_PROMO',
    title: '🍲 Bakso Sapi Super Urat & Pangsit Kuah Segar',
    content: 'Mangkal di depan Balai RT setiap sore jam 16:30. Siap pesan antar ke teras rumah warga tanpa ongkir tambahan!',
    timestamp: '2 hari lalu',
    likeCount: 28,
    commentCount: 9,
    lapakProduct: {
      businessName: 'Bakso Malang Mang Bejo',
      productName: 'Porsi Spesial Bakso Urat + Tahu Bakso',
      price: 18000,
      businessType: 'kedai',
      phone: '081298765432',
      unit: 'Porsi'
    }
  },
  {
    id: 'f-5',
    authorName: 'Pengurus RT 01 Siaga',
    authorRoleBadge: 'Tanggap Duka',
    authorAvatar: '🕊️',
    type: 'TANGGAP_DUKA',
    title: '🕊️ Berita Duka Cita & Dompet Solidaritas Warga',
    content: 'Innalillahi wa inna ilaihi rajiun. Telah berpulang ke Rahmatullah, Bpk. H. Supardi (Blok B1 No. 03). Takziah warga dijadwalkan ba’da Ashar. Dompet solidaritas duka dapat disalurkan melalui menu Kas & Donasi AppQu.',
    timestamp: '3 hari lalu',
    likeCount: 45,
    commentCount: 16
  }
];

export const INITIAL_KAS_ENTRIES: KasTransactionItem[] = [
  {
    id: 'kas-1',
    title: 'Iuran Sampah & Keamanan Blok A (12 KK)',
    category: 'Iuran Bulanan',
    amount: 1200000,
    isIncome: true,
    payerName: 'Warga Blok A (Koordinator Bpk. Tono)',
    date: '18 Okt 2026',
    receiptNumber: 'KAS-IN-202610-01',
    isOcrVerified: true,
    status: 'Lunas'
  },
  {
    id: 'kas-2',
    title: 'Iuran Sampah & Keamanan Blok B (10 KK)',
    category: 'Iuran Bulanan',
    amount: 1000000,
    isIncome: true,
    payerName: 'Warga Blok B',
    date: '17 Okt 2026',
    receiptNumber: 'KAS-IN-202610-02',
    isOcrVerified: true,
    status: 'Lunas'
  },
  {
    id: 'kas-3',
    title: 'Beli 4 Lampu LED 50W PJU Gang 2 & Kabel NYM',
    category: 'Perbaikan Fasilitas',
    amount: 320000,
    isIncome: false,
    payerName: 'Seksi Pembangunan RT',
    date: '16 Okt 2026',
    receiptNumber: 'KAS-OUT-202610-01',
    isOcrVerified: true,
    status: 'Lunas'
  },
  {
    id: 'kas-4',
    title: 'Santunan Dompet Duka Keluarga Alm. Bpk. Supardi',
    category: 'Santunan Warga',
    amount: 500000,
    isIncome: false,
    payerName: 'Bendahara Paguyuban',
    date: '15 Okt 2026',
    receiptNumber: 'KAS-OUT-202610-02',
    status: 'Lunas'
  },
  {
    id: 'kas-5',
    title: 'Donasi Solidaritas Warga untuk Alm. Bpk. Supardi',
    category: 'Donasi Duka',
    amount: 1750000,
    isIncome: true,
    payerName: 'Dompet Solidaritas Digital PaguyubanQu',
    date: '15 Okt 2026',
    receiptNumber: 'KAS-IN-202610-03',
    isOcrVerified: true,
    status: 'Lunas'
  }
];

export const INITIAL_SURAT_ITEMS: SuratPengantarItem[] = [
  {
    id: 'srt-1',
    letterNumber: '470/018/RT.01/X/2026',
    applicantName: 'Rian Pratama',
    applicantNikMasked: '3273********0088',
    applicantAddress: 'Blok A3 No. 11',
    type: 'Pengantar SKCK',
    purpose: 'Melamar pekerjaan di BUMN Pertamina',
    status: 'Selesai',
    submittedDate: '17 Okt 2026',
    approvedBy: 'Bpk. Ahmad Fauzi (Ketua RT 01)',
    notes: 'Tanda tangan digital telah terverifikasi QR Code resmi RT 01'
  },
  {
    id: 'srt-2',
    letterNumber: '470/019/RT.01/X/2026',
    applicantName: 'Ibu Ratna Dewi',
    applicantNikMasked: '3273********0042',
    applicantAddress: 'Blok B1 No. 06',
    type: 'Keterangan Usaha (SKU)',
    purpose: 'Pengajuan KUR BRI Mikro Usaha Warung Sembako RitelQu',
    status: 'Menunggu Verifikasi',
    submittedDate: 'Hari ini',
    notes: 'Menunggu verifikasi Sekretaris RT & Approval Ketua RT'
  }
];

export const INITIAL_RONDA_CHECKPOINTS: RondaCheckpointItem[] = [
  {
    id: 'chk-1',
    qrCodeToken: 'RONDA-RT01-POS-UTARA',
    name: 'Checkpoint 1 - Pos Ronda Utama Utara',
    locationDescription: 'Pintu Gerbang Portal Utama Jl. Merdeka',
    lastScannedTime: '23:45 WIB',
    lastScannedBy: 'Pak Sugeng (Satpam)',
    status: 'Aman',
    targetSchedule: 'Pukul 23:00 - 00:00 WIB'
  },
  {
    id: 'chk-2',
    qrCodeToken: 'RONDA-RT01-GANG-MAWAR',
    name: 'Checkpoint 2 - Tiang PJU Gang Mawar',
    locationDescription: 'Dekat Lapangan Bulutangkis Warga Blok B',
    lastScannedTime: '23:58 WIB',
    lastScannedBy: 'Pak Sugeng (Satpam)',
    status: 'Aman',
    targetSchedule: 'Pukul 23:30 - 00:30 WIB'
  },
  {
    id: 'chk-3',
    qrCodeToken: 'RONDA-RT01-GANG-CEMPAKA',
    name: 'Checkpoint 3 - Ujung Barat Gang Cempaka',
    locationDescription: 'Perbatasan Selokan Timur & Kebun Belakang Blok C',
    lastScannedTime: '22:15 WIB',
    lastScannedBy: 'Ronda Regu B',
    status: 'Belum Patroli',
    targetSchedule: 'Pukul 01:00 - 02:00 WIB'
  },
  {
    id: 'chk-4',
    qrCodeToken: 'RONDA-RT01-PORTAL-SELATAN',
    name: 'Checkpoint 4 - Portal Selatan Siaga',
    locationDescription: 'Akses keluar masuk mobil Jl. Damai Raya',
    lastScannedTime: 'Kemarin 03:00 WIB',
    lastScannedBy: 'Pak Sugeng (Satpam)',
    status: 'Terlewat',
    targetSchedule: 'Pukul 02:30 - 03:30 WIB'
  }
];

export const INITIAL_TANGGAP_DUKA: TanggapDukaItem[] = [
  {
    id: 'td-1',
    wargaName: 'Alm. Bpk. H. Supardi',
    familyContact: '081322446688 (Ibu Hj. Supardi)',
    blokAddress: 'Blok B1 No. 03 RT 001 / RW 005',
    statusType: 'Duka Cita',
    dateReported: '15 Okt 2026',
    description: 'Telah wafat dalam usia 68 tahun. Jenazah telah dimakamkan di TPU Sirnaraga. Mohon doa dari seluruh warga.',
    donationTarget: 3000000,
    donationCollected: 1750000,
    piketTakziahList: ['Bpk. Ahmad Fauzi', 'Bpk. Hendra Gunawan', 'Pak Sugeng', 'Mang Bejo', 'Bpk. Tono', 'Ibu Ratna Dewi']
  },
  {
    id: 'td-2',
    wargaName: 'Ananda Dimas (Putra Bpk. Rudi)',
    familyContact: '081299881122 (Bpk. Rudi)',
    blokAddress: 'Blok C2 No. 09',
    statusType: 'Warga Sakit / Rawat Inap',
    dateReported: '17 Okt 2026',
    description: 'Sedang dirawat inap di RSUD Hasan Sadikin karena demam berdarah (DBD). Memerlukan donor trombosit dan doa restu tetangga.',
    donationTarget: 2000000,
    donationCollected: 1200000,
    piketTakziahList: ['Ibu Hj. Siti Aminah', 'Ibu Nurhayati', 'Bpk. Agus Santoso']
  }
];

export const INITIAL_EMERGENCY_ALERTS: EmergencyAlertItem[] = [
  {
    id: 'emg-1',
    triggerName: 'Ibu Ratna Dewi',
    triggerAddress: 'Blok B1 No. 06 (Dekat Gapura Mawar)',
    phone: '081387654321',
    coords: [-6.9175, 107.6191],
    type: 'KEMALINGAN',
    timestamp: Date.now() - 3600000 * 4,
    status: 'HANDLED',
    nearestCctv: 'CCTV-02 (Simpang Balai RT)',
    cctvStreamUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop'
  }
];

// Local Storage helpers
export function getSavedMembers(): WargaMember[] {
  try {
    const raw = localStorage.getItem('appqu_paguyuban_members');
    return raw ? JSON.parse(raw) : INITIAL_MEMBERS;
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveMember(member: WargaMember): WargaMember[] {
  const current = getSavedMembers();
  const updated = [...current, member];
  localStorage.setItem('appqu_paguyuban_members', JSON.stringify(updated));
  return updated;
}

export function getSavedFeeds(): CommunityFeedItem[] {
  try {
    const raw = localStorage.getItem('appqu_paguyuban_feeds');
    return raw ? JSON.parse(raw) : INITIAL_FEEDS;
  } catch {
    return INITIAL_FEEDS;
  }
}

export function saveFeed(feed: CommunityFeedItem): CommunityFeedItem[] {
  const current = getSavedFeeds();
  const updated = [feed, ...current];
  localStorage.setItem('appqu_paguyuban_feeds', JSON.stringify(updated));
  return updated;
}

export function toggleLikeFeed(id: string): CommunityFeedItem[] {
  const current = getSavedFeeds();
  const updated = current.map(f => {
    if (f.id === id) {
      const isLiked = !f.isLiked;
      return {
        ...f,
        isLiked,
        likeCount: isLiked ? f.likeCount + 1 : Math.max(0, f.likeCount - 1)
      };
    }
    return f;
  });
  localStorage.setItem('appqu_paguyuban_feeds', JSON.stringify(updated));
  return updated;
}

export function getSavedKas(): KasTransactionItem[] {
  try {
    const raw = localStorage.getItem('appqu_paguyuban_kas');
    return raw ? JSON.parse(raw) : INITIAL_KAS_ENTRIES;
  } catch {
    return INITIAL_KAS_ENTRIES;
  }
}

export function saveKasEntry(entry: KasTransactionItem): KasTransactionItem[] {
  const current = getSavedKas();
  const updated = [entry, ...current];
  localStorage.setItem('appqu_paguyuban_kas', JSON.stringify(updated));
  return updated;
}

export function getSavedSurat(): SuratPengantarItem[] {
  try {
    const raw = localStorage.getItem('appqu_paguyuban_surat');
    return raw ? JSON.parse(raw) : INITIAL_SURAT_ITEMS;
  } catch {
    return INITIAL_SURAT_ITEMS;
  }
}

export function saveSurat(surat: SuratPengantarItem): SuratPengantarItem[] {
  const current = getSavedSurat();
  const updated = [surat, ...current];
  localStorage.setItem('appqu_paguyuban_surat', JSON.stringify(updated));
  return updated;
}

export function updateSuratStatus(
  id: string, 
  status: SuratPengantarItem['status'],
  approverName?: string
): SuratPengantarItem[] {
  const current = getSavedSurat();
  const updated = current.map(s => {
    if (s.id === id) {
      const nowStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      return { 
        ...s, 
        status, 
        approvedBy: approverName || s.approvedBy,
        letterNumber: s.letterNumber || `470/0${Math.floor(10 + Math.random() * 89)}/RT.01/X/2026`,
        notes: status === 'Disetujui RT' 
          ? `Disetujui oleh ${approverName || 'Ketua RT'} pada ${nowStr}` 
          : status === 'Ditolak' 
          ? 'Berkas persyaratan belum lengkap, mohon konfirmasi pengurus RT' 
          : s.notes
      };
    }
    return s;
  });
  localStorage.setItem('appqu_paguyuban_surat', JSON.stringify(updated));
  return updated;
}

export function getSavedRondaCheckpoints(): RondaCheckpointItem[] {
  try {
    const raw = localStorage.getItem('appqu_ronda_checkpoints');
    return raw ? JSON.parse(raw) : INITIAL_RONDA_CHECKPOINTS;
  } catch {
    return INITIAL_RONDA_CHECKPOINTS;
  }
}

export function scanRondaCheckpoint(checkpointId: string, petugasName: string): RondaCheckpointItem[] {
  const current = getSavedRondaCheckpoints();
  const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const updated = current.map(c => {
    if (c.id === checkpointId || c.qrCodeToken === checkpointId) {
      return {
        ...c,
        status: 'Aman' as const,
        lastScannedTime: nowStr,
        lastScannedBy: petugasName
      };
    }
    return c;
  });
  localStorage.setItem('appqu_ronda_checkpoints', JSON.stringify(updated));
  return updated;
}

export function getSavedTanggapDuka(): TanggapDukaItem[] {
  try {
    const raw = localStorage.getItem('appqu_tanggap_duka');
    return raw ? JSON.parse(raw) : INITIAL_TANGGAP_DUKA;
  } catch {
    return INITIAL_TANGGAP_DUKA;
  }
}

export function donateToSolidarity(dukaId: string, amount: number, donorName: string): { updatedDuka: TanggapDukaItem[]; kasEntry: KasTransactionItem } {
  const current = getSavedTanggapDuka();
  const dukaItem = current.find(d => d.id === dukaId);
  const updatedDuka = current.map(d => {
    if (d.id === dukaId) {
      return { ...d, donationCollected: d.donationCollected + amount };
    }
    return d;
  });
  localStorage.setItem('appqu_tanggap_duka', JSON.stringify(updatedDuka));

  // Otomatis catat ke Kas Transparan
  const kasEntry: KasTransactionItem = {
    id: `kas-don-${Date.now()}`,
    title: `Donasi Solidaritas: ${dukaItem ? dukaItem.wargaName : 'Keluarga Warga'}`,
    category: 'Donasi Duka',
    amount: amount,
    isIncome: true,
    payerName: donorName || 'Hamba Allah (Warga)',
    date: 'Hari ini',
    receiptNumber: `KAS-DON-${Date.now().toString().slice(-6)}`,
    isOcrVerified: true,
    status: 'Lunas'
  };
  saveKasEntry(kasEntry);

  return { updatedDuka, kasEntry };
}

export function getSavedEmergencyAlerts(): EmergencyAlertItem[] {
  try {
    const raw = localStorage.getItem('appqu_emergency_alerts');
    return raw ? JSON.parse(raw) : INITIAL_EMERGENCY_ALERTS;
  } catch {
    return INITIAL_EMERGENCY_ALERTS;
  }
}

export function triggerEmergencyPanicAlert(
  type: EmergencyAlertItem['type'],
  triggerName: string,
  address: string,
  coords: [number, number]
): EmergencyAlertItem {
  const newAlert: EmergencyAlertItem = {
    id: `emg-${Date.now()}`,
    triggerName,
    triggerAddress: address,
    phone: '081234567890',
    coords,
    type,
    timestamp: Date.now(),
    status: 'ACTIVE_SIREN',
    nearestCctv: 'CCTV-01 (Portal Utama Utara)',
    cctvStreamUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop'
  };
  const current = getSavedEmergencyAlerts();
  const updated = [newAlert, ...current];
  localStorage.setItem('appqu_emergency_alerts', JSON.stringify(updated));
  return newAlert;
}

export function resolveEmergencyAlert(id: string): EmergencyAlertItem[] {
  const current = getSavedEmergencyAlerts();
  const updated = current.map(a => a.id === id ? { ...a, status: 'HANDLED' as const } : a);
  localStorage.setItem('appqu_emergency_alerts', JSON.stringify(updated));
  return updated;
}
