# APPQU: SOLUSI CERDAS MASA KINI
## Production-Ready Mobile Architecture & Implementation Guide
**Brand Slogan:** *"Solusi Cerdas Masa Kini"*  
**Sub-tagline:** *"Menghubungkan warga, menguatkan ekonomi, menjaga keamanan bersama"*  
**Color Palette:** Deep Emerald Green (`#0F5257`), Warm Amber/Orange (`#FB8B24`), Teal Accent (`#2A9D8F`)

---

## 1. CLEAN ARCHITECTURE FOLDER STRUCTURE (Flutter / React Native APK Ready)

Berikut adalah struktur folder berbasis **Clean Architecture** (Feature-driven / Plugin-based) yang modular, memisahkan Klaster Komunitas Warga (`PaguyubanQu` & `SiagaQu`) dengan Klaster Unit Usaha Lokal (`UsahaQu`: KedaiQu, BengkelQu, RitelQu, KlinikQu, CustomerQu).

```
appqu_mobile/
├── android/                          # Native Android Configuration (Capacitor / Flutter)
│   ├── app/src/main/AndroidManifest.xml
│   └── build.gradle
├── ios/                              # Native iOS Configuration
├── lib/                              # Core Source Code (Clean Architecture)
│   ├── main.dart                     # App Entry Point & Dependency Injection Setup
│   │
│   ├── core/                         # Shared Core Foundations
│   │   ├── constants/
│   │   │   ├── app_colors.dart       # Deep Emerald #0F5257, Amber #FB8B24, Teal #2A9D8F
│   │   │   └── api_endpoints.dart
│   │   ├── network/
│   │   │   ├── dio_client.dart       # HTTP / REST Client
│   │   │   └── websocket_service.dart# Real-time Panic & P2P Alert Socket
│   │   ├── services/
│   │   │   ├── audio_siren_service.dart # Web Audio / Native Audio Siren Synthesizer
│   │   │   ├── ocr_vision_service.dart  # ML Kit / Tesseract OCR Receipt Scanner
│   │   │   ├── fcm_notification_service.dart # Override Silent Push Notifications
│   │   │   └── rtsp_cctv_player.dart    # VLC / IJKPlayer RTSP Stream Decoder
│   │   └── theme/
│   │       └── app_theme.dart
│   │
│   ├── features/                     # Feature Modules (Modular Plugins)
│   │   │
│   │   ├── auth_rbac/                # Multi-Role Access Control (RBAC)
│   │   │   ├── data/                 # Repositories & DTOs
│   │   │   ├── domain/               # Entities: User, WargaProfile, KomunitasRole
│   │   │   └── presentation/
│   │   │       ├── bloc/             # RoleSwitchBloc (Warga <-> Pengurus <-> Owner)
│   │   │       └── screens/          # LoginScreen, RoleSwitcherBottomSheet
│   │   │
│   │   ├── paguyubanqu/              # Klaster Komunitas: Sosial, Kas & Tata Kelola
│   │   │   ├── domain/               # FeedItem, KasLedger, SuratPengantar
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── feed_bloc.dart
│   │   │       │   ├── kas_ocr_bloc.dart
│   │   │       │   └── surat_workflow_bloc.dart
│   │   │       ├── screens/          # PaguyubanHomeScreen, SuratPengantarScreen
│   │   │       └── widgets/          # LapakWargaCard, OcrReceiptScannerModal
│   │   │
│   │   ├── siagaqu/                  # Klaster Komunitas: Smart Keamanan & Gotong Royong
│   │   │   ├── domain/               # EmergencyAlert, RondaCheckpoint, TanggapDuka
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── panic_button_bloc.dart
│   │   │       │   ├── qr_ronda_bloc.dart
│   │   │       │   └── solidarity_duka_bloc.dart
│   │   │       ├── screens/          # SiagaQuDashboardScreen, CctvRtspViewScreen
│   │   │       └── widgets/          # MassivePanicButton, QrScannerViewfinder
│   │   │
│   │   └── usahaqu_modular/          # Klaster Unit Usaha Lokal (Plugins)
│   │       ├── core_pos/             # Shared POS Kasir Engine & Barcode Scanner
│   │       ├── kedaiqu/              # Plugin Kuliner: Meja, KDS Dapur, Menu F&B
│   │       ├── bengkelqu/            # Plugin Otomotif: Antrian Servis, Suku Cadang
│   │       ├── ritelqu/              # Plugin Toko: Sembako, Barcode, Grosir/Eceran
│   │       ├── klinikqu/             # Plugin Medis: Pasien, Rekam Medis, Apotek
│   │       └── customerqu/           # Plugin CRM: Peta Radar Keliling (Leaflet/OSM)
│   │
│   └── shared_database/              # Local Offline-First Storage (Isar / SQLite / Drift)
│       └── appqu_local_db.dart
└── pubspec.yaml                      # Dependencies
```

