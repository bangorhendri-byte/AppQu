/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  KlinikAntrean,
  RekamMedisRecord,
  SuratMedisRecord,
  TagihanKlinik,
  KlinikObat,
  ResepApotek,
  KlinikDokter,
  JadwalPraktikDokter,
  RekapJasaMedisDokter,
  KlinikPasien,
  PiutangAsuransiPasien,
  KlinikPengeluaran,
  KlinikProfil,
  StafHakAkses
} from './KlinikTypes';

export const KLINIK_STORAGE_KEYS = {
  ANTREAN: 'usahaku_data_klinik_antrean',
  REKAM_MEDIS: 'usahaku_data_klinik_rekam_medis',
  SURAT_MEDIS: 'usahaku_data_klinik_surat_medis',
  TAGIHAN: 'usahaku_data_klinik_tagihan',
  OBAT: 'usahaku_data_klinik_obat',
  RESEP: 'usahaku_data_klinik_resep',
  DOKTER: 'usahaku_data_klinik_dokter',
  JADWAL: 'usahaku_data_klinik_jadwal',
  JASA_MEDIS: 'usahaku_data_klinik_jasa_medis',
  PASIEN: 'usahaku_data_klinik_pasien',
  PIUTANG: 'usahaku_data_klinik_piutang',
  PENGELUARAN: 'usahaku_data_klinik_pengeluaran',
  PROFIL: 'usahaku_data_klinik_profil',
  STAF: 'usahaku_data_klinik_staf'
} as const;

export function getKlinikStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading storage key ${key}:`, err);
    return defaultValue;
  }
}

export function setKlinikStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving storage key ${key}:`, err);
  }
}

// ==================== DEFAULT CLINIC PROFILE ====================
export const DEFAULT_KLINIK_PROFIL: KlinikProfil = {
  namaKlinik: 'Klinik Pratama Sehat Mandiri',
  kodeKlinik: 'KL-SM-0081',
  tipeKlinik: 'Klinik Pratama Rawat Jalan & Pelayanan 24 Jam',
  noIzinOperasional: '503/048/DPMPTSP/KLINIK/2024',
  alamat: 'Jl. Kesehatan Medika No. 88, Kav. Cemerlang',
  kota: 'Kota Bandung',
  provinsi: 'Jawa Barat',
  kodePos: '40132',
  telepon: '(022) 8765-4321',
  whatsapp: '0812-9988-7766',
  email: 'layanan@sehatmandiri.klinikqu.id',
  namaDokterPenanggungJawab: 'dr. H. Rian Prasetya, Sp.PD',
  sipDokterPenanggungJawab: 'SIP.503/442.1/2021/IDI-BDG',
  catatanKopSurat: 'Melayani Pasien Umum, BPJS Kesehatan, dan Asuransi Swasta Rekanan',
  tarifRegistrasiDefault: 15000
};

// ==================== DEFAULT DOCTORS & STAFF ====================
export const DEFAULT_KLINIK_DOKTER: KlinikDokter[] = [
  {
    id: 'doc-1',
    nama: 'dr. H. Rian Prasetya, Sp.PD',
    gelar: 'Sp.PD (Spesialis Penyakit Dalam)',
    spesialisasi: 'Penyakit Dalam & Geriatri',
    noSIP: 'SIP.503/442.1/2021/IDI-BDG',
    noSTR: '32.1.1.100.2.18.049123',
    poli: 'Poli Penyakit Dalam',
    noHp: '0812-1111-2222',
    email: 'dr.rian@klinikqu.id',
    tarifKonsultasi: 75000,
    bagiHasilDokterPersen: 70,
    statusAktif: true,
    avatarColor: 'bg-teal-700'
  },
  {
    id: 'doc-2',
    nama: 'dr. Sarah Amanda, Sp.A',
    gelar: 'Sp.A (Spesialis Anak)',
    spesialisasi: 'Kesehatan Ibu & Anak (KIA)',
    noSIP: 'SIP.503/442.1/2022/IDI-BDG',
    noSTR: '32.1.2.200.3.19.088451',
    poli: 'Poli KIA & Anak',
    noHp: '0813-2222-3333',
    email: 'dr.sarah@klinikqu.id',
    tarifKonsultasi: 70000,
    bagiHasilDokterPersen: 70,
    statusAktif: true,
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'doc-3',
    nama: 'dr. Fajar Nugroho',
    gelar: 'Dokter Umum',
    spesialisasi: 'Kedokteran Umum & Preventif',
    noSIP: 'SIP.503/442.1/2023/IDI-BDG',
    noSTR: '32.1.3.300.4.21.077612',
    poli: 'Poli Umum',
    noHp: '0812-4444-5555',
    email: 'dr.fajar@klinikqu.id',
    tarifKonsultasi: 45000,
    bagiHasilDokterPersen: 65,
    statusAktif: true,
    avatarColor: 'bg-cyan-700'
  },
  {
    id: 'doc-4',
    nama: 'drg. Melissa Wijaya',
    gelar: 'drg (Dokter Gigi)',
    spesialisasi: 'Kesehatan Gigi & Mulut',
    noSIP: 'SIP.503/442.1/2022/PDGI-BDG',
    noSTR: '32.2.1.500.5.20.066321',
    poli: 'Poli Gigi & Mulut',
    noHp: '0813-8888-9999',
    email: 'drg.melissa@klinikqu.id',
    tarifKonsultasi: 60000,
    bagiHasilDokterPersen: 70,
    statusAktif: true,
    avatarColor: 'bg-teal-600'
  }
];

