#!/usr/bin/env node

/**
 * UsahaQu Auto-Versioning Engine
 * Mendeteksi tipe perubahan (Major / Minor / Patch) dari commit message atau input,
 * kemudian otomatis menyinkronkan nomor versi ke seluruh file proyek:
 * - package.json
 * - public/version.json
 * - android/app/build.gradle (versionCode & versionName)
 * - capacitor.config.json
 * - index.html
 * - metadata.json
 * - public/sw.js
 * - src/utils/appUpdateChecker.ts
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

// 1. Tentukan jenis perubahan (Major / Minor / Patch)
let bumpType = process.env.BUMP_TYPE?.toLowerCase() || '';

if (!bumpType) {
  try {
    const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).toLowerCase();
    console.log(`[AutoVersion] Pesan commit terakhir: "${commitMsg.trim()}"`);

    if (commitMsg.includes('[major]') || commitMsg.includes('breaking change') || commitMsg.includes('perubahan-besar')) {
      bumpType = 'major';
    } else if (commitMsg.includes('[minor]') || commitMsg.includes('feat:') || commitMsg.includes('feature:') || commitMsg.includes('perubahan-sedang')) {
      bumpType = 'minor';
    } else {
      bumpType = 'patch';
    }
  } catch (err) {
    console.warn('[AutoVersion] Gagal membaca git log, menggunakan default: patch');
    bumpType = 'patch';
  }
}

console.log(`[AutoVersion] Tipe kenaikan versi terdeteksi: ${bumpType.toUpperCase()}`);

// 2. Baca versi saat ini dari public/version.json atau package.json
const versionJsonPath = path.join(rootDir, 'public', 'version.json');
let currentVersion = '1.86.0';
let currentCode = 86;

if (fs.existsSync(versionJsonPath)) {
  try {
    const vData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
    if (vData.version) currentVersion = vData.version;
    if (vData.versionCode) currentCode = Number(vData.versionCode);
  } catch (e) {
    console.warn('[AutoVersion] Error membaca version.json:', e);
  }
}

// 3. Hitung versi baru sesuai kaidah Semantic Versioning (SemVer)
const parts = currentVersion.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
while (parts.length < 3) parts.push(0);

let [major, minor, patch] = parts;

if (bumpType === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bumpType === 'minor') {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;
const newCode = currentCode + 1;
const todayStr = new Date().toISOString().slice(0, 10);

console.log(`[AutoVersion] Versi Lama: ${currentVersion} (Code: ${currentCode})`);
console.log(`[AutoVersion] Versi Baru: ${newVersion} (Code: ${newCode})`);

// 4. Perbarui public/version.json
if (fs.existsSync(versionJsonPath)) {
  const vData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
  vData.version = newVersion;
  vData.versionCode = newCode;
  vData.releaseDate = todayStr;
  fs.writeFileSync(versionJsonPath, JSON.stringify(vData, null, 2) + '\n', 'utf-8');
  console.log('✅ public/version.json diperbarui');
}

// 5. Perbarui package.json
const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log('✅ package.json diperbarui');
}

// 6. Perbarui android/app/build.gradle
const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradle = fs.readFileSync(gradlePath, 'utf-8');
  gradle = gradle.replace(/versionCode\s+\d+/g, `versionCode ${newCode}`);
  gradle = gradle.replace(/versionName\s+["'][^"']+["']/g, `versionName "${newVersion}"`);
  fs.writeFileSync(gradlePath, gradle, 'utf-8');
  console.log('✅ android/app/build.gradle diperbarui');
}

// 7. Perbarui capacitor.config.json
const capPath = path.join(rootDir, 'capacitor.config.json');
if (fs.existsSync(capPath)) {
  const cap = JSON.parse(fs.readFileSync(capPath, 'utf-8'));
  cap.appName = `Usaha Qu ${newVersion}`;
  fs.writeFileSync(capPath, JSON.stringify(cap, null, 2) + '\n', 'utf-8');
  console.log('✅ capacitor.config.json diperbarui');
}

// 8. Perbarui index.html
const htmlPath = path.join(rootDir, 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace(/<title>Usaha Qu [^<]+<\/title>/g, `<title>Usaha Qu ${newVersion} - App Management UMKM Masa Kini</title>`);
  html = html.replace(/content="Usaha Qu [^"]*"/g, `content="Usaha Qu ${newVersion}"`);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('✅ index.html diperbarui');
}

// 9. Perbarui metadata.json
const metaPath = path.join(rootDir, 'metadata.json');
if (fs.existsSync(metaPath)) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  meta.name = `Usaha Qu ${newVersion}`;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8');
  console.log('✅ metadata.json diperbarui');
}

// 10. Perbarui public/sw.js
const swPath = path.join(rootDir, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf-8');
  sw = sw.replace(/const CACHE_VERSION = '[^']+';/g, `const CACHE_VERSION = 'v${newVersion}';`);
  fs.writeFileSync(swPath, sw, 'utf-8');
  console.log('✅ public/sw.js diperbarui');
}

// 11. Perbarui src/utils/appUpdateChecker.ts
const checkerPath = path.join(rootDir, 'src', 'utils', 'appUpdateChecker.ts');
if (fs.existsSync(checkerPath)) {
  let checker = fs.readFileSync(checkerPath, 'utf-8');
  checker = checker.replace(/export const CURRENT_APP_VERSION = '[^']+';/g, `export const CURRENT_APP_VERSION = '${newVersion}';`);
  checker = checker.replace(/export const CURRENT_VERSION_CODE = \d+;/g, `export const CURRENT_VERSION_CODE = ${newCode};`);
  fs.writeFileSync(checkerPath, checker, 'utf-8');
  console.log('✅ src/utils/appUpdateChecker.ts diperbarui');
}

// 12. Output untuk GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_version=${newVersion}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `version_code=${newCode}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `bump_type=${bumpType}\n`);
}

console.log(`[AutoVersion] Selesai! Versi proyek kini: v${newVersion}`);
