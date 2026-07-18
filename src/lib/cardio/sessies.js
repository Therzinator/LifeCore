import { tempoNaarSec } from './tempo.js';
import { maandagVan } from '../../utils/datum.js';

const DAG_MS = 1000 * 60 * 60 * 24;

// Een sessie is een PR als het gemiddelde tempo (min/km) sneller is dan alle
// eerdere sessies van hetzelfde type met een geldige afstand + tempo.
export function isNieuweTempoPR(type, afstand, tempo, sessies) {
  if (!afstand || !tempo) return false;
  const eigenSec = tempoNaarSec(tempo);
  if (!eigenSec) return false;

  const eerdere = sessies.filter((s) => s.type === type && s.afstand > 0 && s.tempo);
  if (eerdere.length === 0) return true;

  const besteSec = Math.min(...eerdere.map((s) => tempoNaarSec(s.tempo)).filter((t) => t > 0));
  return eigenSec < besteSec;
}

// Consistentie-advies — bewust guilt-free geframed: geen "je hebt gefaald",
// wel concrete, neutrale observaties over belasting/volume.
export function adviesConsistentie(sessies, vandaag = new Date()) {
  const relevant = sessies.filter((s) => s.type === 'hardlopen' || s.type === 'roeien');
  if (relevant.length < 3) return null;

  const laatste = relevant.slice(0, 5);
  const gemRpe = laatste.reduce((som, s) => som + (s.rpe || 5), 0) / laatste.length;
  const dezeWeek = relevant.filter((s) => (vandaag - new Date(s.datum)) / DAG_MS <= 7).length;

  const punten = [];
  if (gemRpe >= 8) {
    punten.push({ kop: 'Hoge belasting', tekst: 'De gemiddelde inspanning van je laatste sessies is hoog. Plan een herstelsessie of roei rustig.' });
  }
  if (dezeWeek >= 5) {
    punten.push({ kop: 'Veel volume', tekst: '5 of meer sessies deze week. Overweeg een rustdag.' });
  }
  if (dezeWeek === 0) {
    punten.push({ kop: 'Geen sessies deze week', tekst: 'Zelfs een korte wandeling telt mee.' });
  }

  const afstanden = relevant.slice(0, 4).filter((s) => s.afstand > 0).map((s) => s.afstand);
  if (afstanden.length >= 2) {
    const groei = ((afstanden[0] - afstanden[afstanden.length - 1]) / afstanden[afstanden.length - 1]) * 100;
    if (groei > 25) {
      punten.push({ kop: 'Snelle afstandsgroei', tekst: 'Meer dan 25% toename in korte tijd. Houd de 10%-regel per week aan.' });
    }
    if (groei < -10) {
      punten.push({ kop: 'Terugval in volume', tekst: 'Korte sessies zijn prima als herstel — bouw daarna weer rustig op.' });
    }
  }

  if (punten.length === 0) {
    punten.push({ kop: 'Goed bezig', tekst: 'Blijf consistent — dat is de belangrijkste factor voor progressie.' });
  }
  return punten;
}

