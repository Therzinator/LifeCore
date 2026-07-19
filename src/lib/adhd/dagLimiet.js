// Energie-gebaseerde daglimiet — hoe minder energie, hoe minder taken, hoe
// korter het focusblok, en hoe minder uur er vandaag "op de rekening staan".
// Bedoeld om overvraging te voorkomen (en gestructureerd te reintegreren na
// een periode van minder belastbaarheid), niet als target om te halen.
const RATIO = {
  laag: { taken: 3, blok: 25, urenFactor: 0.5 },
  midden: { taken: 5, blok: 45, urenFactor: 0.75 },
  hoog: { taken: 7, blok: 90, urenFactor: 1 },
};

export function dagLimiet(energie, werkurenPerDag = 8) {
  const basis = RATIO[energie] ?? RATIO.midden;
  return { taken: basis.taken, blok: basis.blok, uren: Math.round(werkurenPerDag * basis.urenFactor * 10) / 10 };
}

// Resterende minuten tot het ingestelde stopmoment — negatief als het al voorbij is.
export function minutenTotStopmoment(eindtijd, nu = new Date()) {
  const [uur, minuut] = eindtijd.split(':').map(Number);
  const eind = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate(), uur, minuut);
  return Math.round((eind.getTime() - nu.getTime()) / 60000);
}

const MIDDAG_ADVIES = {
  laag: 'Energie gedaald — minder taken vandaag is prima. Overweeg een langere pauze of stop iets eerder.',
  zelfde: 'Energie stabiel — je kunt door in hetzelfde tempo.',
  hoog: 'Energie nog goed — je bent de dip goed doorgekomen.',
};

export function middagAdvies(niveau) {
  return MIDDAG_ADVIES[niveau] ?? null;
}

// Eén centrale plek voor 'welke energie tellen we nu echt' — een aanhoudende
// uitputtingssignaal uit de Welzijn-check (kruismodule) of een handmatig
// gezakte middagcheck telt allebei als laag, ongeacht wat de ochtend-
// check-in zei. Was voorheen inline gedupliceerd in AdhdDashboard; ook het
// Dagschema-tabblad heeft dezelfde berekening nodig.
export function effectieveEnergie(ochtendEnergie, middagEnergie, focusMoetVerlagen) {
  if (middagEnergie === 'laag' || focusMoetVerlagen) return 'laag';
  return ochtendEnergie;
}
