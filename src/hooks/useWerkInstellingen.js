import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

const STANDAARD = {
  starttijd: '09:00',
  werkdagen: [1, 2, 3, 4, 5],
  categorieen: ['Algemeen'],
  oldambtModus: false,
  // ISO-weekdagnummer (1=ma..7=zo) voor de vaste, terugkerende Klusjes-dag
  // (zie AgendaDag/agendaSignalen) — null = nog niet ingesteld.
  klusjesDag: null,
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useWerkInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => ({ ...standaardRecord(), ...leesLokaal('werk_instellingen', {}) }));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('werk_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const voegCategorieToe = useCallback((naam) => {
    const schoon = naam.trim();
    if (!schoon) return;
    setInstellingenState((huidig) => {
      if (huidig.categorieen.includes(schoon)) return huidig;
      const bijgewerkt = nieuwRecord({ ...huidig, categorieen: [...huidig.categorieen, schoon] });
      schrijfLokaal('werk_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderCategorie = useCallback((naam) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, categorieen: huidig.categorieen.filter((c) => c !== naam) });
      schrijfLokaal('werk_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { instellingen, bewaar, voegCategorieToe, verwijderCategorie };
}
