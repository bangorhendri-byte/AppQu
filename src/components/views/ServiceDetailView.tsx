import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  X, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Plus, 
  Printer, 
  Send, 
  RotateCcw, 
  FileText, 
  ChevronRight, 
  Package,
  Layers,
  ClipboardList,
  Calendar,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  Copy,
  ExternalLink,
  Check,
  BookOpen
} from 'lucide-react';
import { ServiceQueue, ServiceItem, ServiceStatus, Sparepart, Mechanic, WorkshopProfile } from '../../types';
import { INITIAL_SPAREPARTS, INITIAL_MECHANICS, INITIAL_PROFILE } from '../../data/mockData';
import { 
  getCurrentDateISO, 
  getCurrentTimeWIB, 
  formatIndonesianDisplayDate, 
  smartParseBengkelVoice, 
  isSpeechRecognitionSupported, 
  getSpeechRecognitionClass,
  ParsedBengkelVoice 
} from '../../utils/speechToTextBengkel';
import { 
  formatBengkelQueueWhatsAppMessage, 
  copyMessageToClipboard, 
  BengkelWhatsAppResult 
} from '../../utils/bengkelWhatsApp';

interface ServiceDetailViewProps {
  initialTab?: string;
  queues: ServiceQueue[];
  onBack: () => void;
  onAddQueue?: (newQueue: ServiceQueue) => void;
  onUpdateQueueStatus: (id: string, status: ServiceStatus, progress?: number) => void;
  onUpdateQueueItems?: (queueId: string, items: ServiceItem[], totalCost: number) => void;
  onSelectQueueForInvoice?: (queue: ServiceQueue) => void;
  onResetDailyQueues?: () => void;
  spareparts?: Sparepart[];
  mechanics?: Mechanic[];
  profile?: WorkshopProfile;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  initialTab = 'antrian',
  queues,
  onBack,
  onAddQueue,
  onUpdateQueueStatus,
  onUpdateQueueItems,
  onResetDailyQueues,
  spareparts = INITIAL_SPAREPARTS,
  mechanics = INITIAL_MECHANICS,
  profile = INITIAL_PROFILE
}) => {
  // Normalize initialTab to our 5 active sub-menus (supporting both 'servis' and legacy 'service')
  const getNormalizedTab = (tab: string) => {
    if (tab === 'service-register' || tab === 'registrasi') return 'registrasi';
    if (tab === 'service-queue' || tab === 'antrian') return 'antrian';
    if (tab === 'service-progress' || tab === 'proses-service' || tab === 'proses-servis') return 'proses-servis';
    if (tab === 'service-completed' || tab === 'selesai-service' || tab === 'selesai-servis') return 'selesai-servis';
    if (tab === 'service-total' || tab === 'total-service' || tab === 'total-servis') return 'total-servis';
    return 'antrian';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getNormalizedTab(initialTab));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for Proses Servis actions
  const [selectedQueueForAction, setSelectedQueueForAction] = useState<ServiceQueue | null>(null);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [isAddLaborModalOpen, setIsAddLaborModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<string>(spareparts[0]?.id || '');
  const [partQty, setPartQty] = useState<number>(1);
  const [laborName, setLaborName] = useState<string>('');
  const [laborPrice, setLaborPrice] = useState<number>(35000);

  // Modal for Invoice (Selesai Servis)
  const [invoiceQueue, setInvoiceQueue] = useState<ServiceQueue | null>(null);
  const [showDailyResetConfirm, setShowDailyResetConfirm] = useState(false);

  // Modal for WhatsApp Queue Ticket & Offline Catalog Confirmation
  const [waModalResult, setWaModalResult] = useState<BengkelWhatsAppResult | null>(null);
  const [waModalQueueInfo, setWaModalQueueInfo] = useState<{
    queueNumber: string;
    plateNumber: string;
    customerName: string;
    phone: string;
    vehicleModel: string;
  } | null>(null);
  const [isCopiedWaText, setIsCopiedWaText] = useState(false);

  // Form State for "Registrasi" (List ke bawah tanpa contoh cara isi)
  const [regPlate, setRegPlate] = useState('');
  const [regCustomerName, setRegCustomerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVehicleModel, setRegVehicleModel] = useState('');
  const [regVehicleType, setRegVehicleType] = useState<ServiceQueue['vehicleType']>('Motor Matic');
  const [regCategory, setRegCategory] = useState<ServiceQueue['serviceCategory']>('Servis Berkala');
  const [regComplaint, setRegComplaint] = useState('');
  const [regMechanic, setRegMechanic] = useState(mechanics[0]?.name || 'Mas Joko');
  const [regEstimatedTime, setRegEstimatedTime] = useState('45 Menit');

  // Jam & Tanggal Masuk (Auto)
  const [regDate, setRegDate] = useState<string>(() => getCurrentDateISO());
  const [regTimeIn, setRegTimeIn] = useState<string>(() => getCurrentTimeWIB());

  // Smart Speech to Text States (100% Gratis - Web Speech API Native)
  const [isSmartVoiceModalOpen, setIsSmartVoiceModalOpen] = useState(false);
  const [isListeningGlobal, setIsListeningGlobal] = useState(false);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [parsedVoicePreview, setParsedVoicePreview] = useState<ParsedBengkelVoice | null>(null);
  const recognitionRef = React.useRef<any>(null);

  // Trigger feedback toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Get today date string YYYY-MM-DD
  const todayDateStr = getCurrentDateISO();

  // Stop active speech recognition
  const stopSpeechRecognition = () => {
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
    setIsListeningGlobal(false);
    setListeningField(null);
  };

  // Start Global Smart Voice Fill (Isi seluruh form sekaligus)
  const handleStartSmartVoice = () => {
    if (!isSpeechRecognitionSupported()) {
      showToast('Browser belum mendukung Web Speech API gratis. Disarankan memakai Chrome di Android/PC.');
      return;
    }

    stopSpeechRecognition();
    setVoiceTranscript('');
    setParsedVoicePreview(null);
    setIsSmartVoiceModalOpen(true);
    setIsListeningGlobal(true);

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

        // Smart real-time parse
        const parsed = smartParseBengkelVoice(fullTranscript);
        setParsedVoicePreview(parsed);
      };

      recognizer.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('Izin mikrofon belum diizinkan. Silakan aktifkan mikrofon di browser.');
          stopSpeechRecognition();
        }
      };

      recognizer.onend = () => {
        setIsListeningGlobal(false);
      };

      recognitionRef.current = recognizer;
      recognizer.start();
    } catch (e) {
      console.error(e);
      showToast('Gagal mengakses mikrofon.');
      setIsListeningGlobal(false);
    }
  };

  // Apply parsed voice data into registration form
  const handleApplyVoiceData = () => {
    if (!parsedVoicePreview && !voiceTranscript) {
      setIsSmartVoiceModalOpen(false);
      stopSpeechRecognition();
      return;
    }

    const parsed = parsedVoicePreview || smartParseBengkelVoice(voiceTranscript);
    let filledCount = 0;

    if (parsed.plateNumber) {
      setRegPlate(parsed.plateNumber);
      filledCount++;
    }
    if (parsed.customerName) {
      setRegCustomerName(parsed.customerName);
      filledCount++;
    }
    if (parsed.phone) {
      setRegPhone(parsed.phone);
      filledCount++;
    }
    if (parsed.vehicleModel) {
      setRegVehicleModel(parsed.vehicleModel);
      filledCount++;
    }
    if (parsed.vehicleType) {
      setRegVehicleType(parsed.vehicleType);
      filledCount++;
    }
    if (parsed.serviceCategory) {
      setRegCategory(parsed.serviceCategory);
      filledCount++;
    }
    if (parsed.complaint) {
      setRegComplaint(parsed.complaint);
      filledCount++;
    }

    // Auto perbarui jam masuk ke jam sekarang saat pengisian suara berhasil
    setRegTimeIn(getCurrentTimeWIB());

    stopSpeechRecognition();
    setIsSmartVoiceModalOpen(false);

    if (filledCount > 0) {
      showToast(`✨ ${filledCount} kolom formulir berhasil diisi otomatis lewat suara!`);
    } else if (voiceTranscript) {
      setRegComplaint(voiceTranscript);
      showToast('Teks suara dimasukkan ke Keluhan & Catatan');
    }
  };

  // Toggle single field speech dictation
  const handleToggleFieldMic = (fieldName: string) => {
    if (listeningField === fieldName) {
      stopSpeechRecognition();
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      showToast('Browser belum mendukung Web Speech API gratis.');
      return;
    }

    stopSpeechRecognition();
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
          const finalPlat = parsed.plateNumber || text.toUpperCase();
          setRegPlate(finalPlat);
          showToast(`Plat: ${finalPlat}`);
        } else if (fieldName === 'name') {
          const capitalized = text
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          setRegCustomerName(capitalized);
          showToast(`Nama: ${capitalized}`);
        } else if (fieldName === 'phone') {
          const cleanPhone = text.replace(/[^0-9]/g, '');
          const finalPhone = cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`;
          setRegPhone(finalPhone);
          showToast(`WhatsApp: ${finalPhone}`);
        } else if (fieldName === 'model') {
          const parsed = smartParseBengkelVoice(text);
          setRegVehicleModel(parsed.vehicleModel || text);
          if (parsed.vehicleType) setRegVehicleType(parsed.vehicleType);
          showToast(`Model: ${parsed.vehicleModel || text}`);
        } else if (fieldName === 'complaint') {
          setRegComplaint((prev) => (prev ? `${prev}. ${text}` : text));
          showToast('Keluhan ditambahkan');
        }
      };

      recognizer.onerror = () => {
        setListeningField(null);
      };

      recognizer.onend = () => {
        setListeningField(null);
      };

      recognitionRef.current = recognizer;
      recognizer.start();
      showToast(`Mendengarkan suara untuk ${fieldName}...`);
    } catch (e) {
      setListeningField(null);
    }
  };

  // Dynamic Header Title & Subtitle based on active sub-menu
  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'registrasi':
        return {
          title: 'Registrasi',
          subtitle: 'Input Pendaftaran Unit Baru'
        };
      case 'antrian':
        return {
          title: 'Antrian',
          subtitle: 'Daftar Menunggu Servis'
        };
      case 'proses-servis':
        return {
          title: 'Proses Servis',
          subtitle: 'Pengerjaan Teknisi Aktif'
        };
      case 'selesai-servis':
        return {
          title: 'Selesai Servis',
          subtitle: 'Unit Selesai & Cetak Nota / WA'
        };
      case 'total-servis':
        return {
          title: 'Total Servis',
          subtitle: 'Rekap Semua Servis Hari Ini'
        };
      default:
        return {
          title: 'Manajemen Servis',
          subtitle: 'Sistem Operasional Servis'
        };
    }
  };

  const headerMeta = getHeaderMeta();

  // Filter queues by status
  const waitingQueues = queues.filter((q) => q.status === 'menunggu');
  const inProgressQueues = queues.filter((q) => q.status === 'proses');
  const completedQueues = queues.filter((q) => q.status === 'selesai');

  // Total Servis filtered by today's date
  const todayTotalQueues = queues.filter((q) => {
    if (q.date) {
      return q.date === todayDateStr;
    }
    return true;
  });

  const filterBySearch = (list: ServiceQueue[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.plateNumber.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.vehicleModel.toLowerCase().includes(q) ||
        item.queueNumber.toLowerCase().includes(q) ||
        item.mechanicName.toLowerCase().includes(q)
    );
  };

  // Auto-calculated next queue number
  const nextQueueNumber = `BQ-${String(queues.length + 1).padStart(2, '0')}`;

  // ==========================================
  // ACTION WORKFLOWS
  // ==========================================

  // 1. REGISTRASI: Save/Send -> Auto routes into Antrian
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPlate.trim() || !regCustomerName.trim()) {
      showToast('Mohon lengkapi nomor plat dan nama pelanggan!');
      return;
    }

    const newQueueItem: ServiceQueue = {
      id: `queue-${Date.now()}`,
      queueNumber: nextQueueNumber,
      plateNumber: regPlate.trim().toUpperCase(),
      customerName: regCustomerName.trim(),
      customerPhone: regPhone.trim() || '-',
      vehicleModel: regVehicleModel.trim() || 'Motor',
      vehicleType: regVehicleType,
      serviceCategory: regCategory,
      mechanicName: regMechanic,
      status: 'menunggu',
      complaint: regComplaint.trim() || 'Servis dan pemeriksaan unit.',
      timeIn: regTimeIn.trim() || getCurrentTimeWIB(),
      date: regDate || todayDateStr,
      estimatedCompletion: regEstimatedTime,
      items: [
        { id: `it-${Date.now()}-1`, name: 'Jasa Pengecekan & Servis Ringan', price: 40000, qty: 1, type: 'jasa' }
      ],
      progressPercent: 0,
      totalCost: 40000
    };

    if (onAddQueue) {
      onAddQueue(newQueueItem);
    }

    // Reset Form Fields
    setRegPlate('');
    setRegCustomerName('');
    setRegPhone('');
    setRegVehicleModel('');
    setRegComplaint('');
    setRegTimeIn(getCurrentTimeWIB());
    setRegDate(getCurrentDateISO());

    showToast(`Unit ${newQueueItem.plateNumber} berhasil didaftarkan ke Antrian!`);
    setActiveTab('antrian');
  };

  // 1b. REGISTRASI: Simpan & Langsung Kirim WA (Nomor Antrian & Offline Katalog)
  const handleRegisterAndSendWA = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regPlate.trim() || !regCustomerName.trim()) {
      showToast('Mohon lengkapi nomor plat dan nama pelanggan terlebih dahulu!');
      return;
    }

    if (!regPhone.trim()) {
      showToast('Mohon masukkan nomor WhatsApp pelanggan untuk mengirim tiket & katalog!');
      const phoneInput = document.getElementById('reg-phone-input');
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const newQueueItem: ServiceQueue = {
      id: `queue-${Date.now()}`,
      queueNumber: nextQueueNumber,
      plateNumber: regPlate.trim().toUpperCase(),
      customerName: regCustomerName.trim(),
      customerPhone: regPhone.trim(),
      vehicleModel: regVehicleModel.trim() || 'Motor',
      vehicleType: regVehicleType,
      serviceCategory: regCategory,
      mechanicName: regMechanic,
      status: 'menunggu',
      complaint: regComplaint.trim() || 'Servis dan pemeriksaan unit.',
      timeIn: regTimeIn.trim() || getCurrentTimeWIB(),
      date: regDate || todayDateStr,
      estimatedCompletion: regEstimatedTime,
      items: [
        { id: `it-${Date.now()}-1`, name: 'Jasa Pengecekan & Servis Ringan', price: 40000, qty: 1, type: 'jasa' }
      ],
      progressPercent: 0,
      totalCost: 40000
    };

    if (onAddQueue) {
      onAddQueue(newQueueItem);
    }

    const waRes = formatBengkelQueueWhatsAppMessage(
      {
        queueNumber: newQueueItem.queueNumber,
        plateNumber: newQueueItem.plateNumber,
        customerName: newQueueItem.customerName,
        customerPhone: newQueueItem.customerPhone,
        vehicleModel: newQueueItem.vehicleModel,
        vehicleType: newQueueItem.vehicleType,
        serviceCategory: newQueueItem.serviceCategory,
        mechanicName: newQueueItem.mechanicName,
        timeIn: newQueueItem.timeIn,
        date: newQueueItem.date,
        estimatedCompletion: newQueueItem.estimatedCompletion,
        complaint: newQueueItem.complaint
      },
      profile
    );

    // Buka aplikasi / web WhatsApp
    window.open(waRes.waUrl, '_blank');

    setWaModalResult(waRes);
    setWaModalQueueInfo({
      queueNumber: newQueueItem.queueNumber,
      plateNumber: newQueueItem.plateNumber,
      customerName: newQueueItem.customerName,
      phone: newQueueItem.customerPhone,
      vehicleModel: newQueueItem.vehicleModel
    });

    // Reset Form Fields
    setRegPlate('');
    setRegCustomerName('');
    setRegPhone('');
    setRegVehicleModel('');
    setRegComplaint('');
    setRegTimeIn(getCurrentTimeWIB());
    setRegDate(getCurrentDateISO());

    showToast(`Tiket antrian ${newQueueItem.queueNumber} & link katalog offline disiapkan ke WhatsApp!`);
  };

  // 1c. ANTRIAN: Kirim Ulang WA Nomor Antrian & Offline Katalog untuk Antrian yang Ada
  const handleSendWAForQueue = (queue: ServiceQueue) => {
    const waRes = formatBengkelQueueWhatsAppMessage(
      {
        queueNumber: queue.queueNumber,
        plateNumber: queue.plateNumber,
        customerName: queue.customerName,
        customerPhone: queue.customerPhone,
        vehicleModel: queue.vehicleModel,
        vehicleType: queue.vehicleType,
        serviceCategory: queue.serviceCategory,
        mechanicName: queue.mechanicName,
        timeIn: queue.timeIn,
        date: queue.date,
        estimatedCompletion: queue.estimatedCompletion,
        complaint: queue.complaint
      },
      profile
    );

    window.open(waRes.waUrl, '_blank');

    setWaModalResult(waRes);
    setWaModalQueueInfo({
      queueNumber: queue.queueNumber,
      plateNumber: queue.plateNumber,
      customerName: queue.customerName,
      phone: queue.customerPhone,
      vehicleModel: queue.vehicleModel
    });

    showToast(`Membuka WhatsApp untuk mengirim nomor antrian & katalog ke ${queue.customerName}...`);
  };

  // 2. ANTRIAN: Process / Kerjakan -> Auto moves to Proses Servis
  const handleStartProcess = (queue: ServiceQueue) => {
    onUpdateQueueStatus(queue.id, 'proses', 35);
    showToast(`Unit ${queue.plateNumber} mulai dikerjakan! Pindah ke Proses Servis.`);
    setActiveTab('proses-servis');
  };

  // 3. PROSES SERVIS: Add Part
  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueForAction) return;

    const partObj = spareparts.find((p) => p.id === selectedPartId);
    if (!partObj) return;

    const newItem: ServiceItem = {
      id: `item-part-${Date.now()}`,
      name: partObj.name,
      price: partObj.sellPrice,
      qty: Math.max(1, partQty),
      type: 'part'
    };

    const updatedItems = [...selectedQueueForAction.items, newItem];
    const newTotal = updatedItems.reduce((acc, it) => acc + it.price * it.qty, 0);

    if (onUpdateQueueItems) {
      onUpdateQueueItems(selectedQueueForAction.id, updatedItems, newTotal);
    }

    selectedQueueForAction.items = updatedItems;
    selectedQueueForAction.totalCost = newTotal;

    setIsAddPartModalOpen(false);
    showToast(`Suku cadang "${partObj.name}" berhasil ditambahkan.`);
  };

  // 3. PROSES SERVIS: Add Labor/Service
  const handleAddLaborSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueForAction || !laborName.trim()) return;

    const newItem: ServiceItem = {
      id: `item-jasa-${Date.now()}`,
      name: laborName.trim(),
      price: Number(laborPrice) || 30000,
      qty: 1,
      type: 'jasa'
    };

    const updatedItems = [...selectedQueueForAction.items, newItem];
    const newTotal = updatedItems.reduce((acc, it) => acc + it.price * it.qty, 0);

    if (onUpdateQueueItems) {
      onUpdateQueueItems(selectedQueueForAction.id, updatedItems, newTotal);
    }

    selectedQueueForAction.items = updatedItems;
    selectedQueueForAction.totalCost = newTotal;

    setLaborName('');
    setIsAddLaborModalOpen(false);
    showToast(`Jasa servis "${newItem.name}" berhasil ditambahkan.`);
  };

  // 3. PROSES SERVIS: Selesai -> Auto moves to Selesai Servis
  const handleCompleteProcess = (queue: ServiceQueue) => {
    onUpdateQueueStatus(queue.id, 'selesai', 100);
    showToast(`Pengerjaan ${queue.plateNumber} selesai! Pindah ke Selesai Servis.`);
    setActiveTab('selesai-servis');
  };

  // 4. SELESAI SERVIS: WhatsApp Output Action
  const handleSendWhatsAppInvoice = (queue: ServiceQueue) => {
    const phone = queue.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;

    const itemsSummary = queue.items
      .map((it, idx) => `${idx + 1}. ${it.name} (${it.qty}x) = Rp ${(it.price * it.qty).toLocaleString('id-ID')}`)
      .join('\n');

    const message = `*BENGKEL QU - NOTA SERVIS SELESAI*
============================
No. Antrian : ${queue.queueNumber}
Plat Nomor  : ${queue.plateNumber}
Kendaraan   : ${queue.vehicleModel}
Pelanggan   : ${queue.customerName}
Mekanik     : ${queue.mechanicName}
Status      : SELESAI & SIAP DIAMBIL

*RINCIAN BIAYA & PART:*
${itemsSummary}
----------------------------
*TOTAL TAGIHAN : Rp ${queue.totalCost.toLocaleString('id-ID')}*
============================
Unit Anda telah selesai dikerjakan dan sudah dicek QC. Silakan datang ke kasir Bengkel Qu untuk serah terima kendaraan. Terima kasih!`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    showToast(`Membuka WhatsApp untuk mengirim nota ke ${queue.customerName}...`);
  };

  // 4. SELESAI SERVIS: Print Output Action
  const handlePrintInvoice = (queue: ServiceQueue) => {
    setInvoiceQueue(queue);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // 5. TOTAL SERVIS: Manual Daily Reset
  const handleManualDailyReset = () => {
    if (onResetDailyQueues) {
      onResetDailyQueues();
    }
    setShowDailyResetConfirm(false);
    showToast('Log harian berhasil dibersihkan untuk shift hari baru!');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* 1. COMPACT HEADER BAR (Aman dari Jam & Batre HP) */}
      <div 
        className="bg-[#008952] text-white px-4 pt-2.5 pb-2.5 shadow-sm sticky top-0 z-30"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              aria-label="Kembali"
              className="w-8 h-8 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight truncate leading-tight">
                {headerMeta.title}
              </h1>
              <p className="text-[11px] text-emerald-100 font-medium truncate opacity-90 leading-none mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isSearchOpen ? 'bg-white text-[#008952]' : 'bg-white/15 text-white active:bg-white/30'
              }`}
              title="Cari nomor plat, antrian, atau pelanggan"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="mt-2.5 relative animate-in fade-in slide-in-from-top-1 duration-150">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari plat nomor, nama, atau mekanik..."
              className="w-full bg-white text-slate-900 text-xs rounded-xl pl-8.5 pr-8 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* TOP SUB-MENU TAB STRIP (Selaras, Rapi, & Cepat Beralih) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2.5 -mx-1 px-1">
          <button
            onClick={() => setActiveTab('registrasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'registrasi'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrasi</span>
          </button>

          <button
            onClick={() => setActiveTab('antrian')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'antrian'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Antrian</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'antrian' ? 'bg-emerald-100 text-[#008952]' : 'bg-white/20 text-white'
            }`}>
              {waitingQueues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('proses-servis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'proses-servis'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Proses Servis</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'proses-servis' ? 'bg-emerald-100 text-[#008952]' : 'bg-white/20 text-white'
            }`}>
              {inProgressQueues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('selesai-servis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'selesai-servis'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Servis</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'selesai-servis' ? 'bg-emerald-100 text-[#008952]' : 'bg-white/20 text-white'
            }`}>
              {completedQueues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('total-servis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'total-servis'
                ? 'bg-white text-[#008952] shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Total Servis</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'total-servis' ? 'bg-emerald-100 text-[#008952]' : 'bg-white/20 text-white'
            }`}>
              {todayTotalQueues.length}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200 max-w-sm text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          CONTENT VIEWS (Lancar di-scroll dengan safe area bottom)
      ========================================================================= */}
      <div 
        style={{ paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))' }}
        className="flex-1 flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full"
      >

        {/* =====================================================================
            1. REGISTRASI
            - Form card dibuat rapi
            - List ke bawah tanpa contoh cara isi
            - Langsung mengalir ke antrian setelah simpan
        ===================================================================== */}
        {activeTab === 'registrasi' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-6">
            {/* Header Form Card */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008952] flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">Formulir Pendaftaran Servis</h2>
                  <p className="text-xs text-slate-400">Pendaftaran unit kendaraan masuk bengkel</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-medium">Nomor Antrian</span>
                <span className="text-sm font-black text-[#008952] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                  {nextQueueNumber}
                </span>
              </div>
            </div>

            {/* Smart Speech-to-Text Banner (100% Gratis Tanpa Biaya API) */}
            <div className="bg-gradient-to-r from-emerald-700 via-[#008952] to-teal-800 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between gap-3 border border-emerald-500/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xs text-white">Smart Voice to Form</h3>
                    <span className="text-[9px] bg-amber-400 text-slate-900 font-black px-1.5 py-0.2 rounded uppercase">
                      100% Gratis
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 truncate mt-0.5">
                    Bicara bebas dalam Bahasa Indonesia, AI lokal otomatis membedah & mengisi form.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartSmartVoice}
                className="bg-white hover:bg-emerald-50 active:scale-95 text-[#008952] font-black text-xs px-3 py-2 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                title="Bicara untuk mengisi seluruh formulir secara otomatis"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Isi Lewat Suara</span>
              </button>
            </div>

            {/* List Ke Bawah (Formulir Pendaftaran Servis) */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* 0. Tanggal Masuk & Jam Masuk (Auto) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/90">
                {/* Tanggal Masuk (Auto) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#008952]" />
                      <span>Tanggal Masuk (Auto)</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Otomatis
                    </span>
                  </div>
                  <input
                    type="date"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                    className="w-full bg-white border border-emerald-200 focus:border-[#008952] rounded-xl py-2 px-3 text-slate-900 font-bold text-xs transition-colors focus:outline-none shadow-xs cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                    {formatIndonesianDisplayDate(regDate)}
                  </p>
                </div>

                {/* Jam Masuk (Auto) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#008952]" />
                      <span>Jam Masuk (Auto)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nowWib = getCurrentTimeWIB();
                        setRegTimeIn(nowWib);
                        showToast(`Jam masuk diperbarui ke ${nowWib}`);
                      }}
                      className="text-[10px] font-bold text-[#008952] hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs hover:bg-emerald-50 active:scale-95 transition"
                      title="Klik untuk sinkronkan jam ke waktu sekarang"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Update Sekarang</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={regTimeIn}
                      onChange={(e) => setRegTimeIn(e.target.value)}
                      placeholder="Contoh: 14:30 WIB"
                      className="w-full bg-white border border-emerald-200 focus:border-[#008952] rounded-xl py-2 px-3 text-slate-900 font-bold text-xs transition-colors focus:outline-none shadow-xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Tercatat otomatis saat formulir dibuka (bisa disesuaikan).
                  </p>
                </div>
              </div>

              {/* 1. Nomor Plat Kendaraan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nomor Plat Kendaraan <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleFieldMic('plate')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border transition cursor-pointer ${
                      listeningField === 'plate'
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Dikte nomor plat dengan suara"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{listeningField === 'plate' ? 'Mendengarkan...' : 'Suara'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value.toUpperCase())}
                  placeholder="Nomor plat kendaraan (Contoh: D 4521 ABC)"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-900 font-extrabold text-sm tracking-wider transition-colors focus:outline-none"
                />
              </div>

              {/* 2. Nama Pemilik / Pelanggan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nama Pemilik / Pelanggan <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleFieldMic('name')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border transition cursor-pointer ${
                      listeningField === 'name'
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Dikte nama pemilik dengan suara"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{listeningField === 'name' ? 'Mendengarkan...' : 'Suara'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={regCustomerName}
                  onChange={(e) => setRegCustomerName(e.target.value)}
                  placeholder="Nama pemilik kendaraan"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-800 font-semibold text-xs transition-colors focus:outline-none"
                />
              </div>

              {/* 3. Nomor WhatsApp / Telepon */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nomor WhatsApp / Telepon
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleFieldMic('phone')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border transition cursor-pointer ${
                      listeningField === 'phone'
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Dikte nomor WA dengan suara"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{listeningField === 'phone' ? 'Mendengarkan...' : 'Suara'}</span>
                  </button>
                </div>
                <input
                  type="tel"
                  id="reg-phone-input"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Nomor WhatsApp aktif (Contoh: 08123456789)"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-800 font-semibold text-xs transition-colors focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200 mt-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Nomor antrian & tautan katalog offline dikirim langsung ke WA ini.</span>
                  </div>
                  {regPhone ? (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                      Siap Kirim
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">
                      Opsional / Disarankan
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Model Kendaraan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Model Kendaraan
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleFieldMic('model')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border transition cursor-pointer ${
                      listeningField === 'model'
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Dikte model kendaraan dengan suara"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{listeningField === 'model' ? 'Mendengarkan...' : 'Suara'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={regVehicleModel}
                  onChange={(e) => setRegVehicleModel(e.target.value)}
                  placeholder="Merk dan model kendaraan (Contoh: Honda Vario 160)"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-800 font-semibold text-xs transition-colors focus:outline-none"
                />
              </div>

              {/* 5. Tipe Kendaraan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tipe Kendaraan
                </label>
                <select
                  value={regVehicleType}
                  onChange={(e) => setRegVehicleType(e.target.value as ServiceQueue['vehicleType'])}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-800 font-semibold text-xs transition-colors focus:outline-none cursor-pointer"
                >
                  <option value="Motor Matic">Motor Matic</option>
                  <option value="Motor Bebek">Motor Bebek</option>
                  <option value="Motor Sport">Motor Sport</option>
                  <option value="Mobil">Mobil</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* 6. Kategori Pengerjaan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kategori Pengerjaan
                </label>
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value as ServiceQueue['serviceCategory'])}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-800 font-semibold text-xs transition-colors focus:outline-none cursor-pointer"
                >
                  <option value="Servis Berkala">Servis Berkala</option>
                  <option value="Servis Ringan">Servis Ringan</option>
                  <option value="Ganti Oli & Filter">Ganti Oli & Filter</option>
                  <option value="Turun Mesin">Turun Mesin</option>
                  <option value="Kelistrikan">Kelistrikan</option>
                  <option value="Custom">Custom / Perbaikan Lain</option>
                </select>
              </div>

              {/* 7. Penugasan Mekanik */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Penugasan Mekanik
                </label>
                <select
                  value={regMechanic}
                  onChange={(e) => setRegMechanic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-800 font-semibold text-xs transition-colors focus:outline-none cursor-pointer"
                >
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Keluhan Kendaraan & Instruksi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Keluhan Kendaraan & Instruksi
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleFieldMic('complaint')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border transition cursor-pointer ${
                      listeningField === 'complaint'
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Dikte keluhan kendaraan dengan suara"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{listeningField === 'complaint' ? 'Mendengarkan...' : 'Suara'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={regComplaint}
                  onChange={(e) => setRegComplaint(e.target.value)}
                  placeholder="Keluhan atau catatan pengerjaan"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-800 font-medium text-xs transition-colors focus:outline-none resize-none"
                />
              </div>

              {/* 9. Estimasi Waktu */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Estimasi Waktu Pengerjaan
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['30 Menit', '45 Menit', '1 Jam', '1.5 Jam', '2 Jam', '3 Jam'].map((time) => (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setRegEstimatedTime(time)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                        regEstimatedTime === time
                          ? 'bg-[#008952] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Simpan & Send WA (Nomor Antrian & Offline Katalog) */}
              <div className="pt-3 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Tombol Send WA (Nomor Antrian & Offline Katalog) */}
                  <button
                    type="button"
                    onClick={handleRegisterAndSendWA}
                    className="h-12 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all text-xs tracking-wide cursor-pointer"
                    title="Simpan unit ke antrian & langsung kirim nomor antrian serta link katalog offline ke WhatsApp pelanggan"
                  >
                    <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                    <span>Send WA (No. Antrian & Katalog)</span>
                  </button>

                  {/* Tombol Simpan & Masukkan ke Antrian Biasa */}
                  <button
                    type="submit"
                    className="h-12 bg-[#008952] hover:bg-[#007545] active:scale-[0.99] text-white font-extrabold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all text-xs tracking-wide cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                    <span>Simpan & Masuk Antrian</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>
                    Klik <strong>Send WA</strong> untuk otomatis mengirim bukti pendaftaran, nomor antrian, dan akses katalog offline ke pelanggan.
                  </span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================================
            2. ANTRIAN
            - List minimalis underline (tanpa card dalam card)
            - Nomor antrian sejajar dengan plat nomor
            - Tombol selaras
        ===================================================================== */}
        {activeTab === 'antrian' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Daftar Antrian Menunggu Servis</h2>
                <p className="text-[11px] text-slate-400">Unit kendaraan siap masuk pengerjaan mekanik</p>
              </div>
              <span className="text-xs font-black text-[#008952] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {filterBySearch(waitingQueues).length} Unit
              </span>
            </div>

            {filterBySearch(waitingQueues).length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008952] flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ada Kendaraan di Antrian</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Semua kendaraan sedang dikerjakan atau belum ada pendaftaran baru.
                </p>
                <button
                  onClick={() => setActiveTab('registrasi')}
                  className="mt-4 bg-[#008952] hover:bg-[#007545] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Daftarkan Unit Baru</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filterBySearch(waitingQueues).map((queue) => (
                  <div
                    key={queue.id}
                    className="p-4 md:p-5 hover:bg-slate-50/70 transition-colors space-y-2.5"
                  >
                    {/* Baris 1: Nomor Antrian SEJAJAR dengan Plat Nomor */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Nomor antrian sejajar plat nomor */}
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-black text-xs tracking-wider shrink-0 shadow-2xs">
                          {queue.queueNumber}
                        </span>
                        <span className="text-base font-black text-slate-900 tracking-wide shrink-0">
                          {queue.plateNumber}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {queue.vehicleType}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          • {queue.vehicleModel}
                        </span>
                      </div>

                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu</span>
                      </span>
                    </div>

                    {/* Baris 2: Data Pelanggan, Mekanik, & Waktu Sejajar */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>Pelanggan: <strong className="text-slate-800">{queue.customerName}</strong> ({queue.customerPhone})</span>
                      <span className="text-slate-300">•</span>
                      <span>Mekanik: <strong className="text-slate-800">{queue.mechanicName}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Kategori: <strong className="text-slate-700">{queue.serviceCategory}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Jam Masuk: <strong className="text-slate-700">{queue.timeIn}</strong></span>
                    </div>

                    {/* Baris 3: Keluhan */}
                    {queue.complaint && (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-800">Keluhan:</span> {queue.complaint}
                      </p>
                    )}

                    {/* Baris 4: Tombol Selaras */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2 flex-wrap">
                      <span className="text-[11px] text-slate-400">
                        Estimasi Pengerjaan: <strong className="text-emerald-700">{queue.estimatedCompletion}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Tombol Send WA (Nomor Antrian & Offline Katalog) */}
                        <button
                          type="button"
                          onClick={() => handleSendWAForQueue(queue)}
                          className="h-8 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs px-3 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Kirim nomor antrian dan tautan katalog offline ke WhatsApp pelanggan"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                          <span>Send WA</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartProcess(queue)}
                          className="h-8 bg-[#008952] hover:bg-[#007545] active:scale-95 text-white font-bold text-xs px-4 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Proses / Kerjakan</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            3. PROSES SERVIS (sebelumnya service)
            - List minimalis underline (tanpa card dalam card)
            - Tombol sejajarkan/selaraskan
            - Plat nomor dll sejajarkan/selaraskan
        ===================================================================== */}
        {activeTab === 'proses-servis' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Daftar Proses Servis Aktif</h2>
                <p className="text-[11px] text-slate-400">Pengerjaan teknisi dan penambahan suku cadang/jasa</p>
              </div>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {filterBySearch(inProgressQueues).length} Unit Dikerjakan
              </span>
            </div>

            {filterBySearch(inProgressQueues).length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ada Servis yang Sedang Dikerjakan</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih unit pada sub-menu <strong>Antrian</strong> dan klik tombol <em>Proses / Kerjakan</em>.
                </p>
                <button
                  onClick={() => setActiveTab('antrian')}
                  className="mt-4 bg-[#008952] hover:bg-[#007545] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Lihat Antrian ({waitingQueues.length})</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filterBySearch(inProgressQueues).map((queue) => (
                  <div
                    key={queue.id}
                    className="p-4 md:p-5 hover:bg-slate-50/70 transition-colors space-y-3"
                  >
                    {/* Baris 1: Plat Nomor, Nomor Antrian, & Total Berjalan SEJAJAR */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs tracking-wider shrink-0 shadow-2xs">
                          {queue.queueNumber}
                        </span>
                        <span className="text-base font-black text-slate-900 tracking-wide shrink-0">
                          {queue.plateNumber}
                        </span>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                          Dikerjakan
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          • {queue.vehicleModel}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Berjalan</span>
                        <span className="text-sm font-black text-[#008952]">
                          Rp {queue.totalCost.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Baris 2: Mekanik, Pelanggan, & Kategori Sejajar */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>Mekanik: <strong className="text-slate-800">{queue.mechanicName}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Pelanggan: <strong className="text-slate-800">{queue.customerName}</strong> ({queue.customerPhone})</span>
                      <span className="text-slate-300">•</span>
                      <span>Kategori: <strong className="text-slate-700">{queue.serviceCategory}</strong></span>
                    </div>

                    {/* Baris 3: Progress Bar Ramping */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Pengerjaan Mekanik</span>
                        <span className="text-blue-700 font-bold">{queue.progressPercent}% Selesai</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#008952] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(15, queue.progressPercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Baris 4: Rincian Item (Tanpa Card Dalam Card - Minimal List) */}
                    <div className="pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 font-bold mr-1">Rincian ({queue.items.length}):</span>
                        {queue.items.map((it, idx) => (
                          <span
                            key={it.id || idx}
                            className="inline-flex items-center gap-1.5 text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${it.type === 'part' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span>{it.name}</span>
                            <span className="text-slate-400">({it.qty}x)</span>
                            <span className="text-slate-800 font-bold">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Baris 5: TOMBOL SEJAJARKAN / SELARASKAN */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Tombol + Tambah Part */}
                        <button
                          onClick={() => {
                            setSelectedQueueForAction(queue);
                            setIsAddPartModalOpen(true);
                          }}
                          className="h-8 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-3 rounded-xl border border-amber-200 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-700" />
                          <span>+ Tambah Part</span>
                        </button>

                        {/* Tombol + Tambah Jasa */}
                        <button
                          onClick={() => {
                            setSelectedQueueForAction(queue);
                            setIsAddLaborModalOpen(true);
                          }}
                          className="h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 rounded-xl border border-emerald-200 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                          <span>+ Tambah Jasa</span>
                        </button>
                      </div>

                      {/* Tombol Selesai Servis */}
                      <button
                        onClick={() => handleCompleteProcess(queue)}
                        className="h-8 bg-[#008952] hover:bg-[#007545] active:scale-95 text-white font-bold text-xs px-4 rounded-xl shadow-xs flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai Servis</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            4. SELESAI SERVIS (sebelumnya service)
            - List minimalis underline (tanpa card dalam card)
            - Tombol (lihat nota, cetak, kirim wa) sejajarkan/selaraskan
            - Plat nomor dll sejajarkan/selaraskan
        ===================================================================== */}
        {activeTab === 'selesai-servis' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Daftar Selesai Servis</h2>
                <p className="text-[11px] text-slate-400">Unit rampung dikerjakan, cetak nota atau kirim rincian via WA</p>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {filterBySearch(completedQueues).length} Unit Selesai
              </span>
            </div>

            {filterBySearch(completedQueues).length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008952] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Belum Ada Servis yang Selesai</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unit yang telah selesai dikerjakan mekanik di sub-menu <strong>Proses Servis</strong> akan tampil di sini.
                </p>
                <button
                  onClick={() => setActiveTab('proses-servis')}
                  className="mt-4 bg-[#008952] hover:bg-[#007545] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Lihat Proses Servis ({inProgressQueues.length})</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filterBySearch(completedQueues).map((queue) => (
                  <div
                    key={queue.id}
                    className="p-4 md:p-5 hover:bg-slate-50/70 transition-colors space-y-3"
                  >
                    {/* Baris 1: Plat Nomor, Nomor Antrian, & Total Tagihan SEJAJAR */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-black text-xs tracking-wider shrink-0 shadow-2xs">
                          {queue.queueNumber}
                        </span>
                        <span className="text-base font-black text-slate-900 tracking-wide shrink-0">
                          {queue.plateNumber}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Siap Diambil</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          • {queue.vehicleModel}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Tagihan</span>
                        <span className="text-base font-black text-[#008952]">
                          Rp {queue.totalCost.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Baris 2: Mekanik, Pelanggan, & Item Terpasang Sejajar */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>Pelanggan: <strong className="text-slate-800">{queue.customerName}</strong> ({queue.customerPhone})</span>
                      <span className="text-slate-300">•</span>
                      <span>Mekanik: <strong className="text-slate-800">{queue.mechanicName}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Total: <strong className="text-slate-700">{queue.items.length} Item Part/Jasa</strong></span>
                    </div>

                    {/* Baris 3: Item Terpasang (Minimalis Underline - Tanpa Card Dalam Card) */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {queue.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        >
                          {it.name} (Rp {it.price.toLocaleString('id-ID')})
                        </span>
                      ))}
                    </div>

                    {/* Baris 4: TOMBOL (LIHAT NOTA, CETAK, KIRIM WA) SEJAJARKAN / SELARASKAN */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      {/* Tombol Lihat Nota */}
                      <button
                        onClick={() => setInvoiceQueue(queue)}
                        className="h-8 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Lihat Nota</span>
                      </button>

                      <div className="flex items-center gap-2 ml-auto">
                        {/* Tombol Cetak Nota */}
                        <button
                          onClick={() => handlePrintInvoice(queue)}
                          className="h-8 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Nota</span>
                        </button>

                        {/* Tombol Kirim WA */}
                        <button
                          onClick={() => handleSendWhatsAppInvoice(queue)}
                          className="h-8 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs px-4 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            5. TOTAL SERVIS (sebelumnya service)
            - Keterangan 4 card kecil selaraskan
            - Aturan reset rapikan/buat lebih kecil/simple
            - Rekapitulasi list minimalis underline
        ===================================================================== */}
        {activeTab === 'total-servis' && (
          <div className="space-y-4">
            {/* 1. KETERANGAN 4 CARD KECIL SELARASKAN */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Unit</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{todayTotalQueues.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Hari Ini</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-amber-500 block uppercase tracking-wider">Menunggu</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">{waitingQueues.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Di Antrian</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-blue-500 block uppercase tracking-wider">Dikerjakan</span>
                <span className="text-2xl font-black text-blue-600 mt-1 block">{inProgressQueues.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Di Pit Servis</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">Selesai</span>
                <span className="text-2xl font-black text-[#008952] mt-1 block">{completedQueues.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Siap / Diambil</span>
              </div>
            </div>

            {/* 2. ATURAN RESET RAPIKAN / BUAT LEBIH KECIL / SIMPLE */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <p className="text-xs text-slate-700 font-medium truncate">
                  <strong className="text-slate-900">Reset Harian:</strong> Otomatis di-reset pukul 00:00 untuk shift baru.
                </p>
              </div>

              <button
                onClick={() => setShowDailyResetConfirm(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="Bersihkan log harian sekarang"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Reset Hari Ini</span>
              </button>
            </div>

            {/* 3. REKAPITULASI LIST MINIMALIS UNDERLINE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Rekapitulasi Semua Servis ({todayTotalQueues.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">Log pengerjaan unit lengkap hari ini</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-medium">Estimasi Omset</span>
                  <p className="text-sm font-black text-[#008952]">
                    Rp {todayTotalQueues.reduce((acc, q) => acc + q.totalCost, 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {todayTotalQueues.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada log servis tercatat hari ini.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filterBySearch(todayTotalQueues).map((queue) => (
                    <div
                      key={queue.id}
                      className="p-3.5 px-4 md:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Nomor Antrian Sejajar Plat Nomor & Status */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-black text-xs shrink-0">
                          {queue.queueNumber}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-xs">{queue.plateNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full capitalize ${
                              queue.status === 'selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : queue.status === 'proses'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {queue.status}
                            </span>
                            <span className="text-[11px] text-slate-500 hidden sm:inline">• {queue.vehicleModel}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {queue.customerName} • Mekanik: {queue.mechanicName} • Jam Masuk: {queue.timeIn}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 block">
                          Rp {queue.totalCost.toLocaleString('id-ID')}
                        </span>
                        <button
                          onClick={() => setInvoiceQueue(queue)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline mt-0.5 inline-block cursor-pointer"
                        >
                          Lihat Nota
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS & DRAWERS
      ========================================================================= */}

      {/* Modal: Tambah Part (Suku Cadang) */}
      {isAddPartModalOpen && selectedQueueForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Tambah Suku Cadang (Part)</h3>
                <p className="text-xs text-slate-400">Unit: {selectedQueueForAction.plateNumber}</p>
              </div>
              <button
                onClick={() => setIsAddPartModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPartSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Suku Cadang dari Katalog</label>
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                >
                  {spareparts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock} {p.unit}) - Rp {p.sellPrice.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jumlah (Qty)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={partQty}
                  onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#008952] hover:bg-[#007545] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Tambahkan ke Servis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Jasa Servis (Labor) */}
      {isAddLaborModalOpen && selectedQueueForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Tambah Jasa Servis</h3>
                <p className="text-xs text-slate-400">Unit: {selectedQueueForAction.plateNumber}</p>
              </div>
              <button
                onClick={() => setIsAddLaborModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLaborSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Pekerjaan Jasa</label>
                <input
                  type="text"
                  required
                  value={laborName}
                  onChange={(e) => setLaborName(e.target.value)}
                  placeholder="Nama pekerjaan jasa servis"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tarif Biaya Jasa (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={laborPrice}
                  onChange={(e) => setLaborPrice(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLaborModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#008952] hover:bg-[#007545] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Tambahkan Jasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lihat Nota / Invoice */}
      {invoiceQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Invoice Header */}
            <div className="bg-[#008952] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-tight">Nota Servis & Invoice</h3>
                  <p className="text-[11px] text-emerald-100">No. Antrian: {invoiceQueue.queueNumber} • {invoiceQueue.plateNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceQueue(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div id="printable-invoice" className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="text-center pb-3 border-b border-dashed border-slate-200">
                <h2 className="font-black text-base text-slate-900 tracking-tight">BENGKEL QU MOTOR</h2>
                <p className="text-[11px] text-slate-500">Jl. Otto Iskandardinata No. 128, Sukajadi, Kota Bandung</p>
                <p className="text-[10px] text-slate-400">Telp/WA: 0812-3456-7890 • Sistem Kasir POS & Servis</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Pelanggan:</span>
                  <strong className="text-slate-900">{invoiceQueue.customerName}</strong>
                  <span className="text-slate-500 block">{invoiceQueue.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kendaraan:</span>
                  <strong className="text-slate-900">{invoiceQueue.plateNumber}</strong>
                  <span className="text-slate-500 block">{invoiceQueue.vehicleModel}</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block">Mekanik:</span>
                  <strong className="text-slate-800">{invoiceQueue.mechanicName}</strong>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block">Jam Selesai:</span>
                  <strong className="text-slate-800">{invoiceQueue.timeIn}</strong>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Rincian Jasa & Suku Cadang:</h4>
                <div className="space-y-1.5 border-t border-b border-slate-200 py-2">
                  {invoiceQueue.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{it.name}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({it.qty}x)</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        Rp {(it.price * it.qty).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between pt-1 text-sm font-extrabold text-slate-900">
                <span>TOTAL PEMBAYARAN</span>
                <span className="text-base text-[#008952]">Rp {invoiceQueue.totalCost.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Modal Actions: Print & WhatsApp */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setInvoiceQueue(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintInvoice(invoiceQueue)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Nota</span>
                </button>

                <button
                  onClick={() => handleSendWhatsAppInvoice(invoiceQueue)}
                  className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Harian */}
      {showDailyResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Reset Log Servis Hari Ini?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tindakan ini akan mengosongkan antrian hari ini dan memulai nomor antrian dari BQ-01 untuk shift berikutnya.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowDailyResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleManualDailyReset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
              >
                Ya, Bersihkan Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Voice Assistant Modal (100% Gratis - Web Speech API Native) */}
      {isSmartVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-[#008952] to-teal-800 text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                  <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">Smart Voice to Form</h3>
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                      100% Gratis
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100">Bicara bebas dalam Bahasa Indonesia, form terisi otomatis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeechRecognition();
                  setIsSmartVoiceModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Visualizer animation */}
              <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative flex items-center justify-center">
                  {isListeningGlobal && (
                    <>
                      <div className="absolute w-20 h-20 rounded-full bg-emerald-400/25 animate-ping" />
                      <div className="absolute w-16 h-16 rounded-full bg-emerald-500/35 animate-pulse" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (isListeningGlobal) {
                        stopSpeechRecognition();
                      } else {
                        handleStartSmartVoice();
                      }
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer relative z-10 ${
                      isListeningGlobal ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200' : 'bg-[#008952] hover:bg-emerald-700'
                    }`}
                  >
                    {isListeningGlobal ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-3">
                  {isListeningGlobal ? 'Sedang Mendengarkan Suara Anda...' : 'Perekaman Selesai'}
                </p>
                <p className="text-[11px] text-slate-400 text-center px-4 mt-0.5">
                  {isListeningGlobal ? 'Sebutkan nama pelanggan, plat nomor, model motor, dan keluhannya' : 'Klik mikrofon jika ingin bicara lagi'}
                </p>
              </div>

              {/* Live Transcription Box */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Transkripsi Suara Anda:
                </label>
                <div className="w-full min-h-[56px] max-h-[90px] overflow-y-auto bg-slate-100/90 rounded-xl p-3 text-xs text-slate-800 font-medium border border-slate-200 italic">
                  {voiceTranscript || 'Belum ada suara terdeteksi. Silakan mulai berbicara...'}
                </div>
              </div>

              {/* Real-time Parsed Preview */}
              {parsedVoicePreview && (
                <div className="space-y-2 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      Hasil Ekstraksi Pintar ({parsedVoicePreview.confidenceCount} data terdeteksi):
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {parsedVoicePreview.plateNumber && (
                      <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Plat Nomor</span>
                        <span className="font-extrabold text-slate-800">{parsedVoicePreview.plateNumber}</span>
                      </div>
                    )}
                    {parsedVoicePreview.customerName && (
                      <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Nama Pemilik</span>
                        <span className="font-bold text-slate-800">{parsedVoicePreview.customerName}</span>
                      </div>
                    )}
                    {parsedVoicePreview.phone && (
                      <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Nomor WA</span>
                        <span className="font-bold text-slate-800">{parsedVoicePreview.phone}</span>
                      </div>
                    )}
                    {parsedVoicePreview.vehicleModel && (
                      <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Model Unit</span>
                        <span className="font-bold text-slate-800">{parsedVoicePreview.vehicleModel} ({parsedVoicePreview.vehicleType})</span>
                      </div>
                    )}
                    {parsedVoicePreview.serviceCategory && (
                      <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Kategori</span>
                        <span className="font-bold text-slate-800">{parsedVoicePreview.serviceCategory}</span>
                      </div>
                    )}
                  </div>
                  {parsedVoicePreview.complaint && (
                    <div className="bg-white p-2 rounded-lg border border-emerald-200/80 text-[11px]">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Keluhan / Catatan</span>
                      <span className="font-medium text-slate-800">{parsedVoicePreview.complaint}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Example Hint */}
              <div className="bg-amber-50/80 rounded-xl p-2.5 border border-amber-200/70 text-[11px] text-amber-900">
                <span className="font-bold block mb-0.5">💡 Contoh Kalimat yang Bisa Diucapkan:</span>
                <p className="text-slate-600 italic leading-snug">
                  "Budi Santoso plat D 1234 ABC nomor WA 08123456789 motor Vario 160 keluhan rem berdecit dan ganti oli"
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  stopSpeechRecognition();
                  setIsSmartVoiceModalOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyVoiceData}
                className="px-5 py-2.5 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer active:scale-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terapkan ke Formulir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WhatsApp Ticket & Offline Catalog Preview / Confirmation */}
      {waModalResult && waModalQueueInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#25D366] via-emerald-600 to-emerald-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                    Tiket Antrian & Katalog Terkirim
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    WhatsApp tiket antrian & katalog offline
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWaModalResult(null);
                  setWaModalQueueInfo(null);
                  setIsCopiedWaText(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              {/* Ticket summary cards */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Nomor Antrian:</span>
                  <span className="font-black text-sm px-3 py-1 rounded-lg bg-emerald-700 text-white shadow-2xs">
                    {waModalQueueInfo.queueNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-xs pt-2 border-t border-emerald-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Plat Nomor</span>
                    <span className="font-bold text-slate-900 text-xs">{waModalQueueInfo.plateNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Nama Pelanggan</span>
                    <span className="font-bold text-slate-900 text-xs">{waModalQueueInfo.customerName}</span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-900 pt-1 font-medium flex items-center justify-between border-t border-emerald-100 flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>WhatsApp Tujuan: <strong>{waModalQueueInfo.phone || 'Belum diisi'}</strong></span>
                  </div>
                  <span className="text-[9px] bg-emerald-200/80 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded">
                    Terhubung
                  </span>
                </div>
              </div>

              {/* Offline Catalog Links Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#008952]" />
                    <span>Tautan Katalog Suku Cadang Tersemat</span>
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                    100% Offline Ready
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-normal">
                  Pelanggan menerima tautan katalog digital dan berkas mandiri offline untuk melihat stok suku cadang, oli, dan jasa bengkel di ponselnya saat menunggu.
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <a
                    href={waModalResult.offlineCatalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-slate-800 font-bold text-[10px] flex items-center gap-1.5 shadow-2xs hover:text-emerald-700 transition"
                  >
                    <ExternalLink className="w-3 h-3 text-[#008952]" />
                    <span>Buka Katalog Offline</span>
                  </a>
                  <a
                    href={waModalResult.catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-slate-800 font-bold text-[10px] flex items-center gap-1.5 shadow-2xs hover:text-emerald-700 transition"
                  >
                    <ExternalLink className="w-3 h-3 text-[#008952]" />
                    <span>Buka Katalog Toko Online</span>
                  </a>
                </div>
              </div>

              {/* WhatsApp Raw Message Text Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>Tinjauan Pesan WhatsApp:</span>
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyMessageToClipboard(waModalResult.message);
                      if (ok) {
                        setIsCopiedWaText(true);
                        showToast('Teks pesan WhatsApp berhasil disalin!');
                        setTimeout(() => setIsCopiedWaText(false), 2000);
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition"
                  >
                    {isCopiedWaText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedWaText ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 text-emerald-200 p-3 rounded-xl font-mono text-[10.5px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-all">
                  {waModalResult.message}
                </div>
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setWaModalResult(null);
                  setWaModalQueueInfo(null);
                  setIsCopiedWaText(false);
                  setActiveTab('antrian');
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs cursor-pointer"
              >
                Ke Daftar Antrian
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    window.open(waModalResult.waUrl, '_blank');
                    showToast('Membuka WhatsApp...');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Buka Chat WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
