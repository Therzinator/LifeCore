// Verdeelt wekelijkse huishoudklussen (uit useHuishoudTaken) over de 7 dagen
// van een week (dagIndex 0=ma..6=zo, zelfde schaal als utils/datum.js
// dagIndexVan) — simpele ronde-verdeling, bewust geen slimme balancering
// (weegt geen duur/moeite mee): de gebruiker past het toch handmatig aan
// waar het niet uitkomt (zie useHuishoudWeekschema.zetDag).
export function genereerWeekschema(wekelijkseTaken) {
  const toewijzing = {};
  wekelijkseTaken.forEach((taak, i) => {
    toewijzing[taak.id] = i % 7;
  });
  return toewijzing;
}

// Welke taken (uit de volledige wekelijkse-takenlijst) op een gegeven
// dagIndex staan volgens de toewijzing van één weekschema.
export function takenVoorDag(wekelijkseTaken, toewijzing, dagIndex) {
  return wekelijkseTaken.filter((t) => toewijzing[t.id] === dagIndex);
}
