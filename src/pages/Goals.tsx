import React from 'react';
import { Target, Trash2, ArrowDownRight } from 'lucide-react';
import { Card, Title, Text, Badge, ProgressBar, Grid, Flex } from '@tremor/react';
import { useApp } from '../contexts/AppContext';

export default function Goals() {
  const { t, goals, transactions, setDeleteGoalData, formatRp } = useApp();

  const savingsHistory = transactions.filter(tx =>
    tx.desc?.toLowerCase().includes('nabung goals:') ||
    tx.desc?.toLowerCase().includes('nabung:') ||
    tx.desc?.toLowerCase().includes('refund tabungan:')
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-center gap-4 p-8 lg:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden ${t.darkCardBg}`}>
        <div className="absolute -right-20 -bottom-20 opacity-10"><Target size={300} /></div>
        <div className="relative z-10 w-full">
          <Title className={`font-bold uppercase tracking-[0.3em] text-[10px] mb-3 border-l-4 pl-3 ${t.accentDark} border-current`}>Goal Center</Title>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tighter mb-2">Target Impianmu 🎯</h2>
          <Text className="text-white/60 text-xs font-medium">Dana di sini tersimpan di kantong terpisah dari saldo utama.</Text>
        </div>
      </div>

      {/* Grid Goals */}
      <Grid numItemsMd={2} className="gap-6">
        {goals.map(g => (
          <Card key={g.id} className={`rounded-[2.5rem] border-none shadow-sm p-8 relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 ring-1 ${t.cardBg} ${t.border}`}>
            <button
              onClick={e => { e.stopPropagation(); setDeleteGoalData(g); }}
              className={`absolute top-6 right-6 p-2 rounded-xl transition-all hover:bg-rose-50 hover:text-rose-500 ${t.textSub}`}
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
            <Flex className="mb-5 items-start pr-10">
              <div>
                <Title className={`text-2xl font-black tracking-tight ${t.textMain}`}>{g.goal_name}</Title>
                <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${t.textSub}`}>Misi: {formatRp(g.target_amount)}</Text>
              </div>
              <Badge
                color={g.current_amount >= g.target_amount ? t.chartMain as any : 'amber'}
                className="rounded-lg text-[10px] font-black uppercase shadow-sm px-3 py-1"
              >
                {Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100)}%
              </Badge>
            </Flex>
            <ProgressBar
              value={(g.current_amount / g.target_amount) * 100}
              color={g.current_amount >= g.target_amount ? t.chartMain as any : 'amber'}
              className="h-3.5 rounded-full mb-6 shadow-inner"
            />
            <div className={`flex justify-between items-center p-5 rounded-2xl border shadow-inner ${t.bgSoft} ${t.border}`}>
              <div>
                <Text className={`text-[9px] uppercase font-bold mb-1 ${t.textSub}`}>Celengan Terisi</Text>
                <Text className={`text-base font-black ${t.primaryText}`}>{formatRp(g.current_amount)}</Text>
              </div>
              <div className="text-right">
                <Text className={`text-[9px] uppercase font-bold mb-1 ${t.textSub}`}>Kurang</Text>
                <Text className={`text-base font-black ${t.textSub}`}>{formatRp(Math.max(0, g.target_amount - g.current_amount))}</Text>
              </div>
            </div>
          </Card>
        ))}
        {goals.length === 0 && (
          <div className={`col-span-2 p-16 text-center rounded-[2.5rem] border-2 border-dashed ${t.bgSoft} ${t.border}`}>
            <Target size={48} className={`mx-auto mb-4 ${t.textSub}`} />
            <h3 className={`font-bold mb-2 ${t.textSub}`}>Belum ada target impian.</h3>
            <Text className={`text-xs italic ${t.textSub}`}>Ketik `/setgoal NamaBarang JumlahTarget` di Bot Telegram!</Text>
          </div>
        )}
      </Grid>

      {/* Riwayat Isi Celengan */}
      <Card className={`rounded-[2.5rem] border-none shadow-sm ring-1 overflow-hidden p-0 mt-6 ${t.cardBg} ${t.border}`}>
        <div className={`p-6 lg:p-8 border-b ${t.bgSoft} ${t.border}`}>
          <Title className={`font-black text-xl tracking-tighter uppercase flex items-center gap-2 ${t.textMain}`}>
            <ArrowDownRight className={t.primaryText} /> Riwayat Isi Celengan
          </Title>
        </div>
        <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 ${t.tableHead}`}>
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">Waktu</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em]">Deskripsi Tabungan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-right whitespace-nowrap">Uang Masuk</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divide}`}>
              {savingsHistory.length > 0 ? savingsHistory.map(tx => (
                <tr key={tx.id} className={`transition-all group hover:${t.bgSoft}`}>
                  <td className={`px-6 py-4 text-[11px] font-bold uppercase whitespace-nowrap ${t.textSub}`}>{tx.dateStr}</td>
                  <td className="px-6 py-4">
                    <Text className={`font-extrabold text-sm mb-1.5 ${t.textMain}`}>
                      {tx.desc.replace(/Nabung Goals:|Nabung:/ig, 'Suntik Dana:').trim()}
                    </Text>
                    <Badge className={`font-bold text-[8px] uppercase tracking-widest shadow-sm ${tx.desc?.toLowerCase().includes('refund') ? 'bg-rose-50 text-rose-600 border-rose-100' : `${t.primaryLight} ${t.primaryText}`}`}>
                      {tx.desc?.toLowerCase().includes('refund') ? 'Ditarik' : 'Dari Saldo Utama'}
                    </Badge>
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-sm whitespace-nowrap ${tx.desc?.toLowerCase().includes('refund') ? 'text-rose-500' : t.primaryText}`}>
                    {tx.desc?.toLowerCase().includes('refund') ? '-' : '+'}{formatRp(tx.amount).replace('Rp', '').trim()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className={`px-6 py-12 text-center text-sm italic ${t.textSub}`}>Belum ada riwayat isi celengan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
