/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type KlinikMenuTab = 
  | 'pendaftaran'
  | 'rekam_medis'
  | 'pembayaran'
  | 'apotek'
  | 'dokter_staf'
  | 'pasien'
  | 'laporan'
  | 'setting';

export type TipePenjamin = 'Umum' | 'BPJS Kesehatan' | 'Asuransi Swasta';

export type PoliKlinik = 
  | 'Poli Umum'
  | 'Poli Gigi & Mulut'
  | 'Poli KIA & Anak'
  | 'Poli Penyakit Dalam'
  | 'Unit Tindakan / IGD Ringan';

export type StatusAntrean = 
  | 'Menunggu'
  | 'Dipanggil'
  | 'Pemeriksaan'
  | 'Menunggu Obat'
  | 'Kasir'
  | 'Selesai'
  | 'Batal';

export interface KlinikAntrean {
  id: string;
  noAntrean: string; // e.g. "A-012" atau "B-008"
  tipePenjamin: TipePenjamin;
  noRM: string;
  namaPasien: string;
  nik: string;
  usia: number;
  gender: 'L' | 'P';
  poli: PoliKlinik;
  dokterId: string;
  dokterNama: string;
  keluhanAwal: string;
  waktuDaftar: string;
  noHp: string;
  status: StatusAntrean;
  panggilanKe?: number;
  waktuPanggil?: string;
  catatanPetugas?: string;
}

export interface SOAPData {
  // S (Subjective)
  keluhanUtama: string;
  riwayatPenyakitSekarang: string;
  riwayatPenyakitDahulu?: string;
  riwayatAlergi: string; // Misal: "Alergi Amoxicillin, Paracetamol aman"
  
  // O (Objective)
  tekananDarah: string; // mmHg, e.g. "120/80"
  nadi: number; // x/menit
  suhu: number; // Celsius, e.g. 36.8
  frekuensiNapas: number; // x/menit, e.g. 20
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  imt?: number;
  pemeriksaanFisikLain: string;
  
  // A (Assessment)
  diagnosaUtama: string; // e.g. "ISPA / J06.9"
  diagnosaSekunder?: string;
  kodeICD10?: string;
  prognosa?: 'Bonam' | 'Dubia ad Bonam' | 'Dubia ad Malam' | 'Malam';

  // P (Plan)
  tindakanMedis: {
    id: string;
    namaTindakan: string;
    biaya: number;
  }[];
  resepObat: {
    id: string;
    obatId: string;
    namaObat: string;
    dosis: string; // e.g. "500 mg"
    aturanPakai: string; // e.g. "3x1 sesudah makan"
    jumlah: number;
    satuan: string;
    hargaSatuan: number;
    subtotal: number;
    catatanKhusus?: string;
  }[];
  edukasiPasien: string;
  anjuranKontrol?: string; // e.g. "3 hari jika tidak membaik"
}

export interface RekamMedisRecord {
  id: string;
  antreanId?: string;
  noRM: string;
  namaPasien: string;
  nik: string;
  gender: 'L' | 'P';
  tglLahir: string;
  usia: number;
  tanggalPeriksa: string;
  jamPeriksa: string;
  poli: PoliKlinik;
  dokterId: string;
  dokterNama: string;
  soap: SOAPData;
  suratMedisTerbit?: string[]; // IDs of generated letters
}

export type JenisSuratMedis = 'surat_sakit' | 'surat_sehat';

export interface SuratMedisRecord {
  id: string;
  noSurat: string;
  jenis: JenisSuratMedis;
  noRM: string;
  namaPasien: string;
  nik: string;
  gender: 'L' | 'P';
  tglLahir: string;
  pekerjaan: string;
  alamat: string;
  dokterNama: string;
  sipDokter: string;
  tglPeriksa: string;
  tglMulai?: string;
  tglSelesai?: string;
  jumlahHari?: number;
  keteranganIstirahat?: string;
  keperluanSuratSehat?: string; // e.g. "Melamar Pekerjaan / Masuk Perguruan Tinggi"
  hasilTTV?: {
    tensi: string;
    beratBadan: number;
    tinggiBadan: number;
    golDarah: string;
    butaWarna: 'Tidak Buta Warna' | 'Buta Warna Parsial' | 'Buta Warna Total';
  };
  diagnosaRingkas?: string;
  createdAt: string;
}

export interface RincianBiayaTagihan {
  biayaRegistrasi: number;
  biayaKonsultasi: number;
  tindakanItems: { nama: string; biaya: number }[];
  obatItems: { nama: string; aturanPakai: string; qty: number; harga: number; subtotal: number }[];
  alkesItems: { nama: string; qty: number; harga: number; subtotal: number }[];
  diskonNominal: number;
  totalKotor: number;
  totalBersih: number;
}

export interface TagihanKlinik {
  id: string;
  noInvoice: string; // e.g. "INV-KL/2026/04/001"
  antreanId?: string;
  rekamMedisId?: string;
  noRM: string;
  namaPasien: string;
  penjamin: TipePenjamin;
  noKartuPenjamin?: string;
  poli: PoliKlinik;
  dokterNama: string;
  tglTagihan: string;
  jamTagihan: string;
  rincian: RincianBiayaTagihan;
  metodePembayaran: 'Tunai' | 'QRIS Medis' | 'Transfer Bank' | 'Klaim BPJS' | 'Asuransi Swasta';
  jumlahBayar: number;
  kembalian: number;
  statusPembayaran: 'Lunas' | 'Belum Lunas' | 'Klaim Menunggu Verifikasi';
  kasirNama: string;
  catatanNota?: string;
}

