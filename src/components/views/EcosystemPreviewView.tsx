import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Search, 
  Stethoscope, 
  ShoppingCart, 
  Package, 
  Clock, 
  UserCheck, 
  FileText, 
  Printer, 
  Truck, 
  Barcode, 
  Sparkles 
} from 'lucide-react';
import { EcosystemId, ECOSYSTEM_MODULES } from '../common/MasterSwitcherModal';

interface EcosystemPreviewViewProps {
  ecosystemId: EcosystemId;
  onBackToBengkel: () => void;
  onOpenMasterSwitcher: () => void;
}

export const EcosystemPreviewView: React.FC<EcosystemPreviewViewProps> = ({
  ecosystemId,
  onBackToBengkel,
  onOpenMasterSwitcher
}) => {
  const currentMod = ECOSYSTEM_MODULES.find((m) => m.id === ecosystemId) || ECOSYSTEM_MODULES[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Ecosystem Header */}
      <div 
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
        className={`px-4 pb-3 text-white flex items-center justify-between shadow-md shrink-0 ${
          ecosystemId === 'klinik' ? 'bg-teal-800' :
          ecosystemId === 'ritel' ? 'bg-indigo-800' : 'bg-cyan-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToBengkel}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Kembali ke BengkelQu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm">{currentMod.name}</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono uppercase">
                {currentMod.layoutType}
              </span>
            </div>
            <p className="text-[10px] text-white/80">{currentMod.tagline}</p>
          </div>
        </div>

        <button
          onClick={onOpenMasterSwitcher}
          className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ganti Modul</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              UsahaQu v1.80 Master Ecosystem
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Modul {currentMod.name} Aktif
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              {currentMod.description}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
            {ecosystemId === 'klinik' ? '🩺' : ecosystemId === 'ritel' ? '🛒' : '📦'}
          </div>
        </div>

        {/* Dynamic mockup content based on selected ecosystem */}
        {ecosystemId === 'klinik' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Antrian Pasien</span>
                <div className="text-base font-black text-teal-800">14 Orang</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Poli Aktif</span>
                <div className="text-base font-black text-teal-800">Umum & Gigi</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Resep Obat</span>
                <div className="text-base font-black text-teal-800">8 Diproses</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-teal-50/50 border-b border-slate-100 font-bold text-xs text-teal-900 flex justify-between items-center">
                <span>Daftar Antrian Pasien Poli Umum</span>
                <span className="text-[10px] bg-teal-200/70 text-teal-800 px-2 py-0.5 rounded-full font-bold">Dokter Jaga: dr. Ratna Sp.A</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { no: 'A-01', name: 'Ny. Fatimah (34 thn)', keluhan: 'Demam & Pusing 3 hari', status: 'Diperiksa' },
                  { no: 'A-02', name: 'An. Kevin (7 thn)', keluhan: 'Batuk & Flu', status: 'Menunggu' },
                  { no: 'A-03', name: 'Tn. Hendrawan (45 thn)', keluhan: 'Kontrol Tensi & Gula Darah', status: 'Menunggu' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {item.no}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.keluhan}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Diperiksa' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {ecosystemId === 'ritel' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Transaksi Hari Ini</span>
                <div className="text-base font-black text-indigo-800">76 Struk</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Omset Ritel</span>
                <div className="text-base font-black text-indigo-800">Rp 3.820.000</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">SKU Produk</span>
                <div className="text-base font-black text-indigo-800">412 Item</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-indigo-50/50 border-b border-slate-100 font-bold text-xs text-indigo-900 flex justify-between items-center">
                <span>Scan Barcode Cepat (Kasir POS Ritel)</span>
                <Barcode className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Scan Barcode / Cari Nama Barang..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button className="bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs">
                    + Input
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs pt-2">
                  {[
                    { barcode: '899275321012', name: 'Minyak Goreng Sania 2L', price: 34500, stock: 48 },
                    { barcode: '899317553818', name: 'Beras Ramos Maknyuss 5kg', price: 72000, stock: 25 },
                    { barcode: '899886620023', name: 'Gula Pasir Gulaku 1kg', price: 17500, stock: 60 }
                  ].map((p, i) => (
                    <div key={i} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.barcode} • Stok: {p.stock} pcs</p>
                      </div>
                      <span className="font-bold text-indigo-800">Rp {p.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {ecosystemId === 'titip' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Paket Masuk</span>
                <div className="text-base font-black text-cyan-800">28 Koli</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Siap Kirim</span>
                <div className="text-base font-black text-cyan-800">19 Resi</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-semibold">Terkirim</span>
                <div className="text-base font-black text-cyan-800">54 Paket</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-cyan-50/50 border-b border-slate-100 font-bold text-xs text-cyan-900 flex justify-between items-center">
                <span>Manifest Pengiriman & Pelacakan Resi</span>
                <Truck className="w-4 h-4 text-cyan-700" />
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { resi: 'TT-JKT-8821', pengirim: 'Toko Al-Barokah', penerima: 'Ibu Ratna (Surabaya)', berat: '2.4 kg', status: 'Dalam Perjalanan' },
                  { resi: 'TT-BDG-9014', pengirim: 'Distro Corner', penerima: 'Bpk. Yudi (Semarang)', berat: '1.1 kg', status: 'Siap Pickup Kurir' },
                  { resi: 'TT-SBY-7729', pengirim: 'Herbal Nusantara', penerima: 'Sdr. Dimas (Denpasar)', berat: '0.8 kg', status: 'Telah Diterima' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-900">{item.resi}</span>
                        <span className="text-[10px] text-slate-400">({item.berat})</span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-0.5">{item.penerima}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Telah Diterima' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'Siap Pickup Kurir' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onBackToBengkel}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer text-center"
          >
            Kembali ke BengkelQu
          </button>
          <button
            onClick={onOpenMasterSwitcher}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer text-center"
          >
            Buka KedaiQu / Modul Lain
          </button>
        </div>
      </div>
    </div>
  );
};
