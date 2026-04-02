import React from 'react';
import {
  Bot, ArrowUpRight, ArrowDownRight, HeartHandshake, Target, Settings,
  BarChart3, Download, Share2, Trophy, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  Card, Metric, Text, Flex, ProgressBar, AreaChart, BarChart,
  DonutChart, Title, Badge,
} from '@tremor/react';
import { useApp } from '../contexts/AppContext';

export default function Dashboard() {
  const {
    t, viewDate, changeMonth, setIsExportModalOpen, setExportMonth, setExportYear,
    totalMasukBulanTerpilih, totalKeluarBulanTerpilih, momIncomePercentage, momExpensePercentage,
    advisorInsight, barakahScore, chartData, categoryData, userBadges, activeGoal,
    monthlyBudget, isSettingBudget, setIsSettingBudget, handleSaveBudget,
    isBarChart, setIsBarChart, setIsStoryModalOpen, formatRp, axisFormatter,
    setActiveTab,
  } = useApp() as ReturnType<typeof useApp> & { setActiveTab?: (tab: string) => void };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* AI Advisor */}
      <div className={`relative p-6 lg:p-8 rounded-[2.5rem] border shadow-md overflow-hidden flex items-center gap-5 transition-all ${t.darkCardBg} ${advisorInsight.theme.border}`}>
        <div className="absolute -right-6 -top-10 opacity-5 pointer-events-none">
          <Bot size={180} className={advisorInsight.theme.textMain} />
        </div>
        <div className={`p-4 rounded-2xl shrink-0 ${advisorInsight.theme.iconBg} border border-white/5`}>
          <Bot size={32} className={advisorInsight.theme.textMain} />
        </div>
        <div className="relative z-10 flex-1">
          <Text className={`text-[10px] font-black uppercase tracking-[0.3em] ${advisorInsight.theme.textSub} mb-1 flex items-center gap-2`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" /> {advisorInsight.title}
          </Text>
          <Text className="text-white text-sm md:text-base font-semibold leading-relaxed opacity-95 lg:pr-20">
            {advisorInsight.message}
          </Text>
        </div>
      </div>

      {/* Saldo + Navigator Bulan */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 lg:p-8 rounded-[2.5rem] shadow-lg border-t ring-1 transition-colors duration-500 border-white/5 ${t.cardBg} ${t.border}`}>
        <div>
          <Text className={`font-bold uppercase tracking-[0.3em] text-[9px] mb-2 flex items-center gap-2 ${t.textSub}`}>
            <div className={`w-2 h-2 ${t.primary} rounded-full animate-ping`} /> Total saldo aktif
          </Text>
          <h2 className={`text-4xl lg:text-5xl font-black tracking-tighter drop-shadow-md ${t.textMain}`}>
            {formatRp(useApp().stats.balance)}
          </h2>
        </div>
        <div className={`flex items-center p-1.5 rounded-2xl border transition-colors ${t.bgSoft} ${t.border}`}>
          <button onClick={() => changeMonth(-1)} className={`p-2 hover:${t.cardBg} hover:shadow-sm rounded-xl transition-all ${t.textSub}`}>
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          <div className="px-5 text-center min-w-[120px]">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${t.textMain}`}>
              {viewDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={() => changeMonth(1)} className={`p-2 hover:${t.cardBg} hover:shadow-sm rounded-xl transition-all ${t.textSub}`}>
            <ChevronRight size={18} strokeWidth={3} />
          </button>
          <div className={`w-[1px] h-6 ${t.border} mx-1 border-r`} />
          <button
            onClick={() => { setExportMonth(viewDate.getMonth()); setExportYear(viewDate.getFullYear()); setIsExportModalOpen(true); }}
            className={`p-2 px-4 flex items-center gap-2 ${t.primaryLight} hover:opacity-80 ${t.primaryText} rounded-xl transition-all shadow-sm`}
          >
            <Download size={16} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Unduh Report</span>
          </button>
        </div>
      </div>

      {/* Kartu Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: 'Pemasukan Bulan Ini', value: totalMasukBulanTerpilih, pct: momIncomePercentage, up: true },
          { label: 'Pengeluaran Bulan Ini', value: totalKeluarBulanTerpilih, pct: momExpensePercentage, up: false },
        ].map(({ label, value, pct, up }) => (
          <Card key={label} className={`rounded-[2rem] border-none shadow-sm p-6 lg:p-8 ring-1 hover:translate-y-[-3px] transition-all duration-500 ${t.cardBg} ${t.border}`}>
            <Flex alignItems="center">
              <div>
                <Text className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-3 ${t.textSub}`}>{label}</Text>
                <Metric className={`font-black text-3xl tracking-tighter ${up ? t.primaryText : 'text-rose-600'}`}>{formatRp(value)}</Metric>
                <div className="mt-3 flex items-center gap-2">
                  <Badge color={up ? (pct >= 0 ? 'emerald' : 'rose') : (pct > 0 ? 'rose' : 'emerald')} className="rounded-lg text-[9px] font-bold uppercase px-2 py-0.5 shadow-sm">
                    {pct >= 0 ? '⬆ NAIK' : '⬇ TURUN'} {Math.abs(Math.round(pct))}%
                  </Badge>
                  <span className={`text-[9px] font-medium ${t.textSub}`}>vs bulan lalu</span>
                </div>
              </div>
              <div className={`p-4 text-white rounded-2xl shadow-lg transform hover:${up ? 'rotate-6' : '-rotate-6'} transition-transform ${up ? t.primary : 'bg-rose-600'}`}>
                {up ? <ArrowUpRight size={24} strokeWidth={3} /> : <ArrowDownRight size={24} strokeWidth={3} />}
              </div>
            </Flex>
          </Card>
        ))}
      </div>

      {/* Grafik + Sidebar kanan */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          {/* Grafik Tren Harian */}
          <Card className={`rounded-[2.5rem] border-none shadow-xl p-6 lg:p-8 ring-1 transition-colors duration-500 overflow-hidden ${t.cardBg} ${t.border}`}>
            <Flex className="mb-2 items-start justify-between">
              <div><Title className={`font-bold border-l-4 pl-3 text-[11px] tracking-widest leading-none uppercase ${t.textMain} ${t.primaryBorder}`}>Tren harian</Title></div>
              <div className={`flex p-1 rounded-xl ring-1 shrink-0 ${t.bgSoft} ${t.border}`}>
                <button onClick={() => setIsBarChart(true)} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-colors ${isBarChart ? `${t.cardBg} ${t.primaryText} shadow-sm` : t.textSub}`}>Batang</button>
                <button onClick={() => setIsBarChart(false)} className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-colors ${!isBarChart ? `${t.cardBg} ${t.primaryText} shadow-sm` : t.textSub}`}>Garis</button>
              </div>
            </Flex>
            <div className="w-full overflow-x-auto custom-scrollbar pb-4 mt-4">
              <div className="h-56 min-w-[900px] pr-4">
                {isBarChart
                  ? <BarChart className="h-full" data={chartData} index="date" categories={['Pengeluaran']} colors={[t.chartMain]} valueFormatter={axisFormatter} showAnimation yAxisWidth={65} showGridLines={false} />
                  : <AreaChart className="h-full" data={chartData} index="date" categories={['Pengeluaran']} colors={[t.chartMain]} valueFormatter={axisFormatter} showAnimation yAxisWidth={65} curveType="monotone" showGridLines={false} />
                }
              </div>
            </div>
          </Card>

          {/* Donut Chart Alokasi Dana */}
          <Card className={`rounded-[2.5rem] border-none shadow-lg ring-1 p-8 flex flex-col hover:shadow-xl transition-all duration-500 ${t.cardBg} ${t.border}`}>
            <Title className={`font-bold border-l-4 pl-3 text-[10px] uppercase tracking-[0.3em] mb-8 leading-none ${t.textMain} ${t.primaryBorder}`}>Alokasi dana</Title>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <DonutChart className="h-52 w-full" data={categoryData} category="amount" index="name" valueFormatter={axisFormatter} colors={t.chartColors} showAnimation />
              </div>
              <div className="w-full md:w-1/2 space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                {categoryData.length > 0 ? categoryData.map((c, i) => (
                  <Flex key={c.name} className={`border-b pb-3 last:border-0 last:pb-0 ${t.border}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: t.chartHex[i % t.chartHex.length] }} />
                      <Text className={`text-[11px] font-bold uppercase tracking-widest truncate max-w-[140px] ${t.textSub}`}>{c.name}</Text>
                    </div>
                    <Text className={`font-black text-xs tracking-tighter ${t.textMain}`}>{formatRp(c.amount)}</Text>
                  </Flex>
                )) : <Text className={`text-center text-xs font-medium italic ${t.textSub}`}>Belum ada pengeluaran bulan ini.</Text>}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar kanan */}
        <aside className="w-full xl:w-96 shrink-0 space-y-6">
          {/* Barakah Score */}
          <BarakahScoreCard />
          {/* Badges */}
          <BadgesCard userBadges={userBadges} t={t} />
          {/* Goal Aktif */}
          <GoalCard activeGoal={activeGoal} t={t} formatRp={formatRp} axisFormatter={axisFormatter} />
          {/* Budget Tracker */}
          <BudgetCard monthlyBudget={monthlyBudget} isSettingBudget={isSettingBudget} setIsSettingBudget={setIsSettingBudget} handleSaveBudget={handleSaveBudget} totalKeluarBulanTerpilih={totalKeluarBulanTerpilih} t={t} formatRp={formatRp} />
        </aside>
      </div>
    </div>
  );
}

// ── Sub-komponen Lokal ────────────────────────────────────────────────────────

function BarakahScoreCard() {
  const { t, barakahScore, setIsStoryModalOpen } = useApp();
  return (
    <Card className={`rounded-[2.5rem] border-none shadow-xl p-8 ring-1 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 ${t.cardBg} ${t.border}`}>
      <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
        <HeartHandshake size={140} className={t.textMain} />
      </div>
      <Title className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-2 border-l-4 pl-3 leading-none ${t.textMain} ${t.primaryBorder}`}>Barakah Score</Title>
      {/* Penjelasan rumus */}
      <p className={`text-[9px] mb-6 italic ${t.textSub}`}>
        *Skor dihitung dari rasio sedekah/zakat terhadap total pengeluaran. Target: ≥ 2,5% = skor 100.
      </p>
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6 flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className={t.bgSoft} />
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent"
              strokeDasharray={364.4}
              strokeDashoffset={364.4 - (barakahScore / 100) * 364.4}
              className={`transition-all duration-1000 ease-out ${barakahScore > 75 ? 'text-emerald-500' : barakahScore > 45 ? 'text-amber-500' : 'text-rose-500'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black leading-none ${t.textMain}`}>{barakahScore}</span>
            <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${t.textSub}`}>Point</span>
          </div>
        </div>
        <Badge color={barakahScore > 75 ? 'emerald' : barakahScore > 45 ? 'amber' : 'rose'} className="font-black rounded-lg text-[9px] uppercase px-4 py-1 mb-4 shadow-sm">
          {barakahScore > 75 ? 'Maa Syaa Allah' : barakahScore > 45 ? 'Waspada Israf' : 'Perlu Muhasabah'}
        </Badge>
        <Text className={`text-[11px] font-medium italic px-4 leading-relaxed ${t.textSub}`}>
          {barakahScore > 75 ? '"Arus kasmu sangat berkah! Porsi sedekah mencapai target 2,5%."'
            : barakahScore > 45 ? '"Ayo tingkatkan porsi berbagi agar hartamu makin tenang."'
            : '"Muhasabah diri, jangan lupakan hak sesama di setiap rupiah jajanmu."'}
        </Text>
        <button
          onClick={() => setIsStoryModalOpen(true)}
          className={`mt-6 w-full py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${t.primaryLight} ${t.primaryText} hover:opacity-80 active:scale-95`}
        >
          <Share2 className="w-4 h-4" /> Pamerkan ke IG Story
        </button>
      </div>
    </Card>
  );
}

function BadgesCard({ userBadges, t }: { userBadges: ReturnType<typeof useApp>['userBadges']; t: ReturnType<typeof useApp>['t'] }) {
  return (
    <Card className={`rounded-[2.5rem] border-none shadow-lg ring-1 p-8 overflow-hidden relative transition-colors duration-500 ${t.cardBg} ${t.border}`}>
      <Flex className="mb-6 items-center justify-between">
        <Title className={`text-[10px] font-bold tracking-[0.3em] leading-none uppercase ${t.textMain}`}>Pencapaian Bulan Ini</Title>
        <Trophy size={16} className={t.textSub} />
      </Flex>
      <div className="grid grid-cols-2 gap-4">
        {userBadges.map(b => (
          <div key={b.id} className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-500 ${b.active ? `${b.bg} ${b.border} shadow-sm transform hover:scale-105` : `${t.bgSoft} border-transparent opacity-50 grayscale`}`}>
            <b.icon size={28} strokeWidth={2.5} className={`mb-2 ${b.active ? b.color : t.textSub}`} />
            <p className={`text-[9px] font-black uppercase tracking-widest leading-tight mb-1 ${b.active ? t.textMain : t.textSub}`}>{b.name}</p>
            <p className={`text-[8px] font-bold ${t.textSub}`}>{b.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GoalCard({ activeGoal, t, formatRp, axisFormatter }: {
  activeGoal: ReturnType<typeof useApp>['activeGoal'];
  t: ReturnType<typeof useApp>['t'];
  formatRp: (n: number) => string;
  axisFormatter: (n: number) => string;
}) {
  const { setActiveTab } = useApp() as ReturnType<typeof useApp> & { setActiveTab?: (tab: string) => void };
  const navigate = require('react-router-dom').useNavigate;

  if (!activeGoal) {
    return (
      <Card className={`rounded-[2.5rem] border-none shadow-sm p-8 text-center flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-colors ${t.bgSoft} ${t.border}`} onClick={() => window.location.href = '/goals' + window.location.search}>
        <Target className={`mb-3 ${t.textSub}`} size={32} />
        <Text className={`text-[10px] font-bold uppercase ${t.textSub}`}>Belum ada target.</Text>
        <Text className={`text-[9px] mt-1 italic ${t.textSub}`}>Ketik `/setgoal Laptop 10jt` di Bot!</Text>
      </Card>
    );
  }

  return (
    <Card className={`rounded-[2.5rem] border-none shadow-xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all cursor-pointer ${t.darkCardBg}`} onClick={() => window.location.href = '/goals' + window.location.search}>
      <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Target size={160} /></div>
      <Title className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-8 border-l-4 pl-3 leading-none ${t.accentDark} border-current`}>Fokus Target 🎯</Title>
      <div className="relative z-10">
        <Flex className="mb-4">
          <h3 className="text-xl font-black tracking-tight">{activeGoal.goal_name}</h3>
          <Badge color={t.chartMain as any} className="rounded-lg text-[9px] font-black uppercase shadow-lg">
            {Math.min(Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100), 100)}%
          </Badge>
        </Flex>
        <ProgressBar value={(activeGoal.current_amount / activeGoal.target_amount) * 100} color={t.chartMain as any} className="h-3 rounded-full mb-6 bg-white/10" />
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <Text className="text-[8px] text-white/50 uppercase font-bold mb-1">Di Celengan</Text>
            <Text className={`text-xs font-black ${t.accentDark}`}>{formatRp(activeGoal.current_amount)}</Text>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <Text className="text-[8px] text-white/50 uppercase font-bold mb-1">Target Misi</Text>
            <Text className="text-xs font-black text-white">{axisFormatter(activeGoal.target_amount)}</Text>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BudgetCard({ monthlyBudget, isSettingBudget, setIsSettingBudget, handleSaveBudget, totalKeluarBulanTerpilih, t, formatRp }: {
  monthlyBudget: number; isSettingBudget: boolean;
  setIsSettingBudget: (v: boolean) => void; handleSaveBudget: (v: string) => void;
  totalKeluarBulanTerpilih: number; t: ReturnType<typeof useApp>['t']; formatRp: (n: number) => string;
}) {
  return (
    <Card className={`rounded-[2.5rem] border-none shadow-lg ring-1 p-8 overflow-hidden relative transition-colors duration-500 ${t.cardBg} ${t.border}`}>
      <Flex className="mb-8 items-center justify-between">
        <Title className={`text-[10px] font-bold tracking-[0.3em] leading-none uppercase ${t.textMain}`}>Target anggaran</Title>
        <button onClick={() => setIsSettingBudget(true)} className={`p-2 rounded-xl transition-all shadow-sm ${t.bgSoft} ${t.primaryText} ${t.primaryHover} hover:text-white`}><Settings size={16} /></button>
      </Flex>
      <div className="space-y-6">
        <div>
          <Flex className="mb-3">
            <Text className={`font-bold text-[9px] uppercase tracking-widest ${t.textSub}`}>Pemakaian</Text>
            <Badge color={totalKeluarBulanTerpilih > monthlyBudget ? 'rose' : t.chartMain as any} className="font-bold rounded-lg text-[9px] px-2.5 py-0.5 shadow-sm">
              {monthlyBudget > 0 ? Math.round((totalKeluarBulanTerpilih / monthlyBudget) * 100) : 0}%
            </Badge>
          </Flex>
          <ProgressBar value={monthlyBudget > 0 ? (totalKeluarBulanTerpilih / monthlyBudget) * 100 : 0} color={totalKeluarBulanTerpilih > monthlyBudget ? 'rose' : t.chartMain as any} className="h-3 rounded-full shadow-inner" />
        </div>
        <div className={`p-5 rounded-2xl border shadow-inner ${t.bgSoft} ${t.border}`}>
          <Text className={`text-[9px] font-bold uppercase tracking-widest mb-3 leading-none ${t.textSub}`}>Limit bulanan</Text>
          {isSettingBudget
            ? <input type="number" defaultValue={monthlyBudget} onBlur={e => handleSaveBudget(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveBudget(e.currentTarget.value); }} className={`w-full px-4 py-2 text-lg font-black outline-none border-2 rounded-xl bg-transparent ${t.textMain} ${t.borderFocus}`} autoFocus />
            : <Metric onClick={() => setIsSettingBudget(true)} className={`text-2xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity ${t.textMain}`}>{formatRp(monthlyBudget)}</Metric>
          }
        </div>
      </div>
    </Card>
  );
}
