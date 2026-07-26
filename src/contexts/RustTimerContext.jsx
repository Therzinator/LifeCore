import { createContext, useContext } from 'react';
import { useRustTimer } from '../hooks/useRustTimer.js';
import { useTrainingInstellingen } from '../hooks/useTrainingInstellingen.js';
import { usePipTimer } from '../hooks/usePipTimer.js';

const RustTimerContext = createContext(null);

const PIP_LABEL = 'Rust · volgende set';

// Eén instantie boven de paginawissel-logica in App.jsx, zodat een lopende
// rusttimer een navigatie naar een andere module overleeft — zonder dit zou
// TrainingPagina.jsx 'm rechtstreeks via useRustTimer() aanmaken, en dan stopt
// de timer zodra de component unmount (elke moduleswitch remount't de
// actieve pagina, zie de ErrorBoundary key={pagina} in App.jsx). Precies het
// 'breed gedeeld zonder prop-drilling'-uitzonderingsgeval uit CLAUDE.md §4.
export function RustTimerProvider({ children }) {
  const { instellingen } = useTrainingInstellingen();
  const timer = useRustTimer(instellingen.geluidFragment);
  const pip = usePipTimer(timer.resterend, timer.totaal, PIP_LABEL);
  return <RustTimerContext.Provider value={{ ...timer, pip }}>{children}</RustTimerContext.Provider>;
}

export function useRustTimerContext() {
  const timer = useContext(RustTimerContext);
  if (!timer) throw new Error('useRustTimerContext moet binnen een RustTimerProvider gebruikt worden');
  return timer;
}
