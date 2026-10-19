/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Volume2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  Filter,
  User,
  HeartPulse,
  Phone,
  FileText
} from 'lucide-react';
import { 
  KlinikAntrean, 
  KlinikPasien, 
  KlinikDokter, 
  TipePenjamin, 
  PoliKlinik,
  StatusAntrean 
} from '../KlinikTypes';

interface PendaftaranViewProps {
  antreanList: KlinikAntrean[];
  pasienList: KlinikPasien[];
  dokterList: KlinikDokter[];
  onAddAntrean: (newAntrean: KlinikAntrean) => void;
  onUpdateStatusAntrean: (id: string, newStatus: StatusAntrean) => void;
  onNavigateToRekamMedis: (antrean: KlinikAntrean) => void;
  onAddNewPasienQuick: (newPasien: KlinikPasien) => void;
}

export const PendaftaranView: React.FC<PendaftaranViewProps> = ({
  antreanList,
  pasienList,
  dokterList,
  onAddAntrean,
  onUpdateStatusAntrean,
  onNavigateToRekamMedis,
  onAddNewPasienQuick
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'ambil'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPoli, setFilterPoli] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  
  // Voice call simulator state
  const [callingId, setCallingId] = useState<string | null>(null);
  const [ticketModal, setTicketModal] = useState<KlinikAntrean | null>(null);

  // Form State Ambil Antrean
  const [tipePenjamin, setTipePenjamin] = useState<TipePenjamin>('Umum');
  const [selectedPasienId, setSelectedPasienId] = useState<string>('');
  const [nikSearch, setNikSearch] = useState('');
  const [pasienBaruMode, setPasienBaruMode] = useState(false);

  // New Patient Form
  const [newNama, setNewNama] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newTglLahir, setNewTglLahir] = useState('1995-01-01');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newHp, setNewHp] = useState('');
  const [newAlamat, setNewAlamat] = useState('');
  const [newNoKartu, setNewNoKartu] = useState('');
  const [newAlergi, setNewAlergi] = useState('');

  // Queue appointment fields
  const [selectedPoli, setSelectedPoli] = useState<PoliKlinik>('Poli Umum');
  const [selectedDokterId, setSelectedDokterId] = useState<string>(dokterList[0]?.id || '');
  const [keluhanAwal, setKeluhanAwal] = useState('');

  // Generate No Antrean berikutnya
  const getNextNoAntrean = (penjamin: TipePenjamin) => {
    const prefix = penjamin === 'BPJS Kesehatan' ? 'B' : penjamin === 'Asuransi Swasta' ? 'C' : 'A';
    const samePrefixCount = antreanList.filter(a => a.noAntrean.startsWith(prefix)).length;
    return `${prefix}-${String(samePrefixCount + 1).padStart(3, '0')}`;
  };

  const handlePanggilSuara = (item: KlinikAntrean) => {
    setCallingId(item.id);
    onUpdateStatusAntrean(item.id, 'Dipanggil');

    // Web Speech API Announcement
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `Nomor antrean, ${item.noAntrean}. Atas nama ${item.namaPasien}. Silakan menuju ${item.poli}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      setCallingId(null);
    }, 4000);
  };

  const handleSubmitAmbilAntrean = (e: React.FormEvent) => {
    e.preventDefault();

    let finalPasien: {
      noRM: string;
      nama: string;
      nik: string;
      usia: number;
      gender: 'L' | 'P';
      noHp: string;
    };

    if (pasienBaruMode) {
      if (!newNama || !newNik) {
        alert('Mohon lengkapi Nama Pasien dan NIK.');
        return;
      }
      const birthYear = new Date(newTglLahir).getFullYear() || 1995;
      const calculatedAge = Math.max(1, 2026 - birthYear);
      const generatedRM = `RM-2026-${String(pasienList.length + 1).padStart(4, '0')}`;

      const createdPasien: KlinikPasien = {
        id: `pas-${Date.now()}`,
        noRM: generatedRM,
        nik: newNik,
        nama: newNama,
        tglLahir: newTglLahir,
        gender: newGender,
        golDarah: '-',
        noHp: newHp || '0812-0000-0000',
        alamat: newAlamat || 'Kota Bandung',
        pekerjaan: 'Masyarakat Umum',
        penjaminUtama: tipePenjamin,
        noKartuPenjamin: newNoKartu,
        riwayatAlergi: newAlergi || 'Tidak ada riwayat alergi',
        tglRegistrasi: '14 Okt 2026',
        totalKunjungan: 1,
        totalPiutang: 0
      };

      onAddNewPasienQuick(createdPasien);
      finalPasien = {
        noRM: createdPasien.noRM,
        nama: createdPasien.nama,
        nik: createdPasien.nik,
        usia: calculatedAge,
        gender: createdPasien.gender,
        noHp: createdPasien.noHp
      };
    } else {
      const existing = pasienList.find(p => p.id === selectedPasienId);
      if (!existing) {
        alert('Pilih data pasien terlebih dahulu atau gunakan formulir Pasien Baru.');
        return;
      }
      const birthYear = new Date(existing.tglLahir).getFullYear() || 1990;
      finalPasien = {
        noRM: existing.noRM,
        nama: existing.nama,
        nik: existing.nik,
        usia: Math.max(1, 2026 - birthYear),
        gender: existing.gender,
        noHp: existing.noHp
      };
    }

    const selectedDoc = dokterList.find(d => d.id === selectedDokterId) || dokterList[0];
    const generatedNo = getNextNoAntrean(tipePenjamin);
    const now = new Date();
    const jamDaftar = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newAntrean: KlinikAntrean = {
      id: `ant-${Date.now()}`,
      noAntrean: generatedNo,
      tipePenjamin,
      noRM: finalPasien.noRM,
      namaPasien: finalPasien.nama,
      nik: finalPasien.nik,
      usia: finalPasien.usia,
      gender: finalPasien.gender,
      poli: selectedPoli,
      dokterId: selectedDoc?.id || 'doc-1',
      dokterNama: selectedDoc?.nama || 'dr. Umum',
      keluhanAwal: keluhanAwal || 'Pemeriksaan Kesehatan Rutin',
      waktuDaftar: jamDaftar,
      noHp: finalPasien.noHp,
      status: 'Menunggu',
      panggilanKe: 0,
      catatanPetugas: `Pendaftaran mandiri ${tipePenjamin}`
    };

    onAddAntrean(newAntrean);
    setTicketModal(newAntrean);

    // Reset Form
    setKeluhanAwal('');
    setPasienBaruMode(false);
    setSelectedPasienId('');
    setActiveSubTab('daftar');
  };

  // Filter list
  const filteredAntrean = antreanList.filter(item => {
    const matchSearch = 
      item.namaPasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.noAntrean.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.noRM.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPoli = filterPoli === 'Semua' || item.poli === filterPoli;
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    return matchSearch && matchPoli && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Pendaftaran & Antrean Pasien
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manajemen alur antrean pendaftaran umum, BPJS Kesehatan, dan poliklinik terpadu
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveSubTab('daftar')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'daftar'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Antrean Hari Ini ({antreanList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ambil')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'ambil'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 text-[#34D399]" />
            Ambil Nomor Antrean
          </button>
        </div>
      </div>

      {activeSubTab === 'ambil' ? (
        /* Form Ambil Nomor Antrean */
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F4C5C] flex items-center justify-center font-bold">
                1
              </span>
              Formulir Pendaftaran & Cetak Karcis Antrean
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pilih jenis penjamin, data pasien (rekam medis terdaftar atau baru), dan poliklinik tujuan
            </p>
          </div>

          <form onSubmit={handleSubmitAmbilAntrean} className="space-y-6">
            {/* Tipe Penjamin Radio Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Jenis Penjamin Biaya
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Umum', 'BPJS Kesehatan', 'Asuransi Swasta'] as TipePenjamin[]).map((tipe) => (
                  <button
                    type="button"
                    key={tipe}
                    onClick={() => setTipePenjamin(tipe)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      tipePenjamin === tipe
                        ? 'border-[#10B981] bg-teal-50/50 ring-2 ring-[#10B981]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-800">{tipe}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tipe === 'BPJS Kesehatan' ? 'bg-emerald-100 text-emerald-800' :
                        tipe === 'Asuransi Swasta' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {tipe === 'BPJS Kesehatan' ? 'Prefix B' : tipe === 'Asuransi Swasta' ? 'Prefix C' : 'Prefix A'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {tipe === 'BPJS Kesehatan' ? 'Verifikasi rujukan & no. kartu BPJS' :
                       tipe === 'Asuransi Swasta' ? 'Admedika, Prudential, Manulife, dll' :
                       'Pembayaran tunai / QRIS / mandiri'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pasien Mode: Pasien Lama vs Pasien Baru */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Data Identitas Pasien
                </label>
                <button
                  type="button"
                  onClick={() => setPasienBaruMode(!pasienBaruMode)}
                  className="text-xs font-bold text-[#0F4C5C] hover:text-[#10B981] underline cursor-pointer"
                >
                  {pasienBaruMode ? '← Cari Pasien Terdaftar' : '+ Registrasi Pasien Baru'}
                </button>
              </div>

              {!pasienBaruMode ? (
                <div>
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Cari pasien via Nama / No. RM / NIK..."
                      value={nikSearch}
                      onChange={(e) => setNikSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {pasienList
                      .filter(p => 
                        p.nama.toLowerCase().includes(nikSearch.toLowerCase()) ||
                        p.noRM.toLowerCase().includes(nikSearch.toLowerCase()) ||
                        p.nik.includes(nikSearch)
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPasienId(p.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            selectedPasienId === p.id
                              ? 'bg-white border-[#10B981] ring-2 ring-[#10B981]/20'
                              : 'bg-white/70 hover:bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-800">{p.nama}</span>
                              <span className="text-[10px] font-mono font-bold text-[#0F4C5C] bg-teal-50 px-1.5 py-0.5 rounded">
                                {p.noRM}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                ({p.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              NIK: {p.nik} • HP: {p.noHp}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            selectedPasienId === p.id ? 'bg-[#10B981] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {selectedPasienId === p.id ? 'Terpilih' : 'Pilih'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                /* Formulir Pasien Baru Cepat */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Pasien *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ny. Kartika Dewi"
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">NIK (KTP) Pasien *</label>
                    <input
                      type="text"
                      required
                      placeholder="16 digit NIK"
                      value={newNik}
                      onChange={(e) => setNewNik(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={newTglLahir}
                      onChange={(e) => setNewTglLahir(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Jenis Kelamin</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewGender('L')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                          newGender === 'L' ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]' : 'bg-white text-slate-700'
                        }`}
                      >
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewGender('P')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                          newGender === 'P' ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]' : 'bg-white text-slate-700'
                        }`}
                      >
                        Perempuan
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      value={newHp}
                      onChange={(e) => setNewHp(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">No. Kartu Penjamin / BPJS (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Nomor kartu asuransi / BPJS"
                      value={newNoKartu}
                      onChange={(e) => setNewNoKartu(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Riwayat Alergi Obat</label>
                    <input
                      type="text"
                      placeholder="Misal: Alergi Penisilin, Asam Mefenamat (kosongkan bila tidak ada)"
                      value={newAlergi}
                      onChange={(e) => setNewAlergi(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Poliklinik & Dokter Tujuan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Poliklinik Tujuan</label>
                <select
                  value={selectedPoli}
                  onChange={(e) => setSelectedPoli(e.target.value as PoliKlinik)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                >
                  <option value="Poli Umum">Poli Umum</option>
                  <option value="Poli Gigi & Mulut">Poli Gigi & Mulut</option>
                  <option value="Poli KIA & Anak">Poli KIA & Anak</option>
                  <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                  <option value="Unit Tindakan / IGD Ringan">Unit Tindakan / IGD Ringan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dokter Pemeriksa Bertugas</label>
                <select
                  value={selectedDokterId}
                  onChange={(e) => setSelectedDokterId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                >
                  {dokterList.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nama} ({d.spesialisasi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Keluhan Utama Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Demam 2 hari, tenggorokan sakit, mual"
                  value={keluhanAwal}
                  onChange={(e) => setKeluhanAwal(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* Tombol Cetak / Ambil */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('daftar')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0F4C5C]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-[#34D399]" />
                Cetak Karcis & Daftarkan Antrean
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Daftar Antrean Hari Ini */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama pasien, no antrean, no RM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Poli:
              </div>
              <select
                value={filterPoli}
                onChange={(e) => setFilterPoli(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
              >
                <option value="Semua">Semua Poli</option>
                <option value="Poli Umum">Poli Umum</option>
                <option value="Poli Gigi & Mulut">Poli Gigi</option>
                <option value="Poli KIA & Anak">Poli KIA/Anak</option>
                <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Dipanggil">Dipanggil</option>
                <option value="Pemeriksaan">Pemeriksaan</option>
                <option value="Menunggu Obat">Menunggu Obat</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Cards Grid Antrean */}
          {filteredAntrean.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-extrabold text-slate-700 text-base">Tidak Ada Antrean Ditemukan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Belum ada pasien yang mendaftar atau hasil pencarian tidak cocok. Klik "Ambil Nomor Antrean" untuk menambahkan.
              </p>
              <button
                onClick={() => setActiveSubTab('ambil')}
                className="mt-4 px-4 py-2 bg-[#0F4C5C] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + Ambil Nomor Antrean Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAntrean.map((item) => {
                const isCalling = callingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                      isCalling
                        ? 'border-[#10B981] shadow-lg ring-2 ring-[#10B981]/30 animate-pulse'
                        : item.status === 'Pemeriksaan'
                        ? 'border-teal-400 bg-teal-50/20 shadow-xs'
                        : item.status === 'Selesai'
                        ? 'border-slate-200 bg-slate-50/50 opacity-80'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Header Card */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl font-black font-mono text-[#0F4C5C] tracking-tight">
                            {item.noAntrean}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.tipePenjamin === 'BPJS Kesehatan' ? 'bg-emerald-100 text-emerald-800' :
                            item.tipePenjamin === 'Asuransi Swasta' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.tipePenjamin}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          item.status === 'Dipanggil' ? 'bg-amber-100 text-amber-800 animate-bounce' :
                          item.status === 'Pemeriksaan' ? 'bg-teal-100 text-[#0F4C5C]' :
                          item.status === 'Menunggu Obat' ? 'bg-indigo-100 text-indigo-800' :
                          item.status === 'Selesai' ? 'bg-slate-200 text-slate-700' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {item.status}
                        </span>
                      </div>

                      {/* Detail Pasien */}
                      <div className="mt-3">
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">
                            {item.namaPasien}
                          </h4>
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            {item.noRM}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          Usia: <span className="font-bold text-slate-700">{item.usia} thn</span> • {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • Daftar: {item.waktuDaftar} WIB
                        </p>

                        <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                            <Stethoscope className="w-3.5 h-3.5 text-[#0F4C5C]" />
                            <span>{item.poli}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                            Dokter: {item.dokterNama}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1 italic line-clamp-2">
                            "{item.keluhanAwal}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePanggilSuara(item)}
                          title="Panggil Antrean Suara"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isCalling 
                              ? 'bg-[#10B981] text-white' 
                              : 'bg-teal-50 hover:bg-teal-100 text-[#0F4C5C]'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          {isCalling ? 'Memanggil...' : 'Panggil'}
                        </button>
                        
                        <button
                          onClick={() => setTicketModal(item)}
                          title="Cetak Ulang Karcis"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Direct to SOAP / Rekam Medis */}
                      <button
                        onClick={() => onNavigateToRekamMedis(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Periksa SOAP</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#34D399]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL CETAK KARCIS ANTREAN */}
      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F4C5C] mx-auto flex items-center justify-center mb-3">
              <Printer className="w-6 h-6 text-[#10B981]" />
            </div>
            
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Karcis Antrean Resmi
            </span>
            <h3 className="text-base font-extrabold text-slate-800">
              Klinik Pratama Sehat Mandiri
            </h3>
            
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-4xl font-black font-mono text-[#0F4C5C] tracking-tight">
                {ticketModal.noAntrean}
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1">
                {ticketModal.tipePenjamin}
              </p>
              <div className="border-t border-slate-200 my-3" />
              <div className="text-left text-xs space-y-1 text-slate-600">
                <p>Nama: <span className="font-bold text-slate-800">{ticketModal.namaPasien}</span></p>
                <p>No. RM: <span className="font-mono font-bold text-slate-800">{ticketModal.noRM}</span></p>
                <p>Poli: <span className="font-bold text-slate-800">{ticketModal.poli}</span></p>
                <p>Dokter: <span className="text-slate-800">{ticketModal.dokterNama}</span></p>
                <p>Waktu Daftar: <span className="font-bold text-slate-800">{ticketModal.waktuDaftar} WIB</span></p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-5 italic">
              "Harap duduk di ruang tunggu yang telah disediakan. Nomor antrean akan dipanggil melalui pengeras suara."
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setTicketModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-[#34D399]" />
                Cetak Thermal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
