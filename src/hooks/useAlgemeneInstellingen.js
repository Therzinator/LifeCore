import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

// Eén centrale plek voor instellingen die de hele app raken — vooralsnog
// alleen geluid per module, met een module per key die daadwerkelijk een
// geluidssignaal gebruikt (rusttimer-chime).
const STANDAARD_GELUID = { training: true, focus: true, ochtend: true };

function standaardRecord() {
  return nieuwRecord({ geluid: { ...STANDAARD_GELUID } });
}

export function useAlgemeneInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => leesLokaal('algemene_instellingen', standaardRecord()));

  const zetGeluid = useCallback((module, aan) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, geluid: { ...huidig.geluid, [module]: aan } });
      schrijfLokaal('algemene_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { instellingen, zetGeluid };
}
