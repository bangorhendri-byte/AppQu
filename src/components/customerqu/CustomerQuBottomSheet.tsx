/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQuBottomSheet - Mini Katalog & Aksi Cepat Interaksi Pembeli
 * - Detail Profil Pedagang/Toko
 * - Sinkronisasi Stok Live POS (Tersedia / Sisa X / Habis Grayed-Out)
 * - 4 Tombol Interaksi: Panggil Ke Sini, Chat In-App, WhatsApp Direct, Booking Rutin
 */

import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  MessageCircle, 
  Phone, 
  Calendar, 
  MapPin, 
  Star, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  Share2, 
  AlertTriangle,
  Store,
  Clock,
  Sparkles
} from 'lucide-react';
import { SellerMarker, CustomerQuProduct } from './CustomerQuTypes';
import { formatDistanceString } from './CustomerQuStorage';

interface CustomerQuBottomSheetProps {
  seller: SellerMarker;
  distanceMeters: number;
  onClose: () => void;
  onOpenPingModal: () => void;
  onOpenChatModal: () => void;
  onOpenBookingModal: () => void;
  onDirectWhatsApp: () => void;
}

export const CustomerQuBottomSheet: React.FC<CustomerQuBottomSheetProps> = ({
  seller,
  distanceMeters,
  onClose,
  onOpenPingModal,
  onOpenChatModal,
  onOpenBookingModal,
  onDirectWhatsApp
}) => {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'katalog' | 'info'>('katalog');

  const handleUpdateQty = (productId: string, delta: number, maxStock: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      if (next > maxStock) return prev;
      return { ...prev, [productId]: next };
    });
  };

  const totalItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = seller.products.find((p) => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none animate-in slide-in-from-bottom duration-300">
      <div className="w-full max-w-2xl bg-white rounded-t-[32px] shadow-[0_-10px_35px_rgba(0,0,0,0.18)] border-t border-slate-200 pointer-events-auto flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
        
        {/* Handle Bar & Close */}
        <div className="pt-2.5 pb-1 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Profile Pedagang */}
        <div className="p-4 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 shrink-0 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-[#008952] text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                {seller.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#008952] border border-emerald-200">
                    {seller.category}
                  </span>
                  {seller.type === 'keliling' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      🏃 Keliling ({seller.speedKmh || 10} km/j)
                    </span>
                  )}
                  {seller.type === 'ngetem' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      ⏸️ Sedang Mangkal
                    </span>
                  )}
                  {seller.type === 'toko_offline' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      seller.status === 'open' ? 'bg-emerald-100 text-[#008952]' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {seller.status === 'open' ? '🏪 Toko Buka' : 'Toko Tutup'}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-1 truncate">
                  {seller.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-[#008952]">{formatDistanceString(distanceMeters)}</span>
                  <span>• {seller.addressDescription}</span>
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-xl border border-amber-200 text-xs font-black shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{seller.rating}</span>
                <span className="text-[10px] font-medium text-slate-400">({seller.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* 4 TOMBOL AKSI CEPAT INTERAKSI PEMBELI */}
          <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-100">
            {/* 1. Tombol Panggil Ke Sini */}
            <button
              onClick={onOpenPingModal}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold transition-all active:scale-95 shadow-xs cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Bell className="w-4 h-4 fill-white animate-wiggle" />
              </div>
              <span className="text-[10px] mt-1 text-center font-black leading-tight">Panggil Ke Sini</span>
            </button>

            {/* 2. Tombol Chat In-App */}
            <button
              onClick={onOpenChatModal}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-extrabold transition-all active:scale-95 shadow-xs cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-1 text-center font-black leading-tight">Chat In-App</span>
            </button>

            {/* 3. Tombol WhatsApp Direct */}
            <button
              onClick={onDirectWhatsApp}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#008952] font-extrabold transition-all active:scale-95 shadow-xs cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] mt-1 text-center font-black leading-tight">WhatsApp</span>
            </button>

            {/* 4. Tombol Booking / Pesan Rutin */}
            <button
              onClick={onOpenBookingModal}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-extrabold transition-all active:scale-95 shadow-xs cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-1 text-center font-black leading-tight">Booking Rutin</span>
            </button>
          </div>
        </div>

        {/* Tab Header Mini Katalog */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#008952]" />
            <span className="font-extrabold text-slate-800">
              Katalog Menu & Produk ({seller.products.length})
            </span>
            {seller.isLivePOSLinked && (
              <span className="text-[9px] bg-emerald-100 text-[#008952] font-bold px-1.5 py-0.2 rounded-md border border-emerald-200">
                Live POS Sinkron
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Pilih jumlah item</span>
        </div>

        {/* Scrollable Products List with Live Stock Badges */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {seller.products.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            const qtyInCart = cart[product.id] || 0;

            return (
              <div
                key={product.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isOutOfStock
                    ? 'bg-slate-100/70 border-slate-200 opacity-60'
                    : qtyInCart > 0
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-emerald-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-extrabold truncate ${isOutOfStock ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-[#008952]">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400">/ {product.unit}</span>

                    {/* LIVE STOCK INDICATOR REQUIREMENT */}
                    {isOutOfStock ? (
                      <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-2 py-0.2 rounded-full border border-rose-200">
                        Habis
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.2 rounded-full border border-amber-200 animate-pulse">
                        Sisa {product.stock} {product.unit}!
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-[#008952] text-[9px] font-bold px-2 py-0.2 rounded-full border border-emerald-200">
                        Tersedia ({product.stock})
                      </span>
                    )}
                  </div>
                </div>

                {/* Counter Add to Cart */}
                <div className="shrink-0">
                  {isOutOfStock ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed"
                    >
                      Habis
                    </button>
                  ) : qtyInCart > 0 ? (
                    <div className="flex items-center gap-1.5 bg-emerald-100 p-1 rounded-xl border border-emerald-300">
                      <button
                        onClick={() => handleUpdateQty(product.id, -1, product.stock)}
                        className="w-6 h-6 rounded-lg bg-white text-[#008952] font-black flex items-center justify-center shadow-2xs hover:bg-emerald-50 active:scale-90 transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black text-xs text-emerald-950 px-1.5 min-w-[18px] text-center">
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(product.id, 1, product.stock)}
                        className="w-6 h-6 rounded-lg bg-[#008952] text-white font-black flex items-center justify-center shadow-2xs hover:bg-emerald-700 active:scale-90 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateQty(product.id, 1, product.stock)}
                      className="px-3 py-1.5 rounded-xl bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white text-xs font-black shadow-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Cart Bar jika ada item dipilih */}
        {totalItemCount > 0 && (
          <div className="p-3.5 bg-emerald-900 text-white shrink-0 flex items-center justify-between border-t border-emerald-800">
            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-black block">
                {totalItemCount} Item Terpilih
              </span>
              <p className="text-sm font-black text-amber-300">
                Total: Rp {totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPingModal}
                className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 fill-slate-950" />
                <span>Panggil Sekarang</span>
              </button>
              <button
                onClick={onDirectWhatsApp}
                className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 fill-white" />
                <span>Pesan via WA</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