---

## 2. STATE MANAGEMENT CODE (BLOC PATTERN): MULTI-ROLE RBAC SWITCHING

```dart
// role_switch_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

enum KomunitasRole {
  warga,
  ketuaRt,
  wakilRt,
  bendahara,
  sekretaris,
  satpamRonda,
  pelakuUsaha,
  governancePemda
}

abstract class RoleSwitchEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class ChangeActiveRole extends RoleSwitchEvent {
  final KomunitasRole newRole;
  ChangeActiveRole(this.newRole);

  @override
  List<Object?> get props => [newRole];
}

class RoleSwitchState extends Equatable {
  final KomunitasRole currentRole;
  final String userName;
  final String nikMasked;
  final String rtRw;
  final List<KomunitasRole> availableRoles;

  const RoleSwitchState({
    required this.currentRole,
    required this.userName,
    required this.nikMasked,
    required this.rtRw,
    required this.availableRoles,
  });

  bool get canApproveLetters => 
      currentRole == KomunitasRole.ketuaRt || 
      currentRole == KomunitasRole.wakilRt || 
      currentRole == KomunitasRole.sekretaris;

  bool get canManageKasAndOcr => 
      currentRole == KomunitasRole.bendahara || 
      currentRole == KomunitasRole.ketuaRt;

  bool get canScanRondaQr => 
      currentRole == KomunitasRole.satpamRonda || 
      currentRole == KomunitasRole.ketuaRt;

  bool get canPublishLapakUsahaQu => 
      currentRole == KomunitasRole.pelakuUsaha;

  bool get isGovernanceViewOnly => 
      currentRole == KomunitasRole.governancePemda;

  RoleSwitchState copyWith({KomunitasRole? newRole}) {
    return RoleSwitchState(
      currentRole: newRole ?? this.currentRole,
      userName: this.userName,
      nikMasked: this.nikMasked,
      rtRw: this.rtRw,
      availableRoles: this.availableRoles,
    );
  }

  @override
  List<Object?> get props => [currentRole, userName, nikMasked, rtRw, availableRoles];
}

class RoleSwitchBloc extends Bloc<RoleSwitchEvent, RoleSwitchState> {
  RoleSwitchBloc() : super(const RoleSwitchState(
    currentRole: KomunitasRole.warga,
    userName: 'Bpk. Ahmad Fauzi',
    nikMasked: '3273********0001',
    rtRw: 'RT 001 / RW 005',
    availableRoles: [
      KomunitasRole.warga,
      KomunitasRole.ketuaRt,
      KomunitasRole.bendahara,
      KomunitasRole.sekretaris,
      KomunitasRole.satpamRonda,
      KomunitasRole.pelakuUsaha,
      KomunitasRole.governancePemda,
    ],
  )) {
    on<ChangeActiveRole>((event, emit) {
      emit(state.copyWith(newRole: event.newRole));
    });
  }
}
```

---

## 3. PANIC BUTTON SERVICE (AUDIO SIRENE, SILENT OVERRIDE & RTSP STREAM)

