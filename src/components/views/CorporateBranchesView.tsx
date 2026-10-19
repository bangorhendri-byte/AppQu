import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  CheckCircle2, 
  MapPin, 
  UserCheck, 
  Phone, 
  Mail, 
  Sparkles,
  Check,
  Smartphone
} from 'lucide-react';
import { BranchItem } from '../../types';

interface CorporateBranchesViewProps {
  onBack: () => void;
  branches: BranchItem[];
  onSaveBranches: (updated: BranchItem[]) => void;
  onNavigateToDevices?: () => void;
}

export const CorporateBranchesView: React.FC<CorporateBranchesViewProps> = ({
  onBack,
  branches,
  onSaveBranches,
  onNavigateToDevices
}) => {
  const [branchList, setBranchList] = useState<BranchItem[]>(branches);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [globalSaved, setGlobalSaved] = useState(false);

  const handleFieldChange = (index: number, field: keyof BranchItem, value: any) => {
    const updated = [...branchList];
    updated[index] = { ...updated[index], [field]: value };
    setBranchList(updated);
  };

  const handleSetActiveBranch = (index: number) => {
    const updated = branchList.map((b, i) => ({
      ...b,
      isActive: i === index
    }));
    setBranchList(updated);
    onSaveBranches(updated);
  };

  const handleSaveCard = (index: number, e: React.FormEvent) => {
    e.preventDefault();
    onSaveBranches(branchList);
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 2000);
  };

  const handleSaveAll = () => {
    onSaveBranches(branchList);
    setGlobalSaved(true);
    setTimeout(() => setGlobalSaved(false), 2000);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      {/* Top Header */}
      <div 
        className="bg-[#008952] text-white px-5 pt-3.5 pb-6 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-10 h-10 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Manajemen Cabang Bengkel</h1>
              <p className="text-xs text-emerald-100 font-medium">Kelola Kantor Cabang & Outlet Operasional</p>
            </div>
          </div>
          <button
            onClick={handleSaveAll}
            className="bg-white text-[#008952] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.3]" />
            <span>Simpan Semua</span>
          </button>
        </div>
        <p className="text-[11px] text-emerald-100 mt-2">
          Kelola data alamat, kontak, dan penanggung jawab SPV untuk masing-masing cabang bengkel.
        </p>

        {onNavigateToDevices && (
          <button
            type="button"
            onClick={onNavigateToDevices}
            className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Kelola Slot HP Multi-Cabang (Maksimal 9 HP)</span>
            </span>
            <span className="bg-white/25 px-2 py-0.5 rounded-lg text-[10px]">Tautkan HP →</span>
          </button>
        )}
      </div>

      {globalSaved && (
        <div className="m-4 p-3.5 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#008952]" />
          <span>Seluruh data 3 cabang berhasil disimpan ke sistem!</span>
        </div>
      )}

      {/* 3 Form Cards Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {branchList.map((branch, idx) => (
          <form
            key={branch.id}
            onSubmit={(e) => handleSaveCard(idx, e)}
            className={`bg-white rounded-3xl p-4 shadow-xs border transition-all space-y-3.5 ${
              branch.isActive
                ? 'border-[#008952] ring-2 ring-emerald-500/20'
                : 'border-slate-100 hover:border-emerald-200'
            }`}
          >
            {/* Header Form Card */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008952] flex items-center justify-center font-black text-xs">
                  0{idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Form Card Cabang {idx + 1}
                  </h3>
                  <span className="text-[10px] text-slate-400">ID Outlet: #{branch.id}</span>
                </div>
              </div>

              {branch.isActive ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#008952] border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Cabang Aktif</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetActiveBranch(idx)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#008952] text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Pilih Cabang Ini
                </button>
              )}
            </div>

            {savedIndex === idx && (
              <div className="p-2 bg-emerald-50 text-[#008952] rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Data Cabang {idx + 1} berhasil disimpan!</span>
              </div>
            )}

            {/* 1. Nama Cabang */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3 text-[#008952]" />
                Nama Cabang *
              </label>
              <input
                type="text"
                required
                value={branch.branchName}
                onChange={(e) => handleFieldChange(idx, 'branchName', e.target.value)}
                placeholder="Nama Cabang"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* 2. Alamat */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[#008952]" />
                Alamat Cabang *
              </label>
              <textarea
                rows={2}
                required
                value={branch.address}
                onChange={(e) => handleFieldChange(idx, 'address', e.target.value)}
                placeholder="Alamat Cabang"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* 3. SPV */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                <UserCheck className="w-3 h-3 text-[#008952]" />
                Supervisor (SPV) *
              </label>
              <input
                type="text"
                required
                value={branch.spvName}
                onChange={(e) => handleFieldChange(idx, 'spvName', e.target.value)}
                placeholder="Nama SPV Penanggung Jawab"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* 4. No HP & 5. Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Phone className="w-3 h-3 text-[#008952]" />
                  No HP Cabang *
                </label>
                <input
                  type="tel"
                  required
                  value={branch.phone}
                  onChange={(e) => handleFieldChange(idx, 'phone', e.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Mail className="w-3 h-3 text-[#008952]" />
                  Email Cabang *
                </label>
                <input
                  type="email"
                  required
                  value={branch.email}
                  onChange={(e) => handleFieldChange(idx, 'email', e.target.value)}
                  placeholder="cabang@bengkelqu.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Tombol Simpan Form Card */}
            <div className="pt-1 flex items-center justify-end">
              <button
                type="submit"
                className="bg-[#008952] hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Cabang {idx + 1}</span>
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
};
