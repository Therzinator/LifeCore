import { slugNaarNaam } from './supermarktKetens.js';

// Groepeert de (beste kandidaat per item van de) aanbieding-check-resultaten
// per supermarkt, met het totale voordeel in euro's — voor de 'automatisch
// per supermarkt verdeeld'-samenvatting. aanbiedingen: { [itemId]: kandidaten[] }
// (eerste kandidaat = de beste match, al zo gesorteerd door de Edge Function).
export function groepeerPerSupermarkt(items, aanbiedingen) {
  const perRetailer = new Map();

  items.forEach((item) => {
    const beste = aanbiedingen[item.id]?.[0];
    if (!beste) return;

    if (!perRetailer.has(beste.retailer)) {
      perRetailer.set(beste.retailer, { retailerSlug: beste.retailer, retailerNaam: slugNaarNaam(beste.retailer), items: [], totaalVoordeel: 0 });
    }
    const groep = perRetailer.get(beste.retailer);
    groep.items.push({ itemId: item.id, boodschapTekst: item.tekst, aanbiedingNaam: beste.naam, prijs: beste.prijs, voordeel: beste.voordeel ?? 0 });
    groep.totaalVoordeel += beste.voordeel ?? 0;
  });

  return [...perRetailer.values()].sort((a, b) => b.totaalVoordeel - a.totaalVoordeel);
}

// Voor de 'Sorteren op aanbieding'-weergave: verdeelt de VOLLEDIGE actieve
// boodschappenlijst per supermarkt, in tegenstelling tot groepeerPerSupermarkt
// (dat alleen items met een gevonden aanbieding toont, voor de losse
// samenvattingskaart). Items zonder gevonden aanbieding belanden in een aparte
// 'Geen aanbieding gevonden'-groep zodat de hele lijst zichtbaar blijft.
export function verdeelVoorSortering(items, aanbiedingen) {
  const metAanbieding = groepeerPerSupermarkt(items, aanbiedingen);
  const idsMetAanbieding = new Set(metAanbieding.flatMap((g) => g.items.map((it) => it.itemId)));
  const zonder = items.filter((item) => !idsMetAanbieding.has(item.id));
  if (zonder.length === 0) return metAanbieding;
  return [
    ...metAanbieding,
    {
      retailerSlug: null,
      retailerNaam: 'Geen aanbieding gevonden',
      items: zonder.map((item) => ({ itemId: item.id, boodschapTekst: item.tekst, aanbiedingNaam: null, prijs: null, voordeel: 0 })),
      totaalVoordeel: 0,
    },
  ];
}