// Gestructureerde suggesties specifiek voor hardloop-progressie — pas zichtbaar
// vanaf 5 sessies, zodat er genoeg data is om iets zinnigs te zeggen.
export function trainingsAdviezen(sessies) {
  const loopSessies = sessies.filter((s) => s.type === 'hardlopen' && s.afstand > 0);
  if (loopSessies.length < 5) return [];

  const afstanden = loopSessies.slice(0, 8).map((s) => s.afstand);
  const gemAfstand = afstanden.reduce((a, b) => a + b, 0) / afstanden.length;
  const alleTempos = loopSessies.filter((s) => s.tempo).map((s) => tempoNaarSec(s.tempo));
  const gemTempo = alleTempos.length ? alleTempos.reduce((a, b) => a + b, 0) / alleTempos.length : 0;

  const adviezen = [];

  const recenteKm = loopSessies.slice(0, 2).reduce((s, r) => s + r.afstand, 0);
  const oudeKm = loopSessies.slice(2, 4).reduce((s, r) => s + r.afstand, 0);
  if (oudeKm > 0 && (recenteKm - oudeKm) / oudeKm > 0.12) {
    adviezen.push({ icoon: '⚠️', kop: 'Verhoog volume geleidelijk', tekst: 'Meer dan 10% stijging per periode vergroot het blessurerisico.' });
  }

  if (gemTempo > 0 && gemTempo < 300) {
    adviezen.push({ icoon: '🏃', kop: 'Goed tempo', tekst: 'Focus nu op volume en consistentie voor verdere verbetering.' });
  }
  if (gemTempo >= 360) {
    adviezen.push({ icoon: '🐢', kop: 'Vooral makkelijke runs', tekst: '80% van je training op een tempo waarop je nog kunt praten. Voeg 1× per week een tempo-run toe.' });
  }

  const rpeHoog = loopSessies.slice(0, 6).filter((s) => s.rpe && s.rpe >= 7).length;
  const rpePct = rpeHoog / Math.min(loopSessies.length, 6);
  if (rpePct > 0.5) {
    adviezen.push({ icoon: '⚡', kop: 'Veel hard trainen', tekst: 'Meer dan 50% van je sessies op hoge intensiteit. Polarized model: 80% makkelijk, 20% intensief.' });
  }
  if (rpePct < 0.1 && loopSessies.length >= 5) {
    adviezen.push({ icoon: '💤', kop: 'Voeg intensiteit toe', tekst: 'Eén interval- of tempotraining per week stimuleert de lactaatdrempel en snelheid.' });
  }

  if (gemAfstand < 4) {
    adviezen.push({ icoon: '📈', kop: 'Bouw afstand op', tekst: 'Richt je op 5 km basis voordat je tempo traint. Consistentie gaat boven snelheid.' });
  } else if (gemAfstand >= 8) {
    adviezen.push({ icoon: '🎯', kop: 'Goed volume', tekst: 'Overweeg een concreet doel zoals een 10K of halve marathon als motivator.' });
  }

  return adviezen;
}

// Groepeert sessies per week (maandag als sleutel) voor de groeicurve.
export function groeiPerWeek(sessies, weken = 12) {
  const metAfstand = sessies.filter((s) => s.afstand > 0).slice().sort((a, b) => a.datum.localeCompare(b.datum));

  const perWeek = {};
  metAfstand.forEach((s) => {
    const key = maandagVan(s.datum);
    if (!perWeek[key]) perWeek[key] = { afstand: 0, tempos: [], sessies: 0 };
    perWeek[key].afstand += s.afstand;
    if (s.tempo) perWeek[key].tempos.push(tempoNaarSec(s.tempo));
    perWeek[key].sessies += 1;
  });

  const labels = Object.keys(perWeek).slice(-weken);
  const afstandPerWeek = labels.map((k) => Math.round(perWeek[k].afstand * 10) / 10);
  const gemTempoPerWeek = labels.map((k) => {
    const tempos = perWeek[k].tempos;
    return tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : null;
  });

  const totaalKm = metAfstand.reduce((s, r) => s + r.afstand, 0);
  const alleTempos = metAfstand.filter((s) => s.tempo).map((s) => tempoNaarSec(s.tempo));
  const besteTempoSec = alleTempos.length ? Math.min(...alleTempos) : 0;

  return { labels, afstandPerWeek, gemTempoPerWeek, totaalKm, besteTempoSec, totaalSessies: sessies.length };
}

// Verhouding natuur/stad — het meetbare patroon dat het onderzoek als
// relevant aanmerkt (grotere cortisoldaling bij wandelen/lopen in groen).
export function omgevingsVerdeling(sessies) {
  const buiten = sessies.filter((s) => s.type === 'hardlopen' || s.type === 'wandelen');
  const natuur = buiten.filter((s) => s.omgeving === 'natuur').length;
  const stad = buiten.filter((s) => s.omgeving === 'stad').length;
  const onbekend = buiten.length - natuur - stad;
  return { natuur, stad, onbekend, totaal: buiten.length };
}
