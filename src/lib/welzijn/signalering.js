// Actieve signalering — drempelwaarden zijn hieronder expliciet onderbouwd,
// niet arbitrair gekozen. Schaal: elk item scoort 0 (Nooit) t/m 3 (Bijna
// altijd), een subschaalscore is het gemiddelde van zijn items.
//
// SIGNAAL A — aanhoudend hoge uitputting
// Drempel: een van de twee CBI-subschalen (persoonlijk of werk) scoort
// gemiddeld >= 2.0 in de twee meest recente, opeenvolgende afnames.
//   - Waarom 2.0: op deze 4-puntsschaal komt 2.0 overeen met het antwoord
//     "Vaak" — het punt waarop uitputtingsklachten van incidenteel naar een
//     regelmatig patroon kantelen. Dat is dezelfde kwalitatieve grens die de
//     CBI's eigen schaalconstructie hanteert (het middenanker van hun
//     5-puntsschaal, vertaald naar onze 4-puntsschaal), niet een los
//     geïmporteerd getal.
//   - Waarom twee opeenvolgende afnames (~4 weken) i.p.v. één: één meting
//     kan een toevallig zware week weerspiegelen. Burn-out wordt per
//     definitie gekenmerkt door aanhoudendheid — vandaar dat pas bij een
//     herhaalde, opeenvolgende hoge score gesignaleerd wordt.
//
// SIGNAAL B — dalende hersteltrend
// Drempel: de samengestelde herstelscore (gemiddelde van de 4 REQ-
// subschalen) daalt monotoon over de 3 meest recente afnames (~6 weken) mét
// een totale daling van minstens 0.4 punt.
//   - Waarom 3 opeenvolgende dalende punten: bij een enkel-lagere meting
//     (2 punten) is niet te onderscheiden of dat een echte trend is of
//     gewone meetruis in een subjectieve 0-3-schaal. Drie opeenvolgende
//     dalingen is een veelgebruikte, eenvoudige vuistregel om een
//     betekenisvolle richting te onderscheiden van ruis (vergelijkbaar met
//     "een reeks van drie" in statistische procescontrole).
//   - Waarom 0.4: dit is dezelfde 'betekenisvol verschil'-drempel die deze
//     module al gebruikte (zie het oorspronkelijke DREMPEL-getal), nu
//     hergebruikt i.p.v. een nieuw getal te verzinnen — zorgt voor
//     consistentie in wat "een merkbaar verschil" betekent binnen dezelfde
//     schaal.
//
// Signalen worden bij elke render herberekend uit de bestaande geschiedenis
// (geen opgeslagen alarmstatus) — ze verdwijnen vanzelf zodra het patroon
// niet meer klopt, zonder dat iets hoeft te worden weggeklikt.

const UITPUTTING_DREMPEL = 2.0;
const HERSTEL_DALING_DREMPEL = 0.4;

const UITPUTTING_LABEL = {
  persoonlijk: 'persoonlijke',
  werk: 'werkgerelateerde',
};

export function bepaalSignalen(afnames) {
  const signalen = [];
  const n = afnames.length;
  const laatste = n >= 1 ? afnames[n - 1] : null;
  const vorige = n >= 2 ? afnames[n - 2] : null;

  if (laatste && vorige) {
    for (const id of ['persoonlijk', 'werk']) {
      const huidig = laatste.scores?.[id];
      const eerder = vorige.scores?.[id];
      if (
        typeof huidig === 'number' && huidig >= UITPUTTING_DREMPEL &&
        typeof eerder === 'number' && eerder >= UITPUTTING_DREMPEL
      ) {
        signalen.push({
          id: `uitputting_${id}`,
          type: 'uitputting',
          tekst:
            `Je ${UITPUTTING_LABEL[id]} uitputtingsscore is de laatste twee metingen ` +
            'aanhoudend hoog. Dit is geen diagnose, maar wel het soort patroon waarbij het ' +
            'de moeite waard is om er met iemand over te praten — een huisarts, bedrijfsarts, ' +
            'of iemand die je vertrouwt.',
        });
      }
    }
  }

  if (n >= 3) {
    const [ouder, middelste, nieuwste] = afnames.slice(-3).map((a) => a.scores?.herstel);
    if (
      typeof ouder === 'number' && typeof middelste === 'number' && typeof nieuwste === 'number' &&
      ouder > middelste && middelste > nieuwste &&
      (ouder - nieuwste) >= HERSTEL_DALING_DREMPEL
    ) {
      signalen.push({
        id: 'herstel_dalend',
        type: 'herstel',
        tekst:
          'Je hersteltrend daalt al drie metingen op rij. Herstel bouwt geleidelijk af als er ' +
          'structureel te weinig ruimte voor is — dit is een moment om te kijken wat er nu ' +
          'concreet in de weg staat, niet om jezelf harder te pushen.',
      });
    }
  }

  return signalen;
}