export const DEFAULT_KLINIK_JADWAL: JadwalPraktikDokter[] = [
  {
    id: 'jdw-1',
    dokterId: 'doc-3',
    dokterNama: 'dr. Fajar Nugroho',
    poli: 'Poli Umum',
    hari: 'Senin',
    jamMulai: '08:00',
    jamSelesai: '14:00',
    kuotaPasien: 30,
    ruangPoli: 'Poli 01'
  },
  {
    id: 'jdw-2',
    dokterId: 'doc-1',
    dokterNama: 'dr. H. Rian Prasetya, Sp.PD',
    poli: 'Poli Penyakit Dalam',
    hari: 'Senin',
    jamMulai: '15:00',
    jamSelesai: '20:00',
    kuotaPasien: 20,
    ruangPoli: 'Poli 02'
  },
  {
    id: 'jdw-3',
    dokterId: 'doc-2',
    dokterNama: 'dr. Sarah Amanda, Sp.A',
    poli: 'Poli KIA & Anak',
    hari: 'Selasa',
    jamMulai: '09:00',
    jamSelesai: '13:00',
    kuotaPasien: 25,
    ruangPoli: 'Poli 03'
  },
  {
    id: 'jdw-4',
    dokterId: 'doc-4',
    dokterNama: 'drg. Melissa Wijaya',
    poli: 'Poli Gigi & Mulut',
    hari: 'Rabu',
    jamMulai: '10:00',
    jamSelesai: '16:00',
    kuotaPasien: 15,
    ruangPoli: 'Dental Room'
  }
];

export const DEFAULT_KLINIK_STAF: StafHakAkses[] = [
  {
    id: 'staf-1',
    nama: 'dr. H. Rian Prasetya, Sp.PD',
    peran: 'Dokter',
    noHp: '0812-1111-2222',
    email: 'dr.rian@klinikqu.id',
    pinAkses: '1234',
    status: 'Aktif',
    modulBoleh: ['rekam_medis', 'dokter_staf', 'laporan']
  },
  {
    id: 'staf-2',
    nama: 'Ns. Ratna Dewi, S.Kep',
    peran: 'Perawat',
    noHp: '0813-7766-5544',
    email: 'ratna.dewi@klinikqu.id',
    pinAkses: '2233',
    status: 'Aktif',
    modulBoleh: ['pendaftaran', 'rekam_medis', 'pasien']
  },
  {
    id: 'staf-3',
    nama: 'apt. Dimas Ariyanto, S.Farm',
    peran: 'Apoteker',
    noHp: '0812-3344-9988',
    email: 'dimas.apt@klinikqu.id',
    pinAkses: '3344',
    status: 'Aktif',
    modulBoleh: ['apotek', 'laporan']
  },
  {
    id: 'staf-4',
    nama: 'Siti Nurhaliza (Kasir & Adm)',
    peran: 'Kasir & Pendaftaran',
    noHp: '0815-6677-8899',
    email: 'siti.adm@klinikqu.id',
    pinAkses: '5566',
    status: 'Aktif',
    modulBoleh: ['pendaftaran', 'pembayaran', 'pasien']
  }
];

