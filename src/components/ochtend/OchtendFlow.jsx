import { useOchtendflow } from '../../hooks/useOchtendflow.js';
import { useDagdata } from '../../hooks/useDagdata.js';
import { useOchtendInstellingen } from '../../hooks/useOchtendInstellingen.js';
import { useKruisSignalen } from '../../hooks/useKruisSignalen.js';
import Voortgangsbalk from '../ui/Voortgangsbalk.jsx';
import StapWelkom from './StapWelkom.jsx';
import StapCheckin from './StapCheckin.jsx';
import StapAdemhaling from './StapAdemhaling.jsx';
import StapActivering from './StapActivering.jsx';
import StapBrainDump from './StapBrainDump.jsx';
import StapDagfocus from './StapDagfocus.jsx';
import StapAfronden from './StapAfronden.jsx';
import OchtendInstellingen from './OchtendInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import './OchtendFlow.css';

export default function OchtendFlow({ toonToast }) {
  const dagdata = useDagdata();
  const { instellingen, bewaar: bewaarInstellingen } = useOchtendInstellingen();
  const { stapIndex, stapNaam, totaal, volgende, vorige, overslaan } = useOchtendflow(instellingen);
  const { signalen } = useKruisSignalen({ ochtend: instellingen.toonTrainingsherinnering });
  const trainingsherinnering = signalen.find((s) => s.doel === 'ochtend');

  const gedeeld = { dagdata, volgende, vorige, overslaan, toonToast, isEersteStap: stapIndex === 0 };

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Voortgangsbalk stapIndex={stapIndex} totaal={totaal} />
        </div>
        <ModuleInstellingenKnop titel="Ochtendroutine-instellingen">
          <OchtendInstellingen instellingen={instellingen} bewaar={bewaarInstellingen} />
        </ModuleInstellingenKnop>
      </div>

      {stapNaam === 'welkom' && <StapWelkom {...gedeeld} />}
      {stapNaam === 'checkin' && <StapCheckin {...gedeeld} />}
      {stapNaam === 'ademhaling' && <StapAdemhaling {...gedeeld} />}
      {stapNaam === 'activering' && (
        <StapActivering {...gedeeld} geluidFragment={instellingen.geluidFragment} trainingsherinnering={trainingsherinnering?.tekst} />
      )}
      {stapNaam === 'brainDump' && <StapBrainDump {...gedeeld} />}
      {stapNaam === 'dagfocus' && <StapDagfocus {...gedeeld} />}
      {stapNaam === 'afronden' && <StapAfronden {...gedeeld} />}
    </div>
  );
}
