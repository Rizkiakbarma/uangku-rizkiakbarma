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
  const [deleteId, setDeleteId] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(2000000); 

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
  }, []);

  // --- LOGIKA DATA ---
  const filteredByMonth = useMemo(() => transactions.filter(t => t.month === viewDate.getMonth() && t.year === viewDate.getFullYear()), [transactions, viewDate]);
  const totalMasukAll = useMemo(() => transactions.filter(t => t.type?.toLowerCase() === 'masuk').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [transactions]);
  const totalKeluarAll = useMemo(() => transactions.filter(t => t.type?.toLowerCase() === 'keluar').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [transactions]);
  const sisaSaldo = totalMasukAll - totalKeluarAll;
  
  const totalKeluarBulanIni = filteredByMonth.filter(t => t.type?.toLowerCase() === 'keluar').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalMasukBulanIni = filteredByMonth.filter(t => t.type?.toLowerCase() === 'masuk').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  // --- LOGIKA ZAKAT (SHARIA FEATURE) ---
  const nisabEmas = 85; // gram
  const hargaEmasPerGram = 1200000; // Asumsi harga emas per gram
  const nishabTahunan = nisabEmas * hargaEmasPerGram;
  const wajibZakat = sisaSaldo >= nishabTahunan;
  const jumlahZakat = sisaSaldo * 0.025;

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-emerald-600 font-sans"><Loader2 className="animate-spin" /><p className="ml-2 font-bold uppercase tracking-widest text-[10px]">Sync UANGKU...</p></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans"><div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-50 max-w-md w-full"><Lock className="w-16 h-16 text-red-500 mx-auto mb-6" /><h2 className="text-2xl font-black mb-2">Akses Terkunci</h2><p className="text-slate-500 text-sm mb-8">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28">
      
      {/* HEADER NAVBAR */}
      <nav className="bg-emerald-900 text-white px-6 py-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Activity className="w-6 h-6 text-emerald-400" />
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">UANGKU PRO</h1>
              <p className="text-emerald-400 text-[9px] font-black tracking-widest uppercase mt-1 italic">Sharia Assistant</p>
            </div>
          </div>
          <button onClick={() => userId && fetchData(userId)} className="p-3 bg-emerald-800/50 rounded-2xl active:scale-95"><RefreshCcw className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* HALAMAN 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigasi Bulan */}
            <div className="flex items-center justify-center bg-white p-4 rounded-[2rem] shadow-sm mb-10 border border-slate-100 max-w-sm mx-auto">
              <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); }} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft/></button>
              <div className="flex-1 text-center"><p className="text-[10px] font-black uppercase text-slate-400">Periode</p><p className="font-black text-sm uppercase">{viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p></div>
              <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); }} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Saldo Aktif</p><h2 className="text-4xl font-black text-emerald-900 tracking-tight">{formatRp(sisaSaldo)}</h2></div>
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Inflow</p><h2 className="text-2xl font-black text-blue-700">{formatRp(totalMasukBulanIni)}</h2></div>
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"><p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Outflow</p><h2 className="text-2xl font-black text-rose-700">{formatRp(totalKeluarBulanIni)}</h2></div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center"><h3 className="font-black uppercase tracking-tight">Mutasi Terakhir</h3><Search className="w-5 h-5 text-slate-300"/></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y">
                    {filteredByMonth.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="p-8 text-slate-400 font-bold text-xs">{trx.dateStr}</td>
                        <td className="p-8"><p className="font-black text-slate-900 mb-2 capitalize">{trx.desc}</p><span className="text-[9px] font-black bg-slate-100 px-3 py-1.5 rounded-xl uppercase">{trx.category}</span></td>
                        <td className={`p-8 text-right font-black text-lg ${trx.type?.toLowerCase() === 'masuk' ? 'text-emerald-600' : 'text-slate-900'}`}>{trx.type?.toLowerCase() === 'masuk' ? '+' : '-'}{formatRp(trx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HALAMAN 2: ZAKAT CALCULATOR */}
        {activeTab === 'zakat' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="bg-emerald-900 text-white rounded-[3rem] p-10 shadow-2xl mb-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
              <div className="relative z-10 text-center">
                <Calculator className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Kalkulator Zakat Maal</h2>
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Berdasarkan Saldo Aktif Anda</p>
                <div className="my-10 h-[1px] bg-emerald-800"></div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Potensi Zakat (2.5%)</p>
                <h2 className="text-5xl font-black tracking-tighter mb-4">{formatRp(jumlahZakat)}</h2>
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black border ${wajibZakat ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/10 border-white/20 text-emerald-400'}`}>
                  {wajibZakat ? '⚠️ SUDAH MENCAPAI NISHAB' : '✅ BELUM MENCAPAI NISHAB'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <HeartHandshake className="w-6 h-6 text-rose-500 mb-4" />
                <h3 className="font-black text-sm uppercase mb-2">Sedekah 1%</h3>
                <p className="text-2xl font-black text-slate-900">{formatRp(sisaSaldo * 0.01)}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Rekomendasi hari ini</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <Coins className="w-6 h-6 text-amber-500 mb-4" />
                <h3 className="font-black text-sm uppercase mb-2">Info Nishab</h3>
                <p className="text-sm font-black text-slate-900">{formatRp(nishabTahunan)}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Asumsi 85gr Emas</p>
              </div>
            </div>

            <div className="mt-10 p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
               <p className="text-xs text-blue-700 font-bold leading-relaxed">"Perumpamaan orang-orang yang menafkahkan hartanya di jalan Allah adalah serupa dengan sebutir benih yang menumbuhkan tujuh bulir..." (QS. Al-Baqarah: 261)</p>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-around items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-emerald-700 scale-110' : 'text-slate-300'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
        </button>
        
        <div className="w-[1px] h-8 bg-slate-100"></div>

        <button 
          onClick={() => setActiveTab('zakat')} 
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'zakat' ? 'text-emerald-700 scale-110' : 'text-slate-300'}`}
        >
          <Calculator className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Zakat</span>
        </button>
      </div>

    </div>
  );
}
