import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { vandaagKey } from '../utils/datum.js';

// Gelogde TJB Solutions-tijd — platte array, zelfde vorm als
// useCardioSessies.js. Losstaand van de Gemeente-werktakenlijst
// (useWerkTaken.js): dit is een tijd-log, geen taken-afvinklijst, dus een
// eigen, simpeler model i.p.v. het taken-model op te rekken met een
// context-veld dat er qua betekenis niet bij past.
function leegRecord() {
  return nieuwRecord({ sessies: [] });
}

export function useEigenBedrijfSessies() {
  const [record, setRecordState] = useState(() => leesLokaal('eigenbedrijf_sessies', leegRecord()));

  // categorie is verplicht ('facturabel' | 'platform') — de aanroepende UI
  // dwingt een keuze af vóór dit aangeroepen wordt, geen null-pad hier.
  // datum is instelbaar (default vandaag) zodat een gemiste dag alsnog
  // achteraf gelogd kan worden.
  const voegToe = useCallback(({ minuten, categorie, tekst, datum }) => {
    setRecordState((huidig) => {
      const sessie = { id: Date.now(), datum: datum || vandaagKey(), minuten, categorie, tekst: tekst || '' };
      const bijgewerkt = nieuwRecord({ sessies: [sessie, ...(huidig.sessies ?? [])] });
      schrijfLokaal('eigenbedrijf_sessies', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  // Nooit automatisch wissen bij een overschreden week (guilt-free-principe
  // — geschiedenis blijft zichtbaar) — verwijder is uitsluitend voor het
  // corrigeren van een fout gelogde sessie.
  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ sessies: (huidig.sessies ?? []).filter((s) => s.id !== id) });
      schrijfLokaal('eigenbedrijf_sessies', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { sessies: record.sessies ?? [], voegToe, verwijder };
}
