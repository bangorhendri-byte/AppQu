import { LayoutDashboard, Wrench, Receipt, Package, BarChart3, UserCog, Users } from 'lucide-react';
import { UserSession } from '../../types';

interface BottomNavBarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  activeQueueCount?: number;
  userRole?: UserSession['role'];
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  activeQueueCount = 4,
  userRole = 'Supervisor'
}) => {
  // Dynamic tabs according to RBAC role
  const getTabs = () => {
    if (userRole === 'Mekanik') {
      return [
        { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
        { id: 'servis', label: 'Servis', icon: Wrench, badge: activeQueueCount > 0 ? activeQueueCount : undefined },
        { id: 'inventaris', label: 'Part & Stok', icon: Package },
        { id: 'staff', label: 'Komisi Saya', icon: UserCog }
      ];
    }

    if (userRole === 'Kasir') {
      return [
        { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
        { id: 'servis', label: 'Antrian', icon: Wrench, badge: activeQueueCount > 0 ? activeQueueCount : undefined },
        { id: 'kasir', label: 'Kasir POS', icon: Receipt },
        { id: 'inventaris', label: 'Inventaris', icon: Package },
        { id: 'staff', label: 'Tim Staff', icon: Users }
      ];
    }

    return [
      { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
      { id: 'servis', label: 'Servis', icon: Wrench, badge: activeQueueCount > 0 ? activeQueueCount : undefined },
      { id: 'kasir', label: 'Kasir POS', icon: Receipt },
      { id: 'inventaris', label: 'Inventaris', icon: Package },
      { id: 'laporan', label: 'Laporan', icon: BarChart3 }
    ];
  };

  const tabs = getTabs();

  return (
    <nav 
      aria-label="Navigasi Cepat Bawah Terkunci"
      className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] px-1 pt-1 pb-[max(env(safe-area-inset-bottom,0px),0.35rem)] flex items-center justify-around select-none shrink-0 sticky bottom-0 z-50 pointer-events-auto"
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg transition-all duration-150 relative group cursor-pointer active:scale-95 ${
              isActive ? 'text-[#008952]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-50 text-[#008952]' : 'group-hover:bg-slate-50'
                }`}
              >
                <IconComponent className="w-[18px] h-[18px] stroke-[2.2]" />
              </div>
              {tab.badge && (
                <span className="absolute -top-0.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-2xs leading-none">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[9.5px] leading-tight tracking-tight mt-0.5 transition-all ${
                isActive ? 'font-black text-[#008952]' : 'font-medium text-slate-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