// ==================== DEFAULT MASTER PATIENTS ====================
export const DEFAULT_KLINIK_PASIEN: KlinikPasien[] = [
  {
    id: 'pas-1',
    noRM: 'RM-2026-0012',
    nik: '3273011405880002',
    nama: 'Budi Santoso',
    tglLahir: '1988-05-14',
    gender: 'L',
    golDarah: 'O',
    noHp: '0812-3456-7890',
    alamat: 'Jl. Dago Asri No. 12, Coblong, Bandung',
    pekerjaan: 'Pegawai Swasta',
    penjaminUtama: 'BPJS Kesehatan',
    noKartuPenjamin: '0001892837162',
    riwayatAlergi: 'Tidak ada alergi obat',
    tglRegistrasi: '2025-01-10',
    totalKunjungan: 6,
    totalPiutang: 0
  },
  {
    id: 'pas-2',
    noRM: 'RM-2026-0015',
    nik: '3273026008920004',
    nama: 'Dewi Anggraini',
    tglLahir: '1992-08-20',
    gender: 'P',
    golDarah: 'A',
    noHp: '0813-9876-5432',
    alamat: 'Komp. Buah Batu Regency Blok B-05, Bandung',
    pekerjaan: 'Wiraswasta',
    penjaminUtama: 'Umum',
    riwayatAlergi: 'Alergi Ampicillin / Penisilin (Biduran)',
    tglRegistrasi: '2025-02-18',
    totalKunjungan: 3,
    totalPiutang: 0
  },
  {
    id: 'pas-3',
    noRM: 'RM-2026-0022',
    nik: '3273041103650001',
    nama: 'H. Suryadi Martadinata',
    tglLahir: '1965-03-11',
    gender: 'L',
    golDarah: 'B',
    noHp: '0811-2233-4455',
    alamat: 'Jl. R.E. Martadinata No. 104, Bandung',
    pekerjaan: 'Pensiunan PNS',
    penjaminUtama: 'Asuransi Swasta',
    noKartuPenjamin: 'PRU-MED-8899120',
    riwayatAlergi: 'Alergi Dingin & Debu',
    tglRegistrasi: '2025-03-01',
    totalKunjungan: 8,
    totalPiutang: 350000
  },
  {
    id: 'pas-4',
    noRM: 'RM-2026-0035',
    nik: '3273055509990003',
    nama: 'Ananda Kevin Rizky',
    tglLahir: '2019-09-15',
    gender: 'L',
    golDarah: 'O',
    noHp: '0812-7788-9900',
    alamat: 'Jl. Sukajadi No. 45, Bandung',
    pekerjaan: 'Pelajar / Balita',
    penjaminUtama: 'Umum',
    riwayatAlergi: 'Tidak ada alergi',
    tglRegistrasi: '2026-01-05',
    totalKunjungan: 2,
    totalPiutang: 0
  }
];

