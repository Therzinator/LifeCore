import { sbClient } from './client.js';

// Db-rij (snake_case) -> hetzelfde platte project-object dat de lokale
// blob-modus altijd al gebruikte (camelCase) — zo hoeft geen enkele
// bestaande reducer/UI-component te weten uit welke bron een project komt.
export function rijNaarProject(rij) {
  return {
    id: rij.id,
    naam: rij.naam,
    aantalMaanden: rij.aantal_maanden,
    startMaand: rij.start_maand,
    deadline: rij.deadline,
    klusjes: rij.klusjes ?? [],
    werkvoorbereiding: rij.werkvoorbereiding ?? [],
    aangemaaktOp: rij.aangemaakt_op,
  };
}

export async function haalProjecten(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('kluslijst_projecten')
    .select('*')
    .eq('huishouden_id', huishoudenId)
    .order('aangemaakt_op');

  if (error) {
    console.error('Kon Kluslijst-projecten niet ophalen', error);
    return [];
  }
  return data;
}

export async function maakProject(huishoudenId, userId, project) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('kluslijst_projecten')
    .insert({
      huishouden_id: huishoudenId,
      aangemaakt_door: userId,
      naam: project.naam,
      aantal_maanden: project.aantalMaanden,
      start_maand: project.startMaand,
      deadline: project.deadline,
      klusjes: project.klusjes,
      werkvoorbereiding: project.werkvoorbereiding ?? [],
    })
    .select()
    .single();

  if (error) {
    console.error('Kon Kluslijst-project niet aanmaken', error);
    return null;
  }
  return data;
}

// Bulk-variant — alleen gebruikt door de eenmalige huishoud-migratie
// (huishoudMigratie.js), die al kant-en-klare db-rijen aanlevert i.p.v. het
// lokale project-object dat maakProject() verwacht.
export async function maakProjecten(rijen) {
  const sb = sbClient();
  if (!sb || rijen.length === 0) return [];

  const { data, error } = await sb.from('kluslijst_projecten').insert(rijen).select();
  if (error) {
    console.error('Kon Kluslijst-projecten niet migreren', error);
    return [];
  }
  return data;
}

export async function werkProjectBij(id, patch) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb
    .from('kluslijst_projecten')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Kon Kluslijst-project niet bijwerken', error);
    return false;
  }
  return true;
}

export async function verwijderProject(id) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('kluslijst_projecten').delete().eq('id', id);
  if (error) {
    console.error('Kon Kluslijst-project niet verwijderen', error);
    return false;
  }
  return true;
}

// Live bijhouden — een wijziging door een ander huishoudlid komt zonder
// verversen door. onWijziging wordt aangeroepen op elke insert/update/
// delete; de aanroeper (de hook) herlaadt dan simpelweg opnieuw i.p.v. de
// payload zelf te patchen — correctheid boven micro-optimalisatie.
export function abonneerOpProjecten(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`kluslijst_projecten:${huishoudenId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'kluslijst_projecten', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .subscribe();

  return () => sb.removeChannel(channel);
}
