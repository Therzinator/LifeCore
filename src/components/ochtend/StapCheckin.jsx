import { useState } from 'react';
import './StapCheckin.css';

const OPTIES = ['laag', 'midden', 'hoog'];

function Keuzegroep({ label, waarde, onKies }) {
  return (
    <div className="ci-groep">
      <div className="ci-vraag">{label}</div>
      <div className="ci-opties">
        {OPTIES.map((optie) => (
          <button
            key={optie}
            className={`ci-optie ${waarde === optie ? 'on' : ''}`}
            onClick={() => onKies(optie)}
          >
            {optie}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StapCheckin({ dagdata, volgende, vorige, overslaan }) {
  const [energie, setEnergie] = useState(dagdata.dag.checkin?.energie ?? null);
  const [slaap, setSlaap] = useState(dagdata.dag.checkin?.slaap ?? null);
  const [stemming, setStemming] = useState(dagdata.dag.checkin?.stemming ?? null);

  function ga() {
    dagdata.setCheckin({ energie, slaap, stemming });
    volgende();
  }

  return (
    <div>
      <div className="of-stap-titel">Hoe voel je je?</div>
      <p className="of-stap-tekst">Geen goed of fout antwoord — een korte peiling.</p>

      <Keuzegroep label="Energie" waarde={energie} onKies={setEnergie} />
      <Keuzegroep label="Slaapkwaliteit" waarde={slaap} onKies={setSlaap} />
      <Keuzegroep label="Stemming" waarde={stemming} onKies={setStemming} />

      <div className="of-acties">
        <button className="btn btn-text" onClick={vorige}>Terug</button>
        <button className="btn btn-text" onClick={overslaan}>Overslaan</button>
        <button className="btn btn-p btn-full" onClick={ga}>Verder</button>
      </div>
    </div>
  );
}