// ==================== DEFAULT MASTER MEDICINES (With Expiry Warnings) ====================
export const DEFAULT_KLINIK_OBAT: KlinikObat[] = [
  {
    id: 'med-1',
    kodeObat: 'OBT-001',
    namaObat: 'Amoxicillin Trihydrate 500 mg',
    kategori: 'Antibiotik',
    bentukSediaan: 'Kapsul',
    stok: 120,
    minStok: 50,
    satuan: 'Strip (10 Kapsul)',
    hargaBeli: 6500,
    hargaJual: 12000,
    tglKedaluwarsa: '2027-10-15',
    noBatch: 'AMX-2025-09A',
    pabrik: 'Kimia Farma',
    dosisStandar: '3 x sehari 1 kapsul',
    aturanStandar: 'Sesudah makan, dihabiskan',
    efekSamping: 'Mual ringan, ruam jika hipersensitif'
  },
  {
    id: 'med-2',
    kodeObat: 'OBT-002',
    namaObat: 'Paracetamol 500 mg Forte',
    kategori: 'Analgesik & Antipiretik',
    bentukSediaan: 'Tablet',
    stok: 350,
    minStok: 100,
    satuan: 'Strip (10 Tablet)',
    hargaBeli: 3500,
    hargaJual: 8000,
    tglKedaluwarsa: '2028-04-20',
    noBatch: 'PCT-2025-04B',
    pabrik: 'Kalbe Farma',
    dosisStandar: '3 x sehari 1 tablet bila demam/nyeri',
    aturanStandar: 'Sesudah makan',
    efekSamping: 'Reaksi hepatotoksik jika dosis berlebih'
  },
  {
    id: 'med-3',
    kodeObat: 'OBT-003',
    namaObat: 'Amlodipine Besylate 10 mg',
    kategori: 'Antihipertensi',
    bentukSediaan: 'Tablet',
    stok: 85,
    minStok: 40,
    satuan: 'Strip (10 Tablet)',
    hargaBeli: 8000,
    hargaJual: 16000,
    tglKedaluwarsa: '2026-11-20', // Approaching expiry soon (under 90 days warning simulation)
    noBatch: 'AML-2024-11C',
    pabrik: 'Dexa Medica',
    dosisStandar: '1 x sehari 1 tablet pada pagi hari',
    aturanStandar: 'Sebelum / sesudah makan secara rutin',
    efekSamping: 'Edema perifer ringan, pusing'
  },
  {
    id: 'med-4',
    kodeObat: 'OBT-004',
    namaObat: 'Metformin HCl 500 mg',
    kategori: 'Antidiabetes',
    bentukSediaan: 'Tablet',
    stok: 140,
    minStok: 60,
    satuan: 'Strip (10 Tablet)',
    hargaBeli: 4500,
    hargaJual: 9500,
    tglKedaluwarsa: '2026-12-05', // Approaching expiry soon
    noBatch: 'MTF-2024-12A',
    pabrik: 'Sanbe Farma',
    dosisStandar: '2 x sehari 1 tablet saat makan',
    aturanStandar: 'Bersamaan dengan makanan utama',
    efekSamping: 'Gangguan cerna ringan, rasa logam'
  },
  {
    id: 'med-5',
    kodeObat: 'OBT-005',
    namaObat: 'Cetirizine 10 mg',
    kategori: 'Antiinflamasi',
    bentukSediaan: 'Tablet',
    stok: 18, // LOW STOCK ALERT
    minStok: 30,
    satuan: 'Strip (10 Tablet)',
    hargaBeli: 5000,
    hargaJual: 11000,
    tglKedaluwarsa: '2027-08-14',
    noBatch: 'CTZ-2025-08B',
    pabrik: 'Indofarma',
    dosisStandar: '1 x sehari 1 tablet pada malam hari',
    aturanStandar: 'Malam hari sebelum tidur',
    efekSamping: 'Mengantuk ringan'
  },
  {
    id: 'med-6',
    kodeObat: 'OBT-006',
    namaObat: 'Cefixime 200 mg',
    kategori: 'Antibiotik',
    bentukSediaan: 'Kapsul',
    stok: 24, // ALMOST EXPIRED SAMPLE
    minStok: 20,
    satuan: 'Strip (10 Kapsul)',
    hargaBeli: 22000,
    hargaJual: 38000,
    tglKedaluwarsa: '2026-10-25', // CRITICAL EXPIRED WARNING (< 15 days)
    noBatch: 'CFX-2024-10X',
    pabrik: 'Phapros',
    dosisStandar: '2 x sehari 1 kapsul',
    aturanStandar: 'Sesudah makan, harus habis',
    efekSamping: 'Diare ringan, alergi ruam kulit'
  },
  {
    id: 'med-7',
    kodeObat: 'OBT-007',
    namaObat: 'Multivitamin B-Complex & Zinc',
    kategori: 'Vitamin & Suplemen',
    bentukSediaan: 'Tablet',
    stok: 210,
    minStok: 50,
    satuan: 'Botol (30 Kaplet)',
    hargaBeli: 28000,
    hargaJual: 45000,
    tglKedaluwarsa: '2028-02-28',
    noBatch: 'VTM-2025-02Z',
    pabrik: 'SOHO Industri',
    dosisStandar: '1 x sehari 1 kaplet',
    aturanStandar: 'Sesudah sarapan pagi',
    efekSamping: 'Warna urin lebih kuning pekat'
  },
  {
    id: 'med-8',
    kodeObat: 'ALK-001',
    namaObat: 'Spuit Disposable 3 cc Terumo',
    kategori: 'Alat Kesehatan & Spuit',
    bentukSediaan: 'Pcs Alkes',
    stok: 180,
    minStok: 50,
    satuan: 'Pcs',
    hargaBeli: 1800,
    hargaJual: 3500,
    tglKedaluwarsa: '2029-06-30',
    noBatch: 'TRM-2025-06',
    pabrik: 'Terumo Corporation',
    dosisStandar: 'Sekali pakai injeksi',
    aturanStandar: 'Steril, buang di safety box'
  }
];

