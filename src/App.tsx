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
 * BudgetIN PRO - ENTERPRISE ULTIMATE (V19.6 - RECOVERY ACTION)
 * UI: No-Scroll Optimized, Delete Feature Restored, Compact Typography
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyslKsTua7BE8pwmFh1xfRZn7QhfQMSKbGYvY3nAxx6qu41iRXJLBK-z8AsKVSd2_g1ng/exec"; 

const DUMMY_DATA = [
  { id: 991, date: new Date(), amount: 15500000, type: 'MASUK', category: 'MASUK', desc: 'Gaji Bulanan (Contoh)' },
  { id: 992, date: new Date(), amount: 250000, type: 'KELUAR', category: 'MAKANAN', desc: 'Makan Siang' },
  { id: 993, date: new Date(), amount: 1200000, type: 'KELUAR', category: 'TEMPAT TINGGAL', desc: 'Biaya Kost' },
  { id: 994, date: new Date(), amount: 500000, type: 'KELUAR', category: 'SEDEKAH/ZAKAT', desc: 'Infaq Masjid' },
  { id: 995, date: new Date(), amount: 150000, type: 'KELUAR', category: 'TRANSPORTASI', desc: 'Bensin Motor' },
  { id: 996, date: new Date(), amount: 2500000, type: 'MASUK', category: 'MASUK', desc: 'Bonus Proyek' },
];

