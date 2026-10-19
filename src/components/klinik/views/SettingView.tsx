/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Database, 
  Crown, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  UserCheck, 
  Key, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { 
  KlinikProfil, 
  StafHakAkses 
} from '../KlinikTypes';

interface SettingViewProps {
  profil: KlinikProfil;
  stafList: StafHakAkses[];
  onSaveProfil: (profil: KlinikProfil) => void;
  onUpdateStafList: (staf: StafHakAkses[]) => void;
  onRestoreBackup: (data: any) => void;
  onResetKlinikData: () => void;
}

export const SettingView: React.FC<SettingViewProps> = ({
  profil,
  stafList,
  onSaveProfil,
  onUpdateStafList,
  onRestoreBackup,
  onResetKlinikData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'akses' | 'backup'>('profil');

  // Profil Form State
  const [namaKlinik, setNamaKlinik] = useState(profil.namaKlinik);
  const [kodeKlinik, setKodeKlinik] = useState(profil.kodeKlinik);
  const [tipeKlinik, setTipeKlinik] = useState(profil.tipeKlinik);
  const [noIzin, setNoIzin] = useState(profil.noIzinOperasional);
  const [alamat, setAlamat] = useState(profil.alamat);
  const [kota, setKota] = useState(profil.kota);
  const [telepon, setTelepon] = useState(profil.telepon);
  const [whatsapp, setWhatsapp] = useState(profil.whatsapp);
  const [email, setEmail] = useState(profil.email);
  const [namaPJ, setNamaPJ] = useState(profil.namaDokterPenanggungJawab);
  const [sipPJ, setSipPJ] = useState(profil.sipDokterPenanggungJawab);
  const [catatanKop, setCatatanKop] = useState(profil.catatanKopSurat);
  const [tarifReg, setTarifReg] = useState(profil.tarifRegistrasiDefault);

  const handleSaveProfilForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: KlinikProfil = {
      namaKlinik,
      kodeKlinik,
      tipeKlinik,
      noIzinOperasional: noIzin,
      alamat,
      kota,
      provinsi: profil.provinsi,
      kodePos: profil.kodePos,
      telepon,
      whatsapp,
      email,
      namaDokterPenanggungJawab: namaPJ,
      sipDokterPenanggungJawab: sipPJ,
      catatanKopSurat: catatanKop,
      tarifRegistrasiDefault: Number(tarifReg)
    };
    onSaveProfil(updated);
    alert('✅ Profil Klinik & Kop Surat Medis berhasil diperbarui!');
  };

  const handleBackupDownload = () => {
    const keys = [
      'usahaku_data_klinik_antrean',
      'usahaku_data_klinik_rekam_medis',
      'usahaku_data_klinik_surat_medis',
      'usahaku_data_klinik_tagihan',
      'usahaku_data_klinik_obat',
      'usahaku_data_klinik_resep',
      'usahaku_data_klinik_dokter',
      'usahaku_data_klinik_jadwal',
      'usahaku_data_klinik_jasa_medis',
      'usahaku_data_klinik_pasien',
      'usahaku_data_klinik_piutang',
      'usahaku_data_klinik_pengeluaran',
      'usahaku_data_klinik_profil',
      'usahaku_data_klinik_staf'
    ];

    const backupObj: Record<string, any> = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) backupObj[k] = JSON.parse(val);
    });

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_KlinikQu_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onRestoreBackup(parsed);
        alert('✅ Database KlinikQu berhasil dipulihkan dari file backup!');
      } catch (err) {
        alert('❌ Gagal membaca file backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0F4C5C]" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Pengaturan Sistem KlinikQu
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi profil klinik, kop surat rekam medis, hak akses staf & manajemen cadangan data
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveSubTab('profil')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'profil'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#34D399]" />
            Profil & Kop Surat
          </button>
          <button
            onClick={() => setActiveSubTab('akses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'akses'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Hak Akses Staf
            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-900">PRO</span>
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'backup'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#34D399]" />
            Backup & Reset Data
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PROFIL KLINIK & KOP SURAT */}
      {activeSubTab === 'profil' && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleSaveProfilForm} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-800">
                Identitas Legalitas Faskes & Kop Dokumen
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data ini dicetak otomatis pada Karcis Antrean, Lembar Resep, Kwitansi Medis & Surat Keterangan Sakit
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Fasilitas Kesehatan / Klinik *</label>
                <input
                  type="text"
                  required
                  value={namaKlinik}
                  onChange={(e) => setNamaKlinik(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Klinik Resmi</label>
                <input
                  type="text"
                  value={kodeKlinik}
                  onChange={(e) => setKodeKlinik(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Klinik</label>
                <input
                  type="text"
                  value={tipeKlinik}
                  onChange={(e) => setTipeKlinik(e.target.value)}
                  placeholder="Klinik Pratama Rawat Jalan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Izin Operasional Klinik *</label>
                <input
                  type="text"
                  required
                  value={noIzin}
                  onChange={(e) => setNoIzin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon Klinik</label>
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Layanan Pasien</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Layanan</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Penanggung Jawab Klinis */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dokter Penanggung Jawab Klinis (PJ)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar PJ</label>
                  <input
                    type="text"
                    value={namaPJ}
                    onChange={(e) => setNamaPJ(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SIP Dokter Penanggung Jawab</label>
                  <input
                    type="text"
                    value={sipPJ}
                    onChange={(e) => setSipPJ(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan Kop Surat</label>
                <input
                  type="text"
                  value={catatanKop}
                  onChange={(e) => setCatatanKop(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0F4C5C]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-[#34D399]" />
                Simpan Profil Klinik
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: HAK AKSES STAF (BADGE PRO 👑) */}
      {activeSubTab === 'akses' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent p-4 sm:p-5 rounded-2xl border border-amber-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    Manajemen Peran & PIN Akses Tenaga Medis
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                    PRO 👑
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Proteksi otorisasi medis: Dokter, Perawat, Apoteker Farmasi, dan Kasir Pendaftaran
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stafList.map((staf) => (
              <div
                key={staf.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#0F4C5C]">
                      {staf.peran}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1.5">{staf.nama}</h4>
                    <p className="text-xs text-slate-500">{staf.email} • {staf.noHp}</p>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {staf.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      PIN Otorisasi Cepat
                    </span>
                    <span className="font-mono font-bold text-slate-800">•••• ({staf.pinAkses})</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Modul Diizinkan:</span>
                    <div className="flex flex-wrap gap-1">
                      {staf.modulBoleh.map((m, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BACKUP & RESET DATA */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Database */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0F4C5C] flex items-center justify-center font-bold">
              <Download className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Cadangkan Database Klinik (JSON)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Semua data antrean, rekam medis SOAP, katalog obat farmasi & tagihan kasir tersimpan dengan aman
              </p>
            </div>

            <button
              onClick={handleBackupDownload}
              className="w-full py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-[#34D399]" />
              Unduh File Backup Database
            </button>
          </div>

          {/* Restore Database */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0F4C5C] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Pulihkan Database (Restore)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unggah file JSON backup yang pernah Anda unduh sebelumnya untuk memulihkan seluruh data klinik
              </p>
            </div>

            <label className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-300">
              <Upload className="w-4 h-4 text-[#0F4C5C]" />
              Pilih File Backup JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          {/* Factory Reset */}
          <div className="md:col-span-2 bg-red-50/60 rounded-3xl p-6 border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4" />
              Reset Ulang Data Klinik (Data Demo Pabrik)
            </div>
            <p className="text-xs text-red-600 max-w-xl">
              Tindakan ini akan mengembalikan data sampel awal (seed dokter, obat, antrean, dan rekam medis demo). Pastikan Anda telah mengunduh backup jika diperlukan.
            </p>
            <button
              onClick={() => {
                const conf = window.confirm('Apakah Anda yakin ingin mereset seluruh data KlinikQu ke setelan awal demo?');
                if (conf) {
                  onResetKlinikData();
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ke Pengaturan Awal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
