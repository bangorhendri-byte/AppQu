/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileText, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  CreditCard,
  Building,
  UserCheck
} from 'lucide-react';
import { 
  KlinikPasien, 
  PiutangAsuransiPasien, 
  TipePenjamin 
} from '../KlinikTypes';

interface PasienViewProps {
  pasienList: KlinikPasien[];
  piutangList: PiutangAsuransiPasien[];
  onAddNewPasien: (pasien: KlinikPasien) => void;
  onUpdatePiutangStatus: (id: string, status: PiutangAsuransiPasien['status']) => void;
}

export const PasienView: React.FC<PasienViewProps> = ({
  pasienList,
  piutangList,
  onAddNewPasien,
  onUpdatePiutangStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'master' | 'piutang'>('master');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Tambah Pasien Baru
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newTglLahir, setNewTglLahir] = useState('1990-05-20');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newGolDarah, setNewGolDarah] = useState<'A' | 'B' | 'AB' | 'O' | '-'>('O');
  const [newHp, setNewHp] = useState('');
  const [newAlamat, setNewAlamat] = useState('');
  const [newPekerjaan, setNewPekerjaan] = useState('Karyawan Swasta');
  const [newPenjamin, setNewPenjamin] = useState<TipePenjamin>('Umum');
  const [newNoKartu, setNewNoKartu] = useState('');
  const [newAlergi, setNewAlergi] = useState('Tidak ada riwayat alergi');

  const handleSavePasien = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newNik) return;

    const newRM = `RM-2026-${String(pasienList.length + 1).padStart(4, '0')}`;
    const newPas: KlinikPasien = {
      id: `pas-${Date.now()}`,
      noRM: newRM,
      nik: newNik,
      nama: newNama,
      tglLahir: newTglLahir,
      gender: newGender,
      golDarah: newGolDarah,
      noHp: newHp || '0812-0000-0000',
      alamat: newAlamat || 'Kota Bandung',
      pekerjaan: newPekerjaan,
      penjaminUtama: newPenjamin,
      noKartuPenjamin: newNoKartu,
      riwayatAlergi: newAlergi,
      tglRegistrasi: '14 Okt 2026',
      totalKunjungan: 1,
      totalPiutang: 0
    };

    onAddNewPasien(newPas);
    setIsAddModalOpen(false);
    setNewNama('');
    setNewNik('');
    alert(`✅ Pasien ${newPas.nama} berhasil didaftarkan dengan No. Rekam Medis: ${newPas.noRM}`);
  };

  const totalPiutangNominal = piutangList
    .filter(p => p.status !== 'Lunas')
    .reduce((sum, curr) => sum + curr.sisaPiutang, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0F4C5C]" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Master Data Pasien & Piutang Asuransi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Database rekam medis pasien terpusat, identitas kependudukan & klaim asuransi pihak ketiga
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveSubTab('master')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'master'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#34D399]" />
            Master Pasien ({pasienList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('piutang')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'piutang'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#34D399]" />
            Piutang & Klaim Asuransi ({piutangList.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MASTER DATA PASIEN */}
      {activeSubTab === 'master' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari No. RM, NIK KTP, Nama Pasien, No HP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#34D399]" />
              + Pasien Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pasienList
              .filter(p => 
                p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.noRM.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.nik.includes(searchQuery) ||
                p.noHp.includes(searchQuery)
              )
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0F4C5C] bg-teal-50 px-2 py-0.5 rounded">
                        {p.noRM}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-base mt-1.5">
                        {p.nama}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">NIK: {p.nik}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.penjaminUtama === 'BPJS Kesehatan' ? 'bg-emerald-100 text-emerald-800' :
                      p.penjaminUtama === 'Asuransi Swasta' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {p.penjaminUtama}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gender & Gol. Darah</span>
                      <span className="font-bold text-slate-700">{p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} (Gol: {p.golDarah})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tgl Lahir</span>
                      <span>{p.tglLahir}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">No. WhatsApp</span>
                      <span className="font-medium text-slate-800">{p.noHp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Alamat</span>
                      <span className="text-slate-700 truncate max-w-[150px]">{p.alamat}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1 text-[11px] text-amber-800">
                      <strong>Alergi:</strong> {p.riwayatAlergi || 'Tidak ada riwayat alergi'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Total {p.totalKunjungan}x Kunjungan Medis</span>
                    <span className="text-teal-700 font-semibold cursor-pointer hover:underline">
                      Lihat RME →
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PIUTANG & KLAIM ASURANSI */}
      {activeSubTab === 'piutang' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Sisa Piutang Klaim Asuransi
              </span>
              <div className="text-2xl font-black text-amber-600 tracking-tight mt-0.5">
                Rp {totalPiutangNominal.toLocaleString('id-ID')}
              </div>
            </div>
            <span className="text-xs text-slate-500 max-w-xs">
              Klaim tertunda dari asuransi rekanan & BPJS Kesehatan menunggu pencairan verifikasi
            </span>
          </div>

          <div className="space-y-3">
            {piutangList.map((piutang) => (
              <div
                key={piutang.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F4C5C] bg-teal-50 px-2 py-0.5 rounded">
                      {piutang.noInvoice}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {piutang.penjamin} ({piutang.namaAsuransi})
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base mt-1.5">
                    {piutang.namaPasien}
                  </h4>
                  <p className="text-xs text-slate-500">
                    No. RM: {piutang.noRM} • No. Berkas Klaim: <span className="font-mono">{piutang.nomorBerkasKlaim}</span> • Jatuh Tempo: {piutang.jatuhTempo}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Sisa Piutang</div>
                    <div className="text-base sm:text-lg font-black text-amber-600">
                      Rp {piutang.sisaPiutang.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {piutang.status}
                    </span>
                  </div>

                  {piutang.status !== 'Lunas' ? (
                    <button
                      onClick={() => {
                        onUpdatePiutangStatus(piutang.id, 'Lunas');
                        alert(`✅ Klaim asuransi ${piutang.namaAsuransi} sebesar Rp ${piutang.sisaPiutang.toLocaleString('id-ID')} telah berhasil dilunasi & diverifikasi.`);
                      }}
                      className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      Tandai Klaim Cair
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Lunas Cair
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PASIEN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0F4C5C]" />
              Formulir Pendaftaran Master Pasien Baru
            </h3>

            <form onSubmit={handleSavePasien} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pasien *</label>
                  <input
                    type="text"
                    required
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="Contoh: Ny. Ratna Sari"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIK (KTP) Pasien *</label>
                  <input
                    type="text"
                    required
                    value={newNik}
                    onChange={(e) => setNewNik(e.target.value)}
                    placeholder="16 digit NIK"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tgl Lahir</label>
                  <input
                    type="date"
                    value={newTglLahir}
                    onChange={(e) => setNewTglLahir(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gol. Darah</label>
                  <select
                    value={newGolDarah}
                    onChange={(e) => setNewGolDarah(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="O">O</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="-">-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / No HP</label>
                  <input
                    type="text"
                    value={newHp}
                    onChange={(e) => setNewHp(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={newPekerjaan}
                    onChange={(e) => setNewPekerjaan(e.target.value)}
                    placeholder="PNS / Swasta / Pelajar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penjamin Utama</label>
                  <select
                    value={newPenjamin}
                    onChange={(e) => setNewPenjamin(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Umum">Umum</option>
                    <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                    <option value="Asuransi Swasta">Asuransi Swasta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Kartu BPJS/Asuransi</label>
                  <input
                    type="text"
                    value={newNoKartu}
                    onChange={(e) => setNewNoKartu(e.target.value)}
                    placeholder="Nomor kartu (opsional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={newAlamat}
                  onChange={(e) => setNewAlamat(e.target.value)}
                  placeholder="Jl. / RT-RW / Kelurahan / Kota"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-700 mb-1">Catatan Alergi Obat</label>
                <input
                  type="text"
                  value={newAlergi}
                  onChange={(e) => setNewAlergi(e.target.value)}
                  placeholder="Misal: Alergi Penisilin, Amoxicillin"
                  className="w-full px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0F4C5C] text-white text-xs font-bold"
                >
                  Daftarkan Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