// ==================== DEFAULT QUEUE (ANTREAN HARI INI) ====================
export const DEFAULT_KLINIK_ANTREAN: KlinikAntrean[] = [
  {
    id: 'ant-1',
    noAntrean: 'A-001',
    tipePenjamin: 'Umum',
    noRM: 'RM-2026-0015',
    namaPasien: 'Dewi Anggraini',
    nik: '3273026008920004',
    usia: 34,
    gender: 'P',
    poli: 'Poli Umum',
    dokterId: 'doc-3',
    dokterNama: 'dr. Fajar Nugroho',
    keluhanAwal: 'Demam sejak 2 hari, batuk berdahak dan sakit tenggorokan',
    waktuDaftar: '08:15',
    noHp: '0813-9876-5432',
    status: 'Menunggu Obat',
    panggilanKe: 2,
    waktuPanggil: '08:45',
    catatanPetugas: 'Sudah diperiksa dokter, resep sudah terkirim ke apotek'
  },
  {
    id: 'ant-2',
    noAntrean: 'B-001',
    tipePenjamin: 'BPJS Kesehatan',
    noRM: 'RM-2026-0012',
    namaPasien: 'Budi Santoso',
    nik: '3273011405880002',
    usia: 38,
    gender: 'L',
    poli: 'Poli Penyakit Dalam',
    dokterId: 'doc-1',
    dokterNama: 'dr. H. Rian Prasetya, Sp.PD',
    keluhanAwal: 'Kontrol rutin hipertensi, tengkuk kaku dan sering kesemutan',
    waktuDaftar: '08:30',
    noHp: '0812-3456-7890',
    status: 'Pemeriksaan',
    panggilanKe: 1,
    waktuPanggil: '09:05',
    catatanPetugas: 'Sedang konsultasi di Poli 02'
  },
  {
    id: 'ant-3',
    noAntrean: 'A-002',
    tipePenjamin: 'Umum',
    noRM: 'RM-2026-0035',
    namaPasien: 'Ananda Kevin Rizky',
    nik: '3273055509990003',
    usia: 7,
    gender: 'L',
    poli: 'Poli KIA & Anak',
    dokterId: 'doc-2',
    dokterNama: 'dr. Sarah Amanda, Sp.A',
    keluhanAwal: 'Batuk pilek malam hari, nafsu makan berkurang',
    waktuDaftar: '09:10',
    noHp: '0812-7788-9900',
    status: 'Dipanggil',
    panggilanKe: 1,
    waktuPanggil: '09:25',
    catatanPetugas: 'Pasien dipersilakan masuk ke Poli Anak'
  },
  {
    id: 'ant-4',
    noAntrean: 'C-001',
    tipePenjamin: 'Asuransi Swasta',
    noRM: 'RM-2026-0022',
    namaPasien: 'H. Suryadi Martadinata',
    nik: '3273041103650001',
    usia: 61,
    gender: 'L',
    poli: 'Poli Penyakit Dalam',
    dokterId: 'doc-1',
    dokterNama: 'dr. H. Rian Prasetya, Sp.PD',
    keluhanAwal: 'Nyeri sendi lutut kanan saat berjalan, cek lab asam urat',
    waktuDaftar: '09:20',
    noHp: '0811-2233-4455',
    status: 'Menunggu',
    panggilanKe: 0,
    catatanPetugas: 'Menunggu antrean dokter'
  }
];

