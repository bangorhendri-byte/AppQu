/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Plus, 
  Check, 
  Clock, 
  UserCheck, 
  FileText, 
  Phone, 
  Award,
  Calendar
} from 'lucide-react';
import { 
  Employee, 
  DailyOutputLog, 
  PayrollRecord, 
  ProductRecipe 
} from '../TitipTypes';

interface KaryawanUpahViewProps {
  employees: Employee[];
  outputs: DailyOutputLog[];
  payrolls: PayrollRecord[];
  recipes: ProductRecipe[];
  onAddEmployee: (emp: Employee) => void;
  onAddOutputLog: (log: DailyOutputLog) => void;
  onPayWage: (payroll: PayrollRecord) => void;
}

export const KaryawanUpahView: React.FC<KaryawanUpahViewProps> = ({
  employees,
  outputs,
  payrolls,
  recipes,
  onAddEmployee,
  onAddOutputLog,
  onPayWage
}) => {
  const [subTab, setSubTab] = useState<'karyawan' | 'output' | 'gaji'>('karyawan');

  // Modal Employee
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<Employee['role']>('Produksi');
  const [empWageType, setEmpWageType] = useState<Employee['wageType']>('borongan');
  const [empRate, setEmpRate] = useState(1500);
  const [empPhone, setEmpPhone] = useState('');

  // Modal Output
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [outputCount, setOutputCount] = useState(50);

  // Modal Payroll
  const [selectedEmpForPayroll, setSelectedEmpForPayroll] = useState<Employee | null>(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [deductionAmount, setDeductionAmount] = useState(0);

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      code: `EMP-${(employees.length + 1).toString().padStart(2, '0')}`,
      name: empName.trim(),
      role: empRole,
      wageType: empWageType,
      ratePerUnit: empWageType === 'borongan' ? Number(empRate) : 0,
      dailyRate: empWageType === 'harian' ? Number(empRate) : 0,
      monthlyRate: empWageType === 'bulanan' ? Number(empRate) : 0,
      phone: empPhone.trim() || '-',
      status: 'aktif',
      joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    onAddEmployee(newEmp);
    setIsEmpModalOpen(false);
    setEmpName('');
  };

  const handleSaveOutputLog = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((em) => em.id === selectedEmpId);
    const rcp = recipes.find((r) => r.id === selectedRecipeId);
    if (!emp || !rcp) return;

    const rate = emp.wageType === 'borongan' ? emp.ratePerUnit : rcp.laborCostPerPcs;
    const wageEarned = rate * Number(outputCount);

    const newLog: DailyOutputLog = {
      id: `out-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      employeeId: emp.id,
      employeeName: emp.name,
      recipeId: rcp.id,
      productName: rcp.name,
      outputQty: Number(outputCount),
      wageEarned,
      status: 'pending'
    };

    onAddOutputLog(newLog);
    setIsOutputModalOpen(false);
  };

  const handleConfirmPayroll = () => {
    if (!selectedEmpForPayroll) return;
    const empOutputs = outputs.filter((o) => o.employeeId === selectedEmpForPayroll.id && o.status === 'pending');
    const totalOut = empOutputs.reduce((sum, o) => sum + o.outputQty, 0);
    const baseWage = empOutputs.reduce((sum, o) => sum + o.wageEarned, 0) || (selectedEmpForPayroll.dailyRate * 6) || selectedEmpForPayroll.monthlyRate;
    const net = baseWage + Number(bonusAmount) - Number(deductionAmount);

    const newPayroll: PayrollRecord = {
      id: `pay-${Date.now()}`,
      period: `Minggu Ini (${new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })})`,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      employeeId: selectedEmpForPayroll.id,
      employeeName: selectedEmpForPayroll.name,
      totalOutput: totalOut,
      totalWage: baseWage,
      bonus: Number(bonusAmount),
      deduction: Number(deductionAmount),
      netWage: net,
      status: 'lunas'
    };

    onPayWage(newPayroll);
    setSelectedEmpForPayroll(null);
    setBonusAmount(0);
    setDeductionAmount(0);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('karyawan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'karyawan'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Karyawan ({employees.length})</span>
          </button>

          <button
            onClick={() => setSubTab('output')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'output'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Output Borongan / Pcs ({outputs.length})</span>
          </button>

          <button
            onClick={() => setSubTab('gaji')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'gaji'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Rekap Upah & Slip Gaji</span>
          </button>
        </div>

        {subTab === 'karyawan' && (
          <button
            onClick={() => setIsEmpModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Tambah Karyawan</span>
          </button>
        )}

        {subTab === 'output' && (
          <button
            onClick={() => setIsOutputModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Catat Output Pcs</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Data Karyawan */}
      {subTab === 'karyawan' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {employees.map((emp) => {
                const pendingOutputs = outputs.filter((o) => o.employeeId === emp.id && o.status === 'pending');
                const pendingWage = pendingOutputs.reduce((sum, o) => sum + o.wageEarned, 0);

                return (
                  <div
                    key={emp.id}
                    className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          {emp.code}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {emp.role}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 mb-0.5">
                        {emp.name}
                      </h4>

                      <div className="text-[11px] text-slate-500 mb-2">
                        Sistem: <b className="capitalize text-slate-700">{emp.wageType}</b>
                        {emp.wageType === 'borongan' && ` (Rp ${emp.ratePerUnit.toLocaleString('id-ID')} / Pcs)`}
                        {emp.wageType === 'harian' && ` (Rp ${emp.dailyRate.toLocaleString('id-ID')} / Hari)`}
                        {emp.wageType === 'bulanan' && ` (Rp ${emp.monthlyRate.toLocaleString('id-ID')} / Bulan)`}
                      </div>

                      <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Output Belum Dicairkan:</span>
                          <span className="font-bold text-slate-800">
                            {pendingOutputs.reduce((sum, o) => sum + o.outputQty, 0)} pcs
                          </span>
                        </div>
                        <div className="flex justify-between font-extrabold text-[#C2410C]">
                          <span>Upah Tertampung:</span>
                          <span>Rp {pendingWage.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                      <span className="text-[10px] text-slate-400">Telp: {emp.phone}</span>
                      <button
                        onClick={() => setSelectedEmpForPayroll(emp)}
                        className="px-3 py-1 rounded-lg bg-[#C2410C] hover:bg-orange-800 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Bayar Upah
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Output Borongan / Pcs */}
      {subTab === 'output' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/80 text-amber-950 uppercase text-[10px] font-bold border-b border-amber-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Nama Karyawan</th>
                    <th className="px-4 py-3">Produk Dikerjakan</th>
                    <th className="px-4 py-3 text-center">Output Jadi</th>
                    <th className="px-4 py-3 text-right">Upah Borongan (Rp)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outputs.map((o) => (
                    <tr key={o.id} className="hover:bg-amber-50/40">
                      <td className="px-4 py-3 text-slate-600">{o.date}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{o.employeeName}</td>
                      <td className="px-4 py-3 text-slate-700">{o.productName}</td>
                      <td className="px-4 py-3 text-center font-extrabold text-[#C2410C]">
                        {o.outputQty} Pcs
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700">
                        Rp {o.wageEarned.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'dibayar' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Rekap Upah & Slip Gaji */}
      {subTab === 'gaji' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {payrolls.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-amber-200 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Riwayat Pembayaran Upah</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Klik "Bayar Upah" pada kartu karyawan untuk menerbitkan slip pencairan upah karyawan.
                </p>
              </div>
            ) : (
              payrolls.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{p.employeeName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">• {p.period}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      LUNAS DIBAYAR
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Output</span>
                      <span className="font-bold">{p.totalOutput} Pcs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Upah Dasar</span>
                      <span className="font-bold">Rp {p.totalWage.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Bonus / Tips</span>
                      <span className="font-bold text-emerald-600">+Rp {p.bonus.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Upah Bersih Diterima</span>
                      <span className="font-black text-[#C2410C]">Rp {p.netWage.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Tambah Karyawan */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F59E0B]" />
              Tambah Karyawan / Pengrajin
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Siti Rahma"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Divisi / Tugas:</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Produksi">Produksi / Masak</option>
                    <option value="Finishing">Finishing / Quality</option>
                    <option value="Packaging">Packaging / Seal</option>
                    <option value="Admin & Kurir">Admin & Pengiriman</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Sistem Upah:</label>
                  <select
                    value={empWageType}
                    onChange={(e) => setEmpWageType(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="borongan">Borongan per Pcs</option>
                    <option value="harian">Harian</option>
                    <option value="bulanan">Bulanan Tetap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Nominal Upah (Rp {empWageType === 'borongan' ? 'per pcs' : empWageType === 'harian' ? 'per hari' : 'per bulan'}):
                </label>
                <input
                  type="number"
                  value={empRate}
                  onChange={(e) => setEmpRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">No. HP / WhatsApp:</label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="0812345678"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Input Output Pcs */}
      {isOutputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              Catat Output Borongan Harian
            </h3>

            <form onSubmit={handleSaveOutputLog} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Karyawan:</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {employees.map((em) => (
                    <option key={em.id} value={em.id}>{em.name} ({em.wageType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Produk Dikerjakan:</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {recipes.map((rcp) => (
                    <option key={rcp.id} value={rcp.id}>{rcp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Jumlah Output Jadi (Pcs):</label>
                <input
                  type="number"
                  value={outputCount}
                  onChange={(e) => setOutputCount(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOutputModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Catat Output
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bayar Upah Payroll */}
      {selectedEmpForPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#C2410C]" />
              Pencairan Upah: {selectedEmpForPayroll.name}
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Karyawan: {selectedEmpForPayroll.role} ({selectedEmpForPayroll.wageType})
            </p>

            <div className="space-y-2 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Bonus / Kerajinan (Rp):</label>
                <input
                  type="number"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Potongan Kasbon (Rp):</label>
                <input
                  type="number"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
              <button
                onClick={() => setSelectedEmpForPayroll(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPayroll}
                className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cairkan & Terbitkan Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
