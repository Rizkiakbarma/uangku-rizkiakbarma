import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import {
  Activity, LayoutDashboard, History, Target, Calculator, LogOut,
} from 'lucide-react';
import { Badge } from '@tremor/react';
import { useApp } from '../contexts/AppContext';

const NAV_ITEMS = [
  { path: 'dashboard', label: 'Dashboard',         icon: LayoutDashboard },
  { path: 'ledger',    label: 'Riwayat Mutasi',    icon: History },
  { path: 'goals',     label: 'Target Goals',      icon: Target },
  { path: 'zakat',     label: 'Kalkulator Zakat',  icon: Calculator },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useApp();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userid');
  const query = userId ? `?userid=${userId}` : '';

  return (
    <div className="h-full flex flex-col p-5 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-8 pl-2">
        <div className={`w-10 h-10 ${t.primary} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
          <Activity className="text-white" size={20} strokeWidth={3} />
        </div>
        <div>
          <h1 className={`text-lg font-black tracking-tighter leading-none uppercase ${t.textMain}`}>BudgetIN</h1>
          <Badge className={`mt-1 text-[8px] font-black uppercase px-2 py-0 border ${t.primaryLight} ${t.primaryText} ${t.border}`}>
            Versi Pro
          </Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={`/${path}${query}`}
            onClick={onClose}
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                isActive ? t.activeTab : t.inactiveTab
              }`
            }
          >
            <div className="shrink-0"><Icon size={20} strokeWidth={2.5} /></div>
            <span className="text-[13px] whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
        <div className={`h-[1px] ${t.bgSoft} my-4 mx-2`} />
      </nav>

      {/* Logout */}
      <div className={`pt-6 border-t ${t.border}`}>
        <button className={`w-full flex items-center justify-start gap-4 px-4 py-3 ${t.textSub} hover:text-rose-500 font-bold text-[13px] transition-colors`}>
          <LogOut size={18} strokeWidth={2.5} /> Keluar
        </button>
      </div>
    </div>
  );
}
