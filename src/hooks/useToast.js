import { useCallback, useRef, useState } from 'react';

let volgendId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const verwijderToast = useCallback((id) => {
    setToasts((huidig) => huidig.filter((t) => t.id !== id));
    clearTimeout(timeoutsRef.current.get(id));
    timeoutsRef.current.delete(id);
  }, []);

  const toonToast = useCallback((tekst, type = 'neu') => {
    const id = volgendId++;
    setToasts((huidig) => [...huidig, { id, tekst, type }]);
    const timeoutId = setTimeout(() => verwijderToast(id), 3200);
    timeoutsRef.current.set(id, timeoutId);
  }, [verwijderToast]);

  return { toasts, toonToast, verwijderToast };
}
