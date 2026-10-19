import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Check, 
  X, 
  UserCheck, 
  Users, 
  Key, 
  Coins, 
  DollarSign, 
  Phone, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Printer, 
  Send, 
  FileText, 
  Edit3, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  Percent, 
  CreditCard,
  MessageCircle,
  Eye,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { 
  StaffMember, 
  StaffRole, 
  StaffStatus, 
  MechanicCommissionRecord, 
  RolePermissionConfig, 
  UserSession, 
  Transaction,
  WorkshopProfile
} from '../../types';
import { INITIAL_STAFF, INITIAL_COMMISSIONS, INITIAL_PERMISSIONS, INITIAL_PROFILE } from '../../data/mockData';

interface StaffViewProps {
  initialTab?: string;
  onBack: () => void;
  staff: StaffMember[];
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateStaff: (updated: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  commissions: MechanicCommissionRecord[];
  onUpdateCommissionStatus: (id: string, status: 'Pending' | 'Dibayar') => void;
  onAddCommission: (newRecord: MechanicCommissionRecord) => void;
  permissions: RolePermissionConfig[];
  onUpdatePermissions: (updated: RolePermissionConfig[]) => void;
  userSession?: UserSession | null;
  onSwitchUserRole?: (role: UserSession['role']) => void;
  profile?: WorkshopProfile;
  transactions?: Transaction[];
}

export const StaffView: React.FC<StaffViewProps> = ({
  initialTab = 'data-karyawan',
  onBack,
  staff = INITIAL_STAFF,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  commissions = INITIAL_COMMISSIONS,
  onUpdateCommissionStatus,
  onAddCommission,
  permissions = INITIAL_PERMISSIONS,
  onUpdatePermissions,
  userSession,
  onSwitchUserRole,
  profile = INITIAL_PROFILE,
  transactions = []
}) => {
  // Normalize tab
  const getNormalizedTab = (tab: string) => {
    if (tab === 'data-karyawan' || tab === 'staff-list' || tab === 'karyawan') return 'data-karyawan';
    if (tab === 'hak-akses' || tab === 'staff-permissions' || tab === 'akses') return 'hak-akses';
    if (tab === 'komisi-mekanik' || tab === 'staff-commission' || tab === 'komisi') return 'komisi-mekanik';
    return 'data-karyawan';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getNormalizedTab(initialTab));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // TAB 1: DATA KARYAWAN STATES
  // -------------------------------------------------------------
  const [searchStaff, setSearchStaff] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Semua' | StaffRole>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | StaffStatus>('Semua');

  // Modal Staff Form (Add / Edit)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('Mekanik');
  const [formStatus, setFormStatus] = useState<StaffStatus>('Aktif');
  const [formCommission, setFormCommission] = useState<number>(20);
  const [formSalary, setFormSalary] = useState<number>(2500000);
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // -------------------------------------------------------------
  // TAB 2: HAK AKSES STATES
  // -------------------------------------------------------------
  const [permissionItems, setPermissionItems] = useState<RolePermissionConfig[]>(permissions);
  const [isPermissionsSaved, setIsPermissionsSaved] = useState(false);

  // -------------------------------------------------------------
  // TAB 3: KOMISI MEKANIK STATES
  // -------------------------------------------------------------
  const [commissionMechanicFilter, setCommissionMechanicFilter] = useState<string>('Semua');
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<'Semua' | 'Pending' | 'Dibayar'>('Semua');
  const [selectedCommissionForPrint, setSelectedCommissionForPrint] = useState<MechanicCommissionRecord | null>(null);
  const [isAddManualCommissionOpen, setIsAddManualCommissionOpen] = useState(false);
  
  // Manual Commission Form
  const [manualInvoice, setManualInvoice] = useState('');
  const [manualMechanic, setManualMechanic] = useState(staff.find(s => s.role === 'Mekanik')?.name || 'Mas Joko (Senior)');
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualPlate, setManualPlate] = useState('');
  const [manualLaborTotal, setManualLaborTotal] = useState<number>(50000);
  const [manualCommissionPercent, setManualCommissionPercent] = useState<number>(20);
  const [manualNotes, setManualNotes] = useState('');

