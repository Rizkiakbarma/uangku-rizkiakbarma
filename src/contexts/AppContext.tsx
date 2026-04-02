import React, {
  createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode,
} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Award, ShieldCheck, Trophy, Crown } from 'lucide-react';
import { ThemeConfig, ThemeId, Transaction, Goal, AdvisorInsight, BadgeItem, CategoryData, ChartDataPoint } from '../types';
import { THEMES, ADVISOR_MESSAGES } from '../lib/constants';
import { formatRp, axisFormatter } from '../lib/utils';
import { useFinanceData } from '../hooks/useFinanceData';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    html2canvas?: (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  }
}

const GAS_URL = process.env.REACT_APP_GAS_URL ?? '';

interface AppContextValue {
  // Theme
  t: ThemeConfig;
  currentTheme: ThemeId;
  toggleTheme: () => void;
  // Auth
  userId: string | null;
  secretKey: string | null;
  isDemo: boolean;
  startDemo: () => void;
  // Finance data
  transactions: Transaction[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
  isSyncingGAS: boolean;
  fetchData: (id: string, isRefresh?: boolean) => Promise<void>;
  fetchGoals: (id: string, isRefresh?: boolean) => Promise<void>;
  // Navigation
  viewDate: Date;
  changeMonth: (offset: number) => void;
  // UI state
  isBarChart: boolean;
  setIsBarChart: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  monthlyBudget: number;
  isSettingBudget: boolean;
  setIsSettingBudget: (v: boolean) => void;
  handleSaveBudget: (val: string) => void;
  // Delete transaction
  deleteId: number | null;
  setDeleteId: (id: number | null) => void;
  handleDelete: () => Promise<void>;
  isDeleting: boolean;
  // Delete goal
  deleteGoalData: Goal | null;
  setDeleteGoalData: (g: Goal | null) => void;
  executeDeleteGoal: (actionType: 'refund' | 'delete_only') => Promise<void>;
  isDeletingGoal: boolean;
  // Export modal
  isExportModalOpen: boolean;
  setIsExportModalOpen: (v: boolean) => void;
  exportMonth: number;
  setExportMonth: (v: number) => void;
  exportYear: number;
  setExportYear: (v: number) => void;
  handleExportCSV: () => void;
  // Story modal
  isStoryModalOpen: boolean;
  setIsStoryModalOpen: (v: boolean) => void;
  isCapturing: boolean;
  handleDownloadStory: () => void;
  // Zakat inputs
  zakatSavings: string;
  setZakatSavings: (v: string) => void;
  zakatGold: string;
  setZakatGold: (v: string) => void;
  zakatDebt: string;
  setZakatDebt: (v: string) => void;
  goldPrice: number;
  setGoldPrice: (v: number) => void;
  // Computed
  stats: { balance: number };
  filteredByMonth: Transaction[];
  totalKeluarBulanTerpilih: number;
  totalMasukBulanTerpilih: number;
  momExpensePercentage: number;
  momIncomePercentage: number;
  barakahScore: number;
  chartData: ChartDataPoint[];
  categoryData: CategoryData[];
  leakageInfo: { name: string; count: number };
  advisorInsight: AdvisorInsight;
  userBadges: BadgeItem[];
  activeGoal: Goal | undefined;
  hartaBersih: number;
  nishabReal: number;
  isWajibZakatMaal: boolean;
  zakatToPay: number;
  progressNishab: number;
  // Formatters
  formatRp: (num: number) => string;
  axisFormatter: (num: number) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentTheme, setCurrentTheme] = useState<ThemeId>(
    (localStorage.getItem('budgetin_theme') as ThemeId) || 'emerald'
  );
  const t = THEMES[currentTheme] || THEMES.emerald;

