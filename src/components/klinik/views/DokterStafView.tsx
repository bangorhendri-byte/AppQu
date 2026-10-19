/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Crown, 
  Plus, 
  Search, 
  Stethoscope, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Printer, 
  DollarSign, 
  Sparkles,
  Award
} from 'lucide-react';
import { 
  KlinikDokter, 
  JadwalPraktikDokter, 
  RekapJasaMedisDokter,
  PoliKlinik 
} from '../KlinikTypes';

interface DokterStafViewProps {
  dokterList: KlinikDokter[];
  jadwalList: JadwalPraktikDokter[];
  jasaMedisList: RekapJasaMedisDokter[];
  onAddNewDokter: (dokter: KlinikDokter) => void;
  onAddNewJadwal: (jadwal: JadwalPraktikDokter) => void;
  onPayJasaMedis: (id: string) => void;
}

export const DokterStafView: React.FC<DokterStafViewProps> = ({
  dokterList,
  jadwalList,
  jasaMedisList,
  onAddNewDokter,
  onAddNewJadwal,
  onPayJasaMedis
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dokter' | 'jadwal' | 'jasa'>('dokter');

  // Modal Tambah Dokter
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [namaDokterInput, setNamaDokterInput] = useState('');
  const [gelarInput, setGelarInput] = useState('Spesialis');
  const [spesialisasiInput, setSpesialisasiInput] = useState('Penyakit Dalam');
  const [noSIPInput, setNoSIPInput] = useState('SIP.503/442.1/2026/IDI-BDG');
  const [noSTRInput, setNoSTRInput] = useState('32.1.1.100.2.26.091122');
  const [poliInput, setPoliInput] = useState<PoliKlinik>('Poli Penyakit Dalam');
  const [hpInput, setHpInput] = useState('0812-3333-7777');
  const [tarifInput, setTarifInput] = useState<number>(65000);
  const [bagiHasilInput, setBagiHasilInput] = useState<number>(70);

  // Modal Tambah Jadwal
  const [isAddJadwalOpen, setIsAddJadwalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>(dokterList[0]?.id || '');
  const [hariInput, setHariInput] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'>('Senin');
  const [jamMulaiInput, setJamMulaiInput] = useState('08:00');
  const [jamSelesaiInput, setJamSelesaiInput] = useState('14:00');
  const [kuotaInput, setKuotaInput] = useState<number>(25);
  const [ruangInput, setRuangInput] = useState('Poli 01');

  // Slip Jasa Medis Modal
  const [selectedSlip, setSelectedSlip] = useState<RekapJasaMedisDokter | null>(null);

  const handleSaveDokter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaDokterInput) return;

    const newDoc: KlinikDokter = {
      id: `doc-${Date.now()}`,
      nama: namaDokterInput,
      gelar: gelarInput,
      spesialisasi: spesialisasiInput,
      noSIP: noSIPInput,
      noSTR: noSTRInput,
      poli: poliInput,
      noHp: hpInput,
      email: `${namaDokterInput.toLowerCase().replace(/[^a-z]/g, '')}@klinikqu.id`,
      tarifKonsultasi: Number(tarifInput),
      bagiHasilDokterPersen: Number(bagiHasilInput),
      statusAktif: true,
      avatarColor: 'bg-teal-700'
    };

    onAddNewDokter(newDoc);
    setIsAddDoctorOpen(false);
    setNamaDokterInput('');
    alert(`✅ Dokter ${newDoc.nama} berhasil didaftarkan!`);
  };

  const handleSaveJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = dokterList.find(d => d.id === selectedDocId);
    if (!doc) return;

    const newJdw: JadwalPraktikDokter = {
      id: `jdw-${Date.now()}`,
      dokterId: doc.id,
      dokterNama: doc.nama,
      poli: doc.poli,
      hari: hariInput,
      jamMulai: jamMulaiInput,
      jamSelesai: jamSelesaiInput,
      kuotaPasien: Number(kuotaInput),
      ruangPoli: ruangInput
    };

    onAddNewJadwal(newJdw);
    setIsAddJadwalOpen(false);
    alert(`✅ Jadwal praktik untuk ${doc.nama} berhasil ditambahkan!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#0F4C5C]" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Tenaga Medis, Dokter & Staf
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data spesialisasi, SIP resmi, jadwal pelayanan klinik & pembagian jasa medis terintegrasi
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveSubTab('dokter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'dokter'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#34D399]" />
            Daftar Dokter ({dokterList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('jadwal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'jadwal'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#34D399]" />
            Jadwal Praktik ({jadwalList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('jasa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'jasa'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Rekap Jasa Medis
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-900">PRO</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DAFTAR DOKTER */}
      {activeSubTab === 'dokter' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddDoctorOpen(true)}
              className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#34D399]" />
              + Registrasi Dokter Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dokterList.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-slate-300 shadow-2xs space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl ${doc.avatarColor} text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0`}>
                    {doc.nama.slice(3, 5).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-extrabold text-slate-900 text-base truncate">
                        {doc.nama}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {doc.statusAktif ? 'Praktik Aktif' : 'Cuti'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#0F4C5C]">{doc.spesialisasi}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">SIP: {doc.noSIP}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Poli Penugasan</span>
                    <span className="font-bold text-slate-800">{doc.poli}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tarif Konsultasi Pasien</span>
                    <span className="font-bold text-[#0F4C5C]">Rp {doc.tarifKonsultasi.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bagi Hasil Jasa Medis</span>
                    <span className="font-bold text-slate-800">{doc.bagiHasilDokterPersen}% Dokter / {100 - doc.bagiHasilDokterPersen}% Klinik</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kontak WhatsApp</span>
                    <span className="text-slate-700">{doc.noHp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: JADWAL PRAKTIK */}
      {activeSubTab === 'jadwal' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddJadwalOpen(true)}
              className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#34D399]" />
              + Buat Jadwal Praktik
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const).map((day) => {
              const schedulesForDay = jadwalList.filter(j => j.hari === day);

              return (
                <div key={day} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-black text-sm text-[#0F4C5C]">{day}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {schedulesForDay.length} Sesi
                    </span>
                  </div>

                  {schedulesForDay.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs italic">
                      Tidak ada jadwal
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {schedulesForDay.map(j => (
                        <div key={j.id} className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs space-y-1">
                          <div className="font-extrabold text-slate-800">{j.dokterNama}</div>
                          <div className="text-[11px] text-teal-800 font-semibold">{j.poli} • {j.ruangPoli}</div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span className="font-mono font-bold text-slate-700">{j.jamMulai} - {j.jamSelesai}</span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-teal-200">
                              Maks. {j.kuotaPasien} pasien
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REKAP JASA MEDIS (BADGE PRO 👑) */}
      {activeSubTab === 'jasa' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent p-4 sm:p-5 rounded-2xl border border-amber-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    Sistem Perhitungan Remunerasi & Jasa Medis Dokter
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                    FITUR PRO 👑
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Bagi hasil transparan: Konsultasi Poli + Tindakan Medis otomatis dikalkulasi per periode
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jasaMedisList.map((jm) => {
              const isPaid = jm.statusPembayaran === 'Telah Ditransfer';

              return (
                <div
                  key={jm.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Periode {jm.periode}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                          {jm.dokterNama}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {jm.statusPembayaran}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pasien Ditangani</span>
                        <span className="font-bold text-slate-800">{jm.totalPasienDitangani} Pasien</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Tarif Konsultasi</span>
                        <span>Rp {jm.totalBiayaKonsultasi.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Tindakan Medis</span>
                        <span>Rp {jm.totalBiayaTindakan.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-800">
                        <span>Total Bruto</span>
                        <span>Rp {jm.totalBruto.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-extrabold text-sm pt-1">
                        <span>Hak Jasa Dokter ({jm.persentaseBagiHasil}%)</span>
                        <span>Rp {jm.hakJasaMedisDokter.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>Porsi Operasional Klinik</span>
                        <span>Rp {jm.porsiKlinik.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedSlip(jm)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0F4C5C]" />
                      Slip Fee
                    </button>

                    {!isPaid ? (
                      <button
                        onClick={() => {
                          onPayJasaMedis(jm.id);
                          alert(`✅ Jasa medis untuk ${jm.dokterNama} sebesar Rp ${jm.hakJasaMedisDokter.toLocaleString('id-ID')} berhasil dicatat sebagai telah ditransfer.`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Tandai Ditransfer
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Tercairkan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL CETAK SLIP JASA MEDIS */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Slip Remunerasi Jasa Medis
            </span>
            <h3 className="text-base font-extrabold text-slate-800 mt-1">
              {selectedSlip.dokterNama}
            </h3>
            <p className="text-xs text-slate-500">Periode: {selectedSlip.periode}</p>

            <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Pasien</span>
                <span className="font-bold">{selectedSlip.totalPasienDitangani} Orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Konsultasi</span>
                <span>Rp {selectedSlip.totalBiayaKonsultasi.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Tindakan Medis</span>
                <span>Rp {selectedSlip.totalBiayaTindakan.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-[#0F4C5C]">
                <span>TOTAL DITERIMA (TAKE HOME)</span>
                <span>Rp {selectedSlip.hakJasaMedisDokter.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSlip(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-[#0F4C5C] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#34D399]" />
                Cetak Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
