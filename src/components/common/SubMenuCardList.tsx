import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SubMenuItemConfig } from '../../types';
import { IconRenderer } from './IconRenderer';

interface SubMenuCardListProps {
  items: SubMenuItemConfig[];
  onSelectItem: (item: SubMenuItemConfig) => void;
  activeId?: string;
}

export const SubMenuCardList: React.FC<SubMenuCardListProps> = ({
  items,
  onSelectItem,
  activeId
}) => {
  return (
    <div className="bg-slate-50/60 min-h-[calc(100%-140px)] px-4 py-4 space-y-3">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`w-full text-left bg-white rounded-2xl p-4 shadow-[0_3px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,137,82,0.12)] border transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${
              isActive
                ? 'border-[#008952] ring-2 ring-emerald-500/20'
                : 'border-slate-100 hover:border-emerald-200'
            }`}
          >
            {/* Left side: Square green icon with rounded corners & texts */}
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              {/* Square green icon with rounded corners containing white minimalist icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#008952] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-700/25 group-hover:scale-105 transition-transform">
                <IconRenderer name={item.iconName} className="w-7 h-7 text-white stroke-[2.3]" />
              </div>

              {/* Bold main title & smaller descriptive subtitle underneath */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-[15px] leading-tight tracking-tight group-hover:text-[#008952] transition-colors truncate">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#008952] border border-emerald-100">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug truncate">
                  {item.subtitle}
                </p>
              </div>
            </div>

            {/* Far right: Simple grey greater-than arrow icon (>) */}
            <div className="shrink-0 pl-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#008952] group-hover:translate-x-0.5 transition-all">
                <ChevronRight className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
