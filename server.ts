/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UsahaQu v1.83 - Full-Stack Express Server
 * Menyediakan Endpoint API Backend untuk Integrasi Pembayaran Otomatis TriPay:
 * 1. POST /api/create-payment (Pembuatan Transaksi & Signature TriPay)
 * 2. POST /api/tripay-webhook (Callback Notifikasi & Validasi HMAC Signature)
 * 3. GET  /api/payment-status/:reference (Polling Status Pembayaran dari Frontend)
 * 4. POST /api/simulate-payment-success (Sandbox Helper Testing Pembayaran Berhasil)
 * 5. GET  /api/tripay-mock-checkout (Halaman Webview Checkout Simulator TriPay)
 * 
 * Terintegrasi dengan Vite Middleware di mode dev dan Static dist di mode production.
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  createTriPayPayment,
  processTriPayWebhook,
  verifyTriPayWebhookSignature,
  getPaymentStatus,
  simulatePaymentSuccess,
  TRIPAY_CONFIG
} from './src/server/tripayService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

interface CustomRequest extends Request {
  rawBody?: Buffer;
}

async function startServer() {
  const app = express();

  // Simpan rawBody untuk validasi HMAC SHA-256 Signature pada Webhook TriPay
  app.use(
    express.json({
      verify: (req: CustomRequest, _res: Response, buf: Buffer) => {
        req.rawBody = buf;
      }
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // CORS Middleware sederhana untuk pengujian API
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,x-callback-signature,x-callback-event');
    next();
  });

  // =========================================================================
  // 1. ENDPOINT: /api/create-payment
  // =========================================================================
  app.post('/api/create-payment', async (req: Request, res: Response) => {
    try {
      const {
        tenant_id,
        email,
        nama_paket,
        amount,
        payment_method,
        customer_name,
        customer_phone,
        return_url
      } = req.body;

      if (!email || !amount || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Parameter tenant_id, email, nama_paket, dan amount yang valid wajib diisi.'
        });
      }

      const tx = await createTriPayPayment({
        tenant_id: tenant_id || email,
        email,
        nama_paket: nama_paket || 'Paket Pro UsahaQu',
        amount: Number(amount),
        payment_method: payment_method || 'QRIS',
        customer_name,
        customer_phone,
        return_url
      });

      console.log(`[API /api/create-payment] Transaksi dibuat: Ref ${tx.reference}, ${tx.payment_method}, Rp ${tx.total_amount}`);

      return res.status(200).json({
        success: true,
        message: 'Transaksi TriPay berhasil dibuat',
        data: tx
      });
    } catch (err: any) {
      console.error('[API /api/create-payment Error]:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Gagal memproses pembayaran TriPay.'
      });
    }
  });

  // =========================================================================
  // 2. ENDPOINT: /api/tripay-webhook
  // =========================================================================
  app.post('/api/tripay-webhook', async (req: CustomRequest, res: Response) => {
    try {
      const incomingSignature = (req.headers['x-callback-signature'] || '') as string;
      const callbackEvent = (req.headers['x-callback-event'] || '') as string;

      console.log(`[API /api/tripay-webhook] Event: ${callbackEvent}, Signature: ${incomingSignature ? incomingSignature.substring(0, 10) + '...' : 'none'}`);

      // Validasi HMAC Signature
      const isValid = verifyTriPayWebhookSignature(
        req.rawBody || JSON.stringify(req.body),
        incomingSignature
      );

      if (!isValid) {
        console.warn('[API /api/tripay-webhook] Penolakan: Signature HMAC TriPay tidak valid!');
        return res.status(403).json({
          success: false,
          message: 'Signature TriPay tidak valid.'
        });
      }

      const result = await processTriPayWebhook(req.body);

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[API /api/tripay-webhook Error]:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Gagal memproses webhook TriPay.'
      });
    }
  });

  // =========================================================================
  // 3. ENDPOINT: /api/payment-status/:reference (Polling status dari Frontend)
  // =========================================================================
  app.get('/api/payment-status/:reference', (req: Request, res: Response) => {
    try {
      const { reference } = req.params;
      const statusData = getPaymentStatus(reference);

      if (!statusData.found || !statusData.transaction) {
        return res.status(404).json({
          success: false,
          message: `Transaksi dengan reference ${reference} tidak ditemukan.`
        });
      }

      return res.status(200).json({
        success: true,
        status: statusData.transaction.status,
        data: statusData.transaction,
        license: statusData.license
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Gagal mengambil status pembayaran.'
      });
    }
  });

  // =========================================================================
  // 4. ENDPOINT: /api/simulate-payment-success (Simulator Sandbox Testing)
  // =========================================================================
  app.post('/api/simulate-payment-success', async (req: Request, res: Response) => {
    try {
      const { reference } = req.body;
      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Parameter reference wajib disertakan.'
        });
      }

      const result = await simulatePaymentSuccess(reference);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Gagal mensimulasikan pembayaran sukses.'
      });
    }
  });

  // =========================================================================
  // 5. ENDPOINT: /api/tripay-mock-checkout (Webview Simulator Halaman TriPay)
  // =========================================================================
  app.get('/api/tripay-mock-checkout', (req: Request, res: Response) => {
    const ref = (req.query.ref || '') as string;
    const txData = getPaymentStatus(ref);

    if (!txData.found || !txData.transaction) {
      return res.send(`
        <div style="font-family:sans-serif;padding:40px;text-align:center;">
          <h2>Transaksi Tidak Ditemukan</h2>
          <p>Reference: ${ref || '-'}</p>
        </div>
      `);
    }

    const tx = txData.transaction;

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TriPay Payment Simulator • UsahaQu v1.83</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div class="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div class="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                TriPay Payment Gateway
              </span>
              <h1 class="text-lg font-black mt-1">UsahaQu Billing</h1>
            </div>
            <div class="text-right">
              <span class="text-xs text-blue-200">Total Tagihan</span>
              <p class="text-lg font-black text-amber-300">Rp ${tx.total_amount.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div class="flex justify-between text-slate-500">
                <span>No. Referensi:</span>
                <span class="font-mono font-bold text-slate-800">${tx.reference}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Paket Upgrade:</span>
                <span class="font-bold text-slate-800">${tx.nama_paket}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Metode Bayar:</span>
                <span class="font-bold text-indigo-700">${tx.payment_name}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Pelanggan:</span>
                <span class="font-bold text-slate-800">${tx.customer_email}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Status Saat Ini:</span>
                <span id="badge-status" class="px-2 py-0.5 rounded font-black ${tx.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${tx.status}
                </span>
              </div>
            </div>

            ${tx.payment_method === 'QRIS' && tx.qr_url ? `
              <div class="text-center p-4 bg-white border border-slate-200 rounded-2xl">
                <p class="text-xs font-bold text-slate-700 mb-2">Scan QRIS Menggunakan BCA, GoPay, OVO, Dana, atau ShopeePay</p>
                <img src="${tx.qr_url}" alt="QRIS Code" class="w-48 h-48 mx-auto rounded-xl shadow-inner border border-slate-100" />
                <p class="text-[10px] text-slate-400 mt-2">NMID: ID102003849102 • UsahaQu POS</p>
              </div>
            ` : `
              <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-center">
                <span class="text-xs text-indigo-700 font-bold">Nomor Virtual Account (${tx.payment_method}):</span>
                <div class="text-xl font-mono font-black text-indigo-950 mt-1 select-all tracking-wider">
                  ${tx.pay_code || '88012081234567'}
                </div>
                <p class="text-[11px] text-slate-500 mt-1">Salin nomor VA dan bayar via ATM / Mobile Banking</p>
              </div>
            `}

            <div class="pt-2 space-y-2">
              <button 
                id="btn-simulate-pay"
                onclick="simulatePay()" 
                class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Simulasikan Bayar Lunas (Testing)</span>
                <span>&rarr;</span>
              </button>

              <p class="text-[10px] text-center text-slate-400 leading-relaxed">
                Mode Simulator TriPay UsahaQu v1.83. Begitu Anda mengklik tombol di atas, webhook akan dipanggil otomatis dan lisensi Anda diaktifkan 100%.
              </p>
            </div>
          </div>
        </div>

        <script>
          async function simulatePay() {
            const btn = document.getElementById('btn-simulate-pay');
            btn.disabled = true;
            btn.innerText = 'Memverifikasi Pembayaran...';

            try {
              const res = await fetch('/api/simulate-payment-success', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: '${tx.reference}' })
              });
              const json = await res.json();
              if (json.success) {
                document.getElementById('badge-status').className = 'px-2 py-0.5 rounded font-black bg-emerald-100 text-emerald-800';
                document.getElementById('badge-status').innerText = 'PAID';
                btn.className = 'w-full py-3 bg-emerald-800 text-white font-black text-sm rounded-xl';
                btn.innerText = 'Pembayaran Berhasil Diverifikasi!';
                setTimeout(() => {
                  window.close();
                }, 1500);
              } else {
                alert('Gagal: ' + json.message);
                btn.disabled = false;
                btn.innerText = 'Coba Lagi';
              }
            } catch (err) {
              alert('Error: ' + err.message);
              btn.disabled = false;
            }
          }
        </script>
      </body>
      </html>
    `);
  });

  // =========================================================================
  // 6. ENDPOINT: /api/customer-care/troubleshoot (AI Customer Care & Troubleshoot)
  // Integrasi Gemini AI 'gemini-3.8-flash' Gratis untuk Bantuan Teknis BengkelQu
  // =========================================================================
  app.post('/api/customer-care/troubleshoot', async (req: Request, res: Response) => {
    try {
      const { category, issueTitle, issueDetails, appContext } = req.body;

      if (!issueTitle && !issueDetails) {
        return res.status(400).json({
          success: false,
          message: 'Harap masukkan judul atau rincian masalah teknis yang dialami.'
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const prompt = `Anda adalah Customer Care & Ahli Diagnostik Teknis Resmi BengkelQu (UsahaQu Ecosystem).
Bantu pengguna (pemilik bengkel / kasir / mekanik) menyelesaikan masalah aplikasi secara terstruktur, ramah, dan solutif.