// ==================== DEFAULT REKAM MEDIS (SOAP) ====================
export const DEFAULT_KLINIK_REKAM_MEDIS: RekamMedisRecord[] = [
  {
    id: 'rm-rec-1',
    antreanId: 'ant-1',
    noRM: 'RM-2026-0015',
    namaPasien: 'Dewi Anggraini',
    nik: '3273026008920004',
    gender: 'P',
    tglLahir: '1992-08-20',
    usia: 34,
    tanggalPeriksa: '14 Okt 2026',
    jamPeriksa: '08:45',
    poli: 'Poli Umum',
    dokterId: 'doc-3',
    dokterNama: 'dr. Fajar Nugroho',
    soap: {
      keluhanUtama: 'Demam 2 hari, batuk kering mengganggu tidur, nyeri menelan',
      riwayatPenyakitSekarang: 'Gejala dirasakan memburuk sejak kemarin malam setelah kehujanan',
      riwayatAlergi: 'Alergi Ampicillin / Penisilin (Biduran)',
      tekananDarah: '118/78',
      nadi: 84,
      suhu: 38.2,
      frekuensiNapas: 19,
      beratBadan: 54,
      tinggiBadan: 160,
      imt: 21.1,
      pemeriksaanFisikLain: 'Faring hiperemis (+), tonsil T1-T1 tenang, rhonki (-/-), wheezing (-/-)',
      diagnosaUtama: 'Faringitis Akut / ISPA Akut',
      kodeICD10: 'J02.9',
      diagnosaSekunder: 'Febris Akut Hari Ke-2',
      prognosa: 'Bonam',
      tindakanMedis: [
        { id: 'tnd-1', namaTindakan: 'Pemeriksaan Fisik & Konsultasi Dokter Umum', biaya: 45000 }
      ],
      resepObat: [
        {
          id: 'rsp-item-1',
          obatId: 'med-2',
          namaObat: 'Paracetamol 500 mg Forte',
          dosis: '500 mg',
          aturanPakai: '3 x 1 tablet sesudah makan',
          jumlah: 10,
          satuan: 'Tablet',
          hargaSatuan: 800,
          subtotal: 8000
        },
        {
          id: 'rsp-item-2',
          obatId: 'med-5',
          namaObat: 'Cetirizine 10 mg',
          dosis: '10 mg',
          aturanPakai: '1 x 1 tablet malam hari',
          jumlah: 5,
          satuan: 'Tablet',
          hargaSatuan: 1100,
          subtotal: 5500
        },
        {
          id: 'rsp-item-3',
          obatId: 'med-7',
          namaObat: 'Multivitamin B-Complex & Zinc',
          dosis: '1 kaplet',
          aturanPakai: '1 x 1 kaplet pagi hari',
          jumlah: 10,
          satuan: 'Kaplet',
          hargaSatuan: 1500,
          subtotal: 15000
        }
      ],
      edukasiPasien: 'Banyak istirahat min. 8 jam, minum air putih hangat 2 liter/hari, hindari gorengan dan es.',
      anjuranKontrol: 'Kontrol ulang setelah 3 hari jika demam tidak kunjung turun.'
    }
  }
];

// ==================== DEFAULT SURAT MEDIS (SAKIT / SEHAT) ====================
export const DEFAULT_KLINIK_SURAT_MEDIS: SuratMedisRecord[] = [
  {
    id: 'srt-1',
    noSurat: '045/SKD/KL-SM/X/2026',
    jenis: 'surat_sakit',
    noRM: 'RM-2026-0015',
    namaPasien: 'Dewi Anggraini',
    nik: '3273026008920004',
    gender: 'P',
    tglLahir: '1992-08-20',
    pekerjaan: 'Wiraswasta / Karyawan PT Telkom Akses',
    alamat: 'Komp. Buah Batu Regency Blok B-05, Bandung',
    dokterNama: 'dr. Fajar Nugroho',
    sipDokter: 'SIP.503/442.1/2023/IDI-BDG',
    tglPeriksa: '14 Oktober 2026',
    tglMulai: '14 Oktober 2026',
    tglSelesai: '16 Oktober 2026',
    jumlahHari: 3,
    keteranganIstirahat: 'Memerlukan istirahat penuh karena kondisi sakit faringitis akut dan demam tinggi.',
    diagnosaRingkas: 'Faringitis Akut & Febris (ISPA)',
    createdAt: '14 Okt 2026'
  }
];

