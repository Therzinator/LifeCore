import { useOchtendflow } from '../../hooks/useOchtendflow.js';
import { useDagdata } from '../../hooks/useDagdata.js';
import Voortgangsbalk from '../ui/Voortgangsbalk.jsx';
import StapWelkom from './StapWelkom.jsx';
import StapCheckin from './StapCheckin.jsx';
import StapAdemhaling from './StapAdemhaling.jsx';
import StapBrainDump from './StapBrainDump.jsx';
import StapDagfocus from './StapDagfocus.jsx';
import StapAfronden from './StapAfronden.jsx';
import './OchtendFlow.css';

export default function OchtendFlow({ toonToast }) {
  const { stapIndex, stapNaam, totaal, volgende, vorige, overslaan } = useOchtendflow();
  const dagdata = useDagdata();

  const gedeeld = { dagdata, volgende, vorige, overslaan, toonToast, isEersteStap: stapIndex === 0 };

  return (
    <div className="of-wrap">
      <Voortgangsbalk stapIndex={stapIndex} totaal={totaal} />

      {stapNaam === 'welkom' && <StapWelkom {...gedeeld} />}
      {stapNaam === 'checkin' && <StapCheckin {...gedeeld} />}
      {stapNaam === 'ademhaling' && <StapAdemhaling {...gedeeld} />}
      {stapNaam === 'brainDump' && <StapBrainDump {...gedeeld} />}
      {stapNaam === 'dagfocus' && <StapDagfocus {...gedeeld} />}
      {stapNaam === 'afronden' && <StapAfronden {...gedeeld} />}
    </div>
  );
}
