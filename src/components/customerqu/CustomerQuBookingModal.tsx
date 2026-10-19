/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQuBookingModal - Modal Booking & Pesan Mampir Rutin Harian
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, User, Phone, MapPin, Repeat } from 'lucide-react';
import { SellerMarker, BookingOrder } from './CustomerQuTypes';
import { saveBookingOrder } from './CustomerQuStorage';

interface CustomerQuBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerMarker;
}

export const CustomerQuBookingModal: React.FC<CustomerQuBookingModalProps> = ({
  isOpen,
  onClose,
  seller
}) => {
  const [buyerName, setBuyerName] = useState(() => localStorage.getItem('cq_buyer_name') || '');
  const [buyerPhone, setBuyerPhone] = useState(() => localStorage.getItem('cq_buyer_phone') || '');
  const [buyerAddress, setBuyerAddress] = useState(() => localStorage.getItem('cq_buyer_address') || '');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [isRecurringDaily, setIsRecurringDaily] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) return;

    localStorage.setItem('cq_buyer_name', buyerName);
    localStorage.setItem('cq_buyer_phone', buyerPhone);
    localStorage.setItem('cq_buyer_address', buyerAddress);

    const booking: BookingOrder = {
      id: `book-${Date.now()}`,
      sellerId: seller.id,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerAddress: buyerAddress.trim() || 'Alamat Tersimpan',
      scheduledDate,
      scheduledTime,
      isRecurringDaily,
      items: [],
      totalAmount: 0,
      notes: notes.trim(),
      status: 'pending',
      createdAt: Date.now()
    };

    saveBookingOrder(booking);
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
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Booking Mampir Rutin</h3>
              <p className="text-[11px] text-purple-200">Pesan mampir harian ke {seller.name}</p>
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
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-base font-black text-slate-900">
              📅 Jadwal Booking Berhasil Dibuat!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Pedagang telah menerima jadwal mampir Anda pada {scheduledDate} jam {scheduledTime}. Kami akan mengingatkan pedagang saat mendekati jadwal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Mampir</label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Perkiraan Jam</label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Opsi Langganan / Mampir Rutin Setiap Hari */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/70 border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurringDaily}
                onChange={(e) => setIsRecurringDaily(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              />
              <div>
                <span className="font-extrabold text-purple-950 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-purple-700" />
                  <span>Mampir Rutin Harian</span>
                </span>
                <span className="text-[10px] text-purple-700 block">
                  Minta pedagang singgah di depan rumah setiap hari pada jam ini
                </span>
              </div>
            </label>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Pemesan</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Nama Anda..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp</label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alamat / Catatan Menu</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Siapkan 3 porsi tidak pakai pedas ya..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 text-xs focus:outline-none resize-none"
              />
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
                className="bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-purple-700/30 flex items-center gap-2 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Simpan Jadwal Booking</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