// ==================== DEFAULT PRESCRIPTIONS (APOTEK) ====================
export const DEFAULT_KLINIK_RESEP: ResepApotek[] = [
  {
    id: 'rsp-001',
    noResep: 'RSP-20261014-001',
    antreanId: 'ant-1',
    rekamMedisId: 'rm-rec-1',
    noRM: 'RM-2026-0015',
    namaPasien: 'Dewi Anggraini',
    usia: 34,
    dokterNama: 'dr. Fajar Nugroho',
    tglResep: '14 Okt 2026',
    jamResep: '08:50',
    statusPenyiapan: 'Menunggu Diracik',
    totalHarga: 28500,
    catatanAlergi: 'Alergi Penisilin (Ampicillin)',
    daftarObat: [
      {
        obatId: 'med-2',
        namaObat: 'Paracetamol 500 mg Forte',
        dosis: '500 mg',
        aturanPakai: '3 x 1 tablet sesudah makan',
        jumlah: 10,
        satuan: 'Tablet',
        hargaSatuan: 800,
        subtotal: 8000,
        statusRacik: 'Pending'
      },
      {
        obatId: 'med-5',
        namaObat: 'Cetirizine 10 mg',
        dosis: '10 mg',
        aturanPakai: '1 x 1 tablet malam hari',
        jumlah: 5,
        satuan: 'Tablet',
        hargaSatuan: 1100,
        subtotal: 5500,
        statusRacik: 'Pending'
      },
      {
        obatId: 'med-7',
        namaObat: 'Multivitamin B-Complex & Zinc',
        dosis: '1 kaplet',
        aturanPakai: '1 x 1 kaplet pagi hari',
        jumlah: 10,
        satuan: 'Kaplet',
        hargaSatuan: 1500,
        subtotal: 15000,
        statusRacik: 'Pending'
      }
    ]
  }
];

// ==================== DEFAULT BILLINGS / INVOICES ====================
export const DEFAULT_KLINIK_TAGIHAN: TagihanKlinik[] = [
  {
    id: 'inv-1',
    noInvoice: 'INV-KL/2026/10/001',
    antreanId: 'ant-1',
    rekamMedisId: 'rm-rec-1',
    noRM: 'RM-2026-0015',
    namaPasien: 'Dewi Anggraini',
    penjamin: 'Umum',
    poli: 'Poli Umum',
    dokterNama: 'dr. Fajar Nugroho',
    tglTagihan: '14 Okt 2026',
    jamTagihan: '08:55',
    rincian: {
      biayaRegistrasi: 15000,
      biayaKonsultasi: 45000,
      tindakanItems: [
        { nama: 'Pemeriksaan Vital Sign & Dokter Umum', biaya: 25000 }
      ],
      obatItems: [
        { nama: 'Paracetamol 500 mg Forte', aturanPakai: '3x1 sesudah makan', qty: 10, harga: 800, subtotal: 8000 },
        { nama: 'Cetirizine 10 mg', aturanPakai: '1x1 malam', qty: 5, harga: 1100, subtotal: 5500 },
        { nama: 'Multivitamin B-Complex & Zinc', aturanPakai: '1x1 pagi', qty: 10, harga: 1500, subtotal: 15000 }
      ],
      alkesItems: [],
      diskonNominal: 0,
      totalKotor: 113500,
      totalBersih: 113500
    },
    metodePembayaran: 'QRIS Medis',
    jumlahBayar: 113500,
    kembalian: 0,
    statusPembayaran: 'Lunas',
    kasirNama: 'Siti Nurhaliza (Kasir)',
    catatanNota: 'Pembayaran lunas via QRIS Dinamis'
  },
  {
    id: 'inv-2',
    noInvoice: 'INV-KL/2026/10/002',
    noRM: 'RM-2026-0012',
    namaPasien: 'Budi Santoso',
    penjamin: 'BPJS Kesehatan',
    noKartuPenjamin: '0001892837162',
    poli: 'Poli Penyakit Dalam',
    dokterNama: 'dr. H. Rian Prasetya, Sp.PD',
    tglTagihan: '14 Okt 2026',
    jamTagihan: '09:15',
    rincian: {
      biayaRegistrasi: 0,
      biayaKonsultasi: 75000,
      tindakanItems: [
        { nama: 'Pemeriksaan EKG / Jantung Dasar', biaya: 60000 }
      ],
      obatItems: [
        { nama: 'Amlodipine Besylate 10 mg (30 tab)', aturanPakai: '1x1 pagi', qty: 30, harga: 1600, subtotal: 48000 }
      ],
      alkesItems: [],
      diskonNominal: 0,
      totalKotor: 183000,
      totalBersih: 183000
    },
    metodePembayaran: 'Klaim BPJS',
    jumlahBayar: 183000,
    kembalian: 0,
    statusPembayaran: 'Lunas',
    kasirNama: 'Siti Nurhaliza (Kasir)',
    catatanNota: 'Ditanggung BPJS Kesehatan Faskes Tingkat 1'
  }
];

