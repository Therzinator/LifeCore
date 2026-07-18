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

export function schrijfLokaal(sleutel, waarde) {
  try {
    localStorage.setItem(PREFIX + sleutel, JSON.stringify(waarde));
    return true;
  } catch (e) {
    console.error(`Kon lifecore-sleutel "${sleutel}" niet opslaan`, e);
    return false;
  }
}

export function nieuwRecord(data) {
  return { ...data, sync_status: 'lokaal', bijgewerkt_op: Date.now() };
}
