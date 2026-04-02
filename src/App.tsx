// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Activity, Loader2, Lock, CheckCircle2, LayoutDashboard, History,
  Search, RefreshCcw, Trash2, AlertTriangle, Target, Calculator,
  Coins, HeartHandshake, ArrowUpRight, ArrowDownRight, Zap,
  ChevronRight, ChevronLeft, Calendar, Menu, Settings, LogOut,
  Sparkles, BarChart3, TrendingUp, LineChart as LineChartIcon,
  Bot, MessageSquare, Download, Palette
} from 'lucide-react';

import {
  Card, Metric, Text, Flex, ProgressBar, Grid, AreaChart,
  DonutChart, Title, Badge, BarChart
} from "@tremor/react";

/**
 * BudgetIN PRO - ENTERPRISE ULTIMATE (V29.4 - EXTENDED THEME ENGINE)
 * Fix: Menambahkan Tema Rainbow (Mejikuhibiniu), Vintage, dan Modern Minimalist.
 */

// 🔥 1. SETUP KONEKSI DUA SUMBER DATA
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyslKsTua7BE8pwmFh1xfRZn7QhfQMSKbGYvY3nAxx6qu41iRXJLBK-z8AsKVSd2_g1ng/exec";
const SUPABASE_URL = "https://tdjzksdxnvxoaethaxeo.supabase.co";
const SUPABASE_KEY = "sb_publishable_CIPEHIf12ctSTq_liVgWiA_E3n734fh";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DUMMY_DATA = [
  { id: 991, date: new Date(), amount: 15500000, type: 'MASUK', category: 'MASUK', desc: 'Gaji Bulanan (Contoh)' },
  { id: 992, date: new Date(), amount: 250000, type: 'KELUAR', category: 'Food and Beverages', desc: 'Makan Siang' },
  { id: 993, date: new Date(), amount: 350000, type: 'KELUAR', category: 'Tagihan', desc: 'Internet Wifi' },
  { id: 994, date: new Date(), amount: 100000, type: 'KELUAR', category: 'SEDEKAH/ZAKAT', desc: 'Infaq Jumat' },
];

