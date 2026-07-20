import { useState } from 'react';
import { useVragenlijstGeschiedenis } from '../../hooks/useVragenlijstGeschiedenis.js';
import { useWelzijnInstellingen } from '../../hooks/useWelzijnInstellingen.js';
import { useKruisSignalen } from '../../hooks/useKruisSignalen.js';
import {
  WELZIJN_SUBSCHALEN, berekenScores, volgendeCheckDatum, checkIsVerschuldigd,
} from '../../lib/welzijn/vragenset.js';
import { bepaalSignalen } from '../../lib/welzijn/signalering.js';
import { relatieveTijd } from '../../utils/datum.js';
import VragenlijstCheck from './VragenlijstCheck.jsx';
import LijnGrafiek from '../dashboard/LijnGrafiek.jsx';
import WelzijnInstellingen from './WelzijnInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
import './WelzijnPagina.css';

function datumLabel(iso) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric' });
}

function afgerond(waarde) {
  return Math.round(waarde * 10) / 10;
}

export default function WelzijnPagina() {
  const geschiedenis = useVragenlijstGeschiedenis('welzijn_check');
  const { instellingen, bewaar: bewaarInstellingen } = useWelzijnInstellingen();
  const { signalen: kruisSignalen } = useKruisSignalen({ welzijnVroegCheck: instellingen.toonVroegeCheckSuggestie });
  const werkSuggestie = kruisSignalen.find((s) => s.doel === 'welzijn');
  const [scherm, setScherm] = useState('overzicht');
  useRegistreerSubstap(scherm === 'vragen' ? 'Vragenlijst invullen' : 'Overzicht');

  const afnames = geschiedenis.afnames;
  const signalen = bepaalSignalen(afnames);
  const laatsteDatum = geschiedenis.laatste?.datum ?? null;
  const verschuldigd = checkIsVerschuldigd(laatsteDatum, instellingen.cadansDagen);
  const volgende = volgendeCheckDatum(laatsteDatum, instellingen.cadansDagen);

  function verzend(antwoorden) {
    const scores = berekenScores(antwoorden);
    geschiedenis.voegToe(antwoorden, scores);
    setScherm('overzicht');
  }

  if (scherm === 'vragen') {
    return (
      <div className="of-wrap">
        <div className="card">
          <VragenlijstCheck
            titel="Burn-out & herstel-check"
            subschalen={WELZIJN_SUBSCHALEN}
            onderbouwingSleutel="welzijnCheck"
            onVerzenden={verzend}
            onAnnuleren={() => setScherm('overzicht')}
          />
        </div>
      </div>
    );
  }

  const labels = afnames.map((a) => datumLabel(a.datum));

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)', flex: 1, minWidth: 0 }}>Burn-out &amp; herstel-check</div>
        <ModuleInstellingenKnop titel="Welzijn-instellingen">
          <WelzijnInstellingen instellingen={instellingen} bewaar={bewaarInstellingen} />
        </ModuleInstellingenKnop>
      </div>
      <p className="of-stap-tekst">
        Eén check die burn-out en herstel samen meet — geen twee losse vragenlijsten.
        Blijft alleen hier zichtbaar, niet op het hoofddashboard.
      </p>

      {signalen.map((signaal) => (
        <div className="ad-banner warn" key={signaal.id}>{signaal.tekst}</div>
      ))}
      {werkSuggestie && <div className="ad-banner">{werkSuggestie.tekst}</div>}

      <div className="card">
        <div className="wp-titel">{afnames.length ? 'Volgende check' : 'Eerste check'}</div>
        <div className="wp-laatst">
          {afnames.length
            ? `Laatst ingevuld: ${relatieveTijd(laatsteDatum)}` +
              (verschuldigd ? ' — nu weer aan de beurt.' : ` — volgende vanaf ${datumLabel(volgende.toISOString())}.`)
            : 'Nog niet eerder ingevuld — elke twee weken is de bedoeling.'}
        </div>
        <button className="btn btn-p btn-full" onClick={() => setScherm('vragen')}>
          {afnames.length ? 'Check opnieuw doen' : 'Eerste check starten'}
        </button>
      </div>

      {afnames.length > 0 && (
        <>
          <div className="card">
            <div className="td-label">Persoonlijke uitputting</div>
            <LijnGrafiek labels={labels} waarden={afnames.map((a) => afgerond(a.scores.persoonlijk))} />
          </div>
          <div className="card">
            <div className="td-label">Werkgerelateerde uitputting</div>
            <LijnGrafiek labels={labels} waarden={afnames.map((a) => afgerond(a.scores.werk))} />
          </div>
          <div className="card">
            <div className="td-label">Herstelscore</div>
            <LijnGrafiek labels={labels} waarden={afnames.map((a) => afgerond(a.scores.herstel))} />
          </div>
        </>
      )}
    </div>
  );
}
