import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { verdeelKlusjesOverMaanden, berekenGeschatteUren } from '../lib/werk/projectVerdeling.js';
import {
  haalProjecten, maakProject, werkProjectBij, verwijderProject as verwijderProjectGedeeld,
  abonneerOpProjecten, rijNaarProject,
} from '../lib/supabase/kluslijstGedeeld.js';

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

// huishoudenId === null: exact het oorspronkelijke gedrag (lokale blob).
// huishoudenId gezet: projecten leven in de gedeelde kluslijst_projecten-
// tabel, live bijgehouden via Realtime — dezelfde reducer-logica hierboven
// blijft de bron van waarheid voor de VORM van een wijziging, alleen de
// opslag-stap (bewaar()) wisselt van pad.
export function useHuishoudProjecten(huishoudenId = null, userId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('huishoud_projecten', leegRecord())
  ));

  useEffect(() => {
    if (!huishoudenId) return undefined;

    let actief = true;
    async function laad() {
      const rijen = await haalProjecten(huishoudenId);
      if (actief) setRecordState(nieuwRecord({ projecten: rijen.map(rijNaarProject) }));
    }
    laad();
    const stopAbonnement = abonneerOpProjecten(huishoudenId, laad);
    return () => { actief = false; stopAbonnement(); };
  }, [huishoudenId]);

  // Slaat één gewijzigd project op — lokaal (hele blob herschrijven) of
  // gedeeld (alleen dat project-record patchen in Supabase). Wordt door elke
  // mutator hieronder aangeroepen i.p.v. rechtstreeks schrijfLokaal.
  const bewaar = useCallback((bijgewerkt, gewijzigdProjectId) => {
    if (huishoudenId) {
      const project = bijgewerkt.projecten.find((p) => p.id === gewijzigdProjectId);
      if (project) {
        werkProjectBij(project.id, {
          klusjes: project.klusjes,
          werkvoorbereiding: project.werkvoorbereiding,
          deadline: project.deadline,
        });
      }
    } else {
      schrijfLokaal('huishoud_projecten', bijgewerkt);
    }
  }, [huishoudenId]);

  const voegProjectToe = useCallback((naam, aantalMaanden, klusjeTeksten, deadline = null) => {
    setRecordState((huidig) => {
      const klusjes = klusjeTeksten.map((tekst) => ({
        id: nieuweId('kl'), tekst, geschatteUren: 1, afgerond: false, afgerondOp: null, subklusjes: [],
        vereistKlusjeId: null, fotos: [], prioriteit: false,
      }));
      const nieuw = herverdeel({
        id: nieuweId('proj'), naam, aantalMaanden, startMaand: huidigeMaandKey(), deadline,
        aangemaaktOp: new Date().toISOString(), klusjes, werkvoorbereiding: [],
      });

      if (huishoudenId) {
        // Geen optimistische toevoeging: het echte record (met zijn db-id)
        // komt terug via de Realtime-subscriptie zodra de insert lukt —
        // anders zou er kortstondig een dubbel project staan.
        maakProject(huishoudenId, userId, nieuw);
        return huidig;
      }

      const projecten = [...(huidig.projecten ?? []), nieuw];
      const bijgewerkt = nieuwRecord({ projecten });
      schrijfLokaal('huishoud_projecten', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId, userId]);

  const zetDeadline = useCallback((projectId, deadline) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => (p.id === projectId ? { ...p, deadline } : p));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  // Nieuw klusje aan een BESTAAND project toevoegen — projecten blijven
  // altijd bewerkbaar, niet alleen op het moment van aanmaken.
  const voegKlusjeToe = useCallback((projectId, tekst, geschatteUren = 1) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => {
        if (p.id !== projectId) return p;
        const nieuwKlusje = {
          id: nieuweId('kl'), tekst, geschatteUren, afgerond: false, afgerondOp: null, subklusjes: [],
          vereistKlusjeId: null, fotos: [], prioriteit: false,
        };
        return herverdeel({ ...p, klusjes: [...p.klusjes, nieuwKlusje] });
      });
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

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
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const hernoemKlusje = useCallback((projectId, klusjeId, tekst) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({ ...k, tekst }));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  // Prioriteit — voor klusjes met een externe deadline (geleend gereedschap,
  // een weerraam) die vóór de normale gewicht-gebaseerde verdeling gaat, zie
  // vergelijkVoorWachtrij in projectVerdeling.js. herverdeel() erna, want dit
  // verandert direct de maand-planning.
  const togglePrioriteit = useCallback((projectId, klusjeId) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({ ...k, prioriteit: !k.prioriteit }))
        .map((p) => (p.id === projectId ? herverdeel(p) : p));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const zetGeschatteUren = useCallback((projectId, klusjeId, uren) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => {
        if (p.id !== projectId) return p;
        const klusjes = p.klusjes.map((k) => (k.id === klusjeId ? { ...k, geschatteUren: Math.max(0.5, uren) } : k));
        return herverdeel({ ...p, klusjes });
      });
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

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
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  // Taakvolgorde — een klusje kan pas 'op te pakken' zijn als een ander
  // klusje uit hetzelfde project al is afgerond. Blokkeert bewust NIET het
  // handmatig afvinken zelf (geen paternalistische lock op de checkbox) —
  // het wordt alleen gebruikt om de Agenda-suggesties (Klusjes-dag) te
  // filteren, zodat de app geen klusje voorstelt waarvan de vereiste nog
  // openstaat. vereistKlusjeId=null betekent 'geen vereiste'.
  const zetVereistKlusje = useCallback((projectId, klusjeId, vereistKlusjeId) => {
    setRecordState((huidig) => {
      // herverdeel() na de wijziging — een nieuwe/losgekoppelde vereiste kan
      // de maandplanning direct verschuiven (zie verdeelKlusjesOverMaanden),
      // dus de opgeslagen maand-toewijzing moet meteen mee, niet pas bij de
      // eerstvolgende, andere wijziging.
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({ ...k, vereistKlusjeId }))
        .map((p) => (p.id === projectId ? herverdeel(p) : p));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  // Zelfde taakvolgorde-concept als zetVereistKlusje, maar dan op het
  // niveau van een STAP: een stap kan net zo goed pas op te pakken zijn na
  // een ander klusje (of diens stap) — bv. 'schilderen' pas na 'plamuren' in
  // een ander klusje. vereistId=null betekent 'geen vereiste'.
  const zetVereisteStap = useCallback((projectId, klusjeId, subklusjeId, vereistId) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: (k.subklusjes ?? []).map((s) => (s.id === subklusjeId ? { ...s, vereistKlusjeId: vereistId } : s)),
      })).map((p) => (p.id === projectId ? herverdeel(p) : p));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

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
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const toggleWerkvoorbereiding = useCallback((projectId, itemId) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => (p.id === projectId ? {
        ...p,
        werkvoorbereiding: (p.werkvoorbereiding ?? []).map((w) => (w.id === itemId ? { ...w, afgerond: !w.afgerond } : w)),
      } : p));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const verwijderWerkvoorbereiding = useCallback((projectId, itemId) => {
    setRecordState((huidig) => {
      const projecten = huidig.projecten.map((p) => (p.id === projectId ? {
        ...p,
        werkvoorbereiding: (p.werkvoorbereiding ?? []).filter((w) => w.id !== itemId),
      } : p));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  // Foto's per klusje — alleen het Storage-pad wordt bewaard (zie
  // lib/supabase/klusjeFotos.js), niet een kant-en-klare URL: de bucket is
  // privé, dus elke weergave haalt een verse signed URL op i.p.v. een
  // langdurig geldige link te bewaren.
  const voegFotoToe = useCallback((projectId, klusjeId, pad) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k, fotos: [...(k.fotos ?? []), pad],
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const verwijderFotoVanKlusje = useCallback((projectId, klusjeId, pad) => {
    setRecordState((huidig) => {
      const projecten = bijwerkKlusje(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k, fotos: (k.fotos ?? []).filter((f) => f !== pad),
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const verwijderProject = useCallback((projectId) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ projecten: huidig.projecten.filter((p) => p.id !== projectId) });
      if (huishoudenId) {
        verwijderProjectGedeeld(projectId);
      } else {
        schrijfLokaal('huishoud_projecten', bijgewerkt);
      }
      return bijgewerkt;
    });
  }, [huishoudenId]);

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
        subklusjes: [
          ...(k.subklusjes ?? []),
          { id: nieuweId('skl'), tekst, duurUren, afgerond: false, afgerondOp: null, vereistKlusjeId: null },
        ],
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

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
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const zetStapUren = useCallback((projectId, klusjeId, subklusjeId, duurUren) => {
    setRecordState((huidig) => {
      const projecten = bijwerkStappen(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: (k.subklusjes ?? []).map((s) => (
          s.id === subklusjeId ? { ...s, duurUren: Math.max(0.25, duurUren) } : s
        )),
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  const verwijderSubklusje = useCallback((projectId, klusjeId, subklusjeId) => {
    setRecordState((huidig) => {
      const projecten = bijwerkStappen(huidig.projecten, projectId, klusjeId, (k) => ({
        ...k,
        subklusjes: (k.subklusjes ?? []).filter((s) => s.id !== subklusjeId),
      }));
      const bijgewerkt = nieuwRecord({ projecten });
      bewaar(bijgewerkt, projectId);
      return bijgewerkt;
    });
  }, [bewaar]);

  return {
    projecten: record.projecten ?? [],
    voegProjectToe,
    voegKlusjeToe,
    hernoemKlusje,
    togglePrioriteit,
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
    zetVereisteStap,
    voegWerkvoorbereidingToe,
    toggleWerkvoorbereiding,
    verwijderWerkvoorbereiding,
    voegFotoToe,
    verwijderFotoVanKlusje,
  };
}
