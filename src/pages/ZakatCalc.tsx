import React from 'react';
import { Calculator, Wallet, Info, Landmark, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, Metric, Text, Flex, ProgressBar, Title } from '@tremor/react';
import { useApp } from '../contexts/AppContext';

export default function ZakatCalc() {
  const {
    t, stats, formatRp,
    zakatSavings, setZakatSavings,
    zakatGold, setZakatGold,
    zakatDebt, setZakatDebt,
    goldPrice, setGoldPrice,
    hartaBersih, nishabReal, isWajibZakatMaal, zakatToPay, progressNishab,
  } = useApp();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className={`p-8 lg:p-10 rounded-[2.5rem] ${t.darkCardBg} text-white shadow-xl relative overflow-hidden group`}>
        <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Landmark size={300} />
        </div>
        <div className="relative z-10 w-full">
          <Title className={`font-bold uppercase tracking-[0.3em] text-[10px] mb-3 border-l-4 pl-3 ${t.accentDark} border-current`}>
            Kalkulator Zakat Komprehensif
          </Title>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tighter mb-2">Tunaikan Kewajibanmu 🕌</h2>
          <Text className="text-white/60 text-xs font-medium max-w-xl">
            Hitung estimasi zakat maal dari total kekayaan bersihmu (Saldo Aplikasi + Tabungan Luar + Emas) dikurangi Utang Jatuh Tempo.
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Form Input */}
        <div className="lg:col-span-7 space-y-6">
          <Card className={`rounded-[2.5rem] border-none shadow-sm ring-1 p-8 ${t.cardBg} ${t.border}`}>
            <h3 className={`text-lg font-black tracking-tight mb-6 flex items-center gap-2 ${t.textMain}`}>
              <Wallet className={`w-5 h-5 ${t.primaryText}`} /> Rincian Harta &amp; Kewajiban
            </h3>
            <div className="space-y-5">
              {/* Saldo Aplikasi (Read Only) */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${t.textSub}`}>
                  Saldo Utama (Dari Aplikasi)
                </label>
                <div className={`w-full p-4 ${t.bgSoft} border border-transparent rounded-xl flex justify-between items-center`}>
                  <span className={`font-bold ${t.textSub}`}>Rp</span>
                  <span className={`font-black text-lg ${t.textMain}`}>{stats.balance.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Tabungan Lain */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${t.textSub}`}>
                  Uang Tunai / Tabungan Bank Lain
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className={`font-bold ${t.textSub}`}>Rp</span>
                  </div>
                  <input
                    type="text"
                    value={zakatSavings ? Number(zakatSavings).toLocaleString('id-ID') : ''}
                    onChange={e => setZakatSavings(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-12 pr-4 py-4 ${t.bgSoft} border ${t.border} rounded-xl text-lg font-black ${t.textMain} outline-none ${t.borderFocus} transition-all text-right`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Emas */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${t.textSub}`}>
                  Nilai Emas / Perak / Perhiasan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className={`font-bold ${t.textSub}`}>Rp</span>
                  </div>
                  <input
                    type="text"
                    value={zakatGold ? Number(zakatGold).toLocaleString('id-ID') : ''}
                    onChange={e => setZakatGold(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-12 pr-4 py-4 ${t.bgSoft} border ${t.border} rounded-xl text-lg font-black ${t.textMain} outline-none ${t.borderFocus} transition-all text-right`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Utang (Pengurang) */}
              <div className="pt-4 border-t border-dashed border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-rose-500">
                  Utang Jatuh Tempo (Pengurang Harta)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="font-bold text-rose-500">Rp</span>
                  </div>
                  <input
                    type="text"
                    value={zakatDebt ? Number(zakatDebt).toLocaleString('id-ID') : ''}
                    onChange={e => setZakatDebt(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-4 bg-rose-50/50 border border-rose-100 rounded-xl text-lg font-black text-rose-600 outline-none focus:ring-2 focus:ring-rose-200 transition-all text-right"
                    placeholder="0"
                  />
                </div>
                <p className={`text-[9px] mt-2 italic ${t.textSub}`}>
                  *Hanya masukkan utang yang wajib dilunasi dalam waktu dekat.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Hasil */}
        <div className="lg:col-span-5 space-y-6">
          {/* Kartu Hasil Zakat */}
          <Card className={`rounded-[3rem] p-8 lg:p-10 bg-gradient-to-br ${t.primaryGradient} text-white shadow-xl relative overflow-hidden group border border-white/10`}>
            <div className="absolute -top-20 -right-20 w-[20rem] h-[20rem] bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-lg">
                <Calculator className="text-white w-8 h-8" strokeWidth={2.5} />
              </div>
              <Text className="text-white/80 font-bold uppercase tracking-[0.3em] text-[10px] mb-2 leading-none">
                Kewajiban Zakat Maal (2.5%)
              </Text>
              <Metric className="text-white font-black text-4xl lg:text-5xl mt-4 tracking-tighter drop-shadow-xl">
                {formatRp(zakatToPay)}
              </Metric>

              <div className="mt-8 bg-black/20 p-5 rounded-2xl border border-white/10 text-left backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Harta Bersih</Text>
                  <Text className="text-white text-xs font-black">{formatRp(hartaBersih)}</Text>
                </div>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                  <Text className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Batas Nishab</Text>
                  <Text className="text-white text-xs font-black">{formatRp(nishabReal)}</Text>
                </div>
                <Flex className="mb-2">
                  <Text className="text-white/90 text-[10px] font-bold uppercase tracking-widest">Progress ke Nishab</Text>
                  <Text className="text-white text-[11px] font-black">{Math.round(progressNishab)}%</Text>
                </Flex>
                <ProgressBar value={progressNishab} color={t.chartMain as any} className="h-2 rounded-full bg-black/40" />
              </div>

              <div className="mt-6">
                {isWajibZakatMaal ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-100 px-4 py-2 rounded-full text-xs font-bold border border-emerald-400/30">
                    <CheckCircle2 className="w-4 h-4" /> WAJIB ZAKAT
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-100 px-4 py-2 rounded-full text-xs font-bold border border-amber-400/30">
                    <AlertTriangle className="w-4 h-4" /> BELUM MENCAPAI NISHAB
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Pengaturan Harga Emas */}
          <Card className={`rounded-[2rem] border-none shadow-sm ring-1 p-6 ${t.cardBg} ${t.border}`}>
            <h4 className={`flex items-center gap-2 text-sm font-black mb-4 ${t.textMain}`}>
              <Info className={`w-4 h-4 ${t.primaryText}`} /> Informasi Nishab
            </h4>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${t.textSub}`}>
                Harga Emas Saat Ini (Per Gram)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`font-bold text-xs ${t.textSub}`}>Rp</span>
                </div>
                <input
                  type="text"
                  value={goldPrice ? Number(goldPrice).toLocaleString('id-ID') : ''}
                  onChange={e => setGoldPrice(Number(e.target.value.replace(/\D/g, '')))}
                  className={`w-full pl-10 pr-3 py-2 ${t.bgSoft} border ${t.border} rounded-lg text-sm font-bold ${t.textMain} outline-none ${t.borderFocus} transition-all`}
                />
              </div>
              <p className={`text-[9px] mt-1.5 italic ${t.textSub}`}>
                *Standar nishab zakat maal adalah 85 gram emas murni. Perbarui harga emas secara manual sesuai{' '}
                <a href="https://www.logammulia.com/id" target="_blank" rel="noreferrer" className={`underline ${t.primaryText}`}>
                  harga terkini
                </a>.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
