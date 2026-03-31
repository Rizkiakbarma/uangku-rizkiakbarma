// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { 
  Activity, Loader2, Lock, CheckCircle2, LayoutDashboard, History, 
  Search, RefreshCcw, Trash2, AlertTriangle, Target, Calculator, 
  Coins, HeartHandshake, ArrowUpRight, ArrowDownRight, Zap, 
  ChevronRight, ChevronLeft, Calendar, Menu, Settings, LogOut,
  Sparkles, BarChart3, TrendingUp, LineChart as LineChartIcon
} from 'lucide-react';

import { 
  Card, Metric, Text, Flex, ProgressBar, Grid, AreaChart, 
  DonutChart, Title, Badge, BarChart
} from "@tremor/react";

/**
 * BudgetIN PRO - ENTERPRISE ULTIMATE (V25.0 - UI PERFECTION)
 * Fix: Hide backend info badge, Match UI colors with reference, Fix Y-Axis cutoff, Make BarChart slimmer & show all dates.
 */

// 🔥 1. SETUP KONEKSI DUA SUMBER DATA (HYBRID SYNC)
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyslKsTua7BE8pwmFh1xfRZn7QhfQMSKbGYvY3nAxx6qu41iRXJLBK-z8AsKVSd2_g1ng/exec"; 
const SUPABASE_URL = "https://tdjzksdxnvxoaethaxeo.supabase.co";
const SUPABASE_KEY = "sb_publishable_CIPEHIf12ctSTq_liVgWiA_E3n734fh";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DUMMY_DATA = [
  { id: 991, date: new Date(), amount: 15500000, type: 'MASUK', category: 'MASUK', desc: 'Gaji Bulanan (Contoh)' },
  { id: 992, date: new Date(), amount: 250000, type: 'KELUAR', category: 'Food and Beverages', desc: 'Makan Siang' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('budgetin_last_tab') || 'overview');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [isBarChart, setIsBarChart] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteGoalData, setDeleteGoalData] = useState(null);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(5000000); 
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  const processIncomingData = (rawList) => {
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

  const fetchData = async (idFromUrl) => {
    setLoading(true);
    try {
      let supaData = [];
      try {
        const { data } = await supabase.from('transactions').select('*').eq('user_id', String(idFromUrl));
        if (data) supaData = processIncomingData(data).map(item => ({ ...item, source: 'supabase' }));
      } catch (e) { console.warn("Supabase fetch failed", e); }

      let sheetData = [];
      try {
        const res = await fetch(`${GAS_API_URL}?userid=${idFromUrl}`);
        const json = await res.json();
        if (json.status === 'success') {
          sheetData = processIncomingData(json.data).map(item => ({ ...item, source: 'sheet' }));
        }
      } catch (e) { console.warn("Sheets fetch failed", e); }

      const combined = [...supaData, ...sheetData];
      const uniqueTransactions = combined.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.dateKey === item.dateKey &&
          t.amount === item.amount &&
          t.desc?.toLowerCase() === item.desc?.toLowerCase()
        ))
      );

      uniqueTransactions.sort((a, b) => b.dateObj - a.dateObj || b.id - a.id);
      setTransactions(uniqueTransactions);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Gagal sinkronisasi data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async (idFromUrl) => {
    try {
      const { data } = await supabase.from('goals').select('*').eq('user_id', String(idFromUrl)).order('created_at', { ascending: false });
      if (data) setGoals(data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (isDemo) { setTransactions(prev => prev.filter(t => t.id !== deleteId)); setDeleteId(null); return; }
    if (!deleteId || !userId) return;
    setIsDeleting(true);
    
    try {
      const trxToDelete = transactions.find(t => t.id === deleteId);
      
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

  const executeDeleteGoal = async (actionType) => {
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
    } catch (err) {
      console.error(err);
      alert("Gagal memproses penghapusan.");
    } finally {
      setIsDeletingGoal(false);
    }
  };

  useEffect(() => {
    const idFromUrl = new URLSearchParams(window.location.search).get('userid');
    if (!idFromUrl) {
      setIsDemo(true); setTransactions(processIncomingData(DUMMY_DATA)); setLoading(false); return;
    }
    setUserId(idFromUrl);
    fetchData(idFromUrl);
    fetchGoals(idFromUrl); 
    const savedBudget = localStorage.getItem(`budgetin_budget_${idFromUrl}`);
    if (savedBudget) setMonthlyBudget(parseInt(savedBudget));
  }, []);

  useEffect(() => { localStorage.setItem('budgetin_last_tab', activeTab); }, [activeTab]);

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type?.toUpperCase() === 'MASUK').reduce((a, b) => a + Number(b.amount), 0);
    const expense = transactions.filter(t => t.type?.toUpperCase() === 'KELUAR').reduce((a, b) => a + Number(b.amount), 0);
    return { balance: income - expense, income, expense };
  }, [transactions]);

  const filteredByMonth = useMemo(() => transactions.filter(t => t.month === viewDate.getMonth() && t.year === viewDate.getFullYear()), [transactions, viewDate]);
  const totalKeluarBulanTerpilih = useMemo(() => filteredByMonth.filter(t => t.type?.toUpperCase() === 'KELUAR').reduce((a, b) => a + Number(b.amount), 0), [filteredByMonth]);

  const chartData = useMemo(() => {
    const data = [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 
    
    // Menampilkan 1 bulan full agar tanggal tidak ada yang terlewat
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const amt = transactions.filter(t => t.type?.toUpperCase() === 'KELUAR' && t.dateKey === key).reduce((s, t) => s + Number(t.amount), 0);
      
      data.push({ 
        date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), 
        "Pengeluaran": amt 
      });
    }
    return data;
  }, [transactions, viewDate]);

  const categoryData = useMemo(() => {
    const cats = {};
    filteredByMonth.filter(t => t.type?.toUpperCase() === 'KELUAR').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
    });
    return Object.keys(cats).map(name => ({ name, amount: cats[name] })).sort((a,b) => b.amount - a.amount);
  }, [filteredByMonth]);

  const leakageInfo = useMemo(() => {
    const counts = filteredByMonth.filter(t => t.type === 'KELUAR').reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});
    const mostFreq = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return { name: mostFreq || "N/A", count: counts[mostFreq] || 0 };
  }, [filteredByMonth]);

  const emasHarga = 1350000;
  const nishabTahunan = 85 * emasHarga;
  const wajibZakat = stats.balance >= nishabTahunan;

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  const axisFormatter = (num) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(num);

  const activeGoal = goals.find(g => g.is_active) || goals[0]; 

  const handleSaveBudget = (val) => {
    let newVal = parseInt(val);
    if (isNaN(newVal) || newVal < 0) newVal = 0;
    setMonthlyBudget(newVal);
    if (userId) localStorage.setItem(`budgetin_budget_${userId}`, String(newVal));
    setIsSettingBudget(false);
  };

  // 🔥 WARNA SESUAI REFERENSI FOTO (VIBRANT & ELEGAN)
  // Dark Green, Emerald, Rose/Pink, Amber/Orange, Navy
  const tremorColors = ["emerald-800", "emerald-500", "rose-500", "amber-500", "slate-800", "blue-500", "fuchsia-500", "cyan-500"];
  const hexColors = ["#065f46", "#10b981", "#f43f5e", "#f59e0b", "#1e293b", "#3b82f6", "#d946ef", "#06b6d4"];

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-10">
      <Loader2 className="animate-spin text-emerald-500 w-12 h-12 mb-6" />
      <Text className="font-bold tracking-widest text-slate-300 uppercase text-[10px]">Memuat data...</Text>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsMobileSidebarOpen(false); }} 
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group ${activeTab === id ? 'bg-emerald-600 text-white shadow-[0_8px_16px_rgba(16,185,129,0.15)]' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      <div className="shrink-0"><Icon size={20} strokeWidth={2.5} /></div>
      <span className="text-[13px] whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#FCFCFC] font-sans text-slate-900 overflow-hidden selection:bg-emerald-100">
      
      {isMobileSidebarOpen && (
        <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in" />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none lg:relative w-64 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col p-5 overflow-hidden">
          <div className="flex items-center gap-4 mb-8 pl-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shrink-0"><Activity className="text-white" size={20} strokeWidth={3} /></div>
            <div>
               <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none uppercase">BudgetIN</h1>
               <Badge color="emerald" variant="soft" className="mt-1 text-[8px] font-black uppercase px-2 py-0">Versi Pro</Badge>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem id="overview" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="ledger" label="Riwayat Mutasi" icon={History} />
            <NavItem id="goals" label="Target Goals" icon={Target} />
            <NavItem id="zakat" label="Kalkulator Zakat" icon={Calculator} />
            <div className="h-[1px] bg-slate-50 my-4 mx-2"></div>
          </nav>
          <div className="pt-6 border-t border-slate-50">
            <button className="w-full flex items-center justify-start gap-4 px-4 py-3 text-slate-400 hover:text-rose-500 font-bold text-[13px] transition-colors"><LogOut size={18} strokeWidth={2.5}/> Keluar</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto relative custom-scrollbar flex flex-col">
        
        {/* 🔥 MODAL HAPUS TRANSAKSI UMUM */}
        {deleteId && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
               <Card className="max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95">
                  <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-center mb-8 tracking-tight uppercase">Hapus transaksi?</h3>
                  <div className="flex gap-4">
                    <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase">Batal</button>
                    <button onClick={handleDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-xl shadow-rose-200">
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Ya, Hapus"}
                    </button>
                  </div>
               </Card>
            </div>
        )}

        {/* 🔥 MODAL SMART DELETE GOALS */}
        {deleteGoalData && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[300] flex items-center justify-center p-4">
             <Card className="max-w-md w-full p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95">
                <Target className="w-12 h-12 text-slate-800 mx-auto mb-4" strokeWidth={2}/>
                <h3 className="text-xl font-black text-center mb-2 tracking-tight">HAPUS: {deleteGoalData.goal_name}</h3>
                <Text className="text-center text-xs mb-8 text-slate-500 leading-relaxed px-4">
                  Saat ini ada dana <strong className="text-emerald-600">{formatRp(deleteGoalData.current_amount)}</strong> yang sudah terkumpul. Apa yang ingin kamu lakukan dengan dana ini?
                </Text>
                
                <div className="flex flex-col gap-4">
                  <button onClick={() => executeDeleteGoal('refund')} disabled={isDeletingGoal} className="w-full py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold text-xs uppercase transition-all flex flex-col items-center justify-center gap-1 border border-emerald-200/60 shadow-sm">
                    <span>↩️ Batal & Refund Saldo</span>
                    <span className="text-[9px] font-medium normal-case text-emerald-600">Uang akan dikembalikan ke Saldo Utama</span>
                  </button>
                  <button onClick={() => executeDeleteGoal('delete_only')} disabled={isDeletingGoal} className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl font-bold text-xs uppercase transition-all flex flex-col items-center justify-center gap-1 border border-rose-200/60 shadow-sm">
                    <span>💸 Hapus Saja (Hangus)</span>
                    <span className="text-[9px] font-medium normal-case text-rose-500">Target selesai atau uang sudah terpakai</span>
                  </button>
                  <button onClick={() => setDeleteGoalData(null)} disabled={isDeletingGoal} className="w-full py-3 mt-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-[10px] uppercase transition-all">Batal Kembali</button>
                </div>
             </Card>
          </div>
        )}

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl px-5 lg:px-8 py-3 flex justify-between items-center border-b border-slate-100/60 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-lg border border-slate-100 text-slate-500 hover:text-emerald-600"><Menu size={20}/></button>
             {/* 🔥 TULISAN UNGU DIGANTI JADI HIJAU PROFESSIONAL USER-FACING */}
             <Badge color="emerald" variant="soft" className="hidden sm:flex px-2.5 py-0.5 font-bold text-[8px] uppercase tracking-widest rounded-full border border-emerald-100 animate-pulse">Live Sync Active</Badge>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && <Badge color="amber" icon={Sparkles} className="font-bold px-2.5 py-0.5 rounded-full text-[8px]">Mode Demo</Badge>}
            <button onClick={() => { userId && fetchData(userId); fetchGoals(userId); }} className="p-2 bg-white hover:bg-emerald-50 rounded-xl shadow-sm ring-1 ring-slate-100 text-slate-400 hover:text-emerald-600 active:scale-90 transition-all"><RefreshCcw size={16} strokeWidth={2.5}/></button>
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-md">RA</div>
          </div>
        </header>

        <div className="flex-1 p-5 lg:p-7 max-w-8xl mx-auto w-full">
            
            {/* ========================================================================= */}
            {/* TAB: DASHBOARD (OVERVIEW) */}
            {/* ========================================================================= */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                
                {/* 1. ROW ATAS: HERO SALDO */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-lg border-t border-white ring-1 ring-slate-100/40">
                  <div>
                    <Text className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div> Total saldo aktif</Text>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 drop-shadow-md">{formatRp(stats.balance)}</h2>
                  </div>
                  <div className="flex items-center bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600"><ChevronLeft size={18} strokeWidth={3}/></button>
                    <div className="px-5 text-center min-w-[120px]">
                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">{viewDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600"><ChevronRight size={18} strokeWidth={3}/></button>
                  </div>
                </div>

                {/* 2. ROW TENGAH: KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="rounded-[2rem] border-none shadow-[0_15px_30px_rgba(16,185,129,0.05)] p-6 lg:p-8 bg-white ring-1 ring-slate-100 hover:translate-y-[-3px] transition-all">
                    <Flex alignItems="center">
                      <div><Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">Pemasukan</Text><Metric className="text-emerald-600 font-black text-3xl tracking-tighter">{formatRp(stats.income)}</Metric></div>
                      <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 transform hover:rotate-6 transition-transform"><ArrowUpRight size={24} strokeWidth={3} /></div>
                    </Flex>
                  </Card>
                  <Card className="rounded-[2rem] border-none shadow-[0_15px_30px_rgba(244,63,94,0.05)] p-6 lg:p-8 bg-white ring-1 ring-slate-100 hover:translate-y-[-3px] transition-all">
                    <Flex alignItems="center">
                      <div><Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">Pengeluaran</Text><Metric className="text-rose-600 font-black text-3xl tracking-tighter">{formatRp(stats.expense)}</Metric></div>
                      <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-100 transform hover:-rotate-6 transition-transform"><ArrowDownRight size={24} strokeWidth={3} /></div>
                    </Flex>
                  </Card>
                </div>

                {/* 3. ROW BAWAH: BALANCED COLUMNS */}
                <div className="flex flex-col xl:flex-row gap-6">
                  
                  {/* --- KOLOM KIRI: MAIN CHARTS --- */}
                  <div className="flex-1 min-w-0 space-y-6">
                    
                    {/* TREN HARIAN (YAxis lebar, Scrollable 30 Hari, Batang Kecil) */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl p-6 lg:p-8 bg-white ring-1 ring-slate-100/30">
                      <Flex className="mb-2 items-start justify-between">
                          <div><Title className="font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 text-[11px] tracking-widest leading-none uppercase">Tren harian</Title></div>
                          <div className="flex bg-slate-50 p-1 rounded-xl ring-1 ring-slate-100 shrink-0">
                              <button onClick={() => setIsBarChart(true)} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase ${isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Batang</button>
                              <button onClick={() => setIsBarChart(false)} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase ${!isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Garis</button>
                          </div>
                      </Flex>
                      <div className="w-full overflow-x-auto custom-scrollbar pb-4 mt-4">
                          {/* 🔥 MIN WIDTH SANGAT BESAR AGAR BATANG KECIL DAN SEMUA TANGGAL MUNCUL */}
                          <div className="h-56 min-w-[1200px] pr-4">
                              {isBarChart ? (
                                <BarChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={["emerald"]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={70} showGridLines={false} />
                              ) : (
                                <AreaChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={["emerald"]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={70} curveType="monotone" showGridLines={false} />
                              )}
                          </div>
                      </div>
                    </Card>

                    {/* ALOKASI DANA */}
                    <Card className="rounded-[2.5rem] border-none shadow-lg ring-1 ring-slate-100 p-8 bg-white flex flex-col hover:shadow-xl transition-shadow">
                      <Title className="font-bold text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-8 border-l-4 border-emerald-600 pl-3 leading-none">Alokasi dana</Title>
                      
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                          <DonutChart className="h-52 w-full" data={categoryData} category="amount" index="name" valueFormatter={axisFormatter} colors={tremorColors} showAnimation={true} />
                        </div>
                        <div className="w-full md:w-1/2 space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                          {categoryData.length > 0 ? categoryData.map((c, i) => (
                            <Flex key={c.name} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: hexColors[i % hexColors.length] }}></div>
                                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[140px]">{c.name}</Text>
                              </div>
                              <Text className="font-black text-slate-900 text-xs tracking-tighter">{formatRp(c.amount)}</Text>
                            </Flex>
                          )) : <Text className="text-center text-xs text-slate-400 font-medium italic">Belum ada pengeluaran bulan ini.</Text>}
                        </div>
                      </div>
                    </Card>

                  </div>

                  {/* --- KOLOM KANAN: WIDGETS --- */}
                  <aside className="w-full xl:w-96 shrink-0 space-y-6">
                    
                    {/* FOKUS TARGET 🎯 */}
                    {activeGoal ? (
                      <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-slate-900 text-white relative overflow-hidden group hover:shadow-2xl transition-all cursor-pointer" onClick={() => setActiveTab('goals')}>
                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Target size={160} /></div>
                        <Title className="text-[10px] font-bold text-emerald-400 tracking-[0.3em] uppercase mb-8 border-l-4 border-emerald-500 pl-3 leading-none">Fokus Target 🎯</Title>
                        <div className="relative z-10">
                          <Flex className="mb-4">
                            <h3 className="text-xl font-black tracking-tight">{activeGoal.goal_name}</h3>
                            <Badge color="emerald" variant="solid" className="rounded-lg text-[9px] font-black uppercase shadow-lg shadow-emerald-900">
                              {Math.min(Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100), 100)}%
                            </Badge>
                          </Flex>
                          <ProgressBar value={(activeGoal.current_amount / activeGoal.target_amount) * 100} color="emerald" className="h-3 rounded-full mb-6" />
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <Text className="text-[8px] text-white/50 uppercase font-bold mb-1">Di Celengan</Text>
                                <Text className="text-xs font-black text-emerald-400">{formatRp(activeGoal.current_amount)}</Text>
                             </div>
                             <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <Text className="text-[8px] text-white/50 uppercase font-bold mb-1">Target Misi</Text>
                                <Text className="text-xs font-black">{axisFormatter(activeGoal.target_amount)}</Text>
                             </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-slate-50 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 cursor-pointer" onClick={() => setActiveTab('goals')}>
                         <Target className="text-slate-300 mb-3" size={32}/>
                         <Text className="text-[10px] font-bold text-slate-400 uppercase">Belum ada target.</Text>
                         <Text className="text-[9px] text-slate-400 mt-1 italic">Ketik `/setgoal Laptop 10jt` di Bot!</Text>
                      </Card>
                    )}

                    {/* TARGET ANGGARAN */}
                    <Card className="rounded-[2.5rem] border-none shadow-lg ring-1 ring-slate-100 p-8 bg-white overflow-hidden relative">
                      <Flex className="mb-8 items-center justify-between">
                          <Title className="text-[10px] font-bold text-slate-800 tracking-[0.3em] leading-none uppercase">Target anggaran</Title>
                          <button onClick={() => setIsSettingBudget(true)} className="p-2 bg-slate-50 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Settings size={16}/></button>
                      </Flex>
                      <div className="space-y-6">
                        <div>
                          <Flex className="mb-3">
                              <Text className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">Pemakaian</Text>
                              <Badge color={totalKeluarBulanTerpilih > monthlyBudget ? "rose" : "emerald"} variant="solid" className="font-bold rounded-lg text-[9px] px-2.5 py-0.5 shadow-sm">
                                {monthlyBudget > 0 ? Math.round((totalKeluarBulanTerpilih / monthlyBudget) * 100) : 0}%
                              </Badge>
                          </Flex>
                          <ProgressBar value={monthlyBudget > 0 ? (totalKeluarBulanTerpilih / monthlyBudget) * 100 : 0} color={totalKeluarBulanTerpilih > monthlyBudget ? "rose" : "emerald"} className="h-3 rounded-full shadow-inner" />
                        </div>
                        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 shadow-inner">
                          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">Limit bulanan</Text>
                          {isSettingBudget ? (
                              <input type="number" defaultValue={monthlyBudget} onBlur={(e) => handleSaveBudget(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleSaveBudget(e.currentTarget.value) }} className="bg-white border-2 border-emerald-500 rounded-xl px-4 py-2 text-lg font-black w-full outline-none text-slate-800" autoFocus />
                          ) : (
                              <Metric onClick={() => setIsSettingBudget(true)} className="text-2xl font-black text-slate-800 tracking-tighter cursor-pointer hover:opacity-70 transition-opacity">{formatRp(monthlyBudget)}</Metric>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* EFISIENSI AI */}
                    <Card className="rounded-3xl border-none shadow-lg p-7 bg-gradient-to-br from-white to-emerald-50 ring-1 ring-emerald-100 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Zap size={140} /></div>
                        <Title className="font-bold text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2 mb-6"><TrendingUp size={18} strokeWidth={2.5} className="text-emerald-600"/> Efisiensi</Title>
                        <div className="space-y-4">
                          <Flex><Text className="font-bold text-emerald-800 text-[10px] uppercase">Potensi hemat</Text><Text className="font-black text-emerald-700 text-3xl">24%</Text></Flex>
                          <ProgressBar value={24} color="emerald" className="h-3 rounded-full shadow-inner" />
                        </div>
                        <Text className="mt-8 text-[11px] font-medium text-slate-600 italic border-l-4 border-emerald-500 pl-4 py-1 leading-relaxed">
                            {leakageInfo.count > 1 ? `"Detektor AI mendeteksi pengeluaran berulang pada kategori ${leakageInfo.name.toLowerCase()}."` : `"Arus kas Anda bulan ini sangat efisien. Pertahankan!"`}
                        </Text>
                    </Card>

                    {/* BATAS HARIAN AMAN */}
                    <Card className="rounded-3xl border-none shadow-lg p-7 bg-slate-900 text-white overflow-hidden relative border-t border-white/5">
                        <div className="absolute -bottom-10 -right-10 opacity-10"><Activity size={180} /></div>
                        <Title className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8 leading-none">Batas harian aman</Title>
                        <Metric className="text-white font-black text-4xl tracking-tighter drop-shadow-md">{formatRp(stats.balance > 0 ? stats.balance / 30 : 0).replace('Rp', '').trim()}</Metric>
                        <Text className="text-emerald-100 font-medium text-[10px] mt-6 opacity-80 leading-relaxed">Estimasi jatah pengeluaran harian agar saldo cukup sampai akhir bulan.</Text>
                    </Card>

                  </aside>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 🔥 TAB: GOAL CENTER */}
            {/* ========================================================================= */}
            {activeTab === 'goals' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-20 -bottom-20 opacity-10"><Target size={300} /></div>
                  <div className="relative z-10 w-full">
                    <Title className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-3 border-l-4 border-emerald-500 pl-3">Goal Center</Title>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tighter mb-2">Target Impianmu 🎯</h2>
                    <Text className="text-slate-400 text-xs font-medium">Dana di sini tersimpan di kantong terpisah dari saldo utama.</Text>
                  </div>
                </div>

                <Grid numItemsMd={2} className="gap-6">
                  {goals.map(g => (
                    <Card key={g.id} className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white ring-1 ring-slate-100 relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteGoalData(g); }} 
                        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} strokeWidth={2.5}/>
                      </button>

                      <Flex className="mb-5 items-start pr-10">
                        <div>
                          <Title className="text-2xl font-black tracking-tight text-slate-900">{g.goal_name}</Title>
                          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Misi: {formatRp(g.target_amount)}</Text>
                        </div>
                        <Badge color={g.current_amount >= g.target_amount ? "emerald" : "amber"} variant="solid" className="rounded-lg text-[10px] font-black uppercase shadow-sm px-3 py-1">
                          {Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100)}%
                        </Badge>
                      </Flex>
                      <ProgressBar value={(g.current_amount / g.target_amount) * 100} color={g.current_amount >= g.target_amount ? "emerald" : "amber"} className="h-3.5 rounded-full mb-6 shadow-inner" />
                      
                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        <div>
                          <Text className="text-[9px] text-slate-400 uppercase font-bold mb-1">Celengan Terisi</Text>
                          <Text className="text-base font-black text-emerald-600">{formatRp(g.current_amount)}</Text>
                        </div>
                        <div className="text-right">
                          <Text className="text-[9px] text-slate-400 uppercase font-bold mb-1">Kurang</Text>
                          <Text className="text-base font-black text-slate-400">{formatRp(Math.max(0, g.target_amount - g.current_amount))}</Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {goals.length === 0 && (
                    <div className="col-span-2 p-16 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                       <Target size={48} className="text-slate-300 mx-auto mb-4" />
                       <h3 className="font-bold text-slate-500 mb-2">Belum ada target impian.</h3>
                       <p className="text-xs text-slate-400">Gunakan perintah <code className="bg-slate-200 px-2 py-1 rounded">/setgoal nama_barang nominal</code> di Telegram untuk memulai.</p>
                    </div>
                  )}
                </Grid>

                <Card className="rounded-[2.5rem] border-none shadow-sm ring-1 ring-slate-100 overflow-hidden bg-white p-0 mt-6">
                  <div className="p-6 lg:p-8 border-b border-slate-50 bg-emerald-50/30">
                    <Title className="font-black text-slate-900 text-xl tracking-tighter uppercase flex items-center gap-2"><ArrowDownRight className="text-emerald-500"/> Riwayat Isi Celengan</Title>
                  </div>
                  <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 whitespace-nowrap">Waktu</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Deskripsi Tabungan</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 text-right whitespace-nowrap">Uang Masuk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.filter(t => t.desc?.toLowerCase().includes('nabung goals:') || t.desc?.toLowerCase().includes('nabung:') || t.desc?.toLowerCase().includes('refund tabungan:')).map(t => (
                          <tr key={t.id} className="hover:bg-emerald-50/30 transition-all group">
                            <td className="px-6 py-4 text-[11px] text-slate-400 font-bold uppercase whitespace-nowrap">{t.dateStr}</td>
                            <td className="px-6 py-4">
                              <Text className="font-extrabold text-slate-800 text-sm mb-1.5">{t.desc.replace(/Nabung Goals:|Nabung:/ig, 'Suntik Dana:').trim()}</Text>
                              <Badge color={t.desc?.toLowerCase().includes('refund') ? "rose" : "emerald"} size="xs" variant="solid" className="font-bold text-[8px] uppercase tracking-widest shadow-sm">
                                {t.desc?.toLowerCase().includes('refund') ? "Ditarik" : "Dari Saldo Utama"}
                              </Badge>
                            </td>
                            <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${t.desc?.toLowerCase().includes('refund') ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {t.desc?.toLowerCase().includes('refund') ? '-' : '+'}{formatRp(t.amount).replace('Rp', '').trim()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB: MUTASI UTAMA */}
            {activeTab === 'ledger' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                  <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 overflow-hidden bg-white p-0">
                    <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                      <Title className="font-black text-slate-900 text-2xl tracking-tighter">Riwayat Mutasi Utama</Title>
                      <div className="relative w-full md:w-[320px]">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input type="text" placeholder="Cari keterangan / kategori..." className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm" onChange={(e) => setSearchQuery(e.target.value)} />
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[650px] custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-900 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 whitespace-nowrap">Waktu</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Keterangan</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 text-right whitespace-nowrap">Nominal</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {transactions.filter(t => t.desc?.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                                <tr key={t.id} className="hover:bg-emerald-50/30 transition-all group border-l-4 border-transparent hover:border-emerald-500">
                                  <td className="px-6 py-4 text-[11px] text-slate-400 font-bold uppercase whitespace-nowrap">{t.dateStr}</td>
                                  <td className="px-6 py-4">
                                      <Text className="font-extrabold text-slate-800 text-sm mb-1.5">{t.desc || "Manual"}</Text>
                                      <Badge color={t.desc?.toLowerCase().includes('nabung') ? "indigo" : t.type === 'MASUK' ? "emerald" : "rose"} size="xs" variant="solid" className="font-bold text-[8px] uppercase tracking-widest">{t.category}</Badge>
                                  </td>
                                  <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${t.type === 'MASUK' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                      {t.type === 'MASUK' ? '+' : '-'}{formatRp(t.amount).replace('Rp', '').trim()}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <button onClick={() => setDeleteId(t.id)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"><Trash2 size={18} strokeWidth={2.5}/></button>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                      </table>
                    </div>
                  </Card>
              </div>
            )}

            {/* TAB: ZAKAT */}
            {activeTab === 'zakat' && (
              <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto space-y-8">
                <Card className="rounded-[3rem] p-10 lg:p-16 bg-gradient-to-br from-emerald-600 to-emerald-900 text-white text-center shadow-[0_40px_80px_rgba(5,150,105,0.2)] relative overflow-hidden group border border-emerald-500/30">
                  <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
                  <div className="relative z-10">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl"><Calculator className="text-white" size={36} strokeWidth={2.5}/></div>
                      <Text className="text-emerald-100 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 leading-none">Estimasi kewajiban zakat maal</Text>
                      <Metric className="text-white font-black text-5xl lg:text-7xl mt-6 tracking-tighter drop-shadow-2xl">{formatRp(wajibZakat ? stats.balance * 0.025 : 0)}</Metric>
                      <div className="mt-12 max-w-md mx-auto text-left bg-black/20 p-6 rounded-3xl border border-white/10">
                        <Flex className="mb-3">
                          <Text className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">Progress ke Nishab</Text>
                          <Text className="text-white text-[11px] font-black">{Math.min(Math.round((stats.balance / nishabTahunan) * 100), 100)}%</Text>
                        </Flex>
                        <ProgressBar value={Math.min((stats.balance / nishabTahunan) * 100, 100)} color="emerald" className="h-2.5 rounded-full bg-black/40" />
                        <Text className="text-emerald-50 text-[10px] mt-4 text-center leading-relaxed font-medium">
                          {wajibZakat ? "Alhamdulillah, harta Anda sudah mencapai nishab." : `Kurang ${formatRp(nishabTahunan - stats.balance)} lagi untuk mencapai batas nishab.`}
                        </Text>
                      </div>
                  </div>
                </Card>
                <Grid numItemsMd={2} className="gap-8">
                  <Card className="rounded-[2.5rem] p-8 lg:p-10 bg-white ring-1 ring-slate-100 shadow-xl"><HeartHandshake className="text-rose-500 mb-6" size={32} strokeWidth={3}/><Title className="font-black text-slate-800 uppercase text-[11px] tracking-[0.2em] mb-3">Sedekah Ideal (1%)</Title><Metric className="text-rose-600 font-black text-3xl">{formatRp(stats.balance * 0.01)}</Metric></Card>
                  <Card className="rounded-[2.5rem] p-8 lg:p-10 bg-white ring-1 ring-slate-100 shadow-xl flex flex-col justify-center"><Coins className="text-amber-500 mb-6" size={32} strokeWidth={3}/><Title className="font-black text-slate-800 uppercase text-[11px] tracking-[0.2em] mb-4">Status Kewajiban</Title><Badge color={wajibZakat ? "rose" : "emerald"} variant="solid" size="xl" className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest">{wajibZakat ? "WAJIB ZAKAT" : "BELUM NISHAB"}</Badge></Card>
                </Grid>
              </div>
            )}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FCFCFC; }
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