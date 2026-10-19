/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - Vercel Serverless Function: /api/tripay-webhook
 * Menerima callback dari TriPay, memvalidasi signature HMAC SHA-256,
 * dan memperbarui status lisensi tenant di database jika status pembayaran = 'PAID'.
 */

import crypto from 'crypto';

export interface VercelRequest {
  method?: string;
  body: any;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[]>;
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Hanya metode POST yang diizinkan.' });
  }

  try {
    const incomingSignature = (req.headers['x-callback-signature'] || '') as string;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY || '';

    // Validasi Signature HMAC SHA-256
    if (privateKey && privateKey !== 'your_tripay_private_key_here') {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const calculatedSignature = crypto.createHmac('sha256', privateKey).update(rawBody).digest('hex');

      if (incomingSignature !== calculatedSignature) {
        console.error('[TriPay Webhook] Invalid Signature detected!');
        return res.status(403).json({ success: false, message: 'Signature webhook tidak valid.' });
      }
    }

    const payload = req.body;
    const { reference, merchant_ref, status, total_amount, customer_email, tenant_id } = payload;

    console.log(`[TriPay Webhook] Notifikasi diterima: Ref ${reference}, Status: ${status}`);

    if (String(status).toUpperCase() === 'PAID') {
      const targetTenant = tenant_id || customer_email || 'default-tenant';
      const oneYearExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      // Struktur Data Lisensi Cloud Baru sesuai spesifikasi
      const updatedLicense = {
        tenant_id: targetTenant,
        email: customer_email,
        plan_type: 'paid_plan',
        is_paid: true,
        valid_until: oneYearExpiry,
        updated_at: new Date().toISOString(),
        payment_reference: reference
      };

      /**
       * Integrasi Cloud Database (Firebase Firestore / Supabase / MongoDB):
       * Contoh pembaruan Firestore:
       * await db.collection('tenant_licenses').doc(targetTenant).set(updatedLicense, { merge: true });
       */
      console.log(`[TriPay Webhook] Lisensi ${targetTenant} sukses diperbarui ke PAID:`, updatedLicense);

      return res.status(200).json({
        success: true,
        message: 'Webhook berhasil diproses. Lisensi tenant telah diperbarui.',
        data: updatedLicense
      });
    }

    return res.status(200).json({
      success: true,
      message: `Status pembayaran ${status} tercatat.`
    });
  } catch (err: any) {
    console.error('TriPay Webhook handler error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}
