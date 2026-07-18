// Splitst een (gesproken of getypte) tekst op in losse taken. Simpele
// heuristiek: nieuwe regel, komma, of het woord "en" als los woord scheidt
// taken. Dit knipt soms verkeerd (bijv. "auto's tellen en registreren" als
// één taak bedoeld) — daarom blijft de tekst altijd eerst in een bewerkbaar
// veld staan vóór dit parsen wordt toegepast, zodat je kunt corrigeren.
export function parseSpraakTekst(tekst) {
  if (!tekst) return [];
  return tekst
    .split(/\n|,| en /i)
    .map((deel) => deel.trim())
    .filter(Boolean);
}
