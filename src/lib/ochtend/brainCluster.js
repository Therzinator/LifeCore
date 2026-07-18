const ZORGEN_PATROON = /bang|stress|zorgen|vergeet|vergeten|niet zeker|nerveus|angst/i;
const TAKEN_PATROON = /moet|kan|bellen|mailen|kopen|sturen|regelen|afmaken|doen/i;

export function clusterBrainDump(tekst) {
  const schoon = (tekst ?? '').trim();
  if (schoon.length < 10) {
    return { zorgen: [], taken: [], ideeen: [] };
  }

  const zinnen = schoon
    .split(/[.!?\n]+/)
    .map((z) => z.trim())
    .filter((z) => z.length > 3);

  const zorgen = [];
  const taken = [];
  const ideeen = [];

  for (const zin of zinnen) {
    if (ZORGEN_PATROON.test(zin)) zorgen.push(zin);
    else if (TAKEN_PATROON.test(zin)) taken.push(zin);
    else ideeen.push(zin);
  }

  return { zorgen, taken, ideeen };
}