  // -------------------------------------------------------------
  // HANDLERS: DATA KARYAWAN
  // -------------------------------------------------------------
  const handleOpenAddModal = () => {
    setEditingStaffId(null);
    setFormName('');
    setFormPhone('');
    setFormRole('Mekanik');
    setFormStatus('Aktif');
    setFormCommission(20);
    setFormSalary(2500000);
    setFormSpecialty('');
    setFormEmail('');
    setFormNotes('');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditModal = (item: StaffMember) => {
    setEditingStaffId(item.id);
    setFormName(item.name);
    setFormPhone(item.phone);
    setFormRole(item.role);
    setFormStatus(item.status);
    setFormCommission(item.commissionPercent || (item.role === 'Mekanik' ? 20 : 0));
    setFormSalary(item.baseSalary || 2500000);
    setFormSpecialty(item.specialty || '');
    setFormEmail(item.email || '');
    setFormNotes(item.notes || '');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Harap isi nama dan nomor HP/WhatsApp karyawan!');
      return;
    }

    const avatarBgs = ['bg-emerald-600', 'bg-teal-600', 'bg-blue-600', 'bg-green-600', 'bg-amber-600', 'bg-purple-600'];
    const randomBg = avatarBgs[Math.floor(Math.random() * avatarBgs.length)];

    if (editingStaffId) {
      // Edit existing
      const existing = staff.find((s) => s.id === editingStaffId);
      if (existing) {
        const updated: StaffMember = {
          ...existing,
          name: formName.trim(),
          phone: formPhone.trim(),
          role: formRole,
          status: formStatus,
          commissionPercent: formRole === 'Mekanik' ? Number(formCommission) : 0,
          baseSalary: Number(formSalary) || 0,
          specialty: formSpecialty.trim(),
          email: formEmail.trim(),
          notes: formNotes.trim()
        };
        onUpdateStaff(updated);
        showToast(`Data staf ${updated.name} berhasil diperbarui!`);
      }
    } else {
      // Create new
      const newStaff: StaffMember = {
        id: `stf-${Date.now()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        role: formRole,
        status: formStatus,
        commissionPercent: formRole === 'Mekanik' ? Number(formCommission) : 0,
        baseSalary: Number(formSalary) || 0,
        specialty: formSpecialty.trim() || `${formRole} Bengkel`,
        joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        rating: 5.0,
        activeTasks: 0,
        completedToday: 0,
        avatarBg: randomBg,
        email: formEmail.trim(),
        notes: formNotes.trim()
      };
      onAddStaff(newStaff);
      showToast(`Karyawan baru ${newStaff.name} berhasil ditambahkan!`);
    }

    setIsStaffModalOpen(false);
  };

  const handleToggleStaffStatus = (item: StaffMember) => {
    const newStatus: StaffStatus = item.status === 'Aktif' ? 'Non-Aktif' : 'Aktif';
    const updated: StaffMember = { ...item, status: newStatus };
    onUpdateStaff(updated);
    showToast(`Status ${item.name} diubah menjadi ${newStatus}.`);
  };

  // -------------------------------------------------------------
  // HANDLERS: HAK AKSES
  // -------------------------------------------------------------
  const handleTogglePermission = (id: string, role: 'spv' | 'kasir' | 'mekanik') => {
    const updated = permissionItems.map((p) => {
      if (p.id === id) {
        return { ...p, [role]: !p[role] };
      }
      return p;
    });
    setPermissionItems(updated);
  };

  const handleSavePermissions = () => {
    onUpdatePermissions(permissionItems);
    setIsPermissionsSaved(true);
    showToast('Pengaturan hak akses role berhasil disimpan!');
    setTimeout(() => setIsPermissionsSaved(false), 2500);
  };

  const handleResetDefaultPermissions = () => {
    setPermissionItems(INITIAL_PERMISSIONS);
    onUpdatePermissions(INITIAL_PERMISSIONS);
    showToast('Hak akses dipulihkan ke pengaturan standar pabrik.');
  };

  // -------------------------------------------------------------
  // HANDLERS: KOMISI MEKANIK
  // -------------------------------------------------------------
  const handleTogglePayoutStatus = (record: MechanicCommissionRecord) => {
    const nextStatus = record.payoutStatus === 'Pending' ? 'Dibayar' : 'Pending';
    onUpdateCommissionStatus(record.id, nextStatus);
    showToast(`Status komisi ${record.mechanicName} (#${record.invoiceNumber}) diubah menjadi ${nextStatus}.`);
  };

  const handleSaveManualCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomer.trim() || !manualPlate.trim()) {
      showToast('Harap lengkapi nama pelanggan dan plat nomor!');
      return;
    }

    const calculatedCommission = Math.round((manualLaborTotal * manualCommissionPercent) / 100);
    const newRecord: MechanicCommissionRecord = {
      id: `com-${Date.now()}`,
      invoiceNumber: manualInvoice.trim() || `MAN-${Date.now().toString().slice(-6)}`,
      date: `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      mechanicName: manualMechanic,
      customerName: manualCustomer.trim(),
      plateNumber: manualPlate.trim().toUpperCase(),
      vehicleModel: 'Motor Servis',
      serviceLaborTotal: manualLaborTotal,
      commissionPercent: manualCommissionPercent,
      commissionAmount: calculatedCommission,
      payoutStatus: 'Pending',
      notes: manualNotes.trim() || 'Pencatatan komisi manual'
    };

    onAddCommission(newRecord);
    setIsAddManualCommissionOpen(false);
    showToast(`Komisi untuk ${manualMechanic} sebesar Rp ${calculatedCommission.toLocaleString('id-ID')} berhasil dicatat!`);

    // Reset Form
    setManualCustomer('');
    setManualPlate('');
    setManualInvoice('');
    setManualNotes('');
  };

  const handlePrintCommissionSlip = (record: MechanicCommissionRecord) => {
    setSelectedCommissionForPrint(record);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // -------------------------------------------------------------
  // FILTERED DATA CALCULATIONS
  // -------------------------------------------------------------
  const filteredStaff = staff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchStaff.toLowerCase()) ||
      s.phone.includes(searchStaff) ||
      (s.specialty && s.specialty.toLowerCase().includes(searchStaff.toLowerCase()));
    const matchRole = roleFilter === 'Semua' || s.role === roleFilter;
    const matchStatus = statusFilter === 'Semua' || s.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const filteredCommissions = commissions.filter((c) => {
    const matchMechanic = commissionMechanicFilter === 'Semua' || c.mechanicName === commissionMechanicFilter;
    const matchStatus = commissionStatusFilter === 'Semua' || c.payoutStatus === commissionStatusFilter;
    return matchMechanic && matchStatus;
  });

  // Commission Totals
  const totalCommissionAll = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalCommissionPaid = commissions.filter((c) => c.payoutStatus === 'Dibayar').reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalCommissionPending = commissions.filter((c) => c.payoutStatus === 'Pending').reduce((sum, c) => sum + c.commissionAmount, 0);

  // Active counts
  const countMekanik = staff.filter((s) => s.role === 'Mekanik' && s.status === 'Aktif').length;
  const countKasir = staff.filter((s) => s.role === 'Kasir' && s.status === 'Aktif').length;
  const countAdmin = staff.filter((s) => (s.role === 'Admin' || s.role === 'Supervisor') && s.status === 'Aktif').length;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* 1. COMPACT HEADER BAR */}
      <div className="bg-[#008952] text-white px-4 pt-2.5 pb-2.5 shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-8 h-8 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
                {activeTab === 'data-karyawan' && 'Data Karyawan'}
                {activeTab === 'hak-akses' && 'Hak Akses & Role'}
                {activeTab === 'komisi-mekanik' && 'Komisi Mekanik'}
              </h1>
              <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                {activeTab === 'data-karyawan' && 'Formulir & Tabel Master Staf Bengkel'}
                {activeTab === 'hak-akses' && 'Sistem Pembatasan Menu Kasir & Mekanik'}
                {activeTab === 'komisi-mekanik' && 'Pencatatan & Perhitungan Komisi Jasa Servis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {activeTab === 'data-karyawan' && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-2.5 py-1.5 rounded-xl bg-white text-[#008952] text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Karyawan</span>
              </button>
            )}

            {activeTab === 'komisi-mekanik' && (
              <button
                type="button"
                onClick={() => setIsAddManualCommissionOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white text-[#008952] text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Catat Komisi</span>
              </button>
            )}

            {activeTab === 'hak-akses' && (
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-3 py-1.5 rounded-xl bg-white text-[#008952] text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Simpan Izin</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-menu Tabs Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2.5 -mx-1 px-1">
          <button
            onClick={() => setActiveTab('data-karyawan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'data-karyawan'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Karyawan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'data-karyawan' ? 'bg-emerald-100 text-[#008952]' : 'bg-white/20 text-white'
            }`}>
              {staff.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hak-akses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'hak-akses'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Hak Akses (Role)</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
              Role Presets
            </span>
          </button>

          <button
            onClick={() => setActiveTab('komisi-mekanik')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'komisi-mekanik'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Komisi Mekanik</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'komisi-mekanik' ? 'bg-emerald-100 text-[#008952]' : 'bg-white/20 text-white'
            }`}>
              Rp {(totalCommissionAll / 1000).toFixed(0)}k
            </span>
          </button>
        </div>
      </div>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200 max-w-sm text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        style={{ paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))' }}
        className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-4"
      >
        {/* =========================================================================
            TAB 1: FORMULIR & TABEL DATA KARYAWAN
        ========================================================================= */}
        {activeTab === 'data-karyawan' && (
          <div className="space-y-4">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Karyawan</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{staff.length} Orang</span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">Master Database Tim</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Mekanik Aktif</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">{countMekanik} Teknisi</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Siaga di Bengkel</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Kasir & POS</span>
                <span className="text-xl font-black text-blue-700 mt-1 block">{countKasir} Staf</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Operasional Kasir</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">SPV & Admin</span>
                <span className="text-xl font-black text-purple-700 mt-1 block">{countAdmin} Orang</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Tata Kelola & Stok</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/90 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                  placeholder="Cari nama karyawan, no. HP/WhatsApp, atau keahlian..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Role Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Role:</span>
                  {(['Semua', 'Mekanik', 'Kasir', 'Admin', 'Supervisor'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoleFilter(r)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        roleFilter === r
                          ? 'bg-[#008952] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px] font-bold text-slate-400">Status:</span>
                  {(['Semua', 'Aktif', 'Non-Aktif'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabel & Daftar Karyawan Responsif */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800">
                    Tabel Karyawan Bengkel ({filteredStaff.length})
                  </h2>
                  <p className="text-[11px] text-slate-400">Daftar staf, nomor WhatsApp, jabatan, dan status kerja</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="bg-emerald-50 hover:bg-emerald-100 text-[#008952] border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baru</span>
                </button>
              </div>

              {filteredStaff.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>Tidak ada data karyawan yang cocok dengan pencarian / filter.</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredStaff.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Kolom Kiri: Avatar, Nama, Role, Phone, Specialty */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${item.avatarBg || 'bg-emerald-600'} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight truncate">
                              {item.name}
                            </h3>
                            {/* Role Badge */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              item.role === 'Mekanik'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.role === 'Kasir'
                                ? 'bg-blue-100 text-blue-800'
                                : item.role === 'Admin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.role}
                            </span>
                            {/* Status Badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1 ${
                              item.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              <span>{item.status}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                            <a
                              href={`https://wa.me/${item.phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                              title="Chat WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{item.phone}</span>
                            </a>
                            {item.specialty && (
                              <span className="text-[11px] text-slate-400 truncate">
                                • {item.specialty}
                              </span>
                            )}
                          </div>

                          {/* Detail Komisi & Gaji jika Mekanik */}
                          {item.role === 'Mekanik' && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                              <span className="bg-emerald-50 text-emerald-900 font-extrabold px-2 py-0.5 rounded-md border border-emerald-100">
                                Komisi Jasa: {item.commissionPercent}%
                              </span>
                              <span>• Bergabung: {item.joinDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Kolom Kanan: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStaffStatus(item)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                            item.status === 'Aktif'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                          title="Ubah Status Karyawan"
                        >
                          {item.status === 'Aktif' ? 'Non-Aktifkan' : 'Aktifkan'}
                        </button>

                        {/* WhatsApp Quick Chat */}
                        <a
                          href={`https://wa.me/${item.phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 transition"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-emerald-600" />
                        </a>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                          title="Edit Data Karyawan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus data karyawan ${item.name}?`)) {
                              onDeleteStaff(item.id);
                              showToast(`Karyawan ${item.name} berhasil dihapus.`);
                            }
                          }}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-100 transition cursor-pointer"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SISTEM HAK AKSES (ROLE-BASED PERMISSIONS)
        ========================================================================= */}
        {activeTab === 'hak-akses' && (
          <div className="space-y-4">
            {/* Simulation / Current Active Role Bar */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-4 text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-200 uppercase font-black tracking-wider block">
                      Simulasi Hak Akses Pengguna
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      Aktif Sebagai: <span className="underline decoration-amber-400">{userSession?.role || 'Supervisor'}</span>
                    </h3>
                  </div>
                </div>

                {/* Quick Role Switch Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['Supervisor', 'Kasir', 'Mekanik'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        if (onSwitchUserRole) {
                          onSwitchUserRole(r);
                          showToast(`Mode pengguna diubah menjadi ${r}. Menu dibatasi sesuai izin role ini!`);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer shadow-xs ${
                        userSession?.role === r
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-white'
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                    >
                      {r === 'Supervisor' && '🛡️ SPV (Full)'}
                      {r === 'Kasir' && '🛒 Kasir'}
                      {r === 'Mekanik' && '🔧 Mekanik'}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-emerald-100 bg-black/20 p-2.5 rounded-xl leading-relaxed">
                ℹ️ <strong>Aturan Pembatasan Menu:</strong>
                <br />• <strong>Kasir:</strong> Akses ke Kasir POS, Registrasi Antrian, dan Daftar Pelanggan. Dibatasi dari Laporan Omset Keuangan & Setting Sistem.
                <br />• <strong>Mekanik:</strong> Akses ke Antrian Pengerjaan Servis & Komisi Mekanik. Dibatasi dari Kasir POS dan Omset Keuangan Bengkel.
                <br />• <strong>Supervisor / Owner:</strong> Memiliki otorisasi penuh untuk semua menu dan konfigurasi.
              </p>
            </div>

            {/* Matrix Role Permissions Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Matriks Otorisasi Hak Akses (RBAC)
                  </h3>
                  <p className="text-[11px] text-slate-400">Centang atau hilangkan izin untuk membatasi fitur per role</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultPermissions}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Reset Default
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    className="bg-[#008952] hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Matriks</span>
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-700">Daftar Modul & Fitur</span>
                  <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-bold text-slate-600 pr-1">
                    <span className="w-12 text-center text-[#008952]">SPV</span>
                    <span className="w-12 text-center text-blue-600">Kasir</span>
                    <span className="w-12 text-center text-amber-600">Mekanik</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {permissionItems.map((perm) => (
                    <div
                      key={perm.id}
                      className="bg-slate-50/70 hover:bg-emerald-50/40 rounded-xl p-3 border border-slate-200/70 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600 uppercase">
                            {perm.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                          {perm.permissionName}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {perm.description}
                        </p>
                      </div>

                      {/* Switches for SPV, Kasir, Mekanik */}
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {/* SPV Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.id, 'spv')}
                          className={`w-12 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            perm.spv
                              ? 'bg-emerald-500 text-white shadow-2xs shadow-emerald-500/30'
                              : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                          }`}
                          title="Toggle Izin Supervisor"
                        >
                          {perm.spv ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                        </button>

                        {/* Kasir Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.id, 'kasir')}
                          className={`w-12 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            perm.kasir
                              ? 'bg-blue-600 text-white shadow-2xs shadow-blue-500/30'
                              : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                          }`}
                          title="Toggle Izin Kasir"
                        >
                          {perm.kasir ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                        </button>

                        {/* Mekanik Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm.id, 'mekanik')}
                          className={`w-12 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            perm.mekanik
                              ? 'bg-amber-500 text-white shadow-2xs shadow-amber-500/30'
                              : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                          }`}
                          title="Toggle Izin Mekanik"
                        >
                          {perm.mekanik ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: FITUR KOMISI MEKANIK OTOMATIS
        ========================================================================= */}
        {activeTab === 'komisi-mekanik' && (
          <div className="space-y-4">
            {/* Top Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Komisi Jasa</span>
                <span className="text-xl font-black text-slate-900 mt-1">
                  Rp {totalCommissionAll.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Dari {commissions.length} Transaksi Servis
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Payout</span>
                <span className="text-xl font-black text-amber-600 mt-1">
                  Rp {totalCommissionPending.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {commissions.filter(c => c.payoutStatus === 'Pending').length} Nota Belum Dicairkan
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sudah Dibayarkan</span>
                <span className="text-xl font-black text-emerald-700 mt-1">
                  Rp {totalCommissionPaid.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Lunas & Terverifikasi
                </span>
              </div>
            </div>

            {/* Formula Explanation Callout */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5">
              <Coins className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-950 leading-relaxed">
                <strong>Rumus Perhitungan Komisi Otomatis:</strong> Komisi dihitung otomatis dari subtotal item bertipe <em>Jasa Servis</em> dikalikan persentase komisi teknisi masing-masing:
                <code className="mx-1 bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono font-bold text-emerald-800">
                  Komisi = Total Jasa × Rate (%)
                </code>
                (Suku cadang / sparepart tidak dihitung ke komisi jasa).
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/90 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">Mekanik:</span>
                <select
                  value={commissionMechanicFilter}
                  onChange={(e) => setCommissionMechanicFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Semua Mekanik</option>
                  {staff
                    .filter((s) => s.role === 'Mekanik')
                    .map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.commissionPercent}%)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs font-bold text-slate-500">Status Payout:</span>
                {(['Semua', 'Pending', 'Dibayar'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCommissionStatusFilter(st)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      commissionStatusFilter === st
                        ? 'bg-[#008952] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabel & Daftar Komisi per Nota Servis */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Log Rincian Komisi Transaksi Servis ({filteredCommissions.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">Pencatatan komisi teknisi per nomor nota faktur</p>
                </div>
                <span className="text-xs font-black text-[#008952] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Total: Rp {filteredCommissions.reduce((acc, c) => acc + c.commissionAmount, 0).toLocaleString('id-ID')}
                </span>
              </div>

              {filteredCommissions.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>Belum ada log komisi untuk filter yang dipilih.</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredCommissions.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 hover:bg-slate-50/80 transition-colors space-y-2.5"
                    >
                      {/* Baris 1: No Invoice, Mekanik, Tanggal */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono font-bold text-[11px]">
                            {rec.invoiceNumber}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs">
                            {rec.mechanicName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            • {rec.plateNumber} ({rec.customerName})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            rec.payoutStatus === 'Dibayar'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rec.payoutStatus === 'Dibayar' ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                            <span>{rec.payoutStatus}</span>
                          </span>
                        </div>
                      </div>

                      {/* Baris 2: Rincian Kalkulasi Komisi */}
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between gap-3 flex-wrap text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Jasa Servis</span>
                          <span className="font-bold text-slate-700">
                            Rp {rec.serviceLaborTotal.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Persentase (%)</span>
                          <span className="font-bold text-blue-700">
                            {rec.commissionPercent}%
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Komisi Diterima</span>
                          <span className="font-black text-[#008952] text-sm">
                            Rp {rec.commissionAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Baris 3: Tanggal & Aksi */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400">
                          Dicatat: {rec.date} {rec.paidAt ? `• Dibayar: ${rec.paidAt}` : ''}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Cetak Slip Komisi */}
                          <button
                            type="button"
                            onClick={() => handlePrintCommissionSlip(rec)}
                            className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Cetak Slip Komisi Teknisi"
                          >
                            <Printer className="w-3 h-3 text-slate-600" />
                            <span>Slip Thermal</span>
                          </button>

                          {/* Toggle Payout Status */}
                          <button
                            type="button"
                            onClick={() => handleTogglePayoutStatus(rec)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer ${
                              rec.payoutStatus === 'Pending'
                                ? 'bg-[#008952] hover:bg-emerald-700 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {rec.payoutStatus === 'Pending' ? 'Bayar Komisi' : 'Batalkan Lunas'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS & DIALOGS
      ========================================================================= */}

      {/* Modal: Tambah & Edit Karyawan */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
            <div className="bg-[#008952] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {editingStaffId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Kelola profil, role jabatan & persentase komisi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs flex-1">
              {/* Nama Lengkap */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap Karyawan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Mas Joko (Senior)"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none"
                />
              </div>

              {/* No WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-semibold text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="staf@bengkelqu.id"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-medium text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Jabatan / Role & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan / Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const newR = e.target.value as StaffRole;
                      setFormRole(newR);
                      if (newR !== 'Mekanik') setFormCommission(0);
                      else setFormCommission(20);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Mekanik">Mekanik</option>
                    <option value="Kasir">Kasir</option>
                    <option value="Admin">Admin</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Karyawan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StaffStatus)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Aktif">Aktif Bekerja</option>
                    <option value="Non-Aktif">Non-Aktif / Cuti</option>
                  </select>
                </div>
              </div>

              {/* Persentase Komisi Jasa Servis (Khusus Mekanik) */}
              {formRole === 'Mekanik' && (
                <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Persentase Komisi Jasa Servis (%)</span>
                    </label>
                    <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                      {formCommission}% dari Biaya Jasa
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formCommission}
                    onChange={(e) => setFormCommission(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-300 focus:border-[#008952] rounded-xl p-2.5 text-slate-900 font-black text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-emerald-800">
                    Nilai komisi dihitung otomatis setiap kali transaksi servis selesai dan dibayarkan di kasir.
                  </p>
                </div>
              )}

              {/* Keahlian & Spesialisasi */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Keahlian Khusus / Spesialisasi
                </label>
                <input
                  type="text"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="Contoh: Spesialis CVT, Servis Injeksi, Reset ECU"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-900 font-medium text-xs focus:outline-none"
                />
              </div>

              {/* Catatan / Alamat */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan domisili, jadwal shift, atau sertifikasi mekanik"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl p-2.5 text-slate-800 font-medium text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStaffId ? 'Simpan Perubahan' : 'Tambahkan Karyawan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Catat Komisi Manual */}
      {isAddManualCommissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-sm sm:text-base">Catat Komisi Jasa Servis</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddManualCommissionOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualCommission} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mekanik Penerima Komisi *</label>
                <select
                  value={manualMechanic}
                  onChange={(e) => {
                    setManualMechanic(e.target.value);
                    const matched = staff.find(s => s.name === e.target.value);
                    if (matched && matched.commissionPercent) {
                      setManualCommissionPercent(matched.commissionPercent);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {staff
                    .filter((s) => s.role === 'Mekanik')
                    .map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} (Rate: {m.commissionPercent}%)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={manualCustomer}
                    onChange={(e) => setManualCustomer(e.target.value)}
                    placeholder="Bpk. Budi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Plat Nomor *</label>
                  <input
                    type="text"
                    required
                    value={manualPlate}
                    onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                    placeholder="D 1234 ABC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold uppercase text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Biaya Jasa (Rp) *</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={manualLaborTotal}
                    onChange={(e) => setManualLaborTotal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rate Komisi (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={manualCommissionPercent}
                    onChange={(e) => setManualCommissionPercent(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Komisi */}
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900">Total Komisi Didapat:</span>
                <span className="text-sm font-black text-[#008952]">
                  Rp {Math.round((manualLaborTotal * manualCommissionPercent) / 100).toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Nota / Keterangan</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Contoh: Servis CVT & Ganti Kampas Rem"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddManualCommissionOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Komisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Print Target untuk Slip Komisi (58mm) */}
      {selectedCommissionForPrint && (
        <div id="pos-thermal-receipt" className="hidden print:block text-slate-900 bg-white p-2 text-xs font-mono">
          <div className="text-center pb-2 border-b border-black">
            <h2 className="font-bold text-sm uppercase">{profile?.workshopName || 'BENGKEL QU'}</h2>
            <p className="text-[10px]">{profile?.address}</p>
            <p className="text-[10px]">SLIP KOMISI TEKNISI</p>
          </div>
          <div className="py-2 text-[10px] space-y-0.5 border-b border-black">
            <p>No. Nota : {selectedCommissionForPrint.invoiceNumber}</p>
            <p>Tanggal  : {selectedCommissionForPrint.date}</p>
            <p>Mekanik  : {selectedCommissionForPrint.mechanicName}</p>
            <p>Unit     : {selectedCommissionForPrint.plateNumber} ({selectedCommissionForPrint.customerName})</p>
          </div>
          <div className="py-2 text-[10px] space-y-1 border-b border-black">
            <div className="flex justify-between">
              <span>Total Jasa Servis</span>
              <span>Rp {selectedCommissionForPrint.serviceLaborTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate Komisi</span>
              <span>{selectedCommissionForPrint.commissionPercent}%</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-black">
              <span>KOMISI DITERIMA</span>
              <span>Rp {selectedCommissionForPrint.commissionAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="pt-4 text-center text-[9px] space-y-4">
            <div className="flex justify-between px-2 pt-2">
              <div>
                <p>Tanda Terima</p>
                <div className="h-8"></div>
                <p>({selectedCommissionForPrint.mechanicName})</p>
              </div>
              <div>
                <p>Kasir / SPV</p>
                <div className="h-8"></div>
                <p>(...................)</p>
              </div>
            </div>
            <p className="italic text-[8px]">Dicetak via Aplikasi Manajemen BengkelQu</p>
          </div>
        </div>
      )}
    </div>
  );
};
