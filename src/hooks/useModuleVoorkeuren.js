import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord, PREFIX } from '../lib/storage/lokaal.js';
import { MODULE_VOLGORDE } from '../lib/nav/modules.js';

// Er is geen echt 'nieuw account'-signaal beschikbaar (signup en 'lokaal
// zonder Supabase beginnen' lopen door elkaar) — als heuristiek: een browser/
// account met al bestaande lifecore-data (van vóór deze feature, of gewoon
// een actieve bestaande gebruiker) slaat de onboarding-wizard over, alleen
// een écht lege installatie krijgt 'm te zien.
function heeftBestaandeData() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX) && key !== `${PREFIX}module_voorkeuren`) return true;
  }
  return false;
}

function standaardRecord() {
  return nieuwRecord({ actieveModules: [...MODULE_VOLGORDE], onboardingVoltooid: heeftBestaandeData() });
}

// Bestaande installaties hebben een opgeslagen actieveModules-array van vóór
// het bestaan van een nieuwe module — die array overschrijft de standaard
// volledig bij het samenvoegen hieronder, dus zonder deze migratie zou zo'n
// nieuwe module (bv. 'shopping', afgesplitst van 'thuis') onzichtbaar
// blijven tot iemand de onboarding-wizard opnieuw doorloopt.
function migreerActieveModules(actieveModules) {
  if (!actieveModules || actieveModules.includes('shopping')) return actieveModules;
  return [...actieveModules, 'shopping'];
}

export function useModuleVoorkeuren() {
  const [record, setRecordState] = useState(() => {
    const samengevoegd = { ...standaardRecord(), ...leesLokaal('module_voorkeuren', {}) };
    return { ...samengevoegd, actieveModules: migreerActieveModules(samengevoegd.actieveModules) };
  });

  const zetActieveModules = useCallback((ids) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, actieveModules: ids });
      schrijfLokaal('module_voorkeuren', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const voltooiOnboarding = useCallback(() => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, onboardingVoltooid: true });
      schrijfLokaal('module_voorkeuren', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return {
    actieveModules: record.actieveModules ?? MODULE_VOLGORDE,
    onboardingVoltooid: record.onboardingVoltooid ?? true,
    zetActieveModules,
    voltooiOnboarding,
  };
}
