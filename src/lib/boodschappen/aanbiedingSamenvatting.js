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
