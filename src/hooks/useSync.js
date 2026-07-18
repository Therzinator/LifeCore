import { useCallback, useState } from 'react';
import { synchroniseerAlles } from '../lib/supabase/sync.js';

export function useSync(userId) {
  const [status, setStatus] = useState('lokaal');

  const syncNu = useCallback(async () => {
    if (!userId) return;
    setStatus('bezig');
    const { ok } = await synchroniseerAlles(userId);
    setStatus(ok ? 'gelukt' : 'mislukt');
  }, [userId]);

  return { status, syncNu };
}
