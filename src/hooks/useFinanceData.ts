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
    let supaLoadedData: Transaction[] = [];

    // 1. Fetch Cepat dari Supabase (Data Terkini)
    try {
      const { data, error: dbError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', String(userId));

      if (dbError) throw dbError;

      if (data) {
        supaLoadedData = processIncomingData(data as RawTransaction[])
          .map(item => ({ ...item, source: 'supabase' as const }));
        supaLoadedData.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime() || b.id - a.id);
        setTransactions(supaLoadedData);
      }
    } catch (e) {
      console.warn('[BudgetIN] Supabase fetch gagal', e);
      // Jangan set error fatal dulu, mungkin bisa diselamatkan lewat GAS
    } finally {
      // Bebaskan loading secepat kilat!
      setLoading(false); 
    }

    // 2. Sync Silent Latar Belakang dari Google Sheets (Data Lawas)
    setIsSyncingGAS(true);
    try {
      const res = await fetch(`${GAS_URL}?userid=${userId}`);
      const json = await res.json() as { status: string; data: RawTransaction[] };
      if (json.status === 'success') {
        const sheetData = processIncomingData(json.data)
          .map(item => ({ ...item, source: 'sheet' as const }));
          
        setTransactions(prev => {
          const combined = [...prev, ...sheetData];
          const unique = combined.filter((item, index, self) =>
            index === self.findIndex(tx =>
              tx.dateKey === item.dateKey &&
              tx.amount === item.amount &&
              tx.desc?.toLowerCase() === item.desc?.toLowerCase()
            )
          );
          return unique.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime() || b.id - a.id);
        });
      }
    } catch (e) {
      console.warn('[BudgetIN] Sheets sync gagal', e);
    } finally {
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
