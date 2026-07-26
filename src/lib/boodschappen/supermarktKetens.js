// Vertaalt de vrij ingevoerde ketennamen uit Boodschappen-instellingen (bv.
// "Albert Heijn", "Lidl") naar de retailer-slugs die de PrijsProfeet-API
// gebruikt (bv. "albert_heijn") — en omgekeerd, voor het tonen van een
// API-resultaat ("lidl") als leesbare naam ("Lidl"). Vaste lijst van de 10
// ketens die PrijsProfeet dekt; een keten die een gebruiker toevoegt maar die
// niet in deze lijst voorkomt levert gewoon geen aanbieding-match op (de
// aanbieding-check filtert dan simpelweg niets voor die naam weg noch toe).

const KETENS = [
  { slug: 'albert_heijn', naam: 'Albert Heijn', aliassen: ['ah', 'albertheijn'] },
  { slug: 'jumbo', naam: 'Jumbo', aliassen: [] },
  { slug: 'aldi', naam: 'Aldi', aliassen: [] },
  { slug: 'lidl', naam: 'Lidl', aliassen: [] },
  { slug: 'plus', naam: 'Plus', aliassen: [] },
  { slug: 'dirk', naam: 'Dirk', aliassen: ['dirkvandenbroek'] },
  { slug: 'ekoplaza', naam: 'Ekoplaza', aliassen: [] },
  { slug: 'hoogvliet', naam: 'Hoogvliet', aliassen: [] },
  { slug: 'dekamarkt', naam: 'DekaMarkt', aliassen: ['deka markt', 'deka'] },
  { slug: 'vomar', naam: 'Vomar', aliassen: [] },
];

function normaliseer(tekst) {
  return tekst.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

// null als de ketennaam niet herkend wordt (dan telt 'ie simpelweg niet mee
// als filter — geen fout, de gebruiker kan altijd een niet-gedekte keten
// aan de lijst toevoegen voor andere doeleinden dan de aanbieding-check).
export function ketenNaarSlug(naam) {
  const schoon = normaliseer(naam);
  const match = KETENS.find((k) => normaliseer(k.naam) === schoon || k.aliassen.some((a) => normaliseer(a) === schoon));
  return match?.slug ?? null;
}

export function slugNaarNaam(slug) {
  return KETENS.find((k) => k.slug === slug)?.naam ?? slug;
}
