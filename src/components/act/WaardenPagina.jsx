import { useDagdata } from '../../hooks/useDagdata.js';
import { useWaardenprofiel } from '../../hooks/useWaardenprofiel.js';
import { useWaardenInstellingen } from '../../hooks/useWaardenInstellingen.js';
import { useKruisSignalen } from '../../hooks/useKruisSignalen.js';
import DagelijkseWaarde from './DagelijkseWaarde.jsx';
import WaardenVerheldering from './WaardenVerheldering.jsx';
import DefusieOefening from './DefusieOefening.jsx';
import WaardenInstellingen from './WaardenInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';

export default function WaardenPagina() {
  const dagdata = useDagdata();
  const { profiel, setKernwaarden } = useWaardenprofiel();
  const { instellingen, bewaar } = useWaardenInstellingen();
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
        <DefusieOefening />
      </div>
    </div>
  );
}
