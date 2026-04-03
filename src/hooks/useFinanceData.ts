import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Goal, RawTransaction } from '../types';
import { processIncomingData } from '../lib/utils';
import { DUMMY_DATA } from '../lib/constants';

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

    try {
      // ═══ SINGLE SOURCE: SUPABASE ═══
      const { data, error: dbError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', String(userId));

      if (dbError) throw dbError;

      const processed = processIncomingData(data as RawTransaction[])
        .map(item => ({ ...item, source: 'supabase' as const }));

      // Urutkan berdasarkan tanggal terbaru
      processed.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime() || b.id - a.id);
      
      setTransactions(processed);
    } catch (e) {
      console.error('[BudgetIN] Fetch Error:', e);
      setError('Gagal memuat data. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
      setIsFetching(false);
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
  }, [setGoals]);

  const startDemo = useCallback(() => {
    setTransactions(processIncomingData(DUMMY_DATA));
    setLoading(false);
    setError(null);
  }, [setTransactions]);

  return {
    transactions,
    setTransactions,
    goals,
    setGoals,
    isFetching,
    loading,
    error,
    fetchData,
    fetchGoals,
    startDemo,
  };
}
