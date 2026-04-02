import { RawTransaction, Transaction } from '../types';

export const formatRp = (num: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num || 0);

export const axisFormatter = (num: number): string =>
  new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);

export function processIncomingData(rawList: RawTransaction[]): Transaction[] {
  return rawList.map((item) => {
    const d = new Date(item.date as string);
    return {
      id: Number(item.id),
      date: item.date as string,
      amount: Number(item.amount),
      type: (String(item.type).toUpperCase() === 'MASUK' ? 'MASUK' : 'KELUAR') as 'MASUK' | 'KELUAR',
      category: String(item.category || ''),
      description: item.description as string | undefined,
      desc: String(item.description || item.desc || 'Transaksi'),
      dateObj: d,
      dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dateStr: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
      user_id: item.user_id as string | undefined,
      status: item.status as string | undefined,
    };
  });
}
