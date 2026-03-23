// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, 
  Clock, AlertCircle, RefreshCw, 
  Home, Users, Coffee, Heart, Globe, Play, Smartphone, ShoppingBag
} from 'lucide-react';

/**
 * BudgetIN DASHBOARD PRO (V13.0)
 * Visualisasi Data Transaksi dari Google Sheets
 * Nama: Rizki Akbar
 */

// 👇 GANTI URL DI BAWAH INI DENGAN URL WEB APP GOOGLE APPS SCRIPT KAMU 👇
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyCqE7lsRGbhTnLWiQwAG0vvHfl2lJbwwAbdYeidbT5GyRJ63yhMSyfPylzJRD_94slrA/exec"; 

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ambil UserID dari URL (/?userid=12345)
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get('userid') || "default";

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${GAS_API_URL}?userid=${userId}`);
      const json = await response.json();
      if (json.status === "success") {
        setData(json.data.reverse()); // Menampilkan data terbaru di urutan teratas
      } else {
        setError(json.message || "Gagal mengambil data dari sistem pusat.");
      }
    } catch (err) {
      setError("Gagal terhubung ke sistem pusat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const stats = {
    income: data.filter(t => t.type === 'MASUK').reduce((acc, curr) => acc + curr.amount, 0),
    expense: data.filter(t => t.type === 'KELUAR').reduce((acc, curr) => acc + curr.amount, 0),
  };

  const getCategoryIcon = (cat) => {
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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Sinkronisasi BudgetIN...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-emerald-100">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">BudgetIN <span className="text-emerald-500">PRO</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem Pusat Keuangan</p>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
             <RefreshCw className="w-5 h-5 text-slate-400 hover:text-emerald-600" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-6">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden">
            <TrendingUp className="w-6 h-6 mb-4 opacity-90" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Pemasukan</p>
            <h2 className="text-xl font-black truncate">Rp {stats.income.toLocaleString('id-ID')}</h2>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <TrendingUp className="w-24 h-24" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <TrendingDown className="w-6 h-6 mb-4 text-rose-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pengeluaran</p>
            <h2 className="text-xl font-black truncate text-slate-900">Rp {stats.expense.toLocaleString('id-ID')}</h2>
          </div>
        </div>

        {/* ERROR MESSAGE (JIKA ADA) */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* RECENT TRANSACTIONS */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Riwayat Transaksi
            </h3>
          </div>

          {data.length === 0 && !error ? (
            <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">Belum ada transaksi di BudgetIN.<br/>Mulai catat dari bot Telegram!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <div key={item.id} className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{item.desc || "Transaksi Manual"}</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase mt-1.5 tracking-wider bg-slate-50 inline-block px-2 py-0.5 rounded-md">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${item.type === 'MASUK' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {item.type === 'MASUK' ? '+' : '-'} {item.amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 mt-1.5">
                      {new Date(item.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center mt-12 px-6">
        <div className="h-[1px] w-12 bg-slate-200 mx-auto mb-4"></div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">BudgetIN Intelligent Engine v13.0</p>
      </footer>
    </div>
  );
};

export default App;