export default function App() {
  // --- 1. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [viewDate, setViewDate] = useState(new Date());
  const [isBarChart, setIsBarChart] = useState(true);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(5000000); 
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  // --- 2. CORE ENGINE ---
  const processIncomingData = (rawList: any[]) => {
    return rawList.map((item: any) => {
      const d = new Date(item.date);
      return {
        ...item,
        dateObj: d,
        dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear()
      };
    }).sort((a: any, b: any) => b.dateObj - a.dateObj);
  };

  const fetchData = (idFromUrl: string) => {
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
  const changeMonth = (offset: number) => {
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
    const cats: any = {};
    filteredByMonth.filter(t => t.type?.toUpperCase() === 'KELUAR').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
    });
    return Object.keys(cats).map(name => ({ name, amount: cats[name] })).sort((a,b) => b.amount - a.amount);
  }, [filteredByMonth]);

  const leakageInfo = useMemo(() => {
    const counts = filteredByMonth.filter(t => t.type === 'KELUAR').reduce((acc: any, curr: any) => {
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

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  const axisFormatter = (num: number) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(num);

  const handleSaveBudget = () => {
    if (userId) localStorage.setItem(`budgetin_budget_${userId}`, String(monthlyBudget));
    setIsSettingBudget(false);
  };

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
      className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl font-bold transition-all group ${activeTab === id ? 'bg-emerald-600 text-white shadow-[0_8px_16px_rgba(16,185,129,0.15)]' : 'text-slate-400 hover:bg-slate-50'}`}
    >
      <div className="shrink-0"><Icon size={20} strokeWidth={2.5} /></div>
      <span className={`text-[12px] whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#FCFCFC] font-sans text-slate-900 overflow-hidden selection:bg-emerald-100">
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[100] bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none lg:relative ${isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} ${isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'}`}
      >
        <div className="h-full flex flex-col p-5 overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:rotate-6 transition-transform shrink-0"><Activity className="text-white" size={20} strokeWidth={3} /></div>
            <div className={`transition-all duration-300 overflow-hidden ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
               <h1 className="text-base font-black tracking-tighter text-slate-900 leading-none uppercase">BudgetIN</h1>
               <Badge color="emerald" variant="soft" className="mt-0.5 text-[7px] font-black uppercase px-1.5 py-0">Versi Pro</Badge>
            </div>
          </div>
          <nav className="flex-1 space-y-1.5">
            <NavItem id="overview" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="ledger" label="Mutasi" icon={History} />
            <NavItem id="zakat" label="Kalkulator" icon={Calculator} />
            <div className="h-[1px] bg-slate-50 my-3 mx-2"></div>
            <NavItem id="settings" label="Pengaturan" icon={Settings} />
          </nav>
          <div className="pt-6 border-t border-slate-50">
            <button className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-2 text-slate-300 hover:text-rose-500 transition-colors"><LogOut size={18} strokeWidth={2.5}/></button>
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
             <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-lg border border-slate-100 text-slate-500"><Menu size={18}/></button>
             <Badge color="rose" variant="soft" className="hidden sm:flex px-2.5 py-0.5 font-bold text-[7px] uppercase tracking-widest rounded-full border border-rose-50">38 Kredit Tersisa</Badge>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && <Badge color="amber" icon={Sparkles} className="font-bold px-2.5 py-0.5 rounded-full text-[7px]">Demo</Badge>}
            <button onClick={() => userId && fetchData(userId)} className="p-2 bg-white hover:bg-emerald-50 rounded-xl shadow-sm ring-1 ring-slate-100 text-slate-400 hover:text-emerald-600 active:scale-90 transition-all"><RefreshCcw size={14} strokeWidth={2.5}/></button>
            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-[9px] shadow-md">RA</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-7 custom-scrollbar">
          <div className="max-w-8xl mx-auto flex flex-col xl:flex-row gap-6">
            
            <div className="flex-1 min-w-0 space-y-6">
              {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                  
                  {/* HERO */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-lg border-t border-white ring-1 ring-slate-100/40">
                    <div>
                      <Text className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[8px] mb-1 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Total saldo aktif</Text>
                      <h2 className="text-4xl font-black tracking-tighter text-slate-900 drop-shadow-md">{formatRp(stats.balance)}</h2>
                    </div>
                    <div className="flex items-center bg-slate-50/80 p-1 rounded-xl border border-slate-100">
                      <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><ChevronLeft size={16} strokeWidth={3}/></button>
                      <div className="px-4 text-center min-w-[110px]">
                          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">{viewDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                      </div>
                      <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><ChevronRight size={16} strokeWidth={3}/></button>
                    </div>
                  </div>

                  {/* KPI CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="rounded-3xl border-none shadow-[0_15px_30px_rgba(16,185,129,0.05)] p-6 bg-white ring-1 ring-slate-100 hover:translate-y-[-3px] transition-all">
                      <Flex alignItems="center">
                        <div><Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Pemasukan</Text><Metric className="text-emerald-600 font-black text-2xl tracking-tighter">{formatRp(stats.income)}</Metric></div>
                        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 transform hover:rotate-6 transition-transform"><ArrowUpRight size={20} strokeWidth={3} /></div>
                      </Flex>
                    </Card>
                    <Card className="rounded-3xl border-none shadow-[0_15px_30px_rgba(244,63,94,0.05)] p-6 bg-white ring-1 ring-slate-100 hover:translate-y-[-3px] transition-all">
                      <Flex alignItems="center">
                        <div><Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Pengeluaran</Text><Metric className="text-rose-600 font-black text-2xl tracking-tighter">{formatRp(stats.expense)}</Metric></div>
                        <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-100 transform hover:-rotate-6 transition-transform"><ArrowDownRight size={20} strokeWidth={3} /></div>
                      </Flex>
                    </Card>
                  </div>

                  {/* CHART AREA */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-white ring-1 ring-slate-100/30">
                    <Flex className="mb-6 items-center justify-between">
                        <Title className="font-bold text-slate-900 border-l-4 border-emerald-600 pl-3 text-[10px] tracking-widest leading-none uppercase">Tren harian</Title>
                        <div className="flex bg-slate-50 p-1 rounded-lg ring-1 ring-slate-100 scale-90">
                            <button onClick={() => setIsBarChart(true)} className={`px-4 py-1.5 rounded-md text-[8px] font-bold uppercase ${isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Batang</button>
                            <button onClick={() => setIsBarChart(false)} className={`px-4 py-1.5 rounded-md text-[8px] font-bold uppercase ${!isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Garis</button>
                        </div>
                    </Flex>
                    <div className="h-60">
                       {isBarChart ? (
                          <BarChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={["emerald"]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={60} showGridLines={false} />
                       ) : (
                          <AreaChart className="h-full" data={chartData} index="date" categories={["Pengeluaran"]} colors={["emerald"]} valueFormatter={axisFormatter} showAnimation={true} yAxisWidth={60} curveType="monotone" showGridLines={false} />
                       )}
                    </div>
                  </Card>

                  {/* AI INSIGHTS AREA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-3xl border-none shadow-lg p-7 bg-gradient-to-br from-white to-emerald-50 ring-1 ring-emerald-100 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Zap size={140} /></div>
                        <Title className="font-bold text-slate-900 uppercase text-[9px] tracking-widest flex items-center gap-2 mb-6">
                          <TrendingUp size={16} strokeWidth={2.5} className="text-emerald-600"/> Efisiensi
                        </Title>
                        <div className="space-y-4">
                          <Flex><Text className="font-bold text-emerald-800 text-[9px]">Potensi hemat</Text><Text className="font-black text-emerald-700 text-2xl">24%</Text></Flex>
                          <ProgressBar value={24} color="emerald" className="h-2 rounded-full shadow-inner" />
                        </div>
                        <Text className="mt-8 text-[11px] font-medium text-slate-500 italic border-l-4 border-emerald-500 pl-4 py-1 leading-relaxed">
                             {leakageInfo.count > 1 ? `"Detektor mendeteksi pengeluaran berulang pada kategori ${leakageInfo.name.toLowerCase()}."` : `"Arus kas Anda bulan ini sangat efisien. Pertahankan!"`}
                        </Text>
                    </Card>
                    <Card className="rounded-3xl border-none shadow-lg p-7 bg-slate-900 text-white overflow-hidden relative border-t border-white/5">
                        <div className="absolute -bottom-10 -right-10 opacity-10"><Activity size={180} /></div>
                        <Title className="text-emerald-400 font-bold uppercase text-[9px] tracking-[0.3em] mb-8 leading-none">Batas harian aman</Title>
                        <Metric className="text-white font-black text-4xl tracking-tighter drop-shadow-md">{formatRp(stats.balance / 30).replace('Rp', '').trim()}</Metric>
                        <Text className="text-emerald-100 font-medium text-[9px] mt-6 opacity-60">Estimasi jatah harian agar saldo cukup sampai akhir bulan.</Text>
                    </Card>
                  </div>
                </div>
              )}

              {/* MUTASI TAB */}
              {activeTab === 'ledger' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 overflow-hidden bg-white p-0">
                      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                        <Title className="font-black text-slate-900 text-2xl tracking-tighter">Riwayat Transaksi</Title>
                        <div className="relative w-full md:w-[320px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input type="text" placeholder="Cari..." className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald transition-all outline-none" onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                      </div>
                      <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 sticky top-0 z-10">
                               <tr>
                                  <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-500">Waktu</th>
                                  <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-500">Keterangan</th>
                                  <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-500 text-right">Nominal</th>
                                  <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-500 text-center">Aksi</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {transactions.filter(t => t.desc?.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                                  <tr key={t.id} className="hover:bg-emerald-50/20 transition-all group border-l-4 border-transparent hover:border-emerald-500">
                                     <td className="px-8 py-8 text-[10px] text-slate-400 font-medium uppercase whitespace-nowrap">{t.dateStr}</td>
                                     <td className="px-8 py-8">
                                        <Text className="font-bold text-slate-800 text-sm mb-1">{t.desc || "Manual"}</Text>
                                        <Badge color="emerald" size="xs" variant="solid" className="font-bold text-[7px] uppercase tracking-widest">{t.category}</Badge>
                                     </td>
                                     <td className={`px-8 py-8 text-right font-black text-sm whitespace-nowrap ${t.type === 'MASUK' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {t.type === 'MASUK' ? '+' : '-'}{formatRp(t.amount).replace('Rp', '').trim()}
                                     </td>
                                     <td className="px-8 py-8 text-center">
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
                            </tbody>
                        </table>
                      </div>
                   </Card>
                </div>
              )}

              {/* ZAKAT TAB */}
              {activeTab === 'zakat' && (
                <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto pt-4 space-y-10">
                  <Card className="rounded-[4rem] p-16 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-center shadow-[0_60px_120px_rgba(5,150,105,0.2)] relative overflow-hidden group border-t-2 border-white/20">
                    <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative">
                       <div className="w-22 h-22 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-10 border border-white/20 shadow-2xl rotate-6 transform hover:rotate-0 transition-transform"><Calculator className="text-white" size={44} strokeWidth={2.5}/></div>
                       <Text className="text-emerald-100 font-bold uppercase tracking-[0.5em] text-[9px] mb-4 leading-none">Estimasi kewajiban zakat maal</Text>
                       <Metric className="text-white font-black text-7xl lg:text-8xl mt-8 tracking-tighter drop-shadow-2xl">{formatRp(stats.balance > 0 ? stats.balance * 0.025 : 0)}</Metric>
                       <div className="mt-14 inline-flex items-center gap-5 px-10 py-4 bg-black/30 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl">
                          <Info size={20} className="text-emerald-400" />
                          <div className="text-left"><Text className="text-white text-[11px] font-bold tracking-tight leading-none mb-1 uppercase tracking-widest">Nishab 2026: Rp {(nishabTahunan/1000000).toFixed(1)}Jt</Text><Text className="text-emerald-200 text-[9px] font-medium tracking-tight">Setara 85gr emas @ Rp 1.35jt/gram</Text></div>
                       </div>
                    </div>
                  </Card>
                  <Grid numItemsMd={2} className="gap-8">
                    <Card className="rounded-[3rem] p-12 bg-white ring-1 ring-slate-100 shadow-xl hover:translate-y-[-5px] transition-all">
                        <HeartHandshake className="text-rose-500 mb-6" size={32} strokeWidth={3}/>
                        <Title className="font-black text-slate-800 uppercase text-xs tracking-widest mb-2">Sedekah Ideal (1%)</Title>
                        <Metric className="text-rose-600 font-black text-3xl">{formatRp(stats.balance * 0.01)}</Metric>
                        <Text className="mt-8 text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-[0.15em]">Rekomendasi bulanan penyisihan aset bersih.</Text>
                    </Card>
                    <Card className="rounded-[3rem] p-12 bg-white ring-1 ring-slate-100 shadow-xl hover:translate-y-[-5px] transition-all">
                        <Coins className="text-amber-500 mb-6" size={32} strokeWidth={3}/>
                        <Title className="font-black text-slate-800 uppercase text-xs tracking-widest mb-2">Status Nishab</Title>
                        <div className="mt-6">
                            <Badge color={wajibZakat ? "rose" : "emerald"} variant="solid" size="lg" className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {wajibZakat ? "WAJIB ZAKAT" : "BELUM NISHAB"}
                            </Badge>
                        </div>
                    </Card>
                  </Grid>
                </div>
              )}
            </div>

            {/* --- RIGHT SIDE PANEL --- */}
            <aside className="w-full xl:w-80 space-y-6 shrink-0">
              
              <Card className="rounded-3xl border-none shadow-lg ring-1 ring-slate-100 p-8 bg-white flex flex-col hover:scale-[1.01] transition-all">
                <Title className="font-bold text-[9px] text-slate-400 uppercase tracking-[0.3em] mb-8 border-l-4 border-emerald-600 pl-3 leading-none uppercase">Alokasi dana</Title>
                <DonutChart
                  className="h-56"
                  data={categoryData}
                  category="amount"
                  index="name"
                  valueFormatter={axisFormatter}
                  colors={["emerald-800", "emerald-600", "rose-500", "amber-500", "slate-800"]}
                  showAnimation={true}
                />
                <div className="mt-8 space-y-3">
                  {categoryData.slice(0, 3).map((c, i) => (
                    <Flex key={c.name} className="border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ["#064E3B", "#10B981", "#F43F5E"][i] }}></div>
                         <Text className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[120px] tracking-widest leading-none">{c.name}</Text>
                      </div>
                      <Text className="font-black text-slate-900 text-[10px] tracking-tighter">{formatRp(c.amount)}</Text>
                    </Flex>
                  ))}
                </div>
              </Card>

              <Card className="rounded-3xl border-none shadow-lg ring-1 ring-slate-100 p-8 bg-white overflow-hidden relative">
                <Flex className="mb-8 items-center justify-between">
                   <Title className="text-[9px] font-bold uppercase text-slate-800 tracking-[0.3em] leading-none uppercase">Target anggaran</Title>
                   <button onClick={() => setIsSettingBudget(true)} className="p-2 bg-slate-50 rounded-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Settings size={14}/></button>
                </Flex>
                <div className="space-y-6">
                  <div>
                    <Flex className="mb-3">
                       <Text className="font-bold text-[8px] text-slate-400 uppercase tracking-widest">Pemakaian</Text>
                       <Badge color={totalKeluarBulanTerpilih > monthlyBudget ? "rose" : "emerald"} variant="solid" className="font-bold rounded-lg text-[8px] px-2 py-0.5 shadow-sm">
                          {Math.round((totalKeluarBulanTerpilih / monthlyBudget) * 100)}%
                       </Badge>
                    </Flex>
                    <ProgressBar value={(totalKeluarBulanTerpilih / monthlyBudget) * 100} color={totalKeluarBulanTerpilih > monthlyBudget ? "rose" : "emerald"} className="h-2 rounded-full shadow-inner" />
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
                    <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Limit bulanan</Text>
                    {isSettingBudget ? (
                       <input type="number" defaultValue={monthlyBudget} onBlur={(e) => {setMonthlyBudget(parseInt(e.target.value)); handleSaveBudget();}} className="bg-white border-2 border-emerald-500 rounded-lg px-3 py-1.5 text-base font-bold w-full outline-none" autoFocus />
                    ) : (
                       <Metric className="text-2xl font-black text-slate-800 tracking-tighter drop-shadow-sm">{formatRp(monthlyBudget)}</Metric>
                    )}
                  </div>
                </div>
              </Card>

              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:translate-y-[-3px] transition-all ring-1 ring-white/5">
                <Sparkles className="absolute -right-4 -bottom-4 text-emerald-500 opacity-10 group-hover:scale-125 transition-transform duration-1000" size={140}/>
                <Title className="text-emerald-400 text-[8px] font-bold uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div> Neural Engine
                </Title>
                <Text className="text-white text-[13px] leading-snug font-bold italic tracking-tighter opacity-80">
                  {stats.income > stats.expense ? 
                    "\"Likuiditas operasional sangat baik. Alokasi ke aset produktif disarankan.\"" : 
                    "\"Peringatan: Arus kas defisit. Segera audit pengeluaran sekunder Anda.\""
                  }
                </Text>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FCFCFC; }
        ::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F1F1; border-radius: 20px; }
        .tremor-AreaChart-gridline, .tremor-BarChart-gridline { stroke: #F8FAFC; opacity: 0.2; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: fade-in 0.6s ease-out, slide-up 0.6s ease-out; }
      `}} />
    </div>
  );
}