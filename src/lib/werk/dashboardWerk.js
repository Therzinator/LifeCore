import { maandagVan } from '../../utils/datum.js';

// Aantal afgeronde werktaken per week — voor het Werk-focus-lijntje op het
// Dashboard. Gebruikt afgerondOp (voltooiingsdatum), niet aangemaaktOp, zodat
// een taak die dagen blijft openstaan pas telt op de dag dat hij echt af is.
export function werkTakenPerWeek(alleTaken, weken = 12) {
  const perWeek = {};
  alleTaken.filter((t) => t.klaar && t.afgerondOp).forEach((t) => {
    const week = maandagVan(t.afgerondOp);
    perWeek[week] = (perWeek[week] ?? 0) + 1;
  });
  const labels = Object.keys(perWeek).sort().slice(-weken);
  const aantalPerWeek = labels.map((w) => perWeek[w]);
  return { labels, aantalPerWeek };
}
