import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

// Dagdeel-vensters voor de Agenda-suggesties (Kluslijst/huishouden/mediteren)
// — vervangt de vaste 10:00-met-automatisch-doorschuiven-aanpak (zie
// agendaBlokken.js volgendeVrijeTijdInVenster). Los van Training's
// voorkeurTijdOchtend/Middag/Avond (die zijn 1 exact tijdstip per dagdeel
// voor lift-/cardio-suggesties, dit zijn brede vensters om binnen te zoeken).
const STANDAARD = {
  dagdeelOchtend: { start: '09:00', eind: '12:00' },
  dagdeelMiddag: { start: '13:00', eind: '17:00' },
  dagdeelAvond: { start: '19:00', eind: '21:30' },
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useAgendaInstellingen() {
  const [instellingen, setInstellingenState] = useState(
    () => ({ ...standaardRecord(), ...leesLokaal('agenda_instellingen', {}) }),
  );

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('agenda_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { instellingen, bewaar };
}
