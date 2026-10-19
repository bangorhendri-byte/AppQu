/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Printer, 
  Barcode, 
  Key, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Crown, 
  FileText, 
  Save, 
  Download,
  Upload
} from 'lucide-react';
import { RitelStoreProfile } from '../RitelTypes';

interface SettingViewProps {
  profile: RitelStoreProfile;
  onSaveProfile: (profile: RitelStoreProfile) => void;
  onResetRitelData: () => void;
  onReloadDemoData: () => void;
}

export const SettingView: React.FC<SettingViewProps> = ({
  profile,
  onSaveProfile,
  onResetRitelData,
  onReloadDemoData
}) => {
  const [subTab, setSubTab] = useState<'profil' | 'hardware' | 'akses'>('profil');

  // Form State
  const [storeName, setStoreName] = useState(profile.storeName);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone);
  const [npwp, setNpwp] = useState(profile.npwp || '');
  const [receiptFooter, setReceiptFooter] = useState(profile.receiptFooter);
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>(profile.paperSize);
  const [autoPrint, setAutoPrint] = useState(profile.autoPrint);
  const [scannerMode, setScannerMode] = useState<'usb_hid' | 'camera'>(profile.scannerMode);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      storeName,
      slogan,
      address,
      phone,
      npwp,
      receiptFooter,
      paperSize,
      autoPrint,
      scannerMode
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Sub navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('profil')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'profil'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Profil Toko & Struk</span>
          </button>

          <button
            onClick={() => setSubTab('hardware')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'hardware'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Printer & Scanner Barcode</span>
          </button>

          <button
            onClick={() => setSubTab('akses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'akses'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Hak Akses Karyawan</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 text-amber-600" />
              PRO
            </span>
          </button>
        </div>

        {isSavedAlert && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            <span>Perubahan berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: Profil Toko & Header Struk */}
      {subTab === 'profil' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Informasi Bisnis & Cetak Struk
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Toko Ritel:</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Slogan / Tagline:</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Lengkap Toko:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nomor Telepon / WA Toko:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">NPWP / NIB Usaha:</label>
                  <input
                    type="text"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder="09.123.456.7-890.000"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Catatan Kaki Struk (Footer):</label>
                <textarea
                  rows={3}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#F97316]" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </form>

            {/* Data Management Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Pencadangan & Pemulihan Data Ritel
              </h3>
              <p className="text-xs text-slate-500">
                Data RitelQu disimpan secara terisolasi dengan prefix <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">usahaku_data_ritel_*</code> sehingga aman dan tidak mengganggu modul Bengkel, Kedai, atau Klinik.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={onReloadDemoData}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Muat Ulang Sampel Toko Ritel</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Yakin ingin mereset seluruh data RitelQu menjadi kosong?')) {
                      onResetRitelData();
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kosongkan Seluruh Data Ritel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Printer & Scanner Barcode */}
      {subTab === 'hardware' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Konfigurasi Perangkat Kasir (Hardware)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Lebar Kertas Printer Thermal:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaperSize('58mm')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paperSize === '58mm'
                          ? 'border-[#1E3A8A] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-slate-900">58 mm (Standard Mobile / Bluetooth)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Printer thermal portable kasir umum</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaperSize('80mm')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paperSize === '80mm'
                          ? 'border-[#1E3A8A] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-slate-900">80 mm (Desktop Auto-Cutter)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Printer kasir meja minimarket / swalayan</div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Mode Scanner Barcode:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScannerMode('usb_hid')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        scannerMode === 'usb_hid'
                          ? 'border-[#1E3A8A] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-slate-900">USB / Wireless Barcode Gun (HID)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Karakter barcode langsung masuk seperti keyboard</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScannerMode('camera')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        scannerMode === 'camera'
                          ? 'border-[#1E3A8A] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-slate-900">Kamera Tablet / Smartphone</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Menggunakan lensa kamera bawaan device</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#F97316]" />
                  <span>Terapkan Hardware</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Hak Akses Karyawan (Badge Pro 👑) */}
      {subTab === 'akses' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-6 h-6 text-amber-100" />
                <div>
                  <h3 className="font-extrabold text-sm">Fitur Pro 👑: Otorisasi Role & Pembagian Shift</h3>
                  <p className="text-xs text-amber-100">
                    Kunci menu sensitif seperti Laporan Laba, Buka Harga Beli Pokok, dan Stok Opname dari akun Kasir umum.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-extrabold text-xs text-slate-900">1. Role Kasir Shift</div>
                  <span className="text-[10px] font-bold bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded">
                    Terbuka: Kasir POS, Scan Barcode, Bon Pelanggan
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Hanya bisa melakukan scan checkout barang, terima pembayaran tunai/QRIS, dan cetak nota belanja. Tidak dapat melihat harga pokok kulakan (HPP).
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-extrabold text-xs text-slate-900">2. Role Supervisor / Gudang</div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                    Terbuka: Kasir, Stok Opname, PO Inbound, Barang Rusak
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dapat menerima kiriman barang dari distributor, mencetak label harga rak, dan mengisi formulir opname fisik berkala.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-extrabold text-xs text-slate-900">3. Owner / Super Administrator</div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                    Akses Penuh Seluruh Modul (Owner Mode)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Bebas mengakses rekap margin laba bersih, ekspor file keuangan, pembayaran hutang usaha, dan pengaturan profil toko.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
