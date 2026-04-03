import React from 'react';
import { Search, Download, Trash2 } from 'lucide-react';
import { Card, Title, Text, Badge } from '@tremor/react';
import { useApp } from '../contexts/AppContext';

export default function Ledger() {
  const {
    t, transactions, searchQuery, setSearchQuery,
    setDeleteId, setIsExportModalOpen, setExportMonth, setExportYear, viewDate,
    formatRp, isFetching
  } = useApp();

  const filtered = transactions.filter(tx =>
    tx.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <Card className={`rounded-[2.5rem] border-none shadow-xl ring-1 overflow-hidden p-0 ${t.cardBg} ${t.border}`}>
        {/* Header tabel */}
        <div className={`p-6 lg:p-8 border-b flex flex-col md:flex-row justify-between items-center gap-6 ${t.bgSoft} ${t.border}`}>
          <Title className={`font-black text-2xl tracking-tighter ${t.textMain}`}>Riwayat Mutasi</Title>
          <div className="flex w-full md:w-auto gap-3 items-center">
            <div className="relative w-full md:w-[320px]">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${t.textSub}`} size={18} />
              <input
                type="text"
                placeholder="Cari keterangan atau kategori..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-6 py-3.5 border rounded-2xl text-xs font-bold transition-all outline-none shadow-sm bg-transparent ${t.textMain} ${t.border} ${t.borderFocus}`}
              />
            </div>
            <button
              onClick={() => { setExportMonth(viewDate.getMonth()); setExportYear(viewDate.getFullYear()); setIsExportModalOpen(true); }}
              className={`shrink-0 p-3.5 px-5 flex items-center gap-2 rounded-2xl transition-all shadow-sm border ${t.primaryLight} hover:opacity-80 ${t.primaryText} ${t.primaryBorder}`}
              title="Unduh Laporan"
            >
              <Download size={18} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Unduh Report</span>
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto max-h-[650px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 ${t.tableHead}`}>
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">Waktu</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em]">Keterangan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-right whitespace-nowrap">Nominal</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divide}`}>
              {isFetching ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className={`h-4 w-12 rounded animate-pulse ${t.bgSoft}`} /></td>
                    <td className="px-6 py-4">
                      <div className={`h-4 w-40 mb-2 rounded animate-pulse ${t.bgSoft}`} />
                      <div className={`h-3 w-16 rounded animate-pulse ${t.bgSoft}`} />
                    </td>
                    <td className="px-6 py-4"><div className={`h-5 w-24 rounded animate-pulse float-right ${t.bgSoft}`} /></td>
                    <td className="px-6 py-4 text-center"><div className={`h-8 w-8 mx-auto rounded-xl animate-pulse ${t.bgSoft}`} /></td>
                  </tr>
                ))
              ) : filtered.length > 0 ? filtered.map(tx => (
                <tr key={tx.id} className={`transition-all group border-l-4 border-transparent hover:${t.bgSoft}`}>
                  <td className={`px-6 py-4 text-[11px] font-bold uppercase whitespace-nowrap ${t.textSub}`}>{tx.dateStr}</td>
                  <td className="px-6 py-4">
                    <Text className={`font-extrabold text-sm mb-1.5 ${t.textMain}`}>{tx.desc || 'Manual'}</Text>
                    <Badge
                      color={tx.desc?.toLowerCase().includes('nabung') ? 'indigo' : tx.type === 'MASUK' ? t.chartMain as any : 'rose'}
                      size="xs"
                      className="font-bold text-[8px] uppercase tracking-widest"
                    >
                      {tx.category}
                    </Badge>
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${tx.type === 'MASUK' ? t.primaryText : t.textMain}`}>
                    {tx.type === 'MASUK' ? '+' : '-'}{formatRp(tx.amount).replace('Rp', '').trim()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setDeleteId(tx.id)}
                      className={`p-2.5 rounded-xl transition-all active:scale-90 hover:bg-rose-50 hover:text-rose-600 ${t.textSub}`}
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className={`px-6 py-16 text-center text-sm italic ${t.textSub}`}>
                    {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Belum ada transaksi.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
