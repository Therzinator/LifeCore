import { CBI_SUBSCHALEN } from './cbi.js';
import { REQ_DIMENSIES } from './req.js';

// Eén gecombineerde vragenset i.p.v. twee losse vragenlijsten — burn-out
// (CBI) en herstel (REQ) worden in dezelfde afname gemeten, zoals bedoeld:
// het zijn twee kanten van dezelfde balans, geen aparte metingen.
export const WELZIJN_SUBSCHALEN = [...CBI_SUBSCHALEN, ...REQ_DIMENSIES];

const REQ_IDS = REQ_DIMENSIES.map((d) => d.id);

// Schaal per item: 0 (Nooit) t/m 3 (Bijna altijd) — zie VragenlijstCheck.
// Subschaalscore = gemiddelde van de beantwoorde items in die subschaal.
export function berekenScores(antwoorden) {
  const scores = {};
  for (const sub of WELZIJN_SUBSCHALEN) {
    const waarden = sub.items
      .map((_, i) => antwoorden[`${sub.id}:${i}`])
      .filter((v) => typeof v === 'number');
    scores[sub.id] = waarden.length ? waarden.reduce((a, b) => a + b, 0) / waarden.length : null;
  }

  // Samengestelde herstelscore = gemiddelde van de 4 REQ-subschalen — dit is
  // de score waar de trendgrafiek en signalering (zie signalering.js) op
  // sturen, in plaats van 4 losse hersteltrends naast elkaar te tonen.
  const reqScores = REQ_IDS.map((id) => scores[id]).filter((v) => typeof v === 'number');
  scores.herstel = reqScores.length ? reqScores.reduce((a, b) => a + b, 0) / reqScores.length : null;

  return scores;
}

export const CADANS_DAGEN_STANDAARD = 14;

export function volgendeCheckDatum(laatsteDatumIso, cadansDagen = CADANS_DAGEN_STANDAARD) {
  if (!laatsteDatumIso) return null;
  const datum = new Date(laatsteDatumIso);
  datum.setDate(datum.getDate() + cadansDagen);
  return datum;
}

export function checkIsVerschuldigd(laatsteDatumIso, cadansDagen = CADANS_DAGEN_STANDAARD) {
  const volgende = volgendeCheckDatum(laatsteDatumIso, cadansDagen);
  return !volgende || volgende <= new Date();
}
