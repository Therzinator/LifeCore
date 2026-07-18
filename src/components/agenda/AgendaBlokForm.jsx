import { useState } from 'react';

const TYPES = [
  // 'kracht'/'cardio' zijn ad-hoc trainings-/cardioblokken — voor als de
  // vaste weekdagen (LIFT_DAGEN/CARDIO_DAGEN) een keer niet uitkomen. Een
  // blok van dit type linkt in de dagweergave direct door naar de
  // bijbehorende module om de sessie ook echt te starten.
  { id: 'kracht', label: 'Kracht' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'ontspanning', label: 'Ontspanning' },
  { id: 'sport', label: 'Sport / bewegen' },
  { id: 'sociaal', label: 'Sociaal' },
  // Los van 'sport'/'overig' — eigen bedrijf in ontwerpfase (nog geen omzet)
  // telt bewust niet mee als regulier werk.
  { id: 'eigenbedrijf', label: 'Eigen bedrijf' },
  { id: 'overig', label: 'Overig' },
];

// Verplaatst een 'HH:MM'-tijd met deltaMinuten, met wrap-around binnen een
// etmaal (bv. 23:30 + 60min -> 00:30).
function pasTijdAan(tijd, deltaMinuten) {
  const [uur, minuut] = tijd.split(':').map(Number);
  const totaal = (((uur * 60 + minuut + deltaMinuten) % (24 * 60)) + 24 * 60) % (24 * 60);
  const nieuwUur = String(Math.floor(totaal / 60)).padStart(2, '0');
  const nieuwMinuut = String(totaal % 60).padStart(2, '0');
  return `${nieuwUur}:${nieuwMinuut}`;
}

export default function AgendaBlokForm({ initieleDatum, onOpslaan, onAnnuleren }) {
  const [titel, setTitel] = useState('');
  const [type, setType] = useState('ontspanning');
  const [datum, setDatum] = useState(initieleDatum);
  const [starttijd, setStarttijd] = useState('18:00');
  const [eindtijd, setEindtijd] = useState('19:00');
  const [herhaling, setHerhaling] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!titel.trim()) return;
    onOpslaan({ titel: titel.trim(), type, datum, starttijd, eindtijd, herhaling: herhaling ? 'wekelijks' : null });
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
            <input id="ag-start" type="time" className="ti-veld" value={starttijd} onChange={(e) => setStarttijd(e.target.value)} />
            <button type="button" className="btn btn-g btn-sm" onClick={() => setStarttijd((t) => pasTijdAan(t, 60))} aria-label="Starttijd een uur later">+1u</button>
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

      <div className="of-acties">
        <button type="button" className="btn btn-text" onClick={onAnnuleren}>Annuleren</button>
        <button type="submit" className="btn btn-p btn-full">Opslaan</button>
      </div>
    </form>
  );
}
