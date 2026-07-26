import { sbClient, uniekKanaalId } from './client.js';

export async function haalCategorieOverrides(huishoudenId) {
  const sb = sbClient();
  if (!sb) return {};

  const { data, error } = await sb
    .from('boodschappen_categorie_overrides')
    .select('tekst, categorie')
    .eq('huishouden_id', huishoudenId);

  if (error) {
    console.error('Kon categorie-overschrijvingen niet ophalen', error);
    return {};
  }
  return Object.fromEntries(data.map((r) => [r.tekst, r.categorie]));
}

// tekst moet al genormaliseerd zijn (trim + lowercase) door de aanroeper —
// zelfde normalisatie als groepeerOpItem in boodschappenLeren.js, zodat een
// correctie voor 'Hummus' ook geldt voor toekomstige 'hummus'/'HUMMUS'.
export async function zetCategorieOverride(huishoudenId, tekst, categorie) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb
    .from('boodschappen_categorie_overrides')
    .upsert({ huishouden_id: huishoudenId, tekst, categorie }, { onConflict: 'huishouden_id,tekst' });

  if (error) {
    console.error('Kon categorie-overschrijving niet opslaan', error);
    return false;
  }
  return true;
}

export function abonneerOpCategorieOverrides(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`boodschappen_categorie_overrides:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'boodschappen_categorie_overrides', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .subscribe();

  return () => sb.removeChannel(channel);
}
