import './BottomNav.css';

const TABS = [
  { id: 'ochtend', label: 'Ochtend' },
  { id: 'waarden', label: 'Waarden' },
  { id: 'welzijn', label: 'Welzijn' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'training', label: 'Training' },
];

export default function BottomNav({ pagina, setPagina }) {
  return (
    <nav className="bn-wrap">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`bn-tab ${pagina === tab.id ? 'on' : ''}`}
          onClick={() => setPagina(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
