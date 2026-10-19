/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQuView - Layanan Peta Radar Real-Time & Pedagang Keliling
 * Modul Multi-Role (Mode Pembeli / Guest & Mode Pedagang / Mitra)
 * Terintegrasi penuh dengan Leaflet Vector Map + OpenStreetMap
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  Filter, 
  Bell, 
  MessageCircle, 
  Compass, 
  Store, 
  Navigation, 
  Sparkles, 
  Play, 
  Square, 
  CheckCircle2, 
  Layers, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw,
  Phone,
  X
} from 'lucide-react';
import { 
  SellerMarker, 
  CustomerQuUserMode, 
  BusinessCategory, 
  BuyerPingAlert 
} from './CustomerQuTypes';
import { 
  DEFAULT_MAP_CENTER, 
  getSavedSellers, 
  saveSellers, 
  simulateSellersMovement, 
  getSavedBuyerPings, 
  updateBuyerPingStatus,
  calculateDistanceMeters,
  formatDistanceString,
  playCustomerPingChime
} from './CustomerQuStorage';
import { CustomerQuMap } from './CustomerQuMap';
import { CustomerQuBottomSheet } from './CustomerQuBottomSheet';
import { CustomerQuPingModal } from './CustomerQuPingModal';
import { CustomerQuChatModal } from './CustomerQuChatModal';
import { CustomerQuBookingModal } from './CustomerQuBookingModal';

interface CustomerQuViewProps {
  onBack: () => void;
  onOpenCashierPOS?: () => void;
  onOpenModuleDrawer?: () => void;
  initialMode?: CustomerQuUserMode;
}

