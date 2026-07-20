import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SubstapContext = createContext({ substap: null, zetSubstap: () => {} });

// Breed gedeeld nodig (Notities-knop in de header vs. stap-componenten diep
// in een moduleboom) zonder prop-drilling door elke module heen — precies
// het uitzonderingsgeval waarvoor Context bedoeld is (zie CLAUDE.md §4).
export function SubstapProvider({ children }) {
  const [substap, setSubstap] = useState(null);
  const waarde = useMemo(() => ({ substap, zetSubstap: setSubstap }), [substap]);
  return <SubstapContext.Provider value={waarde}>{children}</SubstapContext.Provider>;
}

export function useSubstap() {
  return useContext(SubstapContext);
}

// Registreert een label als 'huidige substap' zolang de aanroepende
// component gemount is — geeft bv. een Ochtend-stap of een Werk-tabblad een
// leesbaar label voor de Notities-knop, zonder dat de header ergens
// rechtstreeks naar hoeft te vragen. Ruimt zichzelf op bij unmount/wissel
// (label=null via cleanup) zodat een gesloten stap geen verouderd label
// laat hangen.
export function useRegistreerSubstap(label) {
  const { zetSubstap } = useSubstap();
  useEffect(() => {
    zetSubstap(label ?? null);
    return () => zetSubstap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen reageren op wijzigingen van het label zelf, zetSubstap is stabiel via useMemo hierboven.
  }, [label]);
}
