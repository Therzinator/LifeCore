import { useState } from 'react';
import { pasTijdAan } from '../../lib/agenda/agendaBlokken.js';

const TYPES = [
  // 'kracht'/'cardio' zijn ad-hoc trainings-/cardioblokken — voor als de
  // vaste weekdagen (LIFT_DAGEN/CARDIO_DAGEN) een keer niet uitkomen. 'werk'/
  // 'klusjes' linken analoog door naar de Werk-module. Een blok van zo'n
  // type linkt in de dagweergave direct door naar de bijbehorende module.
  { id: 'kracht', label: 'Kracht' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'ontspanning', label: 'Ontspanning' },
  { id: 'klusjes', label: 'Klusjes' },
  { id: 'huishouden', label: 'Huishouden' },
  { id: 'werk', label: 'Werk' },
  { id: 'sociaal', label: 'Sociaal' },
  // Eigen bedrijf in ontwerpfase (nog geen omzet) telt bewust niet mee als
  // regulier 'werk'.
  { id: 'eigenbedrijf', label: 'Eigen bedrijf' },
  { id: 'overig', label: 'Overig' },
];

// Verwacht 'HH:MM'. Bij een leeg/onvolledig getypt tussenresultaat (bv. tijdens
// het typen in de native picker) niets aanpassen — pas op een geldige waarde.
function isVolledigeTijd(tijd) {
  return /^\d{2}:\d{2}$/.test(tijd ?? '');
}

// bewerkBlok (optioneel): het bestaande blok bij het aanpassen van een
// tijdvak — vult alle velden voor i.p.v. de vaste standaardwaarden.
// valideer (optioneel): (kandidaatBlok) => foutmelding | null, aangeroepen
// vóór onOpslaan; bij een foutmelding wordt die inline getoond en NIET
// opgeslagen — voorkomt dubbele/overlappende tijdvakken (zie
// heeftOverlap in agendaBlokken.js).
export default function AgendaBlokForm({ initieleDatum, bewerkBlok, valideer, onOpslaan, onAnnuleren }) {
  const [titel, setTitel] = useState(bewerkBlok?.titel ?? '');
  const [type, setType] = useState(bewerkBlok?.type ?? 'ontspanning');
  const [datum, setDatum] = useState(bewerkBlok?.datum ?? initieleDatum);
  const [starttijd, setStarttijd] = useState(bewerkBlok?.starttijd ?? '18:00');
  const [eindtijd, setEindtijd] = useState(bewerkBlok?.eindtijd ?? '19:00');
  const [herhaling, setHerhaling] = useState(Boolean(bewerkBlok?.herhaling));
  const [fout, setFout] = useState(null);

  function wijzigStarttijd(nieuweStarttijd) {
    setStarttijd(nieuweStarttijd);
    if (isVolledigeTijd(nieuweStarttijd)) setEindtijd(pasTijdAan(nieuweStarttijd, 60));
  }

  function submit(e) {
    e.preventDefault();
    if (!titel.trim()) return;
    const blok = { titel: titel.trim(), type, datum, starttijd, eindtijd, herhaling: herhaling ? 'wekelijks' : null };
    const foutmelding = valideer?.(blok) ?? null;
    if (foutmelding) { setFout(foutmelding); return; }
    setFout(null);
    onOpslaan(blok);
  }

  return (
    <form className="ag-blok-form" onSubmit={submit}>
      <div className="ti-veld-grp">
        <label className="ti-lbl" htmlFor="ag-titel">Titel</label>
        <input id="ag-titel" className="ti-veld" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="bijv. wandeling met partner" />
      </div>

      <div className="ti-veld-grp">
        <label className="ti-lbl">Type</label>
        <div className="ti-rij">
          {TYPES.map((t) => (
            <button
              key={t.id} type="button"
              className={`btn btn-sm ${type === t.id ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => setType(t.id)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="ti-veld-grp">
        <label className="ti-lbl" htmlFor="ag-datum">Datum</label>
        <input id="ag-datum" type="date" className="ti-veld" value={datum} onChange={(e) => setDatum(e.target.value)} />
      </div>

      <div className="ti-rij">
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="ag-start">Starttijd</label>
          <div className="ag-tijd-ctrl">
            <button type="button" className="btn btn-g btn-sm" onClick={() => setStarttijd((t) => pasTijdAan(t, -60))} aria-label="Starttijd een uur eerder">−1u</button>
            <input id="ag-start" type="time" className="ti-veld" value={starttijd} onChange={(e) => wijzigStarttijd(e.target.value)} />
            <button
              type="button"
              className="btn btn-g btn-sm"
              onClick={() => setStarttijd((t) => {
                const nieuw = pasTijdAan(t, 60);
                // Voorkomt een 0-minuten-blok: als de starttijd de eindtijd
                // inhaalt, schuift de eindtijd automatisch een uur mee —
                // alleen bij exacte gelijkheid, niet standaard bij elke klik.
                if (nieuw === eindtijd) setEindtijd((e) => pasTijdAan(e, 60));
                return nieuw;
              })}
              aria-label="Starttijd een uur later"
            >+1u</button>
          </div>
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="ag-eind">Eindtijd</label>
          <div className="ag-tijd-ctrl">
            <button type="button" className="btn btn-g btn-sm" onClick={() => setEindtijd((t) => pasTijdAan(t, -60))} aria-label="Eindtijd een uur eerder">−1u</button>
            <input id="ag-eind" type="time" className="ti-veld" value={eindtijd} onChange={(e) => setEindtijd(e.target.value)} />
            <button type="button" className="btn btn-g btn-sm" onClick={() => setEindtijd((t) => pasTijdAan(t, 60))} aria-label="Eindtijd een uur later">+1u</button>
          </div>
        </div>
      </div>

      <label className="ag-herhaling-rij">
        <input type="checkbox" checked={herhaling} onChange={(e) => setHerhaling(e.target.checked)} />
        <span>Herhaalt wekelijks</span>
      </label>

      {fout && <p className="is-fout">{fout}</p>}

      <div className="of-acties">
        <button type="button" className="btn btn-text" onClick={onAnnuleren}>Annuleren</button>
        <button type="submit" className="btn btn-p btn-full">{bewerkBlok ? 'Wijzigen' : 'Opslaan'}</button>
      </div>
    </form>
  );
}