INFORMASI MASALAH DARI PENGGUNA:
- Kategori Kendala: ${category || 'Umum'}
- Judul Masalah: ${issueTitle || '-'}
- Detail & Gejala Masalah: ${issueDetails || '-'}

DATA SISTEM & APLIKASI:
- Nama Bengkel: ${appContext?.workshopName || 'Bengkel Qu'}
- Versi Aplikasi: ${appContext?.version || '1.87.0'}
- Device ID: ${appContext?.deviceId || '-'}
- Jumlah Antrian Unit: ${appContext?.queuesCount || 0}
- Jumlah Katalog Sparepart: ${appContext?.sparepartsCount || 0}
- Total Riwayat Transaksi: ${appContext?.transactionsCount || 0}

TUGAS ANDA:
Berikan panduan diagnosis teknis dalam format Markdown yang rapi dan mudah dibaca:
1. 🔍 **Analisis Kemungkinan Penyebab**: Jelaskan secara spesifik 2-3 kemungkinan penyebab teknis masalah tersebut (misal: IndexedDB storage, cache PWA browser, batasan hak akses role, setelan print thermal kasir, rumus komisi jasa, dsb).
2. 🛠️ **Langkah Solusi & Troubleshooting (Step-by-Step)**: Berikan panduan langkah-demi-langkah (Langkah 1, Langkah 2, Langkah 3) yang jelas dan bisa langsung dipraktikkan di aplikasi BengkelQu atau browser.
3. 💡 **Tips Pencegahan & Rekomendasi Operasional**: 1-2 tips agar kendala tidak terjadi lagi (misal: rutin download Backup JSON di menu Setting > Backup, audit integritas PWA, cek koneksi).
4. ✉️ **Eskalasi Dukungan**: Beritahu pengguna bahwa bila kendala belum tuntas, mereka dapat langsung menekan tombol "Kirim Email ke Developer" di aplikasi ini untuk eskalasi log diagnostik lengkap ke developer teknis.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Anda adalah asisten teknis AI Customer Care resmi BengkelQu. Selalu berikan jawaban dalam Bahasa Indonesia yang ramah, sopan, bernada profesional, dan memandu langkah solusi teknis yang tepat sasaran.',
            temperature: 0.6
          }
        });

        const solutionMarkdown = aiResponse.text || 'Diagnosis AI telah selesai.';

        return res.status(200).json({
          success: true,
          source: 'gemini-ai',
          model: 'gemini-3.8-flash',
          solution: solutionMarkdown,
          timestamp: new Date().toISOString()
        });
      } else {
        // Fallback cerdas rule-based jika API key belum aktif
        const fallback = generateRuleBasedTroubleshoot(category, issueTitle, issueDetails);
        return res.status(200).json({
          success: true,
          source: 'rule-based-fallback',
          solution: fallback,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('[API /api/customer-care/troubleshoot Error]:', err);
      const fallback = generateRuleBasedTroubleshoot(req.body?.category, req.body?.issueTitle, req.body?.issueDetails);
      return res.status(200).json({
        success: true,
        source: 'rule-based-fallback',
        solution: fallback,
        errorNote: 'Bantuan cerdas disajikan dalam mode diagnostik mandiri lokal.',
        timestamp: new Date().toISOString()
      });
    }
  });

  // =========================================================================
  // INTEGRASI VITE MIDDLEWARE (DEV) ATAU STATIC (PROD)
  // =========================================================================
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[UsahaQu Server] Vite Dev Server Middleware mounted on port', PORT);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[UsahaQu Server] Production Static Files mounted from dist/');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [UsahaQu v1.83] Server berjalan di http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[UsahaQu Server Fatal Error]:', err);
});

