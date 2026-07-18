// Formatteert een datum als lokale 'YYYY-MM-DD'-sleutel via getFullYear/
// getMonth/getDate i.p.v. toISOString().slice(0,10) — toISOString() geeft
// de UTC-datum, die in elke tijdzone ten oosten van UTC (bv. Nederland,
// GMT+1/+2) een dag terugspringt zodra de lokale tijd rond middernacht ligt
// (lokale 00:xx is nog steeds de vorige dag in UTC). Voor 'welke lokale
// kalenderdag is dit' is dat altijd fout — vandaar deze functie i.p.v. de
// ingebouwde UTC-conversie.
export function datumKey(datum = new Date()) {
  const jaar = datum.getFullYear();
  const maand = String(datum.getMonth() + 1).padStart(2, '0');
  const dag = String(datum.getDate()).padStart(2, '0');
  return `${jaar}-${maand}-${dag}`;
}

export function vandaagKey() {
  return datumKey();
}

// Maandag = 0 t/m zondag = 6 — Date.getDay() geeft zondag = 0, vandaar de omzetting.
export function dagIndexVan(datumIso) {
  const d = new Date(datumIso).getDay();
  return d === 0 ? 6 : d - 1;
}

export function maandagVan(datumIso) {
  const d = new Date(datumIso);
  const dag = d.getDay() || 7;
  d.setDate(d.getDate() - (dag - 1));
  return datumKey(d);
}

export function relatieveTijd(isoDatum) {
  if (!isoDatum) return 'nog niet gedaan';

  const verschilMs = Date.now() - new Date(isoDatum).getTime();
  const dagen = Math.floor(verschilMs / (1000 * 60 * 60 * 24));

  if (dagen <= 0) return 'vandaag';
  if (dagen === 1) return 'gisteren';
  return `${dagen} dagen geleden`;
}
