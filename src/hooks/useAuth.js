import { useCallback, useEffect, useState } from 'react';
import { sbClient, SUPABASE_ENABLED } from '../lib/supabase/client.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [laden, setLaden] = useState(SUPABASE_ENABLED);

  useEffect(() => {
    const sb = sbClient();
    if (!sb) {
      setLaden(false);
      return undefined;
    }

    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLaden(false);
    });

    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, wachtwoord) => {
    const sb = sbClient();
    if (!sb) return { error: 'Supabase is niet geconfigureerd' };
    const { error } = await sb.auth.signInWithPassword({ email, password: wachtwoord });
    return { error: error?.message ?? null };
  }, []);

  const signup = useCallback(async (email, wachtwoord) => {
    const sb = sbClient();
    if (!sb) return { error: 'Supabase is niet geconfigureerd' };
    const { error } = await sb.auth.signUp({ email, password: wachtwoord });
    return { error: error?.message ?? null };
  }, []);

  const logout = useCallback(async () => {
    const sb = sbClient();
    if (sb) await sb.auth.signOut();
  }, []);

  const bijwerkenAccount = useCallback(async (patch) => {
    const sb = sbClient();
    if (!sb) return { error: 'Supabase is niet geconfigureerd' };
    const { error } = await sb.auth.updateUser(patch);
    return { error: error?.message ?? null };
  }, []);

  return { user, laden, ingelogd: Boolean(user), login, signup, logout, bijwerkenAccount, enabled: SUPABASE_ENABLED };
}
