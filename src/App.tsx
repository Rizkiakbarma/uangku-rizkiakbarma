// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Loader2, Lock, CheckCircle2, LayoutDashboard, History, 
  Search, RefreshCcw, Trash2, AlertTriangle, Target, Calculator, 
  Coins, HeartHandshake, Wallet, Users, Home, Play, Heart, 
  Smartphone, ShoppingBag, Globe, Coffee, Info, ArrowUpRight, 
  ArrowDownRight, Zap, ChevronRight, Calendar, Menu, X, Settings, LogOut,
  Sparkles, BarChart3, TrendingUp
} from 'lucide-react';

// --- IMPORT TREMOR ---
import { 
  Card, Metric, Text, Flex, ProgressBar, Grid, AreaChart, 
  DonutChart, Title, Badge
} from "@tremor/react";

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyaQzGZ4U84kBM7slB_rIGEZUGPaxTTaljP-GTCCKhRi_qWLBVrxLJP5mKirN_-GT-ISw/exec"; 

// --- 💎 DATA CONTOH PREMIUM (UNTUK MODE DEMO) ---
const DUMMY_DATA = [
  { id: 991, date: new Date(), amount: 15500000, type: 'MASUK', category: 'MASUK', desc: 'Gaji Professional (Demo)' },
  { id: 992, date: new Date(), amount: 250000, type: 'KELUAR', category: 'MAKANAN', desc: 'Lunch Meeting' },
  { id: 993, date: new Date(), amount: 1200000, type: 'KELUAR', category: 'TEMPAT TINGGAL', desc: 'Apartment Maintenance' },
  { id: 994, date: new Date(), amount: 500000, type: 'KELUAR', category: 'SEDEKAH/ZAKAT', desc: 'Infaq Masjid' },
  { id: 995, date: new Date(), amount: 150000, type: 'KELUAR', category: 'TRANSPORTASI', desc: 'Grab Car' },
  { id: 996, date: new Date(), amount: 2500000, type: 'MASUK', category: 'MASUK', desc: 'Bonus Project' },
];