export interface KlinikObat {
  id: string;
  kodeObat: string; // e.g. "OBT-001"
  namaObat: string;
  kategori: 'Antibiotik' | 'Analgesik & Antipiretik' | 'Antiinflamasi' | 'Vitamin & Suplemen' | 'Antihipertensi' | 'Antidiabetes' | 'Salep & Kulit' | 'Alat Kesehatan & Spuit';
  bentukSediaan: 'Tablet' | 'Kapsul' | 'Sirup Botol' | 'Salep Tube' | 'Injeksi Ampul' | 'Tetes Mata' | 'Pcs Alkes';
  stok: number;
  minStok: number;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  tglKedaluwarsa: string; // YYYY-MM-DD
  noBatch: string;
  pabrik: string;
  dosisStandar?: string;
  aturanStandar?: string;
  efekSamping?: string;
  photoUrl?: string;
  showInOnlineStore?: boolean;
  deskripsi?: string;
}

export interface ResepApotek {
  id: string;
  noResep: string;
  antreanId?: string;
  rekamMedisId?: string;
  noRM: string;
  namaPasien: string;
  usia: number;
  dokterNama: string;
  tglResep: string;
  jamResep: string;
  daftarObat: {
    obatId: string;
    namaObat: string;
    dosis: string;
    aturanPakai: string;
    jumlah: number;
    satuan: string;
    hargaSatuan: number;
    subtotal: number;
    statusRacik: 'Pending' | 'Selesai';
  }[];
  statusPenyiapan: 'Menunggu Diracik' | 'Sedang Diracik' | 'Siap Diserahkan' | 'Diserahkan';
  totalHarga: number;
  apotekerNama?: string;
  waktuDiserahkan?: string;
  catatanAlergi?: string;
}

export interface KlinikDokter {
  id: string;
  nama: string;
  gelar: string;
  spesialisasi: string;
  noSIP: string;
  noSTR: string;
  poli: PoliKlinik;
  noHp: string;
  email: string;
  tarifKonsultasi: number;
  bagiHasilDokterPersen: number; // e.g. 70 means 70% doctor, 30% clinic
  statusAktif: boolean;
  avatarColor: string;
}

export interface JadwalPraktikDokter {
  id: string;
  dokterId: string;
  dokterNama: string;
  poli: PoliKlinik;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  jamMulai: string; // e.g. "08:00"
  jamSelesai: string; // e.g. "12:00"
  kuotaPasien: number;
  ruangPoli: string;
}

export interface RekapJasaMedisDokter {
  id: string;
  dokterId: string;
  dokterNama: string;
  periode: string; // e.g. "April 2026"
  totalPasienDitangani: number;
  totalBiayaKonsultasi: number;
  totalBiayaTindakan: number;
  totalBruto: number;
  persentaseBagiHasil: number;
  hakJasaMedisDokter: number;
  porsiKlinik: number;
  statusPembayaran: 'Pending' | 'Telah Ditransfer';
  tglPencairan?: string;
}

export interface KlinikPasien {
  id: string;
  noRM: string; // e.g. "RM-2026-0041"
  nik: string;
  nama: string;
  tglLahir: string;
  gender: 'L' | 'P';
  golDarah: 'A' | 'B' | 'AB' | 'O' | '-';
  noHp: string;
  alamat: string;
  pekerjaan: string;
  penjaminUtama: TipePenjamin;
  noKartuPenjamin?: string;
  riwayatAlergi?: string;
  tglRegistrasi: string;
  totalKunjungan: number;
  totalPiutang: number;
}

export interface PiutangAsuransiPasien {
  id: string;
  noInvoice: string;
  noRM: string;
  namaPasien: string;
  penjamin: TipePenjamin;
  namaAsuransi?: string;
  tglTagihan: string;
  jatuhTempo: string;
  nominalKlaim: number;
  nominalTerbayar: number;
  sisaPiutang: number;
  status: 'Menunggu Klaim' | 'Disetujui' | 'Lunas' | 'Ditolak';
  nomorBerkasKlaim?: string;
}

export interface KlinikPengeluaran {
  id: string;
  tanggal: string;
  kategori: 'Operasional' | 'Bahan Medis Habis Pakai' | 'Gaji & Lembur Staf' | 'Listrik & Utilitas' | 'Kas Kecil & Kebersihan';
  keterangan: string;
  nominal: number;
  dicatatOleh: string;
  buktiNotaUrl?: string;
}

export interface KlinikProfil {
  namaKlinik: string;
  kodeKlinik: string;
  tipeKlinik: string; // e.g. "Klinik Pratama Rawat Jalan"
  noIzinOperasional: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  whatsapp: string;
  email: string;
  namaDokterPenanggungJawab: string;
  sipDokterPenanggungJawab: string;
  catatanKopSurat: string;
  tarifRegistrasiDefault: number;
}

export interface StafHakAkses {
  id: string;
  nama: string;
  peran: 'Dokter' | 'Perawat' | 'Apoteker' | 'Kasir & Pendaftaran' | 'Administrator Medis';
  noHp: string;
  email: string;
  pinAkses: string;
  status: 'Aktif' | 'Nonaktif';
  modulBoleh: string[];
}
