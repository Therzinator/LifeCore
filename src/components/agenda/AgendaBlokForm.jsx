import { useState } from 'react';

const TYPES = [
  { id: 'ontspanning', label: 'Ontspanning' },
  { id: 'sport', label: 'Sport / bewegen' },
  { id: 'sociaal', label: 'Sociaal' },
  { id: 'overig', label: 'Overig' },
];

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
          <input id="ag-start" type="time" className="ti-veld" value={starttijd} onChange={(e) => setStarttijd(e.target.value)} />
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="ag-eind">Eindtijd</label>
          <input id="ag-eind" type="time" className="ti-veld" value={eindtijd} onChange={(e) => setEindtijd(e.target.value)} />
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
