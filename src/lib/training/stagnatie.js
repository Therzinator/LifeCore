// StrongLifts 5×5's eigen stagnatiecriterium ("drie mislukkingen op rij op
// dezelfde oefening → deload/programmawissel") — het standaardcriterium uit
// de methodiek zelf, geen los gekozen getal.
const OPEENVOLGENDE_DREMPEL = 3;

export function detecteerStagnatie(sessies) {
  const perOefening = {};
  sessies.forEach((sessie) => {
    (sessie.oefeningen ?? []).forEach((o) => {
      if (!perOefening[o.id]) perOefening[o.id] = [];
      perOefening[o.id].push({ naam: o.naam, gewicht: o.gewicht });
    });
  });

  const gestagneerd = [];
  Object.values(perOefening).forEach((reeks) => {
    if (reeks.length < OPEENVOLGENDE_DREMPEL) return;
    const laatste = reeks.slice(-OPEENVOLGENDE_DREMPEL);
    const staaltStil = laatste.every((s, i) => i === 0 || s.gewicht <= laatste[i - 1].gewicht);
    if (staaltStil) gestagneerd.push(laatste[laatste.length - 1].naam);
  });

  return gestagneerd;
}
