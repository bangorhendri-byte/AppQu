/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Stethoscope, 
  FileText, 
  History, 
  FileCheck, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  HeartPulse, 
  Activity, 
  Clock, 
  User, 
  Calendar,
  Send,
  Sparkles
} from 'lucide-react';
import { 
  RekamMedisRecord, 
  SuratMedisRecord, 
  KlinikAntrean, 
  KlinikPasien, 
  KlinikDokter, 
  KlinikObat, 
  ResepApotek, 
  TagihanKlinik,
  KlinikProfil,
  SOAPData
} from '../KlinikTypes';

interface RekamMedisViewProps {
  rekamMedisList: RekamMedisRecord[];
  suratMedisList: SuratMedisRecord[];
  antreanList: KlinikAntrean[];
  pasienList: KlinikPasien[];
  dokterList: KlinikDokter[];
  obatList: KlinikObat[];
  profilKlinik: KlinikProfil;
  activePatientForSOAP?: KlinikAntrean | null;
  onSaveRekamMedis: (
    record: RekamMedisRecord, 
    resepBaru?: ResepApotek, 
    tagihanBaru?: TagihanKlinik
  ) => void;
  onSaveSuratMedis: (surat: SuratMedisRecord) => void;
  onUpdateAntreanStatus: (id: string, status: any) => void;
}

