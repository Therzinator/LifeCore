import { MODULE_ICONEN, IconSnelkeuze } from '../ui/ModuleIconen.jsx';
import './BottomNav.css';

const TABS = [
  { id: 'ochtend', label: 'Ochtend' },
  { id: 'waarden', label: 'Waarden' },
  { id: 'welzijn', label: 'Welzijn' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'training', label: 'Training' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'adhd', label: 'Focus' },
  { id: 'werk', label: 'Werk' },
  { id: 'dashboard', label: 'Dashboard' },
];

export default function BottomNav({ pagina, setPagina }) {
  return (
    <nav className="bn-wrap">
      <button
        className={`bn-tab bn-tab-snelkeuze ${pagina === 'snelkeuze' ? 'on' : ''}`}
        onClick={() => setPagina('snelkeuze')}
        aria-label="Snelkeuze"
      >
        <IconSnelkeuze className="bn-icoon" />
        Start
      </button>
      {TABS.map((tab) => {
        const Icoon = MODULE_ICONEN[tab.id];
        return (
          <button
            key={tab.id}
            className={`bn-tab ${pagina === tab.id ? 'on' : ''}`}
            onClick={() => setPagina(tab.id)}
          >
            <Icoon className="bn-icoon" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
