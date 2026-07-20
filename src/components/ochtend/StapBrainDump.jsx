import { useState } from 'react';
import { clusterBrainDump } from '../../lib/ochtend/brainCluster.js';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './StapBrainDump.css';

export default function StapBrainDump({ dagdata, volgende, vorige, overslaan, toonToast, onNaarDefusie }) {
  const [tekst, setTekst] = useState(dagdata.dag.brainDump ?? '');
  const [toonUitleg, setToonUitleg] = useState(false);
  const [toegevoegdAanWerk, setToegevoegdAanWerk] = useState(() => new Set());
  const werkTaken = useWerkTaken();

  const clusters = clusterBrainDump(tekst);
  const heeftClusters = clusters.zorgen.length || clusters.taken.length || clusters.ideeen.length;

  function ga() {
    dagdata.setBrainDump(tekst);
    volgende();
  }

  function voegTaakToeAanWerk(zin) {
    werkTaken.voegMeerdereToe([zin]);
    setToegevoegdAanWerk((huidig) => new Set(huidig).add(zin));
    toonToast?.('Toegevoegd aan Werk-taken');
  }

  return (
    <div>
      <div className="of-stap-titel">Brain dump</div>
      <p className="of-stap-tekst">
        Zorgen, taken, losse gedachten — schrijf alles op. Niet sorteren, gewoon opschrijven.
      </p>

      <button className="ad-link" onClick={() => setToonUitleg(true)}>
        Waarom werkt dit?
      </button>

      <div className="sk-inline-rij">
        <textarea
          className="bd-textarea"
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="Schrijf hier alles wat er in je hoofd zit..."
          rows={6}
        />
        <SpraakKnop waarde={tekst} onWaarde={setTekst} />
      </div>

      {heeftClusters > 0 && (
        <div className="bd-clusters">
          {clusters.zorgen.length > 0 && (
            <div className="bd-cluster-item bd-cluster-zorgen">
              <div className="bd-cluster-lbl">Zorgen / onrust</div>
              {clusters.zorgen.map((zin) => (
                <div key={zin} className="bd-cluster-regel">
                  <span className="bd-cluster-zin">{zin}</span>
                  <button type="button" className="bd-actie-btn" onClick={() => onNaarDefusie?.(zin)}>
                    Zet los →
                  </button>
                </div>
              ))}
            </div>
          )}
          {clusters.taken.length > 0 && (
            <div className="bd-cluster-item bd-cluster-taken">
              <div className="bd-cluster-lbl">Taken</div>
              {clusters.taken.map((zin) => {
                const toegevoegd = toegevoegdAanWerk.has(zin);
                return (
                  <div key={zin} className="bd-cluster-regel">
                    <span className="bd-cluster-zin">{zin}</span>
                    <button
                      type="button"
                      className={`bd-actie-btn ${toegevoegd ? 'gedaan' : ''}`}
                      disabled={toegevoegd}
                      onClick={() => voegTaakToeAanWerk(zin)}
                    >
                      {toegevoegd ? '✓ Toegevoegd' : '→ Werk'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {clusters.ideeen.length > 0 && (
            <div className="bd-cluster-item bd-cluster-ideeen">
              <div className="bd-cluster-lbl">Ideeën / overig</div>
              {clusters.ideeen.join(' · ')}
            </div>
          )}
        </div>
      )}

      <div className="of-acties">
        <button className="btn btn-text" onClick={vorige}>Terug</button>
        <button className="btn btn-text" onClick={overslaan}>Overslaan</button>
        <button className="btn btn-p btn-full" onClick={ga}>Verder</button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="brainDump" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
