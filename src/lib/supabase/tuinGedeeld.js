import { sbClient, uniekKanaalId } from './client.js';

// Zelfde vorm als huishoudGedeeld.js (taken + log), maar voor de losse
// tuin_taken/tuin_taken_log-tabellen — geen weekschema-sectie, Tuinieren
// heeft geen dag-toewijzing.

export function rijNaarTaak(rij) {
  return {
    id: rij.id, tekst: rij.tekst, frequentie: rij.frequentie, intervalDagen: rij.interval_dagen,
    geschatteUren: rij.geschatte_uren ?? 0.5,
    maandVanaf: rij.maand_vanaf ?? null, maandTot: rij.maand_tot ?? null,
  };
}

export function logRijenNaarMap(rijen) {
  const log = {};
  for (const rij of rijen ?? []) {
    if (!log[rij.taak_id]) log[rij.taak_id] = {};
    log[rij.taak_id][rij.periode] = true;
  }
  return log;
}

// --- Taken ---

export async function haalTaken(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('tuin_taken')
    .select('*')
    .eq('huishouden_id', huishoudenId)
    .order('aangemaakt_op');

  if (error) {
    console.error('Kon tuintaken niet ophalen', error);
    return [];
  }
  return data;
}

export async function voegTakenToe(rijen) {
  const sb = sbClient();
  if (!sb || rijen.length === 0) return [];

  const { data, error } = await sb.from('tuin_taken').insert(rijen).select();
  if (error) {
    console.error('Kon tuintaken niet toevoegen', error);
    return [];
  }
  return data;
}

export async function verwijderTaak(id) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('tuin_taken').delete().eq('id', id);
  if (error) {
    console.error('Kon tuintaak niet verwijderen', error);
    return false;
  }
  return true;
}

// --- Log (afvinken per periode) ---

export async function haalLog(taakIds) {
  const sb = sbClient();
  if (!sb || taakIds.length === 0) return [];

  const { data, error } = await sb.from('tuin_taken_log').select('*').in('taak_id', taakIds);
  if (error) {
    console.error('Kon tuintaken-log niet ophalen', error);
    return [];
  }
  return data;
}

// Toggle = insert als de periode nog niet als voltooid gelogd staat, delete
// als 'ie dat al was — zelfde patroon als huishoudGedeeld.toggleDezePeriode.
export async function toggleDezePeriode(taakId, periode, userId) {
  const sb = sbClient();
  if (!sb) return false;

  const { data: bestaand, error: zoekFout } = await sb
    .from('tuin_taken_log')
    .select('id')
    .eq('taak_id', taakId)
    .eq('periode', periode)
    .maybeSingle();

  if (zoekFout) {
    console.error('Kon tuintaken-log niet raadplegen', zoekFout);
    return false;
  }

  if (bestaand) {
    const { error } = await sb.from('tuin_taken_log').delete().eq('id', bestaand.id);
    if (error) {
      console.error('Kon afvinking niet ongedaan maken', error);
      return false;
    }
    return true;
  }

  const { error } = await sb.from('tuin_taken_log').insert({ taak_id: taakId, periode, afgerond_door: userId });
  if (error) {
    console.error('Kon taak niet afvinken', error);
    return false;
  }
  return true;
}

// --- Realtime ---

export function abonneerOpTaken(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`tuin_taken:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tuin_taken', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tuin_taken_log' }, onWijziging)
    .subscribe();

  return () => sb.removeChannel(channel);
}
