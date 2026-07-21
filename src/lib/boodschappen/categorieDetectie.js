// Detecteert de supermarkt-afdeling van een boodschappen-item op basis van
// trefwoorden in de tekst — puur client-side, niets wordt opgeslagen (bij
// een nieuw trefwoord verbetert de indeling met terugwerkende kracht voor
// alle bestaande items, i.p.v. dat oude items een vastgezette, verouderde
// categorie blijven dragen). AFDELINGEN staat in de gangbare looproute van
// een gemiddelde Nederlandse supermarkt (AH/Jumbo/Plus), zodat de lijst van
// boven naar beneden ook de winkel-volgorde volgt.

export const AFDELINGEN = [
  'Groente & Fruit',
  'Brood & Bakkerij',
  'Zuivel & Eieren',
  'Kaas & Vleeswaren',
  'Vlees & Vis',
  'Diepvries',
  'Voorraadkast',
  'Snacks & Snoep',
  'Dranken',
  'Huishouden & Verzorging',
  'Overig',
];

const TREFWOORDEN = {
  'Groente & Fruit': [
    'appel', 'banaan', 'peer', 'sinaasappel', 'mandarijn', 'druif', 'citroen', 'limoen', 'avocado',
    'tomaat', 'komkommer', 'paprika', 'ui', 'knoflook', 'aardappel', 'wortel', 'courgette', 'broccoli',
    'bloemkool', 'sla', 'spinazie', 'champignon', 'prei', 'venkel', 'rode kool', 'witlof', 'peen',
    'basilicum', 'peterselie', 'bieslook', 'gember', 'aardbei', 'framboos', 'bosbes', 'meloen', 'kiwi',
  ],
  'Brood & Bakkerij': [
    'brood', 'stokbrood', 'croissant', 'broodje', 'beschuit', 'krentenbol', 'bolletje', 'wrap', 'tortilla',
    'toast', 'ontbijtkoek', 'knäckebröd', 'bagel',
  ],
  'Zuivel & Eieren': [
    'melk', 'yoghurt', 'kwark', 'vla', 'room', 'slagroom', 'boter', 'margarine', 'ei', 'eieren',
    'karnemelk', 'pudding', 'skyr',
  ],
  'Kaas & Vleeswaren': [
    'kaas', 'belegen', 'jong belegen', 'hüttenkäse', 'ham', 'salami', 'worst', 'rookworst', 'paté',
    'filet americain', 'beenham', 'bacon',
  ],
  'Vlees & Vis': [
    'kip', 'kipfilet', 'gehakt', 'rundvlees', 'varkensvlees', 'biefstuk', 'kipdij', 'kalkoen', 'spek',
    'vis', 'zalm', 'kabeljauw', 'tonijn', 'garnalen', 'haring', 'mosselen',
  ],
  'Diepvries': [
    'diepvries', 'ijs', 'ijsjes', 'friet', 'patat', 'diepvriesgroente', 'vissticks', 'pizza',
  ],
  'Voorraadkast': [
    'pasta', 'spaghetti', 'rijst', 'noedels', 'couscous', 'bloem', 'suiker', 'zout', 'peper', 'olie',
    'azijn', 'saus', 'ketchup', 'mayonaise', 'mosterd', 'pindakaas', 'jam', 'hagelslag', 'honing',
    'blik', 'bonen', 'linzen', 'soep', 'bouillon', 'kruiden', 'kipkruiden', 'komijn', 'paprikapoeder',
  ],
  'Snacks & Snoep': [
    'chips', 'koek', 'koekjes', 'chocola', 'chocolade', 'snoep', 'drop', 'noten', 'popcorn', 'reep',
  ],
  'Dranken': [
    'water', 'cola', 'sap', 'limonade', 'bier', 'wijn', 'koffie', 'thee', 'frisdrank', 'ranja',
  ],
  'Huishouden & Verzorging': [
    'wc-papier', 'toiletpapier', 'afwasmiddel', 'wasmiddel', 'shampoo', 'zeep', 'tandpasta',
    'schoonmaakmiddel', 'vaatwastablet', 'keukenrol', 'vuilniszak', 'luiers',
  ],
};

// Langste trefwoord eerst zodat een specifiekere match ('jong belegen' vóór
// 'belegen', of 'diepvriesgroente' vóór 'groente') niet wordt overschaduwd
// door een korter, generieker woord uit een andere afdeling.
const VLAKKE_LIJST = Object.entries(TREFWOORDEN)
  .flatMap(([afdeling, woorden]) => woorden.map((woord) => ({ afdeling, woord })))
  .sort((a, b) => b.woord.length - a.woord.length);

export function bepaalCategorie(tekst) {
  const schoon = tekst.trim().toLowerCase();
  const match = VLAKKE_LIJST.find(({ woord }) => schoon.includes(woord));
  return match?.afdeling ?? 'Overig';
}

// Groepeert items per afdeling, in de AFDELINGEN-looproute — lege
// afdelingen worden overgeslagen zodat de lijst niet vol leeg-witruimte
// staat op een dag met maar een paar boodschappen.
export function groepeerOpAfdeling(items, tekstVeld = 'tekst') {
  const groepen = new Map(AFDELINGEN.map((a) => [a, []]));
  items.forEach((item) => {
    const afdeling = bepaalCategorie(item[tekstVeld]);
    groepen.get(afdeling).push(item);
  });
  return AFDELINGEN
    .map((afdeling) => ({ afdeling, items: groepen.get(afdeling) }))
    .filter((g) => g.items.length > 0);
}
