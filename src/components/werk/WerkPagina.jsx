import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { useWerkInstellingen } from '../../hooks/useWerkInstellingen.js';
import WerkTaken from './WerkTaken.jsx';
import WerkInstellingen from './WerkInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';

// Huishouden, Kluslijst, Ontspullen en Boodschappen zijn verhuisd naar de
// Thuis-module (zie thuis/ThuisPagina.jsx) — Werk is nu puur de werk-taken
// van de dag. huishoudProjecten blijft hier wél nodig (read-only, voor de
// 'koppel aan project'-dropdown in WerkTaken), maar de volledige
// Kluslijst-UI leeft niet meer hier.
export default function WerkPagina({ toonToast, userId, huishoudenId }) {
  const werkTaken = useWerkTaken();
  const huishoudProjecten = useHuishoudProjecten(huishoudenId, userId);
  const { instellingen, bewaar, voegCategorieToe, verwijderCategorie } = useWerkInstellingen();

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div style={{ flex: 1 }} />
        <ModuleInstellingenKnop titel="Werk-instellingen">
          <WerkInstellingen
            instellingen={instellingen}
            bewaar={bewaar}
            voegCategorieToe={voegCategorieToe}
            verwijderCategorie={verwijderCategorie}
          />
        </ModuleInstellingenKnop>
      </div>

      <div className="card">
        <WerkTaken werkTaken={werkTaken} toonToast={toonToast} instellingen={instellingen} huishoudProjecten={huishoudProjecten} />
      </div>
    </div>
  );
}
