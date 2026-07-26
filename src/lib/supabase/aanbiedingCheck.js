import { sbClient } from './client.js';

// Roept de boodschappen-aanbiedingen Edge Function aan (zie
// supabase/functions/boodschappen-aanbiedingen) — vereist een ingelogde
// sessie (verify_jwt: true) en werkt alleen online (geen lokale/offline
// tegenhanger, in tegenstelling tot de rest van Boodschappen: een
// aanbieding-check zonder internetverbinding is per definitie zinloos).
//
// items: [{ id, tekst }], ketenSlugs: string[] (leeg = alle ketens).
// Geeft { [itemId]: kandidaten[] } terug, of null als het niet lukte
// (geen Supabase, geen sessie, of de functie zelf faalde).
export async function checkAanbiedingen(items, ketenSlugs) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb.functions.invoke('boodschappen-aanbiedingen', {
    body: { items, ketenSlugs },
  });
  if (error || data?.error) {
    console.error('Kon aanbiedingen niet ophalen', error || data?.error);
    return null;
  }

  const resultaat = {};
  for (const r of data.resultaten ?? []) resultaat[r.id] = r.kandidaten;
  return resultaat;
}
