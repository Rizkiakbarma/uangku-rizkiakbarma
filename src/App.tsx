// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Loader2, Lock, CheckCircle2, LayoutDashboard, History, 
  PieChart as PieChartIcon, Search, Filter, Calendar, RefreshCcw, 
  Trash2, AlertTriangle, Target, BarChart3, LineChart,
  ChevronLeft, ChevronRight, Calculator, Coins, HeartHandshake,
  Wallet, Users, Home, Play, Heart, Smartphone, ShoppingBag, Globe, Coffee
} from 'lucide-react';

/**
 * BudgetIN DASHBOARD PRO (V13.0 - Ultimate)
 * Visualisasi Data Transaksi dari Google Sheets
 * Nama: Rizki Akbar
 */

// 👇 GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT KAMU YANG BARU (YANG BARU DI-DEPLOY) 👇
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxcIbqQiGl1qcyRqmq4JACsKiq2GHb7INdsqbfeki37oknBjk7xrnycoG-5JXn8WvW5zA/exec"; 

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(new Date()); 
  const [isBarChart, setIsBarChart] = useState(true);
  
  const [deleteId, setDeleteId] = useState<number | null>(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(2000000); 
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  const fetchData = (idFromUrl: string) => {
    setLoading(true);
    fetch(`${GAS_API_URL}?userid=${idFromUrl}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          const formattedData = data.data.map((item: any) => {
            const d = new Date(item.date);
            return {
              ...item,
              dateObj: d,
              dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
              dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              month: d.getMonth(),
              year: d.getFullYear()
            };
          });
          // Mengurutkan data: yang terbaru di atas
          formattedData.sort((a: any, b: any) => b.dateObj - a.dateObj || b.id - a.id);
          setTransactions(formattedData);
        } else {
          setError(data.message || "Gagal memuat data dari sistem pusat.");
        }
        setLoading(false);
      })
      .catch(() => { 
        setError("Gagal terhubung ke database. Pastikan URL GAS benar."); 
        setLoading(false); 
      });
  };

  useEffect(() => {
    const idFromUrl = new URLSearchParams(window.location.search).get('userid');
    if (!idFromUrl) { 
      setError("Akses Ditolak. Link tidak valid. Harap buka melalui Bot Telegram."); 
      setLoading(false); 
      return; 
    }
    setUserId(idFromUrl);
    fetchData(idFromUrl);
    
    // Load saved budget from local storage
    const savedBudget = localStorage.getItem(`budgetin_budget_${idFromUrl}`);
    if (savedBudget) setMonthlyBudget(parseInt(savedBudget));
  }, []);

  const handleDelete = async () => {
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

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  // --- PEMROSESAN DATA AMAN ---
  const safeTransactions = transactions || [];
  const filteredByMonth = useMemo(() => safeTransactions.filter(t => t.month === viewDate.getMonth() && t.year === viewDate.getFullYear()), [safeTransactions, viewDate]);
  
  // Saldo Aktif (Keseluruhan Waktu)
  const totalMasukAll = useMemo(() => safeTransactions.filter(t => t.type?.toUpperCase() === 'MASUK').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [safeTransactions]);
  const totalKeluarAll = useMemo(() => safeTransactions.filter(t => t.type?.toUpperCase() === 'KELUAR').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [safeTransactions]);
  const sisaSaldo = totalMasukAll - totalKeluarAll;
  
  // Total Bulan Ini Saja
  const totalKeluarBulanIni = filteredByMonth.filter(t => t.type?.toUpperCase() === 'KELUAR').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalMasukBulanIni = filteredByMonth.filter(t => t.type?.toUpperCase() === 'MASUK').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Data Grafik Garis/Batang (7 Hari Terakhir dari bulan yang dipilih)
  const monthChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(viewDate);
      // Jika viewDate adalah bulan saat ini, hitung mundur dari hari ini. Jika tidak, dari akhir bulan tsb.
      const isCurrentMonth = new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();
      if (isCurrentMonth) {
        d.setDate(new Date().getDate() - i);
      } else {
        d.setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() - i);
      }
      
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayAmount = safeTransactions.filter(t => t.type?.toUpperCase() === 'KELUAR' && t.dateKey === key).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      data.push({ label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), amount: dayAmount });
    }
    return data;
  }, [safeTransactions, viewDate]);

  const maxDaily = Math.max(...monthChartData.map(d => d.amount), 1);
  const budgetPercentage = monthlyBudget > 0 ? (totalKeluarBulanIni / monthlyBudget) * 100 : 0;

  // Data Grafik Pie (Klasifikasi Kategori)
  const catMap: Record<string, number> = {};
  filteredByMonth.filter(t => t.type?.toUpperCase() === 'KELUAR').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount) || 0);
  });
  const colors = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9']; 
  const categories = Object.keys(catMap).map((cat, i) => ({ name: cat, amount: catMap[cat], color: colors[i % colors.length] })).sort((a, b) => b.amount - a.amount);

  // Formatter Uang
  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  const formatShortRp = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'jt';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return String(num || 0);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case 'MAKANAN': return <Coffee className="w-5 h-5 text-orange-500" />;
      case 'KELUARGA': return <Users className="w-5 h-5 text-blue-500" />;
      case 'TEMPAT TINGGAL': return <Home className="w-5 h-5 text-indigo-500" />;
      case 'HIBURAN': return <Play className="w-5 h-5 text-rose-500" />;
      case 'SEDEKAH/ZAKAT': return <Heart className="w-5 h-5 text-emerald-500" />;
      case 'INTERNET': return <Smartphone className="w-5 h-5 text-sky-500" />;
      case 'BELANJA': return <ShoppingBag className="w-5 h-5 text-pink-500" />;
      case 'TRANSPORTASI': return <Globe className="w-5 h-5 text-amber-500" />;
      default: return <Wallet className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleSaveBudget = () => {
    if (userId) localStorage.setItem(`budgetin_budget_${userId}`, String(monthlyBudget));
    setIsSettingBudget(false);
  }

  // --- LOGIKA ZAKAT MAAL ---
  const nishabTahunan = 85 * 1300000; // Asumsi harga emas 1.3 juta/gram
  const wajibZakat = sisaSaldo >= nishabTahunan;

  // --- RENDER SCREEN ---
  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-emerald-600 font-sans"><Loader2 className="animate-spin w-10 h-10 mb-4" /><p className="font-bold uppercase tracking-widest text-xs text-slate-400">Menyiapkan Dashboard...</p></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans"><div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-50 max-w-md w-full"><Lock className="w-16 h-16 text-red-500 mx-auto mb-6" /><h2 className="text-2xl font-black mb-2">Akses Terkunci</h2><p className="text-slate-500 text-sm mb-8">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-28 selection:bg-emerald-100">
      
      {/* MODAL KONFIRMASI HAPUS */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 scale-in">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-center mb-2">Hapus Transaksi?</h3>
            <p className="text-center text-slate-500 text-sm mb-6">Data ini akan dihapus permanen dari sistem pusat.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Batal</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors flex items-center justify-center">
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR HEADER */}
      <nav className="bg-white px-6 py-5 shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-sm shadow-emerald-200">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">BudgetIN <span className="text-emerald-500">PRO</span></h1>
              <p className="text-slate-400 text-[9px] font-black italic tracking-widest uppercase mt-1">
  Sharia Edition
</p>
            </div>
          </div>
          <button onClick={() => userId && fetchData(userId)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm active:scale-95"><RefreshCcw className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* =========================================
            TAB 1: DASHBOARD UTAMA
        ========================================= */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Filter Bulan */}
            <div className="flex items-center justify-center bg-white p-3 rounded-[2rem] shadow-sm mb-8 border border-slate-100 max-w-xs mx-auto">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600"/></button>
              <div className="flex-1 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Periode Data</p>
                <p className="font-black text-sm text-slate-800 uppercase tracking-tight">{viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-slate-600"/></button>
            </div>

            {/* KARTU RINGKASAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-600 rounded-[2.5rem] p-8 shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Wallet className="w-32 h-32" /></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Saldo Aktif Tersedia</p>
                  <h2 className="text-4xl font-black tracking-tight">{formatRp(sisaSaldo)}</h2>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-blue-500">Pemasukan Bulan Ini</p>
                <h2 className="text-3xl font-black text-slate-900">{formatRp(totalMasukBulanIni)}</h2>
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:border-rose-100 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-rose-500">Pengeluaran Bulan Ini</p>
                <h2 className="text-3xl font-black text-slate-900">{formatRp(totalKeluarBulanIni)}</h2>
              </div>
            </div>

            {/* ANALISIS ANGGARAN (BUDGET) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden transition-all hover:border-emerald-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Target className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Status Anggaran</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target vs Realisasi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Batas Bulanan</p>
                    {isSettingBudget ? 
                      <input 
                        type="number" 
                        value={monthlyBudget} 
                        onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 0)} 
                        className="w-28 bg-transparent text-sm font-black text-emerald-700 outline-none border-b-2 border-emerald-500 font-sans" 
                        autoFocus 
                      /> 
                      : <p className="text-sm font-black text-slate-800">{formatRp(monthlyBudget)}</p>
                    }
                  </div>
                  <button onClick={() => isSettingBudget ? handleSaveBudget() : setIsSettingBudget(true)} className="p-2 bg-white rounded-xl shadow-sm text-emerald-600 hover:scale-105 transition-transform">
                    {isSettingBudget ? <CheckCircle2 className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="relative pt-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                  <span>Terpakai: {formatRp(totalKeluarBulanIni)}</span>
                  <span className={budgetPercentage > 100 ? "text-rose-600" : "text-emerald-600"}>{Math.round(budgetPercentage)}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full shadow-inner ${budgetPercentage > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* AREA GRAFIK (CHARTS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* GRAFIK TREN (Bar/Line) */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 lg:col-span-2 relative transition-all hover:border-emerald-100">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    {isBarChart ? <BarChart3 className="w-5 h-5 text-emerald-600" /> : <LineChart className="w-5 h-5 text-emerald-600" />}
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Tren Harian</h3>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button onClick={() => setIsBarChart(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>BATANG</button>
                    <button onClick={() => setIsBarChart(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isBarChart ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>GARIS</button>
                  </div>
                </div>
                
                <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pb-2 relative">
                  {isBarChart ? monthChartData.map((data, idx) => {
                    const heightPct = maxDaily > 0 ? (data.amount / maxDaily) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                        <span className="text-[9px] font-black text-emerald-600 mb-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-emerald-50 px-2 py-1 rounded-md">{data.amount > 0 ? formatShortRp(data.amount) : '0'}</span>
                        <div className="w-full max-w-[40px] bg-emerald-400/80 rounded-t-xl transition-all duration-700 group-hover:bg-emerald-500" style={{ height: `${Math.max(heightPct, 2)}%` }}></div>
                        <span className="text-[9px] text-slate-400 mt-3 font-bold text-center">{data.label.split(' ')[0]}</span>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full relative">
                      <svg viewBox="0 0 700 250" className="w-full h-full overflow-visible">
                        <path d={`M 0 250 ${monthChartData.map((d, i) => `L ${i * 116} ${250 - (maxDaily > 0 ? (d.amount / maxDaily * 180) : 0)}`).join(' ')} L 696 250 Z`} fill="#d1fae5" opacity="0.4" />
                        <path d={monthChartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 116} ${250 - (maxDaily > 0 ? (d.amount / maxDaily * 180) : 0)}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        {monthChartData.map((d, i) => (
                          <g key={i}>
                            <circle cx={i * 116} cy={250 - (maxDaily > 0 ? (d.amount / maxDaily * 180) : 0)} r="6" fill="#fff" stroke="#10b981" strokeWidth="4" className="hover:r-8 transition-all" />
                            {d.amount > 0 && <text x={i * 116} y={250 - (d.amount / maxDaily * 180) - 15} textAnchor="middle" className="text-[11px] font-black fill-emerald-600 font-sans">{formatShortRp(d.amount)}</text>}
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* GRAFIK PIE (Kategori) */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 transition-all hover:border-emerald-100">
                <div className="flex items-center gap-3 mb-8">
                  <PieChartIcon className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Porsi Kategori</h3>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  {categories.length > 0 ? (
                    <>
                      <div className="relative w-40 h-40 mx-auto mb-8 transform hover:scale-105 transition-transform duration-500">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                          {categories.map((cat, i) => { 
                            const dashArray = totalKeluarBulanIni > 0 ? (cat.amount / totalKeluarBulanIni) * 100 : 0; 
                            const offset = categories.slice(0, i).reduce((sum, c) => sum + (c.amount / totalKeluarBulanIni) * 100, 0); 
                            return (<circle key={cat.name} cx="18" cy="18" r="15.915" fill="transparent" stroke={cat.color} strokeWidth="6" strokeDasharray={`${dashArray} ${100 - dashArray}`} strokeDashoffset={-offset} className="transition-all duration-1000 hover:opacity-80 cursor-pointer" />); 
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Total</p>
                          <p className="text-xs font-black text-slate-900 tracking-tighter mt-1">{formatShortRp(totalKeluarBulanIni)}</p>
                        </div>
                      </div>
                      <div className="space-y-3 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                        {categories.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                              <span className="text-xs font-bold text-slate-600 truncate max-w-[100px] group-hover:text-slate-900 transition-colors">{cat.name}</span>
                            </div>
                            <span className="text-xs font-black text-slate-900">{formatRp(cat.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div className="text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic py-10">Data kosong</div>}
                </div>
              </div>
            </div>

            {/* TABEL MUTASI TRANSAKSI */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 text-emerald-600 rounded-xl border border-slate-100"><History className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Riwayat Mutasi</h3>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari transaksi..." 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {filteredByMonth.filter(t => t.category.toLowerCase().includes(searchQuery.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()))).map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-6 text-slate-400 font-bold text-xs whitespace-nowrap"><Calendar className="w-4 h-4 inline mr-2 opacity-50 text-slate-400" /> {trx.dateStr}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hidden sm:block">
                              {getCategoryIcon(trx.category)}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 capitalize mb-1 text-sm">{trx.desc || "Transaksi"}</p>
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{trx.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className={`px-8 py-6 text-right font-black text-lg whitespace-nowrap ${trx.type?.toUpperCase() === 'MASUK' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {trx.type?.toUpperCase() === 'MASUK' ? '+' : '-'}{formatRp(trx.amount)}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button onClick={() => setDeleteId(trx.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {filteredByMonth.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-16 text-slate-400 font-medium text-sm">Belum ada transaksi di bulan ini.<br/><span className="text-xs opacity-70">Mulai catat dari Bot Telegram Anda.</span></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: ZAKAT & SHARIA CALCULATOR
        ========================================= */}
        {activeTab === 'zakat' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="bg-emerald-600 text-white rounded-[3rem] p-10 shadow-xl shadow-emerald-200/50 mb-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 text-center">
                <Calculator className="w-12 h-12 mx-auto mb-6 text-emerald-100" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Kalkulator Zakat Maal</h2>
                <div className="my-8 h-[1px] bg-emerald-500/50"></div>
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-4">Potensi Zakat (2.5% dari Saldo Aktif)</p>
                <h2 className="text-5xl font-black tracking-tighter mb-6">{formatRp(sisaSaldo > 0 ? sisaSaldo * 0.025 : 0)}</h2>
                
                <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black border backdrop-blur-sm ${wajibZakat ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'bg-white/10 border-white/20 text-white'}`}>
                  {wajibZakat ? '⚠️ PERHATIAN: ANDA SUDAH MENCAPAI NISHAB' : '✅ BELUM MENCAPAI NISHAB EMAS'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-100 transition-all">
                <HeartHandshake className="w-8 h-8 text-rose-500 mb-4 bg-rose-50 p-1.5 rounded-xl" />
                <h3 className="font-black text-sm uppercase mb-2 text-slate-800">Sedekah Ideal (1%)</h3>
                <p className="text-3xl font-black text-slate-900">{formatRp(sisaSaldo > 0 ? sisaSaldo * 0.01 : 0)}</p>
                <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-widest leading-relaxed">Rekomendasi disisihkan dari saldo aktif saat ini</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all">
                <Coins className="w-8 h-8 text-amber-500 mb-4 bg-amber-50 p-1.5 rounded-xl" />
                <h3 className="font-black text-sm uppercase mb-2 text-slate-800">Batas Nishab Emas</h3>
                <p className="text-2xl font-black text-slate-900 mt-2">{formatRp(nishabTahunan)}</p>
                <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-widest leading-relaxed">Asumsi 85gr Emas<br/>Harga: Rp 1.300.000/gram</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =========================================
            BOTTOM NAVIGATION BAR (MOBILE-FRIENDLY)
      ========================================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-around items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] pb-safe">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
        </button>
        <div className="w-[1px] h-6 bg-slate-200"></div>
        <button onClick={() => setActiveTab('zakat')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'zakat' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}>
          <Calculator className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Zakat</span>
        </button>
      </div>

      {/* STYLES UNTUK SCROLLBAR & ANIMASI */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; } 
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } 
        .scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
      ` }} />
    </div>
  );
}
