import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { vandaagKey } from '../utils/datum.js';

function leegRecord() {
  return nieuwRecord({ taken: [] });
}

function nieuweId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Vóór de eigen Werk-projectenlaag (zie useWerkProjecten.js) wees projectId
// naar een Kluslijst-project (id-prefix 'proj_'). Die koppeling is
// losgekoppeld, dus zo'n oude verwijzing wijst nu naar niets meer — eenmalig
// opgeschoond bij het lezen i.p.v. stil te blijven verwijzen naar een
// project buiten de nieuwe (Werk-eigen) namespace.
function opgeschoondeTaken(taken) {
  return taken.map((t) => (
    t.projectId && !t.projectId.startsWith('wproj_') ? { ...t, projectId: null } : t
  ));
}

// Werktaken zijn gekoppeld aan de dagelijkse werkcontext (Gemeente Oldambt) —
// geen carry-over-logica nodig voor "openstaand van eerdere dagen": een taak
// die niet is afgevinkt blijft gewoon zichtbaar, ongeacht op welke dag hij
// is aangemaakt.
export function useWerkTaken() {
  const [record, setRecordState] = useState(() => {
    const gelezen = leesLokaal('werk_taken', leegRecord());
    return { ...gelezen, taken: opgeschoondeTaken(gelezen.taken ?? []) };
  });

  const voegMeerdereToe = useCallback((teksten, focusMinuten = null, categorie = null, projectId = null) => {
    setRecordState((huidig) => {
      const nieuwe = teksten.map((tekst) => ({
        id: nieuweId('wt'), tekst, focusMinuten, categorie, projectId, klaar: false, aangemaaktOp: vandaagKey(), afgerondOp: null,
      }));
      const taken = [...(huidig.taken ?? []), ...nieuwe];
      const bijgewerkt = nieuwRecord({ taken });
      schrijfLokaal('werk_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggleKlaar = useCallback((id) => {
    setRecordState((huidig) => {
      const taken = huidig.taken.map((t) => {
        if (t.id !== id) return t;
        const klaar = !t.klaar;
        return { ...t, klaar, afgerondOp: klaar ? vandaagKey() : null };
      });
      const bijgewerkt = nieuwRecord({ taken });
      schrijfLokaal('werk_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const zetFocusMinuten = useCallback((id, minuten) => {
    setRecordState((huidig) => {
      const taken = huidig.taken.map((t) => (t.id === id ? { ...t, focusMinuten: minuten } : t));
      const bijgewerkt = nieuwRecord({ taken });
      schrijfLokaal('werk_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  // Bij een categorie-hernoeming (zie useWerkInstellingen.hernoemCategorie)
  // slaan bestaande taken de OUDE naam nog op als los stringveld — zonder
  // deze migratie zou een hernoeming die taken laten "verweesd" achter een
  // categorienaam die nergens meer in de instellingen-lijst voorkomt.
  const hernoemCategorieOpTaken = useCallback((oud, nieuw) => {
    setRecordState((huidig) => {
      const taken = huidig.taken.map((t) => (t.categorie === oud ? { ...t, categorie: nieuw } : t));
      const bijgewerkt = nieuwRecord({ taken });
      schrijfLokaal('werk_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ taken: huidig.taken.filter((t) => t.id !== id) });
      schrijfLokaal('werk_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  // Koppelt (of ontkoppelt met projectId=null) een werktaak aan een
  // Kluslijst-project — zie useHuishoudProjecten voor het project zelf.
  const zetProject = useCallback((id, projectId) => {
    setRecordState((huidig) => {
      const taken = huidig.taken.map((t) => (t.id === id ? { ...t, projectId } : t));
      const bijgewerkt = nieuwRecord({ taken });
      schrijfLokaal('werk_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const alleTaken = record.taken ?? [];
  const openstaand = alleTaken.filter((t) => !t.klaar);

  return { alleTaken, openstaand, voegMeerdereToe, toggleKlaar, zetFocusMinuten, zetProject, hernoemCategorieOpTaken, verwijder };
}
