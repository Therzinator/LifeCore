import { waardeById } from '../../lib/act/waarden.js';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './DagelijkseWaarde.css';

export default function DagelijkseWaarde({ profiel, dag, setWaardeVandaag, setWaardeTerugblik }) {
  const kernwaarden = profiel.kernwaarden ?? [];

  if (kernwaarden.length === 0) {
    return (
      <div>
        <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Vandaag</div>
        <p className="of-stap-tekst">
          Kies hieronder eerst een paar waarden bij &ldquo;Mijn waarden&rdquo; — dan kun je er hier
          elke dag één uitlichten.
        </p>
      </div>
    );
  }

  if (!dag.waardeVandaag) {
    return (
      <div>
        <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Vandaag</div>
        <p className="of-stap-tekst">Welke waarde wil je vandaag ruimte geven?</p>
        <div className="wv-grid">
          {kernwaarden.map((id) => {
            const w = waardeById(id);
            if (!w) return null;
            return (
              <button key={id} className="wv-chip" onClick={() => setWaardeVandaag(id)}>
                {w.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const gekozen = waardeById(dag.waardeVandaag);

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Vandaag</div>

      <div className="dw-gekozen-kaart">
        <div className="dw-gekozen-label">{gekozen?.label}</div>
        <div className="dw-gekozen-omschrijving">{gekozen?.omschrijving}</div>
      </div>

      <div className="dw-terugblik-vraag">
        Vond je hier vandaag ruimte voor? Er is geen goed of fout antwoord — schrijf gerust niets op.
      </div>
      <div className="sk-inline-rij">
        <textarea
          className="dw-terugblik"
          value={dag.waardeTerugblik}
          onChange={(e) => setWaardeTerugblik(e.target.value)}
          placeholder="Optioneel..."
        />
        <SpraakKnop waarde={dag.waardeTerugblik} onWaarde={setWaardeTerugblik} />
      </div>

      <button
        className="dw-opnieuw"
        onClick={() => {
          setWaardeVandaag(null);
          setWaardeTerugblik('');
        }}
      >
        Andere waarde kiezen
      </button>
    </div>
  );
}
