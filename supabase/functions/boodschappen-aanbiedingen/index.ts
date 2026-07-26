// Wat: zoekt voor elk boodschappenlijst-item de actuele aanbiedingen op via
// de PrijsProfeet-API (prijsprofeet.nl/api, gratis endpoints — /match/* en
// /price-history zitten in het Pro-plan en worden hier bewust niet gebruikt)
// en geeft per item de beste, daadwerkelijk geldige (promotion_status ===
// 'active') deal terug, optioneel gefilterd op de door het huishouden
// gekozen supermarktketens.
// Waarom als Edge Function i.p.v. client-side: de API-key mag nooit in de
// publieke app-bundle terechtkomen (zie recept-uit-foto voor hetzelfde
// patroon met ANTHROPIC_API_KEY). Vereist een Supabase secret
// PRIJSPROFEET_API_KEY. JWT-verificatie staat aan — alleen ingelogde
// gebruikers kunnen 'm aanroepen, om misbruik van de (rate-gelimiteerde)
// API-key te voorkomen.
//
// Let op — matching is best-effort, geen exacte productidentiteit: de
// PrijsProfeet-zoek-endpoint is een kale tekstzoekopdracht (geen EAN-match,
// die zit achter /match/* in het Pro-plan), dus een vrije boodschap-tekst
// als 'melk' kan ook niet-relevante producten opleveren (bv. chocolade met
// melk erin). De UI moet dit als suggestie tonen, niet als garantie.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRIJSPROFEET_BASIS = 'https://www.prijsprofeet.nl/api/v1';
const MAX_ITEMS = 60;
const KANDIDATEN_PER_ITEM = 3;

interface PrijsProfeetProduct {
  name: string;
  price: number;
  original_price: number | null;
  savings_amount: number | null;
  discount_percentage: number | null;
  unit_price: number | null;
  quantity: string | null;
  retailer: string;
  is_promotional: boolean;
  promotion_type: string | null;
  promotion_status: string;
  promotional_keywords: string[] | null;
  valid_from: string | null;
  valid_until: string | null;
  product_url: string | null;
}

const GEWICHT_NAAR_KG: Record<string, number> = { mg: 1e-6, g: 0.001, gr: 0.001, gram: 0.001, kg: 1, kilo: 1 };
const VOLUME_NAAR_L: Record<string, number> = { ml: 0.001, cl: 0.01, dl: 0.1, l: 1, liter: 1, liters: 1 };

// PrijsProfeet's eigen unit_price is regelmatig null bij bundel-aanbiedingen
// ('1+1 gratis', '2+1 gratis', 'X voor Y') — juist bij dit soort deals is de
// prijs per kilo/liter vaak voordeliger dan een kale percentage-korting,
// maar zonder deze fallback zou de sortering terugvallen op de kale
// (pakketgrootte-afhankelijke) prijs en dat soort aanbiedingen onterecht
// laag laten scoren. Live getest (2026-07) tegen echte PrijsProfeet-data:
// bij one_plus_one-producten is unit_price vrijwel altijd null, terwijl
// quantity ("0.9 Liters", "75 g", "20 wasbeurten") wél gevuld is.
function parseHoeveelheid(tekst: string | null): { waarde: number; eenheid: string } | null {
  if (!tekst) return null;
  const match = tekst.trim().toLowerCase().match(/^([\d.,]+)\s*([a-zé]+)/);
  if (!match) return null;
  const waarde = parseFloat(match[1].replace(',', '.'));
  if (!Number.isFinite(waarde) || waarde <= 0) return null;
  const eenheidRuw = match[2];
  if (eenheidRuw in GEWICHT_NAAR_KG) return { waarde: waarde * GEWICHT_NAAR_KG[eenheidRuw], eenheid: 'kg' };
  if (eenheidRuw in VOLUME_NAAR_L) return { waarde: waarde * VOLUME_NAAR_L[eenheidRuw], eenheid: 'l' };
  return { waarde, eenheid: eenheidRuw };
}

function effectieveEenheidsprijs(p: PrijsProfeetProduct): number {
  if (p.unit_price != null) return p.unit_price;
  const hv = parseHoeveelheid(p.quantity);
  if (hv) return p.price / hv.waarde;
  return p.price;
}

async function zoekAanbiedingen(tekst: string, apiKey: string, ketenSlugs: string[]) {
  const url = `${PRIJSPROFEET_BASIS}/products/search/${encodeURIComponent(tekst)}?page_size=25`;
  const resp = await fetch(url, { headers: { 'X-API-Key': apiKey } });
  if (!resp.ok) return [];

  const data = await resp.json();
  const producten: PrijsProfeetProduct[] = data.products ?? [];

  return producten
    .filter((p) => p.is_promotional && p.promotion_status === 'active')
    .filter((p) => ketenSlugs.length === 0 || ketenSlugs.includes(p.retailer))
    .sort((a, b) => effectieveEenheidsprijs(a) - effectieveEenheidsprijs(b))
    .slice(0, KANDIDATEN_PER_ITEM)
    .map((p) => ({
      naam: p.name,
      retailer: p.retailer,
      prijs: p.price,
      origineleP: p.original_price,
      voordeel: p.savings_amount,
      kortingPct: p.discount_percentage,
      eenheid: p.quantity,
      promotieType: p.promotion_type,
      promotieTekst: p.promotional_keywords?.[0] ?? null,
      geldigTot: p.valid_until,
      url: p.product_url,
    }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { items, ketenSlugs = [] } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'items is verplicht en mag niet leeg zijn' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    if (items.length > MAX_ITEMS) {
      return new Response(JSON.stringify({ error: `Maximaal ${MAX_ITEMS} items per aanbieding-check` }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('PRIJSPROFEET_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'PRIJSPROFEET_API_KEY niet geconfigureerd op de server' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const resultaten = await Promise.all(
      items.map(async (item: { id: string; tekst: string }) => {
        try {
          const kandidaten = await zoekAanbiedingen(item.tekst, apiKey, ketenSlugs);
          return { id: item.id, kandidaten };
        } catch (err) {
          console.error(`Aanbieding-zoekopdracht mislukt voor "${item.tekst}"`, err);
          return { id: item.id, kandidaten: [] };
        }
      }),
    );

    return new Response(JSON.stringify({ resultaten }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('boodschappen-aanbiedingen fout', err);
    return new Response(JSON.stringify({ error: 'Kon de aanbiedingen niet ophalen' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
