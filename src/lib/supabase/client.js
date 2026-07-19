import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED = Boolean(URL && ANON_KEY);

let _sb = null;

// Uniek suffix voor Realtime-kanaalnamen — een kanaalnaam die puur op
// huishoudenId is gebaseerd (bv. `kluslijst_projecten:${huishoudenId}`)
// botst zodra een pagina per ongeluk twee instanties van dezelfde hook
// mount: de tweede `.channel(zelfde naam)` krijgt het al-`subscribe()`de
// kanaal van de eerste terug, en `.on(...)` daarop gooit een fatale error
// (zie AgendaPagina.jsx-geschiedenis). Elke abonneerOp*-aanroep krijgt
// hierdoor een eigen identiteit, ook als de onderliggende tabel/filter
// hetzelfde is.
export function uniekKanaalId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

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
