const DAGDELEN = [
  { sleutel: 'dagdeelOchtend', label: 'Ochtend' },
  { sleutel: 'dagdeelMiddag', label: 'Middag' },
  { sleutel: 'dagdeelAvond', label: 'Avond' },
];

export default function AgendaInstellingen({ instellingen, bewaar }) {
  function veld(sleutel, deel) {
    return (e) => bewaar({ [sleutel]: { ...instellingen[sleutel], [deel]: e.target.value } });
  }

  return (
    <div>
      <p className="of-stap-tekst">
        De Agenda-suggesties (Kluslijst, huishouden, mediteren) bieden voortaan een keuze uit deze drie dagdelen
        i.p.v. één vaste tijd — bij elke suggestie wordt binnen het gekozen venster een vrij tijdvak gezocht.
      </p>
      <div className="card">
        {DAGDELEN.map(({ sleutel, label }) => (
          <div className="ti-veld-grp" key={sleutel} style={{ marginBottom: 'var(--space-sm)' }}>
            <label className="ti-lbl">{label}</label>
            <div className="ti-rij">
              <input
                type="time" className="ti-veld" aria-label={`${label} start`}
                value={instellingen[sleutel].start} onChange={veld(sleutel, 'start')}
              />
              <input
                type="time" className="ti-veld" aria-label={`${label} eind`}
                value={instellingen[sleutel].eind} onChange={veld(sleutel, 'eind')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
