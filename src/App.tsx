// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Loader2, Lock, CheckCircle2, LayoutDashboard, History, 
  Search, RefreshCcw, Trash2, AlertTriangle, Target, Calculator, 
  Coins, HeartHandshake, Wallet, Users, Home, Play, Heart, 
  Smartphone, ShoppingBag, Globe, Coffee, Info, ArrowUpRight, 
  ArrowDownRight, Zap, ChevronRight, ChevronLeft, Calendar, Menu, X, Settings, LogOut,
  Sparkles, BarChart3, TrendingUp, Plus, FileText, Code2, Layers, Bell, ChevronDown,
  LineChart as LineChartIcon
} from 'lucide-react';

// --- IMPORT TREMOR COMPONENTS ---
import { 
  Card, Metric, Text, Flex, ProgressBar, Grid, AreaChart, 
  DonutChart, Title, Badge, BarChart
} from "@tremor/react";

/**
 * BudgetIN PRO - ENTERPRISE ULTIMATE (V19.7 - UX & PERSISTENCE FIX)
 * UI: Explicit Nav, Compact Mutasi, Fixed Budget Storage, Smart Mobile Layout
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyslKsTua7BE8pwmFh1xfRZn7QhfQMSKbGYvY3nAxx6qu41iRXJLBK-z8AsKVSd2_g1ng/exec"; 

const DUMMY_DATA = [
  { id: 991, date: new Date(), amount: 15500000, type: 'MASUK', category: 'MASUK', desc: 'Gaji Bulanan (Contoh)' },
  { id: 992, date: new Date(), amount: 250000, type: 'KELUAR', category: 'Food and Beverages', desc: 'Makan Siang' },
  { id: 993, date: new Date(), amount: 1200000, type: 'KELUAR', category: 'TEMPAT TINGGAL', desc: 'Biaya Kost' },
  { id: 994, date: new Date(), amount: 500000, type: 'KELUAR', category: 'SEDEKAH/ZAKAT', desc: 'Infaq Masjid' },
  { id: 995, date: new Date(), amount: 150000, type: 'KELUAR', category: 'TRANSPORTASI', desc: 'Bensin Motor' },
  { id: 996, date: new Date(), amount: 2500000, type: 'MASUK', category: 'MASUK', desc: 'Bonus Proyek' },
];

export default function App() {
  // --- 1. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
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
  const [monthlyBudget, setMonthlyBudget] = useState(5000000); 
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  // --- 2. CORE ENGINE ---
  const processIncomingData = (rawList) => {
    return rawList.map((item) => {
      const d = new Date(item.date);
      return {
        ...item,
        dateObj: d,
        dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear()
      };
    }).sort((a, b) => b.dateObj - a.dateObj);
  };

  const fetchData = (idFromUrl) => {
    setLoading(true);
    fetch(`${GAS_API_URL}?userid=${idFromUrl}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setTransactions(processIncomingData(data.data));
          setError(null);
        } else {
          setError(data.message || "Gagal sinkronisasi data.");
        }
        setLoading(false);
      })
      .catch(() => { setError("Koneksi gagal."); setLoading(false); });
  };

  const handleDelete = async () => {
    if (isDemo) {
      setTransactions(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
      return;
    }
    if (!deleteId || !userId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${GAS_API_URL}?userid=${userId}&action=delete&row=${deleteId}`);
      const result = await response.json();
      if (result.status === 'success') {
        setDeleteId(null);
        fetchData(userId); 
      }
    } catch (err) { console.error(err); } finally { setIsDeleting(false); }
  };

  useEffect(() => {
    const idFromUrl = new URLSearchParams(window.location.search).get('userid');
    if (!idFromUrl) {
      setIsDemo(true);
      setTransactions(processIncomingData(DUMMY_DATA));
      setLoading(false);
      return;
    }
    setUserId(idFromUrl);
    fetchData(idFromUrl);
    const savedBudget = localStorage.getItem(`budgetin_budget_${idFromUrl}`);
    if (savedBudget) setMonthlyBudget(parseInt(savedBudget));
  }, []);

  // --- 3. ANALYTICS LOGIC ---
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

  const filteredByMonth = useMemo(() => 
    transactions.filter(t => t.month === viewDate.getMonth() && t.year === viewDate.getFullYear())
  , [transactions, viewDate]);

  const totalKeluarBulanTerpilih = useMemo(() => 
    filteredByMonth.filter(t => t.type?.toUpperCase() === 'KELUAR').reduce((a, b) => a + Number(b.amount), 0)
  , [filteredByMonth]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(viewDate);
      if (viewDate.getMonth() === new Date().getMonth()) d.setDate(new Date().getDate() - i);
      else d.setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const amt = transactions.filter(t => t.type?.toUpperCase() === 'KELUAR' && t.dateKey === key).reduce((s, t) => s + Number(t.amount), 0);
      data.push({ date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), "Pengeluaran": amt });
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

  // Zakat Maal Logic
  const emasHarga = 1350000;
  const nishabTahunan = 85 * emasHarga;
  const wajibZakat = stats.balance >= nishabTahunan;

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  const axisFormatter = (num) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(num);

  const handleSaveBudget = (val) => {
    let newVal = parseInt(val);
    if (isNaN(newVal) || newVal < 0) newVal = 0;
    setMonthlyBudget(newVal);
    if (userId) localStorage.setItem(`budgetin_budget_${userId}`, String(newVal));
    setIsSettingBudget(false);
  };

  const tremorColors = ["emerald-800", "emerald-600", "rose-500", "amber-500", "slate-800", "indigo-500", "cyan-600", "purple-500"];
  const hexColors = ["#064E3B", "#10B981", "#F43F5E", "#F59E0B", "#1E293B", "#6366F1", "#0891B2", "#A855F7"];

  // --- 4. RENDERERS ---
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-10">
      <Loader2 className="animate-spin text-emerald-500 w-12 h-12 mb-6" />
      <Text className="font-bold tracking-widest text-slate-300 uppercase text-[10px]">Menghubungkan sistem...</Text>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsMobileSidebarOpen(false); }} 
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group ${activeTab === id ? 'bg-emerald-600 text-white shadow-[0_8px_16px_rgba(16,185,129,0.15)]' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      <div className="shrink-0"><Icon size={20} strokeWidth={2.5} /></div>
      <span className="text-[13px] whitespace-nowrap">
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#FCFCFC] font-sans text-slate-900 overflow-hidden selection:bg-emerald-100">
      
      {/* --- BACKDROP MOBILE --- */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[100] bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none lg:relative w-64 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
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
            <NavItem id="zakat" label="Kalkulator Zakat" icon={Calculator} />
            <div className="h-[1px] bg-slate-50 my-4 mx-2"></div>
            {/* Menu Pengaturan di-hide sementara sesuai evaluasi */}
            {/* <NavItem id="settings" label="Pengaturan" icon={Settings} /> */}
          </nav>
          <div className="pt-6 border-t border-slate-50">
            <button className="w-full flex items-center justify-start gap-4 px-4 py-3 text-slate-400 hover:text-rose-500 font-bold text-[13px] transition-colors"><LogOut size={18} strokeWidth={2.5}/> Keluar</button>
          </div>
        </div>
      </aside>

      {/* --- MAIN INTERFACE --- */}
      <main className="flex-1 h-screen overflow-y-auto relative custom-scrollbar flex flex-col">
        
        {/* MODAL KONFIRMASI HAPUS */}
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

        <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl px-5 lg:px-8 py-3 flex justify-between items-center border-b border-slate-100/60 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-lg border border-slate-100 text-slate-500 hover:text-emerald-600"><Menu size={20}/></button>
             <Badge color="rose" variant="soft" className="hidden sm:flex px-2.5 py-0.5 font-bold text-[8px] uppercase tracking-widest rounded-full border border-rose-50">Sistem Tersinkronisasi</Badge>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && <Badge color="amber" icon={Sparkles} className="font-bold px-2.5 py-0.5 rounded-full text-[8px]">Mode Demo</Badge>}
            <button onClick={() => userId && fetchData(userId)} className="p-2 bg-white hover:bg-emerald-50 rounded-xl shadow-sm ring-1 ring-slate-100 text-slate-400 hover:text-emerald-600 active:scale-90 transition-all"><RefreshCcw size={16} strokeWidth={2.5}/></button>
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-md">RA</div>
          </div>
        </header>

        <div className="flex-1 p-5 lg:p-7 max-w-8xl mx-auto w-full">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                
                {/* HERO */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-lg border-t border-white ring-1 ring-slate-100/40">
                  <div>
                    <Text className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Total saldo aktif</Text>
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

                {/* KPI CARDS */}
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

                {/* GRID BAWAH: KIRI (TREN) & KANAN (ALOKASI) */}
                <div className="flex flex-col xl:flex-row gap-6">
                  
                  {/* KOLOM KIRI */}
                  <div className="flex-1 min-w-0 order-2 xl:order-1 space-y-6">
                    {/* CHART AREA */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl p-6 lg:p-8 bg-white ring-1 ring-slate-100/30">
                      <Flex className="mb-2 items-start justify-between">
                          <div>
                            <Title className="font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 text-[11px] tracking-widest leading-none uppercase">Tren harian</Title>
                            <Text className="text-[10px] text-slate-400 font-medium mt-3 ml-4 italic">Ketuk/Hover area grafik untuk melihat detail nominal.</Text>
                          </div>
                          <div className="flex bg-slate-50 p-1 rounded-xl ring-1 ring-slate-100 shrink-0">
                              <button onClick={() => setIsBarChart(true)} className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase ${isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Batang</button>
                              <button onClick={() => setIsBarChart(false)} className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase ${!isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Garis</button>
                          </div>
                      </Flex>
                      <div className="h-64 mt-4">
                          {isBarChart ? (
                            <BarChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={["emerald"]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={60} showGridLines={false} showTooltip={true} />
                          ) : (
                            <AreaChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={["emerald"]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={60} curveType="monotone" showGridLines={false} showTooltip={true} />
                          )}
                      </div>
                    </Card>

                    {/* AI INSIGHTS AREA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="rounded-3xl border-none shadow-lg p-7 bg-gradient-to-br from-white to-emerald-50 ring-1 ring-emerald-100 relative overflow-hidden group">
                          <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Zap size={140} /></div>
                          <Title className="font-bold text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2 mb-6">
                            <TrendingUp size={18} strokeWidth={2.5} className="text-emerald-600"/> Efisiensi
                          </Title>
                          <div className="space-y-4">
                            <Flex><Text className="font-bold text-emerald-800 text-[10px] uppercase">Potensi hemat</Text><Text className="font-black text-emerald-700 text-3xl">24%</Text></Flex>
                            <ProgressBar value={24} color="emerald" className="h-3 rounded-full shadow-inner" />
                          </div>
                          <Text className="mt-8 text-[11px] font-medium text-slate-600 italic border-l-4 border-emerald-500 pl-4 py-1 leading-relaxed">
                              {leakageInfo.count > 1 ? `"Detektor AI mendeteksi pengeluaran berulang pada kategori ${leakageInfo.name.toLowerCase()}."` : `"Arus kas Anda bulan ini sangat efisien. Pertahankan!"`}
                          </Text>
                      </Card>
                      <Card className="rounded-3xl border-none shadow-lg p-7 bg-slate-900 text-white overflow-hidden relative border-t border-white/5">
                          <div className="absolute -bottom-10 -right-10 opacity-10"><Activity size={180} /></div>
                          <Title className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8 leading-none">Batas harian aman</Title>
                          <Metric className="text-white font-black text-4xl tracking-tighter drop-shadow-md">{formatRp(stats.balance > 0 ? stats.balance / 30 : 0).replace('Rp', '').trim()}</Metric>
                          <Text className="text-emerald-100 font-medium text-[10px] mt-6 opacity-80 leading-relaxed">Estimasi jatah pengeluaran harian agar saldo cukup dan aman sampai akhir bulan.</Text>
                      </Card>
                    </div>
                  </div>

                  {/* KOLOM KANAN */}
                  <aside className="w-full xl:w-96 shrink-0 order-1 xl:order-2 space-y-6">
                    
                    {/* ALOKASI DANA */}
                    <Card className="rounded-[2.5rem] border-none shadow-lg ring-1 ring-slate-100 p-8 bg-white flex flex-col hover:shadow-xl transition-shadow">
                      <Title className="font-bold text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-8 border-l-4 border-emerald-600 pl-3 leading-none">Alokasi dana</Title>
                      <DonutChart
                        className="h-52"
                        data={categoryData}
                        category="amount"
                        index="name"
                        valueFormatter={axisFormatter}
                        colors={tremorColors}
                        showAnimation={true}
                        showTooltip={true}
                      />
                      {/* Custom Legend - Now mapping all categories */}
                      <div className="mt-8 space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {categoryData.length > 0 ? categoryData.map((c, i) => (
                          <Flex key={c.name} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: hexColors[i % hexColors.length] }}></div>
                              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{c.name}</Text>
                            </div>
                            <Text className="font-black text-slate-900 text-[11px] tracking-tighter">{formatRp(c.amount)}</Text>
                          </Flex>
                        )) : (
                          <Text className="text-center text-xs text-slate-400 font-medium italic">Belum ada pengeluaran bulan ini.</Text>
                        )}
                      </div>
                    </Card>

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
                          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">Limit bulanan (Ketuk utk ubah)</Text>
                          {isSettingBudget ? (
                              <input 
                                type="number" 
                                defaultValue={monthlyBudget} 
                                onBlur={(e) => handleSaveBudget(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') handleSaveBudget(e.currentTarget.value) }}
                                className="bg-white border-2 border-emerald-500 rounded-xl px-4 py-2 text-lg font-black w-full outline-none text-slate-800 shadow-sm" 
                                autoFocus 
                              />
                          ) : (
                              <Metric onClick={() => setIsSettingBudget(true)} className="text-2xl font-black text-slate-800 tracking-tighter drop-shadow-sm cursor-pointer hover:opacity-70 transition-opacity">{formatRp(monthlyBudget)}</Metric>
                          )}
                        </div>
                      </div>
                    </Card>

                  </aside>
                </div>

              </div>
            )}

            {/* MUTASI TAB */}
            {activeTab === 'ledger' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                  <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 overflow-hidden bg-white p-0">
                    <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                      <Title className="font-black text-slate-900 text-2xl tracking-tighter">Riwayat Transaksi</Title>
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
                                      <Badge color="emerald" size="xs" variant="solid" className="font-bold text-[8px] uppercase tracking-widest">{t.category}</Badge>
                                  </td>
                                  <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${t.type === 'MASUK' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                      {t.type === 'MASUK' ? '+' : '-'}{formatRp(t.amount).replace('Rp', '').trim()}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <button 
                                        onClick={() => setDeleteId(t.id)} 
                                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                        title="Hapus baris ini"
                                      >
                                        <Trash2 size={18} strokeWidth={2.5}/>
                                      </button>
                                  </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center py-12 text-slate-400 font-medium text-sm">Tidak ada transaksi ditemukan.</td>
                              </tr>
                            )}
                          </tbody>
                      </table>
                    </div>
                  </Card>
              </div>
            )}

            {/* ZAKAT TAB */}
            {activeTab === 'zakat' && (
              <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto space-y-8">
                <Card className="rounded-[3rem] p-10 lg:p-16 bg-gradient-to-br from-emerald-600 to-emerald-900 text-white text-center shadow-[0_40px_80px_rgba(5,150,105,0.2)] relative overflow-hidden group border border-emerald-500/30">
                  <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
                  <div className="relative z-10">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl"><Calculator className="text-white" size={36} strokeWidth={2.5}/></div>
                      <Text className="text-emerald-100 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 leading-none">Estimasi kewajiban zakat maal</Text>
                      <Metric className="text-white font-black text-5xl lg:text-7xl mt-6 tracking-tighter drop-shadow-2xl">{formatRp(wajibZakat ? stats.balance * 0.025 : 0)}</Metric>
                      
                      {/* PROGRESS TO NISHAB */}
                      <div className="mt-12 max-w-md mx-auto text-left bg-black/20 p-6 rounded-3xl border border-white/10">
                        <Flex className="mb-3">
                          <Text className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">Progress ke Nishab</Text>
                          <Text className="text-white text-[11px] font-black">{Math.min(Math.round((stats.balance / nishabTahunan) * 100), 100)}%</Text>
                        </Flex>
                        <ProgressBar value={Math.min((stats.balance / nishabTahunan) * 100, 100)} color="emerald" className="h-2.5 rounded-full bg-black/40" />
                        <Text className="text-emerald-50 text-[10px] mt-4 text-center leading-relaxed font-medium">
                          {wajibZakat 
                            ? "Alhamdulillah, harta Anda sudah mencapai nishab. Wajib dikeluarkan zakatnya jika sudah mengendap 1 tahun (Haul)." 
                            : `Kurang ${formatRp(nishabTahunan - stats.balance)} lagi untuk mencapai batas nishab tahun ini.`}
                        </Text>
                      </div>

                      <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                          <Info size={18} className="text-emerald-300" />
                          <div className="text-left">
                            <Text className="text-white text-[10px] font-bold leading-none mb-1 tracking-widest uppercase">Nishab: Rp {(nishabTahunan/1000000).toFixed(1)} Juta</Text>
                            <Text className="text-emerald-200/70 text-[9px] font-medium">(Setara 85gr emas)</Text>
                          </div>
                      </div>
                  </div>
                </Card>

                <Grid numItemsMd={2} className="gap-8">
                  <Card className="rounded-[2.5rem] p-8 lg:p-10 bg-white ring-1 ring-slate-100 shadow-xl hover:translate-y-[-5px] transition-transform">
                      <HeartHandshake className="text-rose-500 mb-6" size={32} strokeWidth={3}/>
                      <Title className="font-black text-slate-800 uppercase text-[11px] tracking-[0.2em] mb-3">Sedekah Ideal (1%)</Title>
                      <Metric className="text-rose-600 font-black text-3xl">{formatRp(stats.balance * 0.01)}</Metric>
                      <Text className="mt-6 text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-[0.1em]">Rekomendasi bulanan penyisihan aset untuk sedekah rutin.</Text>
                  </Card>
                  <Card className="rounded-[2.5rem] p-8 lg:p-10 bg-white ring-1 ring-slate-100 shadow-xl hover:translate-y-[-5px] transition-transform flex flex-col justify-center">
                      <Coins className="text-amber-500 mb-6" size={32} strokeWidth={3}/>
                      <Title className="font-black text-slate-800 uppercase text-[11px] tracking-[0.2em] mb-4">Status Kewajiban</Title>
                      <div>
                          <Badge color={wajibZakat ? "rose" : "emerald"} variant="solid" size="xl" className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md">
                              {wajibZakat ? "WAJIB ZAKAT (HAUL)" : "BELUM NISHAB"}
                          </Badge>
                      </div>
                  </Card>
                </Grid>
              </div>
            )}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Plus+Jakarta+Sans', sans-serif; background: #FCFCFC; }
        ::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .tremor-AreaChart-gridline, .tremor-BarChart-gridline { stroke: #F8FAFC; opacity: 0.5; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: fade-in 0.5s ease-out, slide-up 0.5s ease-out; }
      `}} />
    </div>
  );
}