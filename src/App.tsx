// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Loader2, Lock, CheckCircle2, LayoutDashboard, History, 
  PieChart as PieChartIcon, Search, Filter, Calendar, RefreshCcw, 
  Trash2, AlertTriangle, Target, Zap, BarChart3, LineChart,
  ChevronLeft, ChevronRight, Calculator, Coins, HeartHandshake
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' atau 'zakat'
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [viewDate, setViewDate] = useState(new Date()); 
  const [isBarChart, setIsBarChart] = useState(true);
  
  const [deleteId, setDeleteId] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(2000000); 
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  const API_URL = "https://script.google.com/macros/s/AKfycbyslKsTua7BE8pwmFh1xfRZn7QhfQMSKbGYvY3nAxx6qu41iRXJLBK-z8AsKVSd2_g1ng/exec"; 

  const fetchData = (idFromUrl) => {
    setLoading(true);
    fetch(`${API_URL}?userid=${idFromUrl}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const formattedData = data.data.map((item) => {
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
          formattedData.sort((a, b) => b.dateObj - a.dateObj || b.id - a.id);
          setTransactions(formattedData);
        } else {
          setError(data.message);
        }
        setLoading(false);
      })
      .catch(() => { setError("Koneksi gagal."); setLoading(false); });
  };

  useEffect(() => {
    const idFromUrl = new URLSearchParams(window.location.search).get('userid');
    if (!idFromUrl) { setError("Akses Ditolak."); setLoading(false); return; }
    setUserId(idFromUrl);
    fetchData(idFromUrl);
    const savedBudget = localStorage.getItem(`uangku_budget_${idFromUrl}`);
    if (savedBudget) setMonthlyBudget(parseInt(savedBudget));
  }, []);

  const handleDelete = async () => {
    if (!deleteId || !userId) return;
    setIsDeleting(true);
    const deleteUrl = `${API_URL}${API_URL.includes('?') ? '&' : '?'}userid=${userId}&action=delete&row=${deleteId}`;
    try {
      const response = await fetch(deleteUrl);
      const result = await response.json();
      if (result.status === 'success') {
        setDeleteId(null);
        fetchData(userId); 
      }
    } catch (err) { console.error(err); } finally { setIsDeleting(false); }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  // --- DATA PROCESSING ---
  const filteredByMonth = useMemo(() => transactions.filter(t => t.month === viewDate.getMonth() && t.year === viewDate.getFullYear()), [transactions, viewDate]);
  const totalMasukAll = useMemo(() => transactions.filter(t => t.type?.toLowerCase() === 'masuk').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [transactions]);
  const totalKeluarAll = useMemo(() => transactions.filter(t => t.type?.toLowerCase() === 'keluar').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [transactions]);
  const sisaSaldo = totalMasukAll - totalKeluarAll;
  
  const totalKeluarBulanIni = filteredByMonth.filter(t => t.type?.toLowerCase() === 'keluar').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalMasukBulanIni = filteredByMonth.filter(t => t.type?.toLowerCase() === 'masuk').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const monthChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(viewDate);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const dayAmount = transactions.filter(t => t.type?.toLowerCase() === 'keluar' && t.dateKey === key).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      data.push({ label, amount: dayAmount });
    }
    return data;
  }, [transactions, viewDate]);

  const maxDaily = Math.max(...monthChartData.map(d => d.amount), 1);
  const budgetPercentage = monthlyBudget > 0 ? (totalKeluarBulanIni / monthlyBudget) * 100 : 0;

  const catMap = {};
  filteredByMonth.filter(t => t.type?.toLowerCase() === 'keluar').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount) || 0);
  });
  const colors = ['#e11d48', '#fb7185', '#f43f5e', '#be123c', '#9f1239']; 
  const categories = Object.keys(catMap).map((cat, i) => ({ name: cat, amount: catMap[cat], color: colors[i % colors.length] })).sort((a, b) => b.amount - a.amount);

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  const formatShortRp = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'jt';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'rb';
    return String(num);
  };

  const handleSaveBudget = () => {
    localStorage.setItem(`uangku_budget_${userId}`, String(monthlyBudget));
    setIsSettingBudget(false);
  }

  // --- ZAKAT LOGIC ---
  const nishabTahunan = 85 * 1200000;
  const wajibZakat = sisaSaldo >= nishabTahunan;

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-emerald-600 font-sans"><Loader2 className="animate-spin" /><p className="ml-2 font-bold uppercase tracking-widest text-[10px]">Sync UANGKU...</p></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans"><div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-50 max-w-md w-full"><Lock className="w-16 h-16 text-red-500 mx-auto mb-6" /><h2 className="text-2xl font-black mb-2">Akses Terkunci</h2><p className="text-slate-500 text-sm mb-8">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28">
      {/* MODAL HAPUS (Ditempatkan Global agar Muncul di Mana Saja) */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-center mb-2">Hapus Transaksi?</h3>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg">{isDeleting ? "..." : "Ya"}</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <nav className="bg-emerald-900 text-white px-6 py-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Activity className="w-6 h-6 text-emerald-400" />
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">UANGKU PRO</h1>
              <p className="text-emerald-400 text-[9px] font-black tracking-widest uppercase mt-1 italic">Sharia Edition</p>
            </div>
          </div>
          <button onClick={() => userId && fetchData(userId)} className="p-3 bg-emerald-800/50 rounded-2xl active:scale-95"><RefreshCcw className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* HALAMAN 1: DASHBOARD LENGKAP */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Navigasi Periode */}
            <div className="flex items-center justify-center bg-white p-4 rounded-[2rem] shadow-sm mb-10 border border-slate-100 max-w-sm mx-auto">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft/></button>
              <div className="flex-1 text-center"><p className="text-[10px] font-black uppercase text-slate-400">Periode View</p><p className="font-black text-sm uppercase">{viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p></div>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight/></button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Saldo Aktif</p><h2 className="text-4xl font-black text-emerald-900 tracking-tight">{formatRp(sisaSaldo)}</h2></div>
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 text-blue-600">Inflow {viewDate.toLocaleDateString('id-ID', { month: 'short' })}</p><h2 className="text-2xl font-black text-blue-700">{formatRp(totalMasukBulanIni)}</h2></div>
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"><p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 text-rose-600">Outflow {viewDate.toLocaleDateString('id-ID', { month: 'short' })}</p><h2 className="text-2xl font-black text-rose-700">{formatRp(totalKeluarBulanIni)}</h2></div>
            </div>

            {/* Analisis Anggaran (RESTORED) */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-10 relative overflow-hidden transition-all hover:border-emerald-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4"><div className="p-4 bg-emerald-100 text-emerald-700 rounded-3xl shadow-inner"><Target className="w-7 h-7" /></div><div><h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Analisis Anggaran</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status {viewDate.toLocaleDateString('id-ID', { month: 'long' })}</p></div></div>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Pengeluaran</p>{isSettingBudget ? <input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(parseInt(e.target.value))} className="w-28 bg-transparent text-sm font-black text-emerald-700 outline-none border-b-2 border-emerald-500 font-sans" autoFocus /> : <p className="text-sm font-black text-slate-800">{formatRp(monthlyBudget)}</p>}</div>
                  <button onClick={() => isSettingBudget ? handleSaveBudget() : setIsSettingBudget(true)} className="p-2.5 bg-white rounded-xl shadow-sm text-emerald-600 hover:text-emerald-700 transition-all hover:scale-110">{isSettingBudget ? <CheckCircle2 className="w-5 h-5" /> : <Filter className="w-5 h-5" />}</button>
                </div>
              </div>
              <div className="relative pt-2"><div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest"><span>Terpakai: {formatRp(totalKeluarBulanIni)}</span><span className={budgetPercentage > 100 ? "text-rose-600" : "text-emerald-600"}>{Math.round(budgetPercentage)}%</span></div><div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50"><div className={`h-full transition-all duration-1000 ease-out rounded-full shadow-lg ${budgetPercentage > 100 ? 'bg-rose-600' : 'bg-emerald-500'}`} style={{ width: `${Math.min(budgetPercentage, 100)}%` }}></div></div></div>
            </div>

            {/* Charts Area (RESTORED) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 lg:col-span-2 relative transition-all hover:border-emerald-100">
                <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-3">{isBarChart ? <BarChart3 className="w-6 h-6 text-rose-600" /> : <LineChart className="w-6 h-6 text-rose-600" />}<h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Tren Pengeluaran</h3></div><div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200"><button onClick={() => setIsBarChart(true)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isBarChart ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>BATANG</button><button onClick={() => setIsBarChart(false)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isBarChart ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>GARIS</button></div></div>
                <div className="h-72 flex items-end justify-between gap-4 pb-4 relative">
                  {isBarChart ? monthChartData.map((data, idx) => {
                    const heightPct = (data.amount / maxDaily) * 100;
                    return (<div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end"><span className="text-[9px] font-black text-rose-600 mb-2 whitespace-nowrap font-sans">{data.amount > 0 ? formatShortRp(data.amount) : ''}</span><div className="w-full max-w-[45px] bg-rose-600 rounded-2xl transition-all duration-700 shadow-md" style={{ height: `${Math.max(heightPct, 5)}%` }}></div><span className="text-[9px] text-slate-400 mt-4 font-black text-center">{data.label}</span></div>);
                  }) : (
                    <div className="w-full h-full relative"><svg viewBox="0 0 700 250" className="w-full h-full overflow-visible"><path d={`M 0 250 ${monthChartData.map((d, i) => `L ${i * 116} ${250 - (d.amount / maxDaily * 180)}`).join(' ')} L 696 250 Z`} fill="#fecdd3" opacity="0.4" /><path d={monthChartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 116} ${250 - (d.amount / maxDaily * 180)}`).join(' ')} fill="none" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        {monthChartData.map((d, i) => (<g key={i}><circle cx={i * 116} cy={250 - (d.amount / maxDaily * 180)} r="7" fill="#fff" stroke="#e11d48" strokeWidth="4" />{d.amount > 0 && <text x={i * 116} y={250 - (d.amount / maxDaily * 180) - 15} textAnchor="middle" className="text-[11px] font-black fill-rose-600 font-sans">{formatShortRp(d.amount)}</text>}</g>))}
                      </svg></div>)}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 transition-all hover:border-emerald-100"><div className="flex items-center gap-3 mb-10"><PieChartIcon className="w-6 h-6 text-rose-600" /><h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Klasifikasi</h3></div><div className="flex-1 flex flex-col justify-center">{categories.length > 0 ? (<><div className="relative w-52 h-52 mx-auto mb-10 transform hover:scale-105 transition-transform duration-500"><svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          {categories.map((cat, i) => { const dashArray = (cat.amount / totalKeluarBulanIni) * 100; const offset = categories.slice(0, i).reduce((sum, c) => sum + (c.amount / totalKeluarBulanIni) * 100, 0); return (<circle key={cat.name} cx="18" cy="18" r="15.915" fill="transparent" stroke={cat.color} strokeWidth="4.5" strokeDasharray={`${dashArray} ${100 - dashArray}`} strokeDashoffset={-offset} className="transition-all duration-1000" />); })}
                        </svg><div className="absolute inset-0 flex flex-col items-center justify-center text-center"><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Total</p><p className="text-sm font-black text-rose-600 tracking-tighter mt-1 font-sans">Rp {Math.round(totalKeluarBulanIni/1000)}k</p></div></div>
                      <div className="space-y-4 overflow-y-auto max-h-40 pr-3 custom-scrollbar">{categories.map((cat, idx) => (<div key={idx} className="flex items-center justify-between group"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div><span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{cat.name}</span></div><span className="text-xs font-black text-slate-900 font-sans">{formatRp(cat.amount)}</span></div>))}</div></>) : <div className="text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic py-10">Data Kosong</div>}</div></div>
            </div>

            {/* Mutasi Table with Delete (RESTORED) */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-900/5">
              <div className="p-10 border-b bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8"><div className="flex items-center gap-4"><div className="p-4 bg-emerald-100 text-emerald-700 rounded-3xl shadow-sm"><History className="w-7 h-7" /></div><h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Mutasi {viewDate.toLocaleDateString('id-ID', { month: 'long' })}</h3></div><div className="relative w-full md:w-96"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Cari..." className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold font-sans outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar"><table className="w-full text-left text-sm text-slate-500 font-sans"><tbody className="divide-y divide-slate-50">
                    {filteredByMonth.filter(t => t.category.toLowerCase().includes(searchQuery.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()))).map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50/80 transition-all group"><td className="px-10 py-10 text-slate-400 font-bold text-xs whitespace-nowrap"><Calendar className="w-4 h-4 inline mr-2 opacity-50" /> {trx.dateStr}</td><td className="px-10 py-10"><p className="font-black text-slate-900 capitalize mb-3 text-base group-hover:text-emerald-700 transition-colors">{trx.desc}</p><div className="flex gap-2"><span className="text-[9px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-slate-200/50">{trx.category}</span></div></td><td className={`px-10 py-10 text-right font-black text-xl whitespace-nowrap ${trx.type?.toLowerCase() === 'masuk' ? 'text-emerald-600' : 'text-slate-900'}`}>{trx.type?.toLowerCase() === 'masuk' ? '+' : '-'}{formatRp(trx.amount)}</td><td className="px-10 py-10 text-center"><button onClick={() => setDeleteId(trx.id)} className="p-3 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110"><Trash2 className="w-5 h-5" /></button></td></tr>
                    ))}
                  </tbody></table></div>
            </div>
          </div>
        )}

        {/* HALAMAN 2: ZAKAT CALCULATOR (SHARIA SECTION) */}
        {activeTab === 'zakat' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="bg-emerald-900 text-white rounded-[3rem] p-10 shadow-2xl mb-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
              <div className="relative z-10 text-center">
                <Calculator className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Kalkulator Zakat Maal</h2>
                <div className="my-10 h-[1px] bg-emerald-800"></div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Potensi Zakat (2.5%)</p>
                <h2 className="text-5xl font-black tracking-tighter mb-4">{formatRp(sisaSaldo * 0.025)}</h2>
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black border ${wajibZakat ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/10 border-white/20 text-emerald-400'}`}>
                  {wajibZakat ? '⚠️ SUDAH MENCAPAI NISHAB' : '✅ BELUM MENCAPAI NISHAB'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"><HeartHandshake className="w-6 h-6 text-rose-500 mb-4" /><h3 className="font-black text-sm uppercase mb-2">Sedekah 1%</h3><p className="text-2xl font-black text-slate-900">{formatRp(sisaSaldo * 0.01)}</p></div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"><Coins className="w-6 h-6 text-amber-500 mb-4" /><h3 className="font-black text-sm uppercase mb-2">Nishab Emas</h3><p className="text-sm font-black text-slate-900">{formatRp(nishabTahunan)}</p></div>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-around items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-emerald-700 scale-110' : 'text-slate-300'}`}><LayoutDashboard className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span></button>
        <div className="w-[1px] h-8 bg-slate-100"></div>
        <button onClick={() => setActiveTab('zakat')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'zakat' ? 'text-emerald-700 scale-110' : 'text-slate-300'}`}><Calculator className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Zakat</span></button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; } @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }` }} />
    </div>
  );
}
