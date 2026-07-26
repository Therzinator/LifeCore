import { createContext, useCallback, useContext, useEffect } from 'react';
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
  // stop/plus laten Chrome's video-PiP-overlay eigen bedieningsknoppen tonen
  // (via MediaSession, zie usePipTimer.js) — zo kan de rusttimer zonder
  // terug te keren naar de app overgeslagen of verlengd worden.
  const pip = usePipTimer(timer.resterend, timer.totaal, PIP_LABEL, { stop: timer.stop, plus: timer.plus });

  // start() wordt altijd rechtstreeks vanuit een klik/tik (set afvinken)
  // aangeroepen — dat is de enige geldige gelegenheid om ook meteen PiP te
  // activeren (de Picture-in-Picture-API weigert een aanvraag die niet
  // synchroon binnen zo'n user-gesture valt). Zo staat het zwevende venster
  // al klaar tegen de tijd dat de gebruiker de app minimaliseert, i.p.v. dat
  // ze daarvoor apart op 'Open als zwevend venster' moeten tikken.
  const start = useCallback((seconden, tussensignaal) => {
    timer.start(seconden, tussensignaal);
    if (instellingen.pipAutomatisch && pip.ondersteund && !pip.actief) pip.activeer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer.start/pip.activeer zijn stabiele useCallback-referenties; alleen instellingen.pipAutomatisch/pip.ondersteund/pip.actief bepalen het gedrag hier.
  }, [instellingen.pipAutomatisch, pip.ondersteund, pip.actief]);

  // timer.klaarInfo wordt alleen gezet als een rustperiode zelf afloopt (niet
  // bij handmatig stop()) — hier bepalen we wat dat betekent. Was het
  // zwevende venster niet actief (je zat gewoon op de trainingspagina), dan
  // ziet de bestaande inline RustTimer-kaart het toch al meteen: klaarInfo
  // meteen weer wissen, geen extra melding nodig. Was het wél actief, dan
  // volgen we de instelling: 'terugNaarApp' sluit het PiP-venster (== zelf op
  // de 'terug naar tabblad'-knop drukken) i.p.v. te wachten tot de gebruiker
  // dat zelf doet en dan een venster te tonen.
  useEffect(() => {
    if (!timer.klaarInfo) return;
    if (!pip.actief) { timer.wisKlaar(); return; }
    if (instellingen.rustEindeActie === 'terugNaarApp') {
      pip.sluiten();
      timer.wisKlaar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer.wisKlaar/pip.sluiten zijn stabiele useCallback-referenties; alleen timer.klaarInfo/pip.actief/instellingen.rustEindeActie bepalen het gedrag hier.
  }, [timer.klaarInfo, pip.actief, instellingen.rustEindeActie]);

  return <RustTimerContext.Provider value={{ ...timer, start, pip }}>{children}</RustTimerContext.Provider>;
}

export function useRustTimerContext() {
  const timer = useContext(RustTimerContext);
  if (!timer) throw new Error('useRustTimerContext moet binnen een RustTimerProvider gebruikt worden');
  return timer;
}
