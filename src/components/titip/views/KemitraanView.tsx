/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Handshake, 
  Store, 
  Users, 
  FileText, 
  Plus, 
  Check, 
  Phone, 
  MapPin, 
  Percent, 
  Clock, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  ConsignmentStore, 
  ResellerPartner, 
  PartnershipContract 
} from '../TitipTypes';

interface KemitraanViewProps {
  stores: ConsignmentStore[];
  resellers: ResellerPartner[];
  contracts: PartnershipContract[];
  onAddStore: (store: ConsignmentStore) => void;
  onAddReseller: (reseller: ResellerPartner) => void;
  onAddContract: (contract: PartnershipContract) => void;
}

export const KemitraanView: React.FC<KemitraanViewProps> = ({
  stores,
  resellers,
  contracts,
  onAddStore,
  onAddReseller,
  onAddContract
}) => {
  const [subTab, setSubTab] = useState<'toko' | 'reseller' | 'akad'>('toko');

  // Modal Store
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storePic, setStorePic] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeCommission, setStoreCommission] = useState(20);

  // Modal Reseller
  const [isResellerModalOpen, setIsResellerModalOpen] = useState(false);
  const [resellerName, setResellerName] = useState('');
  const [resellerPhone, setResellerPhone] = useState('');
  const [resellerAddress, setResellerAddress] = useState('');
  const [resellerTier, setResellerTier] = useState<ResellerPartner['tier']>('Silver');
  const [resellerDiscount, setResellerDiscount] = useState(15);
  const [resellerMinOrder, setResellerMinOrder] = useState(10);

  // Modal Contract
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTitle, setContractTitle] = useState('');
  const [contractType, setContractType] = useState<'toko_titip' | 'reseller'>('toko_titip');
  const [contractPartnerName, setContractPartnerName] = useState('');
  const [contractTerms, setContractTerms] = useState('');
  const [contractReturnPolicy, setContractReturnPolicy] = useState('');

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    const newStore: ConsignmentStore = {
      id: `store-${Date.now()}`,
      code: `TKO-${(stores.length + 1).toString().padStart(2, '0')}`,
      name: storeName.trim(),
      picName: storePic.trim() || 'Pemilik Toko',
      phone: storePhone.trim() || '-',
      address: storeAddress.trim() || '-',
      commissionPercent: Number(storeCommission),
      totalStockDeposited: 0,
      totalSoldQty: 0,
      currentBalanceDue: 0,
      contractValidUntil: '2027-12-31',
      status: 'aktif'
    };

    onAddStore(newStore);
    setIsStoreModalOpen(false);
    setStoreName('');
  };

  const handleSaveReseller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellerName.trim()) return;

    const newRes: ResellerPartner = {
      id: `res-${Date.now()}`,
      code: `RSL-${(resellers.length + 1).toString().padStart(2, '0')}`,
      name: resellerName.trim(),
      phone: resellerPhone.trim() || '-',
      address: resellerAddress.trim() || '-',
      tier: resellerTier,
      discountPercent: Number(resellerDiscount),
      minOrderQty: Number(resellerMinOrder),
      totalOrdersCount: 0,
      totalSpent: 0,
      joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'aktif'
    };

    onAddReseller(newRes);
    setIsResellerModalOpen(false);
    setResellerName('');
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractPartnerName.trim()) return;

    const newContract: PartnershipContract = {
      id: `cnt-${Date.now()}`,
      contractNo: `AKAD-${contractType === 'toko_titip' ? 'KONSIN' : 'RESELLER'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      partnerType: contractType,
      partnerName: contractPartnerName.trim(),
      startDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      endDate: '31 Des 2027',
      profitTerms: contractTerms.trim() || 'Bagi hasil sesuai kesepakatan komisi kemitraan resmi.',
      returnPolicy: contractReturnPolicy.trim() || 'Retur dapat dilakukan sebelum tanggal kedaluwarsa.',
      status: 'aktif'
    };

    onAddContract(newContract);
    setIsContractModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBEB]/40 overflow-hidden">
      {/* Sub tabs */}
      <div className="bg-white border-b border-amber-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('toko')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'toko'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Toko Titipan / Galeri ({stores.length})</span>
          </button>

          <button
            onClick={() => setSubTab('reseller')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'reseller'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Jaringan Reseller ({resellers.length})</span>
          </button>

          <button
            onClick={() => setSubTab('akad')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'akad'
                ? 'bg-[#C2410C] text-white shadow-xs'
                : 'text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Akad & MoU Kerjasama ({contracts.length})</span>
          </button>
        </div>

        {subTab === 'toko' && (
          <button
            onClick={() => setIsStoreModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Tambah Toko Titipan</span>
          </button>
        )}

        {subTab === 'reseller' && (
          <button
            onClick={() => setIsResellerModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Daftar Reseller Baru</span>
          </button>
        )}

        {subTab === 'akad' && (
          <button
            onClick={() => setIsContractModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>Buat Akad Baru</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Toko Titipan Konsinyasi */}
      {subTab === 'toko' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {stores.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        {st.code}
                      </span>
                      <span className="text-[10px] font-extrabold bg-[#C2410C] text-white px-2 py-0.5 rounded">
                        Komisi: {st.commissionPercent}%
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mb-0.5">
                      {st.name}
                    </h4>

                    <div className="space-y-1 text-[11px] text-slate-600 my-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">PIC:</span>
                        <span className="font-semibold text-slate-800">{st.picName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{st.phone}</span>
                      </div>
                      <div className="text-slate-500 line-clamp-1">{st.address}</div>
                    </div>

                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Stok di Toko:</span>
                        <span className="font-bold text-slate-800">{st.totalStockDeposited} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Produk Terjual:</span>
                        <span className="font-bold text-emerald-700">{st.totalSoldQty} pcs</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-[#C2410C]">
                        <span>Omzet Belum Cair:</span>
                        <span>Rp {st.currentBalanceDue.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <span className="text-[10px] text-slate-400">Akad s/d {st.contractValidUntil}</span>
                    <a
                      href={`https://wa.me/${st.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      Hubungi WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Jaringan Reseller (Harga Tiering) */}
      {subTab === 'reseller' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {resellers.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        {r.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.tier === 'Distributor' ? 'bg-purple-100 text-purple-800' :
                        r.tier === 'Platinum' ? 'bg-indigo-100 text-indigo-800' :
                        r.tier === 'Gold' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        Tier {r.tier} ({r.discountPercent}% Off)
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mb-0.5">
                      {r.name}
                    </h4>

                    <div className="space-y-1 text-[11px] text-slate-600 my-2">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{r.phone}</span>
                      </div>
                      <div className="text-slate-500 line-clamp-1">{r.address}</div>
                    </div>

                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Min. Order per Transaksi:</span>
                        <span className="font-bold text-slate-800">{r.minOrderQty} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Transaksi:</span>
                        <span className="font-bold text-slate-800">{r.totalOrdersCount} kali</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-[#C2410C]">
                        <span>Akumulasi Belanja:</span>
                        <span>Rp {r.totalSpent.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <span className="text-[10px] text-slate-400">Join: {r.joinDate}</span>
                    <a
                      href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      Chat Reseller
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Akad & MoU Kerjasama */}
      {subTab === 'akad' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {contracts.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#C2410C]">
                      {c.contractNo}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">• {c.partnerName}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    AKAD BERLAKU
                  </span>
                </div>

                <div className="space-y-2 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Klausul Bagi Hasil & Komisi:</span>
                    <p className="text-slate-600 leading-relaxed">{c.profitTerms}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Kebijakan Retur & Kadaluwarsa:</span>
                    <p className="text-slate-600 leading-relaxed">{c.returnPolicy}</p>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Masa Berlaku: {c.startDate} s/d {c.endDate}</span>
                  <span className="font-semibold text-slate-600">Status: Disepakati Bersama</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Tambah Toko Titipan */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#F59E0B]" />
              Tambah Mitra Toko Titipan Konsinyasi
            </h3>

            <form onSubmit={handleSaveStore} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Toko / Galeri:</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Toko Oleh-Oleh Malioboro"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Pemilik / PIC:</label>
                  <input
                    type="text"
                    value={storePic}
                    onChange={(e) => setStorePic(e.target.value)}
                    placeholder="Ibu Ratna"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Persen Komisi (%):</label>
                  <input
                    type="number"
                    value={storeCommission}
                    onChange={(e) => setStoreCommission(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-[#C2410C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">No. WhatsApp / HP Toko:</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="0812345678"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Toko / Lokasi Rak:</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Jl. Malioboro No. 45"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Simpan Toko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Reseller */}
      {isResellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F59E0B]" />
              Daftarkan Reseller Baru
            </h3>

            <form onSubmit={handleSaveReseller} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Reseller / Brand:</label>
                <input
                  type="text"
                  value={resellerName}
                  onChange={(e) => setResellerName(e.target.value)}
                  placeholder="Kak Rere Snack Online"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tier Reseller:</label>
                  <select
                    value={resellerTier}
                    onChange={(e) => setResellerTier(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Silver">Silver (10% Off)</option>
                    <option value="Gold">Gold (15% Off)</option>
                    <option value="Platinum">Platinum (20% Off)</option>
                    <option value="Distributor">Distributor (25% Off)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Diskon Khusus (%):</label>
                  <input
                    type="number"
                    value={resellerDiscount}
                    onChange={(e) => setResellerDiscount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Min. Order (Pcs):</label>
                  <input
                    type="number"
                    value={resellerMinOrder}
                    onChange={(e) => setResellerMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">WhatsApp Reseller:</label>
                  <input
                    type="text"
                    value={resellerPhone}
                    onChange={(e) => setResellerPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Kirim / Wilayah:</label>
                <input
                  type="text"
                  value={resellerAddress}
                  onChange={(e) => setResellerAddress(e.target.value)}
                  placeholder="Kota / Wilayah Pasar"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResellerModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Simpan Reseller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Akad MoU */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F59E0B]" />
              Terbitkan Akad Kerjasama Baru
            </h3>

            <form onSubmit={handleSaveContract} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tipe Mitra:</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as any)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="toko_titip">Toko Titipan Konsinyasi</option>
                  <option value="reseller">Mitra Reseller / Agen</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Mitra:</label>
                <input
                  type="text"
                  value={contractPartnerName}
                  onChange={(e) => setContractPartnerName(e.target.value)}
                  placeholder="Toko Oleh-Oleh / Reseller"
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Klausul Bagi Hasil / Diskon:</label>
                <textarea
                  rows={2}
                  value={contractTerms}
                  onChange={(e) => setContractTerms(e.target.value)}
                  placeholder="Contoh: Komisi 20% bagi hasil toko dari harga jual resmi..."
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Ketentuan Retur & Garansi:</label>
                <textarea
                  rows={2}
                  value={contractReturnPolicy}
                  onChange={(e) => setContractReturnPolicy(e.target.value)}
                  placeholder="Contoh: Barang kadaluwarsa diganti baru sebelum H-14..."
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-orange-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Terbitkan Akad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
