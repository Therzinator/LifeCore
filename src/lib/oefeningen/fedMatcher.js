import FED_INDEX from './fedIndex.json';

const FED_BASIS = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

function normaliseer(naam) {
  return naam
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const GENORMALISEERDE_INDEX = FED_INDEX.map((e) => ({ ...e, genorm: normaliseer(e.name) }));

function woordenSet(tekst) {
  return new Set(tekst.split(' ').filter(Boolean));
}

// Jaccard-overlap tussen woordsets van de genormaliseerde namen — eenvoudige,
// uitlegbare fuzzy-match (geen zware string-distance-library) die voor
// korte oefeningnamen (meestal 2-4 woorden) verrassend goed werkt.
function overlapScore(a, b) {
  const setA = woordenSet(a);
  const setB = woordenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let gedeeld = 0;
  setA.forEach((w) => { if (setB.has(w)) gedeeld += 1; });
  return gedeeld / new Set([...setA, ...setB]).size;
}

// Onder deze score is het risico op een misleidende afbeelding (verkeerde
// oefening die toevallig een woord deelt) groter dan de waarde van tóch een
// plaatje tonen — dan liever geen afbeelding dan een verkeerde.
const MIN_SCORE = 0.5;

function fedAfbeeldingUrl(fedId) {
  return `${FED_BASIS}/${fedId}/0.jpg`;
}

// Best-effort automatische afbeelding-matching op naam — bedoeld voor
// oefeningen zonder handmatig gecureerde fedId (met name eigen/custom
// oefeningen die de gebruiker zelf toevoegt). Retourneert null als er geen
// voldoende betrouwbare match is, i.p.v. een gok te presenteren als zeker.
export function vindFedAfbeelding(naam) {
  const genorm = normaliseer(naam);
  if (!genorm) return null;

  const exact = GENORMALISEERDE_INDEX.find((e) => e.genorm === genorm);
  if (exact) return fedAfbeeldingUrl(exact.id);

  let beste = null;
  let besteScore = 0;
  for (const entry of GENORMALISEERDE_INDEX) {
    const score = overlapScore(genorm, entry.genorm);
    if (score > besteScore) {
      besteScore = score;
      beste = entry;
    }
  }
  if (beste && besteScore >= MIN_SCORE) return fedAfbeeldingUrl(beste.id);
  return null;
}
