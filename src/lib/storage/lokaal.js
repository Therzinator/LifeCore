export const PREFIX = 'lifecore_';

export function leesLokaal(sleutel, standaard = null) {
  try {
    const ruw = localStorage.getItem(PREFIX + sleutel);
    return ruw ? JSON.parse(ruw) : standaard;
  } catch (e) {
    console.error(`Kon lifecore-sleutel "${sleutel}" niet lezen`, e);
    return standaard;
  }
}

// Event i.p.v. een directe import van useSync — lokaal.js wordt door bijna
// elke feature-hook gebruikt en mag geen weet hebben van sync/Supabase.
// useSync luistert hierop om lokale wijzigingen (in willekeurig welke
// module) gedebounced naar de cloud te pushen, zonder dat de gebruiker zelf
// op 'Synchroniseren' hoeft te drukken.
export const LOKALE_WIJZIGING_EVENT = 'lifecore-lokale-wijziging';

export function schrijfLokaal(sleutel, waarde) {
  try {
    localStorage.setItem(PREFIX + sleutel, JSON.stringify(waarde));
    window.dispatchEvent(new Event(LOKALE_WIJZIGING_EVENT));
    return true;
  } catch (e) {
    console.error(`Kon lifecore-sleutel "${sleutel}" niet opslaan`, e);
    return false;
  }
}

export function nieuwRecord(data) {
  return { ...data, sync_status: 'lokaal', bijgewerkt_op: Date.now() };
}
