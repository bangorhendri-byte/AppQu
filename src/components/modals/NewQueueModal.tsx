import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Wrench, 
  Check, 
  Calendar, 
  Clock, 
  Mic, 
  MicOff, 
  Sparkles, 
  RefreshCw,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import { ServiceQueue, Mechanic, WorkshopProfile } from '../../types';
import { INITIAL_PROFILE } from '../../data/mockData';
import { 
  getCurrentDateISO, 
  getCurrentTimeWIB, 
  formatIndonesianDisplayDate, 
  smartParseBengkelVoice, 
  isSpeechRecognitionSupported, 
  getSpeechRecognitionClass,
  ParsedBengkelVoice 
} from '../../utils/speechToTextBengkel';
import { formatBengkelQueueWhatsAppMessage } from '../../utils/bengkelWhatsApp';

interface NewQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQueue: (newQueue: ServiceQueue) => void;
  mechanics: Mechanic[];
  existingQueueCount: number;
  profile?: WorkshopProfile;
}

export const NewQueueModal: React.FC<NewQueueModalProps> = ({
  isOpen,
  onClose,
  onAddQueue,
  mechanics,
  existingQueueCount,
  profile = INITIAL_PROFILE
}) => {
  if (!isOpen) return null;

  const nextQueueNum = `BQ-0${existingQueueCount + 1}`;

  const [plateNumber, setPlateNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Honda Vario 160');
  const [vehicleType, setVehicleType] = useState<ServiceQueue['vehicleType']>('Motor Matic');
  const [serviceCategory, setServiceCategory] = useState<ServiceQueue['serviceCategory']>('Servis Berkala');
  const [complaint, setComplaint] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState(mechanics[0]?.name || 'Mas Joko');

  // Tanggal & Jam Masuk (Auto)
  const [date, setDate] = useState<string>(() => getCurrentDateISO());
  const [timeIn, setTimeIn] = useState<string>(() => getCurrentTimeWIB());

  // Smart Speech to Text States (100% Gratis - Web Speech API)
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedBengkelVoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsVoiceListening(false);
    setListeningField(null);
  };

  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, []);

  // Global Smart Voice Fill
  const handleStartGlobalVoice = () => {
    if (!isSpeechRecognitionSupported()) {
      showToast('Browser belum mendukung Web Speech API gratis. Gunakan Chrome di Android/PC.');
      return;
    }

    if (isVoiceListening) {
      stopRecognition();
      return;
    }

    stopRecognition();
    setVoiceTranscript('');
    setParsedPreview(null);
    setIsVoiceListening(true);

    const SpeechClass = getSpeechRecognitionClass();
    if (!SpeechClass) return;

    try {
      const recognizer = new SpeechClass();
      recognizer.lang = 'id-ID';
      recognizer.continuous = true;
      recognizer.interimResults = true;

      recognizer.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        fullTranscript = fullTranscript.trim();
        setVoiceTranscript(fullTranscript);

        const parsed = smartParseBengkelVoice(fullTranscript);
        setParsedPreview(parsed);
      };

      recognizer.onerror = () => {
        setIsVoiceListening(false);
      };

      recognizer.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = recognizer;
      recognizer.start();
    } catch (e) {
      setIsVoiceListening(false);
    }
  };

  const handleApplyVoiceData = () => {
    if (!parsedPreview && !voiceTranscript) {
      setIsVoiceListening(false);
      return;
    }

    const parsed = parsedPreview || smartParseBengkelVoice(voiceTranscript);
    let count = 0;

    if (parsed.plateNumber) {
      setPlateNumber(parsed.plateNumber);
      count++;
    }
    if (parsed.customerName) {
      setCustomerName(parsed.customerName);
      count++;
    }
    if (parsed.phone) {
      setCustomerPhone(parsed.phone);
      count++;
    }
    if (parsed.vehicleModel) {
      setVehicleModel(parsed.vehicleModel);
      count++;
    }
    if (parsed.vehicleType) {
      setVehicleType(parsed.vehicleType);
      count++;
    }
    if (parsed.serviceCategory) {
      setServiceCategory(parsed.serviceCategory);
      count++;
    }
    if (parsed.complaint) {
      setComplaint(parsed.complaint);
      count++;
    }

    setTimeIn(getCurrentTimeWIB());
    stopRecognition();
    setParsedPreview(null);
    setVoiceTranscript('');

    if (count > 0) {
      showToast(`✨ ${count} data berhasil diisi dari suara!`);
    } else if (voiceTranscript) {
      setComplaint(voiceTranscript);
      showToast('Suara dimasukkan ke keluhan.');
    }
  };

  // Field-specific voice input
  const handleToggleFieldMic = (fieldName: string) => {
    if (listeningField === fieldName) {
      stopRecognition();
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      showToast('Browser belum mendukung Web Speech API.');
      return;
    }

    stopRecognition();
    setListeningField(fieldName);

    const SpeechClass = getSpeechRecognitionClass();
    if (!SpeechClass) return;

    try {
      const recognizer = new SpeechClass();
      recognizer.lang = 'id-ID';
      recognizer.continuous = false;
      recognizer.interimResults = false;

      recognizer.onresult = (event: any) => {
        const text = event.results[0][0].transcript.trim();
        if (fieldName === 'plate') {
          const parsed = smartParseBengkelVoice(text);
          setPlateNumber(parsed.plateNumber || text.toUpperCase());
        } else if (fieldName === 'name') {
          const cap = text
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          setCustomerName(cap);
        } else if (fieldName === 'phone') {
          const cleanPhone = text.replace(/[^0-9]/g, '');
          setCustomerPhone(cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`);
        } else if (fieldName === 'model') {
          const parsed = smartParseBengkelVoice(text);
          setVehicleModel(parsed.vehicleModel || text);
          if (parsed.vehicleType) setVehicleType(parsed.vehicleType);
        } else if (fieldName === 'complaint') {
          setComplaint((prev) => (prev ? `${prev}. ${text}` : text));
        }
      };

      recognizer.onerror = () => setListeningField(null);
      recognizer.onend = () => setListeningField(null);

      recognitionRef.current = recognizer;
      recognizer.start();
      showToast(`Mendengarkan untuk kolom ${fieldName}...`);
    } catch {
      setListeningField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim() || !customerName.trim()) return;

    const newQueue: ServiceQueue = {
      id: `queue-${Date.now()}`,
      queueNumber: nextQueueNum,
      plateNumber: plateNumber.toUpperCase(),
      customerName,
      customerPhone: customerPhone || '08123456789',
      vehicleModel,
      vehicleType,
      serviceCategory,
      mechanicName: selectedMechanic,
      status: 'menunggu',
      complaint: complaint || 'Pemeriksaan rutin berkala',
      timeIn: timeIn.trim() || getCurrentTimeWIB(),
      date: date || getCurrentDateISO(),
      estimatedCompletion: '45 Menit',
      progressPercent: 0,
      totalCost: 95000,
      items: [
        { id: `it-1`, name: 'Jasa Servis & Pengecekan Rutin', price: 45000, qty: 1, type: 'jasa' },
        { id: `it-2`, name: 'Oli Mesin Berkualitas', price: 50000, qty: 1, type: 'part' }
      ]
    };

    onAddQueue(newQueue);
    onClose();
  };

  const handleRegisterAndSendWA = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!plateNumber.trim() || !customerName.trim()) {
      showToast('Harap lengkapi nomor plat dan nama pelanggan!');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Mohon masukkan nomor WhatsApp pelanggan terlebih dahulu!');
      return;
    }

    const newQueue: ServiceQueue = {
      id: `queue-${Date.now()}`,
      queueNumber: nextQueueNum,
      plateNumber: plateNumber.toUpperCase(),
      customerName,
      customerPhone,
      vehicleModel,
      vehicleType,
      serviceCategory,
      mechanicName: selectedMechanic,
      status: 'menunggu',
      complaint: complaint || 'Pemeriksaan rutin berkala',
      timeIn: timeIn.trim() || getCurrentTimeWIB(),
      date: date || getCurrentDateISO(),
      estimatedCompletion: '45 Menit',
      progressPercent: 0,
      totalCost: 95000,
      items: [
        { id: `it-1`, name: 'Jasa Servis & Pengecekan Rutin', price: 45000, qty: 1, type: 'jasa' },
        { id: `it-2`, name: 'Oli Mesin Berkualitas', price: 50000, qty: 1, type: 'part' }
      ]
    };

    onAddQueue(newQueue);

    const waRes = formatBengkelQueueWhatsAppMessage(
      {
        queueNumber: newQueue.queueNumber,
        plateNumber: newQueue.plateNumber,
        customerName: newQueue.customerName,
        customerPhone: newQueue.customerPhone,
        vehicleModel: newQueue.vehicleModel,
        vehicleType: newQueue.vehicleType,
        serviceCategory: newQueue.serviceCategory,
        mechanicName: newQueue.mechanicName,
        timeIn: newQueue.timeIn,
        date: newQueue.date,
        estimatedCompletion: newQueue.estimatedCompletion,
        complaint: newQueue.complaint
      },
      profile
    );

    window.open(waRes.waUrl, '_blank');
    stopRecognition();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#008952] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Input Antrian Servis Baru</h3>
              <p className="text-[11px] text-emerald-100">
                Nomor Antrian: <span className="font-bold underline">{nextQueueNum}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopRecognition();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Feedback inside modal */}
        {toastMessage && (
          <div className="bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs flex-1">
          {/* Smart Voice Fill Banner (100% Gratis) */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-3 text-white shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs">Smart Voice to Form</span>
                    <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                      Gratis
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-100">Bicara bebas untuk isi form otomatis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartGlobalVoice}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                  isVoiceListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-white text-[#008952] hover:bg-emerald-50'
                }`}
              >
                {isVoiceListening ? <MicOff className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                <span>{isVoiceListening ? 'Mendengarkan...' : 'Isi Lewat Suara'}</span>
              </button>
            </div>

            {/* Live voice preview drawer inside modal */}
            {isVoiceListening && (
              <div className="mt-2.5 pt-2.5 border-t border-white/20 space-y-2">
                <p className="text-[10px] italic text-emerald-100 bg-black/20 p-2 rounded-lg">
                  {voiceTranscript || 'Mendengarkan... Contoh: "Budi Santoso plat D 1234 ABC motor Vario 160 keluhan rem bunyi"'}
                </p>
                {parsedPreview && parsedPreview.confidenceCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-300 font-bold">
                      ✓ Terdeteksi: {[parsedPreview.plateNumber, parsedPreview.customerName, parsedPreview.vehicleModel].filter(Boolean).join(' • ')}
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyVoiceData}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-xs"
                    >
                      Terapkan Data
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 0. Tanggal & Jam Masuk (Auto) */}
          <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#008952]" />
                  <span>Tanggal (Auto)</span>
                </label>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                  Hari Ini
                </span>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-emerald-200 focus:border-[#008952] rounded-xl p-2 text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
              />
              <p className="text-[9px] text-slate-500 font-medium mt-0.5 truncate">
                {formatIndonesianDisplayDate(date)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#008952]" />
                  <span>Jam Masuk (Auto)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const nowWib = getCurrentTimeWIB();
                    setTimeIn(nowWib);
                    showToast(`Jam diupdate ke ${nowWib}`);
                  }}
                  className="text-[9px] font-bold text-[#008952] hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer bg-white px-1.5 py-0.2 rounded border border-emerald-200"
                  title="Update ke jam sekarang"
                >
                  <RefreshCw className="w-2 h-2" />
                  <span>Sekarang</span>
                </button>
              </div>
              <input
                type="text"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                placeholder="14:30 WIB"
                className="w-full bg-white border border-emerald-200 focus:border-[#008952] rounded-xl p-2 text-slate-900 font-bold text-xs focus:outline-none"
              />
              <p className="text-[9px] text-slate-500 font-medium mt-0.5 truncate">
                Otomatis dicatat saat dibuka
              </p>
            </div>
          </div>

          {/* 1. Nomor Plat Kendaraan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Nomor Plat Kendaraan *</label>
              <button
                type="button"
                onClick={() => handleToggleFieldMic('plate')}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border transition cursor-pointer ${
                  listeningField === 'plate'
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Dikte nomor plat"
              >
                <Mic className="w-2.5 h-2.5" />
                <span>{listeningField === 'plate' ? 'Mendengarkan...' : 'Suara'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="Contoh: D 4521 ABC"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold uppercase text-slate-900 tracking-wider text-sm focus:bg-white focus:border-[#008952] focus:outline-none"
            />
          </div>

          {/* 2. Nama Pemilik & WhatsApp */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Nama Pemilik *</label>
                <button
                  type="button"
                  onClick={() => handleToggleFieldMic('name')}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border cursor-pointer ${
                    listeningField === 'name' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Mic className="w-2.5 h-2.5" />
                </button>
              </div>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Pemilik"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:border-[#008952] focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Nomor WhatsApp</label>
                <button
                  type="button"
                  onClick={() => handleToggleFieldMic('phone')}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border cursor-pointer ${
                    listeningField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Mic className="w-2.5 h-2.5" />
                </button>
              </div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:border-[#008952] focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Tipe Kendaraan & Model */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tipe Kendaraan</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 cursor-pointer focus:bg-white focus:border-[#008952] focus:outline-none"
              >
                <option value="Motor Matic">Motor Matic</option>
                <option value="Motor Bebek">Motor Bebek</option>
                <option value="Motor Sport">Motor Sport</option>
                <option value="Mobil">Mobil</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Model & Seri</label>
                <button
                  type="button"
                  onClick={() => handleToggleFieldMic('model')}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border cursor-pointer ${
                    listeningField === 'model' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Mic className="w-2.5 h-2.5" />
                </button>
              </div>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="Contoh: Vario 160"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:border-[#008952] focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Kategori Servis & Mekanik */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kategori Servis</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 cursor-pointer focus:bg-white focus:border-[#008952] focus:outline-none"
              >
                <option value="Servis Berkala">Servis Berkala</option>
                <option value="Servis Ringan">Servis Ringan</option>
                <option value="Ganti Oli & Filter">Ganti Oli & Filter</option>
                <option value="Turun Mesin">Turun Mesin</option>
                <option value="Kelistrikan">Kelistrikan</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mekanik Ditugaskan</label>
              <select
                value={selectedMechanic}
                onChange={(e) => setSelectedMechanic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 cursor-pointer focus:bg-white focus:border-[#008952] focus:outline-none"
              >
                {mechanics.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.activeTasks} aktif)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Keluhan & Catatan Servis */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Keluhan / Catatan Servis</label>
              <button
                type="button"
                onClick={() => handleToggleFieldMic('complaint')}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border transition cursor-pointer ${
                  listeningField === 'complaint'
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Dikte keluhan dengan suara"
              >
                <Mic className="w-2.5 h-2.5" />
                <span>{listeningField === 'complaint' ? 'Mendengarkan...' : 'Suara'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Contoh: Tarikan awal gredek, minta cek v-belt dan ganti oli gardan."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#008952] focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                stopRecognition();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRegisterAndSendWA}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs"
                title="Daftarkan antrian dan kirim nomor antrian serta link katalog offline ke WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Send WA (No. Antrian & Katalog)</span>
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer text-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Antrian</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
