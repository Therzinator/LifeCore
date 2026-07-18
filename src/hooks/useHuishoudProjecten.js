import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { verdeelKlusjesOverMaanden } from '../lib/werk/projectVerdeling.js';

function leegRecord() {
  return nieuwRecord({ projecten: [] });
}

function nieuweId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function huidigeMaandKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Herverdeelt alle klusjes van een project opnieuw over zijn maanden —
// aangeroepen na elke wijziging (toevoegen/verwijderen/duur aanpassen) zodat
// de maandindeling altijd een verse, consistente LPT-verdeling is i.p.v.
// incrementeel te verschuiven en scheef te groeien.
function herverdeel(project) {
  const klusjes = verdeelKlusjesOverMaanden(project.klusjes, project.aantalMaanden, project.startMaand);
  return { ...project, klusjes };
}

export function useHuishoudProjecten() {
  const [record, setRecordState] = useState(() => leesLokaal('huishoud_projecten', leegRecord()));

  const voegProjectToe = useCallback((naam, aantalMaanden, klusjeTeksten) => {
    setRecordState((huidig) => {
      const klusjes = klusjeTeksten.map((tekst) => ({
        id: nieuweId('kl'), tekst, geschatteUren: 1, afgerond: false, afgerondOp: null,
      }));
      const nieuw = herverdeel({
        id: nieuweId('proj'), naam, aantalMaanden, startMaand: huidigeMaandKey(),
        aangemaaktOp: new Date().toISOString(), klusjes,
      });
      const projecten = [...(huidig.projecten ?? []), nieuw];
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggleKlusje = useCallback((projectId, klusjeId) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => {
        if (p.id !== projectId) return p;
        const klusjes = p.klusjes.map((k) => {
          if (k.id !== klusjeId) return k;
          const afgerond = !k.afgerond;
          return { ...k, afgerond, afgerondOp: afgerond ? new Date().toISOString() : null };
        });
        return { ...p, klusjes };
      });
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const zetGeschatteUren = useCallback((projectId, klusjeId, uren) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => {
        if (p.id !== projectId) return p;
        const klusjes = p.klusjes.map((k) => (k.id === klusjeId ? { ...k, geschatteUren: Math.max(0.5, uren) } : k));
        return herverdeel({ ...p, klusjes });
      });
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderKlusje = useCallback((projectId, klusjeId) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => {
        if (p.id !== projectId) return p;
        return herverdeel({ ...p, klusjes: p.klusjes.filter((k) => k.id !== klusjeId) });
      });
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderProject = useCallback((projectId) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ projecten: huidig.projecten.filter((p) => p.id !== projectId) });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return {
    projecten: record.projecten ?? [],
    voegProjectToe,
    toggleKlusje,
    zetGeschatteUren,
    verwijderKlusje,
    verwijderProject,
  };
}
