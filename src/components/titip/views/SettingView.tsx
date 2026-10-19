/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Printer, 
  RotateCcw, 
  Check, 
  Save, 
  ShieldCheck, 
  FileText,
  Building2
} from 'lucide-react';
import { TitipStoreProfile } from '../TitipTypes';

interface SettingViewProps {
  profile: TitipStoreProfile;
  onSaveProfile: (profile: TitipStoreProfile) => void;
  onResetTitipData: () => void;
  onReloadDemoData: () => void;
}

export const SettingView: React.FC<SettingViewProps> = ({
  profile,
  onSaveProfile,
  onResetTitipData,
  onReloadDemoData
}) => {
  const [subTab, setSubTab] = useState<'profil' | 'printer' | 'data'>('profil');

  // Form State
  const [brandName, setBrandName] = useState(profile.brandName);
  const [tagline, setTagline] = useState(profile.tagline);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [legalNumber, setLegalNumber] = useState(profile.legalNumber || '');
  const [letterheadHeader, setLetterheadHeader] = useState(profile.letterheadHeader);
  const [letterheadFooter, setLetterheadFooter] = useState(profile.letterheadFooter);
  const [bankAccountInfo, setBankAccountInfo] = useState(profile.bankAccountInfo);
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm' | 'A4'>(profile.paperSize);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      brandName,
      tagline,
      ownerName,
      phone,
      address,
      legalNumber,
      letterheadHeader,
      letterheadFooter,
      bankAccountInfo,
      paperSize
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('profil')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'profil'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profil Brand & Kop Surat</span>
          </button>

          <button
            onClick={() => setSubTab('printer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'printer'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Printer & Label Cetak</span>
          </button>

          <button
            onClick={() => setSubTab('data')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'data'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pencadangan & Reset Data</span>
          </button>
        </div>

        {isSaved && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: Profil Brand & Kop Surat */}
      {subTab === 'profil' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs space-y-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-amber-100 pb-2">
                Informasi Produsen & Legalitas Usaha
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Brand / Dapur Produsen:</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Slogan / Tagline:</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Pemilik / Produsen:</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">No. WhatsApp / Telepon:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Rumah Produksi / Workshop:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nomor Legalitas (P-IRT / NIB / Halal):</label>
                  <input
                    type="text"
                    value={legalNumber}
                    onChange={(e) => setLegalNumber(e.target.value)}
                    placeholder="P-IRT No: 2063273010998"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Rekening Bank Resmi Penampung:</label>
                  <input
                    type="text"
                    value={bankAccountInfo}
                    onChange={(e) => setBankAccountInfo(e.target.value)}
                    placeholder="BCA 8090123456 a.n Dapur Titip Qu"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Teks Kop Surat Jalan (Header):</label>
                <textarea
                  rows={2}
                  value={letterheadHeader}
                  onChange={(e) => setLetterheadHeader(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#F59E0B]" />
                  <span>Simpan Profil Brand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Printer & Label */}
      {subTab === 'printer' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-amber-100 pb-2">
                Format Kertas Cetak Dokumen & Struk
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paperSize === 'A4'
                      ? 'border-[#C2410C] bg-amber-50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs text-slate-900">Format A4 / Folio</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Surat Jalan resmi toko konsinyasi</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperSize('80mm')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paperSize === '80mm'
                      ? 'border-[#C2410C] bg-amber-50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs text-slate-900">Thermal 80mm</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Kasir POS & struk nota delivery</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperSize('58mm')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paperSize === '58mm'
                      ? 'border-[#C2410C] bg-amber-50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs text-slate-900">Thermal 58mm</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Printer Bluetooth portable kurir</div>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#F59E0B]" />
                  <span>Terapkan Format Printer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Pencadangan & Reset Data */}
      {subTab === 'data' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Isolasi Data Modul Titip Qu
              </h3>
              <p className="text-xs text-slate-500">
                Semua data tersimpan secara terisolasi dengan prefix <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono">usahaku_data_titip_*</code> di browser lokal Anda.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={onReloadDemoData}
                  className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Muat Ulang Sampel Konsinyasi & Reseller</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Yakin ingin mereset seluruh data Titip Qu?')) {
                      onResetTitipData();
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kosongkan Seluruh Data Titip Qu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
