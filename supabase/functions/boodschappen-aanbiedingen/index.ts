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
  promotion_status: string;
  valid_from: string | null;
  valid_until: string | null;
  product_url: string | null;
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
    .sort((a, b) => (a.unit_price ?? a.price) - (b.unit_price ?? b.price))
    .slice(0, KANDIDATEN_PER_ITEM)
    .map((p) => ({
      naam: p.name,
      retailer: p.retailer,
      prijs: p.price,
      origineleP: p.original_price,
      voordeel: p.savings_amount,
      kortingPct: p.discount_percentage,
      eenheid: p.quantity,
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
