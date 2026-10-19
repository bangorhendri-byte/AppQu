/**
 * BengkelQu Smart Speech-to-Text & NLP Parser (100% Gratis & Client-Side)
 * Menggunakan Web Speech API bawaan browser/Android tanpa biaya API & tanpa token.
 */

import { ServiceQueue } from '../types';

export interface ParsedBengkelVoice {
  plateNumber?: string;
  customerName?: string;
  phone?: string;
  vehicleModel?: string;
  vehicleType?: ServiceQueue['vehicleType'];
  serviceCategory?: ServiceQueue['serviceCategory'];
  complaint?: string;
  confidenceCount: number;
}

// Cek apakah browser / WebView mendukung Web Speech API
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Ambil constructor SpeechRecognition
export const getSpeechRecognitionClass = (): any => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

/**
 * Format jam dan tanggal saat ini
 */
export const getCurrentTimeWIB = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
};

export const getCurrentDateISO = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatIndonesianDisplayDate = (isoStr: string): string => {
  try {
    const [year, month, day] = isoStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return isoStr;
  }
};

/**
 * Konversi kata angka bahasa Indonesia ke angka digit
 * Contoh: "nol delapan satu dua" -> "0812"
 */
const wordToNumberMap: Record<string, string> = {
  'nol': '0',
  'kosong': '0',
  'satu': '1',
  'dua': '2',
  'tiga': '3',
  'empat': '4',
  'lima': '5',
  'enam': '6',
  'tujuh': '7',
  'delapan': '8',
  'sembilan': '9'
};

export const normalizeSpokenDigits = (text: string): string => {
  let normalized = text.toLowerCase();
  
  // Ganti kata-kata angka menjadi angka
  Object.entries(wordToNumberMap).forEach(([word, digit]) => {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    normalized = normalized.replace(reg, digit);
  });
  
  return normalized;
};

/**
 * Smart NLP parser khusus formulir pendaftaran bengkel berbahasa Indonesia
 */
