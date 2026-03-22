/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Loader2, 
  Lock, 
  CheckCircle2, 
  LayoutDashboard, 
  History, 
  PieChart as PieChartIcon, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCcw, 
  Trash2, 
  AlertTriangle, 
  Target,
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  BarChart3, 
  LineChart
} from 'lucide-react';

/**
 * UANGKU PRO - VERCEL DEPLOYMENT VERSION
 * Fitur: Multi-User, Grafik Merah Rose, Target Anggaran, Anti-Error Build.
 */

export default function App() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isBarChart, setIsBarChart] = useState(true); 
  
  const [deleteId, setDeleteId] = useState<number | null>(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(2000000); 
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  // URL API Google Apps Script Anda
  const API_URL = "https://script.google.com/macros/s/AKfycbyslKsTua7BE8pwmFh1xfRZn7QhfQMSKbGYvY3nAxx6qu41iRXJLBK-z8AsKVSd2_g1ng/exec"; 

  const fetchData = (idFromUrl: string) => {
    setLoading(true);
    const fetchUrl = `${API_URL}${API_URL.includes('?') ? '&' : '?'}userid=${idFromUrl}`;

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const formattedData = data.data.map((item: any) => {
            const d = new Date(item.date);
            const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return {
              ...item,
              dateObj: d,
              dateKey: dateKey,
              dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            };
          });
          formattedData.sort((a: any, b: any) => b.dateObj - a.dateObj || b.id - a.id);
          setTransactions(formattedData);
        } else {
          setError(data.message || "Gagal sinkronisasi data.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Koneksi gagal. Cek Deployment Google Script Anda.");
        setLoading(false);
      });
  };

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const idFromUrl = searchParams.get('userid');
    if (!idFromUrl) {
      setError("Akses Ditolak: Gunakan link dari Bot Telegram.");
      setLoading(false);
      return;
    }
    setUserId(idFromUrl);
    fetchData(idFromUrl);
    const savedBudget = localStorage.getItem(`uangku_budget_${idFromUrl}`);
    if (savedBudget) setMonthlyBudget(parseInt(savedBudget));
  }, []);

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const formatShortRp = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'jt';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'rb';
    return num.toString();
  };

  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => t.dateObj.getMonth() === now.getMonth() && t.dateObj.getFullYear() === now.getFullYear());
  const totalMasukBulanIni = currentMonthTransactions.filter(t => t.type?.toLowerCase() === 'masuk').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalKeluarBulanIni = currentMonthTransactions.filter(t => t.type?.toLowerCase() === 'keluar').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalMasukAll = transactions.filter(t => t.type?.toLowerCase() === 'masuk').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalKeluarAll = transactions.filter(t => t.type?.toLowerCase() === 'keluar').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const sisaSaldo = totalMasukAll - totalKeluarAll;

  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const dayAmount = transactions.filter(t => t.type?.toLowerCase() === 'keluar' && t.dateKey === key).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      data.push({ label, amount: dayAmount });
    }
    return data;
  }, [transactions]);

  const maxDaily = Math.max(...last7DaysData.map(d => d.amount), 1);
  const budgetPercentage = monthlyBudget > 0 ? (totalKeluarBulanIni / monthlyBudget) * 100 : 0;

  const catMap: any = {};
  transactions.filter(t => t.type?.toLowerCase() === 'keluar').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount) || 0);
  });
  const colors = ['#e11d48', '#fb7185', '#f43f5e', '#be123c', '#9f1239']; 
  const categories = Object.keys(catMap).map((cat, i) => ({ name: cat, amount: catMap[cat], color: colors[i % colors.length] })).sort((a: any, b: any) => b.amount - a.amount);
  const totalCategoryAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  const leakageItems: any = currentMonthTransactions.filter(t => t.type?.toLowerCase() === 'keluar').reduce((acc: any, curr: any) => {
    const key = curr.category; if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count += 1; acc[key].total += curr.amount; return acc;
  }, {});
  
  const leakageList = Object.keys(leakageItems).map(key => ({ name: key, ...leakageItems[key] })).sort((a, b) => b.count - a.count);
  const mostFrequentLeak = leakageList.length > 0 ? leakageList[0] : null;

  const handleSaveBudget = () => {
    localStorage.setItem(`uangku_budget_${userId}`, monthlyBudget.toString());
    setIsSettingBudget(false);
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-emerald-600 font-sans"><Loader2 className="w-12 h-12 animate-spin mb-4" /><p className="font-bold uppercase tracking-widest text-[10px]">Sinkronisasi UANGKU...</p></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans"><div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-50 max-w-md w-full text-center"><Lock className="w-16 h-16 text-red-500 mx-auto mb-6" /><h2 className="text-2xl font-black mb-2">Akses Terkunci</h2><p className="text-slate-500 text-sm mb-8 leading-relaxed">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-center mb-2 text-slate-900">Hapus Transaksi?</h3>
            <p className="text-sm text-slate-500 text-center mb-8 font-medium font-sans">Data di Google Sheets akan terhapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold transition-colors">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg transition-colors">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-emerald-900 text-white px-6 py-6 shadow-2xl sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Activity className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-black tracking-tighter leading-none uppercase">UANGKU</h1>
        </div>
        <button onClick={() => userId && fetchData(userId)} className="p-3 bg-emerald-800/50 rounded-2xl transition-all active:scale-95"><RefreshCcw className="w-5 h-5" /></button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Saldo</p>
            <h2 className="text-4xl font-black text-emerald-900 tracking-tight">{formatRp(sisaSaldo)}</h2>
            <div className="mt-6 flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-4 py-1.5 rounded-full text-[10px] font-black">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ACCOUNT
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:border-blue-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-blue-600">Inflow Bulan Ini</p><h2 className="text-2xl font-black text-blue-700 tracking-tight">{formatRp(totalMasukBulanIni)}</h2></div>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:border-rose-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-rose-600">Outflow Bulan Ini</p><h2 className="text-2xl font-black text-rose-700 tracking-tight">{formatRp(totalKeluarBulanIni)}</h2></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-10 relative overflow-hidden transition-all hover:border-emerald-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-100 text-emerald-700 rounded-3xl shadow-inner"><Target className="w-7 h-7" /></div>
              <div><h3 className="text-xl font-black text-slate-900 tracking-tight">Analisis Anggaran</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Periode {now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p></div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Anda</p>
                {isSettingBudget ? <input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(parseInt(e.target.value))} className="w-28 bg-transparent text-sm font-black text-emerald-700 outline-none border-b-2 border-emerald-500 font-sans" autoFocus /> : <p className="text-sm font-black text-slate-800">{formatRp(monthlyBudget)}</p>}
              </div>
              <button onClick={() => isSettingBudget ? handleSaveBudget() : setIsSettingBudget(true)} className="p-2.5 bg-white rounded-xl shadow-sm text-emerald-600 hover:text-emerald-700 transition-all hover:scale-110">{isSettingBudget ? <CheckCircle2 className="w-5 h-5" /> : <Filter className="w-5 h-5" />}</button>
            </div>
          </div>
          <div className="relative pt-2"><div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest"><span>Terpakai: {formatRp(totalKeluarBulanIni)}</span><span className={budgetPercentage > 100 ? "text-rose-600" : "text-emerald-600"}>{Math.round(budgetPercentage)}%</span></div>
            <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50"><div className={`h-full transition-all duration-1000 ease-out rounded-full shadow-lg ${budgetPercentage > 100 ? 'bg-rose-600' : 'bg-emerald-500'}`} style={{ width: `${Math.min(budgetPercentage, 100)}%` }}></div></div>
            {budgetPercentage > 100 && <div className="mt-6 flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-pulse"><AlertTriangle className="w-5 h-5 shrink-0" /><p className="text-xs font-bold leading-tight">Waspada! Anda telah melewati batas anggaran bulanan!</p></div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 lg:col-span-2 relative transition-all hover:border-emerald-100">
            <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-3">{isBarChart ? <BarChart3 className="w-6 h-6 text-rose-600" /> : <LineChart className="w-6 h-6 text-rose-600" />}<h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Tren Pengeluaran</h3></div><div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200"><button onClick={() => setIsBarChart(true)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isBarChart ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>BATANG</button><button onClick={() => setIsBarChart(false)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isBarChart ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>GARIS</button></div></div>
            <div className="h-72 flex items-end justify-between gap-4 pb-4 relative">
              {isBarChart ? last7DaysData.map((data, idx) => {
                const heightPct = (data.amount / maxDaily) * 100;
                return (<div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end"><span className="text-[9px] font-black text-rose-600 mb-2 whitespace-nowrap font-sans">{data.amount > 0 ? formatShortRp(data.amount) : ''}</span><div className="w-full max-w-[45px] bg-rose-600 rounded-2xl transition-all duration-700 shadow-md" style={{ height: `${Math.max(heightPct, 5)}%` }}></div><span className="text-[9px] text-slate-400 mt-4 font-black uppercase tracking-tighter text-center">{data.label}</span></div>);
              }) : (
                <div className="w-full h-full relative"><svg viewBox="0 0 700 250" className="w-full h-full overflow-visible"><path d={`M 0 250 ${last7DaysData.map((d, i) => `L ${i * 116} ${250 - (d.amount / maxDaily * 180)}`).join(' ')} L 696 250 Z`} fill="#fecdd3" opacity="0.4" /><path d={last7DaysData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 116} ${250 - (d.amount / maxDaily * 180)}`).join(' ')} fill="none" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    {last7DaysData.map((d, i) => (<g key={i}><circle cx={i * 116} cy={250 - (d.amount / maxDaily * 180)} r="7" fill="#fff" stroke="#e11d48" strokeWidth="4" />{d.amount > 0 && <text x={i * 116} y={250 - (d.amount / maxDaily * 180) - 15} textAnchor="middle" className="text-[11px] font-black fill-rose-600 font-sans">{formatShortRp(d.amount)}</text>}</g>))}
                  </svg>
                  <div className="flex justify-between mt-6 px-2">{last7DaysData.map((d, i) => <span key={i} className="text-[10px] text-slate-400 font-black uppercase">{d.label}</span>)}</div>
                </div>)}
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 transition-all hover:border-emerald-100"><div className="flex items-center gap-3 mb-10"><PieChartIcon className="w-6 h-6 text-rose-600" /><h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Klasifikasi</h3></div><div className="flex-1 flex flex-col justify-center">{categories.length > 0 ? (<><div className="relative w-52 h-52 mx-auto mb-10 transform hover:scale-105 transition-transform duration-500"><svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      {categories.map((cat, i) => { const dashArray = (cat.amount / totalCategoryAmount) * 100; const offset = categories.slice(0, i).reduce((sum, c) => sum + (c.amount / totalCategoryAmount) * 100, 0); return (<circle key={cat.name} cx="18" cy="18" r="15.915" fill="transparent" stroke={cat.color} strokeWidth="4.5" strokeDasharray={`${dashArray} ${100 - dashArray}`} strokeDashoffset={-offset} className="transition-all duration-1000" />); })}
                    </svg><div className="absolute inset-0 flex flex-col items-center justify-center text-center"><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Total</p><p className="text-sm font-black text-rose-600 tracking-tighter mt-1 font-sans">Rp {Math.round(totalCategoryAmount/1000)}k</p></div></div>
                  <div className="space-y-4 overflow-y-auto max-h-40 pr-3 custom-scrollbar">{categories.map((cat, idx) => (<div key={idx} className="flex items-center justify-between group"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div><span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{cat.name}</span></div><span className="text-xs font-black text-slate-900 font-sans">{formatRp(cat.amount)}</span></div>))}</div></>) : <div className="text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic py-10">Data Kosong</div>}</div></div>
        </div>

        {mostFrequentLeak && mostFrequentLeak.count > 3 && <div className="bg-rose-900 text-white rounded-[2.5rem] p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-rose-900/20"><div className="flex items-center gap-6"><div className="p-5 bg-rose-400/20 rounded-3xl"><Zap className="w-10 h-10 text-rose-400" /></div><div><h3 className="text-2xl font-black tracking-tight leading-none">Detektor Kebocoran Halus</h3><p className="text-rose-200 text-sm font-medium mt-2">Anda sudah melakukan transaksi di kategori <span className="font-black text-white uppercase">{mostFrequentLeak.name}</span> sebanyak {mostFrequentLeak.count}x bulan ini.</p></div></div><div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center md:text-right"><p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Total Pengeluaran</p><p className="text-2xl font-black font-sans">{formatRp(mostFrequentLeak.total)}</p></div></div>}

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-900/5">
          <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/30"><div className="flex items-center gap-4"><div className="p-4 bg-emerald-100 text-emerald-700 rounded-3xl shadow-sm"><History className="w-7 h-7" /></div><h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Mutasi Rekening</h3></div><div className="relative w-full md:w-96"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Cari..." className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none font-sans" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar"><table className="w-full text-left text-sm"><thead className="bg-white text-slate-400 sticky top-0 z-10 shadow-sm border-b border-slate-100"><tr><th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Timestamp</th><th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Rincian & Kategori</th><th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Nominal</th><th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Aksi</th></tr></thead><tbody className="divide-y divide-slate-50 font-sans">
                {transactions.filter(t => t.category.toLowerCase().includes(searchQuery.toLowerCase()) || (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()))).map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-all group"><td className="px-10 py-10 text-slate-400 font-bold text-xs whitespace-nowrap flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {trx.dateStr}</td><td className="px-10 py-10"><p className="font-black text-slate-900 capitalize mb-3 text-base group-hover:text-emerald-700 transition-colors">{trx.desc || 'Transaksi'}</p><div className="flex gap-2"><span className="text-[9px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-slate-200/50">{trx.category}</span><span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border ${trx.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{trx.status || 'Verified'}</span></div></td><td className={`px-10 py-10 text-right font-black text-xl whitespace-nowrap ${trx.type?.toLowerCase() === 'masuk' ? 'text-emerald-600' : 'text-slate-900'}`}>{trx.type?.toLowerCase() === 'masuk' ? '+' : '-'}{formatRp(trx.amount)}</td><td className="px-10 py-10 text-center"><button onClick={() => setDeleteId(trx.id)} className="p-3 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110"><Trash2 className="w-5 h-5" /></button></td></tr>
                ))}
              </tbody></table></div>
        </div>

        <footer className="mt-24 flex flex-col md:flex-row justify-between items-center gap-8 px-6 border-t border-slate-200 pt-12">
          <div className="flex items-center gap-5 text-slate-400"><div><p className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by UangKu Rizkiakbarma</p><p className="text-[9px] font-bold mt-1.5 uppercase tracking-tight text-slate-300">Sistem Manajemen Keuangan v8.6 PRO Stable</p></div></div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; } @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }` }} />
    </div>
  );
}
