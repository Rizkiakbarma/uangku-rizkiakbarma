import React from 'react';
import { Menu, Palette, RefreshCcw, Sparkles } from 'lucide-react';
import { Badge, Flex } from '@tremor/react';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { t, toggleTheme, isSyncingGAS, isDemo, userId, fetchData, fetchGoals } = useApp();

  const handleRefresh = () => {
    if (userId) {
      fetchData(userId, true);
      fetchGoals(userId, true);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl px-5 lg:px-8 py-3 flex justify-between items-center border-b shrink-0 transition-colors duration-500 ${t.headerBg} ${t.border}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-lg border ${t.border} ${t.textSub} ${t.cardBg}`}
        >
          <Menu size={20} />
        </button>
        <Flex className="gap-2">
          <Badge
            className={`hidden sm:flex px-2.5 py-0.5 font-bold text-[8px] uppercase tracking-widest rounded-full border animate-pulse ${t.primaryLight} ${t.primaryText} ${t.border}`}
          >
            Live Sync Active
          </Badge>
          {isSyncingGAS && (
            <Badge className="hidden sm:flex px-2.5 py-0.5 font-bold text-[8px] uppercase tracking-widest rounded-full border animate-pulse bg-amber-50 text-amber-600 border-amber-100">
              ⟳ Sync Legacy Data
            </Badge>
          )}
        </Flex>
      </div>

      <div className="flex items-center gap-3">
        {isDemo && (
          <Badge color="amber" icon={Sparkles} className="font-bold px-2.5 py-0.5 rounded-full text-[8px]">
            Mode Demo
          </Badge>
        )}
        <button
          onClick={toggleTheme}
          className={`p-2 ${t.cardBg} hover:${t.bgSoft} rounded-xl shadow-sm ring-1 ${t.border} ${t.textSub} active:scale-90 transition-all`}
          title="Ganti Tema Visual"
        >
          <Palette size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleRefresh}
          className={`p-2 ${t.cardBg} hover:${t.bgSoft} rounded-xl shadow-sm ring-1 ${t.border} ${t.textSub} active:scale-90 transition-all`}
          title="Refresh Data"
        >
          <RefreshCcw size={16} strokeWidth={2.5} className={isSyncingGAS ? 'animate-spin' : ''} />
        </button>
        <div className={`w-9 h-9 ${t.primary} text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-md`}>
          RA
        </div>
      </div>
    </header>
  );
}
