const DREMPEL = 0.4;

export function momentopnameTekst(score) {
  if (score == null) return 'Niet ingevuld.';
  if (score < 1) return 'Dit voelde niet sterk aanwezig.';
  if (score < 2) return 'Dit voelde af en toe aanwezig.';
  return 'Dit voelde sterk aanwezig.';
}

export function zachteTrend(huidigeScores, vorigeScores, subschalen) {
  return subschalen.map((sub) => {
    const huidig = huidigeScores[sub.id];
    const vorige = vorigeScores ? vorigeScores[sub.id] : null;

    if (huidig == null) {
      return { id: sub.id, label: sub.label, momentopname: momentopnameTekst(null), trend: '' };
    }

    let trend;
    if (vorige == null) {
      trend = 'Je eerste meting — een nulpunt, geen oordeel.';
    } else {
      const verschil = huidig - vorige;
      if (Math.abs(verschil) < DREMPEL) {
        trend = 'Voelt ongeveer hetzelfde als de vorige keer.';
      } else if (verschil > 0) {
        trend = 'Voelt dit keer wat hoger aan dan de vorige keer — dat mag er zijn.';
      } else {
        trend = 'Voelt dit keer wat lager aan dan de vorige keer — ook dat mag er zijn.';
      }
    }

    return { id: sub.id, label: sub.label, momentopname: momentopnameTekst(huidig), trend };
  });
}
