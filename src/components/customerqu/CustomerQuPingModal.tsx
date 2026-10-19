/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQuPingModal - Modal Panggilan Berdering Langsung ke Pedagang [ 🔔 Panggil Ke Sini ]
 * Mengirimkan koordinat presisi pembeli dan memutar sound chime bell bel pintu
 */

import React, { useState } from 'react';
import { X, Bell, MapPin, CheckCircle2, User, Phone, FileText, Sparkles } from 'lucide-react';
import { SellerMarker, BuyerPingAlert } from './CustomerQuTypes';
import { playCustomerPingChime, saveBuyerPing } from './CustomerQuStorage';

interface CustomerQuPingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerMarker;
  userCoords: [number, number];
  onPingSent: (ping: BuyerPingAlert) => void;
}

export const CustomerQuPingModal: React.FC<CustomerQuPingModalProps> = ({
  isOpen,
  onClose,
  seller,
  userCoords,
  onPingSent
}) => {
  const [buyerName, setBuyerName] = useState(() => localStorage.getItem('cq_buyer_name') || 'Warga Sekitar');
  const [buyerPhone, setBuyerPhone] = useState(() => localStorage.getItem('cq_buyer_phone') || '081234567890');
  const [addressNotes, setAddressNotes] = useState(() => localStorage.getItem('cq_buyer_address') || 'Di depan pagar rumah nomor 12');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendPing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) return;

    // Simpan preferensi pembeli untuk penggunaan berikutnya
    localStorage.setItem('cq_buyer_name', buyerName);
    localStorage.setItem('cq_buyer_phone', buyerPhone);
    localStorage.setItem('cq_buyer_address', addressNotes);

    // 1. Putar Suara Bel Chime Dua Nada
    playCustomerPingChime();

    // 2. Buat Data Ping Alert
    const newPing: BuyerPingAlert = {
      id: `ping-${Date.now()}`,
      sellerId: seller.id,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerAddress: addressNotes.trim() || 'Lokasi Terdeteksi GPS',
      coords: userCoords,
      timestamp: Date.now(),
      notes: addressNotes.trim(),
      status: 'active'
    };

    saveBuyerPing(newPing);
    onPingSent(newPing);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Panggil {seller.name}</h3>
              <p className="text-[11px] text-rose-100">Kirim lonceng panggilan presisi ke HP pedagang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#008952] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-base font-black text-slate-900">
              🔔 Lonceng Panggilan Terkirim!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Notifikasi berdering instan telah dikirimkan ke pedagang beserta titik GPS presisi Anda. Mohon tunggu sebentar di lokasi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendPing} className="p-5 space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-rose-800">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Radar Panggilan Otomatis</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                HP pedagang akan berdering dan titik Anda akan muncul sebagai pin panggilan di layar radar <strong>{seller.name}</strong>.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Anda / Pemanggil
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Contoh: Pak Hendra / Bu Rini"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl pl-9 pr-3 py-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nomor HP / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl pl-9 pr-3 py-2.5 font-medium text-slate-800 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Patokan / Alamat Penjemputan
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={addressNotes}
                    onChange={(e) => setAddressNotes(e.target.value)}
                    placeholder="Contoh: Rumah cat biru nomor 12, depan pos satpam..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl pl-9 pr-3 py-2 font-medium text-slate-800 text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                <Bell className="w-4 h-4 fill-white" />
                <span>Bunyikan Bel & Panggil</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
