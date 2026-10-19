import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Key, 
  Check, 
  X, 
  UserCheck, 
  Users, 
  Sparkles, 
  Save, 
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { RolePermissionConfig } from '../../types';

interface CorePermissionsViewProps {
  onBack: () => void;
  permissions: RolePermissionConfig[];
  onUpdatePermissions: (updated: RolePermissionConfig[]) => void;
  onNavigateToDevices?: () => void;
}

export const CorePermissionsView: React.FC<CorePermissionsViewProps> = ({
  onBack,
  permissions,
  onUpdatePermissions,
  onNavigateToDevices
}) => {
  const [items, setItems] = useState<RolePermissionConfig[]>(permissions);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'all' | 'spv' | 'kasir' | 'mekanik'>('all');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggle = (id: string, role: 'spv' | 'kasir' | 'mekanik') => {
    const updated = items.map((p) => {
      if (p.id === id) {
        return { ...p, [role]: !p[role] };
      }
      return p;
    });
    setItems(updated);
  };

  const handleSave = () => {
    onUpdatePermissions(items);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const spvCount = items.filter((p) => p.spv).length;
  const kasirCount = items.filter((p) => p.kasir).length;

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
              <h1 className="text-xl font-bold tracking-tight">Hak Akses & Role</h1>
              <p className="text-xs text-emerald-100 font-medium">Otorisasi Supervisor (SPV) & Kasir</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-white text-[#008952] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.3]" />
            <span>Simpan</span>
          </button>
        </div>

        {/* Quick Role Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold block">
                Supervisor (SPV)
              </span>
              <span className="text-sm font-extrabold text-white">{spvCount} Otoritas Aktif</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white/15 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold block">
                Staf Kasir
              </span>
              <span className="text-sm font-extrabold text-white">{kasirCount} Otoritas Aktif</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-white">
              <Key className="w-4 h-4" />
            </div>
          </div>
        </div>

        {onNavigateToDevices && (
          <button
            type="button"
            onClick={onNavigateToDevices}
            className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Kelola Slot HP Karyawan (Maksimal 3 HP Core)</span>
            </span>
            <span className="bg-white/25 px-2 py-0.5 rounded-lg text-[10px]">Tautkan HP →</span>
          </button>
        )}
      </div>

      {savedNotice && (
        <div className="m-4 p-3 bg-emerald-100 border border-emerald-300 text-[#008952] rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Matriks hak akses SPV & Kasir berhasil disimpan!</span>
        </div>
      )}

      {/* Permission List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
          <span className="font-bold text-slate-700">Daftar Otoritas Modul:</span>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 pr-2">
            <span className="w-12 text-center text-[#008952]">SPV</span>
            <span className="w-12 text-center text-blue-600">Kasir</span>
          </div>
        </div>

        {items.map((perm) => (
          <div
            key={perm.id}
            className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex-1 pr-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                  {perm.category}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                {perm.permissionName}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                {perm.description}
              </p>
            </div>

            {/* Role Switches */}
            <div className="flex items-center gap-4 shrink-0">
              {/* SPV Toggle */}
              <button
                type="button"
                onClick={() => handleToggle(perm.id, 'spv')}
                className={`w-12 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  perm.spv
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
                title="Toggle Izin SPV"
              >
                {perm.spv ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
              </button>

              {/* Kasir Toggle */}
              <button
                type="button"
                onClick={() => handleToggle(perm.id, 'kasir')}
                className={`w-12 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  perm.kasir
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
                title="Toggle Izin Kasir"
              >
                {perm.kasir ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
