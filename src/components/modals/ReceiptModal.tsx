import React from 'react';
import { X, Printer, Share2, Check, Sparkles } from 'lucide-react';
import { Transaction } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWA = () => {
    const text = encodeURIComponent(
      `*NOTA RESMI BENGKEL QU 1.60*\nNo: ${transaction.invoiceNumber}\nTanggal: ${transaction.date}\nPelanggan: ${transaction.customerName} (${transaction.plateNumber})\nMekanik: ${transaction.mechanicName}\nTotal: Rp ${transaction.total.toLocaleString('id-ID')} (${transaction.paymentMethod})\n\nTerima kasih telah mempercayakan kendaraan Anda di Bengkel Qu!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="bg-[#008952] text-white p-3.5 flex items-center justify-between">
          <span className="font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            Struk Pembayaran Kasir
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Receipt Slip */}
        <div className="p-5 overflow-y-auto bg-slate-50 text-slate-800 font-mono text-xs">
          <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 shadow-xs space-y-3">
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <h2 className="font-black text-base tracking-wider text-slate-900">BENGKEL QU 1.60</h2>
              <p className="text-[10px] text-slate-500 font-sans">
                Jl. Otista Raya No. 128, Bandung
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                Telp / WA: 0812-3456-7890
              </p>
            </div>

            {/* Meta */}
            <div className="space-y-0.5 text-[11px] pb-2 border-b border-dashed border-slate-300 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Faktur:</span>
                <span className="font-bold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{transaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold">{transaction.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Plat:</span>
                <span className="font-bold">{transaction.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mekanik:</span>
                <span>{transaction.mechanicName}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-300">
              {transaction.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <div className="pr-2 truncate">
                    <span>{it.name}</span>
                    <span className="text-slate-400 block text-[10px]">
                      {it.qty} x Rp {it.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="font-bold shrink-0">
                    Rp {(it.price * it.qty).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-1 text-xs font-sans pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>Rp {transaction.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>- Rp {transaction.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                <span>TOTAL:</span>
                <span className="text-[#008952]">Rp {transaction.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                <span>Metode:</span>
                <span className="font-semibold">{transaction.paymentMethod}</span>
              </div>
              {transaction.cashPaid && transaction.paymentMethod === 'Tunai' && (
                <>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Bayar Tunai:</span>
                    <span>Rp {transaction.cashPaid.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                    <span>Kembalian:</span>
                    <span>Rp {(transaction.change || 0).toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-1 font-sans space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold">
                *** LUNAS - TERIMA KASIH ***
              </p>
              <p className="text-[9px] text-slate-400">
                Garansi servis pengerjaan 7 hari kalender. Simpan nota ini sebagai bukti klaim garansi.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={handleShareWA}
            className="flex-1 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#008952] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WA</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-[#008952] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Nota</span>
          </button>
        </div>
      </div>
    </div>
  );
};
