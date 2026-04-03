import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Goal, RawTransaction } from '../types';
import { processIncomingData } from '../lib/utils';
import { DUMMY_DATA } from '../lib/constants';

const GAS_URL = process.env.REACT_APP_GAS_URL ?? '';

// Variables to guarantee single-fetch across component entire lifecycle
let globalHasFetchedData = false;
let globalHasFetchedGoals = false;
let cachedTransactions: Transaction[] = [];
let cachedGoals: Goal[] = [];

export function useFinanceData() {
  const [transactions, setTransactionsState] = useState<Transaction[]>(cachedTransactions);
  const [goals, setGoalsState] = useState<Goal[]>(cachedGoals);
  const [loading, setLoading] = useState(!globalHasFetchedData);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncingGAS, setIsSyncingGAS] = useState(false);

  // Wrapper setter untuk memastikan memori global ikut update
  const setTransactions = useCallback((val: any) => {
    setTransactionsState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      cachedTransactions = next;
      return next;
    });
  }, []);

  const setGoals = useCallback((val: any) => {
    setGoalsState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      cachedGoals = next;
      return next;
    });
  }, []);

  // Helper: deduplicate & sort transaksi
  const dedupeAndSort = (data: Transaction[]): Transaction[] => {
    const unique = data.filter((item, index, self) =>
      index === self.findIndex(tx =>
        tx.dateKey === item.dateKey && tx.amount === item.amount && tx.desc?.toLowerCase() === item.desc?.toLowerCase()
      )
    );
    unique.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime() || b.id - a.id);
    return unique;
  };

  const fetchData = useCallback(async (userId: string, isRefresh = false) => {
    if (globalHasFetchedData && !isRefresh) return;
    globalHasFetchedData = true;
    
    setLoading(transactions.length === 0);
    setIsFetching(true);
    setError(null);

    try {
      // ═══ TAHAP 1: Supabase dulu — langsung render ke UI ═══
      const { data: supaData, error: supaErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', String(userId));

      if (supaErr) {
        console.warn('[BudgetIN] Supabase fetch gagal:', supaErr.message);
        setError('Gagal memuat data. Periksa koneksi internet kamu.');
      }

      const supaTransactions = supaData
        ? processIncomingData(supaData as RawTransaction[]).map(item => ({ ...item, source: 'supabase' as const }))
        : [];

      // 🔥 Langsung tampilkan data Supabase — Skeleton HILANG di sini!
      const sorted = dedupeAndSort(supaTransactions);
      setTransactions(sorted);

    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan yang tidak terduga.');
    } finally {
      setLoading(false);
      setIsFetching(false); // UI sudah interaktif!
    }

    // ═══ TAHAP 2: GAS di background — TIDAK menghambat UI ═══
    if (GAS_URL) {
      setIsSyncingGAS(true);
      try {
        const gasRes = await fetch(`${GAS_URL}?userid=${userId}`);
        const json = await gasRes.json();

        if (json.status === 'success' && json.data?.length > 0) {
          const sheetData = processIncomingData(json.data as RawTransaction[])
            .map(item => ({ ...item, source: 'sheet' as const }));

          // Merge dengan data Supabase yang sudah ditampilkan
          setTransactions((prev: Transaction[]) => {
            const merged = [...prev, ...sheetData];
            return dedupeAndSort(merged);
          });
        }
      } catch (gasErr) {
        console.warn('[BudgetIN] GAS background sync gagal:', gasErr);
        // Tidak tampilkan error ke UI — data Supabase sudah cukup
      } finally {
        setIsSyncingGAS(false);
      }
    }
  }, [transactions.length, setTransactions]);


  const fetchGoals = useCallback(async (userId: string, isRefresh = false) => {
    if (globalHasFetchedGoals && !isRefresh) return;
    globalHasFetchedGoals = true;
    
    try {
      const { data, error: dbError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', String(userId))
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      if (data) setGoals(data as Goal[]);
    } catch (err) {
      console.error('[BudgetIN] Gagal mengambil goals', err);
    }
  }, []);

  const startDemo = useCallback(() => {
    setTransactions(processIncomingData(DUMMY_DATA));
    setLoading(false);
    setError(null);
  }, []);

  return {
    transactions,
    setTransactions,
    goals,
    setGoals,
    isFetching,
    loading,
    error,
    isSyncingGAS,
    fetchData,
    fetchGoals,
    startDemo,
  };
}
