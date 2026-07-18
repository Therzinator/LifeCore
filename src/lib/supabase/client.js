import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED = Boolean(URL && ANON_KEY);

let _sb = null;

export function sbClient() {
  if (!SUPABASE_ENABLED) return null;
  if (_sb) return _sb;
  try {
    _sb = createClient(URL, ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return _sb;
  } catch (e) {
    console.error('Kon Supabase-client niet initialiseren', e);
    return null;
  }
}
