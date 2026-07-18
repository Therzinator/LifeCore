import { useState } from 'react';
import { clusterBrainDump } from '../../lib/ochtend/brainCluster.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './StapBrainDump.css';

export default function StapBrainDump({ dagdata, volgende, vorige, overslaan }) {
  const [tekst, setTekst] = useState(dagdata.dag.brainDump ?? '');
  const [toonUitleg, setToonUitleg] = useState(false);

  const clusters = clusterBrainDump(tekst);
  const heeftClusters = clusters.zorgen.length || clusters.taken.length || clusters.ideeen.length;

  function ga() {
    dagdata.setBrainDump(tekst);
    volgende();
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

      <textarea
        className="bd-textarea"
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="Schrijf hier alles wat er in je hoofd zit..."
        rows={6}
      />

      {heeftClusters > 0 && (
        <div className="bd-clusters">
          {clusters.zorgen.length > 0 && (
            <div className="bd-cluster-item bd-cluster-zorgen">
              <div className="bd-cluster-lbl">Zorgen / onrust</div>
              {clusters.zorgen.join(' · ')}
            </div>
          )}
          {clusters.taken.length > 0 && (
            <div className="bd-cluster-item bd-cluster-taken">
              <div className="bd-cluster-lbl">Taken</div>
              {clusters.taken.join(' · ')}
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
