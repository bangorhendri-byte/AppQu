import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Users, 
  Clock, 
  Receipt, 
  UtensilsCrossed, 
  CheckCircle2, 
  Sparkles,
  CalendarCheck,
  ChevronRight,
  X,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { KedaiTable, TableArea, TableStatus } from '../KedaiTypes';

interface DenahViewProps {
  tables: KedaiTable[];
  onUpdateTable: (updated: KedaiTable) => void;
  onAddTable: (table: Omit<KedaiTable, 'id'>) => void;
  onSelectTableForOrder: (table: KedaiTable) => void;
  onPayTableBill: (table: KedaiTable) => void;
}

export const DenahView: React.FC<DenahViewProps> = ({
  tables,
  onUpdateTable,
  onAddTable,
  onSelectTableForOrder,
  onPayTableBill
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('Semua');
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeModalTable, setActiveModalTable] = useState<KedaiTable | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  // New table form
  const [newTableName, setNewTableName] = useState('');
  const [newTableArea, setNewTableArea] = useState<TableArea>('Indoor AC');
  const [newTableChairs, setNewTableChairs] = useState<number>(4);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const areas: ('Semua' | TableArea)[] = ['Semua', 'Indoor AC', 'Outdoor', 'VIP Room', 'Bar'];

  const filteredTables = selectedArea === 'Semua' 
    ? tables 
    : tables.filter(t => t.area === selectedArea);

  const stats = {
    total: tables.length,
    kosong: tables.filter(t => t.status === 'kosong').length,
    terisi: tables.filter(t => t.status === 'terisi').length,
    billing: tables.filter(t => t.status === 'billing').length,
    reservasi: tables.filter(t => t.status === 'reservasi').length
  };

  const handlePointerDown = (e: React.PointerEvent, table: KedaiTable) => {
    if (isLocked) return;
    e.stopPropagation();
    setDraggingId(table.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLocked || !draggingId) return;
    const container = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(10, Math.min(container.width - 150, e.clientX - container.left - dragOffset.x));
    const newY = Math.max(10, Math.min(container.height - 130, e.clientY - container.top - dragOffset.y));

    const targetTable = tables.find(t => t.id === draggingId);
    if (targetTable) {
      onUpdateTable({
        ...targetTable,
        x: Math.round(newX),
        y: Math.round(newY)
      });
    }
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  const handleSaveNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    onAddTable({
      name: newTableName.trim(),
      area: newTableArea,
      chairs: newTableChairs,
      status: 'kosong',
      x: 30 + (tables.length % 3) * 150,
      y: 30 + Math.floor(tables.length / 3) * 140
    });
    setNewTableName('');
    setIsAddTableOpen(false);
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'kosong':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Kosong</span>;
      case 'terisi':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">Terisi</span>;
      case 'billing':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">Billing</span>;
      case 'reservasi':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">Reservasi</span>;
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Header & Bar Kontrol Ringkas (Optimal Full Screen Denah) */}
      <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-[#E7DFD5]">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-black text-[#1B3B2B] flex items-center gap-1.5">
            <span>🗺️ Denah Meja</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle Lock Denah */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLocked 
                ? 'bg-[#1B3B2B] text-[#FAF7F2] hover:bg-[#152e22]' 
                : 'bg-[#C59B27] text-white animate-bounce shadow-xs'
            }`}
            title="Kunci / Buka kunci untuk menggeser letak denah meja"
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Kunci Posisi' : 'Mode Geser Meja'}</span>
          </button>

          {/* Tambah Meja */}
          <button
            onClick={() => setIsAddTableOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#C59B27] text-white hover:bg-[#b0891f] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Meja</span>
          </button>
        </div>
      </div>

      {/* Filter Area Berbasis Underline Minimalis */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#E7DFD5]">
        {areas.map(area => {
          const isActive = selectedArea === area;
          const countInArea = area === 'Semua' 
            ? tables.length 
            : tables.filter(t => t.area === area).length;
          return (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                isActive 
                  ? 'border-[#C59B27] text-[#1B3B2B] font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{area}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-[#1B3B2B] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {countInArea}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanvas Denah Meja Interaktif - Luas & Optimal */}
      <div 
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative bg-white rounded-2xl border border-[#E7DFD5] shadow-xs min-h-[560px] sm:min-h-[640px] overflow-hidden p-4 select-none"
        style={{
          backgroundImage: 'radial-gradient(#E2D9CE 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div className="absolute top-3 left-3 text-[10px] font-semibold text-slate-400 bg-white/80 px-2 py-0.5 rounded-md backdrop-blur-xs border border-slate-200">
          Denah Lantai Kedai • {isLocked ? 'Klik meja untuk opsi' : 'Mode geser aktif: seret meja'}
        </div>

        {filteredTables.map(table => {
          const isOccupied = table.status === 'terisi';
          const isBilling = table.status === 'billing';
          const isReserved = table.status === 'reservasi';

          const cardBorder = isBilling 
            ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/50' 
            : isOccupied 
            ? 'border-amber-300 bg-amber-50/40' 
            : isReserved 
            ? 'border-indigo-300 bg-indigo-50/40' 
            : 'border-slate-200 bg-white hover:border-[#C59B27]';

          return (
            <div
              key={table.id}
              onPointerDown={(e) => handlePointerDown(e, table)}
              onClick={() => {
                if (isLocked) setActiveModalTable(table);
              }}
              style={{
                left: `${table.x}px`,
                top: `${table.y}px`,
                touchAction: 'none'
              }}
              className={`absolute w-36 sm:w-40 rounded-xl border p-2.5 transition-shadow shadow-xs cursor-pointer ${cardBorder} ${
                !isLocked ? 'cursor-grab active:cursor-grabbing border-dashed border-2' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#1B3B2B] truncate">{table.name}</span>
                {getStatusBadge(table.status)}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1.5">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{table.chairs} Kursi</span>
                <span className="text-slate-300">•</span>
                <span className="truncate">{table.area}</span>
              </div>

              {isOccupied || isBilling ? (
                <div className="pt-1.5 border-t border-slate-200/80 space-y-0.5">
                  <p className="text-[11px] font-semibold text-slate-700 truncate">
                    👤 {table.customerName || 'Tamu'}
                  </p>
                  <p className="text-xs font-bold text-[#1B3B2B]">
                    Rp {(table.orderTotal || 0).toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Masuk: {table.occupiedSince || '-'}</span>
                  </div>
                </div>
              ) : isReserved ? (
                <div className="pt-1.5 border-t border-indigo-100">
                  <p className="text-[10px] font-medium text-indigo-700 truncate">
                    {table.customerName || 'Reservasi'}
                  </p>
                  <p className="text-[9px] text-indigo-500">Pukul: {table.occupiedSince || '-'}</p>
                </div>
              ) : (
                <div className="pt-1.5 border-t border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-emerald-700">+ Buka Order</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Detail Meja & Opsi Aksi Cepat */}
      {activeModalTable && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#1B3B2B] flex items-center gap-2">
                  <span>{activeModalTable.name}</span>
                  {getStatusBadge(activeModalTable.status)}
                </h3>
                <p className="text-xs text-slate-400">Area {activeModalTable.area} • Kapasitas {activeModalTable.chairs} Orang</p>
              </div>
              <button 
                onClick={() => setActiveModalTable(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konten Berdasarkan Status Meja */}
            {activeModalTable.status === 'kosong' && (
              <div className="space-y-2 py-1">
                <p className="text-xs text-slate-600">
                  Meja ini saat ini kosong dan siap menerima pelanggan baru.
                </p>
                <button
                  onClick={() => {
                    const tbl = activeModalTable;
                    setActiveModalTable(null);
                    onSelectTableForOrder(tbl);
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <UtensilsCrossed className="w-4 h-4 text-[#C59B27]" />
                  <span>Buka Meja & Buat Pesanan Baru</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateTable({
                      ...activeModalTable,
                      status: 'reservasi',
                      customerName: 'Reservasi Baru',
                      occupiedSince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                    setActiveModalTable(null);
                  }}
                  className="w-full py-2 rounded-xl font-semibold text-xs border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Tandai Sebagai Reservasi</span>
                </button>
              </div>
            )}

            {(activeModalTable.status === 'terisi' || activeModalTable.status === 'billing') && (
              <div className="space-y-3 py-1">
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7DFD5] space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Pelanggan:</span>
                    <span className="font-semibold text-slate-800">{activeModalTable.customerName || 'Tamu'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Mulai Nongkrong:</span>
                    <span className="font-semibold text-slate-800">{activeModalTable.occupiedSince || '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-[#E7DFD5]">
                    <span className="text-slate-600 font-semibold">Total Tagihan:</span>
                    <span className="font-bold text-[#1B3B2B] text-sm">
                      Rp {(activeModalTable.orderTotal || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {activeModalTable.orderItems && activeModalTable.orderItems.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 text-xs pr-1">
                    <p className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">Item Dipesan:</p>
                    {activeModalTable.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-700">{item.qty}x {item.name}</span>
                        <span className="font-semibold text-slate-800">Rp {item.totalPrice.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      const tbl = activeModalTable;
                      setActiveModalTable(null);
                      onSelectTableForOrder(tbl);
                    }}
                    className="py-2 rounded-xl text-xs font-semibold border border-[#C59B27] text-[#1B3B2B] hover:bg-amber-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>+ Item Baru</span>
                  </button>
                  <button
                    onClick={() => {
                      const tbl = activeModalTable;
                      setActiveModalTable(null);
                      onPayTableBill(tbl);
                    }}
                    className="py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>Bayar / Kasir</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  {activeModalTable.status === 'terisi' && (
                    <button
                      onClick={() => {
                        onUpdateTable({ ...activeModalTable, status: 'billing' });
                        setActiveModalTable(null);
                      }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100"
                    >
                      Minta Billing
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Kosongkan meja ini tanpa pembayaran?')) {
                        onUpdateTable({
                          ...activeModalTable,
                          status: 'kosong',
                          customerName: undefined,
                          pax: undefined,
                          orderTotal: undefined,
                          orderItems: []
                        });
                        setActiveModalTable(null);
                      }
                    }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100"
                  >
                    Kosongkan Meja
                  </button>
                </div>
              </div>
            )}

            {activeModalTable.status === 'reservasi' && (
              <div className="space-y-2 py-1">
                <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 text-xs text-indigo-900">
                  <p className="font-semibold">{activeModalTable.customerName}</p>
                  <p className="text-[11px] text-indigo-700">Waktu Kedatangan: {activeModalTable.occupiedSince || '-'}</p>
                </div>
                <button
                  onClick={() => {
                    const tbl = activeModalTable;
                    setActiveModalTable(null);
                    onSelectTableForOrder(tbl);
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1B3B2B] text-white hover:bg-[#152e22] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tamu Hadir - Buka Order</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateTable({
                      ...activeModalTable,
                      status: 'kosong',
                      customerName: undefined,
                      pax: undefined
                    });
                    setActiveModalTable(null);
                  }}
                  className="w-full py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50"
                >
                  Batalkan Reservasi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Meja Baru */}
      {isAddTableOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveNewTable} className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-[#E7DFD5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B3B2B]">Tambah Meja Baru</h3>
              <button 
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama / Nomor Meja</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Meja 05 / Gazebo 02"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E7DFD5] focus:outline-none focus:ring-2 focus:ring-[#C59B27] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Area</label>
                <select
                  value={newTableArea}
                  onChange={(e) => setNewTableArea(e.target.value as TableArea)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E7DFD5] focus:outline-none focus:ring-2 focus:ring-[#C59B27] bg-[#FAF7F2]"
                >
                  <option value="Indoor AC">Indoor AC</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="VIP Room">VIP Room</option>
                  <option value="Bar">Bar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kapasitas Kursi</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 10].map(chair => (
                    <button
                      type="button"
                      key={chair}
                      onClick={() => setNewTableChairs(chair)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold ${
                        newTableChairs === chair
                          ? 'border-[#C59B27] bg-amber-50 text-[#1B3B2B]'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {chair === 10 ? 'VIP (10)' : `${chair} Kursi`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#1B3B2B] text-white hover:bg-[#152e22] shadow-xs"
              >
                Simpan Meja
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
