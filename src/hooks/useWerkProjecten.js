import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ projecten: [] });
}

function nieuweId() {
  return `wproj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Eigen projectenlaag voor Werk, los van de Kluslijst-projecten (Thuis-
// module, zie useHuishoudProjecten.js). Werk hergebruikte voorheen de
// Kluslijst-projecten alleen om werktaken te taggen — een werktaak kreeg
// daardoor onbedoeld ook een plek in Kluslijst's maandoverzicht (zie
// lib/werk/projectVerdeling.js). Bewust een simpele naam-lijst i.p.v. de
// volledige klusjes/maandverdeling-machinerie van Kluslijst: Werk heeft
// alleen een tag nodig, geen planning. Puur lokaal (geen huishoudenId) —
// werk_taken zelf is dat ook al, dus een gedeelde projectenlaag zou een
// halfgedeelde staat opleveren.
export function useWerkProjecten() {
  const [record, setRecordState] = useState(() => leesLokaal('werk_projecten', leegRecord()));

  const voegProjectToe = useCallback((naam) => {
    const schoon = naam.trim();
    if (!schoon) return;
    setRecordState((huidig) => {
      const nieuw = { id: nieuweId(), naam: schoon };
      const bijgewerkt = nieuwRecord({ projecten: [...(huidig.projecten ?? []), nieuw] });
      schrijfLokaal('werk_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderProject = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ projecten: (huidig.projecten ?? []).filter((p) => p.id !== id) });
      schrijfLokaal('werk_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const hernoemProject = useCallback((id, naam) => {
    const schoon = naam.trim();
    if (!schoon) return;
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({
        projecten: (huidig.projecten ?? []).map((p) => (p.id === id ? { ...p, naam: schoon } : p)),
      });
      schrijfLokaal('werk_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { projecten: record.projecten ?? [], voegProjectToe, verwijderProject, hernoemProject };
}
