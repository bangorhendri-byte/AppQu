/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - TriPay Payment Gateway Integration Service
 * Menangani pembuatan transaksi, pembuatan signature HMAC-SHA256,
 * validasi callback webhook, dan pembaruan lisensi Cloud/Local Tenant.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Konfigurasi Environment TriPay
export const TRIPAY_CONFIG = {
  get apiKey() {
    return process.env.TRIPAY_API_KEY || '';
  },
  get privateKey() {
    return process.env.TRIPAY_PRIVATE_KEY || '';
  },
  get merchantCode() {
    return process.env.TRIPAY_MERCHANT_CODE || '';
  },
  get environment() {
    return (process.env.TRIPAY_ENVIRONMENT || 'sandbox').toLowerCase();
  },
  get callbackUrl() {
    return process.env.TRIPAY_CALLBACK_URL || `${process.env.APP_URL || 'http://localhost:3000'}/api/tripay-webhook`;
  },
  get baseUrl() {
    return (process.env.TRIPAY_ENVIRONMENT || 'sandbox').toLowerCase() === 'production'
      ? 'https://tripay.co.id/api'
      : 'https://tripay.co.id/api-sandbox';
  }
};

export interface CreatePaymentRequest {
  tenant_id: string;
  email: string;
  nama_paket: string;
  amount: number;
  payment_method?: string; // 'QRIS' | 'BCAVA' | 'BRIVA' | 'MANDIRIVA' | 'BNIVA'
  customer_name?: string;
  customer_phone?: string;
  return_url?: string;
}

export interface TriPayTransaction {
  reference: string;
  merchant_ref: string;
  payment_selection_type?: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  callback_url: string;
  return_url: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_amount: number;
  fee: number;
  checkout_url: string;
  status: 'UNPAID' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUND';
  paid_at?: string | null;
  expired_time: number;
  qr_string?: string;
  qr_url?: string;
  pay_code?: string;
  instructions?: Array<{
    title: string;
    steps: string[];
  }>;
  tenant_id: string;
  nama_paket: string;
  created_at: string;
}

export interface TenantCloudLicense {
  tenant_id: string;
  email: string;
  plan_type: 'free_plan' | 'paid_plan';
  is_paid: boolean;
  valid_until: string;
  updated_at: string;
  nama_paket: string;
  last_reference: string;
  selected_primary_module?: string;
}

// In-Memory Database dengan Fallback ke File JSON Lokal
const DATA_DIR = path.resolve(process.cwd(), 'data');
const LICENSES_FILE = path.join(DATA_DIR, 'tenant_licenses.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'tripay_transactions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadJson<T>(filePath: string, defaultData: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[TriPay Service] Gagal membaca ${filePath}:`, err);
  }
  return defaultData;
}

function saveJson<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[TriPay Service] Gagal menulis ke ${filePath}:`, err);
  }
}

const transactionsDb = new Map<string, TriPayTransaction>(
  Object.entries(loadJson<Record<string, TriPayTransaction>>(TRANSACTIONS_FILE, {}))
);

const tenantLicensesDb = new Map<string, TenantCloudLicense>(
  Object.entries(loadJson<Record<string, TenantCloudLicense>>(LICENSES_FILE, {}))
);

function persistTransactions() {
  const obj: Record<string, TriPayTransaction> = {};
  transactionsDb.forEach((v, k) => {
    obj[k] = v;
  });
  saveJson(TRANSACTIONS_FILE, obj);
}

function persistLicenses() {
  const obj: Record<string, TenantCloudLicense> = {};
  tenantLicensesDb.forEach((v, k) => {
    obj[k] = v;
  });
  saveJson(LICENSES_FILE, obj);
}

/**
 * 1. Membuat signature TriPay untuk Closed Payment
 * Formula TriPay: HMAC-SHA256(merchantCode + merchantRef + amount, privateKey)
 */
export function generateTriPaySignature(
  merchantRef: string,
  amount: number,
  merchantCode: string = TRIPAY_CONFIG.merchantCode,
  privateKey: string = TRIPAY_CONFIG.privateKey
): string {
  const payload = `${merchantCode}${merchantRef}${amount}`;
  return crypto.createHmac('sha256', privateKey).update(payload).digest('hex');
}

