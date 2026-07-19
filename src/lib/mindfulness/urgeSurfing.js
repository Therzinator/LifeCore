// Vijf stappen om een drang "uit te zitten" in plaats van eraan toe te geven
// of ertegen te vechten — de golf-metafoor uit acceptance-based technieken.
export const URGE_STAPPEN = [
  {
    fase: 'Merk op',
    instructie: 'Erken de drang. Zeg tegen jezelf: "Ik merk dat er een drang opkomt."',
    detail: 'Je hoeft er niets mee te doen. Alleen zien dat hij er is. De drang is een gevoel, geen opdracht.',
  },
  {
    fase: 'Scan je lichaam',
    instructie: 'Waar voel je de drang in je lichaam?',
    detail: 'Keel, borst, buik, handen? Spanning of leegte? Warmte of onrust? Beschrijf het voor jezelf zonder het te beoordelen.',
  },
  {
    fase: 'Visualiseer de golf',
    instructie: 'De drang is een golf. Jij staat op het strand en kijkt ernaar.',
    detail: 'Hij groeit. Hij bereikt een piek. En dan zakt hij. Gemiddeld duurt een drang 5 tot 20 minuten. Hij gaat altijd weg — met of zonder eraan toegeven.',
  },
  {
    fase: 'Adem',
    instructie: 'Adem langzaam in — 4 tellen. Uit — 6 tellen. Drie keer.',
    detail: 'Langzamer uitademen dan inademen activeert het parasympathische zenuwstelsel. Je lichaam kalmeert vanzelf.',
    // Extra ruimte in hands-free-modus om de 3 ademcycli daadwerkelijk te
    // doen, i.p.v. meteen door te schakelen na het uitspreken van de tekst.
    wachtNaMs: 20000,
  },
  {
    fase: 'Kies bewust',
    instructie: 'De golf is gepasseerd. Wat wil je nu bewust doen?',
    detail: 'Niet wat de drang wil — wat jij wilt. Een activiteit, een beweging, iets kleins. Je hebt de golf doorstaan.',
  },
];
