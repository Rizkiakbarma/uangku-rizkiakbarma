import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Goal, RawTransaction } from '../types';
import { processIncomingData } from '../lib/utils';
import { DUMMY_DATA } from '../lib/constants';

const GAS_URL = process.env.REACT_APP_GAS_URL ?? '';

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncingGAS, setIsSyncingGAS] = useState(false);

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    setIsSyncingGAS(true);
    
    try {
      // Jalankan fetch Supabase & GAS secara bersamaan (Parallel)
      const [supaRes, gasRes] = await Promise.allSettled([
        supabase.from('transactions').select('*').eq('user_id', String(userId)),
        fetch(`${GAS_URL}?userid=${userId}`).then(res => res.json())
      ]);

      let combinedData: Transaction[] = [];

      // 1. Ekstrak Hasil Supabase
      if (supaRes.status === 'fulfilled' && supaRes.value.data) {
        combinedData = processIncomingData(supaRes.value.data as RawTransaction[])
          .map(item => ({ ...item, source: 'supabase' as const }));
      } else if (supaRes.status === 'rejected') {
        console.warn('[BudgetIN] Supabase fetch gagal:', supaRes.reason);
      }

      // 2. Ekstrak Hasil Google Sheets
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

      // 3. Filter Duplikat & Sort
      const unique = combinedData.filter((item, index, self) =>
        index === self.findIndex(tx =>
          tx.dateKey === item.dateKey &&
          tx.amount === item.amount &&
          tx.desc?.toLowerCase() === item.desc?.toLowerCase()
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
      setIsSyncingGAS(false);
    }
  }, []);

  const fetchGoals = useCallback(async (userId: string) => {
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
    loading,
    error,
    isSyncingGAS,
    fetchData,
    fetchGoals,
    startDemo,
  };
}
