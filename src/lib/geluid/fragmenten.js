// Centrale lijst van selecteerbare geluidsfragmenten voor timers (rusttimer,
// focusblok, ademhalingsoefening, ochtendroutine). Nu allemaal synthetische
// Web Audio-tonen — er zijn nog geen audiobestanden in het project.
//
// Om later een eigen mp3/wav toe te voegen: zet het bestand in public/sounds/
// en voeg hier een entry toe met een `bestand`-property, bv.
//   { id: 'eigenGeluid', naam: 'Mijn geluid', bestand: '/sounds/eigenGeluid.mp3' }
// speelFragment() speelt dat bestand dan automatisch af i.p.v. de synthese —
// verder is geen codewijziging nodig.

export const GEEN_GELUID = 'geen';

export const GELUIDSFRAGMENTEN = [
  { id: GEEN_GELUID, naam: 'Geen geluid' },
  { id: 'tweetonen', naam: 'Twee tonen' },
  { id: 'zachtebel', naam: 'Zachte bel' },
  { id: 'oplopend', naam: 'Oplopend riedeltje' },
  { id: 'digitaal', naam: 'Digitale piep' },
  { id: 'enkeleklok', naam: 'Enkele klok' },
];

function speelToon(ctx, freq, start, duur, type = 'sine', piek = 0.3) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(piek, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duur + 0.05);
}

const SYNTHESE = {
  tweetonen(ctx) {
    const t = ctx.currentTime;
    speelToon(ctx, 880, t, 0.35);
    speelToon(ctx, 660, t + 0.16, 0.35);
  },
  zachtebel(ctx) {
    speelToon(ctx, 523, ctx.currentTime, 1.1, 'sine', 0.22);
  },
  oplopend(ctx) {
    const t = ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => speelToon(ctx, freq, t + i * 0.14, 0.3));
  },
  digitaal(ctx) {
    const t = ctx.currentTime;
    speelToon(ctx, 1046, t, 0.09, 'square', 0.12);
    speelToon(ctx, 1046, t + 0.14, 0.09, 'square', 0.12);
  },
  enkeleklok(ctx) {
    const t = ctx.currentTime;
    speelToon(ctx, 392, t, 1.4, 'sine', 0.2);
    speelToon(ctx, 587, t, 1.4, 'sine', 0.1);
  },
};

export function speelFragment(fragmentId) {
  if (!fragmentId || fragmentId === GEEN_GELUID) return;

  const definitie = GELUIDSFRAGMENTEN.find((f) => f.id === fragmentId);
  if (!definitie) return;

  if (definitie.bestand) {
    new window.Audio(definitie.bestand).play().catch(() => {});
    return;
  }

  const synthese = SYNTHESE[fragmentId];
  if (!synthese) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    synthese(ctx);
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Web Audio niet beschikbaar — stilletjes negeren.
  }
}