```dart
// panic_button_service.dart
import 'dart:async';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:just_audio/just_audio.dart';

class PanicButtonService {
  final AudioPlayer _sirenPlayer = AudioPlayer();
  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  WebSocketChannel? _socketChannel;

  Future<void> initialize() async {
    // 1. Inisialisasi High-Priority Alarm Notification Channel (Override Silent Mode)
    const AndroidNotificationChannel alertChannel = AndroidNotificationChannel(
      'siagaqu_emergency_channel',
      'SiagaQu Panic Alert Override Silent',
      description: 'Alarm darurat kemalingan, kebakaran dan medis warga',
      importance: Importance.max,
      playSound: true,
      sound: RawResourceAndroidNotificationSound('emergency_siren'),
      enableVibration: true,
    );

    final AndroidFlutterLocalNotificationsPlugin? androidPlugin = 
        _notifications.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(alertChannel);

    // 2. Hubungkan ke WebSocket Server RT Siaga
    _socketChannel = WebSocketChannel.connect(
      Uri.parse('wss://api.appqu.id/v1/siaga/emergency-stream'),
    );
  }

  // Memicu Alarm Bahaya dari HP Warga
  Future<void> triggerPanicAlert({
    required String emergencyType, // 'KEMALINGAN' | 'KEBAKARAN' | 'MEDIS'
    required double latitude,
    required double longitude,
    required String alamatWarga,
  }) async {
    // 1. Mainkan sirene audio lokal
    try {
      await _sirenPlayer.setAsset('assets/audio/siren_alarm.mp3');
      await _sirenPlayer.setLoopMode(LoopMode.one);
      await _sirenPlayer.setVolume(1.0);
      _sirenPlayer.play();
    } catch (_) {}

    // 2. Broadcast via WebSocket ke seluruh HP Satpam & Pengurus RT
    final payload = {
      'action': 'BROADCAST_PANIC',
      'type': emergencyType,
      'coords': {'lat': latitude, 'lng': longitude},
      'address': alamatWarga,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'cctv_rtsp': 'rtsp://portal-utara.rt01.sukamaju.id/live/stream1',
    };
    _socketChannel?.sink.add(payload);

    // 3. Tampilkan Notifikasi Override Silent Mode
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'siagaqu_emergency_channel',
      'SiagaQu Panic Alert',
      importance: Importance.max,
      priority: Priority.high,
      fullScreenIntent: true,
      category: AndroidNotificationCategory.alarm,
    );
    await _notifications.show(
      999,
      '⚠️ SIAGA 1: $emergencyType TERDETEKSI!',
      'Lokasi: $alamatWarga. Buka AppQu untuk pantau CCTV terdekat!',
      const NotificationDetails(android: androidDetails),
    );
  }

  Future<void> stopPanicAlert() async {
    await _sirenPlayer.stop();
  }
}
```

---

## 4. SMART RONDA QR CHECKPOINT SCANNER + AUDIT LOGGER

```dart
// qr_ronda_scanner.dart
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter/material.dart';

class SmartRondaScannerScreen extends StatelessWidget {
  final Function(String checkpointToken) onCheckpointVerified;

  const SmartRondaScannerScreen({Key? key, required this.onCheckpointVerified}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Ronda QR Checkpoint'),
        backgroundColor: const Color(0xFF0F5257),
      ),
      body: MobileScanner(
        onDetect: (capture) {
          final List<Barcode> barcodes = capture.barcodes;
          for (final barcode in barcodes) {
            final String? token = barcode.rawValue;
            if (token != null && token.startsWith('RONDA-RT01-')) {
              // Validasi Checkpoint Token Terdaftar
              onCheckpointVerified(token);
              Navigator.pop(context);
              break;
            }
          }
        },
      ),
    );
  }
}
```

---

## 5. SEAMLESS INTEGRATION: USAHAQU PRODUCTS -> LAPAK PAGUYUBANQU

Setiap produk yang diinput atau diperbarui di modul Kasir POS UsahaQu (BengkelQu, KedaiQu, RitelQu) secara otomatis memicu event sinkronisasi yang menerbitkan produk ke **Katalog Lapak Warga**:

```typescript
// usahaquToPaguyubanSync.ts
export function syncUsahaQuProductToLapak(product: {
  businessName: string;
  productName: string;
  price: number;
  category: 'bengkel' | 'kedai' | 'ritel' | 'klinik';
  phone: string;
}) {
  const currentFeeds = JSON.parse(localStorage.getItem('appqu_paguyuban_feeds') || '[]');
  const lapakPost = {
    id: `lapak-${Date.now()}`,
    authorName: product.businessName,
    authorRoleBadge: 'Lapak UsahaQu',
    authorAvatar: product.category === 'kedai' ? '🍜' : product.category === 'ritel' ? '🛒' : '🏍️',
    type: 'LAPAK_PROMO',
    title: `🏪 ${product.productName} dari ${product.businessName}`,
    content: `Tetangga warga RT 01! Produk segar & jasa terbaik tersedia di ${product.businessName}. Siap pesan online langsung via AppQu!`,
    timestamp: 'Baru saja',
    likeCount: 0,
    commentCount: 0,
    lapakProduct: product
  };
  localStorage.setItem('appqu_paguyuban_feeds', JSON.stringify([lapakPost, ...currentFeeds]));
}
```
