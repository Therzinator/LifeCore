import { useDagdata } from '../../hooks/useDagdata.js';
import { useWaardenprofiel } from '../../hooks/useWaardenprofiel.js';
import DagelijkseWaarde from './DagelijkseWaarde.jsx';
import WaardenVerheldering from './WaardenVerheldering.jsx';
import DefusieOefening from './DefusieOefening.jsx';

export default function WaardenPagina() {
  const dagdata = useDagdata();
  const { profiel, setKernwaarden } = useWaardenprofiel();

  return (
    <div className="of-wrap">
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
