import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { verdeelKlusjesOverMaanden, berekenGeschatteUren } from '../lib/werk/projectVerdeling.js';

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

// Zoals bijwerkKlusje, maar voor wijzigingen aan de stappen van een klusje —
// herberekent daarna geschatteUren uit de stappen (zie berekenGeschatteUren)
// en herverdeelt het project opnieuw, want een gewijzigde duur kan de
// maandindeling verschuiven.
function bijwerkStappen(projecten, projectId, klusjeId, updater) {
  const bijgewerkt = bijwerkKlusje(projecten, projectId, klusjeId, (k) => {
    const nieuw = updater(k);
    return { ...nieuw, geschatteUren: berekenGeschatteUren(nieuw) };
  });
  return bijgewerkt.map((p) => (p.id === projectId ? herverdeel(p) : p));
}

export function useHuishoudProjecten() {
  const [record, setRecordState] = useState(() => leesLokaal('huishoud_projecten', leegRecord()));

  const voegProjectToe = useCallback((naam, aantalMaanden, klusjeTeksten, deadline = null) => {
    setRecordState((huidig) => {
      const klusjes = klusjeTeksten.map((tekst) => ({
        id: nieuweId('kl'), tekst, geschatteUren: 1, afgerond: false, afgerondOp: null, subklusjes: [], vereistKlusjeId: null,
      }));
      const nieuw = herverdeel({
        id: nieuweId('proj'), naam, aantalMaanden, startMaand: huidigeMaandKey(), deadline,
        aangemaaktOp: new Date().toISOString(), klusjes, werkvoorbereiding: [],
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
        // Klusjes die dit klusje als vereiste hadden, verliezen die koppeling
        // — anders zou hun 'vereistKlusjeId' naar niets meer verwijzen.
        const klusjes = p.klusjes
          .filter((k) => k.id !== klusjeId)
          .map((k) => (k.vereistKlusjeId === klusjeId ? { ...k, vereistKlusjeId: null } : k));
        return herverdeel({ ...p, klusjes });
      });
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  // Taakvolgorde — een klusje kan pas 'op te pakken' zijn als een ander
  // klusje uit hetzelfde project al is afgerond. Blokkeert bewust NIET het
  // handmatig afvinken zelf (geen paternalistische lock op de checkbox) —
  // het wordt alleen gebruikt om de Agenda-suggesties (Klusjes-dag) te
  // filteren, zodat de app geen klusje voorstelt waarvan de vereiste nog
  // openstaat. vereistKlusjeId=null betekent 'geen vereiste'.
  const zetVereistKlusje = useCallback((projectId, klusjeId, vereistKlusjeId) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({ ...k, vereistKlusjeId }));
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  // Werkvoorbereiding — een losse checklist per PROJECT (niet per klusje)
  // voor bv. bouwmarkt-materiaal en zaagmaten, met een simpele check erbij.
  // Zelfde vorm als de stappen-checklist bij een klusje, maar dan één
  // niveau hoger; telt niet mee in de maandverdeling of geschatteUren.
  const voegWerkvoorbereidingToe = useCallback((projectId, tekst) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => (p.id === projectId ? {
        ...p,
        werkvoorbereiding: [...(p.werkvoorbereiding ?? []), { id: nieuweId('wv'), tekst, afgerond: false }],
      } : p));
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggleWerkvoorbereiding = useCallback((projectId, itemId) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => (p.id === projectId ? {
        ...p,
        werkvoorbereiding: (p.werkvoorbereiding ?? []).map((w) => (w.id === itemId ? { ...w, afgerond: !w.afgerond } : w)),
      } : p));
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderWerkvoorbereiding = useCallback((projectId, itemId) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => (p.id === projectId ? {
        ...p,
        werkvoorbereiding: (p.werkvoorbereiding ?? []).filter((w) => w.id !== itemId),
      } : p));
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

  // Subklusjes ("stappen" in de UI) — een klusje verder opdelen in kleinere
  // stukjes voor extra grote taken. Elke stap draagt zijn eigen duurUren;
  // zodra een klusje stappen heeft, is zijn geschatteUren niet langer los
  // instelbaar maar de som van die stappen (zie berekenGeschatteUren), en
  // telt dus wél mee in de maandverdeling. Het klusje zelf blijft los,
  // handmatig afvinkbaar — geen automatische 'alle stappen af = klusje
  // af'-koppeling, dat zou een verrassende bijwerking zijn voor wie het
  // klusje zelf al had afgevinkt.
  const voegSubklusjeToe = useCallback((projectId, klusjeId, tekst, duurUren = 0.5) => {
    setRecordState((huidig) => {
      const projecten = bijwerkStappen(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: [...(k.subklusjes ?? []), { id: nieuweId('skl'), tekst, duurUren, afgerond: false, afgerondOp: null }],
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

  const zetStapUren = useCallback((projectId, klusjeId, subklusjeId, duurUren) => {
    setRecordState((huidig) => {
      const projecten = bijwerkStappen(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: (k.subklusjes ?? []).map((s) => (
          s.id === subklusjeId ? { ...s, duurUren: Math.max(0.25, duurUren) } : s
        )),
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderSubklusje = useCallback((projectId, klusjeId, subklusjeId) => {
    setRecordState((huidig) => {
      const projecten = bijwerkStappen(huidig.projecten, projectId, klusjeId, (k) => ({
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
    zetStapUren,
    verwijderSubklusje,
    zetVereistKlusje,
    voegWerkvoorbereidingToe,
    toggleWerkvoorbereiding,
    verwijderWerkvoorbereiding,
  };
}
