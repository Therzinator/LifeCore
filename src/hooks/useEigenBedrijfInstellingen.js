import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

// Startpatroon uit de opdracht — een startpunt, geen vast gegeven (zie
// EigenBedrijfInstellingen.jsx: dag, tijden en soort zijn allemaal
// bewerkbaar). dagNr is ISO 1=ma..7=zo, zelfde conventie als werkdagen/
// klusjesDag in useWerkInstellingen.js.
const STANDAARD = {
  blokken: [
    { id: 'eb_di', dagNr: 2, start: '19:30', eind: '21:30', soort: 'facturabel' },
    { id: 'eb_do', dagNr: 4, start: '19:30', eind: '21:30', soort: 'platform' },
    { id: 'eb_za', dagNr: 6, start: '09:00', eind: '12:00', soort: 'flexibel' },
    { id: 'eb_zo', dagNr: 7, start: '20:00', eind: '20:30', soort: 'toets' },
  ],
  signaalActief: true,
  // Onderbouwing: zie koppeling6_eigenBedrijfOverschrijding in
  // lib/signalen/kruisverbanden.js — twee weken op rij is bewust dezelfde
  // "geen incident, wel een patroon"-drempel als koppeling 4 (3 weken
  // trainingsstagnatie is drie gemiste cycli); hier is de cyclus zelf al
  // wekelijks, dus twee op rij is het kleinst mogelijke patroon.
  signaalWekenOpRij: 2,
  signaalPctBovenSchema: 25,
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

function nieuweBlokId() {
  return `eb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useEigenBedrijfInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => (
    { ...standaardRecord(), ...leesLokaal('eigenbedrijf_instellingen', {}) }
  ));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('eigenbedrijf_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const voegBlokToe = useCallback((blok) => {
    setInstellingenState((huidig) => {
      const nieuw = { id: nieuweBlokId(), dagNr: 2, start: '19:00', eind: '21:00', soort: 'facturabel', ...blok };
      const bijgewerkt = nieuwRecord({ ...huidig, blokken: [...huidig.blokken, nieuw] });
      schrijfLokaal('eigenbedrijf_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const werkBlokBij = useCallback((id, patch) => {
    setInstellingenState((huidig) => {
      const blokken = huidig.blokken.map((b) => (b.id === id ? { ...b, ...patch } : b));
      const bijgewerkt = nieuwRecord({ ...huidig, blokken });
      schrijfLokaal('eigenbedrijf_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderBlok = useCallback((id) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, blokken: huidig.blokken.filter((b) => b.id !== id) });
      schrijfLokaal('eigenbedrijf_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { instellingen, bewaar, voegBlokToe, werkBlokBij, verwijderBlok };
}
