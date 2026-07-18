// LPT (Longest Processing Time first) — sorteer klusjes van zwaar naar
// licht, wijs elk klusje toe aan de maand met op dat moment de laagste
// totale geschatte belasting. Dit is de standaard, bewezen aanpak voor
// "verdeel N items met verschillend gewicht zo gelijkmatig mogelijk over K
// bakken" (multiprocessor scheduling) — geen zelfverzonnen heuristiek, en
// ruim beter dan simpelweg in volgorde doorschuiven (dat zou zware klusjes
// kunnen ophopen in één maand).
function maandOffset(startMaand, offset) {
  const [jaar, maand] = startMaand.split('-').map(Number);
  const datum = new Date(jaar, maand - 1 + offset, 1);
  return `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}`;
}

export function maandLabel(maandKey) {
  const [jaar, maand] = maandKey.split('-').map(Number);
  const datum = new Date(jaar, maand - 1, 1);
  return datum.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
}

export function verdeelKlusjesOverMaanden(klusjes, aantalMaanden, startMaand) {
  const maanden = Array.from({ length: Math.max(1, aantalMaanden) }, (_, i) => ({
    maand: maandOffset(startMaand, i),
    belasting: 0,
  }));

  const gesorteerd = [...klusjes].sort((a, b) => (b.geschatteUren ?? 1) - (a.geschatteUren ?? 1));

  return gesorteerd.map((klusje) => {
    const lichtsteMaand = maanden.reduce((min, m) => (m.belasting < min.belasting ? m : min), maanden[0]);
    lichtsteMaand.belasting += klusje.geschatteUren ?? 1;
    return { ...klusje, maand: lichtsteMaand.maand };
  });
}

// Groepeert een al-verdeelde klusjeslijst per maand, in chronologische
// volgorde — voor de weergave in een maandelijks schema.
export function groepeerPerMaand(klusjes) {
  const perMaand = {};
  klusjes.forEach((k) => {
    if (!perMaand[k.maand]) perMaand[k.maand] = [];
    perMaand[k.maand].push(k);
  });
  return Object.entries(perMaand).sort(([a], [b]) => a.localeCompare(b));
}
