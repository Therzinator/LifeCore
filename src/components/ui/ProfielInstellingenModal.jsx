import { usePersoonsProfiel } from '../../hooks/usePersoonsProfiel.js';
import { useThemaVoorkeur } from '../../hooks/useThemaVoorkeur.js';

const THEMA_OPTIES = [
  { id: 'donker', label: 'Donker' },
  { id: 'licht', label: 'Licht (volgt later)' },
  { id: 'systeem', label: 'Systeem (volgt later)' },
];

export default function ProfielInstellingenModal() {
  const { profiel, bewaar } = usePersoonsProfiel();
  const { thema, setThema } = useThemaVoorkeur();

  return (
    <div>
      <div className="card">
        <div className="td-label">Thema</div>
        <div className="ti-rij">
          {THEMA_OPTIES.map((optie) => (
            <button
              key={optie.id}
              type="button"
              className={`btn btn-sm ${thema === optie.id ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => setThema(optie.id)}
            >
              {optie.label}
            </button>
          ))}
        </div>
        <p className="ti-hint">
          Licht/systeem is voorlopig alleen een opgeslagen voorkeur — het lichte kleurenpalet zelf volgt later.
        </p>
      </div>

      <div className="card">
        <div className="td-label">Profielgegevens</div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="pim-naam">Naam</label>
          <input
            id="pim-naam"
            className="ti-veld"
            value={profiel.naam ?? ''}
            onChange={(e) => bewaar({ naam: e.target.value })}
            placeholder="Jouw naam"
          />
        </div>
        <p className="ti-hint">Lengte, gewicht en geslacht stel je in bij LiftCore → Mijn profiel.</p>
      </div>
    </div>
  );
}
