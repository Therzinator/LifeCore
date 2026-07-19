import { useDagdata } from '../../hooks/useDagdata.js';
import { useWaardenprofiel } from '../../hooks/useWaardenprofiel.js';
import { useWaardenInstellingen } from '../../hooks/useWaardenInstellingen.js';
import { useWaardenkompas } from '../../hooks/useWaardenkompas.js';
import { useToegewijdeActies } from '../../hooks/useToegewijdeActies.js';
import { useKruisSignalen } from '../../hooks/useKruisSignalen.js';
import DagelijkseWaarde from './DagelijkseWaarde.jsx';
import WaardenVerheldering from './WaardenVerheldering.jsx';
import DefusieOefening from './DefusieOefening.jsx';
import WaardenKompas from './WaardenKompas.jsx';
import ToegewijdeActiePlanner from './ToegewijdeActiePlanner.jsx';
import WaardenInstellingen from './WaardenInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';

// UITBREIDING WAARDEN-MODULE — ACT MATRIX — TODO
// De ACT Matrix (4-kwadranten visuele tool: van-weg-bewegen/naar-toe-bewegen
// x binnenwereld/buitenwereld) is bewust nog niet gebouwd — krachtiger maar
// complexer dan de drie onderdelen hierboven, pas oppakken als daar behoefte
// aan blijkt. Niet verwarren met BullsEyeTarget.jsx (het waardenkompas) —
// dat is een ander, al gebouwd instrument.

export default function WaardenPagina() {
  const dagdata = useDagdata();
  const { profiel, setKernwaarden } = useWaardenprofiel();
  const { instellingen, bewaar } = useWaardenInstellingen();
  const kompas = useWaardenkompas();
  const acties = useToegewijdeActies();
  const { signalen } = useKruisSignalen({ waarden: instellingen.toonWelzijnSuggesties });
  const welzijnSuggestie = signalen.find((s) => s.doel === 'waarden');

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div style={{ flex: 1 }} />
        <ModuleInstellingenKnop titel="Waarden-instellingen">
          <WaardenInstellingen instellingen={instellingen} bewaar={bewaar} />
        </ModuleInstellingenKnop>
      </div>

      {welzijnSuggestie && <div className="ad-banner warn">{welzijnSuggestie.tekst}</div>}

      <div className="card">
        <DagelijkseWaarde
          profiel={profiel}
          dag={dagdata.dag}
          setWaardeVandaag={dagdata.setWaardeVandaag}
          setWaardeTerugblik={dagdata.setWaardeTerugblik}
        />
      </div>

      <div className="card">
        <WaardenVerheldering profiel={profiel} setKernwaarden={setKernwaarden} />
      </div>

      <div className="card">
        <WaardenKompas kompas={kompas} instellingen={instellingen} />
      </div>

      <div className="card">
        <ToegewijdeActiePlanner acties={acties} />
      </div>

      <div className="card">
        <DefusieOefening />
      </div>
    </div>
  );
}