  const [userId, setUserId] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [isBarChart, setIsBarChart] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(5000000);
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteGoalData, setDeleteGoalData] = useState<Goal | null>(null);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth());
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [zakatSavings, setZakatSavings] = useState('');
  const [zakatGold, setZakatGold] = useState('');
  const [zakatDebt, setZakatDebt] = useState('');
  const [goldPrice, setGoldPrice] = useState(1350000);

  const { transactions, setTransactions, goals, setGoals, loading, error, isSyncingGAS, fetchData, fetchGoals, startDemo: _startDemo } = useFinanceData();

  useEffect(() => {
    const keyFromUrl = searchParams.get('key');
    const demoMode = searchParams.get('demo') === 'true';

    if (demoMode) {
      setIsDemo(true);
      _startDemo();
      return;
    }

    if (!keyFromUrl) {
      if (window.location.pathname !== '/landing') {
        navigate('/landing', { replace: true });
      }
      return;
    }

    const validateAccess = async () => {
      try {
        const { data, error } = await supabase
          .from('users_auth')
          .select('telegram_id')
          .eq('secret_key', keyFromUrl)
          .single();
          
        if (error || !data) throw new Error("Akses ditolak: Kunci rahasia tidak valid.");

        const validUserId = data.telegram_id;
        setSecretKey(keyFromUrl);
        setUserId(validUserId);
        fetchData(validUserId);
        fetchGoals(validUserId);
        
        const savedBudget = localStorage.getItem(`budgetin_budget_${validUserId}`);
        if (savedBudget) setMonthlyBudget(parseInt(savedBudget));
      } catch (err) {
        console.error("Auth Error:", err);
        navigate('/landing', { replace: true });
      }
    };

    validateAccess();
  }, [searchParams.get('key'), searchParams.get('demo'), navigate, fetchData, fetchGoals, _startDemo]);

  const toggleTheme = useCallback(() => {
    const keys = Object.keys(THEMES) as ThemeId[];
    const next = keys[(keys.indexOf(currentTheme) + 1) % keys.length];
    setCurrentTheme(next);
    localStorage.setItem('budgetin_theme', next);
  }, [currentTheme]);

  const startDemo = useCallback(() => {
    // Navigate dengan param ?demo=true agar instance AppProvider di /dashboard
    // bisa mendeteksi mode demo lewat URL (state tidak bisa di-pass antar instance)
    navigate('/dashboard?demo=true');
  }, [navigate]);

  const changeMonth = useCallback((offset: number) => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  }, []);

  const handleSaveBudget = useCallback((val: string) => {
    let newVal = parseInt(val);
    if (isNaN(newVal) || newVal < 0) newVal = 0;
    setMonthlyBudget(newVal);
    if (userId) localStorage.setItem(`budgetin_budget_${userId}`, String(newVal));
    setIsSettingBudget(false);
  }, [userId]);

  // ── Computed values ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const income = transactions.filter(tx => tx.type === 'MASUK').reduce((a, b) => a + b.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'KELUAR').reduce((a, b) => a + b.amount, 0);
    return { balance: income - expense };
  }, [transactions]);

  const filteredByMonth = useMemo(
    () => transactions.filter(tx => tx.month === viewDate.getMonth() && tx.year === viewDate.getFullYear()),
    [transactions, viewDate]
  );

  const totalKeluarBulanTerpilih = useMemo(
    () => filteredByMonth.filter(tx => tx.type === 'KELUAR').reduce((a, b) => a + b.amount, 0),
    [filteredByMonth]
  );
  const totalMasukBulanTerpilih = useMemo(
    () => filteredByMonth.filter(tx => tx.type === 'MASUK').reduce((a, b) => a + b.amount, 0),
    [filteredByMonth]
  );

  const previousMonthTotals = useMemo(() => {
    const prev = new Date(viewDate);
    prev.setMonth(prev.getMonth() - 1);
    const pm = prev.getMonth();
    const py = prev.getFullYear();
    const prevTxs = transactions.filter(tx => tx.month === pm && tx.year === py);
    return {
      keluar: prevTxs.filter(tx => tx.type === 'KELUAR').reduce((a, b) => a + b.amount, 0),
      masuk: prevTxs.filter(tx => tx.type === 'MASUK').reduce((a, b) => a + b.amount, 0),
    };
  }, [transactions, viewDate]);

  const momExpensePercentage = useMemo(() => {
    if (previousMonthTotals.keluar === 0) return totalKeluarBulanTerpilih > 0 ? 100 : 0;
    return ((totalKeluarBulanTerpilih - previousMonthTotals.keluar) / previousMonthTotals.keluar) * 100;
  }, [totalKeluarBulanTerpilih, previousMonthTotals]);

  const momIncomePercentage = useMemo(() => {
    if (previousMonthTotals.masuk === 0) return totalMasukBulanTerpilih > 0 ? 100 : 0;
    return ((totalMasukBulanTerpilih - previousMonthTotals.masuk) / previousMonthTotals.masuk) * 100;
  }, [totalMasukBulanTerpilih, previousMonthTotals]);

  const barakahScore = useMemo(() => {
    const charity = filteredByMonth
      .filter(tx => tx.category?.toUpperCase() === 'SEDEKAH/ZAKAT')
      .reduce((a, b) => a + b.amount, 0);
    const ratio = totalKeluarBulanTerpilih > 0 ? charity / totalKeluarBulanTerpilih : 0;
    // Skor dimulai dari 40 (baseline sadar keuangan) dan naik ke 100 saat rasio sedekah ≥ 2,5%
    if (ratio >= 0.025) return 100;
    if (ratio > 0) return Math.round(40 + (ratio / 0.025) * 60);
    return 40;
  }, [filteredByMonth, totalKeluarBulanTerpilih]);

  const chartData = useMemo((): ChartDataPoint[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const amt = transactions
        .filter(tx => tx.type === 'KELUAR' && tx.dateKey === key)
        .reduce((s, tx) => s + tx.amount, 0);
      return { date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), Pengeluaran: amt };
    });
  }, [transactions, viewDate]);

  const categoryData = useMemo((): CategoryData[] => {
    const cats: Record<string, number> = {};
    filteredByMonth.filter(tx => tx.type === 'KELUAR').forEach(tx => {
      cats[tx.category] = (cats[tx.category] || 0) + tx.amount;
    });
    return Object.entries(cats).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
  }, [filteredByMonth]);

  const leakageInfo = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredByMonth.filter(tx => tx.type === 'KELUAR').forEach(tx => {
      counts[tx.category] = (counts[tx.category] || 0) + 1;
    });
    const mostFreq = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return { name: mostFreq || 'N/A', count: counts[mostFreq] || 0 };
  }, [filteredByMonth]);

  const activeGoal = goals.find(g => g.is_active) || goals[0];

  // Rotasi pesan advisor berdasarkan bulan agar tidak repetitif
  const advisorInsight = useMemo((): AdvisorInsight => {
    const seed = viewDate.getMonth() % 3;
    const budgetPct = monthlyBudget > 0 ? (totalKeluarBulanTerpilih / monthlyBudget) * 100 : 0;
    const topCat = categoryData[0];
    const charity = filteredByMonth.filter(tx => tx.category?.toUpperCase() === 'SEDEKAH/ZAKAT').reduce((a, b) => a + b.amount, 0);

    const styles = {
      rose:    { bg: 'bg-rose-500/10 border-rose-500/20',    iconBg: 'bg-rose-500/20',    textMain: 'text-rose-500',    textSub: 'text-rose-400',    border: 'border-rose-500/20' },
      amber:   { bg: 'bg-amber-500/10 border-amber-500/20',  iconBg: 'bg-amber-500/20',  textMain: 'text-amber-500',  textSub: 'text-amber-400',  border: 'border-amber-500/20' },
      orange:  { bg: 'bg-orange-500/10 border-orange-500/20',iconBg: 'bg-orange-500/20', textMain: 'text-orange-500', textSub: 'text-orange-400', border: 'border-orange-500/20' },
      violet:  { bg: 'bg-violet-500/10 border-violet-500/20',iconBg: 'bg-violet-500/20', textMain: 'text-violet-500', textSub: 'text-violet-400', border: 'border-violet-500/20' },
      emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20',iconBg:'bg-emerald-500/20',textMain:'text-emerald-500',textSub:'text-emerald-400',border:'border-emerald-500/20'},
    };

    if (budgetPct > 85) return { title: '🚨 DARURAT!', message: ADVISOR_MESSAGES.budgetAlert[seed](Math.round(budgetPct)), theme: styles.rose };
    if (totalKeluarBulanTerpilih > 1000000 && charity === 0) return { title: '🔥 PELIT AMAT!', message: ADVISOR_MESSAGES.noCharity[seed](formatRp(totalKeluarBulanTerpilih)), theme: styles.amber };
    if (topCat && topCat.amount > monthlyBudget * 0.4) return { title: '🤬 KEBOCORAN DANA!', message: ADVISOR_MESSAGES.topCategoryHigh[seed](formatRp(topCat.amount), topCat.name), theme: styles.orange };
    if (activeGoal && activeGoal.current_amount === 0) return { title: '🤡 HALUSINASI!', message: ADVISOR_MESSAGES.emptyGoal[seed](activeGoal.goal_name), theme: styles.violet };
    return { title: '👀 GW PANTAU LU!', message: ADVISOR_MESSAGES.allGood[seed](), theme: styles.emerald };
  }, [totalKeluarBulanTerpilih, monthlyBudget, categoryData, filteredByMonth, activeGoal, viewDate]);

  const userBadges = useMemo((): BadgeItem[] => [
    { id: 'phil', name: 'Philanthropist', desc: 'Sedekah Maksimal',  icon: Award,      active: barakahScore >= 100, color: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
    { id: 'ninja', name: 'Budget Ninja',  desc: 'Sangat Hemat',      icon: ShieldCheck, active: monthlyBudget > 0 && totalKeluarBulanTerpilih <= monthlyBudget * 0.75 && totalKeluarBulanTerpilih > 0, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'goal', name: 'Goal Achiever', desc: 'Target Tercapai',    icon: Trophy,     active: goals.some(g => g.current_amount >= g.target_amount && g.target_amount > 0), color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'king', name: 'Cashflow King', desc: 'Surplus Pemasukan',  icon: Crown,      active: totalMasukBulanTerpilih > 0 && totalMasukBulanTerpilih >= totalKeluarBulanTerpilih * 1.2, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  ], [barakahScore, monthlyBudget, totalKeluarBulanTerpilih, totalMasukBulanTerpilih, goals]);

  // Zakat computed
  const totalHarta = stats.balance + (Number(zakatSavings) || 0) + (Number(zakatGold) || 0);
  const hartaBersih = Math.max(0, totalHarta - (Number(zakatDebt) || 0));
  const nishabReal = 85 * goldPrice;
  const isWajibZakatMaal = hartaBersih >= nishabReal;
  const zakatToPay = isWajibZakatMaal ? hartaBersih * 0.025 : 0;
  const progressNishab = nishabReal > 0 ? Math.min((hartaBersih / nishabReal) * 100, 100) : 0;

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async () => {
    if (isDemo) {
      setTransactions((prev: Transaction[]) => prev.filter((tx: Transaction) => tx.id !== deleteId));
      setDeleteId(null);
      return;
    }
    if (!deleteId || !userId) return;
    setIsDeleting(true);
    try {
      const trx = transactions.find(tx => tx.id === deleteId);
      if (trx) {
        if (trx.source === 'sheet') {
          await fetch(`${GAS_URL}?userid=${userId}&action=delete&row=${trx.id}`);
          await supabase.from('transactions').delete().eq('user_id', String(userId)).eq('amount', trx.amount).ilike('description', trx.desc);
        } else {
          await supabase.from('transactions').delete().eq('id', deleteId).eq('user_id', String(userId));
        }
        if (trx.desc?.toLowerCase().startsWith('nabung goals:') || trx.desc?.toLowerCase().startsWith('nabung:')) {
          const goalName = trx.desc.replace(/Nabung Goals:|Nabung:/ig, '').trim();
          const goalToUpdate = goals.find(g => g.goal_name.toLowerCase() === goalName.toLowerCase());
          if (goalToUpdate) {
            const newAmount = Math.max(0, goalToUpdate.current_amount - trx.amount);
            await supabase.from('goals').update({ current_amount: newAmount }).eq('id', goalToUpdate.id);
          }
        }
      }
      setDeleteId(null);
      fetchData(userId, true);
      fetchGoals(userId, true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }, [isDemo, deleteId, userId, transactions, goals, fetchData, fetchGoals, setTransactions]);

  const executeDeleteGoal = useCallback(async (actionType: 'refund' | 'delete_only') => {
    if (!deleteGoalData || !userId) return;
    setIsDeletingGoal(true);
    try {
      const { error: goalError } = await supabase.from('goals').delete().eq('id', deleteGoalData.id).eq('user_id', String(userId));
      if (goalError) throw goalError;

      if (actionType === 'refund' && deleteGoalData.current_amount > 0) {
        const { error: txError } = await supabase.from('transactions').insert([{
          user_id: String(userId),
          date: new Date().toISOString(),
          description: `Refund Tabungan: ${deleteGoalData.goal_name}`,
          amount: deleteGoalData.current_amount,
          type: 'MASUK',
          category: 'MASUK',
          status: 'Selesai',
        }]);
        if (txError) throw txError;
      }
      setDeleteGoalData(null);
      fetchGoals(userId, true);
      if (actionType === 'refund') fetchData(userId, true);
    } catch (err) {
      alert('Gagal memproses penghapusan.');
    } finally {
      setIsDeletingGoal(false);
    }
  }, [deleteGoalData, userId, fetchGoals, fetchData]);

  const handleExportCSV = useCallback(() => {
    const data = transactions.filter(tx => tx.month === exportMonth && tx.year === exportYear);
    if (data.length === 0) { alert('Tidak ada data transaksi untuk diekspor pada periode ini.'); return; }
    const headers = ['Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Nominal (Rp)'];
    const rows = data.map(tx => {
      const safeDesc = tx.desc ? `"${tx.desc.replace(/"/g, '""')}"` : '""';
      return `${tx.dateStr},${safeDesc},${tx.category},${tx.type},${tx.amount}`;
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_BudgetIN_${new Date(exportYear, exportMonth).toLocaleDateString('id-ID', { month: 'long' })}_${exportYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  }, [transactions, exportMonth, exportYear]);

  const executeCapture = useCallback(() => {
    const element = document.getElementById('story-card-content');
    if (element && window.html2canvas) {
      setTimeout(() => {
        window.html2canvas!(element, { scale: 3, backgroundColor: null, useCORS: true })
          .then(canvas => {
            const link = document.createElement('a');
            link.download = `BudgetIN_Story_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setIsCapturing(false);
            setIsStoryModalOpen(false);
          })
          .catch(() => {
            alert('Gagal membuat gambar. Coba screenshot manual.');
            setIsCapturing(false);
          });
      }, 500);
    }
  }, []);

  const handleDownloadStory = useCallback(() => {
    setIsCapturing(true);
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => executeCapture();
      document.body.appendChild(script);
    } else {
      executeCapture();
    }
  }, [executeCapture]);

  const value: AppContextValue = {
    t, currentTheme, toggleTheme,
    userId, secretKey, isDemo, startDemo,
    transactions, goals, loading, error, isSyncingGAS, fetchData, fetchGoals,
    viewDate, changeMonth,
    isBarChart, setIsBarChart,
    searchQuery, setSearchQuery,
    monthlyBudget, isSettingBudget, setIsSettingBudget, handleSaveBudget,
    deleteId, setDeleteId, handleDelete, isDeleting,
    deleteGoalData, setDeleteGoalData, executeDeleteGoal, isDeletingGoal,
    isExportModalOpen, setIsExportModalOpen, exportMonth, setExportMonth, exportYear, setExportYear, handleExportCSV,
    isStoryModalOpen, setIsStoryModalOpen, isCapturing, handleDownloadStory,
    zakatSavings, setZakatSavings, zakatGold, setZakatGold, zakatDebt, setZakatDebt, goldPrice, setGoldPrice,
    stats, filteredByMonth, totalKeluarBulanTerpilih, totalMasukBulanTerpilih,
    momExpensePercentage, momIncomePercentage, barakahScore,
    chartData, categoryData, leakageInfo, advisorInsight, userBadges, activeGoal,
    hartaBersih, nishabReal, isWajibZakatMaal, zakatToPay, progressNishab,
    formatRp, axisFormatter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus digunakan di dalam AppProvider');
  return ctx;
}
