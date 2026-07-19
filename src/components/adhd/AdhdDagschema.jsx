import { useDagdata } from '../../hooks/useDagdata.js';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { dagLimiet, effectieveEnergie } from '../../lib/adhd/dagLimiet.js';
import { genereerDagschema } from '../../lib/adhd/dagschema.js';
import './AdhdDagschema.css';

const ONTSTRESS_TIPS = [
  'Sta even op en rek je uit.',
  'Drink een glas water.',
  'Loop een rondje weg van je scherm.',
  'Doe een paar rustige, bewuste ademhalingen.',
];

// Zet de open Werktaken om in een tijdgeblokte dagplanning — puur weergave,
// geen eigen opslag: genereerDagschema wordt bij elke render vers berekend
// uit de actuele Werktaken/energie/instellingen (zie dagschema.js), net als
// Kluslijst's projectMaandOverzicht. userId/huishoudenId alleen nodig om
// (read-only) de projectnaam van een gekoppelde Kluslijst-taak op te halen.
export default function AdhdDagschema({ adhdDag, instellingen, focusMoetVerlagen, onStartFocus, onNavigeer, userId, huishoudenId }) {
  const dagdata = useDagdata();
  const werkTaken = useWerkTaken();
  const huishoudProjecten = useHuishoudProjecten(huishoudenId, userId);

  const ochtendEnergie = dagdata.dag.checkin?.energie ?? null;
  const energie = effectieveEnergie(ochtendEnergie, adhdDag.dag.middagEnergie, focusMoetVerlagen);
  const limiet = dagLimiet(energie, instellingen.werkurenPerDag);
  const venster = { starttijd: instellingen.starttijd, eindtijd: instellingen.eindtijd };
  const { blokken, nietIngepland } = genereerDagschema(werkTaken.openstaand, venster, limiet);

  function projectNaam(projectId) {
    if (!projectId) return null;
    return huishoudProjecten.projecten.find((p) => p.id === projectId)?.naam ?? null;
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Dagschema</div>
      <p className="of-stap-tekst">
        Je open Werktaken ingedeeld over je werkvenster ({instellingen.starttijd}–{instellingen.eindtijd}) —
        zwaarste taken eerst, met ingeplande pauzes. Past zich aan je energie van vandaag aan.
      </p>
      {!ochtendEnergie && !adhdDag.dag.middagEnergie && (
        <p className="ad-hint">Vul je energie in bij de ochtend-check-in of op het Dashboard voor een passend schema.</p>
      )}

      {werkTaken.openstaand.length === 0 ? (
        <p className="of-stap-tekst">Geen open Werktaken — niets te plannen. Voeg taken toe bij Werk.</p>
      ) : blokken.length === 0 ? (
        <p className="of-stap-tekst">
          Je daglimiet ({limiet.uren}u / {limiet.taken} taken) is al bereikt, of je werkvenster is voorbij voor vandaag.
        </p>
      ) : (
        <div className="adsc-tijdlijn">
          {blokken.map((blok, i) => (
            blok.type === 'werk' ? (
              <div className="adsc-blok adsc-werk" key={i}>
                <div className="adsc-tijd">{blok.start}–{blok.eind}</div>
                <div className="adsc-inhoud">
                  <div className="adsc-taak-tekst">{blok.taak.tekst}</div>
                  {projectNaam(blok.taak.projectId) && (
                    <span className="hhp-werk-badge"> · {projectNaam(blok.taak.projectId)}</span>
                  )}
                </div>
                <button className="btn btn-p btn-sm" onClick={() => onStartFocus(blok.taak.tekst, limiet.blok)}>Start</button>
              </div>
            ) : (
              <div className={`adsc-blok adsc-pauze ${blok.lang ? 'lang' : ''}`} key={i}>
                <div className="adsc-tijd">{blok.start}–{blok.eind}</div>
                <div className="adsc-inhoud">
                  <div className="adsc-pauze-tekst">
                    {blok.lang ? '☕ Lange pauze' : '💧 Korte pauze'} — {ONTSTRESS_TIPS[i % ONTSTRESS_TIPS.length]}
                  </div>
                  {blok.lang && onNavigeer && (
                    <button className="btn btn-g btn-sm" onClick={() => onNavigeer('mindfulness')}>Naar Ademhaling</button>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {nietIngepland.length > 0 && (
        <div className="card">
          <div className="td-label">Niet ingepland vandaag ({nietIngepland.length})</div>
          <p className="ti-hint">Mogelijk morgen — geen druk om alles vandaag te doen.</p>
          <div className="ad-takenlijst">
            {nietIngepland.map((t) => (
              <div className="ad-taak" key={t.id}>
                <span className="ad-taak-tekst">{t.tekst}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