// 🔥 KONFIGURASI TEMA (THEME ENGINE - 6 TEMAS)
const THEMES = {
  emerald: {
    id: 'emerald',
    bg: 'bg-[#FCFCFC]',
    cardBg: 'bg-white',
    bgSoft: 'bg-slate-50',
    textMain: 'text-slate-900',
    textSub: 'text-slate-500',
    border: 'border-slate-100',
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-500',
    primaryText: 'text-emerald-600',
    primaryLight: 'bg-emerald-50',
    primaryBorder: 'border-emerald-600',
    chartMain: 'emerald',
    activeTab: 'bg-emerald-600 text-white shadow-[0_8px_16px_rgba(16,185,129,0.15)]',
    inactiveTab: 'text-slate-500 hover:bg-slate-50',
    headerBg: 'bg-white/60',
    primaryGradient: 'from-emerald-600 to-emerald-900',
    gradientText: 'from-emerald-600 to-teal-400',
    borderFocus: 'focus:border-emerald-500 focus:ring-emerald-100',
    tableHead: 'bg-slate-900 text-slate-400',
    divide: 'divide-slate-50',
    selectionColor: 'selection:bg-emerald-100',
    darkCardBg: 'bg-slate-900',
    accentDark: 'text-emerald-400',
    hexBg: '#FCFCFC',
    chartColors: ["emerald-800", "emerald-500", "rose-500", "amber-500", "slate-800", "blue-500", "fuchsia-500", "cyan-500"],
    chartHex: ["#065f46", "#10b981", "#f43f5e", "#f59e0b", "#1e293b", "#3b82f6", "#d946ef", "#06b6d4"]
  },
  dark: {
    id: 'dark',
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    bgSoft: 'bg-slate-800/50',
    textMain: 'text-slate-50',
    textSub: 'text-slate-400',
    border: 'border-slate-800',
    primary: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-500',
    primaryText: 'text-indigo-400',
    primaryLight: 'bg-indigo-900/30',
    primaryBorder: 'border-indigo-600',
    chartMain: 'indigo',
    activeTab: 'bg-indigo-600 text-white shadow-[0_8px_16px_rgba(79,70,229,0.15)]',
    inactiveTab: 'text-slate-400 hover:bg-slate-800/50',
    headerBg: 'bg-slate-950/80',
    primaryGradient: 'from-indigo-600 to-indigo-900',
    gradientText: 'from-indigo-400 to-cyan-400',
    borderFocus: 'focus:border-indigo-500 focus:ring-indigo-900/50',
    tableHead: 'bg-slate-950 text-slate-400',
    divide: 'divide-slate-800/50',
    selectionColor: 'selection:bg-indigo-500/30',
    darkCardBg: 'bg-slate-800',
    accentDark: 'text-indigo-400',
    hexBg: '#020617',
    chartColors: ["indigo-800", "indigo-500", "rose-500", "amber-500", "slate-800", "emerald-500", "fuchsia-500", "cyan-500"],
    chartHex: ["#3730a3", "#6366f1", "#f43f5e", "#f59e0b", "#1e293b", "#10b981", "#d946ef", "#06b6d4"]
  },
  pastel: {
    id: 'pastel',
    bg: 'bg-pink-50',
    cardBg: 'bg-white',
    bgSoft: 'bg-rose-50/50',
    textMain: 'text-stone-800',
    textSub: 'text-stone-500',
    border: 'border-pink-100',
    primary: 'bg-rose-400',
    primaryHover: 'hover:bg-rose-300',
    primaryText: 'text-rose-500',
    primaryLight: 'bg-rose-50',
    primaryBorder: 'border-rose-400',
    chartMain: 'rose',
    activeTab: 'bg-rose-400 text-white shadow-[0_8px_16px_rgba(251,113,133,0.15)]',
    inactiveTab: 'text-stone-500 hover:bg-rose-50',
    headerBg: 'bg-pink-50/80',
    primaryGradient: 'from-rose-400 to-pink-600',
    gradientText: 'from-rose-500 to-pink-400',
    borderFocus: 'focus:border-rose-400 focus:ring-rose-100',
    tableHead: 'bg-stone-900 text-stone-400',
    divide: 'divide-pink-50',
    selectionColor: 'selection:bg-rose-100',
    darkCardBg: 'bg-stone-900',
    accentDark: 'text-pink-400',
    hexBg: '#fdf2f8',
    chartColors: ["rose-800", "rose-400", "emerald-400", "amber-400", "slate-800", "blue-400", "fuchsia-400", "cyan-400"],
    chartHex: ["#9f1239", "#fb7185", "#34d399", "#fbbf24", "#1e293b", "#60a5fa", "#e879f9", "#22d3ee"]
  },
  rainbow: { // 🌈 TEMA BARU: PASTEL MEJIKUHIBINIU
    id: 'rainbow',
    bg: 'bg-slate-50',
    cardBg: 'bg-white',
    bgSoft: 'bg-indigo-50/50',
    textMain: 'text-slate-800',
    textSub: 'text-slate-500',
    border: 'border-indigo-100',
    primary: 'bg-indigo-400',
    primaryHover: 'hover:bg-indigo-500',
    primaryText: 'text-indigo-500',
    primaryLight: 'bg-indigo-50',
    primaryBorder: 'border-indigo-400',
    chartMain: 'indigo',
    activeTab: 'bg-indigo-400 text-white shadow-[0_8px_16px_rgba(129,140,248,0.2)]',
    inactiveTab: 'text-slate-500 hover:bg-indigo-50',
    headerBg: 'bg-slate-50/80',
    primaryGradient: 'from-rose-400 via-purple-400 to-blue-400',
    gradientText: 'from-rose-400 via-amber-400 to-indigo-400',
    borderFocus: 'focus:border-indigo-400 focus:ring-indigo-100',
    tableHead: 'bg-slate-800 text-slate-300',
    divide: 'divide-indigo-50/50',
    selectionColor: 'selection:bg-indigo-100',
    darkCardBg: 'bg-slate-900',
    accentDark: 'text-indigo-300',
    hexBg: '#f8fafc',
    chartColors: ["rose-400", "orange-400", "amber-400", "emerald-400", "cyan-400", "blue-400", "indigo-400", "fuchsia-400"],
    chartHex: ["#fb7185", "#fb923c", "#fbbf24", "#34d399", "#22d3ee", "#60a5fa", "#818cf8", "#e879f9"]
  },
  vintage: { // 🕰️ TEMA BARU: VINTAGE / RETRO WARMTH
    id: 'vintage',
    bg: 'bg-stone-100',
    cardBg: 'bg-stone-50',
    bgSoft: 'bg-stone-200/50',
    textMain: 'text-stone-800',
    textSub: 'text-stone-500',
    border: 'border-stone-200',
    primary: 'bg-amber-700',
    primaryHover: 'hover:bg-amber-800',
    primaryText: 'text-amber-800',
    primaryLight: 'bg-amber-100',
    primaryBorder: 'border-amber-700',
    chartMain: 'amber',
    activeTab: 'bg-amber-700 text-amber-50 shadow-[0_8px_16px_rgba(180,83,9,0.15)]',
    inactiveTab: 'text-stone-500 hover:bg-stone-200/50',
    headerBg: 'bg-stone-100/80',
    primaryGradient: 'from-amber-700 to-orange-900',
    gradientText: 'from-amber-700 to-orange-600',
    borderFocus: 'focus:border-amber-700 focus:ring-amber-200',
    tableHead: 'bg-stone-800 text-stone-300',
    divide: 'divide-stone-200',
    selectionColor: 'selection:bg-amber-200',
    darkCardBg: 'bg-stone-800',
    accentDark: 'text-amber-400',
    hexBg: '#f5f5f4',
    chartColors: ["amber-800", "orange-700", "stone-600", "yellow-600", "red-800", "amber-600", "stone-500", "orange-800"],
    chartHex: ["#92400e", "#c2410c", "#57534e", "#ca8a04", "#991b1b", "#d97706", "#78716c", "#9a3412"]
  },
  modern: { // 🕶️ TEMA BARU: MODERN MONOCHROME
    id: 'modern',
    bg: 'bg-zinc-50',
    cardBg: 'bg-white',
    bgSoft: 'bg-zinc-100',
    textMain: 'text-zinc-950',
    textSub: 'text-zinc-500',
    border: 'border-zinc-200',
    primary: 'bg-zinc-900',
    primaryHover: 'hover:bg-zinc-800',
    primaryText: 'text-zinc-900',
    primaryLight: 'bg-zinc-100',
    primaryBorder: 'border-zinc-900',
    chartMain: 'zinc',
    activeTab: 'bg-zinc-900 text-white shadow-[0_8px_16px_rgba(24,24,27,0.15)]',
    inactiveTab: 'text-zinc-500 hover:bg-zinc-100',
    headerBg: 'bg-zinc-50/80',
    primaryGradient: 'from-zinc-800 to-zinc-950',
    gradientText: 'from-zinc-700 to-zinc-900',
    borderFocus: 'focus:border-zinc-900 focus:ring-zinc-200',
    tableHead: 'bg-zinc-900 text-zinc-300',
    divide: 'divide-zinc-100',
    selectionColor: 'selection:bg-zinc-200',
    darkCardBg: 'bg-zinc-900',
    accentDark: 'text-zinc-300',
    hexBg: '#fafafa',
    chartColors: ["zinc-900", "zinc-700", "zinc-500", "zinc-400", "zinc-800", "zinc-600", "slate-900", "neutral-800"],
    chartHex: ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#27272a", "#52525b", "#0f172a", "#262626"]
  }
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('budgetin_theme') || 'emerald');
  const t = THEMES[currentTheme] || THEMES['emerald']; // Fallback aman

  const [activeTab, setActiveTab] = useState(localStorage.getItem('budgetin_last_tab') || 'overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSyncingGAS, setIsSyncingGAS] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showLanding, setShowLanding] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth());
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [isBarChart, setIsBarChart] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteGoalData, setDeleteGoalData] = useState<any | null>(null);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(5000000);
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  const toggleTheme = () => {
    const themeKeys = Object.keys(THEMES);
    const nextTheme = themeKeys[(themeKeys.indexOf(currentTheme) + 1) % themeKeys.length];
    setCurrentTheme(nextTheme);
    localStorage.setItem('budgetin_theme', nextTheme);
  };

  const processIncomingData = (rawList: any[]) => {
    return rawList.map((item) => {
      const d = new Date(item.date);
      return {
        ...item,
        desc: item.description || item.desc || "Transaksi",
        dateObj: d,
        dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear()
      };
    });
  };

  const fetchData = async (idFromUrl: string) => {
    setLoading(true);
    try {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', String(idFromUrl));
      if (data) {
        const supaData = processIncomingData(data).map(item => ({ ...item, source: 'supabase' }));
        supaData.sort((a, b) => b.dateObj - a.dateObj || b.id - a.id);
        setTransactions(supaData);
      }
      setError(null);
    } catch (e) { 
      console.warn("Supabase fetch failed", e); 
      setError("Gagal memuat data utama.");
    } finally {
      setLoading(false); 
    }

    setIsSyncingGAS(true);
    try {
      const res = await fetch(`${GAS_API_URL}?userid=${idFromUrl}`);
      const json = await res.json();
      if (json.status === 'success') {
        const sheetData = processIncomingData(json.data).map(item => ({ ...item, source: 'sheet' }));
        setTransactions(prev => {
          const combined = [...prev, ...sheetData];
          const uniqueTransactions = combined.filter((item, index, self) =>
            index === self.findIndex((tx) => (
              tx.dateKey === item.dateKey && tx.amount === item.amount && tx.desc?.toLowerCase() === item.desc?.toLowerCase()
            ))
          );
          return uniqueTransactions.sort((a, b) => b.dateObj - a.dateObj || b.id - a.id);
        });
      }
    } catch (e) { 
      console.warn("Sheets fetch failed", e); 
    } finally {
      setIsSyncingGAS(false);
    }
  };

  const fetchGoals = async (idFromUrl: string) => {
    try {
      const { data } = await supabase.from('goals').select('*').eq('user_id', String(idFromUrl)).order('created_at', { ascending: false });
      if (data) setGoals(data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (isDemo) { setTransactions(prev => prev.filter(tx => tx.id !== deleteId)); setDeleteId(null); return; }
    if (!deleteId || !userId) return;
    setIsDeleting(true);
   
    try {
      const trxToDelete = transactions.find(tx => tx.id === deleteId);
      if (trxToDelete) {
        if (trxToDelete.source === 'sheet') {
          await fetch(`${GAS_API_URL}?userid=${userId}&action=delete&row=${trxToDelete.id}`);
          await supabase.from('transactions').delete().eq('user_id', String(userId)).eq('amount', trxToDelete.amount).ilike('description', trxToDelete.desc);
        } else {
          await supabase.from('transactions').delete().eq('id', deleteId).eq('user_id', String(userId));
        }

        if (trxToDelete.desc?.toLowerCase().startsWith('nabung goals:') || trxToDelete.desc?.toLowerCase().startsWith('nabung:')) {
          const goalName = trxToDelete.desc.replace(/Nabung Goals:|Nabung:/ig, '').trim();
          const goalToUpdate = goals.find(g => g.goal_name.toLowerCase() === goalName.toLowerCase());
          if (goalToUpdate) {
            const newAmount = Math.max(0, Number(goalToUpdate.current_amount) - Number(trxToDelete.amount));
            await supabase.from('goals').update({ current_amount: newAmount }).eq('id', goalToUpdate.id);
          }
        }
      }
      setDeleteId(null);
      fetchData(userId);
      fetchGoals(userId);
    } catch (err) { console.error(err); } finally { setIsDeleting(false); }
  };

  const executeDeleteGoal = async (actionType: string) => {
    if (!deleteGoalData || !userId) return;
    setIsDeletingGoal(true);
    try {
      const { error: goalError } = await supabase.from('goals').delete().eq('id', deleteGoalData.id).eq('user_id', String(userId));
      if (goalError) throw goalError;

      if (actionType === 'refund' && deleteGoalData.current_amount > 0) {
        const { error: txError } = await supabase.from('transactions').insert([{
          user_id: String(userId),
          date: new Date().toISOString(),
          description: `Refund Tabungan: ${deleteGoalData.goal_name}`,
          amount: deleteGoalData.current_amount,
          type: 'MASUK',
          category: 'MASUK',
          status: 'Selesai'
        }]);
        if (txError) throw txError;
      }
      setDeleteGoalData(null);
      fetchGoals(userId);
      if (actionType === 'refund') fetchData(userId);
    } catch (err) { alert("Gagal memproses penghapusan."); } finally { setIsDeletingGoal(false); }
  };

  useEffect(() => {
    const idFromUrl = new URLSearchParams(window.location.search).get('userid');
    if (!idFromUrl) {
      setShowLanding(true); setLoading(false); return;
    }
    setUserId(idFromUrl);
    fetchData(idFromUrl);
    fetchGoals(idFromUrl);
    const savedBudget = localStorage.getItem(`budgetin_budget_${idFromUrl}`);
    if (savedBudget) setMonthlyBudget(parseInt(savedBudget));
  }, []);

  useEffect(() => { localStorage.setItem('budgetin_last_tab', activeTab); }, [activeTab]);

  const startDemo = () => {
    setShowLanding(false); setIsDemo(true); setTransactions(processIncomingData(DUMMY_DATA)); setLoading(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const stats = useMemo(() => {
    const income = transactions.filter(tx => tx.type?.toUpperCase() === 'MASUK').reduce((a, b) => a + Number(b.amount), 0);
    const expense = transactions.filter(tx => tx.type?.toUpperCase() === 'KELUAR').reduce((a, b) => a + Number(b.amount), 0);
    const charity = transactions.filter(tx => tx.category?.toUpperCase() === 'SEDEKAH/ZAKAT').reduce((a, b) => a + Number(b.amount), 0);
    const currentRatio = expense > 0 ? charity / expense : 0;
    let score = 40;
    if (currentRatio >= 0.025) score = 100;
    else if (currentRatio > 0) score = 40 + (currentRatio / 0.025) * 60;
    return { balance: income - expense, income, expense, barakahScore: Math.round(score) };
  }, [transactions]);

  const filteredByMonth = useMemo(() => transactions.filter(tx => tx.month === viewDate.getMonth() && tx.year === viewDate.getFullYear()), [transactions, viewDate]);
  const totalKeluarBulanTerpilih = useMemo(() => filteredByMonth.filter(tx => tx.type?.toUpperCase() === 'KELUAR').reduce((a, b) => a + Number(b.amount), 0), [filteredByMonth]);

  const chartData = useMemo(() => {
    const data = [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const amt = transactions.filter(tx => tx.type?.toUpperCase() === 'KELUAR' && tx.dateKey === key).reduce((s, tx) => s + Number(tx.amount), 0);
      data.push({ date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), "Pengeluaran": amt });
    }
    return data;
  }, [transactions, viewDate]);

  const categoryData = useMemo(() => {
    const cats: any = {};
    filteredByMonth.filter(tx => tx.type?.toUpperCase() === 'KELUAR').forEach(tx => {
      cats[tx.category] = (cats[tx.category] || 0) + Number(tx.amount);
    });
    return Object.keys(cats).map(name => ({ name, amount: cats[name] })).sort((a,b) => b.amount - a.amount);
  }, [filteredByMonth]);

  const leakageInfo = useMemo(() => {
    const counts: any = filteredByMonth.filter(tx => tx.type === 'KELUAR').reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1; return acc;
    }, {});
    const mostFreq = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return { name: mostFreq || "N/A", count: counts[mostFreq] || 0 };
  }, [filteredByMonth]);

  const emasHarga = 1350000;
  const nishabTahunan = 85 * emasHarga;
  const wajibZakat = stats.balance >= nishabTahunan;

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  const axisFormatter = (num: number) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(num);

  const activeGoal = goals.find(g => g.is_active) || goals[0];

  const handleSaveBudget = (val: string) => {
    let newVal = parseInt(val);
    if (isNaN(newVal) || newVal < 0) newVal = 0;
    setMonthlyBudget(newVal);
    if (userId) localStorage.setItem(`budgetin_budget_${userId}`, String(newVal));
    setIsSettingBudget(false);
  };

  const handleExportCSV = () => {
    const dataToExport = transactions.filter(tx => tx.month === exportMonth && tx.year === exportYear);
    if (dataToExport.length === 0) { alert("Tidak ada data transaksi untuk diekspor pada bulan dan tahun ini."); return; }
    
    const headers = ["Tanggal", "Keterangan", "Kategori", "Tipe", "Nominal (Rp)"];
    const csvRows = dataToExport.map(tx => {
      const safeDesc = tx.desc ? `"${tx.desc.replace(/"/g, '""')}"` : '""';
      return `${tx.dateStr},${safeDesc},${tx.category},${tx.type},${tx.amount}`;
    });
    
    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a"); link.href = url;
    link.download = `Laporan_Keuangan_UangKu_${new Date(exportYear, exportMonth).toLocaleDateString('id-ID', { month: 'long' })}_${exportYear}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setIsExportModalOpen(false); 
  };

  const advisorInsight = useMemo(() => {
    const budgetUsedPercent = monthlyBudget > 0 ? (totalKeluarBulanTerpilih / monthlyBudget) * 100 : 0;
    const topCategory = categoryData.length > 0 ? categoryData[0] : null;
    const charity = filteredByMonth.filter(tx => tx.category?.toUpperCase() === 'SEDEKAH/ZAKAT').reduce((a, b) => a + Number(b.amount), 0);

    const styles = {
      rose: { bg: "bg-rose-500/10 border-rose-500/20", iconBg: "bg-rose-500/20", textMain: "text-rose-500", textSub: "text-rose-400", border: "border-rose-500/20" },
      amber: { bg: "bg-amber-500/10 border-amber-500/20", iconBg: "bg-amber-500/20", textMain: "text-amber-500", textSub: "text-amber-400", border: "border-amber-500/20" },
      orange: { bg: "bg-orange-500/10 border-orange-500/20", iconBg: "bg-orange-500/20", textMain: "text-orange-500", textSub: "text-orange-400", border: "border-orange-500/20" },
      violet: { bg: "bg-violet-500/10 border-violet-500/20", iconBg: "bg-violet-500/20", textMain: "text-violet-500", textSub: "text-violet-400", border: "border-violet-500/20" },
      emerald: { bg: "bg-emerald-500/10 border-emerald-500/20", iconBg: "bg-emerald-500/20", textMain: "text-emerald-500", textSub: "text-emerald-400", border: "border-emerald-500/20" },
    };

    if (budgetUsedPercent > 85) return { title: "🚨 DARURAT!", message: `WOY! Budget bulanan lu udah kepake ${Math.round(budgetUsedPercent)}%! Puasa jajan di luar sekarang juga!`, theme: styles.rose };
    if (totalKeluarBulanTerpilih > 1000000 && charity === 0) return { title: "🔥 PELIT AMAT!", message: `Duit lu abis ${formatRp(totalKeluarBulanTerpilih)} bulan ini tapi sedekah NOL BESAR! Buruan sedekah biar berkah!`, theme: styles.amber };
    if (topCategory && topCategory.amount > (monthlyBudget * 0.4)) return { title: "🤬 KEBOCORAN DANA!", message: `Buset dah! Duit lu ludes ${formatRp(topCategory.amount)} cuma buat ${topCategory.name} doang?! Kurangin woy!`, theme: styles.orange };
    if (activeGoal && activeGoal.current_amount === 0) return { title: "🤡 HALUSINASI!", message: `Gaya-gayaan target beli ${activeGoal.goal_name}, tapi celengan masih KOSONG! Nabung!`, theme: styles.violet };
    return { title: "👀 GW PANTAU LU!", message: `Tumben dompet lu aman bulan ini. Tapi awas aja kalau besok lu foya-foya lagi, gw omelin lu!`, theme: styles.emerald };
  }, [totalKeluarBulanTerpilih, monthlyBudget, categoryData, filteredByMonth, activeGoal]);

  if (showLanding) {
    return (
      <div className={`min-h-screen font-sans flex flex-col transition-colors duration-500 ${t.bg} ${t.textMain} ${t.selectionColor}`}>
        <nav className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10">
          <div className="flex items-center gap-3">
            <div className={`${t.primary} p-2.5 rounded-xl shadow-lg`}><Activity className="text-white w-5 h-5"/></div>
            <span className="font-black tracking-tighter text-2xl uppercase">UangKu<span className={t.primaryText}>Pro</span></span>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={toggleTheme} className={`p-2.5 ${t.cardBg} hover:${t.bgSoft} rounded-xl shadow-sm border ${t.border} ${t.textSub} transition-all`} title="Ganti Tema Mode"><Palette size={16} strokeWidth={2.5}/></button>
            <button onClick={() => window.open('https://lynk.id/rizkiakbarma', '_blank')} className={`px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md`}>Beli Akses</button>
          </div>
        </nav>
        
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto relative z-10">
          <Badge className={`mb-8 px-4 py-1.5 font-bold tracking-[0.2em] uppercase text-[10px] animate-pulse border ${t.primaryLight} ${t.primaryText} ${t.border}`}>✨ Tersedia Versi 29.4 (Theme Engine Stable)</Badge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
            Catat Keuangan <br className="hidden md:block"/>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${t.gradientText}`}>Semudah Kirim Chat.</span>
          </h1>
          
          <p className={`${t.textSub} text-base md:text-xl mb-12 max-w-2xl font-medium leading-relaxed`}>
            Tinggalkan cara lama mencatat di Excel yang bikin malas. Kirim pengeluaranmu ke Bot Telegram UangKu, dan biarkan sistem menyusunnya ke dalam Dashboard Finansial kelas Enterprise secara otomatis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button onClick={() => window.open('https://lynk.id/rizkiakbarma', '_blank')} className={`px-8 py-4 ${t.primary} ${t.primaryHover} text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group`}>
              Dapatkan Akses Sekarang <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
            </button>
            <button onClick={startDemo} className={`px-8 py-4 ${t.cardBg} hover:${t.bgSoft} ${t.textMain} rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm border ${t.border} flex items-center justify-center gap-2`}>
              Lihat Demo Dashboard
            </button>
          </div>
        </main>

        <section className={`${t.cardBg} py-24 border-t ${t.border} relative z-10 transition-colors duration-500`}>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className={`text-center md:text-left ${t.bgSoft} p-8 rounded-[2rem] border ${t.border} transition-all hover:shadow-lg`}>
              <div className={`w-14 h-14 ${t.primaryLight} ${t.primaryText} rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0`}><MessageSquare strokeWidth={2.5} /></div>
              <h3 className={`font-black text-xl mb-3 tracking-tight ${t.textMain}`}>Telegram Bot NLP</h3>
              <p className={`${t.textSub} text-sm font-medium leading-relaxed`}>Cukup ketik "Makan siang 25rb", sistem kecerdasan buatan (NLP) kami otomatis mendeteksi nominal dan mengklasifikasikan kategori transaksi tanpa format ribet.</p>
            </div>
            <div className={`text-center md:text-left ${t.bgSoft} p-8 rounded-[2rem] border ${t.border} transition-all hover:shadow-lg`}>
              <div className={`w-14 h-14 ${t.primaryLight} ${t.primaryText} rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0`}><Activity strokeWidth={2.5} /></div>
              <h3 className={`font-black text-xl mb-3 tracking-tight ${t.textMain}`}>Live Sync Dashboard</h3>
              <p className={`${t.textSub} text-sm font-medium leading-relaxed`}>Dilengkapi dengan visualisasi grafik mewah, sistem target tabungan virtual, dan AI Neural Advisor yang siap me-roasting gaya pengeluaranmu.</p>
            </div>
            <div className={`text-center md:text-left ${t.bgSoft} p-8 rounded-[2rem] border ${t.border} transition-all hover:shadow-lg`}>
              <div className={`w-14 h-14 ${t.primaryLight} ${t.primaryText} rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0`}><Calculator strokeWidth={2.5} /></div>
              <h3 className={`font-black text-xl mb-3 tracking-tight ${t.textMain}`}>Sharia Integrated</h3>
              <p className={`${t.textSub} text-sm font-medium leading-relaxed`}>Satu-satunya tracker di Indonesia dengan Barakah Score dan kalkulator Zakat Maal otomatis berdasarkan harga emas real-time. Hartamu jadi lebih berkah.</p>
            </div>
          </div>
        </section>

        <footer className={`${t.darkCardBg} py-10 text-center relative z-10 transition-colors duration-500`}>
          <p className={`${t.accentDark} font-bold uppercase tracking-widest text-[10px]`}>Made with ❤️ by Rizkiakbarma. © 2026 UangKu Pro.</p>
        </footer>
      </div>
    );
  }

  if (loading) return (
    <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center text-center p-10`}>
      <Loader2 className={`animate-spin ${t.primaryText} w-12 h-12 mb-6`} />
      <Text className={`font-bold tracking-widest ${t.textSub} uppercase text-[10px]`}>Mempersiapkan Dashboard...</Text>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group ${activeTab === id ? t.activeTab : t.inactiveTab}`}
    >
      <div className="shrink-0"><Icon size={20} strokeWidth={2.5} /></div>
      <span className="text-[13px] whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-500 ${t.bg} ${t.textMain} ${t.selectionColor}`}>
     
      {isMobileSidebarOpen && (
        <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in" />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] border-r flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none lg:relative w-64 ${t.cardBg} ${t.border} ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-5 overflow-hidden">
          <div className="flex items-center gap-4 mb-8 pl-2">
            <div className={`w-10 h-10 ${t.primary} rounded-xl flex items-center justify-center shadow-md shrink-0`}><Activity className="text-white" size={20} strokeWidth={3} /></div>
            <div>
               <h1 className={`text-lg font-black tracking-tighter leading-none uppercase ${t.textMain}`}>BudgetIN</h1>
               <Badge className={`mt-1 text-[8px] font-black uppercase px-2 py-0 border ${t.primaryLight} ${t.primaryText} ${t.border}`}>Versi Pro</Badge>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem id="overview" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="ledger" label="Riwayat Mutasi" icon={History} />
            <NavItem id="goals" label="Target Goals" icon={Target} />
            <NavItem id="zakat" label="Kalkulator Zakat" icon={Calculator} />
            <div className={`h-[1px] ${t.bgSoft} my-4 mx-2`}></div>
          </nav>
          <div className={`pt-6 border-t ${t.border}`}>
            <button className={`w-full flex items-center justify-start gap-4 px-4 py-3 ${t.textSub} hover:text-rose-500 font-bold text-[13px] transition-colors`}><LogOut size={18} strokeWidth={2.5}/> Keluar</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto relative custom-scrollbar flex flex-col">
       
        {deleteId && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
               <Card className={`max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 ${t.cardBg}`}>
                  <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className={`text-lg font-bold text-center mb-8 tracking-tight uppercase ${t.textMain}`}>Hapus transaksi?</h3>
                  <div className="flex gap-4">
                    <button onClick={() => setDeleteId(null)} className={`flex-1 py-3 ${t.bgSoft} ${t.textSub} hover:opacity-80 rounded-xl font-bold text-[10px] uppercase transition-all`}>Batal</button>
                    <button onClick={handleDelete} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-xl shadow-rose-200 transition-all">
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Ya, Hapus"}
                    </button>
                  </div>
               </Card>
            </div>
        )}

        {deleteGoalData && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
             <Card className={`max-w-md w-full p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 ${t.cardBg}`}>
                <Target className={`w-12 h-12 ${t.textMain} mx-auto mb-4`} strokeWidth={2}/>
                <h3 className={`text-xl font-black text-center mb-2 tracking-tight ${t.textMain}`}>HAPUS: {deleteGoalData.goal_name}</h3>
                <Text className={`text-center text-xs mb-8 leading-relaxed px-4 ${t.textSub}`}>
                  Saat ini ada dana <strong className={t.primaryText}>{formatRp(deleteGoalData.current_amount)}</strong> yang terkumpul. Mau diapain nih uangnya?
                </Text>
               
                <div className="flex flex-col gap-4">
                  <button onClick={() => executeDeleteGoal('refund')} disabled={isDeletingGoal} className={`w-full py-4 ${t.primaryLight} hover:opacity-80 ${t.primaryText} rounded-2xl font-bold text-xs uppercase transition-all flex flex-col items-center justify-center gap-1 border ${t.border} shadow-sm`}>
                    <span>↩️ Batal & Refund Saldo</span>
                    <span className="text-[9px] font-medium normal-case">Uang kembali ke Saldo Utama</span>
                  </button>
                  <button onClick={() => executeDeleteGoal('delete_only')} disabled={isDeletingGoal} className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl font-bold text-xs uppercase transition-all flex flex-col items-center justify-center gap-1 border border-rose-200/60 shadow-sm">
                    <span>💸 Hapus Saja (Hangus)</span>
                    <span className="text-[9px] font-medium normal-case text-rose-500">Target selesai / uang sudah kepakai</span>
                  </button>
                  <button onClick={() => setDeleteGoalData(null)} disabled={isDeletingGoal} className={`w-full py-3 mt-2 ${t.textSub} hover:${t.bgSoft} hover:${t.textMain} rounded-xl font-bold text-[10px] uppercase transition-all`}>Batal Kembali</button>
                </div>
             </Card>
          </div>
        )}

        {isExportModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
             <Card className={`max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 ${t.cardBg}`}>
                <div className={`w-16 h-16 ${t.primaryLight} ${t.primaryText} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                  <Download className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <h3 className={`text-xl font-black text-center mb-2 tracking-tight ${t.textMain}`}>Unduh Laporan</h3>
                <p className={`text-sm text-center mb-8 font-medium leading-relaxed ${t.textSub}`}>Pilih periode bulan laporan (CSV/Excel) yang akan diunduh.</p>

                <div className="flex gap-4 mb-8">
                  <select value={exportMonth} onChange={(e) => setExportMonth(parseInt(e.target.value))} className={`flex-1 p-3.5 ${t.bgSoft} border ${t.border} rounded-xl text-sm font-bold ${t.textMain} outline-none ${t.borderFocus} cursor-pointer`}>
                    {Array.from({length: 12}).map((_, i) => (<option key={i} value={i}>{new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}</option>))}
                  </select>
                  <select value={exportYear} onChange={(e) => setExportYear(parseInt(e.target.value))} className={`w-28 p-3.5 ${t.bgSoft} border ${t.border} rounded-xl text-sm font-bold ${t.textMain} outline-none ${t.borderFocus} cursor-pointer`}>
                    {[viewDate.getFullYear() - 1, viewDate.getFullYear(), viewDate.getFullYear() + 1].map(y => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setIsExportModalOpen(false)} className={`flex-1 py-4 ${t.bgSoft} hover:opacity-80 ${t.textSub} rounded-xl font-bold text-[11px] uppercase tracking-widest transition-colors`}>Batal</button>
                  <button onClick={handleExportCSV} className={`flex-1 py-4 ${t.primary} ${t.primaryHover} text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-xl transition-colors`}>Mulai Unduh</button>
                </div>
             </Card>
          </div>
        )}

        <header className={`sticky top-0 z-50 backdrop-blur-xl px-5 lg:px-8 py-3 flex justify-between items-center border-b shrink-0 transition-colors duration-500 ${t.headerBg} ${t.border}`}>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg border ${t.border} ${t.textSub} ${t.cardBg}`}><Menu size={20}/></button>
             <Flex className="gap-2">
                <Badge className={`hidden sm:flex px-2.5 py-0.5 font-bold text-[8px] uppercase tracking-widest rounded-full border animate-pulse ${t.primaryLight} ${t.primaryText} ${t.border}`}>Live Sync Active</Badge>
                {isSyncingGAS && <Badge className={`hidden sm:flex px-2.5 py-0.5 font-bold text-[8px] uppercase tracking-widest rounded-full border animate-pulse bg-amber-50 text-amber-600 border-amber-100`}><Loader2 size={10} className="inline mr-1 animate-spin"/> Sync Legacy Data</Badge>}
             </Flex>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && <Badge color="amber" icon={Sparkles} className="font-bold px-2.5 py-0.5 rounded-full text-[8px]">Mode Demo</Badge>}
            <button onClick={toggleTheme} className={`p-2 ${t.cardBg} hover:${t.bgSoft} rounded-xl shadow-sm ring-1 ${t.border} ${t.textSub} active:scale-90 transition-all`} title="Ganti Tema Visual"><Palette size={16} strokeWidth={2.5}/></button>
            <button onClick={() => { userId && fetchData(userId); fetchGoals(userId); }} className={`p-2 ${t.cardBg} hover:${t.bgSoft} rounded-xl shadow-sm ring-1 ${t.border} ${t.textSub} active:scale-90 transition-all`}><RefreshCcw size={16} strokeWidth={2.5} className={isSyncingGAS ? "animate-spin" : ""}/></button>
            <div className={`w-9 h-9 ${t.primary} text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-md`}>RA</div>
          </div>
        </header>

        <div className="flex-1 p-5 lg:p-7 max-w-8xl mx-auto w-full">
           
            {/* TAB: DASHBOARD */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
               
                <div className={`relative p-6 lg:p-8 rounded-[2.5rem] border shadow-md overflow-hidden flex items-center gap-5 transition-all ${t.darkCardBg} ${advisorInsight.theme.border}`}>
                  <div className={`absolute -right-6 -top-10 opacity-5 pointer-events-none`}>
                    <Bot size={180} className={advisorInsight.theme.textMain} />
                  </div>
                  <div className={`p-4 rounded-2xl shrink-0 ${advisorInsight.theme.iconBg} border border-white/5`}>
                    <Bot size={32} className={advisorInsight.theme.textMain} />
                  </div>
                  <div className="relative z-10 flex-1">
                    <Text className={`text-[10px] font-black uppercase tracking-[0.3em] ${advisorInsight.theme.textSub} mb-1 flex items-center gap-2`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span> {advisorInsight.title}
                    </Text>
                    <Text className="text-white text-sm md:text-base font-semibold leading-relaxed opacity-95 lg:pr-20">
                      {advisorInsight.message}
                    </Text>
                  </div>
                </div>

                <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 lg:p-8 rounded-[2.5rem] shadow-lg border-t ring-1 transition-colors duration-500 border-white/5 ${t.cardBg} ${t.border}`}>
                  <div>
                    <Text className={`font-bold uppercase tracking-[0.3em] text-[9px] mb-2 flex items-center gap-2 ${t.textSub}`}><div className={`w-2 h-2 ${t.primary} rounded-full animate-ping`}></div> Total saldo aktif</Text>
                    <h2 className={`text-4xl lg:text-5xl font-black tracking-tighter drop-shadow-md ${t.textMain}`}>{formatRp(stats.balance)}</h2>
                  </div>
                  <div className={`flex items-center p-1.5 rounded-2xl border transition-colors ${t.bgSoft} ${t.border}`}>
                    <button onClick={() => changeMonth(-1)} className={`p-2 hover:${t.cardBg} hover:shadow-sm rounded-xl transition-all ${t.textSub}`}><ChevronLeft size={18} strokeWidth={3}/></button>
                    <div className="px-5 text-center min-w-[120px]">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${t.textMain}`}>{viewDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => changeMonth(1)} className={`p-2 hover:${t.cardBg} hover:shadow-sm rounded-xl transition-all ${t.textSub}`}><ChevronRight size={18} strokeWidth={3}/></button>
                    <div className={`w-[1px] h-6 ${t.border} mx-1 border-r`}></div>
                    <button onClick={() => { setExportMonth(viewDate.getMonth()); setExportYear(viewDate.getFullYear()); setIsExportModalOpen(true); }} className={`p-2 px-4 flex items-center gap-2 ${t.primaryLight} hover:opacity-80 ${t.primaryText} rounded-xl transition-all shadow-sm`} title="Unduh Laporan">
                        <Download size={16} strokeWidth={2.5}/>
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Unduh Report</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className={`rounded-[2rem] border-none shadow-sm p-6 lg:p-8 ring-1 hover:translate-y-[-3px] transition-all duration-500 ${t.cardBg} ${t.border}`}>
                    <Flex alignItems="center">
                      <div><Text className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-3 ${t.textSub}`}>Pemasukan</Text><Metric className={`font-black text-3xl tracking-tighter ${t.primaryText}`}>{formatRp(stats.income)}</Metric></div>
                      <div className={`p-4 text-white rounded-2xl shadow-lg transform hover:rotate-6 transition-transform ${t.primary}`}><ArrowUpRight size={24} strokeWidth={3} /></div>
                    </Flex>
                  </Card>
                  <Card className={`rounded-[2rem] border-none shadow-sm p-6 lg:p-8 ring-1 hover:translate-y-[-3px] transition-all duration-500 ${t.cardBg} ${t.border}`}>
                    <Flex alignItems="center">
                      <div><Text className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-3 ${t.textSub}`}>Pengeluaran</Text><Metric className="text-rose-600 font-black text-3xl tracking-tighter">{formatRp(stats.expense)}</Metric></div>
                      <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-100 transform hover:-rotate-6 transition-transform"><ArrowDownRight size={24} strokeWidth={3} /></div>
                    </Flex>
                  </Card>
                </div>

                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 min-w-0 space-y-6">
                    <Card className={`rounded-[2.5rem] border-none shadow-xl p-6 lg:p-8 ring-1 transition-colors duration-500 overflow-hidden ${t.cardBg} ${t.border}`}>
                      <Flex className="mb-2 items-start justify-between">
                          <div><Title className={`font-bold border-l-4 pl-3 text-[11px] tracking-widest leading-none uppercase ${t.textMain} ${t.primaryBorder}`}>Tren harian</Title></div>
                          <div className={`flex p-1 rounded-xl ring-1 shrink-0 ${t.bgSoft} ${t.border}`}>
                              <button onClick={() => setIsBarChart(true)} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-colors ${isBarChart ? `${t.cardBg} ${t.primaryText} shadow-sm` : t.textSub}`}>Batang</button>
                              <button onClick={() => setIsBarChart(false)} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-colors ${!isBarChart ? `${t.cardBg} ${t.primaryText} shadow-sm` : t.textSub}`}>Garis</button>
                          </div>
                      </Flex>
                      <div className="w-full overflow-x-auto custom-scrollbar pb-4 mt-4">
                          <div className="h-56 min-w-[900px] pr-4">
                              {isBarChart ? (
                                <BarChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={[t.chartMain]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={65} showGridLines={false} />
                              ) : (
                                <AreaChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={[t.chartMain]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={65} curveType="monotone" showGridLines={false} />
                              )}
                          </div>
                      </div>
                    </Card>

                    <Card className={`rounded-[2.5rem] border-none shadow-lg ring-1 p-8 flex flex-col hover:shadow-xl transition-all duration-500 ${t.cardBg} ${t.border}`}>
                      <Title className={`font-bold border-l-4 pl-3 text-[10px] uppercase tracking-[0.3em] mb-8 leading-none ${t.textMain} ${t.primaryBorder}`}>Alokasi dana</Title>
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                          <DonutChart className="h-52 w-full" data={categoryData} category="amount" index="name" valueFormatter={axisFormatter} colors={t.chartColors} showAnimation={true} />
                        </div>
                        <div className="w-full md:w-1/2 space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                          {categoryData.length > 0 ? categoryData.map((c: any, i: number) => (
                            <Flex key={c.name} className={`border-b pb-3 last:border-0 last:pb-0 ${t.border}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: t.chartHex[i % t.chartHex.length] }}></div>
                                <Text className={`text-[11px] font-bold uppercase tracking-widest truncate max-w-[140px] ${t.textSub}`}>{c.name}</Text>
                              </div>
                              <Text className={`font-black text-xs tracking-tighter ${t.textMain}`}>{formatRp(c.amount)}</Text>
                            </Flex>
                          )) : <Text className={`text-center text-xs font-medium italic ${t.textSub}`}>Belum ada pengeluaran bulan ini.</Text>}
                        </div>
                      </div>
                    </Card>
                  </div>

                  <aside className="w-full xl:w-96 shrink-0 space-y-6">
                    <Card className={`rounded-[2.5rem] border-none shadow-xl p-8 ring-1 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 ${t.cardBg} ${t.border}`}>
                      <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000"><HeartHandshake size={140} className={t.textMain} /></div>
                      <Title className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-8 border-l-4 pl-3 leading-none ${t.textMain} ${t.primaryBorder}`}>Barakah Score</Title>
                      
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6 flex items-center justify-center">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className={t.bgSoft} />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (stats.barakahScore / 100) * 364.4} className={`transition-all duration-1000 ease-out ${stats.barakahScore > 75 ? 'text-emerald-500' : stats.barakahScore > 45 ? 'text-amber-500' : 'text-rose-500'}`} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-black leading-none ${t.textMain}`}>{stats.barakahScore}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${t.textSub}`}>Point</span>
                          </div>
                        </div>
                        <Badge color={stats.barakahScore > 75 ? "emerald" : stats.barakahScore > 45 ? "amber" : "rose"} variant="solid" className="font-black rounded-lg text-[9px] uppercase px-4 py-1 mb-4 shadow-sm">
                          {stats.barakahScore > 75 ? "Maa Syaa Allah" : stats.barakahScore > 45 ? "Waspada Israf" : "Perlu Muhasabah"}
                        </Badge>
                        <Text className={`text-[11px] font-medium italic px-4 leading-relaxed ${t.textSub}`}>
                          {stats.barakahScore > 75 ? `"Arus kasmu sangat berkah! Porsi sedekah mencapai target 2,5%."` : stats.barakahScore > 45 ? `"Ayo tingkatkan porsi berbagi agar hartamu makin tenang."` : `"Muhasabah diri, jangan lupakan hak sesama di setiap rupiah jajanmu."`}
                        </Text>
                      </div>
                    </Card>
                   
                    {activeGoal ? (
                      <Card className={`rounded-[2.5rem] border-none shadow-xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all cursor-pointer ${t.darkCardBg}`} onClick={() => setActiveTab('goals')}>
                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Target size={160} /></div>
                        <Title className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-8 border-l-4 pl-3 leading-none ${t.accentDark} border-current`}>Fokus Target 🎯</Title>
                        <div className="relative z-10">
                          <Flex className="mb-4">
                            <h3 className="text-xl font-black tracking-tight">{activeGoal.goal_name}</h3>
                            <Badge color={t.chartMain} variant="solid" className="rounded-lg text-[9px] font-black uppercase shadow-lg shadow-black/20">
                              {Math.min(Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100), 100)}%
                            </Badge>
                          </Flex>
                          <ProgressBar value={(activeGoal.current_amount / activeGoal.target_amount) * 100} color={t.chartMain} className="h-3 rounded-full mb-6 bg-white/10" />
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <Text className="text-[8px] text-white/50 uppercase font-bold mb-1">Di Celengan</Text>
                                <Text className={`text-xs font-black ${t.accentDark}`}>{formatRp(activeGoal.current_amount)}</Text>
                             </div>
                             <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <Text className="text-[8px] text-white/50 uppercase font-bold mb-1">Target Misi</Text>
                                <Text className="text-xs font-black text-white">{axisFormatter(activeGoal.target_amount)}</Text>
                             </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className={`rounded-[2.5rem] border-none shadow-sm p-8 text-center flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-colors ${t.bgSoft} ${t.border}`} onClick={() => setActiveTab('goals')}>
                         <Target className={`mb-3 ${t.textSub}`} size={32}/>
                         <Text className={`text-[10px] font-bold uppercase ${t.textSub}`}>Belum ada target.</Text>
                         <Text className={`text-[9px] mt-1 italic ${t.textSub}`}>Ketik `/setgoal Laptop 10jt` di Bot!</Text>
                      </Card>
                    )}

                    <Card className={`rounded-[2.5rem] border-none shadow-lg ring-1 p-8 overflow-hidden relative transition-colors duration-500 ${t.cardBg} ${t.border}`}>
                      <Flex className="mb-8 items-center justify-between">
                          <Title className={`text-[10px] font-bold tracking-[0.3em] leading-none uppercase ${t.textMain}`}>Target anggaran</Title>
                          <button onClick={() => setIsSettingBudget(true)} className={`p-2 rounded-xl transition-all shadow-sm ${t.bgSoft} ${t.primaryText} ${t.primaryHover} hover:text-white`}><Settings size={16}/></button>
                      </Flex>
                      <div className="space-y-6">
                        <div>
                          <Flex className="mb-3">
                              <Text className={`font-bold text-[9px] uppercase tracking-widest ${t.textSub}`}>Pemakaian</Text>
                              <Badge color={totalKeluarBulanTerpilih > monthlyBudget ? "rose" : t.chartMain} variant="solid" className="font-bold rounded-lg text-[9px] px-2.5 py-0.5 shadow-sm">
                                {monthlyBudget > 0 ? Math.round((totalKeluarBulanTerpilih / monthlyBudget) * 100) : 0}%
                              </Badge>
                          </Flex>
                          <ProgressBar value={monthlyBudget > 0 ? (totalKeluarBulanTerpilih / monthlyBudget) * 100 : 0} color={totalKeluarBulanTerpilih > monthlyBudget ? "rose" : t.chartMain} className="h-3 rounded-full shadow-inner" />
                        </div>
                        <div className={`p-5 rounded-2xl border shadow-inner ${t.bgSoft} ${t.border}`}>
                          <Text className={`text-[9px] font-bold uppercase tracking-widest mb-3 leading-none ${t.textSub}`}>Limit bulanan</Text>
                          {isSettingBudget ? (
                              <input type="number" defaultValue={monthlyBudget} onBlur={(e) => handleSaveBudget(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleSaveBudget(e.currentTarget.value) }} className={`w-full px-4 py-2 text-lg font-black outline-none border-2 rounded-xl bg-transparent ${t.textMain} ${t.borderFocus}`} autoFocus />
                          ) : (
                              <Metric onClick={() => setIsSettingBudget(true)} className={`text-2xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity ${t.textMain}`}>{formatRp(monthlyBudget)}</Metric>
                          )}
                        </div>
                      </div>
                    </Card>

                  </aside>
                </div>
              </div>
            )}

            {/* TAB GOALS */}
            {activeTab === 'goals' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className={`flex flex-col md:flex-row justify-between items-center gap-4 p-8 lg:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden ${t.darkCardBg}`}>
                  <div className="absolute -right-20 -bottom-20 opacity-10"><Target size={300} /></div>
                  <div className="relative z-10 w-full">
                    <Title className={`font-bold uppercase tracking-[0.3em] text-[10px] mb-3 border-l-4 pl-3 ${t.accentDark} border-current`}>Goal Center</Title>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tighter mb-2">Target Impianmu 🎯</h2>
                    <Text className="text-white/60 text-xs font-medium">Dana di sini tersimpan di kantong terpisah dari saldo utama.</Text>
                  </div>
                </div>

                <Grid numItemsMd={2} className="gap-6">
                  {goals.map(g => (
                    <Card key={g.id} className={`rounded-[2.5rem] border-none shadow-sm p-8 relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 ring-1 ${t.cardBg} ${t.border}`}>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteGoalData(g); }} className={`absolute top-6 right-6 p-2 rounded-xl transition-all hover:bg-rose-50 hover:text-rose-500 ${t.textSub}`}>
                        <Trash2 size={18} strokeWidth={2.5}/>
                      </button>
                      <Flex className="mb-5 items-start pr-10">
                        <div>
                          <Title className={`text-2xl font-black tracking-tight ${t.textMain}`}>{g.goal_name}</Title>
                          <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${t.textSub}`}>Misi: {formatRp(g.target_amount)}</Text>
                        </div>
                        <Badge color={g.current_amount >= g.target_amount ? t.chartMain : "amber"} variant="solid" className="rounded-lg text-[10px] font-black uppercase shadow-sm px-3 py-1">
                          {Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100)}%
                        </Badge>
                      </Flex>
                      <ProgressBar value={(g.current_amount / g.target_amount) * 100} color={g.current_amount >= g.target_amount ? t.chartMain : "amber"} className="h-3.5 rounded-full mb-6 shadow-inner" />
                      <div className={`flex justify-between items-center p-5 rounded-2xl border shadow-inner ${t.bgSoft} ${t.border}`}>
                        <div><Text className={`text-[9px] uppercase font-bold mb-1 ${t.textSub}`}>Celengan Terisi</Text><Text className={`text-base font-black ${t.primaryText}`}>{formatRp(g.current_amount)}</Text></div>
                        <div className="text-right"><Text className={`text-[9px] uppercase font-bold mb-1 ${t.textSub}`}>Kurang</Text><Text className={`text-base font-black ${t.textSub}`}>{formatRp(Math.max(0, g.target_amount - g.current_amount))}</Text></div>
                      </div>
                    </Card>
                  ))}
                  {goals.length === 0 && (
                    <div className={`col-span-2 p-16 text-center rounded-[2.5rem] border-2 border-dashed ${t.bgSoft} ${t.border}`}>
                       <Target size={48} className={`mx-auto mb-4 ${t.textSub}`} />
                       <h3 className={`font-bold mb-2 ${t.textSub}`}>Belum ada target impian.</h3>
                    </div>
                  )}
                </Grid>

                <Card className={`rounded-[2.5rem] border-none shadow-sm ring-1 overflow-hidden p-0 mt-6 ${t.cardBg} ${t.border}`}>
                  <div className={`p-6 lg:p-8 border-b ${t.bgSoft} ${t.border}`}>
                    <Title className={`font-black text-xl tracking-tighter uppercase flex items-center gap-2 ${t.textMain}`}><ArrowDownRight className={t.primaryText}/> Riwayat Isi Celengan</Title>
                  </div>
                  <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className={`sticky top-0 z-10 ${t.tableHead}`}>
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">Waktu</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em]">Deskripsi Tabungan</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-right whitespace-nowrap">Uang Masuk</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divide}`}>
                        {transactions.filter(tx => tx.desc?.toLowerCase().includes('nabung goals:') || tx.desc?.toLowerCase().includes('nabung:') || tx.desc?.toLowerCase().includes('refund tabungan:')).map(tx => (
                          <tr key={tx.id} className={`transition-all group hover:${t.bgSoft}`}>
                            <td className={`px-6 py-4 text-[11px] font-bold uppercase whitespace-nowrap ${t.textSub}`}>{tx.dateStr}</td>
                            <td className="px-6 py-4">
                              <Text className={`font-extrabold text-sm mb-1.5 ${t.textMain}`}>{tx.desc.replace(/Nabung Goals:|Nabung:/ig, 'Suntik Dana:').trim()}</Text>
                              <Badge className={`font-bold text-[8px] uppercase tracking-widest shadow-sm ${tx.desc?.toLowerCase().includes('refund') ? "bg-rose-50 text-rose-600 border-rose-100" : `${t.primaryLight} ${t.primaryText} border-${t.chartMain}-100`}`}>
                                {tx.desc?.toLowerCase().includes('refund') ? "Ditarik" : "Dari Saldo Utama"}
                              </Badge>
                            </td>
                            <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${tx.desc?.toLowerCase().includes('refund') ? 'text-rose-500' : t.primaryText}`}>
                              {tx.desc?.toLowerCase().includes('refund') ? '-' : '+'}{formatRp(tx.amount).replace('Rp', '').trim()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB LEDGER */}
            {activeTab === 'ledger' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                  <Card className={`rounded-[2.5rem] border-none shadow-xl ring-1 overflow-hidden p-0 ${t.cardBg} ${t.border}`}>
                    <div className={`p-6 lg:p-8 border-b flex flex-col md:flex-row justify-between items-center gap-6 ${t.bgSoft} ${t.border}`}>
                      <Title className={`font-black text-2xl tracking-tighter ${t.textMain}`}>Riwayat Mutasi</Title>
                      
                      <div className="flex w-full md:w-auto gap-3 items-center">
                        <div className="relative w-full md:w-[320px]">
                            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${t.textSub}`} size={18}/>
                            <input type="text" placeholder="Cari keterangan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-12 pr-6 py-3.5 border rounded-2xl text-xs font-bold transition-all outline-none shadow-sm bg-transparent ${t.textMain} ${t.border} ${t.borderFocus}`} />
                        </div>
                        <button onClick={() => { setExportMonth(viewDate.getMonth()); setExportYear(viewDate.getFullYear()); setIsExportModalOpen(true); }} className={`shrink-0 p-3.5 px-5 flex items-center gap-2 rounded-2xl transition-all shadow-sm border ${t.primaryLight} hover:opacity-80 ${t.primaryText} ${t.primaryBorder}`} title="Unduh Laporan">
                          <Download size={18} strokeWidth={2.5}/>
                          <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Unduh Report</span>
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[650px] custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                          <thead className={`sticky top-0 z-10 ${t.tableHead}`}>
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">Waktu</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em]">Keterangan</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-right whitespace-nowrap">Nominal</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${t.divide}`}>
                            {transactions.filter(tx => tx.desc?.toLowerCase().includes(searchQuery.toLowerCase()) || tx.category.toLowerCase().includes(searchQuery.toLowerCase())).map(tx => (
                                <tr key={tx.id} className={`transition-all group border-l-4 border-transparent hover:${t.bgSoft} hover:border-${t.chartMain}-500`}>
                                  <td className={`px-6 py-4 text-[11px] font-bold uppercase whitespace-nowrap ${t.textSub}`}>{tx.dateStr}</td>
                                  <td className="px-6 py-4">
                                      <Text className={`font-extrabold text-sm mb-1.5 ${t.textMain}`}>{tx.desc || "Manual"}</Text>
                                      <Badge color={tx.desc?.toLowerCase().includes('nabung') ? "indigo" : tx.type === 'MASUK' ? t.chartMain : "rose"} size="xs" variant="solid" className="font-bold text-[8px] uppercase tracking-widest">{tx.category}</Badge>
                                  </td>
                                  <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${tx.type === 'MASUK' ? t.primaryText : t.textMain}`}>
                                      {tx.type === 'MASUK' ? '+' : '-'}{formatRp(tx.amount).replace('Rp', '').trim()}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <button onClick={() => setDeleteId(tx.id)} className={`p-2.5 rounded-xl transition-all active:scale-90 hover:bg-rose-50 hover:text-rose-600 ${t.textSub}`}><Trash2 size={18} strokeWidth={2.5}/></button>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                      </table>
                    </div>
                  </Card>
              </div>
            )}

            {/* TAB ZAKAT */}
            {activeTab === 'zakat' && (
              <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto space-y-8">
                <Card className={`rounded-[3rem] p-10 lg:p-16 bg-gradient-to-br ${t.primaryGradient} text-white text-center shadow-xl relative overflow-hidden group border border-white/10`}>
                  <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
                  <div className="relative z-10">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl"><Calculator className="text-white" size={36} strokeWidth={2.5}/></div>
                      <Text className="text-white/80 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 leading-none">Estimasi kewajiban zakat maal</Text>
                      <Metric className="text-white font-black text-5xl lg:text-7xl mt-6 tracking-tighter drop-shadow-2xl">{formatRp(wajibZakat ? stats.balance * 0.025 : 0)}</Metric>
                      <div className="mt-12 max-w-md mx-auto text-left bg-black/20 p-6 rounded-3xl border border-white/10">
                        <Flex className="mb-3">
                          <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Progress ke Nishab</Text>
                          <Text className="text-white text-[11px] font-black">{Math.min(Math.round((stats.balance / nishabTahunan) * 100), 100)}%</Text>
                        </Flex>
                        <ProgressBar value={Math.min((stats.balance / nishabTahunan) * 100, 100)} color={t.chartMain} className="h-2.5 rounded-full bg-black/40" />
                      </div>
                  </div>
                </Card>
              </div>
            )}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${t.hexBg}; }
        ::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: fade-in 0.5s ease-out, slide-up 0.5s ease-out; }
      `}} />
    </div>
  );
}