// ==================== DEFAULT JASA MEDIS DOKTER (Badge Pro) ====================
export const DEFAULT_KLINIK_JASA_MEDIS: RekapJasaMedisDokter[] = [
  {
    id: 'jm-1',
    dokterId: 'doc-1',
    dokterNama: 'dr. H. Rian Prasetya, Sp.PD',
    periode: 'Oktober 2026',
    totalPasienDitangani: 48,
    totalBiayaKonsultasi: 3600000,
    totalBiayaTindakan: 1850000,
    totalBruto: 5450000,
    persentaseBagiHasil: 70,
    hakJasaMedisDokter: 3815000,
    porsiKlinik: 1635000,
    statusPembayaran: 'Pending'
  },
  {
    id: 'jm-2',
    dokterId: 'doc-2',
    dokterNama: 'dr. Sarah Amanda, Sp.A',
    periode: 'Oktober 2026',
    totalPasienDitangani: 36,
    totalBiayaKonsultasi: 2520000,
    totalBiayaTindakan: 900000,
    totalBruto: 3420000,
    persentaseBagiHasil: 70,
    hakJasaMedisDokter: 2394000,
    porsiKlinik: 1026000,
    statusPembayaran: 'Pending'
  },
  {
    id: 'jm-3',
    dokterId: 'doc-3',
    dokterNama: 'dr. Fajar Nugroho',
    periode: 'Oktober 2026',
    totalPasienDitangani: 82,
    totalBiayaKonsultasi: 3690000,
    totalBiayaTindakan: 1200000,
    totalBruto: 4890000,
    persentaseBagiHasil: 65,
    hakJasaMedisDokter: 3178500,
    porsiKlinik: 1711500,
    statusPembayaran: 'Pending'
  }
];

// ==================== DEFAULT PIUTANG ASURANSI ====================
export const DEFAULT_KLINIK_PIUTANG: PiutangAsuransiPasien[] = [
  {
    id: 'ptg-1',
    noInvoice: 'INV-KL/2026/09/088',
    noRM: 'RM-2026-0022',
    namaPasien: 'H. Suryadi Martadinata',
    penjamin: 'Asuransi Swasta',
    namaAsuransi: 'Prudential Medikal Klaim',
    tglTagihan: '28 Sep 2026',
    jatuhTempo: '28 Okt 2026',
    nominalKlaim: 450000,
    nominalTerbayar: 100000,
    sisaPiutang: 350000,
    status: 'Menunggu Klaim',
    nomorBerkasKlaim: 'CLM-PRU-9901'
  }
];

// ==================== DEFAULT PENGELUARAN KLINIK ====================
export const DEFAULT_KLINIK_PENGELUARAN: KlinikPengeluaran[] = [
  {
    id: 'png-1',
    tanggal: '13 Okt 2026',
    kategori: 'Bahan Medis Habis Pakai',
    keterangan: 'Beli Kasa Steril, Alkohol 70%, Plester Roll dan Handscoon Latex',
    nominal: 420000,
    dicatatOleh: 'apt. Dimas Ariyanto'
  },
  {
    id: 'png-2',
    tanggal: '12 Okt 2026',
    kategori: 'Listrik & Utilitas',
    keterangan: 'Pembayaran Listrik PLN Poli & Kulkas Vaksin / Suhu Dingin Obat',
    nominal: 850000,
    dicatatOleh: 'Siti Nurhaliza (Adm)'
  },
  {
    id: 'png-3',
    tanggal: '10 Okt 2026',
    kategori: 'Kas Kecil & Kebersihan',
    keterangan: 'Desinfektan Ruang Periksa, Cairan Pembersih Lantai & Tissue Medis',
    nominal: 175000,
    dicatatOleh: 'Ns. Ratna Dewi'
  }
];