export const CustomerQuView: React.FC<CustomerQuViewProps> = ({
  onBack,
  onOpenCashierPOS,
  onOpenModuleDrawer,
  initialMode = 'buyer'
}) => {
  // Multi-role state: Mode Pembeli (Guest) vs Mode Pedagang (Mitra)
  const [userMode, setUserMode] = useState<CustomerQuUserMode>(initialMode);

  // Data Sellers & Pings
  const [sellers, setSellers] = useState<SellerMarker[]>(() => getSavedSellers());
  const [buyerPings, setBuyerPings] = useState<BuyerPingAlert[]>(() => getSavedBuyerPings());
  const [selectedSeller, setSelectedSeller] = useState<SellerMarker | null>(null);

  // User Coords (Default Bandung, auto update with GPS if available)
  const [userCoords, setUserCoords] = useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [userLocationName, setUserLocationName] = useState('Bandung Kota (GPS Aktif)');

  // Filter Category & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'keliling' | 'mangkal' | 'toko'>('semua');

  // Modals State
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activePingDetail, setActivePingDetail] = useState<BuyerPingAlert | null>(null);

  // Merchant Mode State (Status Operasional Pedagang)
  const [merchantStatus, setMerchantStatus] = useState<'moving' | 'parked' | 'open' | 'closed'>('moving');
  const [isGpsTrackingActive, setIsGpsTrackingActive] = useState(true);

  // 1. Dapatkan Lokasi Nyata Browser Pengguna (GPS)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);
          setUserLocationName('Lokasi Presisi GPS Anda');
        },
        (err) => {
          console.warn('[GPS] Menggunakan koordinat pusat simulasi:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // 2. SIMULASI RADAR GERAKAN PEDAGANG KELILING (Setiap 20 Detik)
  useEffect(() => {
    if (!isGpsTrackingActive) return;

    const interval = setInterval(() => {
      setSellers((prev) => {
        const moved = simulateSellersMovement(prev);
        saveSellers(moved);
        return moved;
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [isGpsTrackingActive]);

  // Sync state if selectedSeller coordinates change
  useEffect(() => {
    if (selectedSeller) {
      const refreshed = sellers.find((s) => s.id === selectedSeller.id);
      if (refreshed) {
        setSelectedSeller(refreshed);
      }
    }
  }, [sellers]);

  // 3. Filter Sellers berdasarkan kategori, tipe & query
  const filteredSellers = sellers.filter((seller) => {
    if (selectedCategory !== 'Semua' && seller.category !== selectedCategory) {
      return false;
    }
    if (statusFilter === 'keliling' && seller.type !== 'keliling') return false;
    if (statusFilter === 'mangkal' && seller.type !== 'ngetem') return false;
    if (statusFilter === 'toko' && seller.type !== 'toko_offline') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = seller.name.toLowerCase().includes(q);
      const matchProd = seller.products.some((p) => p.name.toLowerCase().includes(q));
      return matchName || matchProd;
    }
    return true;
  });

  // Hitung jarak seller terpilih dari pengguna
  const selectedDistance = selectedSeller 
    ? calculateDistanceMeters(userCoords, selectedSeller.coords)
    : 0;

  // Handler Panggilan Baru
  const handlePingSent = (newPing: BuyerPingAlert) => {
    setBuyerPings((prev) => [newPing, ...prev]);
  };

  // Handler Pedagang Terima Panggilan
  const handleAcceptPing = (pingId: string) => {
    const updated = updateBuyerPingStatus(pingId, 'accepted');
    setBuyerPings(updated);
    playCustomerPingChime();
    alert('Panggilan Diterima! Rute navigasi menuju lokasi pemanggil telah diaktifkan.');
  };

  // Direct WA Shortcut
  const handleDirectWhatsApp = () => {
    if (!selectedSeller) return;
    const cleanPhone = selectedSeller.phone.replace(/^0/, '62');
    const msg = `Halo ${selectedSeller.name}, saya memantau lokasi Anda via CustomerQu Peta Radar. Apakah saat ini bisa pesan / mampir ke lokasi saya?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const activePingsCount = buyerPings.filter((p) => p.status === 'active').length;

  return (
    <div className="flex-1 bg-slate-900 flex flex-col h-full min-h-0 relative overflow-hidden select-none">
      
      {/* 1. TOP FLOATING CONTROL BAR (Mode Switcher, Search & Filters) */}
      <div className="absolute top-2 inset-x-2 sm:inset-x-4 z-40 space-y-2 pointer-events-none">
        
        {/* Row 1: Back Button, Mode Switcher Pill & Panggilan Lonceng Alert */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-9 h-9 rounded-2xl bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Multi-role Switch: Mode Pembeli vs Mode Pedagang */}
            <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setUserMode('buyer')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  userMode === 'buyer'
                    ? 'bg-[#008952] text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🛒 Mode Pembeli</span>
              </button>
              <button
                type="button"
                onClick={() => setUserMode('merchant')}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  userMode === 'merchant'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>👨‍🍳 Mode Pedagang</span>
              </button>
            </div>
          </div>

          {/* Quick-Switch Kembali ke Kasir POS */}
          <div className="flex items-center gap-1.5">
            {onOpenCashierPOS && (
              <button
                onClick={onOpenCashierPOS}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-3 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kasir POS</span>
              </button>
            )}

            {/* Indicator Panggilan Pembeli Aktif */}
            {activePingsCount > 0 && (
              <button
                onClick={() => {
                  const first = buyerPings.find((p) => p.status === 'active');
                  if (first) setActivePingDetail(first);
                }}
                className="relative bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-2.5 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 cursor-pointer animate-bounce"
              >
                <Bell className="w-3.5 h-3.5 fill-white" />
                <span className="w-4 h-4 rounded-full bg-white text-rose-700 text-[10px] flex items-center justify-center font-black">
                  {activePingsCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Search Bar & Kategori */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-2 pointer-events-auto space-y-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-700 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bakso, sayur, tambal ban, toko offline..."
              className="w-full bg-slate-100 border-0 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008952]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips Scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {['Semua', 'Kuliner', 'Sayur & Sembako', 'Jasa Keliling', 'Otomotif & Servis', 'Kelontong'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-2.5 py-1 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#008952] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat === 'Kuliner' && '🍜 '}
                {cat === 'Sayur & Sembako' && '🥬 '}
                {cat === 'Jasa Keliling' && '🛠️ '}
                {cat === 'Otomotif & Servis' && '🏍️ '}
                {cat === 'Kelontong' && '🏪 '}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MERCHANT CONTROL STRIP (Hanya Tampil saat Mode Pedagang Aktif) */}
        {userMode === 'merchant' && (
          <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-amber-400/50 shadow-2xl pointer-events-auto text-white space-y-2 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  Panel Pedagang & Mitra Keliling
                </span>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                GPS Siaran LIVE
              </span>
            </div>

            {/* Status Operasional Toggle */}
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMerchantStatus('moving');
                  setIsGpsTrackingActive(true);
                }}
                className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  merchantStatus === 'moving' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Mulai Keliling</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMerchantStatus('parked');
                }}
                className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  merchantStatus === 'parked' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Square className="w-3 h-3" />
                <span>Ngetem / Mangkal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('toko');
                }}
                className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Cari Toko Offline untuk Kulakan Bahan Baku"
              >
                <Store className="w-3 h-3" />
                <span>Kulakan Bahan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. LEAFLET VECTOR MAP ENGINE */}
      <div className="flex-1 w-full h-full relative">
        <CustomerQuMap
          sellers={filteredSellers}
          selectedSeller={selectedSeller}
          onSelectSeller={(seller) => setSelectedSeller(seller)}
          userCoords={userCoords}
          buyerPings={buyerPings}
          onSelectPing={(ping) => setActivePingDetail(ping)}
          className="h-full w-full"
        />

        {/* GPS Center Control Button */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setUserCoords([pos.coords.latitude, pos.coords.longitude]);
              });
            }
          }}
          aria-label="Pusatkan Lokasi Saya"
          className="absolute bottom-6 right-4 z-30 w-11 h-11 rounded-2xl bg-white shadow-xl text-slate-700 hover:text-[#008952] border border-slate-200 flex items-center justify-center cursor-pointer active:scale-95 transition"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Floating Counter Badge di Peta */}
        <div className="absolute bottom-6 left-4 z-30 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{filteredSellers.length} Pedagang Terdeteksi di Radar</span>
        </div>
      </div>

      {/* 3. BOTTOM SHEET DETAIL & MINI KATALOG */}
      {selectedSeller && (
        <CustomerQuBottomSheet
          seller={selectedSeller}
          distanceMeters={selectedDistance}
          onClose={() => setSelectedSeller(null)}
          onOpenPingModal={() => setIsPingModalOpen(true)}
          onOpenChatModal={() => setIsChatModalOpen(true)}
          onOpenBookingModal={() => setIsBookingModalOpen(true)}
          onDirectWhatsApp={handleDirectWhatsApp}
        />
      )}

      {/* 4. MODALS INTERAKSI PEMBELI */}
      {selectedSeller && (
        <>
          <CustomerQuPingModal
            isOpen={isPingModalOpen}
            onClose={() => setIsPingModalOpen(false)}
            seller={selectedSeller}
            userCoords={userCoords}
            onPingSent={handlePingSent}
          />

          <CustomerQuChatModal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            seller={selectedSeller}
            currentUserRole={userMode === 'buyer' ? 'buyer' : 'seller'}
          />

          <CustomerQuBookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            seller={selectedSeller}
          />
        </>
      )}

      {/* 5. MODAL DETAIL PING PEMBELI (Untuk Pedagang Melihat Titik Panggilan Masuk) */}
      {activePingDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                <Bell className="w-5 h-5 fill-rose-600 animate-bounce" />
                <span>Panggilan Pembeli Masuk!</span>
              </div>
              <button
                onClick={() => setActivePingDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-xs space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Nama Pemanggil</span>
                <span className="font-extrabold text-slate-900 text-sm">{activePingDetail.buyerName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Nomor HP</span>
                <span className="font-bold text-slate-800">{activePingDetail.buyerPhone}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Patokan Alamat</span>
                <span className="font-bold text-slate-900">{activePingDetail.buyerAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  const clean = activePingDetail.buyerPhone.replace(/^0/, '62');
                  window.open(`https://wa.me/${clean}?text=${encodeURIComponent('Halo, panggilan CustomerQu Anda telah saya terima, saya sedang menuju ke lokasi!')}`, '_blank');
                }}
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Phone className="w-3.5 h-3.5 fill-white" />
                <span>Hubungi WA</span>
              </button>

              <button
                onClick={() => {
                  handleAcceptPing(activePingDetail.id);
                  setActivePingDetail(null);
                }}
                className="flex-1 bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terima & Meluncur</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
