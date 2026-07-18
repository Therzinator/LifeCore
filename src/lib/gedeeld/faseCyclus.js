export function maakFaseCyclus(fases) {
  const duur = fases.reduce((som, f) => som + f.duur, 0);

  function cyclusDuur() {
    return duur;
  }

  function faseOpTijdstip(secondenSindsStart) {
    const inCyclus = ((secondenSindsStart % duur) + duur) % duur;
    const cyclusIndex = Math.floor(secondenSindsStart / duur);

    let acc = 0;
    for (const fase of fases) {
      if (inCyclus < acc + fase.duur) {
        const secondenInFase = inCyclus - acc;
        return {
          naam: fase.naam,
          secondenInFase,
          resterend: fase.duur - secondenInFase,
          duurFase: fase.duur,
          cyclusIndex,
        };
      }
      acc += fase.duur;
    }

    const eerste = fases[0];
    return { naam: eerste.naam, secondenInFase: 0, resterend: eerste.duur, duurFase: eerste.duur, cyclusIndex };
  }

  return { cyclusDuur, faseOpTijdstip };
}
