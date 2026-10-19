import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, DollarSign, Info, MapPin, Phone } from 'lucide-react';
import { NotificationItem } from '../../types';
import { BuyerPingAlert } from '../customerqu/CustomerQuTypes';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  buyerPings?: BuyerPingAlert[];
  onSelectPing?: (ping: BuyerPingAlert) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  buyerPings = [],
  onSelectPing
}) => {
  if (!isOpen) return null;

  const activePings = buyerPings.filter((p) => p.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#008952] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Pemberitahuan & Panggilan</h3>
              <p className="text-[10px] text-emerald-100">Notifikasi Usaha & Radar CustomerQu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Section Panggilan Radar Pembeli jika ada */}
          {activePings.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Panggilan Pembeli CustomerQu ({activePings.length})
              </span>
              {activePings.map((ping) => (
                <div
                  key={ping.id}
                  onClick={() => {
                    if (onSelectPing) {
                      onSelectPing(ping);
                      onClose();
                    }
                  }}
                  className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs space-y-1.5 cursor-pointer hover:bg-rose-100/80 transition active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-rose-900 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 fill-rose-600 text-rose-600 animate-bounce" />
                      {ping.buyerName}
                    </span>
                    <span className="text-[9px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.2 rounded-full">
                      PANGGILAN AKTIF
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                    <span className="truncate">{ping.buyerAddress}</span>
                  </p>
                  <div className="text-[10px] text-rose-700 font-bold">
                    HP: {ping.buyerPhone}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section Notifikasi Standar Usaha */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Notifikasi Sistem
            </span>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
                  n.read
                    ? 'bg-slate-50 border-slate-100 opacity-75'
                    : 'bg-emerald-50/60 border-emerald-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{n.title}</span>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllAsRead}
            className="text-[#008952] font-bold hover:underline cursor-pointer"
          >
            Tandai Semua Dibaca
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