/**
 * Helper: Menyediakan Solusi Diagnostik Mandiri Cerdas (Rule-Based Fallback)
 * Ketika API Key belum aktif atau server bekerja secara offline.
 */
function generateRuleBasedTroubleshoot(category?: string, title?: string, details?: string): string {
  const combined = `${category || ''} ${title || ''} ${details || ''}`.toLowerCase();

  if (combined.includes('struk') || combined.includes('print') || combined.includes('thermal') || combined.includes('cetak')) {
    return `### 🔍 Analisis Kemungkinan Penyebab:
1. **Pengaturan Ukuran Kertas Thermal**: Dialog cetak browser mungkin belum disetel ke lebar 58mm atau 80mm.
2. **Margin Cetak Default Browser**: Margin standar browser masih aktif sehingga teks nota kasir terpotong ke samping.
3. **Popup Blocker / Dialog Terkunci**: Browser memblokir jendela preview cetak otomatis.

### 🛠️ Langkah Solusi Mandiri:
- **Langkah 1**: Saat jendela cetak browser terbuka, klik **More settings (Setelan lainnya)**.
- **Langkah 2**: Ubah **Margins (Batas)** menjadi **"None (Nol)"** atau **"Minimum"**.
- **Langkah 3**: Pastikan pilihan ukuran kertas sesuai printer Anda (misal: *58mm Roll* atau *Receipt Paper*).
- **Langkah 4**: Centang opsi **Background graphics (Grafik latar belakang)** agar garis nota dan pembatas tampil tajam.
- **Langkah 5**: Jika menggunakan HP Android, gunakan aplikasi printer Bluetooth pihak ketiga seperti *RawBT* atau *ESC POS WiFi Print*.

### 💡 Tips Pencegahan & Rekomendasi:
Lakukan tes cetak 1 struk sebelum shift pagi dimulai. Anda juga bisa mengklik tombol **Kirim WhatsApp** di kasir sebagai alternatif struk digital tanpa kertas.`;
  }

  if (combined.includes('komisi') || combined.includes('mekanik') || combined.includes('upah')) {
    return `### 🔍 Analisis Kemungkinan Penyebab:
1. **Tipe Item Bukan 'Jasa'**: Di BengkelQu, komisi mekanik hanya dihitung dari item bertipe *Jasa Servis*. Pembelian suku cadang/part tidak dimasukkan ke komisi.
2. **Mekanik Belum Dipilih saat Checkout**: Pada kasir POS, mekanik penanggung jawab belum ditetapkan sehingga transaksi tidak tercatat atas nama teknisi tersebut.
3. **Persentase Komisi Staf Belum Disetel**: Persentase komisi di menu *Staff > Data Karyawan* masih bernilai 0%.

### 🛠️ Langkah Solusi Mandiri:
- **Langkah 1**: Buka menu **Staff / Karyawan > Data Karyawan**, lalu klik tombol Edit (ikon pensil) pada mekanik terkait.
- **Langkah 2**: Pastikan kolom **Persentase Komisi Jasa Servis (%)** sudah terisi (misal: 20% atau 25%).
- **Langkah 3**: Saat checkout di **Kasir POS**, pastikan memilih mekanik yang bertugas di kotak pilihan *Mekanik Penanggung Jawab*.
- **Langkah 4**: Cek riwayat di menu **Staff > Komisi Mekanik** untuk melihat status komisi (*Pending* atau *Dibayar*).

### 💡 Tips Pencegahan & Rekomendasi:
Gunakan fitur *+ Catat Komisi Manual* di menu Staff jika ada servis luar bengkel atau penyesuaian komisi susulan.`;
  }

  if (combined.includes('lambat') || combined.includes('lelet') || combined.includes('sync') || combined.includes('cache') || combined.includes('hilang') || combined.includes('data')) {
    return `### 🔍 Analisis Kemungkinan Penyebab:
1. **Cache PWA / Service Worker Usang**: Browser menyimpan berkas JavaScript lama setelah update sistem.
2. **Beban Data Riwayat / Memory Browser**: Terdapat ribuan cache sementara pada browser lokal perangkat.
3. **Penyimpanan IndexedDB Penuh / Kuota Storage**: Kapasitas IndexedDB pada browser perangkat hampir mencapai ambang batas.

### 🛠️ Langkah Solusi Mandiri:
- **Langkah 1**: Buka menu **Setting > Info & PWA**, lalu klik tombol **Periksa Pembaruan PWA** dan **Audit Integritas Data**.
- **Langkah 2**: Lakukan ekspor cadangan data dengan membuka **Setting > Backup JSON** agar data transaksi Anda aman tersimpan di berkas lokal.
- **Langkah 3**: Lakukan *Hard Reload* pada browser (tekan Ctrl + F5 di PC atau swipe refresh / clear cache aplikasi di Android).
- **Langkah 4**: Jika kendala persist, buka **Setting > Restore** untuk memuat ulang berkas cadangan database.

### 💡 Tips Pencegahan & Rekomendasi:
Lakukan rutinitas Backup Data JSON setiap sore hari sebelum tutup bengkel.`;
  }

  if (combined.includes('antrian') || combined.includes('servis') || combined.includes('macet') || combined.includes('unit')) {
    return `### 🔍 Analisis Kemungkinan Penyebab:
1. **Filter Antrian Aktif**: Terdapat filter pencarian plat nomor yang belum dihapus di bilah atas.
2. **Status Belum Dipindahkan**: Unit masih berada di tab *Antrian Menunggu* dan belum dipindahkan ke *Proses Servis*.
3. **Hak Akses Role Kasir/Mekanik**: Role pengguna yang sedang aktif membatasi wewenang perubahan tiket servis.

### 🛠️ Langkah Solusi Mandiri:
- **Langkah 1**: Buka menu **Servis**, pastikan kolom pencarian plat kosong.
- **Langkah 2**: Klik tab **Antrian** untuk melihat unit masuk, lalu klik tombol **Kerjakan / Mulai** untuk memindahkan unit ke **Proses Servis**.
- **Langkah 3**: Setelah pekerjaan selesai, klik **Selesai Servis**. Unit otomatis masuk ke **Kasir POS** untuk pembayaran.
- **Langkah 4**: Pastikan pengguna beralih ke role **Supervisor** jika tombol aksi pengerjaan terkunci.

### 💡 Tips Pencegahan & Rekomendasi:
Gunakan fitur tombol cepat suara (Smart Voice) saat registrasi agar pengisian data keluhan dan plat kendaraan berlangsung cepat.`;
  }

  return `### 🔍 Analisis Kemungkinan Penyebab:
1. **Sinkronisasi Sesi Lokal (Session Storage)**: Aplikasi bekerja secara offline-first dengan IndexedDB; penyesuaian terbaru mungkin membutuhkan penyegaran sesi.
2. **Konfigurasi Izin Role (RBAC)**: Fitur yang ingin Anda akses kemungkinan dibatasi untuk role pengguna yang sedang aktif saat ini.
3. **Versi Browser / WebView Android**: Versi browser Chrome atau sistem WebView pada perangkat memerlukan pembaruan berkala.

### 🛠️ Langkah Solusi Mandiri:
- **Langkah 1**: Beralihlah ke peran **Supervisor** melalui tombol ganti role di Beranda atau menu *Staff > Hak Akses* untuk membuka seluruh otorisasi fitur.
- **Langkah 2**: Simpan cadangan data operasional Anda melalui menu **Setting > Backup JSON**.
- **Langkah 3**: Buka menu **Setting > Info & PWA**, lalu jalankan pengujian diagnostik mandiri.
- **Langkah 4**: Muat ulang (reload) halaman aplikasi untuk memastikan seluruh modul terkini dimuat sempurna.

### 💡 Tips Pencegahan & Rekomendasi:
Jika kendala ini bersifat spesifik atau terdapat bug teknis baru, gunakan tombol **"Kirim Email ke Developer"** di bawah agar tim support kami dapat memeriksa log sistem Anda.`;
}
