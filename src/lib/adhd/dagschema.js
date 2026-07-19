// Genereert een tijdgeblokte dagplanning voor de open Werktaken — zelfde
// filosofie als Kluslijst's projectMaandOverzicht (projectVerdeling.js):
// puur, side-effect-vrij, dus live herberekend bij elke render, nooit een
// verouderd opgeslagen schema. Twee bewezen principes uit onderzoek naar
// ADHD/burn-out-vriendelijke dagplanning: energie-gebaseerde volgorde
// (zwaarste taken tijdens piekenergie, dus als eerste) en Pomodoro-cadans
// (korte pauze na elk werkblok, lange pauze na elke 4) — zie het plan voor
// de bronnen. De bestaande energie-afhankelijke daglimiet (dagLimiet.js:
// taken-cap, uren-cap, blokduur) blijft de harde grens; dit schema
// overschrijdt 'm nooit, en taken die niet meer passen blijven zichtbaar
// i.p.v. stilzwijgend te verdwijnen (voorkomt overcommitment-druk).

const KORTE_PAUZE_MIN = 5;
const LANGE_PAUZE_MIN = 20;
const BLOKKEN_TOT_LANGE_PAUZE = 4;

function tijdNaarMinuten(tijd) {
  const [uur, minuut] = tijd.split(':').map(Number);
  return uur * 60 + minuut;
}

function minutenNaarTijd(minuten) {
  const uur = Math.floor(minuten / 60) % 24;
  const min = minuten % 60;
  return `${String(uur).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function genereerDagschema(openWerktaken, { starttijd, eindtijd }, limiet) {
  const eindMinuten = tijdNaarMinuten(eindtijd);
  // Zwaarste eerst — geen losse LPT-verdeling zoals bij Kluslijst nodig
  // (er is maar één 'bak': vandaag), puur een prioriteitsvolgorde.
  const gesorteerd = [...openWerktaken].sort((a, b) => (b.focusMinuten ?? 0) - (a.focusMinuten ?? 0));

  const blokken = [];
  let cursor = tijdNaarMinuten(starttijd);
  let geplandeWerkMinuten = 0;
  let werkblokTeller = 0;
  let i = 0;

  while (i < gesorteerd.length) {
    if (werkblokTeller >= limiet.taken) break;
    if (geplandeWerkMinuten + limiet.blok > limiet.uren * 60) break;
    if (cursor + limiet.blok > eindMinuten) break;

    const taak = gesorteerd[i];
    blokken.push({ type: 'werk', start: minutenNaarTijd(cursor), eind: minutenNaarTijd(cursor + limiet.blok), taak });
    cursor += limiet.blok;
    geplandeWerkMinuten += limiet.blok;
    werkblokTeller += 1;
    i += 1;

    // Geen pauze meer na het allerlaatste geplande werkblok — die dient
    // nergens toe als er niets meer op volgt.
    if (i < gesorteerd.length) {
      const lang = werkblokTeller % BLOKKEN_TOT_LANGE_PAUZE === 0;
      const duur = lang ? LANGE_PAUZE_MIN : KORTE_PAUZE_MIN;
      blokken.push({ type: 'pauze', start: minutenNaarTijd(cursor), eind: minutenNaarTijd(cursor + duur), lang });
      cursor += duur;
    }
  }

  return { blokken, nietIngepland: gesorteerd.slice(i) };
}
