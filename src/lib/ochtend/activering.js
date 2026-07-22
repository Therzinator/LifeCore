// Rek/mobiliteit-lijst — bewust kort (<30s per oefening) en zonder materiaal,
// gericht op de twee meest voorkomende klachten 's ochtends: heup/hamstring-
// stijfheid en schouder/nek-spanning van de slaaphouding.
export const REK_OEFENINGEN = [
  { id: 'r1', naam: 'Enkels ronddraaien', uitleg: '10× mee + 10× tegendraads, beide enkels. Losmaken na liggen.', duur: '30s' },
  { id: 'r2', naam: 'Schouders oprollen', uitleg: '10× naar voren, 10× naar achteren. Verlicht slaap-spanning.', duur: '20s' },
  { id: 'r3', naam: 'Nek langzaam draaien', uitleg: 'Links houd 3s, midden, rechts houd 3s — 5× per kant. Niet forceren.', duur: '35s' },
  { id: 'r9', naam: 'Kin naar borst', uitleg: 'Kin rustig richting borst, rek achterin de nek voelen. Niet forceren.', duur: '35s (incl. 5s om in positie te komen)' },
  { id: 'r4', naam: 'Cat-Cow', uitleg: 'Op handen/knieën: rug hol (in) → rug bol (uit). 8 cycli.', duur: '45s' },
  { id: 'r5', naam: 'Thoracale rotatie (zij)', uitleg: 'Lig op zij, knieën 90°. Bovenste arm naar achter, borst openen. 8× per kant.', duur: '45s' },
  { id: 'r6', naam: 'Kindhouding', uitleg: '30s rustig ademhalen. Rekt lumbale fascia.', duur: '35s (incl. 5s om in positie te komen)' },
  { id: 'r7', naam: 'Knie naar borst', uitleg: 'Lig op rug. Trek één knie naar borst 20s, wissel. Rekt heupbuiger.', duur: '40s' },
  { id: 'r8', naam: 'Heupscharnieren', uitleg: 'Staand, voeten schouderbreedte. Buig voorover 10× langzaam.', duur: '30s' },
];

// Kindhouding en 'Kin naar borst' krijgen een eigen timer (i.p.v. alleen een
// vinkje) — 30s zelf tellen met dicht/afgeleid gevoel duurt in de praktijk
// te lang. 5s extra bovenop de kern-duur zodat er tijd is om in positie te
// komen na het starten van de timer. 'Nek langzaam draaien' had voorheen
// deze rol maar is nu een gewone vink-oefening; de timer zit op de rek die
// hem echt nodig heeft.
export const KINDHOUDING_ID = 'r6';
export const KINDHOUDING_TIMER_SECONDEN = 35;
export const KIN_NAAR_BORST_ID = 'r9';
export const KIN_NAAR_BORST_TIMER_SECONDEN = 35;
// Los, eerder tussensignaal (bv. 'nu wisselen van kant') bovenop het
// eindsignaal — allebei met een eigen, onafhankelijk instelbaar
// geluidsfragment (zie useOchtendInstellingen.js).
export const KIN_NAAR_BORST_TUSSENSIGNAAL_SECONDEN = 25;

const ENERGIE_HINT = {
  laag: 'Energie laag — doe alleen rek & strek, sla plank en push-ups gerust over.',
  midden: 'Midden energie — doe wat comfortabel voelt.',
  hoog: 'Energie hoog — de volledige routine past waarschijnlijk: rek & strek + plank + push-ups.',
};

export function energieHint(energie) {
  return ENERGIE_HINT[energie] ?? null;
}
