import { useState, useEffect } from 'react';
import { useAgendaBlokken } from '../../hooks/useAgendaBlokken.js';
import { useAgendaSignalen } from '../../hooks/useAgendaSignalen.js';
import { useDagTypeOverrides } from '../../hooks/useDagTypeOverrides.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { useHuishoudWeekschema } from '../../hooks/useHuishoudWeekschema.js';
import { isGeblokkeerd, alleItemsVanProject } from '../../lib/werk/projectVerdeling.js';
import {
  instantiesInBereik, pasTijdAan, heeftOverlap, volgendeVrijeTijd,
} from '../../lib/agenda/agendaBlokken.js';
import { takenVoorDag } from '../../lib/werk/huishoudWeekschema.js';
import { huidigePeriodeKey } from '../../lib/werk/huishoudPeriode.js';
import { weekDatums } from '../../lib/agenda/kalenderRooster.js';
import { maandagVan, dagIndexVan, datumKey } from '../../utils/datum.js';
import AgendaMaand from './AgendaMaand.jsx';
import AgendaWeek from './AgendaWeek.jsx';
import AgendaDag from './AgendaDag.jsx';
import AgendaBlokForm from './AgendaBlokForm.jsx';
import Modal from '../ui/Modal.jsx';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
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

export default function AgendaPagina({ toonToast, initieleDatum, onInitieleDatumGeconsumeerd, huishoudenId }) {
  const [weergave, setWeergave] = useState(() => (initieleDatum ? 'dag' : 'maand'));
  const [referentieDatum, setReferentieDatum] = useState(() => initieleDatum ?? vandaagIso());
  const [toonForm, setToonForm] = useState(false);
  const [bewerkBlok, setBewerkBlok] = useState(null);
  useRegistreerSubstap(WEERGAVEN.find((w) => w.id === weergave)?.label);

  useEffect(() => {
    if (initieleDatum) onInitieleDatumGeconsumeerd?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij mount: seed van de initiële datum is eenmalig, latere navigatie loopt via referentieDatum/weergave state.
  }, []);

  const blokken = useAgendaBlokken();
  const { overrides: dagTypeOverrides, zetOverride: zetDagTypeOverride } = useDagTypeOverrides();
  const { bereikStart, bereikEind } = bereikVoorWeergave(weergave, referentieDatum);
  const blokInstanties = instantiesInBereik(blokken.blokken, bereikStart, bereikEind);

  // Eén instantie, gedeeld tussen useAgendaSignalen (huishoudProjectSignalen)
  // en de Klusjes-dag-suggesties hieronder — voorheen twee losse instanties
  // (zelfde precedent als de dubbele useDagTypeOverrides-instantie), maar
  // die botsten allebei op hetzelfde Supabase Realtime-kanaal voor
  // hetzelfde huishouden en crashten de hele pagina (zie kluslijstGedeeld.js).
  const huishoudProjecten = useHuishoudProjecten(huishoudenId);
  const { signalen } = useAgendaSignalen(bereikStart, bereikEind, dagTypeOverrides, huishoudProjecten.projecten);

  // Een suggestie die al als blok is toegevoegd (bronId, zie hieronder) mag
  // niet nog een keer voorgesteld worden — pas als dat blok weer verwijderd
  // wordt, verschijnt de suggestie opnieuw (het blok verdwijnt dan uit
  // blokken.blokken, dus de filter hieronder laat 'm vanzelf weer los).
  const isAlToegevoegd = (bronId) => blokken.blokken.some((b) => b.bronId === bronId);

  const openKlusjes = huishoudProjecten.projecten
    .flatMap((p) => {
      // De vereiste van een klusje kan tegenwoordig ook een STAP van een
      // ander klusje zijn — isGeblokkeerd moet daarom tegen de platte
      // klusjes+stappen-lijst checken, niet alleen tegen p.klusjes zelf.
      const alleItems = alleItemsVanProject(p.klusjes);
      return p.klusjes
        // Een klusje met een nog-openstaande vereiste (taakvolgorde, zie
        // isGeblokkeerd) is niet 'op te pakken' — de app moet geen suggestie
        // doen die in de praktijk nog niet uitgevoerd kan worden.
        .filter((k) => !k.afgerond && !isGeblokkeerd(k, alleItems) && !isAlToegevoegd(k.id))
        .map((k) => ({ id: k.id, projectNaam: p.naam, tekst: k.tekst, geschatteUren: k.geschatteUren ?? 1 }));
    })
    .sort((a, b) => b.geschatteUren - a.geschatteUren);

  // Huishoudtaken-suggestie voor de bekeken dag — zelfde 'welke wekelijkse
  // taak staat vandaag gepland'-berekening als HuishoudVandaagOverzicht.jsx
  // op het startscherm, maar dan voor een willekeurige dag i.p.v. alleen
  // vandaag, en met een 'voeg toe als blok'-actie in plaats van alleen tonen.
  const huishoudTaken = useHuishoudTaken(huishoudenId);
  const weekschema = useHuishoudWeekschema(huishoudenId);
  const wekelijkseTaken = huishoudTaken.taken.filter((t) => t.frequentie === 'week');

  useEffect(() => {
    // Pas draaien zodra de echte taken + schemas geladen zijn — anders ziet
    // dit de nog-lege initiële state en upsert het een lege toewijzing over
    // een al bestaand schema heen (zie useHuishoudWeekschema.geladen).
    if (!huishoudTaken.geladen || !weekschema.geladen) return;
    weekschema.zorgVoorWeekschema(wekelijkseTaken);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij het geladen worden bootstrappen/verversen, zie useHuishoudWeekschema.
  }, [huishoudTaken.geladen, weekschema.geladen]);

  const referentieMaandag = maandagVan(referentieDatum);
  const schemaVoorReferentieDag = [weekschema.huidigSchema, weekschema.volgendSchema]
    .find((s) => s?.weekMaandag === referentieMaandag);
  const huidigePeriode = huidigePeriodeKey('week');
  const openHuishoudTaken = schemaVoorReferentieDag
    ? takenVoorDag(wekelijkseTaken, schemaVoorReferentieDag.toewijzing, dagIndexVan(referentieDatum))
      .filter((t) => !huishoudTaken.log[t.id]?.[huidigePeriode] && !isAlToegevoegd(t.id))
    : [];

  // Suggesties hebben allemaal dezelfde 'gewenste' standaardtijd (10:00) —
  // volgendeVrijeTijd schuift automatisch door naar het eerstvolgende vrije
  // tijdvak i.p.v. de tweede/derde suggestie op dezelfde dag te blokkeren
  // (zie agendaBlokken.js). De gebruiker past de exacte tijd zo nodig
  // handmatig aan via het ✏️-bewerken-icoon.
  function voegKlusjeAlsBlokToe(klusje) {
    const duur = klusje.geschatteUren * 60;
    const starttijd = volgendeVrijeTijd(blokken.blokken, referentieDatum, '10:00', duur);
    const eindtijd = pasTijdAan(starttijd, duur);
    blokken.voegToe({
      titel: `${klusje.projectNaam}: ${klusje.tekst}`, type: 'klusjes', datum: referentieDatum, starttijd, eindtijd, herhaling: null, bronId: klusje.id,
    });
    toonToast(`"${klusje.tekst}" toegevoegd aan de Agenda om ${starttijd}`, 'ok');
  }

  // Lift/cardio-suggestie als blok inplannen op de gekozen tijd (ochtend/
  // middag/avond, zie agendaSignalen.js) — 60 min voor lift (StrongLifts-
  // sessie), 45 min voor cardio, zelfde duur-aanpak als de Kluslijst-
  // suggestie hierboven (pasTijdAan).
  function voegTrainingAlsBlokToe(signaal, starttijd) {
    const isLift = signaal.type === 'lift';
    const eindtijd = pasTijdAan(starttijd, isLift ? 60 : 45);
    const nieuwBlok = {
      titel: isLift ? 'Training (lift)' : 'Cardio', type: isLift ? 'kracht' : 'cardio',
      datum: signaal.datum, starttijd, eindtijd, herhaling: null, bronId: signaal.id,
    };
    if (heeftOverlap(blokken.blokken, nieuwBlok)) {
      toonToast(`${starttijd}–${eindtijd} is al bezet — kies een ander tijdstip.`, 'wn');
      return;
    }
    blokken.voegToe(nieuwBlok);
    toonToast(`${signaal.tekst} ingepland om ${starttijd}`, 'ok');
  }

  // Huishoudtaak-suggestie als blok inplannen — duur uit de taak zelf
  // (geschatteUren, zie huishoud_taken-migratie 0017), start standaard om
  // 10:00, schuift automatisch door bij een bezette tijd (zie hierboven).
  function voegHuishoudTaakAlsBlokToe(taak) {
    const duur = (taak.geschatteUren ?? 0.5) * 60;
    const starttijd = volgendeVrijeTijd(blokken.blokken, referentieDatum, '10:00', duur);
    const eindtijd = pasTijdAan(starttijd, duur);
    blokken.voegToe({
      titel: taak.tekst, type: 'huishouden', datum: referentieDatum, starttijd, eindtijd, herhaling: null, bronId: taak.id,
    });
    toonToast(`"${taak.tekst}" toegevoegd aan de Agenda om ${starttijd}`, 'ok');
  }

  // Dagelijkse mediteer-suggestie — geen wekelijks schema of project nodig
  // zoals de andere suggesties hierboven, gewoon elke dag opnieuw aangeboden
  // zolang er nog geen blok voor die dag staat (bronId per datum). Bedoeld
  // om de regie over een terugkerende gewoonte te ondersteunen: de suggestie
  // verdwijnt zodra 'm ingepland is, en komt vanzelf terug de volgende dag.
  const meditatieBronId = `meditatie_${referentieDatum}`;
  const toonMeditatieSuggestie = !isAlToegevoegd(meditatieBronId);

  function voegMeditatieAlsBlokToe() {
    const starttijd = volgendeVrijeTijd(blokken.blokken, referentieDatum, '10:00', 10);
    const eindtijd = pasTijdAan(starttijd, 10);
    blokken.voegToe({
      titel: 'Mediteren', type: 'ontspanning', datum: referentieDatum, starttijd, eindtijd, herhaling: null, bronId: meditatieBronId,
    });
    toonToast(`Mediteren toegevoegd aan de Agenda om ${starttijd}`, 'ok');
  }

  // Hond-suggesties, gezondheid & buiten zijn — op een cardio-dag is er al
  // een wandel-/hardloopmoment gepland (zie voegTrainingAlsBlokToe hierboven),
  // dus dan is de suggestie alleen een korte tip, geen eigen blok. Op een
  // niet-cardio-dag stelt de Agenda twee vaste hond-uitlaatmomenten voor
  // (namiddag + na het avondeten) — losse, elk apart toe te voegen suggesties,
  // zelfde bronId-per-datum-patroon als de mediteer-suggestie hierboven.
  const isCardioDag = signalen.some((s) => s.datum === referentieDatum && s.type === 'cardio');
  const HOND_MOMENTEN = [
    { tijd: '16:00', tekst: 'Hond uitlaten (namiddag)' },
    { tijd: '19:30', tekst: 'Hond uitlaten (na het avondeten)' },
  ];
  const openHondMomenten = isCardioDag
    ? []
    : HOND_MOMENTEN.filter((m) => !isAlToegevoegd(`hond_${m.tijd}_${referentieDatum}`));

  function voegHondWandelingAlsBlokToe(moment) {
    const starttijd = volgendeVrijeTijd(blokken.blokken, referentieDatum, moment.tijd, 30);
    const eindtijd = pasTijdAan(starttijd, 30);
    blokken.voegToe({
      titel: moment.tekst, type: 'buiten', datum: referentieDatum, starttijd, eindtijd, herhaling: null,
      bronId: `hond_${moment.tijd}_${referentieDatum}`,
    });
    toonToast(`"${moment.tekst}" toegevoegd aan de Agenda om ${starttijd}`, 'ok');
  }

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

  function nieuwBlokFormOpenen() {
    setBewerkBlok(null);
    setToonForm(true);
  }

  function bewerkBlokFormOpenen(blok) {
    setBewerkBlok(blok);
    setToonForm(true);
  }

  function blokOpslaan(blok) {
    if (bewerkBlok) blokken.bewerk(bewerkBlok.id, blok);
    else blokken.voegToe(blok);
    setToonForm(false);
    setBewerkBlok(null);
    toonToast(bewerkBlok ? 'Blok gewijzigd' : 'Blok toegevoegd', 'ok');
  }

  // Voorkomt dubbele/overlappende tijdvakken (zie heeftOverlap) — negeert
  // het eigen blok bij het bewerken, anders zou het altijd tegen zichzelf
  // aanlopen.
  function valideerBlok(kandidaat) {
    if (heeftOverlap(blokken.blokken, kandidaat, bewerkBlok?.id ?? null)) {
      return 'Dit tijdvak overlapt met een al gepland blok. Kies een andere tijd.';
    }
    return null;
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
            onBewerkBlok={bewerkBlokFormOpenen}
            afgerondLog={blokken.log}
            onToggleAfgerond={blokken.toggleAfgerond}
            onNieuwBlok={nieuwBlokFormOpenen}
            dagTypeOverride={dagTypeOverrides[referentieDatum] ?? null}
            onZetDagTypeOverride={zetDagTypeOverride}
            openKlusjes={openKlusjes}
            onVoegKlusjeToe={voegKlusjeAlsBlokToe}
            onVoegTrainingToe={voegTrainingAlsBlokToe}
            openHuishoudTaken={openHuishoudTaken}
            onVoegHuishoudTaakToe={voegHuishoudTaakAlsBlokToe}
            toonMeditatieSuggestie={toonMeditatieSuggestie}
            onVoegMeditatieToe={voegMeditatieAlsBlokToe}
            isCardioDag={isCardioDag}
            openHondMomenten={openHondMomenten}
            onVoegHondWandelingToe={voegHondWandelingAlsBlokToe}
          />
        )}
      </div>

      {weergave !== 'dag' && (
        <button className="btn btn-g btn-full" onClick={nieuwBlokFormOpenen}>+ Blok toevoegen</button>
      )}

      {toonForm && (
        <Modal titel={bewerkBlok ? 'Blok bewerken' : 'Nieuw blok'} onClose={() => { setToonForm(false); setBewerkBlok(null); }}>
          <AgendaBlokForm
            initieleDatum={referentieDatum}
            bewerkBlok={bewerkBlok}
            valideer={valideerBlok}
            onOpslaan={blokOpslaan}
            onAnnuleren={() => { setToonForm(false); setBewerkBlok(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
