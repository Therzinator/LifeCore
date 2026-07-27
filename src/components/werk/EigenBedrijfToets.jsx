import { useState } from 'react';
import { maandagVan, vandaagKey, dagIndexVan } from '../../utils/datum.js';
import { geplandeMinuten } from '../../lib/eigenbedrijf/blokken.js';
import { weekTotalen } from '../../lib/eigenbedrijf/uren.js';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './EigenBedrijfToets.css';

const ANTWOORD_OPTIES = [
  { id: 'ja', label: '🙂 Ja' },
  { id: 'grotendeels', label: '😐 Grotendeels' },
  { id: 'nee', label: '😕 Nee' },
];

function urenLabel(minuten) {
  const uren = Math.floor(minuten / 60);
  const rest = minuten % 60;
  return uren > 0 ? `${uren}u ${rest}m` : `${rest}m`;
}

// Zondag-toetsmoment — altijd bereikbaar (niet vergrendeld tot zondagavond),
// maar prominent zodra vandaag het ingestelde toets-blok is. Geen
// schuldframing bij overschrijding: de guilt-free-copy wijst naar "klopt
// het schema nog" i.p.v. "je hebt te veel gewerkt" — zie
// docs/SIGNALEN.md-principe en de opdracht zelf.
export default function EigenBedrijfToets({ instellingen, sessies, toetsen, toonToast }) {
  const weekMaandag = maandagVan(vandaagKey());
  const bestaandeToets = toetsen.weken[weekMaandag];
  const [antwoord, setAntwoord] = useState(bestaandeToets?.antwoord ?? null);
  const [opmerking, setOpmerking] = useState(bestaandeToets?.opmerking ?? '');

  const isVandaagToetsDag = (instellingen.blokken ?? []).some(
    (b) => b.soort === 'toets' && b.dagNr - 1 === dagIndexVan(vandaagKey()),
  );

  const gepland = geplandeMinuten(instellingen.blokken);
  const gelogd = weekTotalen(sessies.sessies, weekMaandag);
  const pctBoven = gepland.werkTotaal > 0
    ? Math.round(((gelogd.totaal - gepland.werkTotaal) / gepland.werkTotaal) * 100)
    : null;

  function opslaan() {
    if (!antwoord) { toonToast('Kies eerst een antwoord', 'wn'); return; }
    toetsen.bewaarToets(weekMaandag, {
      antwoord, opmerking,
      gelogd: { facturabel: gelogd.facturabel, platform: gelogd.platform },
      gepland: { werkTotaal: gepland.werkTotaal },
    });
    toonToast('Toetsmoment opgeslagen', 'ok');
  }

  return (
    <div className="card">
      <div className="td-label">Zondag-toetsmoment{isVandaagToetsDag ? ' — vandaag' : ''}</div>
      <p className="of-stap-tekst">
        Deze week: {urenLabel(gelogd.totaal)} gelogd tegen {urenLabel(gepland.werkTotaal)} gepland.
      </p>
      {pctBoven !== null && pctBoven > 0 && (
        <p className="ebt-guiltfree">
          Dat is {pctBoven}% boven je eigen schema — geen ramp, en geen reden om jezelf iets te verwijten.
          Misschien klopt het schema gewoon niet meer, in plaats van dat jij iets fout deed.
        </p>
      )}

      <label className="ti-lbl">Ben je deze week binnen je eigen schema gebleven?</label>
      <div className="ti-rij" style={{ flexWrap: 'wrap' }}>
        {ANTWOORD_OPTIES.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`btn btn-sm ${antwoord === o.id ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => setAntwoord(o.id)}
          >{o.label}</button>
        ))}
      </div>

      <label className="ti-lbl" htmlFor="ebt-opmerking" style={{ marginTop: 'var(--space-sm)' }}>Opmerking (optioneel)</label>
      <div className="sk-inline-rij">
        <textarea
          id="ebt-opmerking"
          className="ebt-textarea"
          placeholder="Wat viel je op deze week?"
          value={opmerking}
          onChange={(e) => setOpmerking(e.target.value)}
        />
        <SpraakKnop waarde={opmerking} onWaarde={setOpmerking} compact />
      </div>

      <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={opslaan}>
        {bestaandeToets ? 'Toetsmoment bijwerken' : 'Toetsmoment opslaan'}
      </button>
    </div>
  );
}
