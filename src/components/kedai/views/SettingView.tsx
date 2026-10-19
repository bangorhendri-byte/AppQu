import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Printer, 
  ShieldCheck, 
  Database, 
  Crown, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  Upload, 
  Download, 
  UserPlus, 
  Key, 
  Lock, 
  Wifi, 
  Phone, 
  Instagram, 
  MapPin, 
  X,
  FileText
} from 'lucide-react';
import { KedaiSettings, KedaiStaff } from '../KedaiTypes';
import { exportKedaiData, importKedaiData } from '../KedaiStorage';

interface SettingViewProps {
  settings: KedaiSettings;
  staffList: KedaiStaff[];
  onUpdateSettings: (newSettings: KedaiSettings) => void;
  onAddStaff: (staff: Omit<KedaiStaff, 'id'>) => void;
  onUpdateStaff: (staff: KedaiStaff) => void;
  onResetKedaiDemo: () => void;
}

export const SettingView: React.FC<SettingViewProps> = ({
  settings,
  staffList,
  onUpdateSettings,
  onAddStaff,
  onUpdateStaff,
  onResetKedaiDemo
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'printer' | 'staff' | 'backup'>('profil');

  // Form profile
  const [formSettings, setFormSettings] = useState<KedaiSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Staff Form Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<KedaiStaff | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'Kasir' | 'Barista' | 'Koki' | 'Pelayan' | 'Manager'>('Kasir');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPin, setStaffPin] = useState('1234');
  const [staffShift, setStaffShift] = useState('Pagi');
  const [permDiscount, setPermDiscount] = useState(false);
  const [permVoid, setPermVoid] = useState(false);
  const [permDrawer, setPermDrawer] = useState(true);
  const [permReport, setPermReport] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffName('');
    setStaffRole('Kasir');
    setStaffPhone('');
    setStaffPin('1234');
    setStaffShift('Pagi (08:00 - 16:00)');
    setPermDiscount(false);
    setPermVoid(false);
    setPermDrawer(true);
    setPermReport(false);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (stf: KedaiStaff) => {
    setEditingStaff(stf);
    setStaffName(stf.name);
    setStaffRole(stf.role);
    setStaffPhone(stf.phone);
    setStaffPin(stf.pin);
    setStaffShift(stf.shift);
    setPermDiscount(stf.permissions.canDiscount);
    setPermVoid(stf.permissions.canVoid);
    setPermDrawer(stf.permissions.canOpenDrawer);
    setPermReport(stf.permissions.canViewReport);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    if (editingStaff) {
      onUpdateStaff({
        ...editingStaff,
        name: staffName.trim(),
        role: staffRole,
        phone: staffPhone.trim(),
        pin: staffPin.trim(),
        shift: staffShift,
        permissions: {
          canDiscount: permDiscount,
          canVoid: permVoid,
          canOpenDrawer: permDrawer,
          canViewReport: permReport
        }
      });
    } else {
      onAddStaff({
        name: staffName.trim(),
        role: staffRole,
        phone: staffPhone.trim(),
        pin: staffPin.trim(),
        shift: staffShift,
        active: true,
        permissions: {
          canDiscount: permDiscount,
          canVoid: permVoid,
          canOpenDrawer: permDrawer,
          canViewReport: permReport
        }
      });
    }
    setIsStaffModalOpen(false);
  };

  const handleDownloadBackup = () => {
    const data = exportKedaiData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_kedaiqu_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importKedaiData(content);
        if (ok) {
          alert('Data KedaiQu berhasil dipulihkan! Halaman akan memuat ulang data terbaru.');
          window.location.reload();
        } else {
          alert('Gagal memulihkan data: Format file JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7DFD5]">
        <div>
          <h2 className="text-xl font-bold text-[#1B3B2B] flex items-center gap-2">
            <span>⚙️ Pengaturan Kedai & Sistem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil usaha, format cetak struk bluetooth, hak akses staf PIN kasir, dan backup data terisolasi
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </span>
        )}
      </div>

      {/* Sub Tabs Underline */}
      <div className="flex items-center gap-2 border-b border-[#E7DFD5] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('profil')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'profil'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Profil Kedai & Nota Struk</span>
        </button>

        <button
          onClick={() => setActiveTab('printer')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'printer'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Cetak Bluetooth & Kertas</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Hak Akses Staf</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full">PRO 👑</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3.5 py-1.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'backup'
              ? 'border-[#C59B27] text-[#1B3B2B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Backup & Reset Data</span>
        </button>
      </div>

      {/* SUBTAB 1: PROFIL KEDAI & NOTA STRUK */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 bg-white rounded-2xl border border-[#E7DFD5] p-4 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm text-[#1B3B2B] pb-2 border-b border-slate-100">
              Identitas & Informasi Kedai
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Usaha / Kedai</label>
              <input
                type="text"
                required
                value={formSettings.storeName}
                onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-bold text-[#1B3B2B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Slogan Kedai</label>
              <input
                type="text"
                value={formSettings.slogan}
                onChange={(e) => setFormSettings({ ...formSettings, slogan: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea
                rows={2}
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No WhatsApp / Telp</label>
                <input
                  type="text"
                  value={formSettings.phone}
                  onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instagram</label>
                <input
                  type="text"
                  value={formSettings.instagram}
                  onChange={(e) => setFormSettings({ ...formSettings, instagram: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama WiFi Kedai</label>
                <input
                  type="text"
                  value={formSettings.wifiName}
                  onChange={(e) => setFormSettings({ ...formSettings, wifiName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password WiFi</label>
                <input
                  type="text"
                  value={formSettings.wifiPassword}
                  onChange={(e) => setFormSettings({ ...formSettings, wifiPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Kaki Struk (Receipt Footer)</label>
              <textarea
                rows={3}
                value={formSettings.receiptFooter}
                onChange={(e) => setFormSettings({ ...formSettings, receiptFooter: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 text-[#C59B27]" />
              <span>Simpan Profil & Struk</span>
            </button>
          </div>

          {/* Pratinjau Struk Thermal Live */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-[#E7DFD5] p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-[#1B3B2B] pb-2 border-b border-slate-100">
              Live Preview Struk Thermal
            </h3>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 space-y-1.5 shadow-inner">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm tracking-wide">{formSettings.storeName}</p>
                <p className="text-[10px] text-slate-500 italic">{formSettings.slogan}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{formSettings.address}</p>
                <p className="text-[10px] text-slate-500">Telp: {formSettings.phone}</p>
              </div>

              <div className="py-1 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{new Date().toLocaleDateString('id-ID')} 14:30</span>
                </div>
                <div className="flex justify-between">
                  <span>Meja:</span>
                  <span>Meja 01 (Dine In)</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>Siti Rahmawati</span>
                </div>
              </div>

              <div className="py-1.5 border-t border-b border-dashed border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>2x Kopi Susu Aren</span>
                  <span>36.000</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Nasi Goreng Spesial</span>
                  <span>28.000</span>
                </div>
              </div>

              <div className="pt-1 space-y-0.5 text-xs font-bold">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>Rp 64.000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TOTAL</span>
                  <span>Rp 64.000</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-500 whitespace-pre-line">
                {formSettings.receiptFooter}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUBTAB 2: CETAK BLUETOOTH & KERTAS */}
      {activeTab === 'printer' && (
        <div className="bg-white rounded-2xl border border-[#E7DFD5] p-4 shadow-xs space-y-4 text-xs max-w-xl">
          <h3 className="font-bold text-sm text-[#1B3B2B] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#C59B27]" />
            <span>Pengaturan Cetak Bluetooth POS</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Ukuran Lebar Kertas Thermal:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['58mm', '80mm'] as const).map(size => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => {
                      const updated = { ...formSettings, printerType: size };
                      setFormSettings(updated);
                      onUpdateSettings(updated);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      formSettings.printerType === size
                        ? 'border-[#C59B27] bg-amber-50 text-[#1B3B2B] font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-bold">{size}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {size === '58mm' ? 'Standar Printer Bluetooth Mini Portable' : 'Printer Kasir Desktop Lebar POS'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800">Otomatis Cetak Struk Setelah Pembayaran</span>
                  <p className="text-[10px] text-slate-400">Langsung panggil jendela cetak setelah kasir selesai bayar</p>
                </div>
                <input
                  type="checkbox"
                  checked={formSettings.autoPrintReceipt}
                  onChange={(e) => {
                    const updated = { ...formSettings, autoPrintReceipt: e.target.checked };
                    setFormSettings(updated);
                    onUpdateSettings(updated);
                  }}
                  className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800">Cetak Tiket Otomatis untuk Barista / Dapur</span>
                  <p className="text-[10px] text-slate-400">Cetak struk salinan kecil saat tombol "Kirim ke Dapur" ditekan</p>
                </div>
                <input
                  type="checkbox"
                  checked={formSettings.printKitchenTicket}
                  onChange={(e) => {
                    const updated = { ...formSettings, printKitchenTicket: e.target.checked };
                    setFormSettings(updated);
                    onUpdateSettings(updated);
                  }}
                  className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="block font-semibold text-slate-700">Pajak Restoran PB1 (%)</label>
                <p className="text-[10px] text-slate-400">Atur 0% jika harga menu sudah nett / all in</p>
              </div>
              <input
                type="number"
                value={formSettings.taxPercent}
                onChange={(e) => {
                  const updated = { ...formSettings, taxPercent: Number(e.target.value) };
                  setFormSettings(updated);
                  onUpdateSettings(updated);
                }}
                className="w-20 px-2 py-1 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] text-center font-bold"
              />
            </div>

            <button
              type="button"
              onClick={() => alert(`Simulasi Uji Cetak Thermal ${formSettings.printerType} berhasil dikirim!`)}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-[#C59B27] text-[#1B3B2B] hover:bg-amber-50 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[#C59B27]" />
              <span>Uji Cetak Thermal ({formSettings.printerType})</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: HAK AKSES STAF (PRO 👑) */}
      {activeTab === 'staff' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
            <p className="text-xs text-slate-500">
              Kelola karyawan, PIN akses kasir, shift kerja, dan izin batalkan transaksi / lihat laporan
            </p>
            <button
              onClick={handleOpenAddStaff}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-colors shadow-xs flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>+ Tambah Staff</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {staffList.map(stf => (
              <div
                key={stf.id}
                className="bg-white rounded-2xl border border-[#E7DFD5] p-3.5 shadow-xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#1B3B2B]">{stf.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-block mt-0.5">
                        {stf.role}
                      </span>
                    </div>
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                      PIN: {stf.pin}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <p>No WA: {stf.phone}</p>
                    <p>Shift: {stf.shift}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                    <p className="font-semibold text-slate-600">Hak Akses:</p>
                    <div className="grid grid-cols-2 gap-1 text-slate-500">
                      <span>{stf.permissions.canDiscount ? '✅' : '❌'} Beri Diskon</span>
                      <span>{stf.permissions.canVoid ? '✅' : '❌'} Void / Batal</span>
                      <span>{stf.permissions.canOpenDrawer ? '✅' : '❌'} Buka Laci</span>
                      <span>{stf.permissions.canViewReport ? '✅' : '❌'} Laporan Omset</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleOpenEditStaff(stf)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1B3B2B] bg-[#FAF7F2] border border-[#E7DFD5] hover:bg-amber-50"
                  >
                    Edit Izin & PIN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: BACKUP & RESET DATA */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-[#E7DFD5] p-4 shadow-xs space-y-4 text-xs max-w-xl">
          <div>
            <h3 className="font-bold text-sm text-[#1B3B2B]">Cadangan Data Terisolasi KedaiQu</h3>
            <p className="text-slate-500 mt-0.5">
              Semua data disimpan di browser Anda secara terisolasi dengan prefix <code>usahaku_data_kedai_*</code>.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-[#C59B27]/40 space-y-2">
            <h4 className="font-bold text-xs text-[#1B3B2B] flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#C59B27]" />
              <span>Ekspor Cadangan Lengkap (JSON)</span>
            </h4>
            <p className="text-[11px] text-slate-600">
              Unduh seluruh file JSON yang berisi denah meja, katalog menu, pesanan, bahan baku, data member, dan catatan hutang.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Unduh File Cadangan (.json)</span>
            </button>
          </div>

          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5] space-y-2">
            <h4 className="font-bold text-xs text-[#1B3B2B] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#C59B27]" />
              <span>Pulihkan Data dari File Cadangan</span>
            </h4>
            <p className="text-[11px] text-slate-600">
              Pilih file JSON cadangan yang pernah Anda unduh sebelumnya untuk memulihkan seluruh data kedai.
            </p>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#C59B27] text-[#1B3B2B] hover:bg-amber-50 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Pilih File JSON untuk Dipulihkan</span>
              <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
            <h4 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Data Demo Kedai</span>
            </h4>
            <p className="text-[11px] text-rose-700">
              Kembalikan seluruh data meja, menu, bahan baku, dan kasir ke pengaturan demo awal pabrik.
            </p>
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mereset seluruh data KedaiQu ke demo awal?')) {
                  onResetKedaiDemo();
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-700 text-white hover:bg-rose-800 shadow-xs"
            >
              Reset ke Demo Awal
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveStaff} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">
                {editingStaff ? 'Edit Staff & Izin' : 'Tambah Staff Baru'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-80 overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Karyawan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dian Permana"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Posisi</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                  >
                    <option value="Kasir">Kasir</option>
                    <option value="Barista">Barista</option>
                    <option value="Koki">Koki</option>
                    <option value="Pelayan">Pelayan</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Kasir (4 Digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2] font-mono text-center tracking-widest font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No WhatsApp</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Kerja</label>
                <input
                  type="text"
                  value={staffShift}
                  onChange={(e) => setStaffShift(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-[#FAF7F2]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <p className="font-bold text-slate-700">Hak Akses Sistem:</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permDiscount}
                      onChange={(e) => setPermDiscount(e.target.checked)}
                      className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                    />
                    <span>Boleh Berikan Diskon Khusus</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permVoid}
                      onChange={(e) => setPermVoid(e.target.checked)}
                      className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                    />
                    <span>Boleh Batalkan / Void Pesanan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permDrawer}
                      onChange={(e) => setPermDrawer(e.target.checked)}
                      className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                    />
                    <span>Boleh Buka Laci Kas (Cash Drawer)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permReport}
                      onChange={(e) => setPermReport(e.target.checked)}
                      className="rounded text-[#1B3B2B] focus:ring-[#C59B27]"
                    />
                    <span>Boleh Lihat Laporan Omset Harian</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22]"
              >
                Simpan Staff
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
