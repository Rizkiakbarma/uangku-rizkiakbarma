import React from 'react';
import {
  AlertTriangle, Download, Loader2, Target, Trash2, Camera, Activity, Share2, CheckCircle2,
} from 'lucide-react';
import { Card, Text, Metric, Flex, ProgressBar, Badge } from '@tremor/react';
import { useApp } from '../contexts/AppContext';

export default function Modals() {
  const {
    t,
    // Delete transaction
    deleteId, setDeleteId, handleDelete, isDeleting,
    // Delete goal
    deleteGoalData, setDeleteGoalData, executeDeleteGoal, isDeletingGoal,
    // Export
    isExportModalOpen, setIsExportModalOpen, exportMonth, setExportMonth, exportYear, setExportYear, handleExportCSV,
    viewDate,
    // Story
    isStoryModalOpen, setIsStoryModalOpen, isCapturing, handleDownloadStory,
    // Data for story card
    totalKeluarBulanTerpilih, barakahScore, categoryData,
    formatRp,
  } = useApp();

  return (
    <>
      {/* Modal: Hapus Transaksi */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <Card className={`max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 ${t.cardBg}`}>
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className={`text-lg font-bold text-center mb-8 tracking-tight uppercase ${t.textMain}`}>
              Hapus transaksi?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className={`flex-1 py-3 ${t.bgSoft} ${t.textSub} hover:opacity-80 rounded-xl font-bold text-[10px] uppercase transition-all`}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-xl shadow-rose-200 transition-all"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Ya, Hapus'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Hapus Goal */}
      {deleteGoalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <Card className={`max-w-md w-full p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 ${t.cardBg}`}>
            <Target className={`w-12 h-12 ${t.textMain} mx-auto mb-4`} strokeWidth={2} />
            <h3 className={`text-xl font-black text-center mb-2 tracking-tight ${t.textMain}`}>
              HAPUS: {deleteGoalData.goal_name}
            </h3>
            <Text className={`text-center text-xs mb-8 leading-relaxed px-4 ${t.textSub}`}>
              Saat ini ada dana <strong className={t.primaryText}>{formatRp(deleteGoalData.current_amount)}</strong> yang terkumpul. Mau diapain nih uangnya?
            </Text>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => executeDeleteGoal('refund')}
                disabled={isDeletingGoal}
                className={`w-full py-4 ${t.primaryLight} hover:opacity-80 ${t.primaryText} rounded-2xl font-bold text-xs uppercase transition-all flex flex-col items-center gap-1 border ${t.border} shadow-sm`}
              >
                <span>↩️ Batal & Refund Saldo</span>
                <span className="text-[9px] font-medium normal-case">Uang kembali ke Saldo Utama</span>
              </button>
              <button
                onClick={() => executeDeleteGoal('delete_only')}
                disabled={isDeletingGoal}
                className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl font-bold text-xs uppercase transition-all flex flex-col items-center gap-1 border border-rose-200/60 shadow-sm"
              >
                <span>💸 Hapus Saja (Hangus)</span>
                <span className="text-[9px] font-medium normal-case text-rose-500">Target selesai / uang sudah kepakai</span>
              </button>
              <button
                onClick={() => setDeleteGoalData(null)}
                disabled={isDeletingGoal}
                className={`w-full py-3 mt-2 ${t.textSub} hover:opacity-70 rounded-xl font-bold text-[10px] uppercase transition-all`}
              >
                Batal Kembali
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Export CSV */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
          <Card className={`max-w-sm w-full p-8 rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 ${t.cardBg}`}>
            <div className={`w-16 h-16 ${t.primaryLight} ${t.primaryText} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
              <Download className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <h3 className={`text-xl font-black text-center mb-2 tracking-tight ${t.textMain}`}>Unduh Laporan</h3>
            <p className={`text-sm text-center mb-8 font-medium leading-relaxed ${t.textSub}`}>
              Pilih periode bulan laporan (CSV/Excel) yang akan diunduh.
            </p>
            <div className="flex gap-4 mb-8">
              <select
                value={exportMonth}
                onChange={e => setExportMonth(parseInt(e.target.value))}
                className={`flex-1 p-3.5 ${t.bgSoft} border ${t.border} rounded-xl text-sm font-bold ${t.textMain} outline-none ${t.borderFocus} cursor-pointer`}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>{new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}</option>
                ))}
              </select>
              <select
                value={exportYear}
                onChange={e => setExportYear(parseInt(e.target.value))}
                className={`w-28 p-3.5 ${t.bgSoft} border ${t.border} rounded-xl text-sm font-bold ${t.textMain} outline-none ${t.borderFocus} cursor-pointer`}
              >
                {[viewDate.getFullYear() - 1, viewDate.getFullYear(), viewDate.getFullYear() + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className={`flex-1 py-4 ${t.bgSoft} hover:opacity-80 ${t.textSub} rounded-xl font-bold text-[11px] uppercase tracking-widest transition-colors`}
              >
                Batal
              </button>
              <button
                onClick={handleExportCSV}
                className={`flex-1 py-4 ${t.primary} ${t.primaryHover} text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-xl transition-colors`}
              >
                Mulai Unduh
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: IG Story Generator */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[500] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="flex justify-end w-full max-w-[320px] mb-4">
            <button
              onClick={() => setIsStoryModalOpen(false)}
              className="text-white hover:text-rose-400 font-bold bg-white/10 p-2 rounded-full backdrop-blur-md"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Kartu Story (Rasio 9:16) */}
          <div
            id="story-card-content"
            className={`relative w-[320px] h-[568px] rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${t.primaryGradient} text-white shadow-2xl p-8 flex flex-col justify-between`}
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/20 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-white" />
                <span className="font-black tracking-tighter uppercase text-sm">BUDGETIN PRO</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-1">Rangkuman Bulan</p>
                <h2 className="text-3xl font-black leading-tight">
                  {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-inner mt-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">Total Pengeluaran</p>
                <h3 className="text-2xl font-black">{formatRp(totalKeluarBulanTerpilih)}</h3>
                {categoryData.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">Paling Boros Di</p>
                    <p className="text-lg font-bold">{categoryData[0].name}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-xl shrink-0">
                  {barakahScore}
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Barakah Score</p>
                  <p className="text-sm font-bold leading-tight">
                    {barakahScore > 75 ? 'Maa Syaa Allah! Sangat Berkah ✨' : barakahScore > 45 ? 'Waspada Israf, perbanyak sedekah!' : 'Perlu banyak Muhasabah 🥺'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-center border-t border-white/20 pt-4 mt-6">
              <p className="text-[9px] font-bold tracking-widest uppercase text-white/60">Catat keuangan semudah chat</p>
              <p className="text-xs font-black tracking-widest uppercase mt-1">lynk.id/rizkiakbarma</p>
            </div>
          </div>

          <button
            onClick={handleDownloadStory}
            disabled={isCapturing}
            className="mt-8 w-full max-w-[320px] py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95"
          >
            {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Camera className="w-5 h-5" /> Unduh &amp; Share Sekarang</>}
          </button>
          <p className="text-white/50 text-[10px] mt-4 font-medium italic text-center max-w-[300px]">
            Akan diunduh sebagai gambar. Pas untuk IG Story atau WhatsApp Status.
          </p>
        </div>
      )}
    </>
  );
}
