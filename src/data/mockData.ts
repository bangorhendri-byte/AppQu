import { 
  MenuModuleConfig, 
  ServiceQueue, 
  Sparepart, 
  Transaction, 
  Mechanic, 
  CustomerVehicle, 
  NotificationItem, 
  DamagedGood, 
  ProcurementRecord,
  MarketingCampaign,
  PromoVoucher,
  StaffMember,
  MechanicCommissionRecord,
  RolePermissionConfig
} from '../types';

export const MENU_MODULES: MenuModuleConfig[] = [
  {
    id: 'servis',
    title: 'Servis',
    subtitle: 'Manajemen Bengkel',
    iconName: 'Wrench',
    badgeCount: '4 Aktif',
    badgeColor: 'bg-emerald-500',
    description: 'Penerimaan unit, antrian servis, pengerjaan teknisi, dan serah terima kendaraan.',
    subMenus: [
      {
        id: 'registrasi',
        title: 'Registrasi',
        subtitle: 'Input Pendaftaran Unit Baru',
        iconName: 'ClipboardEdit',
        badge: 'Form Baru',
        targetView: 'service-register'
      },
      {
        id: 'antrian',
        title: 'Antrian',
        subtitle: 'Daftar Menunggu Servis',
        iconName: 'ListOrdered',
        badge: 'Menunggu',
        targetView: 'service-queue'
      },
      {
        id: 'proses-servis',
        title: 'Proses Servis',
        subtitle: 'Pengerjaan & Pergantian Part',
        iconName: 'Cog',
        badge: 'Dikerjakan',
        targetView: 'service-progress'
      },
      {
        id: 'selesai-servis',
        title: 'Selesai Servis',
        subtitle: 'Unit Selesai & Cetak Nota / WA',
        iconName: 'CheckCircle2',
        badge: 'Selesai',
        targetView: 'service-completed'
      },
      {
        id: 'total-servis',
        title: 'Total Servis',
        subtitle: 'Rekap Semua Servis Hari Ini',
        iconName: 'Layers',
        badge: 'Harian',
        targetView: 'service-total'
      }
    ]
  },
  {
    id: 'kasir',
    title: 'Kasir',
    subtitle: 'POS & Pembayaran',
    iconName: 'Receipt',
    badgeCount: 'Rp 2.45 Jt',
    badgeColor: 'bg-emerald-600',
    description: 'Pencatatan transaksi pembayaran jasa dan suku cadang dengan cetak struk cetak nota.',
    subMenus: [
      {
        id: 'pos-core',
        title: 'Kasir POS Offline',
        subtitle: 'Katalog, Checkout & Struk',
        iconName: 'ShoppingCart',
        badge: '100% Offline',
        targetView: 'pos-core'
      },
      {
        id: 'kasir',
        title: 'Kasir Servis',
        subtitle: 'Pembayaran Servis & Antrian',
        iconName: 'CreditCard',
        badge: 'Bayar',
        targetView: 'pos-checkout'
      },
      {
        id: 'piutang',
        title: 'Piutang',
        subtitle: 'Tagihan Servis Belum Lunas',
        iconName: 'Clock',
        badge: 'Tempo',
        targetView: 'pos-receivable'
      },
      {
        id: 'riwayat-transaksi',
        title: 'Riwayat Transaksi',
        subtitle: 'Log Riwayat Semua Nota',
        iconName: 'FileText',
        badge: 'Riwayat',
        targetView: 'pos-history'
      },
      {
        id: 'petty-cash',
        title: 'Petty Cash',
        subtitle: 'Modal & Uang Kembalian',
        iconName: 'Coins',
        badge: 'Modal',
        targetView: 'pos-pettycash'
      },
      {
        id: 'kas-kecil',
        title: 'Kas Kecil',
        subtitle: 'Biaya Operasional Harian',
        iconName: 'Receipt',
        badge: 'Biaya',
        targetView: 'pos-expenses'
      },
      {
        id: 'closingan',
        title: 'Closingan',
        subtitle: 'Tutup Shift & Rekonsiliasi',
        iconName: 'Calculator',
        badge: 'Tutup Buku',
        targetView: 'pos-closing'
      }
    ]
  },
  {
    id: 'inventaris',
    title: 'Inventaris',
    subtitle: 'Suku Cadang & Stok',
    iconName: 'Package',
    badgeCount: '3 Kritis',
    badgeColor: 'bg-amber-500',
    description: 'Pusat tata kelola logistik masuk, katalog suku cadang, stok kritis, pelaporan barang rusak, dan log pengadaan.',
    subMenus: [
      {
        id: 'sparepart-datang',
        title: 'Sparepart Datang (Inbound)',
        subtitle: 'Sparepart Baru / Tambah Qty / Scan Masuk',
        iconName: 'PlusCircle',
        badge: 'Inbound',
        targetView: 'inv-inbound'
      },
      {
        id: 'katalog-sparepart',
        title: 'Katalog Sparepart (Master)',
        subtitle: 'Daftar Seluruh Suku Cadang & Ketersediaan',
        iconName: 'Boxes',
        targetView: 'inv-catalog'
      },
      {
        id: 'stok-kritis',
        title: 'Stok Kritis',
        subtitle: 'Monitoring Part di Bawah Batas Minimum',
        iconName: 'AlertTriangle',
        badge: 'Kritis',
        targetView: 'inv-critical'
      },
      {
        id: 'barang-rusak',
        title: 'Barang Rusak',
        subtitle: 'Form Pengajuan & Log Barang Rusak / Cacat',
        iconName: 'PackageX',
        targetView: 'inv-damaged'
      },
      {
        id: 'riwayat-pengadaan',
        title: 'Riwayat Pengadaan',
        subtitle: 'Log Pembelian & Penerimaan dari Suplier',
        iconName: 'Truck',
        targetView: 'inv-procurement'
      }
    ]
  },
  {
    id: 'pelanggan',
    title: 'Pelanggan',
    subtitle: 'Data Motor & Pemilik',
    iconName: 'Users',
    badgeCount: '128 Unit',
    badgeColor: 'bg-emerald-500',
    description: 'Pusat master identitas pelanggan, keterhubungan data kendaraan bermotor, dan riwayat servis per unit.',
    subMenus: [
      {
        id: 'daftar-pelanggan',
        title: 'Daftar Pelanggan (Master)',
        subtitle: 'Nama, Nomor Telepon/WhatsApp & Alamat',
        iconName: 'UserCheck',
        targetView: 'cust-master'
      },
      {
        id: 'kendaraan-pelanggan',
        title: 'Kendaraan Pelanggan',
        subtitle: 'Profil Kendaraan, Merk, Tipe & Plat Nomor',
        iconName: 'BellRing',
        targetView: 'cust-vehicles'
      },
      {
        id: 'riwayat-servis-pelanggan',
        title: 'Riwayat Servis Pelanggan',
        subtitle: 'Card Detail & Log Perawatan Tiap Kendaraan',
        iconName: 'Award',
        targetView: 'cust-history'
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    subtitle: 'Promosi & Diskon',
    iconName: 'Megaphone',
    badgeCount: '2 Promo',
    badgeColor: 'bg-emerald-500',
    description: 'Kampanye promosi bengkel, formulir pengiriman broadcast WhatsApp, manajemen voucher diskon, dan log pesan.',
    subMenus: [
      {
        id: 'toko-online',
        title: 'Toko Online & QR Code',
        subtitle: 'Katalog Digital Publik & Cetak Standee Meja',
        iconName: 'Store',
        badge: 'Katalog',
        targetView: 'mkt-store'
      },
      {
        id: 'broadcast-wa',
        title: 'Broadcast WhatsApp',
        subtitle: 'Form Draf & Kirim Pesan Promo / Reminder',
        iconName: 'Send',
        targetView: 'mkt-broadcast'
      },
      {
        id: 'promo-diskon',
        title: 'Promo & Diskon',
        subtitle: 'Kelola Voucher Diskon & Potongan Servis',
        iconName: 'Tag',
        badge: 'Aktif',
        targetView: 'mkt-promo'
      },
      {
        id: 'riwayat-pesan',
        title: 'Riwayat Pesan / Campaign',
        subtitle: 'Log Kampanye Pesan & Pengiriman Promosi',
        iconName: 'Star',
        targetView: 'mkt-history'
      }
    ]
  },
  {
    id: 'laporan',
    title: 'Laporan',
    subtitle: 'Omset & Performa',
    iconName: 'BarChart3',
    badgeCount: 'Hari Ini',
    badgeColor: 'bg-emerald-500',
    description: 'Laporan pendapatan arus kas harian/bulanan, audit volume servis kendaraan, dan pemantauan piutang serta kas kecil.',
    subMenus: [
      {
        id: 'laporan-pendapatan',
        title: 'Laporan Pendapatan (Omzet)',
        subtitle: 'Ringkasan Inflow Keuangan & Log Transaksi',
        iconName: 'TrendingUp',
        targetView: 'rep-revenue'
      },
      {
        id: 'laporan-servis',
        title: 'Laporan Servis',
        subtitle: 'Rekap Unit Selesai vs Aktif per Periode',
        iconName: 'UserCheck2',
        targetView: 'rep-service'
      },
      {
        id: 'laporan-piutang-keuangan',
        title: 'Laporan Piutang & Keuangan',
        subtitle: 'Rincian Tagihan Belum Lunas & Kas Kecil',
        iconName: 'PieChart',
        targetView: 'rep-finance'
      }
    ]
  },
  {
    id: 'staff',
    title: 'Staff / Karyawan',
    subtitle: 'Tim, Hak Akses & Komisi',
    iconName: 'UserCog',
    badgeCount: 'Tim Aktif',
    badgeColor: 'bg-emerald-600',
    description: 'Master data karyawan bengkel, formulir & tabel staf, sistem pembatasan menu hak akses role, serta rekapitulasi perhitungan komisi mekanik otomatis.',
    subMenus: [
      {
        id: 'data-karyawan',
        title: 'Data Karyawan',
        subtitle: 'Formulir & Tabel Master Staf Bengkel',
        iconName: 'Users',
        badge: 'Master',
        targetView: 'staff-list'
      },
      {
        id: 'hak-akses',
        title: 'Hak Akses & Role',
        subtitle: 'Sistem Pembatasan Menu Kasir & Mekanik',
        iconName: 'Key',
        badge: 'Otorisasi',
        targetView: 'staff-permissions'
      },
      {
        id: 'komisi-mekanik',
        title: 'Komisi Mekanik',
        subtitle: 'Pencatatan & Perhitungan Komisi Jasa Servis',
        iconName: 'Coins',
        badge: 'Komisi',
        targetView: 'staff-commission'
      }
    ]
  },
  {
    id: 'customerqu',
    title: 'CustomerQu',
    subtitle: 'Peta Radar & Keliling',
    iconName: 'MapPin',
    badgeCount: 'Radar LIVE',
    badgeColor: 'bg-blue-600',
    description: 'Peta radar real-time pedagang keliling, ngetem/mangkal, toko offline, live sinkron stok, chat in-app & lonceng panggilan.',
    subMenus: [
      {
        id: 'customerqu-radar',
        title: 'Peta Radar Real-Time',
        subtitle: 'Pantau Pedagang & Toko di Peta',
        iconName: 'Compass',
        badge: 'Live',
        targetView: 'customerqu-radar'
      },
      {
        id: 'customerqu-chat',
        title: 'Chat In-App & Panggilan',
        subtitle: 'Pesan Instan & Lonceng Panggil',
        iconName: 'MessageCircle',
        badge: '24 Jam',
        targetView: 'customerqu-chat'
      },
      {
        id: 'customerqu-booking',
        title: 'Booking & Jadwal Mampir',
        subtitle: 'Pre-order & Kunjungan Rutin Harian',
        iconName: 'Calendar',
        badge: 'Booking',
        targetView: 'customerqu-booking'
      }
    ]
  },
  {
    id: 'setting',
    title: 'Setting',
    subtitle: 'Tata Kelola & Sistem',
    iconName: 'Settings',
    badgeCount: 'Sistem',
    badgeColor: 'bg-emerald-500',
    description: 'Pengaturan profil bengkel, hak akses role SPV & kasir, manajemen cabang, tautkan HP karyawan, tema, backup, restore & reset.',
    subMenus: [
      {
        id: 'setting-profil',
        title: 'Profil Bengkel',
        subtitle: 'Nama Bengkel, Alamat, Pemilik & Kontak',
        iconName: 'Store',
        badge: 'Profil',
        targetView: 'setting-profil'
      },
      {
        id: 'setting-akses',
        title: 'Hak Akses & Role',
        subtitle: 'Otorisasi Supervisor & Kasir',
        iconName: 'Key',
        badge: 'SPV & Kasir',
        targetView: 'setting-akses'
      },
      {
        id: 'setting-cabang',
        title: 'Manajemen Cabang',
        subtitle: 'Kelola Kantor Cabang & Outlet',
        iconName: 'Building2',
        badge: 'Cabang',
        targetView: 'setting-cabang'
      },
      {
        id: 'setting-perangkat',
        title: 'Tautkan HP & Sinkron',
        subtitle: 'Hubungkan HP Karyawan (QR Code)',
        iconName: 'Smartphone',
        badge: 'Multi-HP',
        targetView: 'setting-perangkat'
      },
      {
        id: 'setting-customer-care',
        title: 'Customer Care & AI Support',
        subtitle: 'Troubleshooting Teknis Gratis & Kirim Email',
        iconName: 'Headphones',
        badge: 'AI Gratis',
        targetView: 'setting-customer-care'
      },
      {
        id: 'setting-tema',
        title: 'Tema',
        subtitle: 'Pilihan Nuansa Warna Aplikasi',
        iconName: 'Palette',
        targetView: 'setting-theme'
      },
      {
        id: 'setting-backup',
        title: 'Backup - Opsi',
        subtitle: 'Ekspor Cadangan Database (.JSON)',
        iconName: 'Database',
        targetView: 'setting-backup'
      },
      {
        id: 'setting-restore',
        title: 'Restore',
        subtitle: 'Pulihkan Data dari Berkas Cadangan',
        iconName: 'UploadCloud',
        targetView: 'setting-restore'
      },
      {
        id: 'setting-reset',
        title: 'Reset',
        subtitle: 'Hapus Bersih Total / Reset Data',
        iconName: 'RotateCcw',
        badge: 'Bersih',
        targetView: 'setting-reset'
      },
      {
        id: 'setting-update',
        title: 'Info & Update App',
        subtitle: 'Status Sistem Full Versi & Migrasi',
        iconName: 'Sparkles',
        badge: 'v1.60',
        targetView: 'setting-update'
      }
    ]
  }
];

export const INITIAL_PROFILE = {
  workshopName: 'Bengkel Qu Motor Berkah Jaya',
  address: 'Jl. Otto Iskandardinata No. 128, Sukajadi, Kota Bandung, Jawa Barat 40161',
  ownerName: 'Bpk. Ahmad Fauzi Rachman, S.T.',
  phone: '0812-3456-7890',
  email: 'kontak@bengkelqu-bandung.com'
};

export const INITIAL_PERMISSIONS: RolePermissionConfig[] = [
  { id: 'perm-1', category: 'Kasir & POS', permissionName: 'Buka & Tutup Kasir Shift', spv: true, kasir: true, mekanik: false, description: 'Memulai shift kasir dan input saldo awal' },
  { id: 'perm-2', category: 'Kasir & POS', permissionName: 'Transaksi Penjualan & Cetak Nota', spv: true, kasir: true, mekanik: false, description: 'Menerima pembayaran tunai, QRIS, dan cetak faktur' },
  { id: 'perm-3', category: 'Kasir & POS', permissionName: 'Beri Diskon / Potongan Harga', spv: true, kasir: false, mekanik: false, description: 'Otoritas input diskon manual' },
  { id: 'perm-4', category: 'Kasir & POS', permissionName: 'Void / Hapus Transaksi Selesai', spv: true, kasir: false, mekanik: false, description: 'Membatalkan nota yang telah dicetak & lunas' },
  { id: 'perm-5', category: 'Servis & Antrian', permissionName: 'Input Tiket Antrian Servis', spv: true, kasir: true, mekanik: true, description: 'Registrasi kendaraan baru masuk' },
  { id: 'perm-6', category: 'Servis & Antrian', permissionName: 'Update Progres Servis & Suku Cadang', spv: true, kasir: true, mekanik: true, description: 'Menambah part terpasang dan mengubah progres pengerjaan' },
  { id: 'perm-7', category: 'Servis & Antrian', permissionName: 'Tugaskan Mekanik & Verifikasi QC', spv: true, kasir: false, mekanik: false, description: 'Menentukan teknisi pengerjaan dan verifikasi QC selesai' },
  { id: 'perm-8', category: 'Inventaris & Stok', permissionName: 'Input Barang Masuk & Ubah Stok', spv: true, kasir: false, mekanik: false, description: 'Update kuantitas dan harga beli suku cadang' },
  { id: 'perm-9', category: 'Inventaris & Stok', permissionName: 'Lihat Katalog & Stok Suku Cadang', spv: true, kasir: true, mekanik: true, description: 'Cek ketersediaan part dan lokasi rak' },
  { id: 'perm-10', category: 'Keuangan & Laporan', permissionName: 'Akses Laporan Omset & Laba Rugi', spv: true, kasir: false, mekanik: false, description: 'Melihat ringkasan margin dan pendapatan harian' },
  { id: 'perm-11', category: 'Staff & Komisi', permissionName: 'Lihat Rekap Komisi Mekanik', spv: true, kasir: false, mekanik: true, description: 'Melihat rincian komisi jasa servis' },
  { id: 'perm-12', category: 'Staff & Komisi', permissionName: 'Persetujuan Bayar / Payout Komisi', spv: true, kasir: false, mekanik: false, description: 'Eksekusi pembayaran komisi teknisi' },
  { id: 'perm-13', category: 'Sistem & Setting', permissionName: 'Kelola Master Karyawan & Hak Akses', spv: true, kasir: false, mekanik: false, description: 'Tambah atau ubah hak akses staf' }
];

export const INITIAL_BRANCHES = [
  {
    id: 'br-1',
    branchName: 'Bengkel Qu - Cabang 1 (Pusat Otista)',
    address: 'Jl. Otto Iskandardinata No. 128, Sukajadi, Kota Bandung, Jawa Barat 40161',
    spvName: 'Bpk. Ahmad Fauzi (SPV Utama)',
    phone: '0812-3456-7890',
    email: 'cabang.pusat@bengkelqu.id',
    isActive: true
  },
  {
    id: 'br-2',
    branchName: 'Bengkel Qu - Cabang 2 (Dago Utara)',
    address: 'Jl. Ir. H. Juanda No. 342, Dago, Coblong, Kota Bandung, Jawa Barat 40135',
    spvName: 'Mas Rizky Kurniawan (SPV Dago)',
    phone: '0813-8899-7711',
    email: 'cabang.dago@bengkelqu.id',
    isActive: false
  },
  {
    id: 'br-3',
    branchName: 'Bengkel Qu - Cabang 3 (Buah Batu)',
    address: 'Jl. Buah Batu No. 215, Lengkong, Kota Bandung, Jawa Barat 40265',
    spvName: 'Mas Hendra Gunawan (SPV Buah Batu)',
    phone: '0817-2233-4455',
    email: 'cabang.buahbatu@bengkelqu.id',
    isActive: false
  }
];

export const INITIAL_QUEUES: ServiceQueue[] = [
  {
    id: 'q-1',
    queueNumber: 'BQ-01',
    plateNumber: 'D 4521 ABC',
    customerName: 'Ahmad Fauzi',
    customerPhone: '081234567890',
    vehicleModel: 'Honda Vario 160 (2023)',
    vehicleType: 'Motor Matic',
    serviceCategory: 'Servis Berkala',
    mechanicName: 'Mas Joko (Senior)',
    status: 'proses',
    complaint: 'Tarikan berat di tanjakan, getar saat rpm rendah, dan rem belakang kurang pakem.',
    timeIn: '08:15 WIB',
    estimatedCompletion: '10:00 WIB',
    progressPercent: 70,
    notes: 'Sudah bersihkan CVT, tinggal ganti oli gardan dan setel rem.',
    totalCost: 185000,
    items: [
      { id: 'i-1', name: 'Jasa Servis Lengkap Matic & CVT', price: 65000, qty: 1, type: 'jasa' },
      { id: 'i-2', name: 'AHM Oil SPX2 0.8L Full Synthetic', price: 68000, qty: 1, type: 'part' },
      { id: 'i-3', name: 'Oli Gardan Honda Matic 120ml', price: 18000, qty: 1, type: 'part' },
      { id: 'i-4', name: 'Kampas Rem Belakang Honda Genuine', price: 34000, qty: 1, type: 'part' }
    ]
  },
  {
    id: 'q-2',
    queueNumber: 'BQ-02',
    plateNumber: 'B 3190 TKL',
    customerName: 'Siti Rahmawati',
    customerPhone: '085712389901',
    vehicleModel: 'Yamaha NMAX 155 Connected',
    vehicleType: 'Motor Matic',
    serviceCategory: 'Ganti Oli & Filter',
    mechanicName: 'Mas Eko',
    status: 'selesai',
    complaint: 'Ganti oli mesin rutin dan cek lampu rem belakang yang mati.',
    timeIn: '08:45 WIB',
    estimatedCompletion: '09:30 WIB',
    progressPercent: 100,
    notes: 'Lampu bohlam rem putus, sudah diganti baru. Pengerjaan selesai.',
    totalCost: 125000,
    items: [
      { id: 'i-5', name: 'Yamalube Super Matic 1.0L', price: 78000, qty: 1, type: 'part' },
      { id: 'i-6', name: 'Bohlam Rem Belakang T10 Osram', price: 17000, qty: 1, type: 'part' },
      { id: 'i-7', name: 'Jasa Ganti Oli & Cek Ringan', price: 30000, qty: 1, type: 'jasa' }
    ]
  },
  {
    id: 'q-3',
    queueNumber: 'BQ-03',
    plateNumber: 'D 2819 KHG',
    customerName: 'Bambang Supriyanto',
    customerPhone: '081399881122',
    vehicleModel: 'Honda BeAT eSP FI (2020)',
    vehicleType: 'Motor Matic',
    serviceCategory: 'Servis Ringan',
    mechanicName: 'Mas Dani',
    status: 'selesai',
    complaint: 'Starter elektrik susah hidup di pagi hari, ganti busi.',
    timeIn: '08:00 WIB',
    estimatedCompletion: '08:50 WIB',
    progressPercent: 100,
    notes: 'Aki masih bagus 12.6V, busi kotor diganti baru NGK MR9C.',
    totalCost: 85000,
    items: [
      { id: 'i-8', name: 'Busi NGK MR9C-9N Original', price: 35000, qty: 1, type: 'part' },
      { id: 'i-9', name: 'Jasa Tune Up Injeksi & Reset ECU', price: 50000, qty: 1, type: 'jasa' }
    ]
  },
  {
    id: 'q-4',
    queueNumber: 'BQ-04',
    plateNumber: 'D 6044 VXZ',
    customerName: 'Kevin Wijaya',
    customerPhone: '082155667788',
    vehicleModel: 'Yamaha Aerox 155 VVA',
    vehicleType: 'Motor Matic',
    serviceCategory: 'Servis Ringan',
    mechanicName: 'Mas Joko (Senior)',
    status: 'menunggu',
    complaint: 'Bunyi decit di bagian ban depan saat rem ditekan.',
    timeIn: '09:10 WIB',
    estimatedCompletion: '10:30 WIB',
    progressPercent: 10,
    notes: 'Menunggu giliran pengerjaan Mas Joko.',
    totalCost: 75000,
    items: [
      { id: 'i-10', name: 'Jasa Servis Kaliper & Rem Depan', price: 35000, qty: 1, type: 'jasa' },
      { id: 'i-11', name: 'Kampas Rem Depan Daytona Pro', price: 40000, qty: 1, type: 'part' }
    ]
  },
  {
    id: 'q-5',
    queueNumber: 'BQ-05',
    plateNumber: 'B 5591 PQR',
    customerName: 'Rian Pratama',
    customerPhone: '081299008811',
    vehicleModel: 'Kawasaki KLX 150 BF',
    vehicleType: 'Motor Sport',
    serviceCategory: 'Turun Mesin',
    mechanicName: 'Mas Ryan (Spesialis Mesin)',
    status: 'menunggu',
    complaint: 'Asap putih tipis dari knalpot, oli cepat habis susut.',
    timeIn: '09:20 WIB',
    estimatedCompletion: '14:00 WIB',
    progressPercent: 0,
    notes: 'Periksa ring seher & sil klep bocor.',
    totalCost: 450000,
    items: [
      { id: 'i-12', name: 'Jasa Skir Klep & Ganti Ring Piston', price: 250000, qty: 1, type: 'jasa' },
      { id: 'i-13', name: 'Seal Klep & Paking Top Set Kawasaki', price: 110000, qty: 1, type: 'part' },
      { id: 'i-14', name: 'Motul 5100 10W-40 1L', price: 90000, qty: 1, type: 'part' }
    ]
  }
];

export const INITIAL_SPAREPARTS: Sparepart[] = [
  {
    id: 'p-1',
    code: 'OIL-AHM-01',
    name: 'AHM Oil MPX2 0.8L (Matic)',
    category: 'Oli & Pelumas',
    brand: 'Astra Honda Motor',
    stock: 2, // Low stock alert!
    minStock: 10,
    buyPrice: 46000,
    sellPrice: 56000,
    unit: 'Botol',
    rackLocation: 'Rak A-1'
  },
  {
    id: 'p-2',
    code: 'OIL-AHM-02',
    name: 'AHM Oil SPX2 0.8L Full Synthetic',
    category: 'Oli & Pelumas',
    brand: 'Astra Honda Motor',
    stock: 14,
    minStock: 8,
    buyPrice: 56000,
    sellPrice: 68000,
    unit: 'Botol',
    rackLocation: 'Rak A-1'
  },
  {
    id: 'p-3',
    code: 'OIL-YAM-01',
    name: 'Yamalube Super Matic 1.0L',
    category: 'Oli & Pelumas',
    brand: 'Yamaha Genuine',
    stock: 18,
    minStock: 8,
    buyPrice: 65000,
    sellPrice: 78000,
    unit: 'Botol',
    rackLocation: 'Rak A-2'
  },
  {
    id: 'p-4',
    code: 'OIL-SHELL-01',
    name: 'Shell Advance AX7 Matic 10W-40 0.8L',
    category: 'Oli & Pelumas',
    brand: 'Shell',
    stock: 1, // Low stock alert!
    minStock: 6,
    buyPrice: 51000,
    sellPrice: 62000,
    unit: 'Botol',
    rackLocation: 'Rak A-3'
  },
  {
    id: 'p-5',
    code: 'BS-NGK-01',
    name: 'Busi NGK CPR9EA-9 (Vario/Beat/Scoopy)',
    category: 'Busi & Kelistrikan',
    brand: 'NGK',
    stock: 24,
    minStock: 10,
    buyPrice: 20000,
    sellPrice: 30000,
    unit: 'Pcs',
    rackLocation: 'Rak B-1'
  },
  {
    id: 'p-6',
    code: 'BS-DEN-01',
    name: 'Busi Denso U24EPR9',
    category: 'Busi & Kelistrikan',
    brand: 'Denso',
    stock: 16,
    minStock: 8,
    buyPrice: 19000,
    sellPrice: 28000,
    unit: 'Pcs',
    rackLocation: 'Rak B-1'
  },
  {
    id: 'p-7',
    code: 'REM-HON-01',
    name: 'Kampas Rem Depan Vario/Beat KVB',
    category: 'Sistem Rem',
    brand: 'Honda Genuine Part',
    stock: 9,
    minStock: 5,
    buyPrice: 42000,
    sellPrice: 55000,
    unit: 'Set',
    rackLocation: 'Rak C-2'
  },
  {
    id: 'p-8',
    code: 'REM-DAY-01',
    name: 'Kampas Rem Belakang Tromol Daytona Gold',
    category: 'Sistem Rem',
    brand: 'Daytona Racing',
    stock: 2, // Low stock alert!
    minStock: 6,
    buyPrice: 58000,
    sellPrice: 75000,
    unit: 'Set',
    rackLocation: 'Rak C-2'
  },
  {
    id: 'p-9',
    code: 'CVT-VAN-01',
    name: 'V-Belt Kit + Roller Beat FI KZL',
    category: 'Transmisi / CVT',
    brand: 'Astra Aspira',
    stock: 7,
    minStock: 4,
    buyPrice: 110000,
    sellPrice: 145000,
    unit: 'Set',
    rackLocation: 'Rak D-1'
  },
  {
    id: 'p-10',
    code: 'FLT-HON-01',
    name: 'Filter Udara Vario 125 / 150 KZR',
    category: 'Filter & Karburator',
    brand: 'Honda Genuine Part',
    stock: 11,
    minStock: 5,
    buyPrice: 38000,
    sellPrice: 52000,
    unit: 'Pcs',
    rackLocation: 'Rak E-1'
  },
  {
    id: 'p-11',
    code: 'BAN-IRC-01',
    name: 'Ban Luar Tubeless IRC NR82 90/90-14',
    category: 'Ban & Velg',
    brand: 'IRC Tire',
    stock: 5,
    minStock: 3,
    buyPrice: 175000,
    sellPrice: 215000,
    unit: 'Pcs',
    rackLocation: 'Gudang Belakang'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    invoiceNumber: 'INV-20261006-001',
    date: '06 Okt 2026, 08:35 WIB',
    customerName: 'Bambang Supriyanto',
    plateNumber: 'D 2819 KHG',
    vehicleModel: 'Honda BeAT eSP FI',
    mechanicName: 'Mas Dani',
    items: [
      { id: 'tx-i-1', name: 'Busi NGK MR9C-9N Original', price: 35000, qty: 1, type: 'part' },
      { id: 'tx-i-2', name: 'Jasa Tune Up Injeksi & Reset ECU', price: 50000, qty: 1, type: 'jasa' }
    ],
    subtotal: 85000,
    discount: 5000,
    total: 80000,
    paymentMethod: 'QRIS',
    status: 'Lunas'
  },
  {
    id: 'tx-2',
    invoiceNumber: 'INV-20261006-002',
    date: '06 Okt 2026, 09:05 WIB',
    customerName: 'Hendri Kurnia',
    plateNumber: 'D 3341 XYZ',
    vehicleModel: 'Suzuki Satria F150',
    mechanicName: 'Mas Eko',
    items: [
      { id: 'tx-i-3', name: 'Oli Motul 3100 Silver 1L', price: 75000, qty: 1, type: 'part' },
      { id: 'tx-i-4', name: 'Filter Oli Suzuki Original', price: 25000, qty: 1, type: 'part' },
      { id: 'tx-i-5', name: 'Jasa Ganti Oli & Cek Rantai', price: 20000, qty: 1, type: 'jasa' }
    ],
    subtotal: 120000,
    discount: 0,
    total: 120000,
    paymentMethod: 'Tunai',
    cashPaid: 150000,
    change: 30000,
    status: 'Lunas'
  },
  {
    id: 'tx-3',
    invoiceNumber: 'INV-20261006-003',
    date: '06 Okt 2026, 09:22 WIB',
    customerName: 'Farhan Maulana',
    plateNumber: 'B 6620 GHT',
    vehicleModel: 'Yamaha Fazzio Hybrid',
    mechanicName: 'Mas Joko (Senior)',
    items: [
      { id: 'tx-i-6', name: 'Servis Berkala Fazzio + Injeksi', price: 65000, qty: 1, type: 'jasa' },
      { id: 'tx-i-7', name: 'Yamalube Blue Core 0.8L', price: 55000, qty: 1, type: 'part' },
      { id: 'tx-i-8', name: 'Pembersih CVT Cleaner', price: 25000, qty: 1, type: 'part' }
    ],
    subtotal: 145000,
    discount: 0,
    total: 145000,
    paymentMethod: 'Transfer Bank',
    status: 'Lunas'
  },
  {
    id: 'tx-4',
    invoiceNumber: 'INV-20261006-004',
    date: '06 Okt 2026, 11:15 WIB',
    customerName: 'Pak Wahyu Hidayat',
    plateNumber: 'D 5512 VXZ',
    vehicleModel: 'Honda PCX 160',
    mechanicName: 'Mas Joko (Senior)',
    items: [
      { id: 'tx-i-9', name: 'Jasa Servis CVT & Ganti Roller', price: 65000, qty: 1, type: 'jasa' },
      { id: 'tx-i-10', name: 'Vanbelt Honda PCX 160 Original', price: 135000, qty: 1, type: 'part' }
    ],
    subtotal: 200000,
    discount: 0,
    total: 200000,
    paymentMethod: 'Tunai',
    status: 'Belum Lunas'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf-1',
    name: 'Mas Joko (Senior)',
    phone: '0812-1111-2222',
    role: 'Mekanik',
    status: 'Aktif',
    commissionPercent: 25,
    baseSalary: 3000000,
    specialty: 'Kepala Mekanik, Tune Up & Mesin',
    joinDate: '15 Jan 2023',
    rating: 4.9,
    activeTasks: 2,
    completedToday: 3,
    avatarBg: 'bg-emerald-600',
    email: 'joko@bengkelqu.id'
  },
  {
    id: 'stf-2',
    name: 'Mas Dani',
    phone: '0813-3333-4444',
    role: 'Mekanik',
    status: 'Aktif',
    commissionPercent: 20,
    baseSalary: 2500000,
    specialty: 'Spesialis CVT & Injeksi',
    joinDate: '01 Mar 2023',
    rating: 4.8,
    activeTasks: 1,
    completedToday: 2,
    avatarBg: 'bg-teal-600',
    email: 'dani@bengkelqu.id'
  },
  {
    id: 'stf-3',
    name: 'Mas Eko',
    phone: '0817-5555-6666',
    role: 'Mekanik',
    status: 'Aktif',
    commissionPercent: 20,
    baseSalary: 2500000,
    specialty: 'Servis Ringan, Rem & Oli',
    joinDate: '10 Mei 2023',
    rating: 4.9,
    activeTasks: 1,
    completedToday: 4,
    avatarBg: 'bg-green-600',
    email: 'eko@bengkelqu.id'
  },
  {
    id: 'stf-4',
    name: 'Mas Ryan',
    phone: '0821-7777-8888',
    role: 'Mekanik',
    status: 'Aktif',
    commissionPercent: 30,
    baseSalary: 3200000,
    specialty: 'Spesialis Turun Mesin & 2T/4T',
    joinDate: '05 Agu 2023',
    rating: 4.9,
    activeTasks: 1,
    completedToday: 1,
    avatarBg: 'bg-emerald-700',
    email: 'ryan@bengkelqu.id'
  },
  {
    id: 'stf-5',
    name: 'Siti Rahma (Mbak Rina)',
    phone: '0857-8888-9999',
    role: 'Kasir',
    status: 'Aktif',
    commissionPercent: 0,
    baseSalary: 2800000,
    specialty: 'Kasir POS & Pelayanan Pelanggan',
    joinDate: '01 Feb 2024',
    rating: 4.9,
    activeTasks: 0,
    completedToday: 18,
    avatarBg: 'bg-blue-600',
    email: 'kasir@bengkelqu.id'
  },
  {
    id: 'stf-6',
    name: 'Budi Santoso',
    phone: '0822-4444-5555',
    role: 'Admin',
    status: 'Aktif',
    commissionPercent: 0,
    baseSalary: 3000000,
    specialty: 'Logistik, Stok Gudang & Pembelian',
    joinDate: '12 Jan 2024',
    rating: 4.8,
    activeTasks: 0,
    completedToday: 5,
    avatarBg: 'bg-amber-600',
    email: 'admin@bengkelqu.id'
  },
  {
    id: 'stf-7',
    name: 'Bpk. Ahmad Fauzi',
    phone: '0812-3456-7890',
    role: 'Supervisor',
    status: 'Aktif',
    commissionPercent: 0,
    baseSalary: 5000000,
    specialty: 'Kepala Bengkel & SPV Operasional',
    joinDate: '01 Jan 2022',
    rating: 5.0,
    activeTasks: 0,
    completedToday: 0,
    avatarBg: 'bg-slate-800',
    email: 'fauzi@bengkelqu.id'
  },
  {
    id: 'stf-8',
    name: 'Hendra Gunawan',
    phone: '0878-1234-5678',
    role: 'Mekanik',
    status: 'Non-Aktif',
    commissionPercent: 20,
    baseSalary: 2400000,
    specialty: 'Mekanik Magang / Bantuan',
    joinDate: '01 Jul 2024',
    rating: 4.5,
    activeTasks: 0,
    completedToday: 0,
    avatarBg: 'bg-slate-400',
    notes: 'Sedang cuti luar kota'
  }
];

export const INITIAL_MECHANICS: Mechanic[] = [
  { id: 'm-1', name: 'Mas Joko (Senior)', role: 'Mekanik Kepala / Senior', phone: '0812-1111-2222', activeTasks: 2, completedToday: 3, rating: 4.9, avatarBg: 'bg-emerald-600', status: 'Aktif', commissionPercent: 25 },
  { id: 'm-2', name: 'Mas Dani', role: 'Mekanik CVT & Kelistrikan', phone: '0813-3333-4444', activeTasks: 1, completedToday: 2, rating: 4.8, avatarBg: 'bg-teal-600', status: 'Aktif', commissionPercent: 20 },
  { id: 'm-3', name: 'Mas Eko', role: 'Mekanik Servis Ringan & Oli', phone: '0817-5555-6666', activeTasks: 1, completedToday: 4, rating: 4.9, avatarBg: 'bg-green-600', status: 'Aktif', commissionPercent: 20 },
  { id: 'm-4', name: 'Mas Ryan', role: 'Spesialis Turun Mesin', phone: '0821-7777-8888', activeTasks: 1, completedToday: 1, rating: 4.9, avatarBg: 'bg-emerald-700', status: 'Aktif', commissionPercent: 30 }
];

export const INITIAL_COMMISSIONS: MechanicCommissionRecord[] = [
  {
    id: 'com-1',
    transactionId: 'tx-1',
    invoiceNumber: 'INV-20261006-001',
    date: '06 Okt 2026, 08:35 WIB',
    mechanicName: 'Mas Dani',
    customerName: 'Bambang Supriyanto',
    plateNumber: 'D 2819 KHG',
    vehicleModel: 'Honda BeAT eSP FI',
    serviceLaborTotal: 50000,
    commissionPercent: 20,
    commissionAmount: 10000,
    payoutStatus: 'Dibayar',
    paidAt: '06 Okt 2026, 17:00 WIB',
    notes: 'Jasa Tune Up Injeksi & Reset ECU'
  },
  {
    id: 'com-2',
    transactionId: 'tx-2',
    invoiceNumber: 'INV-20261006-002',
    date: '06 Okt 2026, 09:05 WIB',
    mechanicName: 'Mas Eko',
    customerName: 'Hendri Kurnia',
    plateNumber: 'D 3341 XYZ',
    vehicleModel: 'Suzuki Satria F150',
    serviceLaborTotal: 20000,
    commissionPercent: 20,
    commissionAmount: 4000,
    payoutStatus: 'Dibayar',
    paidAt: '06 Okt 2026, 17:00 WIB',
    notes: 'Jasa Ganti Oli & Cek Rantai'
  },
  {
    id: 'com-3',
    transactionId: 'tx-3',
    invoiceNumber: 'INV-20261006-003',
    date: '06 Okt 2026, 09:22 WIB',
    mechanicName: 'Mas Joko (Senior)',
    customerName: 'Farhan Maulana',
    plateNumber: 'B 6620 GHT',
    vehicleModel: 'Yamaha Fazzio Hybrid',
    serviceLaborTotal: 65000,
    commissionPercent: 25,
    commissionAmount: 16250,
    payoutStatus: 'Pending',
    notes: 'Jasa Servis CVT & Pembersihan Filter'
  },
  {
    id: 'com-4',
    transactionId: 'tx-4',
    invoiceNumber: 'INV-20261006-004',
    date: '06 Okt 2026, 11:15 WIB',
    mechanicName: 'Mas Joko (Senior)',
    customerName: 'Pak Wahyu Hidayat',
    plateNumber: 'D 5512 VXZ',
    vehicleModel: 'Honda PCX 160',
    serviceLaborTotal: 65000,
    commissionPercent: 25,
    commissionAmount: 16250,
    payoutStatus: 'Pending',
    notes: 'Jasa Servis CVT & Ganti Roller'
  }
];

export const INITIAL_CUSTOMERS: CustomerVehicle[] = [
  {
    id: 'c-1',
    name: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Gegerkalong Hilir No. 42, Sukasari, Bandung',
    plateNumber: 'D 4521 ABC',
    vehicleBrand: 'Honda',
    vehicleType: 'Vario 160 ABS',
    vehicleModel: 'Honda Vario 160 ABS (2023)',
    year: '2023',
    lastServiceDate: '06 Okt 2026',
    totalVisits: 6,
    loyaltyPoints: 120,
    notes: 'Selalu request oli SPX2 dan servis CVT rutin tiap 4.000 KM.'
  },
  {
    id: 'c-2',
    name: 'Siti Rahmawati',
    phone: '085712389901',
    address: 'Komplek Antapani Mas Blok C2 No. 11, Antapani, Bandung',
    plateNumber: 'B 3190 TKL',
    vehicleBrand: 'Yamaha',
    vehicleType: 'NMAX 155 Connected',
    vehicleModel: 'Yamaha NMAX 155 (2022)',
    year: '2022',
    lastServiceDate: '06 Okt 2026',
    totalVisits: 4,
    loyaltyPoints: 80,
    notes: 'Prioritaskan cek kampas rem dan lampu depan LED.'
  },
  {
    id: 'c-3',
    name: 'Bambang Supriyanto',
    phone: '081399881122',
    address: 'Jl. Cikutra Barat No. 89, Cibeunying Kidul, Bandung',
    plateNumber: 'D 2819 KHG',
    vehicleBrand: 'Honda',
    vehicleType: 'BeAT eSP CBS ISS',
    vehicleModel: 'Honda BeAT eSP FI (2020)',
    year: '2020',
    lastServiceDate: '06 Okt 2026',
    totalVisits: 8,
    loyaltyPoints: 160,
    notes: 'Member setia sejak 2021, sering ganti busi NGK.'
  },
  {
    id: 'c-4',
    name: 'Kevin Wijaya',
    phone: '082155667788',
    address: 'Jl. Surya Sumantri No. 102, Pasteur, Bandung',
    plateNumber: 'D 6044 VXZ',
    vehicleBrand: 'Yamaha',
    vehicleType: 'Aerox 155 CyberCity',
    vehicleModel: 'Yamaha Aerox 155 (2022)',
    year: '2022',
    lastServiceDate: '12 Sep 2026',
    totalVisits: 3,
    loyaltyPoints: 60,
    notes: 'Suka part racing aftermarket (Daytona Gold).'
  },
  {
    id: 'c-5',
    name: 'Dewi Lestari',
    phone: '081987654321',
    address: 'Jl. Buah Batu Raya No. 154, Bandung',
    plateNumber: 'D 5122 TUV',
    vehicleBrand: 'Honda',
    vehicleType: 'Scoopy Prestige Smartkey',
    vehicleModel: 'Honda Scoopy Prestige (2024)',
    year: '2024',
    lastServiceDate: '28 Sep 2026',
    totalVisits: 2,
    loyaltyPoints: 40,
    notes: 'Servis berkala gratis pertama dari dealer lewat.'
  }
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'cmp-1',
    title: 'Reminder Servis Berkala & Ganti Oli Rutin Oktober',
    channel: 'WhatsApp',
    targetAudience: 'Pelanggan servis > 2 bulan lalu (85 Kontak)',
    messageContent: 'Halo Sahabat Bengkel Qu! Mengingatkan motor kesayangan Anda sudah memasuki jadwal servis berkala & ganti oli rutin. Nikmati gratis cek rem & tekanan ban hari ini!',
    sentDate: '06 Okt 2026, 09:30 WIB',
    recipientCount: 85,
    status: 'Terkirim',
    deliveredPercent: 98
  },
  {
    id: 'cmp-2',
    title: 'Promo Paket Servis CVT + Tune Up Matic Diskon 20%',
    channel: 'WhatsApp',
    targetAudience: 'Pemilik Motor Matic (Vario, BeAT, NMAX, Aerox)',
    messageContent: 'Motor terasa berat dan getar di tarikan awal? Rawat CVT motormu di Bengkel Qu dengan potongan 20%! Tunjukkan pesan ini ke kasir.',
    sentDate: '01 Okt 2026, 10:15 WIB',
    recipientCount: 120,
    status: 'Terkirim',
    deliveredPercent: 96
  },
  {
    id: 'cmp-3',
    title: 'Pengumuman Kupon Hadiah Loyalitas Member Bengkel Qu',
    channel: 'Broadcast',
    targetAudience: 'Member dengan Poin > 100',
    messageContent: 'Terima kasih atas kesetiaan Anda! Tukarkan 100 Poin Loyalitas Anda dengan Gratis 1 Botol Oli Mesin MPX2/Yamalube di kasir Bengkel Qu.',
    sentDate: '25 Sep 2026, 14:00 WIB',
    recipientCount: 42,
    status: 'Terkirim',
    deliveredPercent: 100
  }
];

export const INITIAL_VOUCHERS: PromoVoucher[] = [
  {
    id: 'vch-1',
    code: 'BENGKELQU10',
    title: 'Diskon Jasa Servis Ringan & Berkala 10%',
    discountType: 'Persen',
    discountValue: 10,
    minTransaction: 80000,
    validUntil: '31 Okt 2026',
    category: 'Jasa Servis',
    quota: 50,
    usedCount: 22,
    isActive: true,
    notes: 'Berlaku untuk semua jenis motor matic dan bebek.'
  },
  {
    id: 'vch-2',
    code: 'OLIBERKAH5',
    title: 'Potongan Langsung Oli Mesin Rp 5.000',
    discountType: 'Nominal',
    discountValue: 5000,
    minTransaction: 50000,
    validUntil: '15 Nov 2026',
    category: 'Oli',
    quota: 100,
    usedCount: 48,
    isActive: true,
    notes: 'Khusus varian oli full synthetic SPX2 dan Yamalube Super Matic.'
  },
  {
    id: 'vch-3',
    code: 'CVTTUNEUP15',
    title: 'Diskon Paket Tune Up + CVT 15%',
    discountType: 'Persen',
    discountValue: 15,
    minTransaction: 100000,
    validUntil: '30 Nov 2026',
    category: 'Jasa Servis',
    quota: 30,
    usedCount: 14,
    isActive: true,
    notes: 'Termasuk pembersihan throttle body dan roller CVT.'
  }
];

export const INITIAL_DAMAGED_GOODS: DamagedGood[] = [
  {
    id: 'dmg-1',
    sparepartId: 'p-1',
    code: 'OIL-AHM-01',
    name: 'AHM Oil MPX2 0.8L (Matic)',
    qty: 1,
    unit: 'Botol',
    damageReason: 'Segel tutup botol bocor rembes saat pengiriman dari distributor',
    reportedBy: 'Mas Dani (Mekanik)',
    date: '06 Okt 2026, 14:15 WIB',
    timestamp: Date.now() - 86400000,
    status: 'Diajukan',
    notes: 'Disimpan di rak retur suplier'
  },
  {
    id: 'dmg-2',
    sparepartId: 'p-5',
    code: 'BS-NGK-01',
    name: 'Busi NGK CPR9EA-9 (Vario/Beat/Scoopy)',
    qty: 2,
    unit: 'Pcs',
    damageReason: 'Keramik busi retak / elektroda bengkok dari kotak kemasan',
    reportedBy: 'Mas Eko (Mekanik)',
    date: '05 Okt 2026, 11:20 WIB',
    timestamp: Date.now() - 172800000,
    status: 'Disetujui SPV',
    notes: 'Menunggu klaim garansi toko agen'
  }
];

export const INITIAL_PROCUREMENTS: ProcurementRecord[] = [
  {
    id: 'po-1',
    poNumber: 'PO-20261006-001',
    code: 'OIL-YAM-01',
    name: 'Yamalube Super Matic 1.0L',
    category: 'Oli & Pelumas',
    supplier: 'PT Yamaha Motor Distributor Jabar',
    qty: 24,
    unit: 'Botol',
    buyPrice: 65000,
    totalCost: 1560000,
    date: '06 Okt 2026, 10:15 WIB',
    timestamp: Date.now() - 3600000 * 20,
    receiver: 'Budi Santoso (Admin Gudang)',
    type: 'Restock',
    notes: 'Faktur lunas tempo 14 hari, barang diterima lengkap dan segel utuh'
  },
  {
    id: 'po-2',
    poNumber: 'PO-20261005-002',
    code: 'CVT-VAN-01',
    name: 'V-Belt Kit + Roller Beat FI KZL',
    category: 'Transmisi / CVT',
    supplier: 'Astra Otoparts Bandung',
    qty: 10,
    unit: 'Set',
    buyPrice: 110000,
    totalCost: 1100000,
    date: '05 Okt 2026, 15:30 WIB',
    timestamp: Date.now() - 3600000 * 45,
    receiver: 'Bpk. Ahmad Fauzi (SPV)',
    type: 'Restock',
    notes: 'Pengadaan berkala stok fast moving CVT'
  },
  {
    id: 'po-3',
    poNumber: 'PO-20261004-001',
    code: 'BAN-IRC-01',
    name: 'Ban Luar Tubeless IRC NR82 90/90-14',
    category: 'Ban & Velg',
    supplier: 'Gajah Tunggal Banindo',
    qty: 8,
    unit: 'Pcs',
    buyPrice: 175000,
    totalCost: 1400000,
    date: '04 Okt 2026, 13:00 WIB',
    timestamp: Date.now() - 3600000 * 70,
    receiver: 'Mas Eko (Mekanik)',
    type: 'Restock',
    notes: 'Restock ban tubeless matic harian'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Stok Suku Cadang Kritis!',
    message: 'AHM Oil MPX2 0.8L sisa 2 botol & Daytona Gold sisa 2 set. Segera order ke suplier.',
    time: '10 menit lalu',
    read: false,
    type: 'stock'
  },
  {
    id: 'notif-2',
    title: 'Servis Selesai Siap Bayar',
    message: 'Honda BeAT (D 2819 KHG) a/n Bambang selesai dikerjakan Mas Dani.',
    time: '25 menit lalu',
    read: false,
    type: 'service'
  },
  {
    id: 'notif-3',
    title: 'Pembayaran QRIS Berhasil',
    message: 'Transaksi #INV-20261006-001 Rp 80.000 via QRIS BCA telah terverifikasi.',
    time: '40 menit lalu',
    read: true,
    type: 'payment'
  }
];

export const QUICK_SERVICE_PACKAGES = [
  { id: 'p-std', name: 'Tune Up + Ganti Oli Matic', price: 95000, timeEst: '30 Menit' },
  { id: 'p-cvt', name: 'Servis CVT Lengkap + Greasing', price: 65000, timeEst: '45 Menit' },
  { id: 'p-inj', name: 'Pembersihan Injektor & Throttle Body', price: 75000, timeEst: '40 Menit' },
  { id: 'p-rem', name: 'Kuras Minyak Rem Depan & Belakang', price: 40000, timeEst: '20 Menit' }
];
