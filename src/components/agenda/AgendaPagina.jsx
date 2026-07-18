import { useState } from 'react';
import { useAgendaBlokken } from '../../hooks/useAgendaBlokken.js';
import { useAgendaSignalen } from '../../hooks/useAgendaSignalen.js';
import { useDagTypeOverrides } from '../../hooks/useDagTypeOverrides.js';
import { instantiesInBereik } from '../../lib/agenda/agendaBlokken.js';
import { weekDatums } from '../../lib/agenda/kalenderRooster.js';
import { maandagVan, datumKey } from '../../utils/datum.js';
import AgendaMaand from './AgendaMaand.jsx';
import AgendaWeek from './AgendaWeek.jsx';
import AgendaDag from './AgendaDag.jsx';
import AgendaBlokForm from './AgendaBlokForm.jsx';
import Modal from '../ui/Modal.jsx';
import './AgendaPagina.css';

const WEERGAVEN = [
  { id: 'maand', label: 'Maand' },
  { id: 'week', label: 'Week' },
  { id: 'dag', label: 'Dag' },
];

function vandaagIso() {
  return datumKey();
}

function bereikVoorWeergave(weergave, referentieDatum) {
  if (weergave === 'maand') {
    const [jaar, maand] = referentieDatum.slice(0, 7).split('-').map(Number);
    const laatsteDag = new Date(jaar, maand, 0).getDate();
    return {
      bereikStart: `${referentieDatum.slice(0, 7)}-01`,
      bereikEind: `${referentieDatum.slice(0, 7)}-${String(laatsteDag).padStart(2, '0')}`,
    };
  }
  if (weergave === 'week') {
    const maandag = maandagVan(referentieDatum);
    const zondag = new Date(maandag);
    zondag.setDate(zondag.getDate() + 6);
    return { bereikStart: maandag, bereikEind: datumKey(zondag) };
  }
  return { bereikStart: referentieDatum, bereikEind: referentieDatum };
}

export default function AgendaPagina({ toonToast, onNavigeer }) {
  const [weergave, setWeergave] = useState('maand');
  const [referentieDatum, setReferentieDatum] = useState(vandaagIso());
  const [toonForm, setToonForm] = useState(false);

  const blokken = useAgendaBlokken();
  const { overrides: dagTypeOverrides, zetOverride: zetDagTypeOverride } = useDagTypeOverrides();
  const { bereikStart, bereikEind } = bereikVoorWeergave(weergave, referentieDatum);
  const { signalen } = useAgendaSignalen(bereikStart, bereikEind, dagTypeOverrides);
  const blokInstanties = instantiesInBereik(blokken.blokken, bereikStart, bereikEind);

  const [jaar, maandNr] = referentieDatum.slice(0, 7).split('-').map(Number);

  function navigeer(richting) {
    const d = new Date(referentieDatum);
    if (weergave === 'maand') d.setMonth(d.getMonth() + richting);
    else if (weergave === 'week') d.setDate(d.getDate() + richting * 7);
    else d.setDate(d.getDate() + richting);
    setReferentieDatum(datumKey(d));
  }

  function kiesDag(datum) {
    setReferentieDatum(datum);
    setWeergave('dag');
  }

  function nieuwBlokOpslaan(blok) {
    blokken.voegToe(blok);
    setToonForm(false);
    toonToast('Blok toegevoegd', 'ok');
  }

  const periodeLabel = weergave === 'maand'
    ? new Date(referentieDatum).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
    : weergave === 'week'
      ? `Week van ${new Date(bereikStart).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`
      : new Date(referentieDatum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="of-wrap">
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Agenda</div>
      <p className="of-stap-tekst">
        Eén overzicht van je afspraken, geplande rust-/sport-/sociale tijd, en signalen uit andere modules —
        vervangt geen enkele module-instelling, toont ze alleen samen.
      </p>

      <div className="ag-tabs">
        {WEERGAVEN.map((w) => (
          <button key={w.id} className={`ag-tab ${weergave === w.id ? 'on' : ''}`} onClick={() => setWeergave(w.id)}>{w.label}</button>
        ))}
      </div>

      <div className="ag-nav-rij">
        <button className="btn btn-g btn-sm" onClick={() => navigeer(-1)} aria-label="Vorige periode">←</button>
        <div className="ag-periode-lbl" style={{ textTransform: 'capitalize' }}>{periodeLabel}</div>
        <button className="btn btn-g btn-sm" onClick={() => navigeer(1)} aria-label="Volgende periode">→</button>
        <button className="btn btn-text btn-sm" onClick={() => setReferentieDatum(vandaagIso())}>Vandaag</button>
      </div>

      <div className="card">
        {weergave === 'maand' && (
          <AgendaMaand jaar={jaar} maand={maandNr} blokInstanties={blokInstanties} signalen={signalen} onKiesDag={kiesDag} />
        )}
        {weergave === 'week' && (
          <AgendaWeek datums={weekDatums(referentieDatum)} blokInstanties={blokInstanties} signalen={signalen} onKiesDag={kiesDag} />
        )}
        {weergave === 'dag' && (
          <AgendaDag
            datum={referentieDatum}
            blokInstanties={blokInstanties}
            signalen={signalen}
            onVerwijderBlok={blokken.verwijder}
            onNieuwBlok={() => setToonForm(true)}
            dagTypeOverride={dagTypeOverrides[referentieDatum] ?? null}
            onZetDagTypeOverride={zetDagTypeOverride}
            onNavigeer={onNavigeer}
          />
        )}
      </div>

      {weergave !== 'dag' && (
        <button className="btn btn-g btn-full" onClick={() => setToonForm(true)}>+ Blok toevoegen</button>
      )}

      {toonForm && (
        <Modal titel="Nieuw blok" onClose={() => setToonForm(false)}>
          <AgendaBlokForm initieleDatum={referentieDatum} onOpslaan={nieuwBlokOpslaan} onAnnuleren={() => setToonForm(false)} />
        </Modal>
      )}
    </div>
  );
}
