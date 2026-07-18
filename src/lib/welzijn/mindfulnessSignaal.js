// Scope: alleen de ene Welzijn→Mindfulness-koppeling die Module 5 expliciet
// opnieuw opvraagt — geen algemene signalen-laag (zie docs/SIGNALEN.md,
// nog niet akkoord voor volledige implementatie). Losstaand van Welzijn's
// eigen, klinisch onderbouwde signalering.js: deze suggestie mag lichter/
// gevoeliger zijn omdat het een vrijblijvend duwtje richting een
// ademoefening is, geen "praat met iemand"-signaal.
//
// Het impactpercentage schuift de drempel lineair tussen de klinische
// uitputtingsdrempel (2.0, bij 0%) en het eerstvolgende lagere CBI-anker
// "Soms" (1.5, bij 100%) — nooit voorbij dat anker, zodat een hoge
// gevoeligheid de suggestie eerder toont zonder de onderbouwing van de
// drempel zelf los te laten.
const DREMPEL_BOVEN = 2.0;
const DREMPEL_ONDER = 1.5;

export function mindfulnessSuggestieActief(afnames, impactPct) {
  if (!impactPct || impactPct <= 0) return false;
  if (!afnames.length) return false;

  const laatste = afnames[afnames.length - 1];
  const drempel = DREMPEL_BOVEN - (Math.min(100, impactPct) / 100) * (DREMPEL_BOVEN - DREMPEL_ONDER);
  const scores = [laatste.scores?.persoonlijk, laatste.scores?.werk].filter((v) => typeof v === 'number');
  return scores.some((s) => s >= drempel);
}