export const smartParseBengkelVoice = (rawSpeech: string): ParsedBengkelVoice => {
  const result: ParsedBengkelVoice = {
    confidenceCount: 0
  };

  if (!rawSpeech || !rawSpeech.trim()) return result;

  const raw = rawSpeech.trim();
  const normalizedDigits = normalizeSpokenDigits(raw);

  // 1. EKSTRAK NOMOR PLAT KENDARAAN (Contoh: D 1234 ABC, B 4521 XYZ, AB 8899 CD)
  // Cocokkan pola: 1-2 huruf kode wilayah, 1-4 digit angka, 1-3 huruf seri belakang
  const plateRegex = /\b([a-zA-Z]{1,2})\s*([0-9]{1,4})\s*([a-zA-Z]{1,3})\b/i;
  const plateMatch = normalizedDigits.match(plateRegex);
  if (plateMatch) {
    const code = plateMatch[1].toUpperCase();
    const num = plateMatch[2];
    const letters = plateMatch[3].toUpperCase();
    result.plateNumber = `${code} ${num} ${letters}`;
    result.confidenceCount++;
  } else {
    // Coba jika ada kata "plat" diikuti teks
    const platKeywordRegex = /(?:plat|plat nomor|nopol)\s*[:=]?\s*([a-zA-Z0-9\s]{3,12})/i;
    const platKeywordMatch = raw.match(platKeywordRegex);
    if (platKeywordMatch) {
      const candidate = platKeywordMatch[1].trim().toUpperCase().replace(/\s+/g, ' ');
      if (candidate.length >= 4) {
        result.plateNumber = candidate;
        result.confidenceCount++;
      }
    }
  }

  // 2. EKSTRAK NOMOR WHATSAPP / TELEPON
  // Cari pola 08xxx (minimal 10 digit, maksimal 13 digit)
  const phoneRegex = /\b(08[0-9\s-]{8,14})\b/;
  const phoneMatch = normalizedDigits.replace(/[\s-]/g, '').match(/08\d{8,12}/);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
    result.confidenceCount++;
  }

  // 3. EKSTRAK MODEL KENDARAAN & TIPE
  const vehicleDatabase: {
    model: string;
    type: ServiceQueue['vehicleType'];
    keywords: string[];
  }[] = [
    // Motor Matic
    { model: 'Honda Vario 160', type: 'Motor Matic', keywords: ['vario 160', 'vario'] },
    { model: 'Honda Beat', type: 'Motor Matic', keywords: ['beat', 'honda beat'] },
    { model: 'Honda Scoopy', type: 'Motor Matic', keywords: ['scoopy'] },
    { model: 'Honda PCX 160', type: 'Motor Matic', keywords: ['pcx 160', 'pcx'] },
    { model: 'Honda ADV 160', type: 'Motor Matic', keywords: ['adv 160', 'adv'] },
    { model: 'Honda Genio', type: 'Motor Matic', keywords: ['genio'] },
    { model: 'Yamaha NMAX 155', type: 'Motor Matic', keywords: ['nmax 155', 'nmax', 'n-max'] },
    { model: 'Yamaha Aerox 155', type: 'Motor Matic', keywords: ['aerox 155', 'aerox'] },
    { model: 'Yamaha Mio M3', type: 'Motor Matic', keywords: ['mio m3', 'mio'] },
    { model: 'Yamaha Fazzio', type: 'Motor Matic', keywords: ['fazzio'] },
    { model: 'Yamaha Grand Filano', type: 'Motor Matic', keywords: ['grand filano', 'filano'] },
    { model: 'Yamaha Lexi', type: 'Motor Matic', keywords: ['lexi'] },
    { model: 'Vespa Sprint', type: 'Motor Matic', keywords: ['vespa sprint', 'vespa matic', 'vespa'] },
    { model: 'Suzuki Nex II', type: 'Motor Matic', keywords: ['nex', 'suzuki nex'] },

    // Motor Bebek
    { model: 'Honda Supra X 125', type: 'Motor Bebek', keywords: ['supra x', 'supra 125', 'supra'] },
    { model: 'Honda Revo', type: 'Motor Bebek', keywords: ['revo'] },
    { model: 'Yamaha Jupiter MX', type: 'Motor Bebek', keywords: ['jupiter mx', 'jupiter', 'mx king'] },
    { model: 'Yamaha Vega Force', type: 'Motor Bebek', keywords: ['vega'] },
    { model: 'Suzuki Satria F150', type: 'Motor Bebek', keywords: ['satria fu', 'satria f150', 'satria'] },

    // Motor Sport
    { model: 'Honda CBR150R', type: 'Motor Sport', keywords: ['cbr150', 'cbr 150', 'cbr'] },
    { model: 'Honda CB150R', type: 'Motor Sport', keywords: ['cb150r', 'cb 150', 'cb150'] },
    { model: 'Yamaha R15', type: 'Motor Sport', keywords: ['r15', 'yamaha r15'] },
    { model: 'Yamaha Vixion', type: 'Motor Sport', keywords: ['vixion', 'new vixion'] },
    { model: 'Kawasaki Ninja 250', type: 'Motor Sport', keywords: ['ninja 250', 'ninja'] },
    { model: 'Kawasaki KLX 150', type: 'Motor Sport', keywords: ['klx 150', 'klx'] },

    // Mobil
    { model: 'Toyota Avanza', type: 'Mobil', keywords: ['avanza', 'toyota avanza'] },
    { model: 'Toyota Innova', type: 'Mobil', keywords: ['innova', 'kijang innova'] },
    { model: 'Honda Brio', type: 'Mobil', keywords: ['brio', 'honda brio'] },
    { model: 'Daihatsu Xenia', type: 'Mobil', keywords: ['xenia'] },
    { model: 'Toyota Calya', type: 'Mobil', keywords: ['calya'] },
    { model: 'Daihatsu Sigra', type: 'Mobil', keywords: ['sigra'] },
    { model: 'Mitsubishi Xpander', type: 'Mobil', keywords: ['xpander'] },
    { model: 'Toyota Rush', type: 'Mobil', keywords: ['rush'] }
  ];

  const lowerRaw = raw.toLowerCase();
  for (const item of vehicleDatabase) {
    if (item.keywords.some(kw => lowerRaw.includes(kw))) {
      result.vehicleModel = item.model;
      result.vehicleType = item.type;
      result.confidenceCount += 2;
      break;
    }
  }

  // Jika belum terdeteksi dari DB, cari pola kata setelah "motor" atau "mobil"
  if (!result.vehicleModel) {
    const generalVehicleRegex = /(?:motor|mobil|kendaraan)\s+([a-zA-Z0-9\s]{3,20})(?=\s+(?:keluhan|plat|nama|atas|wa|nomor|$))/i;
    const generalMatch = raw.match(generalVehicleRegex);
    if (generalMatch) {
      result.vehicleModel = generalMatch[1].trim();
      if (lowerRaw.includes('mobil')) {
        result.vehicleType = 'Mobil';
      } else {
        result.vehicleType = 'Motor Matic';
      }
      result.confidenceCount++;
    }
  }

  // 4. EKSTRAK NAMA PELANGGAN / PEMILIK
  const namePatterns = [
    /(?:atas nama|nama pemilik|nama pelanggan|pemilik|nama)\s*[:=]?\s*([a-zA-Z\s]{2,25})(?=\s+(?:plat|nomor|no|motor|mobil|wa|keluhan|telepon|hp|$))/i,
    /(?:pak|ibu|bapak|mas|mbak)\s+([a-zA-Z\s]{2,20})(?=\s+(?:plat|nomor|no|motor|mobil|wa|keluhan|telepon|hp|$))/i
  ];

  for (const pattern of namePatterns) {
    const match = raw.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].trim();
      // Pastikan bukan kata sambung / keyword
      if (!['plat', 'motor', 'mobil', 'servis', 'keluhan'].includes(cleaned.toLowerCase())) {
        // Capitalize nama
        result.customerName = cleaned
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        result.confidenceCount++;
        break;
      }
    }
  }

  // 5. EKSTRAK KATEGORI PENGERJAAN
  if (lowerRaw.includes('ganti oli') || lowerRaw.includes('oli mesin') || lowerRaw.includes('oli gardan')) {
    result.serviceCategory = 'Ganti Oli & Filter';
    result.confidenceCount++;
  } else if (lowerRaw.includes('turun mesin') || lowerRaw.includes('overhaul') || lowerRaw.includes('bongkar mesin')) {
    result.serviceCategory = 'Turun Mesin';
    result.confidenceCount++;
  } else if (lowerRaw.includes('kelistrikan') || lowerRaw.includes('aki') || lowerRaw.includes('lampu') || lowerRaw.includes('spul')) {
    result.serviceCategory = 'Kelistrikan';
    result.confidenceCount++;
  } else if (lowerRaw.includes('berkala') || lowerRaw.includes('rutin') || lowerRaw.includes('servis lengkap')) {
    result.serviceCategory = 'Servis Berkala';
    result.confidenceCount++;
  } else if (lowerRaw.includes('ringan') || lowerRaw.includes('tune up') || lowerRaw.includes('cek karbu') || lowerRaw.includes('injeksi')) {
    result.serviceCategory = 'Servis Ringan';
    result.confidenceCount++;
  }

  // 6. EKSTRAK KELUHAN / CATATAN KERUSAKAN
  const complaintPatterns = [
    /(?:keluhan|gejala|catatan|masalah|rusak|minta|bunyi|keluhannya)\s*[:=]?\s*(.+)$/i,
    /(?:tarikan|rem|mesin|cvt|rantai|shock|ban|starter)\s*(.+)$/i
  ];

  for (const cp of complaintPatterns) {
    const match = raw.match(cp);
    if (match && match[1]) {
      let complaintText = match[1].trim();
      // Bersihkan jika ada nama atau plat yang ikut tertelan di belakang
      complaintText = complaintText.replace(/(?:plat|nama|atas nama)\s+.*$/i, '').trim();
      if (complaintText.length > 3) {
        result.complaint = complaintText.charAt(0).toUpperCase() + complaintText.slice(1);
        result.confidenceCount++;
        break;
      }
    }
  }

  // Fallback keluhan jika belum ketemu tapi ada kata kunci kerusakan
  if (!result.complaint) {
    const symptomKeywords = ['gredek', 'bunyi berdecit', 'kurang tenaga', 'rem blong', 'mogok', 'mati total', 'brebet', 'bocor oli', 'asap putih', 'getar', 'stang berat'];
    for (const kw of symptomKeywords) {
      if (lowerRaw.includes(kw)) {
        result.complaint = `Kendaraan mengalami ${kw}`;
        result.confidenceCount++;
        break;
      }
    }
  }

  return result;
};
