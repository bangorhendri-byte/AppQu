-- ==============================================================================
-- AppQu: Solusi Cerdas Masa Kini
-- Production-Ready Single-File PostgreSQL Relational Database Schema
-- Mengintegrasikan Klaster Komunitas Warga & Klaster Unit Usaha Lokal
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & USER ROLES (Multi-role support: Warga, Pengurus, Pelaku Usaha, Governance)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    fcm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE role_type_enum AS ENUM (
    'GOVERNANCE', 'KETUA_RT', 'WAKIL_RT', 'BENDAHARA', 'SEKRETARIS',
    'KOORDINATOR_KEAMANAN', 'KOORDINATOR_LINGKUNGAN', 'SATPAM_RONDA',
    'WARGA', 'PELAKU_USAHA'
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role role_type_enum NOT NULL,
    rt VARCHAR(10) DEFAULT '001',
    rw VARCHAR(10) DEFAULT '005',
    kelurahan VARCHAR(100) DEFAULT 'Sukamaju',
    kecamatan VARCHAR(100) DEFAULT 'Merdeka',
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_role UNIQUE (user_id, role, rt, rw)
);

CREATE INDEX idx_user_roles_lookup ON user_roles(role, rt, rw);

-- 2. WARGA PROFILES (Data Induk WargaQu + NIK Terenkripsi AES-256)
CREATE TABLE warga_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    nik_encrypted TEXT NOT NULL,
    nik_masked VARCHAR(20) NOT NULL,
    kk_number_encrypted TEXT,
    alamat_blok VARCHAR(100) NOT NULL,
    rt VARCHAR(10) DEFAULT '001',
    rw VARCHAR(10) DEFAULT '005',
    status_hunian VARCHAR(50) DEFAULT 'Pemilik Tetap',
    golongan_darah VARCHAR(5),
    emergency_contact VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warga_blok ON warga_profiles(rt, rw, alamat_blok);

-- 3. KLASTER UNIT USAHA LOKAL (USAHAQU MODULAR INTEGRATION)
CREATE TYPE business_category_enum AS ENUM (
    'BENGKEL', 'KEDAI', 'KLINIK', 'RITEL', 'TITIP', 'CUSTOMERQU'
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    category business_category_enum NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    is_mobile_vendor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50),
    price DECIMAL(12, 2) NOT NULL,
    stock INT DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'Pcs',
    description TEXT,
    image_url TEXT,
    is_lapak_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_lapak ON products(business_id, is_lapak_visible);

-- 4. FEEDS & FEED COMMENTS (Postingan, Pengumuman, Polling, Lapak Promo)
CREATE TYPE feed_type_enum AS ENUM (
    'PENGUMUMAN_RESMI', 'KEGIATAN_AGENDA', 'ASPIRASI_WARGA', 'LAPAK_PROMO', 'TANGGAP_DUKA'
);

CREATE TABLE feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type feed_type_enum DEFAULT 'ASPIRASI_WARGA',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE,
    event_location VARCHAR(255),
    lapak_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    rt VARCHAR(10) DEFAULT '001',
    rw VARCHAR(10) DEFAULT '005',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feed_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feed_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_feed_like UNIQUE (feed_id, user_id)
);

-- 5. TRANSACTIONS & KAS LEDGER (Kas Transparan & Smart Scan OCR Iuran)
CREATE TYPE kas_category_enum AS ENUM (
    'IURAN_BULANAN', 'DONASI_DUKA', 'KEBERSIHAN_SAMPAH',
    'PERBAIKAN_FASILITAS', 'OPERASIONAL_RONDA', 'SANTUNAN_WARGA'
);

CREATE TABLE tanggap_duka (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warga_name VARCHAR(150) NOT NULL,
    family_contact VARCHAR(50) NOT NULL,
    blok_address VARCHAR(100) NOT NULL,
    status_type VARCHAR(50) DEFAULT 'Duka Cita',
    date_reported TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    donation_target DECIMAL(12, 2) NOT NULL,
    donation_collected DECIMAL(12, 2) DEFAULT 0,
    piket_takziah_json TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kas_ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category kas_category_enum NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    is_income BOOLEAN DEFAULT TRUE,
    payer_name VARCHAR(150),
    payer_nik_masked VARCHAR(20),
    proof_image_url TEXT,
    is_ocr_verified BOOLEAN DEFAULT FALSE,
    ocr_raw_result_json TEXT,
    rt VARCHAR(10) DEFAULT '001',
    rw VARCHAR(10) DEFAULT '005',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tanggap_duka_id UUID REFERENCES tanggap_duka(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kas_balance ON kas_ledgers(rt, rw, is_income);

-- 6. EMERGENCY LOGS & PATROL CHECKPOINTS (Smart SiagaQu & QR Ronda)
CREATE TYPE emergency_type_enum AS ENUM (
    'KEMALINGAN', 'KEBAKARAN', 'MEDIS_DARURAT', 'KERIBUTAN'
);

CREATE TYPE emergency_status_enum AS ENUM (
    'ACTIVE_SIREN', 'INVESTIGATING', 'HANDLED', 'FALSE_ALARM'
);

CREATE TABLE emergency_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trigger_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type emergency_type_enum NOT NULL,
    status emergency_status_enum DEFAULT 'ACTIVE_SIREN',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address_detail TEXT NOT NULL,
    nearest_cctv_id VARCHAR(50),
    cctv_rtsp_url TEXT,
    audio_siren_active BOOLEAN DEFAULT TRUE,
    broadcast_count INT DEFAULT 0,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patrol_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_token VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location_description TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rt VARCHAR(10) DEFAULT '001',
    rw VARCHAR(10) DEFAULT '005',
    target_schedule VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE patrol_status_enum AS ENUM (
    'AMAN', 'BELUM_PATROLI', 'TERLEWAT', 'TEMUAN_MENCURIGAKAN'
);

CREATE TABLE patrol_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID NOT NULL REFERENCES patrol_checkpoints(id) ON DELETE CASCADE,
    scanned_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status patrol_status_enum DEFAULT 'AMAN',
    notes TEXT,
    photo_proof_url TEXT
);

-- 7. LETTERS & APPROVAL WORKFLOWS (Surat Pengantar Digital Auto-Fill)
CREATE TYPE surat_type_enum AS ENUM (
    'PENGANTAR_SKCK', 'KETERANGAN_DOMISILI', 'KETERANGAN_KEMATIAN_DUKA',
    'KETERANGAN_USAHA_SKU', 'PENGANTAR_NIKAH'
);

CREATE TYPE approval_status_enum AS ENUM (
    'DRAFT', 'MENUNGGU_VERIFIKASI_SEKRETARIS', 'MENUNGGU_APPROVAL_RT',
    'DISETUJUI_RT', 'SELESAI', 'DITOLAK'
);

CREATE TABLE letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_number VARCHAR(100) UNIQUE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type surat_type_enum NOT NULL,
    purpose TEXT NOT NULL,
    status approval_status_enum DEFAULT 'MENUNGGU_VERIFIKASI_SEKRETARIS',
    rt VARCHAR(10) DEFAULT '001',
    rw VARCHAR(10) DEFAULT '005',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    digital_signature_qr TEXT,
    notes TEXT
);

CREATE INDEX idx_letters_workflow ON letters(rt, rw, status);
