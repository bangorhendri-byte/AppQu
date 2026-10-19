/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - Vercel Serverless Function: /api/create-payment
 * Menerima request upgrade paket dari Frontend, menghasilkan HMAC SHA-256 signature,
 * dan memanggil TriPay API (Open / Closed Payment).
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
  // Hanya izinkan HTTP POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Metode HTTP tidak diizinkan. Gunakan POST.' });
  }

  try {
    const {
      tenant_id,
      email,
      nama_paket,
      amount,
      payment_method = 'QRIS',
      customer_name,
      customer_phone = '081234567890',
      return_url
    } = req.body;

    if (!email || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tenant_id, email, nama_paket, dan amount valid wajib disertakan.'
      });
    }

    const cleanAmount = Math.round(Number(amount));
    const merchantRef = `UQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanName = customer_name || (email ? email.split('@')[0] : 'Pemilik UsahaQu');
    const cleanMethod = (payment_method || 'QRIS').toUpperCase();

    const apiKey = process.env.TRIPAY_API_KEY;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
    const isProduction = (process.env.TRIPAY_ENVIRONMENT || 'sandbox').toLowerCase() === 'production';
    const baseUrl = isProduction ? 'https://tripay.co.id/api' : 'https://tripay.co.id/api-sandbox';
    const callbackUrl = process.env.TRIPAY_CALLBACK_URL || `${process.env.APP_URL || 'http://localhost:3000'}/api/tripay-webhook`;

    const isRealCredentialsSet =
      apiKey &&
      apiKey !== 'your_tripay_api_key_here' &&
      privateKey &&
      privateKey !== 'your_tripay_private_key_here' &&
      merchantCode &&
      merchantCode !== 'your_tripay_merchant_code_here';

    if (isRealCredentialsSet) {
      // Buat Signature TriPay Closed Payment: HMAC-SHA256(merchantCode + merchantRef + amount, privateKey)
      const signaturePayload = `${merchantCode}${merchantRef}${cleanAmount}`;
      const signature = crypto.createHmac('sha256', privateKey).update(signaturePayload).digest('hex');
      const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 Jam

      const tripayPayload = {
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
        callback_url: callbackUrl,
        return_url: return_url || `${process.env.APP_URL || 'http://localhost:3000'}?payment_success=true`,
        expired_time: expiredTime,
        signature: signature
      };

      const tripayResponse = await fetch(`${baseUrl}/transaction/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripayPayload)
      });

      const responseJson = await tripayResponse.json();

      if (!tripayResponse.ok || !responseJson.success) {
        return res.status(tripayResponse.status || 400).json({
          success: false,
          message: responseJson.message || 'TriPay API call gagal.',
          data: responseJson
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Transaksi TriPay berhasil dibuat',
        data: responseJson.data
      });
    }

    // Fallback Sandbox Simulation jika kredensial belum diisi di .env
    const mockRef = `DEV-TP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const qrString = `00020101021226600016ID.CO.TRIPAY.WWW011893600002${Date.now()}5204581253033605802ID5912UsahaQu POS6007Jakarta62070703A016304`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;

    return res.status(200).json({
      success: true,
      message: 'Transaksi simulasi TriPay Sandbox berhasil dibuat (Mode Sandbox)',
      data: {
        reference: mockRef,
        merchant_ref: merchantRef,
        payment_method: cleanMethod,
        payment_name: cleanMethod === 'QRIS' ? 'QRIS (Gopay / OVO / Dana / ShopeePay / BCA)' : `Virtual Account ${cleanMethod}`,
        customer_name: cleanName,
        customer_email: email,
        amount: cleanAmount,
        total_amount: cleanAmount,
        checkout_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/tripay-mock-checkout?ref=${mockRef}`,
        qr_string: qrString,
        qr_url: qrUrl,
        pay_code: cleanMethod !== 'QRIS' ? `88012${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
        status: 'UNPAID',
        expired_time: Math.floor(Date.now() / 1000) + 86400
      }
    });
  } catch (err: any) {
    console.error('TriPay create-payment error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
}