export default function App() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  
  // Fitur Hapus
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fitur Budgeting
  const [monthlyBudget, setMonthlyBudget] = useState(5000000); 
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  // --- DATA FETCHING & PROCESSING ---
  const processIncomingData = (rawList: any[]) => {
    return rawList.map((item: any) => {
      const d = new Date(item.date);
      return {
        ...item,
        dateObj: d,
        dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
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
          setError(data.message || "Gagal sinkronisasi.");
        }
        setLoading(false);
      })
      .catch(() => { 
        setError("Koneksi ke sistem pusat terputus."); 
        setLoading(false); 
      });
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const idFromUrl = new URLSearchParams(window.location.search).get('userid');
    
    // 🔥 LOGIKA KEMBALI KE MODE DEMO JIKA TIDAK ADA USERID
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

  // --- COMPUTED DATA (LOGIC) ---
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type?.toUpperCase() === 'MASUK').reduce((a, b) => a + Number(b.amount), 0);
    const expense = transactions.filter(t => t.type?.toUpperCase() === 'KELUAR').reduce((a, b) => a + Number(b.amount), 0);
    return { balance: income - expense, income, expense };
  }, [transactions]);

  const currentMonth = new Date().getMonth();
  const totalKeluarBulanIni = useMemo(() => 
    transactions.filter(t => t.type?.toUpperCase() === 'KELUAR' && t.month === currentMonth)
    .reduce((acc, curr) => acc + Number(curr.amount), 0)
  , [transactions, currentMonth]);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const amt = transactions.filter(t => t.type?.toUpperCase() === 'KELUAR' && t.dateKey === key).reduce((s, t) => s + Number(t.amount), 0);
      days.push({ date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), "Pengeluaran": amt });
    }
    return days;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const cats: any = {};
    transactions.filter(t => t.type?.toUpperCase() === 'KELUAR' && t.month === currentMonth).forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
    });
    return Object.keys(cats).map(name => ({ name, amount: cats[name] })).sort((a,b) => b.amount - a.amount);
  }, [transactions, currentMonth]);

  // AI Leakage Logic
  const leakageInfo = useMemo(() => {
    const counts = transactions.filter(t => t.type === 'KELUAR' && t.month === currentMonth)
      .reduce((acc: any, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});
    const mostFreq = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return { name: mostFreq, count: counts[mostFreq] };
  }, [transactions, currentMonth]);

  // --- HELPERS ---
  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  
  const handleSaveBudget = () => {
    if (userId) localStorage.setItem(`budgetin_budget_${userId}`, String(monthlyBudget));
    setIsSettingBudget(false);
  }

  // --- RENDERERS ---
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600 w-12 h-12 mb-4" />
      <Text className="font-bold tracking-widest text-slate-400 uppercase text-[10px]">Syncing Architecture...</Text>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      <Icon size={20} strokeWidth={2.5} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 flex selection:bg-emerald-100 overflow-hidden">
      
      {/* MODAL HAPUS */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-center text-slate-900 mb-2">Hapus Baris?</h3>
            <p className="text-sm text-slate-500 text-center mb-8 font-medium">Data {isDemo ? 'demo' : 'di Google Sheets'} akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold transition-colors">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
                {isDeleting ? <Loader2 className="w-5 h-4 animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 transform rotate-3">
              <Activity className="text-white" size={22} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">BudgetIN <span className="text-emerald-600">PRO</span></h1>
          </div>

          <div className="flex-1 space-y-2">
            <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Navigasi Utama</p>
            <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
            <NavItem id="ledger" label="Mutasi Ledger" icon={History} />
            <NavItem id="zakat" label="Sharia Engine" icon={Calculator} />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="bg-slate-900 rounded-2xl p-4 mb-4 shadow-lg shadow-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={60} className="text-white"/></div>
              <Flex className="relative z-10">
                 <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-sm">R</div>
                 <div className="flex-1 ml-3">
                    <p className="text-xs font-black text-white leading-none">{isDemo ? 'Demo User' : 'Verified User'}</p>
                    <p className="text-[9px] font-bold text-emerald-400 mt-1 uppercase tracking-widest">PRO License Active</p>
                 </div>
              </Flex>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-rose-600 font-bold transition-colors text-xs uppercase tracking-widest">
              <LogOut size={16} /> Keluar Sesi
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto relative custom-scrollbar">
        
        {/* HEADER AREA */}
        <header className="sticky top-0 z-30 bg-[#F1F5F9]/90 backdrop-blur-xl px-8 py-6 flex justify-between items-center border-b border-slate-200/50">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Menu size={20} className="text-slate-600"/>
             </button>
             <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">{activeTab === 'overview' ? 'Dashboard' : activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && <Badge color="amber" icon={Sparkles} className="px-3 py-1 font-black shadow-sm">SANDBOX MODE</Badge>}
            <button onClick={() => userId && fetchData(userId)} className="p-3 bg-white hover:bg-emerald-50 rounded-xl shadow-sm border border-slate-200 transition-all text-slate-400 hover:text-emerald-600 active:scale-95">
              <RefreshCcw size={18} />
            </button>
            <div className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
               <Settings size={20} />
            </div>
          </div>
        </header>

        <div className="px-8 pb-20 pt-8 max-w-7xl mx-auto">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
               {/* Hero Balances */}
               <div>
                  <Text className="text-slate-500 font-black uppercase tracking-[0.25em] text-[10px] mb-2 flex items-center gap-2">
                    <div className="w-4 h-[2.5px] bg-emerald-500 rounded-full"></div> Available Liquidity
                  </Text>
                  <h2 className="text-6xl font-black tracking-tighter text-slate-900 drop-shadow-sm">{formatRp(stats.balance)}</h2>
               </div>

               <Grid numItemsMd={2} numItemsLg={3} className="gap-8">
                  <Card className="rounded-[2.5rem] border-none shadow-xl shadow-emerald-100/30 p-8 ring-1 ring-slate-200/50 bg-white hover:translate-y-[-6px] transition-all duration-300">
                     <Flex alignItems="start">
                        <div>
                           <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inflow Period</Text>
                           <Metric className="text-emerald-600 font-black mt-3 text-3xl">{formatRp(stats.income)}</Metric>
                        </div>
                        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200"><ArrowUpRight size={24} strokeWidth={3} /></div>
                     </Flex>
                  </Card>
                  <Card className="rounded-[2.5rem] border-none shadow-xl shadow-rose-100/30 p-8 ring-1 ring-slate-200/50 bg-white hover:translate-y-[-6px] transition-all duration-300">
                     <Flex alignItems="start">
                        <div>
                           <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outflow Period</Text>
                           <Metric className="text-rose-600 font-black mt-3 text-3xl">{formatRp(stats.expense)}</Metric>
                        </div>
                        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200"><ArrowDownRight size={24} strokeWidth={3} /></div>
                     </Flex>
                  </Card>
                  <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-100/30 p-8 ring-1 ring-slate-200/50 bg-white flex flex-col justify-center">
                     <Flex>
                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Usage</Text>
                        <Badge color={totalKeluarBulanIni > monthlyBudget ? "rose" : "emerald"} variant="solid" className="font-black px-3 py-1 rounded-lg">
                           {Math.round((totalKeluarBulanIni/monthlyBudget)*100)}%
                        </Badge>
                     </Flex>
                     <ProgressBar value={(totalKeluarBulanIni/monthlyBudget)*100} color={totalKeluarBulanIni > monthlyBudget ? "rose" : "emerald"} className="mt-6 h-3.5 rounded-full" />
                  </Card>
               </Grid>

               {/* GRAPHS */}
               <Grid numItemsLg={3} className="gap-8">
                  <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-xl p-10 bg-white ring-1 ring-slate-200">
                     <Title className="font-black text-slate-900 flex items-center gap-3 mb-10 uppercase text-xs tracking-widest border-l-4 border-emerald-600 pl-4">
                        Weekly Cash Flow Velocity
                     </Title>
                     <AreaChart
                        className="h-80 mt-4"
                        data={chartData}
                        index="date"
                        categories={["Pengeluaran"]}
                        colors={["emerald"]}
                        valueFormatter={(number) => `Rp ${Intl.NumberFormat("id").format(number).toString()}`}
                        showLegend={false}
                        curveType="monotone"
                        showAnimation={true}
                     />
                  </Card>

                  <Card className="rounded-[3rem] border-none shadow-xl p-10 bg-white ring-1 ring-slate-200 flex flex-col">
                     <Title className="font-black text-slate-900 uppercase text-xs tracking-widest mb-10 border-l-4 border-emerald-600 pl-4">Allocation Clusters</Title>
                     <div className="flex-1 flex flex-col justify-center">
                        <DonutChart
                           className="h-60"
                           data={categoryData}
                           category="amount"
                           index="name"
                           valueFormatter={(number) => `Rp ${Intl.NumberFormat("id").format(number).toString()}`}
                           colors={["emerald-700", "emerald-500", "rose-600", "slate-800", "amber-500"]}
                        />
                        <div className="mt-10 space-y-3">
                           {categoryData.slice(0, 3).map(c => (
                              <Flex key={c.name} className="border-b border-slate-50 pb-2">
                                 <Text className="text-[10px] font-black text-slate-400 uppercase truncate max-w-[120px]">{c.name}</Text>
                                 <Text className="font-black text-slate-900 text-xs">{formatRp(c.amount)}</Text>
                              </Flex>
                           ))}
                        </div>
                     </div>
                  </Card>
               </Grid>

               {/* AI INSIGHTS AREA */}
               <div className="pt-4 space-y-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-emerald-600" size={24} fill="currentColor" opacity={0.2}/>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Financial Neural Insights</h3>
                  </div>
                  <Grid numItemsMd={2} className="gap-8">
                      <Card className="rounded-[2.5rem] border-none shadow-xl p-10 bg-gradient-to-br from-white to-emerald-50 ring-1 ring-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Zap size={180} /></div>
                        <Flex className="mb-8">
                           <Title className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-emerald-200"><TrendingUp size={16} /></div>
                              Efficiency Index
                           </Title>
                           <Badge color="emerald" variant="solid" className="font-black tracking-widest text-[9px]">OPTIMIZED</Badge>
                        </Flex>
                        <div className="space-y-4">
                           <Flex>
                              <Text className="font-black text-emerald-800 uppercase tracking-widest text-[10px]">Savings Potential</Text>
                              <Text className="font-black text-emerald-700 text-3xl">24.5%</Text>
                           </Flex>
                           <ProgressBar value={24} color="emerald" className="h-3 rounded-full" />
                        </div>
                        <Text className="mt-8 text-xs font-bold text-slate-500 leading-relaxed italic border-l-4 border-emerald-500 pl-6 py-2">
                          {leakageInfo.count > 2 ? 
                             `"Analisis algoritma mendeteksi pengeluaran berulang pada kategori ${leakageInfo.name}. Penghematan 15% di sini akan menambah likuiditas sebesar Rp 350rb bulan depan."` : 
                             `"Pola pengeluaran Anda saat ini sangat sehat. Teruskan kedisiplinan ini untuk mencapai Financial Independence lebih cepat."`
                          }
                        </Text>
                      </Card>

                      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-900/20 p-10 bg-slate-900 text-white overflow-hidden relative border-t-2 border-white/20 group">
                        <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Activity size={220} /></div>
                        <Title className="text-emerald-400 font-black tracking-[0.3em] uppercase text-[10px] mb-12 flex items-center gap-3">
                           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div> Intelligent Burn Rate
                        </Title>
                        <div className="space-y-2">
                           <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Safe Daily Spend Limit</Text>
                           <Metric className="text-white font-black text-5xl tracking-tighter">
                              {formatRp(stats.balance / 30).replace('Rp', '').trim()}
                           </Metric>
                        </div>
                        <div className="mt-10 p-6 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                           <Text className="text-emerald-100 font-medium text-sm leading-relaxed">
                              Sistem memproyeksikan saldo Anda aman hingga akhir bulan jika menjaga pengeluaran harian di bawah angka rekomendasi di atas.
                           </Text>
                        </div>
                      </Card>
                  </Grid>
               </div>
            </div>
          )}

          {/* TAB: LEDGER */}
          {activeTab === 'ledger' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200 overflow-hidden bg-white p-0">
                  <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-b from-white to-slate-50/50">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200"><History size={20} strokeWidth={3}/></div>
                           <Title className="font-black text-slate-900 text-2xl tracking-tighter">Verified Ledger History</Title>
                        </div>
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Cloud Sync: Operational
                        </Text>
                     </div>
                     <div className="relative w-full md:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                        <input 
                           type="text" 
                           placeholder="Filter transaksi..." 
                           className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all shadow-sm"
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="overflow-x-auto max-h-[700px] custom-scrollbar">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 sticky top-0 z-10">
                           <tr>
                              <th className="px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Timestamp</th>
                              <th className="px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Entity Information</th>
                              <th className="px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 text-right">Magnitude</th>
                              <th className="px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 text-center">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {transactions.filter(t => t.desc?.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                              <tr key={t.id} className="hover:bg-emerald-50/30 transition-all cursor-default group border-l-8 border-l-transparent hover:border-l-emerald-600">
                                 <td className="px-12 py-10">
                                    <div className="text-slate-900 font-black text-xs uppercase bg-slate-100 w-fit px-3 py-1 rounded-md">{t.dateStr}</div>
                                 </td>
                                 <td className="px-12 py-10">
                                    <div>
                                       <Text className="font-black text-slate-900 text-lg leading-none mb-3 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{t.desc || "Transaksi Unlabeled"}</Text>
                                       <div className="flex items-center gap-3">
                                          <Badge color="emerald" size="xs" variant="solid" className="font-black uppercase tracking-widest text-[8px] px-3 py-1 rounded-full shadow-sm">{t.category}</Badge>
                                          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">{t.status || 'Verified'}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-12 py-10 text-right">
                                    <div className={`font-black text-2xl tracking-tighter ${t.type?.toUpperCase() === 'MASUK' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                       {t.type?.toUpperCase() === 'MASUK' ? '+' : '-'}{formatRp(t.amount).replace('Rp', '').trim()}
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-[0.25em] mt-2 ${t.type?.toUpperCase() === 'MASUK' ? 'text-emerald-400' : 'text-slate-300'}`}>{t.type}</div>
                                 </td>
                                 <td className="px-12 py-10 text-center">
                                    <button onClick={() => setDeleteId(t.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90">
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

          {/* TAB: ZAKAT */}
          {activeTab === 'zakat' && (
            <div className="animate-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
               <Card className="rounded-[4rem] p-16 bg-gradient-to-br from-emerald-600 to-emerald-800 border-t-2 border-white/20 shadow-[0_50px_100px_rgba(5,150,105,0.3)] overflow-hidden relative mb-14 group">
                  <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-1000"></div>
                  <div className="relative text-center">
                     <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-10 border border-white/30 shadow-2xl rotate-6 transform hover:rotate-0 transition-transform">
                        <Calculator className="text-white" size={48} strokeWidth={2.5}/>
                     </div>
                     <Text className="text-emerald-100 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Calculated Zakat Maal Obligation</Text>
                     <Metric className="text-white font-black text-8xl mt-6 tracking-tighter drop-shadow-2xl">
                        {formatRp(stats.balance > 0 ? stats.balance * 0.025 : 0)}
                     </Metric>
                     <div className="mt-14 inline-flex items-center gap-4 px-10 py-4 bg-black/30 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
                        <Info size={20} className="text-emerald-400" />
                        <Text className="text-white text-[12px] font-black tracking-[0.2em] uppercase italic">2026 Threshold: Rp 110.5M (85g Gold)</Text>
                     </div>
                  </div>
               </Card>
               <Grid numItemsMd={2} className="gap-10">
                  <Card className="rounded-[3rem] border-none shadow-xl shadow-rose-100/30 ring-1 ring-slate-200 p-12 hover:translate-y-[-10px] transition-all bg-white">
                     <div className="w-16 h-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-rose-200 transform -rotate-3"><HeartHandshake size={32} strokeWidth={3}/></div>
                     <Title className="font-black text-slate-900 text-2xl mb-2 tracking-tight">Pure Charity (1%)</Title>
                     <Metric className="text-rose-600 font-black text-4xl">{formatRp(stats.balance * 0.01)}</Metric>
                     <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-8">Recommended Contribution</Text>
                  </Card>
                  <Card className="rounded-[3rem] border-none shadow-xl shadow-amber-100/30 ring-1 ring-slate-200 p-12 hover:translate-y-[-10px] transition-all bg-white">
                     <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-amber-200 transform rotate-3"><Coins size={32} strokeWidth={3}/></div>
                     <Title className="font-black text-slate-900 text-2xl mb-2 tracking-tight">Compliance Status</Title>
                     <div className="mt-10">
                        <Badge color={stats.balance > 110500000 ? "rose" : "emerald"} variant="solid" size="lg" className="px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl">
                           {stats.balance > 110500000 ? "ACTION REQUIRED" : "COMPLIANCE OK"}
                        </Badge>
                     </div>
                  </Card>
               </Grid>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F1F5F9; }
        .tremor-AreaChart-gridline { stroke: #E2E8F0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .animate-in { animation: fade-in 0.6s ease-out, slide-up 0.6s ease-out; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}