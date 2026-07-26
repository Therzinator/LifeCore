// Pure rekenkern van GetalVeld.jsx (los getrokken zodat 'm zonder DOM/React
// getest kan worden) — bepaalt de uiteindelijke, gecommitteerde waarde uit de
// vrij getypte tekst zodra een getalveld de focus verliest. Tijdens het typen
// zelf gebeurt hier niets: geen enkele parse/clamp totdat je het veld verlaat.
export function berekenGecommitteerdeWaarde(tekst, { min, max, fallback = 0, geheel = true } = {}) {
  const ruw = String(tekst ?? '').trim();
  let getal = ruw === '' || ruw === '-' ? NaN : (geheel ? parseInt(ruw, 10) : parseFloat(ruw));
  if (Number.isNaN(getal)) getal = fallback;
  if (min != null) getal = Math.max(min, getal);
  if (max != null) getal = Math.min(max, getal);
  return getal;
}
