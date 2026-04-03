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
  const fetchData = useCallback(async (userId: string, isRefresh = false) => {
    if (globalHasFetchedData && !isRefresh) return;
    globalHasFetchedData = true;
    
    setLoading(transactions.length === 0);
    setIsFetching(true);
    setError(null);
    setIsSyncingGAS(true); // for badge compat

    try {
      const [supaRes, gasRes] = await Promise.allSettled([
        supabase.from('transactions').select('*').eq('user_id', String(userId)),
        fetch(`${GAS_URL}?userid=${userId}`).then(res => res.json())
      ]);

      let combinedData: Transaction[] = [];

      if (supaRes.status === 'fulfilled' && supaRes.value.data) {
        combinedData = processIncomingData(supaRes.value.data as RawTransaction[])
          .map(item => ({ ...item, source: 'supabase' as const }));
      } else if (supaRes.status === 'rejected') {
        console.warn('[BudgetIN] Supabase fetch gagal:', supaRes.reason);
      }

      if (gasRes.status === 'fulfilled') {
        const json = gasRes.value as { status: string; data: RawTransaction[] };
        if (json.status === 'success') {
          const sheetData = processIncomingData(json.data)
            .map(item => ({ ...item, source: 'sheet' as const }));
          combinedData = [...combinedData, ...sheetData];
        }
      } else {
        console.warn('[BudgetIN] Sheets sync gagal:', gasRes.reason);
      }

      const unique = combinedData.filter((item, index, self) =>
        index === self.findIndex(tx =>
          tx.dateKey === item.dateKey && tx.amount === item.amount && tx.desc?.toLowerCase() === item.desc?.toLowerCase()
        )
      );
      
      unique.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime() || b.id - a.id);
      setTransactions(unique);
      
      if (unique.length === 0 && supaRes.status === 'rejected') {
        setError('Gagal memuat data. Periksa koneksi internet kamu.');
      }
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan yang tidak terduga.');
    } finally {
      setLoading(false);
      setIsFetching(false);
      setIsSyncingGAS(false);
    }
  }, [transactions.length, setTransactions]);


  const fetchGoals = useCallback(async (userId: string, isRefresh = false) => {
    if (globalHasFetchedGoals && !isRefresh) return;
    globalHasFetchedGoals = true;
    
    setIsFetching(true);
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
    } finally {
      setIsFetching(false);
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
