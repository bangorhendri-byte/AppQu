/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQuMap - Leaflet Vector Map Engine
 * Menggunakan Leaflet.js + OpenStreetMap (100% Open Source tanpa biaya berlangganan)
 * Menampilkan 3 jenis visual marker (Bergerak, Ngetem, Toko Offline) + Buyer Pings
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SellerMarker, BuyerPingAlert } from './CustomerQuTypes';

interface CustomerQuMapProps {
  sellers: SellerMarker[];
  selectedSeller: SellerMarker | null;
  onSelectSeller: (seller: SellerMarker) => void;
  userCoords: [number, number];
  buyerPings?: BuyerPingAlert[];
  onSelectPing?: (ping: BuyerPingAlert) => void;
  className?: string;
}

export const CustomerQuMap: React.FC<CustomerQuMapProps> = ({
  sellers,
  selectedSeller,
  onSelectSeller,
  userCoords,
  buyerPings = [],
  onSelectPing,
  className = 'h-full w-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Bersihkan instance lama jika container sudah pernah di-mount
    if ((mapContainerRef.current as any)._leaflet_id) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: userCoords,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Tile Vector OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Zoom control di pojok kanan bawah
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution kecil rapi
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>')
      .addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Trigger resize saat container siap
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // 2. Render Markers & Update Posisi Real-Time
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // A. Marker Lokasi Anda (Pembeli / Pengguna)
    const userHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
        <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px]">
          📍
        </div>
        <div class="absolute -bottom-5 whitespace-nowrap bg-blue-900/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
          Lokasi Anda
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker(userCoords, { icon: userIcon, zIndexOffset: 1000 }).addTo(layer);

    // B. Marker Pedagang (Bergerak, Ngetem & Toko Offline)
    sellers.forEach((seller) => {
      const isSelected = selectedSeller?.id === seller.id;

      let markerColor = '#008952'; // Hijau default
      let statusBadge = '';
      let animationClass = '';

      if (seller.type === 'keliling' && seller.status === 'moving') {
        markerColor = '#0284c7'; // Biru langit gerobak keliling
        statusBadge = `<span class="bg-blue-600 text-white px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider">🏃 KELILING • ${seller.speedKmh || 10} km/j</span>`;
        animationClass = '<span class="absolute -inset-1 rounded-2xl bg-blue-400/40 animate-ping pointer-events-none"></span>';
      } else if (seller.type === 'ngetem' || seller.status === 'parked') {
        markerColor = '#d97706'; // Kuning amber mangkal
        statusBadge = '<span class="bg-amber-600 text-white px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase">⏸️ MANGKAL</span>';
      } else if (seller.type === 'toko_offline') {
        markerColor = seller.status === 'open' ? '#008952' : '#64748b';
        statusBadge = seller.status === 'open' 
          ? '<span class="bg-emerald-600 text-white px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase">🏪 BUKA</span>'
          : '<span class="bg-slate-500 text-white px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase">TUTUP</span>';
      }

      const ringClass = isSelected 
        ? 'ring-4 ring-emerald-400 scale-110 shadow-xl' 
        : 'ring-2 ring-white shadow-md hover:scale-105';

      const sellerHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-300">
          ${animationClass}
          <div class="relative w-10 h-10 rounded-2xl flex items-center justify-center text-lg text-white font-black ${ringClass}" style="background-color: ${markerColor}">
            ${seller.avatar}
            <div class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-slate-200 text-[10px] flex items-center justify-center shadow-xs">
              ${seller.type === 'toko_offline' ? '🏬' : '🏍️'}
            </div>
          </div>
          <div class="mt-1 flex flex-col items-center pointer-events-none">
            <span class="bg-slate-900/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap max-w-[130px] truncate text-center">
              ${seller.name.split(' ')[0]} ${seller.name.split(' ')[1] || ''}
            </span>
            <div class="mt-0.5">
              ${statusBadge}
            </div>
          </div>
        </div>
      `;

      const sellerIcon = L.divIcon({
        html: sellerHtml,
        className: 'custom-seller-marker',
        iconSize: [40, 52],
        iconAnchor: [20, 26]
      });

      const marker = L.marker(seller.coords, { 
        icon: sellerIcon,
        zIndexOffset: isSelected ? 900 : 500 
      }).addTo(layer);

      marker.on('click', () => {
        onSelectSeller(seller);
        map.panTo(seller.coords, { animate: true, duration: 0.5 });
      });
    });

    // C. Marker Panggilan Pembeli (Buyer Pings Alert di Radar)
    buyerPings.forEach((ping) => {
      if (ping.status !== 'active') return;

      const pingHtml = `
        <div class="relative flex flex-col items-center cursor-pointer animate-bounce">
          <span class="absolute w-10 h-10 rounded-full bg-rose-500/30 animate-ping"></span>
          <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
            🔔
          </div>
          <div class="bg-rose-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md whitespace-nowrap mt-1">
            Panggilan ${ping.buyerName}
          </div>
        </div>
      `;

      const pingIcon = L.divIcon({
        html: pingHtml,
        className: 'custom-ping-marker',
        iconSize: [32, 42],
        iconAnchor: [16, 21]
      });

      const pingMarker = L.marker(ping.coords, {
        icon: pingIcon,
        zIndexOffset: 850
      }).addTo(layer);

      pingMarker.on('click', () => {
        if (onSelectPing) onSelectPing(ping);
        map.panTo(ping.coords, { animate: true, duration: 0.5 });
      });
    });

  }, [sellers, selectedSeller, userCoords, buyerPings, onSelectSeller, onSelectPing]);

  // Pan ke target ketika selectedSeller berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSeller) return;
    mapInstanceRef.current.panTo(selectedSeller.coords, { animate: true, duration: 0.5 });
  }, [selectedSeller]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};
