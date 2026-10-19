import React from 'react';
import { MenuModuleConfig, SubMenuItemConfig } from '../../types';
import { SubMenuHeader } from '../common/SubMenuHeader';
import { SubMenuCardList } from '../common/SubMenuCardList';
import { Sparkles } from 'lucide-react';

interface SubMenuPageProps {
  module: MenuModuleConfig;
  onBack: () => void;
  onSelectSubMenu: (subItem: SubMenuItemConfig) => void;
  activeSubMenuId?: string;
}

export const SubMenuPage: React.FC<SubMenuPageProps> = ({
  module,
  onBack,
  onSelectSubMenu,
  activeSubMenuId
}) => {
  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* 
        Top Header: Solid green background with a back arrow icon on the left, 
        a white module title, a secondary subtitle, and a subtle vector illustration graphic on the right.
        Below the header: rounded white container card displaying small info icon and title label.
      */}
      <SubMenuHeader
        title={module.title}
        subtitle={module.subtitle || 'Manajemen Bengkel'}
        infoLabel={`Modul Manajemen ${module.title}`}
        onBack={onBack}
      />

      {/* 
        Content Body: Clean white background featuring a vertical list of wide rounded-rectangle cards
        (white cards with a soft drop shadow).
        Inside each card on left: square green icon with rounded corners containing white minimalist icon.
        Next to it: bold main title and smaller descriptive subtitle.
        Far right: simple grey greater-than arrow icon (>).
      */}
      <div className="flex-1 bg-white">
        {/* Module description helper */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            {module.description}
          </p>
        </div>

        {/* The Card List */}
        <SubMenuCardList
          items={module.subMenus}
          onSelectItem={onSelectSubMenu}
          activeId={activeSubMenuId}
        />
      </div>

      {/* Footer hint */}
      <div className="py-3 px-4 text-center bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>Bengkel Qu 1.60 • Sistem Operasional Bengkel Terintegrasi</span>
      </div>
    </div>
  );
};
