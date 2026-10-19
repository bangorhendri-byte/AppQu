/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CustomerQuChatModal - In-App Chat Ringan Instan
 * - Tanpa perlu simpan nomor kontak
 * - Draf Balasan Cepat (Quick Replies) 1-Klik
 * - Auto-delete riwayat chat setelah 24 jam untuk hemat memori & privasi
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { SellerMarker, InAppChatMessage } from './CustomerQuTypes';
import { 
  getSavedChatMessages, 
  saveChatMessage, 
  BUYER_QUICK_REPLIES, 
  SELLER_QUICK_REPLIES,
  playMessageAlertChime 
} from './CustomerQuStorage';

interface CustomerQuChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerMarker;
  currentUserRole?: 'buyer' | 'seller';
}

export const CustomerQuChatModal: React.FC<CustomerQuChatModalProps> = ({
  isOpen,
  onClose,
  seller,
  currentUserRole = 'buyer'
}) => {
  const [messages, setMessages] = useState<InAppChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load chat messages for this seller
  useEffect(() => {
    if (!isOpen) return;
    const loaded = getSavedChatMessages(seller.id);
    if (loaded.length === 0) {
      // Buat pesan sambutan default dari pedagang
      const welcomeMsg: InAppChatMessage = {
        id: `msg-welcome-${seller.id}`,
        conversationId: `conv-${seller.id}`,
        sellerId: seller.id,
        senderRole: 'seller',
        senderName: seller.name,
        text: `Halo kak! Selamat datang di ${seller.name}. Ada yang bisa saya bantu atau mau pesan menu apa hari ini?`,
        timestamp: Date.now() - 60000,
        expiresAt: Date.now() + 24 * 3600 * 1000,
        read: true
      };
      saveChatMessage(welcomeMsg);
      setMessages([welcomeMsg]);
    } else {
      setMessages(loaded);
    }
  }, [isOpen, seller.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean) return;

    playMessageAlertChime();

    const newMsg: InAppChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: `conv-${seller.id}`,
      sellerId: seller.id,
      senderRole: currentUserRole,
      senderName: currentUserRole === 'buyer' ? 'Anda (Pembeli)' : seller.name,
      text: clean,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 3600 * 1000,
      read: true
    };

    const updated = saveChatMessage(newMsg);
    setMessages(updated.filter((m) => m.sellerId === seller.id));
    setInputVal('');

    // Simulasi balasan pedagang jika pengguna bertindak sebagai pembeli
    if (currentUserRole === 'buyer') {
      setTimeout(() => {
        const replyText = clean.toLowerCase().includes('mampir') 
          ? 'Siap meluncur ke tempat Anda kak! Mohon ditunggu sekitar 3-5 menit ya.'
          : clean.toLowerCase().includes('qris') || clean.toLowerCase().includes('bayar')
          ? 'Bisa bayar tunai pas atau scan QRIS langsung di gerobak ya kak.'
          : 'Baik kak, pesanan dicatat ya. Sebentar lagi kami sampai di depan!';

        const autoReply: InAppChatMessage = {
          id: `msg-rep-${Date.now()}`,
          conversationId: `conv-${seller.id}`,
          sellerId: seller.id,
          senderRole: 'seller',
          senderName: seller.name,
          text: replyText,
          timestamp: Date.now(),
          expiresAt: Date.now() + 24 * 3600 * 1000,
          read: true
        };
        saveChatMessage(autoReply);
        setMessages((prev) => [...prev, autoReply]);
        playMessageAlertChime();
      }, 1500);
    }
  };

  const quickReplies = currentUserRole === 'buyer' ? BUYER_QUICK_REPLIES : SELLER_QUICK_REPLIES;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full h-[85vh] max-h-[680px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header Chat */}
        <div className="bg-[#008952] text-white p-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center text-lg font-black shadow-inner">
              {seller.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight truncate max-w-[190px]">
                  {seller.name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </div>
              <p className="text-[10px] text-emerald-100 font-medium">
                Aktif di Radar • Respon Cepat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Chat"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* 24h Auto-delete Privacy Notice Banner */}
        <div className="bg-emerald-50 px-3.5 py-1.5 border-b border-emerald-200/80 text-[10px] text-[#008952] font-bold flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>Chat otomatis terhapus dalam 24 jam untuk hemat memori & privasi</span>
          </span>
          <span className="bg-white px-1.5 py-0.2 rounded font-mono text-[9px] border border-emerald-300">
            24H Cleanup
          </span>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
          {messages.map((msg) => {
            const isMe = msg.senderRole === currentUserRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}
              >
                <span className="text-[10px] text-slate-400 font-bold px-1">
                  {isMe ? 'Anda' : seller.name.split(' ')[0]}
                </span>
                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[#008952] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Replies (Draf Balasan Cepat 1-Klik) */}
        <div className="bg-white p-2.5 border-t border-slate-100 shrink-0 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Draf Balasan Cepat (1-Klik):</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qr)}
                className="shrink-0 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#008952] hover:border-emerald-300 border border-slate-200/80 rounded-xl px-2.5 py-1 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {qr}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ketik pesan instan..."
            className="flex-1 bg-slate-100 border border-slate-200 focus:border-[#008952] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="w-10 h-10 rounded-xl bg-[#008952] hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-md transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
