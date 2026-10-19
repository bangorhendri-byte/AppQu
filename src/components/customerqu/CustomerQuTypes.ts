/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQu Types - Modul Radar Peta Real-Time & Pedagang Keliling Ekosistem UsahaQu
 */

export type SellerType = 'keliling' | 'ngetem' | 'toko_offline';

export type SellerStatus = 'moving' | 'parked' | 'open' | 'closed';

export type BusinessCategory = 
  | 'Kuliner' 
  | 'Sayur & Sembako' 
  | 'Kelontong' 
  | 'Jasa Keliling' 
  | 'Otomotif & Servis'
  | 'Lainnya';

export interface CustomerQuProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  isAvailable: boolean;
  image?: string;
  description?: string;
}

export interface SellerMarker {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  category: BusinessCategory;
  type: SellerType;
  status: SellerStatus;
  coords: [number, number]; // [latitude, longitude]
  avatar: string;
  vehicleType: 'gerobak_motor' | 'gerobak_dorong' | 'sepeda' | 'mobil_pickup' | 'toko_fisik';
  speedKmh?: number;
  heading?: number;
  addressDescription: string;
  rating: number;
  reviewCount: number;
  products: CustomerQuProduct[];
  isLivePOSLinked?: boolean;
  isCurrentMerchant?: boolean;
  lastMovedTimestamp?: number;
}

export interface BuyerPingAlert {
  id: string;
  sellerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  coords: [number, number];
  timestamp: number;
  notes?: string;
  itemsSummary?: string;
  status: 'active' | 'accepted' | 'completed' | 'cancelled';
}

export interface InAppChatMessage {
  id: string;
  conversationId: string;
  sellerId: string;
  senderRole: 'buyer' | 'seller';
  senderName: string;
  text: string;
  timestamp: number;
  expiresAt: number; // Auto-delete after 24h
  read: boolean;
}

export interface BookingOrder {
  id: string;
  sellerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  isRecurringDaily: boolean;
  items: {
    productId: string;
    name: string;
    qty: number;
    price: number;
  }[];
  totalAmount: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: number;
}

export type CustomerQuUserMode = 'buyer' | 'merchant';
