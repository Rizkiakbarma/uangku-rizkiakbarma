import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modals from './components/Modals';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Goals from './pages/Goals';
import ZakatCalc from './pages/ZakatCalc';

/** Redirect dari root: jika ada userid → ke /dashboard, jika tidak → ke /landing */
function RootRedirect() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userid');
  return userId
    ? <Navigate to={`/dashboard?userid=${userId}`} replace />
    : <Navigate to="/landing" replace />;
}

/** Layout utama: Sidebar + Header + konten halaman */
function AppLayout() {
  const { t, loading, error } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center text-center p-10`}>
        <Loader2 className={`animate-spin ${t.primaryText} w-12 h-12 mb-6`} />
        <p className={`font-bold tracking-widest ${t.textSub} uppercase text-[10px]`}>
          Sinkronisasi Database BUDGETIN...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center text-center p-10`}>
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-rose-400 font-black text-xl mb-2 tracking-tight">Gagal Memuat Data</p>
        <p className={`text-sm mb-8 max-w-sm leading-relaxed ${t.textSub}`}>{error}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${t.cardBg} ${t.border} ${t.textSub} hover:opacity-80`}
          >
            🔄 Coba Lagi
          </button>
          <button
            onClick={() => window.location.href = '/dashboard?demo=true'}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${t.primary} text-white hover:opacity-80`}
          >
            ✨ Lihat Mode Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-500 ${t.bg} ${t.textMain} ${t.selectionColor}`}>
      {/* Overlay mobile */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] border-r flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none lg:relative w-64 ${t.cardBg} ${t.border} ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
      </aside>

      {/* Konten utama */}
      <main className="flex-1 h-screen overflow-y-auto relative custom-scrollbar flex flex-col">
        <Modals />
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <div className="flex-1 p-5 lg:p-7 max-w-8xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${t.hexBg}; }
        ::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .animate-in { animation: fade-in 0.5s ease-out, slide-up 0.5s ease-out; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}

/** Landing page wrapper — tidak butuh AppProvider data */
function LandingWrapper() {
  return (
    <AppProvider>
      <LandingPage />
    </AppProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/landing" element={<LandingWrapper />} />
        <Route
          element={
            <AppProvider>
              <AppLayout />
            </AppProvider>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/zakat" element={<ZakatCalc />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}