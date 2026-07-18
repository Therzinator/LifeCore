import { useState } from 'react';
import { useVragenlijstGeschiedenis } from '../../hooks/useVragenlijstGeschiedenis.js';
import { MBI_SUBSCHALEN, berekenScores as berekenMbiScores } from '../../lib/welzijn/mbi.js';
import { REQ_DIMENSIES, berekenScores as berekenReqScores } from '../../lib/welzijn/req.js';
import { relatieveTijd } from '../../utils/datum.js';
import VragenlijstCheck from './VragenlijstCheck.jsx';
import './WelzijnPagina.css';

export default function WelzijnPagina() {
  const mbiGeschiedenis = useVragenlijstGeschiedenis('welzijn_mbi');
  const reqGeschiedenis = useVragenlijstGeschiedenis('welzijn_req');
  const [actieveCheck, setActieveCheck] = useState(null);

  if (actieveCheck === 'mbi') {
    return (
      <div className="of-wrap">
        <div className="card">
          <VragenlijstCheck
            titel="Burn-out check"
            subschalen={MBI_SUBSCHALEN}
            berekenScores={berekenMbiScores}
            onderbouwingSleutel="mbiGS"
            geschiedenis={mbiGeschiedenis}
            onKlaar={() => setActieveCheck(null)}
          />
        </div>
      </div>
    );
  }

  if (actieveCheck === 'req') {
    return (
      <div className="of-wrap">
        <div className="card">
          <VragenlijstCheck
            titel="Herstelcheck"
            subschalen={REQ_DIMENSIES}
            berekenScores={berekenReqScores}
            onderbouwingSleutel="reqHerstel"
            geschiedenis={reqGeschiedenis}
            onKlaar={() => setActieveCheck(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="of-wrap">
      <div className="card">
        <div className="wp-titel">Burn-out check</div>
        <div className="wp-laatst">Laatst: {relatieveTijd(mbiGeschiedenis.laatste?.datum)}</div>
        <button className="btn btn-p btn-full" onClick={() => setActieveCheck('mbi')}>
          {mbiGeschiedenis.laatste ? 'Opnieuw doen' : 'Starten'}
        </button>
      </div>

      <div className="card">
        <div className="wp-titel">Herstelcheck</div>
        <div className="wp-laatst">Laatst: {relatieveTijd(reqGeschiedenis.laatste?.datum)}</div>
        <button className="btn btn-p btn-full" onClick={() => setActieveCheck('req')}>
          {reqGeschiedenis.laatste ? 'Opnieuw doen' : 'Starten'}
        </button>
      </div>
    </div>
  );
}
