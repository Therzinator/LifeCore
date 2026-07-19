import { leesLokaal } from '../storage/lokaal.js';
import { maakProjecten } from '../supabase/kluslijstGedeeld.js';
import { voegTakenToe, voegLogToe, voegWeekschemasToe } from '../supabase/huishoudGedeeld.js';
import { voegItemsToe as voegOntspullenToe } from '../supabase/ontspullenGedeeld.js';
import { voegItemsToe as voegBoodschappenToe } from '../supabase/boodschappenGedeeld.js';

// Pure omzet-functies (lokaal blob-record -> insert-klare db-rijen) — apart
// van de Supabase-aanroepen zelf, zodat de vorm-conversie zonder mocking
// test-baar blijft.

export function kluslijstProjectenNaarRijen(huishoudenId, userId, projecten) {
  return (projecten ?? []).map((p) => ({
    huishouden_id: huishoudenId,
    aangemaakt_door: userId,
    naam: p.naam,
    aantal_maanden: p.aantalMaanden,
    start_maand: p.startMaand,
    deadline: p.deadline ?? null,
    klusjes: p.klusjes ?? [],
    werkvoorbereiding: p.werkvoorbereiding ?? [],
  }));
}

export function huishoudTakenNaarRijen(huishoudenId, taken) {
  return (taken ?? []).map((t) => ({
    huishouden_id: huishoudenId,
    tekst: t.tekst,
    frequentie: t.frequentie,
    interval_dagen: t.frequentie === 'aangepast' ? t.intervalDagen : null,
  }));
}

// idMap koppelt het oude lokale taak-id aan het nieuwe db-uuid — nodig omdat
// het log op taak-id verwijst en de database bij het invoegen een nieuw uuid
// toekent.
export function huishoudTakenLogNaarRijen(idMap, log, userId) {
  const rijen = [];
  for (const [lokaalTaakId, perioden] of Object.entries(log ?? {})) {
    const nieuweTaakId = idMap[lokaalTaakId];
    if (!nieuweTaakId) continue;
    for (const [periode, voltooid] of Object.entries(perioden ?? {})) {
      if (voltooid) rijen.push({ taak_id: nieuweTaakId, periode, afgerond_door: userId });
    }
  }
  return rijen;
}

export function huishoudWeekschemaNaarRijen(huishoudenId, schemas) {
  return (schemas ?? []).map((s) => ({
    huishouden_id: huishoudenId,
    week_maandag: s.weekMaandag,
    toewijzing: s.toewijzing ?? {},
  }));
}

export function ontspullenNaarRijen(huishoudenId, userId, items) {
  return (items ?? []).map((i) => ({
    huishouden_id: huishoudenId,
    aangemaakt_door: userId,
    tekst: i.tekst,
    methode: i.methode,
    afgerond: i.afgerond ?? false,
    afgerond_op: i.afgerondOp ?? null,
  }));
}

export function boodschappenNaarRijen(huishoudenId, items) {
  return (items ?? []).map((i) => ({
    huishouden_id: huishoudenId,
    tekst: i.tekst,
    frequentie: i.frequentie,
    aantal: i.aantal ?? 1,
    op_lijst: i.opLijst ?? true,
    laatst_gekocht_op: i.laatstGekochtOp ?? null,
  }));
}

// Eenmalige migratie bij het aanmaken van een huishouden: de bestaande
// lokale data van de AANMAKER verhuist naar de gedeelde tabellen. De lokale
// blobs blijven ongemoeid staan (geen delete) als natuurlijk rollback-pad —
// zodra huishoudenId gezet is, negeren de dual-mode hooks ze toch.
export async function migreerNaarHuishouden(huishoudenId, userId) {
  const projecten = leesLokaal('huishoud_projecten', { projecten: [] }).projecten ?? [];
  const takenRecord = leesLokaal('huishoud_taken', { taken: [], log: {} });
  const weekschemaRecord = leesLokaal('huishoud_weekschema', { schemas: [] });
  const ontspullenRecord = leesLokaal('ontspullen', { items: [] });
  const boodschappenRecord = leesLokaal('boodschappen', { items: [] });

  await maakProjecten(kluslijstProjectenNaarRijen(huishoudenId, userId, projecten));

  const lokaleTaken = takenRecord.taken ?? [];
  const nieuweTaken = await voegTakenToe(huishoudTakenNaarRijen(huishoudenId, lokaleTaken));
  const idMap = {};
  lokaleTaken.forEach((t, i) => {
    if (nieuweTaken[i]) idMap[t.id] = nieuweTaken[i].id;
  });
  await voegLogToe(huishoudTakenLogNaarRijen(idMap, takenRecord.log, userId));

  await voegWeekschemasToe(huishoudWeekschemaNaarRijen(huishoudenId, weekschemaRecord.schemas));
  await voegOntspullenToe(ontspullenNaarRijen(huishoudenId, userId, ontspullenRecord.items));
  await voegBoodschappenToe(boodschappenNaarRijen(huishoudenId, boodschappenRecord.items));
}
