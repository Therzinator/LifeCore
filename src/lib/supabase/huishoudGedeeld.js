import { sbClient, uniekKanaalId } from './client.js';

// Db-rij -> hetzelfde platte object dat de lokale blob-modus gebruikte.
export function rijNaarTaak(rij) {
  return { id: rij.id, tekst: rij.tekst, frequentie: rij.frequentie, intervalDagen: rij.interval_dagen };
}

// Logregels (één rij per afgevinkte periode) -> dezelfde geneste
// {taakId: {periode: true}}-vorm die de lokale blob-modus altijd al gebruikte.
export function logRijenNaarMap(rijen) {
  const log = {};
  for (const rij of rijen ?? []) {
    if (!log[rij.taak_id]) log[rij.taak_id] = {};
    log[rij.taak_id][rij.periode] = true;
  }
  return log;
}

export function rijNaarWeekschema(rij) {
  return { weekMaandag: rij.week_maandag, toewijzing: rij.toewijzing ?? {} };
}

// --- Taken ---

export async function haalTaken(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('huishoud_taken')
    .select('*')
    .eq('huishouden_id', huishoudenId)
    .order('aangemaakt_op');

  if (error) {
    console.error('Kon huishoudtaken niet ophalen', error);
    return [];
  }
  return data;
}

// Rijen zijn al db-vormig ({huishouden_id, tekst, frequentie, interval_dagen})
// — zowel de hook (die de rijen zelf uit teksten opbouwt) als de migratie
// gebruiken dezelfde bulk-insert.
export async function voegTakenToe(rijen) {
  const sb = sbClient();
  if (!sb || rijen.length === 0) return [];

  const { data, error } = await sb.from('huishoud_taken').insert(rijen).select();
  if (error) {
    console.error('Kon huishoudtaken niet toevoegen', error);
    return [];
  }
  return data;
}

export async function verwijderTaak(id) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('huishoud_taken').delete().eq('id', id);
  if (error) {
    console.error('Kon huishoudtaak niet verwijderen', error);
    return false;
  }
  return true;
}

// --- Log (afvinken per periode) ---

export async function haalLog(taakIds) {
  const sb = sbClient();
  if (!sb || taakIds.length === 0) return [];

  const { data, error } = await sb.from('huishoud_taken_log').select('*').in('taak_id', taakIds);
  if (error) {
    console.error('Kon huishoudtaken-log niet ophalen', error);
    return [];
  }
  return data;
}

// Bulk-variant, alleen voor de migratie — voegt meteen alle al-voltooide
// perioden in één keer toe i.p.v. een toggle per periode te simuleren.
export async function voegLogToe(rijen) {
  const sb = sbClient();
  if (!sb || rijen.length === 0) return [];

  const { data, error } = await sb.from('huishoud_taken_log').insert(rijen).select();
  if (error) {
    console.error('Kon huishoudtaken-log niet migreren', error);
    return [];
  }
  return data;
}

// Toggle = insert als de periode nog niet als voltooid gelogd staat, delete
// als 'ie dat al was — de unique(taak_id, periode)-constraint in de db is de
// enige bron van waarheid voor 'is deze periode al afgevinkt'.
export async function toggleDezePeriode(taakId, periode, userId) {
  const sb = sbClient();
  if (!sb) return false;

  const { data: bestaand, error: zoekFout } = await sb
    .from('huishoud_taken_log')
    .select('id')
    .eq('taak_id', taakId)
    .eq('periode', periode)
    .maybeSingle();

  if (zoekFout) {
    console.error('Kon huishoudtaken-log niet raadplegen', zoekFout);
    return false;
  }

  if (bestaand) {
    const { error } = await sb.from('huishoud_taken_log').delete().eq('id', bestaand.id);
    if (error) {
      console.error('Kon afvinking niet ongedaan maken', error);
      return false;
    }
    return true;
  }

  const { error } = await sb.from('huishoud_taken_log').insert({ taak_id: taakId, periode, afgerond_door: userId });
  if (error) {
    console.error('Kon taak niet afvinken', error);
    return false;
  }
  return true;
}

// --- Weekschema ---

export async function haalWeekschemas(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb.from('huishoud_weekschema').select('*').eq('huishouden_id', huishoudenId);
  if (error) {
    console.error('Kon weekschema niet ophalen', error);
    return [];
  }
  return data;
}

export async function voegWeekschemasToe(rijen) {
  const sb = sbClient();
  if (!sb || rijen.length === 0) return [];

  const { data, error } = await sb.from('huishoud_weekschema').insert(rijen).select();
  if (error) {
    console.error('Kon weekschema niet migreren', error);
    return [];
  }
  return data;
}

export async function upsertWeekschema(huishoudenId, weekMaandag, toewijzing) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('huishoud_weekschema')
    .upsert({ huishouden_id: huishoudenId, week_maandag: weekMaandag, toewijzing }, { onConflict: 'huishouden_id,week_maandag' })
    .select()
    .single();

  if (error) {
    console.error('Kon weekschema niet bijwerken', error);
    return null;
  }
  return data;
}

// Zelfde opruim-gedrag als de lokale modus: weken vóór de huidige maandag
// verdwijnen volledig i.p.v. voor altijd te blijven staan.
export async function verwijderOudeWeekschemas(huishoudenId, voorWeekMaandag) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb
    .from('huishoud_weekschema')
    .delete()
    .eq('huishouden_id', huishoudenId)
    .lt('week_maandag', voorWeekMaandag);

  if (error) {
    console.error('Kon oude weekschemas niet opruimen', error);
    return false;
  }
  return true;
}

// --- Realtime ---
// Twee losse abonnementen (i.p.v. één gecombineerd kanaal) zodat
// useHuishoudTaken en useHuishoudWeekschema — twee losse hook-instanties —
// niet allebei op tabellen luisteren die ze zelf niet gebruiken.

// huishoud_taken_log heeft geen eigen huishouden_id-kolom om op te filteren
// — de RLS-select-policy (via een subquery naar huishoud_taken, zie migratie
// 0011) blijft ook voor Realtime-broadcast gelden, dus een lid ziet sowieso
// nooit logregels van een ander huishouden, ook zonder expliciete filter.
export function abonneerOpTaken(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`huishoud_taken:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'huishoud_taken', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'huishoud_taken_log' }, onWijziging)
    .subscribe();

  return () => sb.removeChannel(channel);
}

export function abonneerOpWeekschema(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`huishoud_weekschema:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'huishoud_weekschema', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .subscribe();

  return () => sb.removeChannel(channel);
}
