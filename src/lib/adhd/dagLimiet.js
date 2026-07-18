// Energie-gebaseerde daglimiet — hoe minder energie, hoe minder taken en hoe
// korter het focusblok. Bedoeld om overvraging te voorkomen, niet als target
// om te halen.
const LIMIETEN = {
  laag: { taken: 3, blok: 25 },
  midden: { taken: 5, blok: 45 },
  hoog: { taken: 7, blok: 90 },
};

export function dagLimiet(energie) {
  return LIMIETEN[energie] ?? LIMIETEN.midden;
}
