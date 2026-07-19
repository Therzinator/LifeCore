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

// Past een updater toe op één specifiek klusje binnen één specifiek project
// — gedeeld door de subklusje-acties hieronder, die anders alledrie
// dezelfde geneste project->klusje-map zouden herhalen.
function bijwerkKlusje(projecten, projectId, klusjeId, updater) {
  return projecten.map((p) => {
    if (p.id !== projectId) return p;
    const klusjes = p.klusjes.map((k) => (k.id === klusjeId ? updater(k) : k));
    return { ...p, klusjes };
  });
}

export function useHuishoudProjecten() {
  const [record, setRecordState] = useState(() => leesLokaal('huishoud_projecten', leegRecord()));

  const voegProjectToe = useCallback((naam, aantalMaanden, klusjeTeksten, deadline = null) => {
    setRecordState((huidig) => {
      const klusjes = klusjeTeksten.map((tekst) => ({
        id: nieuweId('kl'), tekst, geschatteUren: 1, afgerond: false, afgerondOp: null, subklusjes: [],
      }));
      const nieuw = herverdeel({
        id: nieuweId('proj'), naam, aantalMaanden, startMaand: huidigeMaandKey(), deadline,
        aangemaaktOp: new Date().toISOString(), klusjes,
      });
      const projecten = [...(huidig.projecten ?? []), nieuw];
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const zetDeadline = useCallback((projectId, deadline) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => (p.id === projectId ? { ...p, deadline } : p));
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

  // Subklusjes — een klusje verder opdelen in kleinere stukjes voor extra
  // grote taken. Blijven puur een breakdown binnen het klusje: ze tellen
  // niet mee in de maandverdeling (die blijft op het klusje als geheel
  // draaien) en het klusje zelf blijft los, handmatig afvinkbaar — geen
  // automatische 'alle subklusjes af = klusje af'-koppeling, dat zou een
  // verrassende bijwerking zijn voor wie het klusje zelf al had afgevinkt.
  const voegSubklusjeToe = useCallback((projectId, klusjeId, tekst) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: [...(k.subklusjes ?? []), { id: nieuweId('skl'), tekst, afgerond: false, afgerondOp: null }],
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggleSubklusje = useCallback((projectId, klusjeId, subklusjeId) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: (k.subklusjes ?? []).map((s) => {
          if (s.id !== subklusjeId) return s;
          const afgerond = !s.afgerond;
          return { ...s, afgerond, afgerondOp: afgerond ? new Date().toISOString() : null };
        }),
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderSubklusje = useCallback((projectId, klusjeId, subklusjeId) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: (k.subklusjes ?? []).filter((s) => s.id !== subklusjeId),
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return {
    projecten: record.projecten ?? [],
    voegProjectToe,
    zetDeadline,
    toggleKlusje,
    zetGeschatteUren,
    verwijderKlusje,
    verwijderProject,
    voegSubklusjeToe,
    toggleSubklusje,
    verwijderSubklusje,
  };
}
