# 🚀 Panduan Auto Version, CI/CD GitHub Actions & Auto Update HP (Usaha Qu)

Dokumen ini menjelaskan cara kerja sistem **Push to Auto Version ➔ Auto Build ➔ Auto Release ➔ Auto Update di HP Masing-Masing**.

---

## 🎯 1. Cara Kerja: Cukup Lakukan `git push` Saja!

Anda tidak perlu lagi mengubah nomor versi secara manual di banyak file (`package.json`, `build.gradle`, `index.html`, `metadata.json`, `version.json`).  
Cukup tulis kata kunci pada pesan commit saat melakukan `git push`:

| Jenis Perubahan | Kata Kunci pada Commit Message | Contoh Perintah Git | Efek Kenaikan Versi |
| :--- | :--- | :--- | :--- |
| **Besar (Major)** | `[major]` atau `breaking change` | `git commit -m "rombak arsitektur [major]"` | **`1.86.0` ➔ `2.0.0`** |
| **Sedang (Minor)** | `[minor]` atau `feat:` atau `feature:` | `git commit -m "tambah modul laporan baru [minor]"` | **`1.86.0` ➔ `1.87.0`** |
| **Kecil (Patch)** | *Otomatis (default)* atau `[patch]` atau `fix:` | `git commit -m "perbaiki tata letak kasir"` | **`1.86.0` ➔ `1.86.1`** |

> 💡 **Tips:** Jika Anda hanya menulis `git commit -m "update"` tanpa tanda kurung, sistem otomatis menganggapnya sebagai **Perubahan Kecil (Patch)**.

---

## ⚙️ 2. Apa yang Terjadi Secara Otomatis di GitHub Actions?

Ketika Anda menjalankan:
```bash
git push origin main
```

File alur kerja **`.github/workflows/build-apk.yml`** otomatis berjalan dan melakukan:
1. **Deteksi Pesan Commit**: Menentukan apakah perubahan Besar, Sedang, atau Kecil.
2. **Sinkronisasi Versi Otomatis (`scripts/auto-version.js`)**:
   - `package.json` (`version`)
   - `public/version.json` (`version`, `versionCode`, `releaseDate`)
   - `android/app/build.gradle` (`versionCode` bertambah otomatis, `versionName`)
   - `capacitor.config.json` (`appName`)
   - `index.html` & `metadata.json` (`title` & `name`)
   - `public/sw.js` (`CACHE_VERSION`)
   - `src/utils/appUpdateChecker.ts` (`CURRENT_APP_VERSION`, `CURRENT_VERSION_CODE`)
3. **Build Web & Sinkronisasi Capacitor**: Mengompilasi aplikasi React SPA dan menyinkronkan aset Android.
4. **Compile File APK dengan Gradle**: Membangun file **`UsahaQu-vX.Y.Z.apk`** dan **`UsahaQu-latest.apk`**.
5. **Auto GitHub Release**:
   - Menerbitkan Release baru di GitHub lengkap dengan tag (misal `v1.86.1`).
   - Melampirkan file APK siap instal ke halaman rilis.
6. **Commit Versi Kembali ke Repositori**: Menambahkan label `[skip ci]` agar tidak memicu build berulang.

---

## 📱 3. Bagaimana HP Masing-Masing Pengguna Mengupdate Otomatis?

Terdapat 2 jalur pembaruan di HP pengguna:

### Jalur A: Webview / PWA (Auto Update Seketika Tanpa Download File APK Ulang)
- Aplikasi dilengkapi teknologi **Service Worker Stale-While-Revalidate**.
- Begitu kode dipush ke server hosting, aplikasi di HP pengguna secara otomatis mendeteksi aset baru di latar belakang.
- Muncul notifikasi: *"Pembaruan baru tersedia! Pasang Sekarang"*.
- Sekali ketuk, antarmuka langsung berganti ke versi terbaru **tanpa mereset database transaksi atau IndexedDB (Zero Data Loss Guarantee)**.

### Jalur B: In-App APK Updater (Untuk Aplikasi APK yang Terinstal di Android)
- Di menu **Setting ➔ Info Aplikasi & Pembaruan**, terdapat fitur **Pengecekan Rilis APK Baru**.
- Aplikasi otomatis membaca file `/version.json` dan rilis terbaru GitHub.
- Jika ada nomor versi atau `versionCode` yang lebih tinggi daripada yang terinstal di HP, muncul tombol:
  - 📥 **`[Unduh APK Versi Terbaru]`**
- Pengguna tinggal menekan tombol tersebut, file APK langsung terunduh dan aplikasi terbuka untuk diperbarui.

---

## 🛠️ 4. Cara Menjalankan Manual via GitHub (Opsional)

Jika ingin menaikkan versi tanpa commit baru:
1. Buka repositori Anda di GitHub.
2. Masuk ke tab **Actions**.
3. Pilih **`Auto Version, Build & Release Android APK`** di sebelah kiri.
4. Klik tombol **Run workflow**.
5. Pilih tipe versi: **`patch`**, **`minor`**, atau **`major`**.
6. Klik **Run workflow**. Sistem akan otomatis merilis APK baru!
