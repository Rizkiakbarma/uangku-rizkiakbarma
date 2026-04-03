import React from 'react';
import { Activity, MessageSquare, Calculator, ArrowUpRight, Palette } from 'lucide-react';
import { Badge } from '@tremor/react';
import { useApp } from '../contexts/AppContext';

export default function LandingPage() {
  const { t, toggleTheme, startDemo } = useApp();

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-500 ${t.bg} ${t.textMain} ${t.selectionColor}`}>
      {/* Navbar */}
      <nav className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
          <div className={`${t.primary} p-2.5 rounded-xl shadow-lg`}>
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-black tracking-tighter text-2xl uppercase">
            BudgetIN<span className={t.primaryText}>Pro</span>
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={toggleTheme}
            className={`p-2.5 ${t.cardBg} hover:${t.bgSoft} rounded-xl shadow-sm border ${t.border} ${t.textSub} transition-all`}
            title="Ganti Tema"
          >
            <Palette size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => window.open('https://lynk.id/rizkiakbarma', '_blank')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
          >
            Beli Akses
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto relative z-10">
        <Badge
          className={`mb-8 px-4 py-1.5 font-bold tracking-[0.2em] uppercase text-[10px] animate-pulse border ${t.primaryLight} ${t.primaryText} ${t.border}`}
        >
          ✨ Tersedia Versi 30.1 (MONEY TRACKER ENGINE)
        </Badge>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
          Catat Keuangan <br className="hidden md:block" />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${t.gradientText}`}>
            Semudah Kirim Chat.
          </span>
        </h1>

        <p className={`${t.textSub} text-base md:text-xl mb-12 max-w-2xl font-medium leading-relaxed`}>
          Tinggalkan cara lama mencatat di Excel yang bikin malas. Kirim pengeluaranmu ke Bot Telegram BudgetIN, dan biarkan sistem menyusunnya ke dalam Dashboard Finansial kelas Enterprise secara otomatis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => window.open('https://lynk.id/rizkiakbarma', '_blank')}
            className={`px-8 py-4 ${t.primary} ${t.primaryHover} text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group`}
          >
            Dapatkan Akses Sekarang <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
          <button
            onClick={startDemo}
            className={`px-8 py-4 ${t.cardBg} hover:${t.bgSoft} ${t.textMain} rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm border ${t.border} flex items-center justify-center gap-2`}
          >
            Lihat Demo Dashboard
          </button>
        </div>
      </main>

      {/* Features */}
      <section className={`${t.cardBg} py-24 border-t ${t.border} relative z-10 transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: <MessageSquare strokeWidth={2.5} />,
              title: 'Telegram Bot NLP',
              desc: 'Cukup ketik "Makan siang 25rb", sistem kecerdasan buatan (NLP) kami otomatis mendeteksi nominal dan mengklasifikasikan kategori transaksi tanpa format ribet.',
            },
            {
              icon: <Activity strokeWidth={2.5} />,
              title: 'Live Sync Dashboard',
              desc: 'Dilengkapi dengan visualisasi grafik mewah, sistem target tabungan virtual, dan AI Neural Advisor yang siap me-roasting gaya pengeluaranmu.',
            },
            {
              icon: <Calculator strokeWidth={2.5} />,
              title: 'Sharia Integrated',
              desc: 'Satu-satunya tracker di Indonesia dengan Barakah Score dan kalkulator Zakat Maal otomatis berdasarkan harga emas. Hartamu jadi lebih berkah.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className={`text-center md:text-left ${t.bgSoft} p-8 rounded-[2rem] border ${t.border} transition-all hover:shadow-lg`}>
              <div className={`w-14 h-14 ${t.primaryLight} ${t.primaryText} rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0`}>
                {icon}
              </div>
              <h3 className={`font-black text-xl mb-3 tracking-tight ${t.textMain}`}>{title}</h3>
              <p className={`${t.textSub} text-sm font-medium leading-relaxed`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`${t.darkCardBg} py-10 text-center relative z-10`}>
        <p className={`${t.accentDark} font-bold uppercase tracking-widest text-[10px]`}>
          Made with ❤️ by Rizkiakbarma. © 2026 BudgetIN Pro.
        </p>
      </footer>
    </div>
  );
}
