import { createClient } from '@supabase/supabase-js';

// Fallback ke placeholder agar createClient tidak throw TypeError saat env vars kosong
// (terjadi di Vercel jika env vars belum dikonfigurasi di dashboard)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || 'placeholder-anon-key';

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_KEY) {
  console.error('[BudgetIN] ⚠️ Supabase env variables belum dikonfigurasi. Set REACT_APP_SUPABASE_URL dan REACT_APP_SUPABASE_KEY di Vercel Dashboard → Settings → Environment Variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
