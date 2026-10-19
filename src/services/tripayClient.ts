/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - TriPay Frontend Client Service
 * Menghubungkan antarmuka Frontend dengan Endpoint Backend TriPay:
 * 1. createPayment -> POST /api/create-payment
 * 2. checkPaymentStatus -> GET /api/payment-status/:reference
 * 3. startPaymentPolling -> Polling real-time & sinkronisasi otomatis lisensi LocalStorage
 * 4. simulatePaymentSuccess -> Helper pengujian instan mode Sandbox
 */

import { activateLicenseKey, saveLicense, getLicense, LicenseMetadata } from '../engine/licenseEngine';

export interface TriPayCreatePaymentInput {
  tenant_id: string;
  email: string;
  nama_paket: string;
  amount: number;
  payment_method?: string; // 'QRIS' | 'BCAVA' | 'BRIVA' | 'MANDIRIVA' | 'BNIVA'
  customer_name?: string;
  customer_phone?: string;
  return_url?: string;
}

export interface TriPayPaymentResponse {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  total_amount: number;
  checkout_url: string;
  status: 'UNPAID' | 'PAID' | 'FAILED' | 'EXPIRED';
  qr_string?: string;
  qr_url?: string;
  pay_code?: string;
  expired_time: number;
  instructions?: Array<{
    title: string;
    steps: string[];
  }>;
}

/**
 * 1. Panggil Endpoint Backend /api/create-payment
 */
export async function createPayment(
  input: TriPayCreatePaymentInput
): Promise<{ success: boolean; data?: TriPayPaymentResponse; message?: string }> {
  try {
    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.message || 'Gagal membuat transaksi pembayaran.'
      };
    }

    return {
      success: true,
      data: json.data,
      message: json.message
    };
  } catch (err: any) {
    console.error('[TriPay Client] Gagal memanggil /api/create-payment:', err);
    return {
      success: false,
      message: err.message || 'Koneksi ke backend server gagal.'
    };
  }
}

/**
 * 2. Cek status pembayaran ke /api/payment-status/:reference
 */
export async function checkPaymentStatus(
  reference: string
): Promise<{ success: boolean; status?: string; data?: any; license?: any; message?: string }> {
  try {
    const res = await fetch(`/api/payment-status/${encodeURIComponent(reference)}`);
    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal mengecek status pembayaran.'
    };
  }
}

/**
 * 3. Jalankan Polling Real-time Status Pembayaran
 * Begitu pembayaran terdeteksi 'PAID', otomatis sinkronkan lisensi LocalStorage dan emit event UI
 */
export function startPaymentPolling(
  reference: string,
  onPaid: (payload: { transaction: TriPayPaymentResponse; license: LicenseMetadata }) => void,
  onFailed?: (msg: string) => void,
  intervalMs: number = 2500
): () => void {
  let isStopped = false;
  let timerId: any = null;

  async function poll() {
    if (isStopped) return;

    try {
      const result = await checkPaymentStatus(reference);

      if (result.success && result.status === 'PAID') {
        isStopped = true;
        clearTimeout(timerId);

        // Update lisensi lokal di LocalStorage
        const activateResult = activateLicenseKey(
          `TRIPAY-${reference}`,
          'corporate',
          12
        );

        // Emit custom event agar seluruh header & komponen UI reaktif memperbarui tampilan
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('usahaqu:license-updated', {
              detail: {
                reference,
                license: activateResult.license
              }
            })
          );
        }

        onPaid({
          transaction: result.data,
          license: activateResult.license || getLicense()
        });
        return;
      }

      if (result.success && (result.status === 'EXPIRED' || result.status === 'FAILED')) {
        isStopped = true;
        clearTimeout(timerId);
        if (onFailed) onFailed(`Transaksi telah ${result.status.toLowerCase()}.`);
        return;
      }
    } catch (e) {
      console.warn('[TriPay Polling] Kesalahan sementara polling:', e);
    }

    if (!isStopped) {
      timerId = setTimeout(poll, intervalMs);
    }
  }

  // Mulai polling pertama setelah interval
  timerId = setTimeout(poll, intervalMs);

  // Return cancel function
  return () => {
    isStopped = true;
    if (timerId) clearTimeout(timerId);
  };
}

/**
 * 4. Panggil Endpoint Simulasi Bayar Lunas (Khusus Sandbox Testing)
 */
export async function simulatePaymentSuccess(reference: string): Promise<boolean> {
  try {
    const res = await fetch('/api/simulate-payment-success', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reference })
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}
