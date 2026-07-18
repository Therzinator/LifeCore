export const PMR_SPIEREN = [
  { naam: 'Voeten', instructie: 'Krul je tenen zo hard mogelijk.', span: 5, los: 10 },
  { naam: 'Kuiten', instructie: 'Wijs je tenen naar je toe, strek je kuitspier.', span: 5, los: 10 },
  { naam: 'Dijen', instructie: 'Span je dij- en bilspieren aan.', span: 5, los: 10 },
  { naam: 'Buik', instructie: 'Trek je buik strak naar binnen.', span: 5, los: 10 },
  { naam: 'Handen', instructie: 'Maak vuisten, zo strak als mogelijk.', span: 5, los: 10 },
  { naam: 'Armen', instructie: 'Span je biceps én onderarmen aan.', span: 5, los: 10 },
  { naam: 'Schouders', instructie: 'Trek je schouders naar je oren.', span: 5, los: 10 },
  { naam: 'Gezicht', instructie: 'Knijp je ogen dicht, frons alles samen.', span: 5, los: 10 },
];

export function totaleDuur() {
  return PMR_SPIEREN.reduce((som, groep) => som + groep.span + groep.los, 0);
}

export function faseOpTijdstip(secondenSindsStart) {
  let overgebleven = secondenSindsStart;

  for (let i = 0; i < PMR_SPIEREN.length; i++) {
    const groep = PMR_SPIEREN[i];
    const duurGroep = groep.span + groep.los;

    if (overgebleven < duurGroep) {
      const inSpanFase = overgebleven < groep.span;
      const secondenInFase = inSpanFase ? overgebleven : overgebleven - groep.span;
      return {
        spierIndex: i,
        spier: groep,
        fase: inSpanFase ? 'span' : 'los',
        secondenInFase,
        duurFase: inSpanFase ? groep.span : groep.los,
        resterend: (inSpanFase ? groep.span : duurGroep) - overgebleven,
      };
    }
    overgebleven -= duurGroep;
  }

  return null;
}
