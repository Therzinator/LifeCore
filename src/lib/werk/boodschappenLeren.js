// Zelflerende favorieten-detectie voor Boodschappen — item-niveau
// aankoopinterval-detectie (mediaan aantal dagen tussen opeenvolgende
// aankopen van hetzelfde product), de gangbare, uitlegbare industriestandaard
// voor 'wanneer koopt iemand dit opnieuw' op deze schaal (zie het plan-
// bestand voor de bron). Bewust GEEN ML/clustering — dat is bedoeld voor
// winkel-schaal met duizenden klanten en zou hier overfitten op een
// handvol boodschappen-beurten per maand. Mediaan i.p.v. gemiddelde: robuust
// tegen één uitschieter (bv. een gemiste week), zelfde principe als LPT en
// Kahn's topologische sortering elders in dit project — deterministisch en
// uitlegbaar, geen black box.

const WEEK_MIN_DAGEN = 4;
const WEEK_MAX_DAGEN = 10;
const MAAND_MIN_DAGEN = 20;
const MAAND_MAX_DAGEN = 40;

function mediaan(getallen) {
  const gesorteerd = [...getallen].sort((a, b) => a - b);
  const midden = Math.floor(gesorteerd.length / 2);
  return gesorteerd.length % 2 === 0
    ? (gesorteerd[midden - 1] + gesorteerd[midden]) / 2
    : gesorteerd[midden];
}

function dagenTussen(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

// beurten: [{ datum: 'YYYY-MM-DD', items: [{ tekst, aantal }] }]
export function detecteerFavorieten(beurten) {
  // Groeperen op genormaliseerde tekst (trim + lowercase) — voorkomt dat
  // "Melk" en "melk" als twee losse producten tellen, zonder een echte
  // fuzzy-match te doen (bewust simpel, geen NLP).
  const perItem = {};
  beurten.forEach((beurt) => {
    (beurt.items ?? []).forEach((item) => {
      const key = item.tekst.trim().toLowerCase();
      if (!perItem[key]) perItem[key] = { tekst: item.tekst, datums: [] };
      perItem[key].datums.push(beurt.datum);
    });
  });

  const wekelijks = [];
  const maandelijks = [];

  Object.values(perItem).forEach(({ tekst, datums }) => {
    if (datums.length < 2) return; // minstens één interval nodig om iets te classificeren

    const gesorteerd = [...datums].sort();
    const intervallen = gesorteerd.slice(1).map((d, i) => dagenTussen(gesorteerd[i], d));
    const mediaanInterval = mediaan(intervallen);
    const entry = { tekst, aantalKeer: datums.length, laatstGekocht: gesorteerd[gesorteerd.length - 1] };

    if (mediaanInterval >= WEEK_MIN_DAGEN && mediaanInterval <= WEEK_MAX_DAGEN) wekelijks.push(entry);
    else if (mediaanInterval >= MAAND_MIN_DAGEN && mediaanInterval <= MAAND_MAX_DAGEN) maandelijks.push(entry);
  });

  const sorteerOpFrequentie = (a, b) => b.aantalKeer - a.aantalKeer;
  return { wekelijks: wekelijks.sort(sorteerOpFrequentie), maandelijks: maandelijks.sort(sorteerOpFrequentie) };
}
