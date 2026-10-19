/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Package, 
  Layers, 
  Tag, 
  Filter, 
  Check, 
  Sparkles,
  Printer,
  Calendar,
  AlertCircle,
  Globe
} from 'lucide-react';
import { 
  KlinikObat, 
  ResepApotek 
} from '../KlinikTypes';
import { ImageUploadWithCompression } from '../../common/ImageUploadWithCompression';
import { OnlineStoreToggle } from '../../common/OnlineStoreToggle';

interface ApotekViewProps {
  obatList: KlinikObat[];
  resepList: ResepApotek[];
  onUpdateStokObat: (id: string, newStok: number) => void;
  onAddNewObat: (obat: KlinikObat) => void;
  onUpdateStatusResep: (id: string, newStatus: ResepApotek['statusPenyiapan']) => void;
}

export const ApotekView: React.FC<ApotekViewProps> = ({
  obatList,
  resepList,
  onUpdateStokObat,
  onAddNewObat,
  onUpdateStatusResep
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'resep' | 'stok' | 'expired'>('resep');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');

  // Form Tambah Obat Baru Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newKategori, setNewKategori] = useState<KlinikObat['kategori']>('Analgesik & Antipiretik');
  const [newBentuk, setNewBentuk] = useState<KlinikObat['bentukSediaan']>('Tablet');
  const [newStok, setNewStok] = useState<number>(50);
  const [newMinStok, setNewMinStok] = useState<number>(20);
  const [newSatuan, setNewSatuan] = useState('Strip (10 Tablet)');
  const [newHargaBeli, setNewHargaBeli] = useState<number>(5000);
  const [newHargaJual, setNewHargaJual] = useState<number>(9000);
  const [newTglExpired, setNewTglExpired] = useState('2028-06-30');
  const [newBatch, setNewBatch] = useState('BTC-2026-01');
  const [newPabrik, setNewPabrik] = useState('Kimia Farma');
  const [newDosis, setNewDosis] = useState('3 x sehari 1 tablet sesudah makan');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newShowOnline, setNewShowOnline] = useState(true);

  // Etiket Modal State
  const [etiketModalResep, setEtiketModalResep] = useState<ResepApotek | null>(null);

  // Expiry analysis: current simulated date is October 2026
  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const expDate = new Date(expiryDateStr);
    const currentDate = new Date('2026-10-14');
    const diffTime = expDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expiredWarningDrugs = obatList.filter(o => {
    const days = getDaysUntilExpiry(o.tglKedaluwarsa);
    return days <= 90; // under 3 months
  });

  const lowStockDrugs = obatList.filter(o => o.stok <= o.minStok);

  const handleSelesaikanResep = (resep: ResepApotek) => {
    // Kurangi stok obat di master
    resep.daftarObat.forEach(item => {
      const match = obatList.find(o => o.id === item.obatId);
      if (match) {
        onUpdateStokObat(match.id, Math.max(0, match.stok - item.jumlah));
      }
    });

    onUpdateStatusResep(resep.id, 'Diserahkan');
    alert(`✅ Obat untuk pasien ${resep.namaPasien} telah selesai diracik & diserahkan! Stok obat di gudang farmasi telah terpotong otomatis.`);
  };

  const handleSaveNewObat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama) return;

    const newObat: KlinikObat = {
      id: `med-${Date.now()}`,
      kodeObat: newKode || `OBT-${String(obatList.length + 1).padStart(3, '0')}`,
      namaObat: newNama,
      kategori: newKategori,
      bentukSediaan: newBentuk,
      stok: Number(newStok),
      minStok: Number(newMinStok),
      satuan: newSatuan,
      hargaBeli: Number(newHargaBeli),
      hargaJual: Number(newHargaJual),
      tglKedaluwarsa: newTglExpired,
      noBatch: newBatch,
      pabrik: newPabrik,
      dosisStandar: newDosis,
      aturanStandar: 'Sesudah makan',
      photoUrl: newPhotoUrl || undefined,
      showInOnlineStore: newShowOnline
    };

    onAddNewObat(newObat);
    setIsAddModalOpen(false);
    // Reset
    setNewNama('');
    setNewPhotoUrl('');
    setNewShowOnline(true);
    alert(`✅ Obat ${newNama} berhasil ditambahkan ke Master Apotek!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#0F4C5C]" />
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Instalasi Farmasi & Apotek Klinik
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Penyiapan resep obat dokter, master katalog sediaan farmasi & monitoring kadaluwarsa (FEFO)
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveSubTab('resep')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'resep'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#34D399]" />
            Resep Masuk ({resepList.filter(r => r.statusPenyiapan !== 'Diserahkan').length})
          </button>
          <button
            onClick={() => setActiveSubTab('stok')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'stok'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#34D399]" />
            Master Stok Obat ({obatList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('expired')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeSubTab === 'expired'
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Warning Expired ({expiredWarningDrugs.length})
            {expiredWarningDrugs.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: RESEP MASUK (PENYIAPAN OBAT) */}
      {activeSubTab === 'resep' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resepList.map((rsp) => {
              const isDone = rsp.statusPenyiapan === 'Diserahkan';

              return (
                <div
                  key={rsp.id}
                  className={`bg-white rounded-3xl p-5 border transition-all space-y-4 ${
                    isDone 
                      ? 'border-slate-200 bg-slate-50/50 opacity-85' 
                      : 'border-teal-200 shadow-sm ring-1 ring-teal-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0F4C5C] bg-teal-50 px-2 py-0.5 rounded">
                          {rsp.noResep}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rsp.statusPenyiapan}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-800 text-base mt-1.5">
                        {rsp.namaPasien}
                      </h4>
                      <p className="text-xs text-slate-500">
                        RM: <span className="font-mono font-bold text-slate-700">{rsp.noRM}</span> • Usia: {rsp.usia} thn • Dokter: {rsp.dokterNama}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-mono">{rsp.tglResep} {rsp.jamResep}</span>
                    </div>
                  </div>

                  {/* Warning Alergi */}
                  {rsp.catatanAlergi && rsp.catatanAlergi !== 'Tidak ada riwayat alergi obat' && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>Perhatian Alergi Pasien:</strong> {rsp.catatanAlergi}</span>
                    </div>
                  )}

                  {/* Daftar Obat Racikan / Sediaan */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Daftar Obat Yang Diresepkan
                    </span>
                    <div className="space-y-2">
                      {rsp.daftarObat.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{item.namaObat}</div>
                            <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                              {item.aturanPakai} • {item.dosis}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              x {item.jumlah} {item.satuan}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Rp {item.subtotal.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Etiket & Serahkan */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEtiketModalResep(rsp)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0F4C5C]" />
                      Cetak Etiket Obat
                    </button>

                    {!isDone ? (
                      <button
                        type="button"
                        onClick={() => handleSelesaikanResep(rsp)}
                        className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        Selesai Racik & Serahkan Obat
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Telah Diserahkan Pasien
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MASTER STOK OBAT */}
      {activeSubTab === 'stok' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama obat, kode, pabrik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Antibiotik">Antibiotik</option>
                <option value="Analgesik & Antipiretik">Analgesik & Antipiretik</option>
                <option value="Antihipertensi">Antihipertensi</option>
                <option value="Vitamin & Suplemen">Vitamin</option>
                <option value="Alat Kesehatan & Spuit">Alkes</option>
              </select>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#34D399]" />
                + Tambah Obat Baru
              </button>
            </div>
          </div>

          {/* Table Master Obat */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Kode & Nama Obat</th>
                    <th className="p-4">Kategori / Bentuk</th>
                    <th className="p-4">Stok Saat Ini</th>
                    <th className="p-4">Harga Beli / Jual</th>
                    <th className="p-4">Batch & Expired</th>
                    <th className="p-4 text-center">Kelola Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {obatList
                    .filter(o => {
                      const matchQ = o.namaObat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     o.kodeObat.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchK = filterKategori === 'Semua' || o.kategori === filterKategori;
                      return matchQ && matchK;
                    })
                    .map((item) => {
                      const isLow = item.stok <= item.minStok;
                      const daysLeft = getDaysUntilExpiry(item.tglKedaluwarsa);
                      const isNearExp = daysLeft <= 90;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <div className="font-extrabold text-slate-900 text-sm">{item.namaObat}</div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                              {item.kodeObat} • Pabrik: {item.pabrik}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-700">{item.kategori}</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.bentukSediaan}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono font-bold text-sm ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                                {item.stok}
                              </span>
                              <span className="text-slate-500">{item.satuan}</span>
                            </div>
                            {isLow && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Stok Menipis (Min: {item.minStok})
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-slate-500">Beli: Rp {item.hargaBeli.toLocaleString('id-ID')}</div>
                            <div className="font-bold text-[#0F4C5C]">Jual: Rp {item.hargaJual.toLocaleString('id-ID')}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-mono text-xs">{item.tglKedaluwarsa}</div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              daysLeft < 30 ? 'bg-red-100 text-red-800' :
                              daysLeft < 90 ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {daysLeft < 0 ? 'Expired' : `${daysLeft} hari lagi`}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onUpdateStokObat(item.id, item.stok + 10)}
                                title="Tambah 10 stok"
                                className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-bold rounded cursor-pointer"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => onUpdateStokObat(item.id, Math.max(0, item.stok - 1))}
                                title="Kurangi 1 stok"
                                className="px-2 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold rounded cursor-pointer"
                              >
                                -1
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WARNING KEDALUWARSA (EXPIRED) */}
      {activeSubTab === 'expired' && (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-sm text-amber-900">
                Peringatan Dini Batas Kadaluwarsa Obat (FEFO - First Expired First Out)
              </h4>
              <p className="mt-1 text-amber-800">
                Berikut adalah daftar obat yang memiliki tanggal kadaluwarsa kurang dari 90 hari. Segera lakukan retur ke pihak distributor / pabrik farmasi rekanan atau prioritaskan pengeluaran obat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiredWarningDrugs.map((drug) => {
              const daysLeft = getDaysUntilExpiry(drug.tglKedaluwarsa);
              const isUrgent = daysLeft <= 30;

              return (
                <div
                  key={drug.id}
                  className={`bg-white rounded-2xl p-5 border shadow-2xs relative space-y-3 ${
                    isUrgent ? 'border-red-300 ring-2 ring-red-400/20' : 'border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400">{drug.kodeObat}</span>
                      <h4 className="font-extrabold text-slate-800 text-base">{drug.namaObat}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{drug.kategori} • {drug.bentukSediaan}</p>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-slate-900'
                    }`}>
                      {daysLeft < 0 ? 'EXPIRED' : `${daysLeft} HARI`}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sisa Stok Gudang</span>
                      <span className="font-bold text-slate-800">{drug.stok} {drug.satuan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal Expired</span>
                      <span className="font-bold text-red-600 font-mono">{drug.tglKedaluwarsa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nomor Batch</span>
                      <span className="font-mono">{drug.noBatch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pabrik Rekanan</span>
                      <span>{drug.pabrik}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert(`📦 Berkas Pengajuan Retur untuk ${drug.namaObat} (Batch: ${drug.noBatch}) ke ${drug.pabrik} berhasil dibuat.`);
                    }}
                    className="w-full py-2 bg-[#0F4C5C] hover:bg-[#0a3844] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Ajukan Retur Distributor
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH OBAT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#0F4C5C]" />
              Tambah Master Obat Baru
            </h3>

            <form onSubmit={handleSaveNewObat} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Obat</label>
                  <input
                    type="text"
                    value={newKode}
                    onChange={(e) => setNewKode(e.target.value)}
                    placeholder="OBT-009"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sediaan Obat *</label>
                  <input
                    type="text"
                    required
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="Contoh: Ibuprofen 400 mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newKategori}
                    onChange={(e) => setNewKategori(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Antibiotik">Antibiotik</option>
                    <option value="Analgesik & Antipiretik">Analgesik & Antipiretik</option>
                    <option value="Antiinflamasi">Antiinflamasi</option>
                    <option value="Vitamin & Suplemen">Vitamin & Suplemen</option>
                    <option value="Antihipertensi">Antihipertensi</option>
                    <option value="Antidiabetes">Antidiabetes</option>
                    <option value="Alat Kesehatan & Spuit">Alat Kesehatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bentuk Sediaan</label>
                  <select
                    value={newBentuk}
                    onChange={(e) => setNewBentuk(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Kapsul">Kapsul</option>
                    <option value="Sirup Botol">Sirup Botol</option>
                    <option value="Salep Tube">Salep Tube</option>
                    <option value="Injeksi Ampul">Injeksi Ampul</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={newStok}
                    onChange={(e) => setNewStok(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min. Stok</label>
                  <input
                    type="number"
                    value={newMinStok}
                    onChange={(e) => setNewMinStok(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={newSatuan}
                    onChange={(e) => setNewSatuan(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={newHargaBeli}
                    onChange={(e) => setNewHargaBeli(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={newHargaJual}
                    onChange={(e) => setNewHargaJual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0F4C5C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tgl Kadaluwarsa</label>
                  <input
                    type="date"
                    value={newTglExpired}
                    onChange={(e) => setNewTglExpired(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Batch</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Foto Obat (Auto-WebP Compression) */}
              <div className="pt-2">
                <ImageUploadWithCompression
                  value={newPhotoUrl}
                  onChange={setNewPhotoUrl}
                  onClear={() => setNewPhotoUrl('')}
                  label="Foto Obat / Alkes (Auto-WebP ~30-50KB)"
                />
              </div>

              {/* Sakelar Tampilkan di Toko Online */}
              <div className="pt-1">
                <OnlineStoreToggle
                  checked={newShowOnline}
                  onChange={setNewShowOnline}
                  label="Tampilkan di Toko Online Apotek"
                  description="Obat/vitamin ini akan muncul di katalog digital publik dan dapat dipesan pelanggan via WA."
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
                  Simpan Obat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ETIKET OBAT */}
      {etiketModalResep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Etiket Farmasi Resmi
            </span>
            <h3 className="text-sm font-extrabold text-[#0F4C5C] mt-0.5">
              INSTALASI FARMASI KLINIKQU
            </h3>

            <div className="my-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pasien</span>
                <span className="font-bold text-slate-900">{etiketModalResep.namaPasien}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. RM</span>
                <span className="font-mono font-bold text-[#0F4C5C]">{etiketModalResep.noRM}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal</span>
                <span>{etiketModalResep.tglResep}</span>
              </div>
              <div className="border-t border-teal-200 pt-2 space-y-1">
                {etiketModalResep.daftarObat.map((d, i) => (
                  <div key={i} className="text-[11px]">
                    <span className="font-bold text-slate-800">{d.namaObat} ({d.jumlah} {d.satuan})</span>
                    <div className="text-emerald-800 font-semibold italic">➔ {d.aturanPakai}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mb-4">
              "Semoga lekas sembuh. Simpan obat di tempat sejuk & jauhkan dari anak."
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setEtiketModalResep(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-[#0F4C5C] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#34D399]" />
                Cetak Etiket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
