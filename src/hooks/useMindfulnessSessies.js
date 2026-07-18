import { useEffect, useState } from 'react';
import { haalThemas, haalSessies } from '../lib/supabase/mindfulness.js';

export function useMindfulnessSessies() {
  const [themas, setThemas] = useState([]);
  const [sessies, setSessies] = useState([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let actief = true;
    setLaden(true);
    Promise.all([haalThemas(), haalSessies()]).then(([t, s]) => {
      if (!actief) return;
      setThemas(t);
      setSessies(s);
      setLaden(false);
    });
    return () => { actief = false; };
  }, []);

  return { themas, sessies, laden };
}