export const RekamMedisView: React.FC<RekamMedisViewProps> = ({
  rekamMedisList,
  suratMedisList,
  antreanList,
  pasienList,
  dokterList,
  obatList,
  profilKlinik,
  activePatientForSOAP,
  onSaveRekamMedis,
  onSaveSuratMedis,
  onUpdateAntreanStatus
}) => {
  const [subTab, setSubTab] = useState<'soap' | 'riwayat' | 'surat'>('soap');

  // Active Patient selection for SOAP
  const [selectedAntreanId, setSelectedAntreanId] = useState<string>(
    activePatientForSOAP?.id || antreanList[0]?.id || ''
  );

  // SOAP FORM FIELDS
  const currentAntrean = antreanList.find(a => a.id === selectedAntreanId) || antreanList[0];
  const matchedPasien = pasienList.find(p => p.noRM === currentAntrean?.noRM);

  // Subjective
  const [keluhanUtama, setKeluhanUtama] = useState(currentAntrean?.keluhanAwal || '');
  const [rps, setRps] = useState('Gejala dirasakan memberat sejak 2 hari terakhir.');
  const [rpd, setRpd] = useState('Tidak ada riwayat penyakit kronis.');
  const [riwayatAlergi, setRiwayatAlergi] = useState(matchedPasien?.riwayatAlergi || 'Tidak ada riwayat alergi obat.');

  // Objective (TTV)
  const [tekananDarah, setTekananDarah] = useState('120/80');
  const [nadi, setNadi] = useState<number>(80);
  const [suhu, setSuhu] = useState<number>(36.8);
  const [frekuensiNapas, setFrekuensiNapas] = useState<number>(20);
  const [beratBadan, setBeratBadan] = useState<number>(60);
  const [tinggiBadan, setTinggiBadan] = useState<number>(165);
  const [pemeriksaanFisik, setPemeriksaanFisik] = useState('Keadaan umum baik, compos mentis, thoraks dalam batas normal.');

  // Assessment
  const [diagnosaUtama, setDiagnosaUtama] = useState('ISPA Akut / Common Cold (J06.9)');
  const [diagnosaSekunder, setDiagnosaSekunder] = useState('Febris hari ke-2');
  const [kodeICD10, setKodeICD10] = useState('J06.9');
  const [prognosa, setPrognosa] = useState<'Bonam' | 'Dubia ad Bonam' | 'Dubia ad Malam' | 'Malam'>('Bonam');

  // Plan - Tindakan
  const [tindakanMedis, setTindakanMedis] = useState<{ id: string; namaTindakan: string; biaya: number }[]>([
    { id: 't-1', namaTindakan: 'Pemeriksaan Fisik & Konsultasi Dokter', biaya: 45000 }
  ]);
  const [namaTindakanInput, setNamaTindakanInput] = useState('');
  const [biayaTindakanInput, setBiayaTindakanInput] = useState<number>(30000);

  // Plan - Resep Obat
  const [resepItems, setResepItems] = useState<{
    id: string;
    obatId: string;
    namaObat: string;
    dosis: string;
    aturanPakai: string;
    jumlah: number;
    satuan: string;
    hargaSatuan: number;
    subtotal: number;
  }[]>([
    {
      id: 'r-1',
      obatId: obatList[1]?.id || 'med-2',
      namaObat: obatList[1]?.namaObat || 'Paracetamol 500 mg Forte',
      dosis: '500 mg',
      aturanPakai: '3 x sehari 1 tablet sesudah makan',
      jumlah: 10,
      satuan: 'Tablet',
      hargaSatuan: obatList[1]?.hargaJual || 8000,
      subtotal: (obatList[1]?.hargaJual || 8000)
    }
  ]);

  const [selectedObatToAdd, setSelectedObatToAdd] = useState<string>(obatList[0]?.id || '');
  const [aturanPakaiInput, setAturanPakaiInput] = useState('3 x sehari 1 tablet sesudah makan');
  const [qtyObatInput, setQtyObatInput] = useState<number>(10);

  // Edukasi
  const [edukasi, setEdukasi] = useState('Istirahat cukup min. 8 jam, konsumsi air hangat, hindari gorengan.');
  const [kontrol, setKontrol] = useState('Kontrol kembali jika 3 hari demam tidak membaik.');

  // SURAT MEDIS FORM STATE
  const [jenisSurat, setJenisSurat] = useState<'surat_sakit' | 'surat_sehat'>('surat_sakit');
  const [selectedPasienSuratRM, setSelectedPasienSuratRM] = useState<string>(matchedPasien?.noRM || pasienList[0]?.noRM || '');
  const [jumlahHariSakit, setJumlahHariSakit] = useState<number>(3);
  const [tglMulaiSakit, setTglMulaiSakit] = useState('2026-10-14');
  const [tglSelesaiSakit, setTglSelesaiSakit] = useState('2026-10-16');
  const [keteranganSurat, setKeteranganSurat] = useState('Memerlukan istirahat medis karena kondisi infeksi saluran pernapasan akut.');
  const [keperluanSuratSehat, setKeperluanSuratSehat] = useState('Persyaratan Melamar Pekerjaan / Administrasi');
  const [butaWarnaVal, setButaWarnaVal] = useState<'Tidak Buta Warna' | 'Buta Warna Parsial' | 'Buta Warna Total'>('Tidak Buta Warna');

  // Preview Surat Modal
  const [activeSuratPreview, setActiveSuratPreview] = useState<SuratMedisRecord | null>(null);

  // Search History State
  const [historySearch, setHistorySearch] = useState('');

  // Handle Tambah Tindakan
  const handleAddTindakan = () => {
    if (!namaTindakanInput.trim()) return;
    setTindakanMedis([
      ...tindakanMedis,
      {
        id: `tnd-${Date.now()}`,
        namaTindakan: namaTindakanInput,
        biaya: Number(biayaTindakanInput) || 0
      }
    ]);
    setNamaTindakanInput('');
    setBiayaTindakanInput(30000);
  };

  const handleRemoveTindakan = (id: string) => {
    setTindakanMedis(tindakanMedis.filter(t => t.id !== id));
  };

  // Handle Tambah Obat ke Resep
  const handleAddObatResep = () => {
    const obat = obatList.find(o => o.id === selectedObatToAdd);
    if (!obat) return;

    // Check allergy warning
    if (riwayatAlergi.toLowerCase().includes(obat.kategori.toLowerCase()) || 
        riwayatAlergi.toLowerCase().includes(obat.namaObat.toLowerCase().slice(0, 5))) {
      const confirmAllergy = window.confirm(`⚠️ PERINGATAN ALERGI: Pasien memiliki catatan: "${riwayatAlergi}". Apakah Anda yakin meresepkan ${obat.namaObat}?`);
      if (!confirmAllergy) return;
    }

    const subtotal = obat.hargaJual * (Number(qtyObatInput) || 1);
    setResepItems([
      ...resepItems,
      {
        id: `rsp-${Date.now()}`,
        obatId: obat.id,
        namaObat: obat.namaObat,
        dosis: obat.dosisStandar || '1 dosis',
        aturanPakai: aturanPakaiInput,
        jumlah: Number(qtyObatInput) || 1,
        satuan: obat.satuan,
        hargaSatuan: obat.hargaJual,
        subtotal
      }
    ]);
  };

  const handleRemoveObatResep = (id: string) => {
    setResepItems(resepItems.filter(r => r.id !== id));
  };

  // Save SOAP Record
  const handleSaveSOAP = () => {
    if (!currentAntrean) {
      alert('Pilih pasien antrean terlebih dahulu.');
      return;
    }

    const now = new Date();
    const tgl = `${now.getDate()} Okt ${now.getFullYear()}`;
    const jam = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const soapData: SOAPData = {
      keluhanUtama,
      riwayatPenyakitSekarang: rps,
      riwayatPenyakitDahulu: rpd,
      riwayatAlergi,
      tekananDarah,
      nadi: Number(nadi),
      suhu: Number(suhu),
      frekuensiNapas: Number(frekuensiNapas),
      beratBadan: Number(beratBadan),
      tinggiBadan: Number(tinggiBadan),
      imt: Number((Number(beratBadan) / Math.pow(Number(tinggiBadan) / 100, 2)).toFixed(1)),
      pemeriksaanFisikLain: pemeriksaanFisik,
      diagnosaUtama,
      diagnosaSekunder,
      kodeICD10,
      prognosa,
      tindakanMedis,
      resepObat: resepItems,
      edukasiPasien: edukasi,
      anjuranKontrol: kontrol
    };

    const newRecordId = `rm-${Date.now()}`;
    const newRecord: RekamMedisRecord = {
      id: newRecordId,
      antreanId: currentAntrean.id,
      noRM: currentAntrean.noRM,
      namaPasien: currentAntrean.namaPasien,
      nik: currentAntrean.nik,
      gender: currentAntrean.gender,
      tglLahir: matchedPasien?.tglLahir || '1995-01-01',
      usia: currentAntrean.usia,
      tanggalPeriksa: tgl,
      jamPeriksa: jam,
      poli: currentAntrean.poli,
      dokterId: currentAntrean.dokterId,
      dokterNama: currentAntrean.dokterNama,
      soap: soapData
    };

    // Auto-generate Prescription for Pharmacy (Apotek)
    let generatedResep: ResepApotek | undefined;
    if (resepItems.length > 0) {
      const totalObatHarga = resepItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      generatedResep = {
        id: `rsp-${Date.now()}`,
        noResep: `RSP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`,
        antreanId: currentAntrean.id,
        rekamMedisId: newRecordId,
        noRM: currentAntrean.noRM,
        namaPasien: currentAntrean.namaPasien,
        usia: currentAntrean.usia,
        dokterNama: currentAntrean.dokterNama,
        tglResep: tgl,
        jamResep: jam,
        daftarObat: resepItems.map(r => ({
          ...r,
          statusRacik: 'Pending'
        })),
        statusPenyiapan: 'Menunggu Diracik',
        totalHarga: totalObatHarga,
        catatanAlergi: riwayatAlergi
      };
    }

    // Auto-generate Billing / Tagihan
    const totalTindakan = tindakanMedis.reduce((sum, t) => sum + t.biaya, 0);
    const totalObat = resepItems.reduce((sum, r) => sum + r.subtotal, 0);
    const totalBiaya = 15000 + 45000 + totalTindakan + totalObat;

    const generatedTagihan: TagihanKlinik = {
      id: `inv-${Date.now()}`,
      noInvoice: `INV-KL/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(Math.floor(100 + Math.random() * 900))}`,
      antreanId: currentAntrean.id,
      rekamMedisId: newRecordId,
      noRM: currentAntrean.noRM,
      namaPasien: currentAntrean.namaPasien,
      penjamin: currentAntrean.tipePenjamin,
      poli: currentAntrean.poli,
      dokterNama: currentAntrean.dokterNama,
      tglTagihan: tgl,
      jamTagihan: jam,
      rincian: {
        biayaRegistrasi: 15000,
        biayaKonsultasi: 45000,
        tindakanItems: tindakanMedis.map(t => ({ nama: t.namaTindakan, biaya: t.biaya })),
        obatItems: resepItems.map(r => ({
          nama: r.namaObat,
          aturanPakai: r.aturanPakai,
          qty: r.jumlah,
          harga: r.hargaSatuan,
          subtotal: r.subtotal
        })),
        alkesItems: [],
        diskonNominal: 0,
        totalKotor: totalBiaya,
        totalBersih: totalBiaya
      },
      metodePembayaran: currentAntrean.tipePenjamin === 'BPJS Kesehatan' ? 'Klaim BPJS' : 'Tunai',
      jumlahBayar: totalBiaya,
      kembalian: 0,
      statusPembayaran: currentAntrean.tipePenjamin === 'BPJS Kesehatan' ? 'Lunas' : 'Belum Lunas',
      kasirNama: 'Siti Nurhaliza (Kasir)'
    };

    onSaveRekamMedis(newRecord, generatedResep, generatedTagihan);
    onUpdateAntreanStatus(currentAntrean.id, 'Menunggu Obat');

    alert(`✅ Rekam Medis (SOAP) Pasien ${currentAntrean.namaPasien} berhasil disimpan! Resep otomatis diteruskan ke Apotek & Billing.`);
    setSubTab('riwayat');
  };

  // Handle Buat Surat Keterangan Sakit/Sehat
  const handleCreateSuratMedis = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPasien = pasienList.find(p => p.noRM === selectedPasienSuratRM) || pasienList[0];
    const targetDokter = dokterList[0];

    const now = new Date();
    const noSuratGen = `${String(suratMedisList.length + 1).padStart(3, '0')}/${jenisSurat === 'surat_sakit' ? 'SKD' : 'SKS'}/KL-SM/${now.getMonth() + 1}/${now.getFullYear()}`;

    const newSurat: SuratMedisRecord = {
      id: `srt-${Date.now()}`,
      noSurat: noSuratGen,
      jenis: jenisSurat,
      noRM: targetPasien.noRM,
      namaPasien: targetPasien.nama,
      nik: targetPasien.nik,
      gender: targetPasien.gender,
      tglLahir: targetPasien.tglLahir,
      pekerjaan: targetPasien.pekerjaan,
      alamat: targetPasien.alamat,
      dokterNama: targetDokter.nama,
      sipDokter: targetDokter.noSIP,
      tglPeriksa: `${now.getDate()} Oktober ${now.getFullYear()}`,
      tglMulai: tglMulaiSakit,
      tglSelesai: tglSelesaiSakit,
      jumlahHari: Number(jumlahHariSakit),
      keteranganIstirahat: keteranganSurat,
      keperluanSuratSehat: keperluanSuratSehat,
      hasilTTV: {
        tensi: tekananDarah,
        beratBadan: Number(beratBadan),
        tinggiBadan: Number(tinggiBadan),
        golDarah: targetPasien.golDarah,
        butaWarna: butaWarnaVal
      },
      diagnosaRingkas: diagnosaUtama,
      createdAt: `${now.getDate()} Okt ${now.getFullYear()}`
    };

    onSaveSuratMedis(newSurat);
    setActiveSuratPreview(newSurat);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#0F4C5C]" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Rekam Medis Elektronik (RME)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standar pencatatan medis SOAP, riwayat kunjungan pasien & penerbitan surat keterangan dokter
          </p>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setSubTab('soap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'soap'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#34D399]" />
            Input SOAP
          </button>
          <button
            onClick={() => setSubTab('riwayat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'riwayat'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#34D399]" />
            Riwayat Medis ({rekamMedisList.length})
          </button>
          <button
            onClick={() => setSubTab('surat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'surat'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-[#34D399]" />
            Surat Sakit / Sehat
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: INPUT SOAP */}
      {subTab === 'soap' && (
        <div className="space-y-6">
          {/* Active Patient Selector Banner */}
          <div className="bg-gradient-to-r from-[#0F4C5C] to-teal-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl text-[#34D399] border border-white/20">
                {currentAntrean ? currentAntrean.noAntrean : 'None'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {currentAntrean ? currentAntrean.namaPasien : 'Pilih Pasien Dari Antrean'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {currentAntrean ? currentAntrean.tipePenjamin : 'Umum'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  No. RM: <span className="font-mono font-bold text-[#34D399]">{currentAntrean?.noRM || '-'}</span> • {currentAntrean?.poli} • Dokter: {currentAntrean?.dokterNama}
                </p>
              </div>
            </div>

            {/* Quick Switch Patient from Today's Queue */}
            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-slate-300 font-medium pl-2">Antrean:</span>
              <select
                value={selectedAntreanId}
                onChange={(e) => {
                  setSelectedAntreanId(e.target.value);
                  const selected = antreanList.find(a => a.id === e.target.value);
                  if (selected) {
                    setKeluhanUtama(selected.keluhanAwal);
                  }
                }}
                className="bg-slate-800 text-white text-xs font-bold rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
              >
                {antreanList.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.noAntrean} - {a.namaPasien} ({a.poli})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SOAP Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* S: SUBJECTIVE */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 text-[#0F4C5C] font-black flex items-center justify-center text-xs">
                    S
                  </span>
                  <h4 className="font-black text-slate-800 text-sm">Subjective (Anamnesis & Keluhan)</h4>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Keluhan Pasien</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keluhan Utama *</label>
                <textarea
                  rows={2}
                  value={keluhanUtama}
                  onChange={(e) => setKeluhanUtama(e.target.value)}
                  placeholder="Misal: Demam tinggi 2 hari, batuk kering, nyeri menelan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Riwayat Penyakit Sekarang (RPS)</label>
                <textarea
                  rows={2}
                  value={rps}
                  onChange={(e) => setRps(e.target.value)}
                  placeholder="Kronologi timbulnya keluhan, faktor pencetus, respon terhadap obat sebelumnya"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Riwayat Penyakit Dahulu (RPD)</label>
                  <input
                    type="text"
                    value={rpd}
                    onChange={(e) => setRpd(e.target.value)}
                    placeholder="Asma / Maag / HT"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-700 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Riwayat Alergi Obat
                  </label>
                  <input
                    type="text"
                    value={riwayatAlergi}
                    onChange={(e) => setRiwayatAlergi(e.target.value)}
                    placeholder="Penisilin / Sulfa / Alergi Makanan"
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* O: OBJECTIVE */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 text-[#0F4C5C] font-black flex items-center justify-center text-xs">
                    O
                  </span>
                  <h4 className="font-black text-slate-800 text-sm">Objective (Tanda Vital & Fisik)</h4>
                </div>
                <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5" />
                  Vital Signs (TTV)
                </span>
              </div>

              {/* TTV 6 Grid Metrics */}
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tensi Darah</span>
                  <input
                    type="text"
                    value={tekananDarah}
                    onChange={(e) => setTekananDarah(e.target.value)}
                    className="w-full mt-1 font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                    placeholder="120/80"
                  />
                  <span className="text-[9px] text-slate-400">mmHg</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Nadi</span>
                  <input
                    type="number"
                    value={nadi}
                    onChange={(e) => setNadi(Number(e.target.value))}
                    className="w-full mt-1 font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                    placeholder="80"
                  />
                  <span className="text-[9px] text-slate-400">x / menit</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Suhu Tubuh</span>
                  <input
                    type="number"
                    step="0.1"
                    value={suhu}
                    onChange={(e) => setSuhu(Number(e.target.value))}
                    className="w-full mt-1 font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                    placeholder="36.5"
                  />
                  <span className="text-[9px] text-slate-400">°Celsius</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Laju Napas (RR)</span>
                  <input
                    type="number"
                    value={frekuensiNapas}
                    onChange={(e) => setFrekuensiNapas(Number(e.target.value))}
                    className="w-full mt-1 font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                    placeholder="20"
                  />
                  <span className="text-[9px] text-slate-400">x / menit</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Berat Badan</span>
                  <input
                    type="number"
                    value={beratBadan}
                    onChange={(e) => setBeratBadan(Number(e.target.value))}
                    className="w-full mt-1 font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                    placeholder="60"
                  />
                  <span className="text-[9px] text-slate-400">kg</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tinggi Badan</span>
                  <input
                    type="number"
                    value={tinggiBadan}
                    onChange={(e) => setTinggiBadan(Number(e.target.value))}
                    className="w-full mt-1 font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                    placeholder="165"
                  />
                  <span className="text-[9px] text-slate-400">cm</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pemeriksaan Fisik Lengkap</label>
                <textarea
                  rows={2}
                  value={pemeriksaanFisik}
                  onChange={(e) => setPemeriksaanFisik(e.target.value)}
                  placeholder="Kepala/Leher, Thoraks, Abdomen, Ekstremitas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* A: ASSESSMENT */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 text-[#0F4C5C] font-black flex items-center justify-center text-xs">
                    A
                  </span>
                  <h4 className="font-black text-slate-800 text-sm">Assessment (Diagnosa ICD-10)</h4>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Analisis Medis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosa Utama (Primer) *</label>
                  <input
                    type="text"
                    value={diagnosaUtama}
                    onChange={(e) => setDiagnosaUtama(e.target.value)}
                    placeholder="Contoh: Faringitis Akut / ISPA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981] font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode ICD-10</label>
                  <input
                    type="text"
                    value={kodeICD10}
                    onChange={(e) => setKodeICD10(e.target.value)}
                    placeholder="J06.9"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-[#0F4C5C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosa Sekunder / Komorbid</label>
                  <input
                    type="text"
                    value={diagnosaSekunder}
                    onChange={(e) => setDiagnosaSekunder(e.target.value)}
                    placeholder="Febris hari ke-2 / Dyspepsia"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prognosa Klinis</label>
                  <select
                    value={prognosa}
                    onChange={(e) => setPrognosa(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Bonam">Bonam (Baik / Sembuh)</option>
                    <option value="Dubia ad Bonam">Dubia ad Bonam (Cenderung Baik)</option>
                    <option value="Dubia ad Malam">Dubia ad Malam (Meragukan)</option>
                    <option value="Malam">Malam (Buruk)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* P: PLAN */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 text-[#0F4C5C] font-black flex items-center justify-center text-xs">
                    P
                  </span>
                  <h4 className="font-black text-slate-800 text-sm">Plan (Tindakan, Resep & Edukasi)</h4>
                </div>
                <span className="text-[11px] font-bold text-[#10B981]">Rencana Terapi</span>
              </div>

              {/* Tindakan Medis List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Tindakan Medis / Perawatan</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {tindakanMedis.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs border border-slate-200">
                      <span className="font-semibold text-slate-800">{t.namaTindakan}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F4C5C]">Rp {t.biaya.toLocaleString('id-ID')}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTindakan(t.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Tindakan input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nama tindakan (misal: Nebulisasi, Jahit Luka)"
                    value={namaTindakanInput}
                    onChange={(e) => setNamaTindakanInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Tarif (Rp)"
                    value={biayaTindakanInput}
                    onChange={(e) => setBiayaTindakanInput(Number(e.target.value))}
                    className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTindakan}
                    className="px-3 py-1.5 bg-[#0F4C5C] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* Resep Obat Elektronik */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Resep Obat Apotek ({resepItems.length})</label>
                  <span className="text-[10px] text-emerald-600 font-bold">Sinkron Stok Real-time</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {resepItems.map(r => (
                    <div key={r.id} className="p-2 bg-teal-50/50 rounded-xl border border-teal-100 text-xs flex items-center justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-slate-800">{r.namaObat}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.aturanPakai} • {r.jumlah} {r.satuan}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F4C5C]">Rp {r.subtotal.toLocaleString('id-ID')}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveObatResep(r.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Obat to Resep */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={selectedObatToAdd}
                      onChange={(e) => setSelectedObatToAdd(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      {obatList.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.namaObat} (Stok: {o.stok} {o.satuan})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Aturan pakai: 3x1 sesudah makan"
                      value={aturanPakaiInput}
                      onChange={(e) => setAturanPakaiInput(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                      Jumlah:
                      <input
                        type="number"
                        min="1"
                        value={qtyObatInput}
                        onChange={(e) => setQtyObatInput(Number(e.target.value))}
                        className="w-16 p-1 bg-white border border-slate-200 rounded-lg text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddObatResep}
                      className="px-3 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      + Masukkan Resep
                    </button>
                  </div>
                </div>
              </div>

              {/* Edukasi Pasien */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Edukasi Pasien & Anjuran Kontrol</label>
                <input
                  type="text"
                  value={edukasi}
                  onChange={(e) => setEdukasi(e.target.value)}
                  placeholder="Pantangan makan, istirahat..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action: Save SOAP Button */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Menyimpan SOAP akan otomatis menerbitkan resep ke Apotek & draft tagihan ke Kasir.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubTab('surat')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#0F4C5C]" />
                Buat Surat Keterangan Sakit
              </button>
              
              <button
                type="button"
                onClick={handleSaveSOAP}
                className="px-6 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0F4C5C]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#34D399]" />
                Simpan Rekam Medis (SOAP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RIWAYAT MEDIS PASIEN */}
      {subTab === 'riwayat' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari riwayat pasien, diagnosa, No RM..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Total {rekamMedisList.length} Catatan Medis
            </span>
          </div>

          <div className="space-y-3">
            {rekamMedisList
              .filter(rec => 
                rec.namaPasien.toLowerCase().includes(historySearch.toLowerCase()) ||
                rec.noRM.toLowerCase().includes(historySearch.toLowerCase()) ||
                rec.soap.diagnosaUtama.toLowerCase().includes(historySearch.toLowerCase())
              )
              .map((rec) => (
                <div key={rec.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F4C5C] font-black flex items-center justify-center text-xs">
                        RM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{rec.namaPasien}</h4>
                          <span className="text-xs font-mono font-bold text-[#0F4C5C] bg-teal-50 px-2 py-0.5 rounded">
                            {rec.noRM}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {rec.tanggalPeriksa} • {rec.jamPeriksa} WIB • {rec.poli} • {rec.dokterNama}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        Diagnosa: {rec.soap.kodeICD10 || 'J06.9'}
                      </span>
                    </div>
                  </div>

                  {/* SOAP Summary Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-[#0F4C5C] uppercase text-[10px]">Subjective</span>
                      <p className="text-slate-700 mt-1 line-clamp-3">
                        Keluhan: "{rec.soap.keluhanUtama}"
                      </p>
                      <p className="text-amber-700 text-[10px] mt-1 font-semibold">
                        Alergi: {rec.soap.riwayatAlergi}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-[#0F4C5C] uppercase text-[10px]">Objective (TTV)</span>
                      <div className="space-y-0.5 mt-1 text-slate-700">
                        <p>TD: <span className="font-bold">{rec.soap.tekananDarah}</span> mmHg</p>
                        <p>Nadi: <span className="font-bold">{rec.soap.nadi}</span> bpm | Suhu: <span className="font-bold">{rec.soap.suhu}°C</span></p>
                        <p>BB: <span className="font-bold">{rec.soap.beratBadan} kg</span> | TB: <span className="font-bold">{rec.soap.tinggiBadan} cm</span></p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-[#0F4C5C] uppercase text-[10px]">Assessment</span>
                      <p className="font-bold text-slate-800 mt-1">{rec.soap.diagnosaUtama}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{rec.soap.diagnosaSekunder}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-teal-700">Prognosa: {rec.soap.prognosa}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-[#0F4C5C] uppercase text-[10px]">Plan & Terapi</span>
                      <div className="space-y-0.5 mt-1 text-slate-700">
                        <p className="font-medium text-[11px]">{rec.soap.resepObat.length} Macam Obat Diresepkan</p>
                        <p className="text-slate-500 text-[10px] line-clamp-2">
                          {rec.soap.resepObat.map(o => o.namaObat).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SURAT KETERANGAN SAKIT / SEHAT */}
      {subTab === 'surat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Pembuatan Surat */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0F4C5C]" />
                Penerbitan Surat Medis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Surat Keterangan Sakit (istirahat) atau Keterangan Dokter Berbadan Sehat
              </p>
            </div>

            <form onSubmit={handleCreateSuratMedis} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Surat</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenisSurat('surat_sakit')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      jenisSurat === 'surat_sakit'
                        ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                        : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Surat Sakit (Istirahat)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisSurat('surat_sehat')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      jenisSurat === 'surat_sehat'
                        ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                        : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Surat Berbadan Sehat
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Pasien Terdaftar</label>
                <select
                  value={selectedPasienSuratRM}
                  onChange={(e) => setSelectedPasienSuratRM(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  {pasienList.map(p => (
                    <option key={p.id} value={p.noRM}>
                      {p.nama} ({p.noRM}) - {p.pekerjaan}
                    </option>
                  ))}
                </select>
              </div>

              {jenisSurat === 'surat_sakit' ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Jumlah Hari</label>
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={jumlahHariSakit}
                        onChange={(e) => setJumlahHariSakit(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Tgl Mulai</label>
                      <input
                        type="date"
                        value={tglMulaiSakit}
                        onChange={(e) => setTglMulaiSakit(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Tgl Selesai</label>
                      <input
                        type="date"
                        value={tglSelesaiSakit}
                        onChange={(e) => setTglSelesaiSakit(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Istirahat</label>
                    <textarea
                      rows={2}
                      value={keteranganSurat}
                      onChange={(e) => setKeteranganSurat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan Surat Sehat</label>
                    <input
                      type="text"
                      value={keperluanSuratSehat}
                      onChange={(e) => setKeperluanSuratSehat(e.target.value)}
                      placeholder="Persyaratan Melamar Pekerjaan / SIM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tes Buta Warna</label>
                    <select
                      value={butaWarnaVal}
                      onChange={(e) => setButaWarnaVal(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Tidak Buta Warna">Tidak Buta Warna (Normal)</option>
                      <option value="Buta Warna Parsial">Buta Warna Parsial</option>
                      <option value="Buta Warna Total">Buta Warna Total</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#34D399]" />
                Generate Surat & Pratinjau
              </button>
            </form>
          </div>

          {/* Preview & Riwayat Surat Resmi Kop Surat */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pratinjau Kop Surat Resmi */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative">
              {/* Kop Surat Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                <h3 className="text-base sm:text-lg font-black uppercase text-[#0F4C5C] tracking-wide">
                  {profilKlinik.namaKlinik}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {profilKlinik.alamat}, {profilKlinik.kota} • Telp: {profilKlinik.telepon}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Izin Operasional: {profilKlinik.noIzinOperasional}
                </p>
              </div>

              {/* Judul Surat */}
              <div className="text-center mb-6">
                <h4 className="text-sm font-extrabold uppercase underline tracking-wider text-slate-900">
                  {jenisSurat === 'surat_sakit' ? 'SURAT KETERANGAN SAKIT' : 'SURAT KETERANGAN BERBADAN SEHAT'}
                </h4>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Nomor: {activeSuratPreview?.noSurat || '045/SKD/KL-SM/X/2026'}
                </p>
              </div>

              {/* Isi Surat Medis */}
              <div className="text-xs leading-relaxed text-slate-700 space-y-3">
                <p>
                  Yang bertanda tangan di bawah ini, Dokter Pemeriksa pada <strong>{profilKlinik.namaKlinik}</strong> menerangkan dengan sebenarnya bahwa:
                </p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Nama Lengkap</span>
                    <span className="col-span-2 font-bold text-slate-800">: {activeSuratPreview?.namaPasien || pasienList[0]?.nama}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Nomor Rekam Medis</span>
                    <span className="col-span-2 font-mono font-bold text-[#0F4C5C]">: {activeSuratPreview?.noRM || pasienList[0]?.noRM}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Pekerjaan</span>
                    <span className="col-span-2 font-medium text-slate-800">: {activeSuratPreview?.pekerjaan || pasienList[0]?.pekerjaan}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Alamat</span>
                    <span className="col-span-2 text-slate-700">: {activeSuratPreview?.alamat || pasienList[0]?.alamat}</span>
                  </div>
                </div>

                {jenisSurat === 'surat_sakit' ? (
                  <p>
                    Berdasarkan hasil pemeriksaan klinis, yang bersangkutan dalam keadaan sakit sehingga memerlukan istirahat selama{' '}
                    <strong>{activeSuratPreview?.jumlahHari || jumlahHariSakit} hari</strong>, terhitung mulai tanggal{' '}
                    <strong>{activeSuratPreview?.tglMulai || tglMulaiSakit}</strong> s/d{' '}
                    <strong>{activeSuratPreview?.tglSelesai || tglSelesaiSakit}</strong>.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p>
                      Telah diperiksa kesehatan fisiknya dan dinyatakan dalam keadaan <strong>SEHAT</strong> untuk keperluan: <em>"{activeSuratPreview?.keperluanSuratSehat || keperluanSuratSehat}"</em>.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-teal-50/50 rounded-xl border border-teal-100 text-[11px]">
                      <div>Tensi: <strong>{tekananDarah} mmHg</strong></div>
                      <div>BB: <strong>{beratBadan} kg</strong></div>
                      <div>TB: <strong>{tinggiBadan} cm</strong></div>
                      <div>Buta Warna: <strong>{butaWarnaVal}</strong></div>
                    </div>
                  </div>
                )}

                <p className="pt-2">
                  Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Tanda Tangan Dokter */}
              <div className="mt-8 flex justify-end">
                <div className="text-center text-xs">
                  <p>{profilKlinik.kota}, 14 Oktober 2026</p>
                  <p className="text-slate-500">Dokter Pemeriksa,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-serif italic text-teal-800 font-bold text-sm tracking-wider underline">
                      (dr. Fajar Nugroho)
                    </span>
                  </div>
                  <p className="font-bold text-slate-800">{dokterList[0]?.nama}</p>
                  <p className="text-[10px] text-slate-500 font-mono">SIP: {dokterList[0]?.noSIP}</p>
                </div>
              </div>

              {/* Action Cetak */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 italic">
                  Format resmi standar surat keterangan medis klinis Pratama
                </span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#34D399]" />
                  Cetak Lembar Surat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