/**
 * 2. Memvalidasi Signature Callback Webhook dari TriPay
 * Formula TriPay Callback: HMAC-SHA256(rawBody, privateKey) dicocokkan dengan header X-Callback-Signature
 */
export function verifyTriPayWebhookSignature(
  rawBody: Buffer | string,
  incomingSignature: string,
  privateKey: string = TRIPAY_CONFIG.privateKey
): boolean {
  if (!incomingSignature) return false;
  
  // Jika belum setting private key di environment, izinkan di sandbox/test mode
  if (!privateKey || privateKey === 'your_tripay_private_key_here') {
    console.warn('[TriPay Webhook] Peringatan: TRIPAY_PRIVATE_KEY belum disetel di .env. Menggunakan sandbox validation bypass.');
    return true;
  }

  const calculated = crypto
    .createHmac('sha256', privateKey)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(incomingSignature, 'utf-8'),
      Buffer.from(calculated, 'utf-8')
    );
  } catch {
    return incomingSignature === calculated;
  }
}

/**
 * 3. Membuat Transaksi Pembayaran TriPay (/api/create-payment)
 */
export async function createTriPayPayment(
  reqData: CreatePaymentRequest
): Promise<TriPayTransaction> {
  const {
    tenant_id,
    email,
    nama_paket,
    amount,
    payment_method = 'QRIS',
    customer_name,
    customer_phone = '081234567890',
    return_url
  } = reqData;

  if (!email || !amount || amount <= 0) {
    throw new Error('Email dan amount yang valid wajib disertakan.');
  }

  const cleanAmount = Math.round(Number(amount));
  const merchantRef = `UQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanName = customer_name || email.split('@')[0] || 'Pemilik UsahaQu';
  const cleanMethod = (payment_method || 'QRIS').toUpperCase();

  const isRealCredentialsSet =
    TRIPAY_CONFIG.apiKey &&
    TRIPAY_CONFIG.apiKey !== 'your_tripay_api_key_here' &&
    TRIPAY_CONFIG.privateKey &&
    TRIPAY_CONFIG.privateKey !== 'your_tripay_private_key_here' &&
    TRIPAY_CONFIG.merchantCode &&
    TRIPAY_CONFIG.merchantCode !== 'your_tripay_merchant_code_here';

  // Jika kredensial TriPay asli sudah disetel, lakukan HTTP POST ke API TriPay
  if (isRealCredentialsSet) {
    try {
      const signature = generateTriPaySignature(merchantRef, cleanAmount);
      const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 Jam

      const payload = {
        method: cleanMethod,
        merchant_ref: merchantRef,
        amount: cleanAmount,
        customer_name: cleanName,
        customer_email: email,
        customer_phone: customer_phone,
        order_items: [
          {
            sku: `UQ-${nama_paket.replace(/\s+/g, '-').toUpperCase()}`,
            name: `Upgrade UsahaQu v1.83 (${nama_paket})`,
            price: cleanAmount,
            quantity: 1
          }
        ],
        callback_url: TRIPAY_CONFIG.callbackUrl,
        return_url: return_url || `${process.env.APP_URL || 'http://localhost:3000'}?payment_success=true`,
        expired_time: expiredTime,
        signature: signature
      };

      const response = await fetch(`${TRIPAY_CONFIG.baseUrl}/transaction/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TRIPAY_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'TriPay API call gagal.');
      }

      const triData = responseData.data;
      const tx: TriPayTransaction = {
        reference: triData.reference,
        merchant_ref: triData.merchant_ref || merchantRef,
        payment_method: triData.payment_method || cleanMethod,
        payment_name: triData.payment_name || cleanMethod,
        customer_name: cleanName,
        customer_email: email,
        customer_phone: customer_phone,
        callback_url: TRIPAY_CONFIG.callbackUrl,
        return_url: payload.return_url,
        amount: cleanAmount,
        fee_merchant: triData.fee_merchant || 0,
        fee_customer: triData.fee_customer || 0,
        total_amount: triData.amount || cleanAmount,
        fee: (triData.fee_merchant || 0) + (triData.fee_customer || 0),
        checkout_url: triData.checkout_url,
        status: triData.status || 'UNPAID',
        expired_time: triData.expired_time || expiredTime,
        qr_string: triData.qr_string,
        qr_url: triData.qr_url,
        pay_code: triData.pay_code,
        instructions: triData.instructions,
        tenant_id,
        nama_paket,
        created_at: new Date().toISOString()
      };

      transactionsDb.set(tx.reference, tx);
      persistTransactions();
      return tx;
    } catch (err: any) {
      console.warn('[TriPay Service] Panggilan API riil gagal, mengalihkan ke Mock/Sandbox Simulator:', err.message);
      // Fallback ke Sandbox Engine Simulator di bawah
    }
  }

  // Fallback: Sandbox / Simulator Engine TriPay (Berfungsi 100% tanpa registrasi merchant)
  const mockReference = `DEV-TP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  
  // Kode bayar VA simulasi atau QRIS
  let payCode = '';
  let qrString = '';
  let qrUrl = '';

  if (cleanMethod === 'QRIS') {
    qrString = `00020101021226600016ID.CO.TRIPAY.WWW011893600002${Date.now()}5204581253033605802ID5912UsahaQu POS6007Jakarta62070703A016304`;
    qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
  } else {
    // Virtual Account Simulator
    const prefixMap: Record<string, string> = {
      BCAVA: '70012',
      BRIVA: '12800',
      MANDIRIVA: '88708',
      BNIVA: '98814',
      PERMATAVA: '85220'
    };
    const prefix = prefixMap[cleanMethod] || '88012';
    payCode = `${prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  const checkoutUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/tripay-mock-checkout?ref=${mockReference}`;

  const mockTransaction: TriPayTransaction = {
    reference: mockReference,
    merchant_ref: merchantRef,
    payment_method: cleanMethod,
    payment_name: cleanMethod === 'QRIS' ? 'QRIS (Gopay / OVO / Dana / ShopeePay / BCA)' : `Virtual Account ${cleanMethod.replace('VA', '')}`,
    customer_name: cleanName,
    customer_email: email,
    customer_phone: customer_phone,
    callback_url: TRIPAY_CONFIG.callbackUrl,
    return_url: return_url || `${process.env.APP_URL || 'http://localhost:3000'}?payment_success=true`,
    amount: cleanAmount,
    fee_merchant: 0,
    fee_customer: cleanMethod === 'QRIS' ? Math.round(cleanAmount * 0.007) : 4000,
    total_amount: cleanAmount,
    fee: cleanMethod === 'QRIS' ? Math.round(cleanAmount * 0.007) : 4000,
    checkout_url: checkoutUrl,
    status: 'UNPAID',
    expired_time: expiredTime,
    qr_string: qrString,
    qr_url: qrUrl,
    pay_code: payCode,
    instructions: [
      {
        title: cleanMethod === 'QRIS' ? 'Petunjuk Pembayaran QRIS' : `Petunjuk Pembayaran ${cleanMethod}`,
        steps: cleanMethod === 'QRIS' 
          ? [
              'Buka aplikasi BCA Mobile, GoPay, OVO, Dana, atau ShopeePay.',
              'Pilih menu Scan / Bayar QR.',
              'Scan kode QR yang tampil di layar.',
              'Periksa nama merchant: UsahaQu POS dan total tagihan.',
              'Masukkan PIN akun Anda untuk menyelesaikan pembayaran.'
            ]
          : [
              `Buka aplikasi Mobile Banking / ATM pilihan Anda.`,
              `Pilih menu Transfer > Virtual Account.`,
              `Masukkan Nomor VA: ${payCode}`,
              `Pastikan total pembayaran sesuai tagihan.`,
              `Konfirmasi pembayaran dengan PIN Anda.`
            ]
      }
    ],
    tenant_id,
    nama_paket,
    created_at: new Date().toISOString()
  };

  transactionsDb.set(mockReference, mockTransaction);
  persistTransactions();

  return mockTransaction;
}

/**
 * 4. Memproses Callback Webhook TriPay (/api/tripay-webhook)
 * Memperbarui database tenant di Cloud / Backend:
 * - plan_type = 'paid_plan'
 * - is_paid = true
 * - valid_until = +1 Tahun
 */
export async function processTriPayWebhook(payload: any): Promise<{
  success: boolean;
  message: string;
  updated_license?: TenantCloudLicense;
}> {
  const {
    reference,
    merchant_ref,
    status,
    total_amount,
    paid_at,
    note
  } = payload;

  if (!reference && !merchant_ref) {
    throw new Error('Payload webhook tidak memiliki reference transaksi.');
  }

  // Temukan transaksi
  let tx = transactionsDb.get(reference);
  if (!tx && merchant_ref) {
    for (const item of transactionsDb.values()) {
      if (item.merchant_ref === merchant_ref) {
        tx = item;
        break;
      }
    }
  }

  if (!tx) {
    // Buat transaksi baru jika tidak ditemukan di in-memory cache
    tx = {
      reference: reference || `TRX-${Date.now()}`,
      merchant_ref: merchant_ref || `REF-${Date.now()}`,
      payment_method: payload.payment_method || 'QRIS',
      payment_name: payload.payment_name || 'TriPay Payment',
      customer_name: payload.customer_name || 'Tenant UsahaQu',
      customer_email: payload.customer_email || 'tenant@usahaqu.id',
      customer_phone: payload.customer_phone || '-',
      callback_url: TRIPAY_CONFIG.callbackUrl,
      return_url: '',
      amount: total_amount || 0,
      fee_merchant: 0,
      fee_customer: 0,
      total_amount: total_amount || 0,
      fee: 0,
      checkout_url: '',
      status: (status || 'UNPAID').toUpperCase(),
      expired_time: Math.floor(Date.now() / 1000) + 86400,
      tenant_id: payload.tenant_id || payload.customer_email || 'default-tenant',
      nama_paket: 'Paket UsahaQu Pro',
      created_at: new Date().toISOString()
    };
  }

  const cleanStatus = (status || '').toUpperCase();
  tx.status = cleanStatus as any;
  if (paid_at) tx.paid_at = paid_at;

  transactionsDb.set(tx.reference, tx);
  persistTransactions();

  // Jika status = 'PAID', update Lisensi Tenant di Database Cloud
  if (cleanStatus === 'PAID') {
    const tenantId = tx.tenant_id || tx.customer_email || 'default-tenant';
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const licenseData: TenantCloudLicense = {
      tenant_id: tenantId,
      email: tx.customer_email,
      plan_type: 'paid_plan',
      is_paid: true,
      valid_until: oneYearFromNow,
      updated_at: new Date().toISOString(),
      nama_paket: tx.nama_paket || 'Paket UsahaQu Pro',
      last_reference: tx.reference
    };

    tenantLicensesDb.set(tenantId, licenseData);
    persistLicenses();

    console.log(`[TriPay Webhook] Lisensi tenant ${tenantId} BERHASIL DIPERBARUI ke 'paid_plan' (+1 Tahun hingga ${oneYearFromNow})`);

    return {
      success: true,
      message: `Pembayaran ${tx.reference} berhasil diverifikasi. Lisensi tenant ${tenantId} telah diperbarui ke PAID.`,
      updated_license: licenseData
    };
  }

  return {
    success: true,
    message: `Status pembayaran transaksi ${tx.reference} diperbarui ke ${cleanStatus}.`
  };
}

/**
 * 5. Cek Status Pembayaran untuk Polling Frontend (/api/payment-status/:reference)
 */
export function getPaymentStatus(reference: string): {
  found: boolean;
  transaction?: TriPayTransaction;
  license?: TenantCloudLicense;
} {
  const tx = transactionsDb.get(reference);
  if (!tx) {
    return { found: false };
  }

  const tenantId = tx.tenant_id || tx.customer_email;
  const license = tenantLicensesDb.get(tenantId);

  return {
    found: true,
    transaction: tx,
    license
  };
}

/**
 * 6. Simulasi Pembayaran Sukses (Khusus Sandbox / Demo UI Testing)
 */
export async function simulatePaymentSuccess(reference: string) {
  const tx = transactionsDb.get(reference);
  if (!tx) {
    throw new Error(`Transaksi dengan reference ${reference} tidak ditemukan.`);
  }

  return await processTriPayWebhook({
    reference: tx.reference,
    merchant_ref: tx.merchant_ref,
    status: 'PAID',
    total_amount: tx.total_amount,
    paid_at: new Date().toISOString(),
    customer_email: tx.customer_email,
    tenant_id: tx.tenant_id,
    payment_method: tx.payment_method
  });
}
