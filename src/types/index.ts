import type { ComponentType } from 'react';

export interface RawTransaction {
  id: number | string;
  date: string;
  amount: number | string;
  type: string;
  category?: string;
  description?: string;
  desc?: string;
  user_id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: 'MASUK' | 'KELUAR';
  category: string;
  description?: string;
  desc: string;
  dateObj: Date;
  dateKey: string;
  dateStr: string;
  month: number;
  year: number;
  source?: 'supabase' | 'sheet';
  status?: string;
  user_id?: string;
}

export interface Goal {
  id: number;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  is_active: boolean;
  created_at: string;
}

export type ThemeId = 'emerald' | 'dark' | 'pastel' | 'rainbow' | 'vintage' | 'modern' | 'pixel' | 'cyberpunk';

export interface ThemeConfig {
  id: ThemeId;
  bg: string;
  cardBg: string;
  bgSoft: string;
  textMain: string;
  textSub: string;
  border: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  primaryLight: string;
  primaryBorder: string;
  chartMain: string;
  activeTab: string;
  inactiveTab: string;
  headerBg: string;
  primaryGradient: string;
  gradientText: string;
  borderFocus: string;
  tableHead: string;
  divide: string;
  selectionColor: string;
  darkCardBg: string;
  accentDark: string;
  hexBg: string;
  chartColors: string[];
  chartHex: string[];
}

export interface AdvisorStyle {
  bg: string;
  iconBg: string;
  textMain: string;
  textSub: string;
  border: string;
}

export interface AdvisorInsight {
  title: string;
  message: string;
  theme: AdvisorStyle;
}

export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
  active: boolean;
  color: string;
  bg: string;
  border: string;
}

export interface CategoryData {
  name: string;
  amount: number;
}

export interface ChartDataPoint {
  date: string;
  Pengeluaran: number;
}
