import { useEffect, useState } from 'react';
import AppHeader from './components/layout/AppHeader.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import DesktopShell from './components/layout/DesktopShell.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import Toast from './components/ui/Toast.jsx';
import UpdateBanner from './components/ui/UpdateBanner.jsx';
import InstallBanner from './components/ui/InstallBanner.jsx';
import SnelkeuzeScherm from './components/nav/SnelkeuzeScherm.jsx';
import OchtendFlow from './components/ochtend/OchtendFlow.jsx';
import WaardenPagina from './components/act/WaardenPagina.jsx';
import WelzijnPagina from './components/welzijn/WelzijnPagina.jsx';
import MindfulnessPagina from './components/mindfulness/MindfulnessPagina.jsx';
import TrainingPagina from './components/training/TrainingPagina.jsx';
import CardioPagina from './components/cardio/CardioPagina.jsx';
import AdhdPagina from './components/adhd/AdhdPagina.jsx';
import WerkPagina from './components/werk/WerkPagina.jsx';
import AgendaPagina from './components/agenda/AgendaPagina.jsx';
import DashboardPagina from './components/dashboard/DashboardPagina.jsx';
import InlogScherm from './components/auth/InlogScherm.jsx';
import { useToast } from './hooks/useToast.js';
import { useAuth } from './hooks/useAuth.js';
import { useIsDesktop } from './hooks/useIsDesktop.js';
import { useAppUpdate } from './hooks/useAppUpdate.js';
import { leesLokaal, schrijfLokaal } from './lib/storage/lokaal.js';

function renderModule(paginaId, toonToast, setPagina, agendaInitieleDatum, wisAgendaInitieleDatum) {
  switch (paginaId) {
    case 'ochtend': return <OchtendFlow toonToast={toonToast} />;
    case 'waarden': return <WaardenPagina />;
    case 'welzijn': return <WelzijnPagina />;
    case 'mindfulness': return <MindfulnessPagina toonToast={toonToast} />;
    case 'training': return <TrainingPagina toonToast={toonToast} />;
    case 'cardio': return <CardioPagina toonToast={toonToast} />;
    case 'adhd': return <AdhdPagina toonToast={toonToast} />;
    case 'werk': return <WerkPagina toonToast={toonToast} />;
    case 'agenda':
      return (
        <AgendaPagina
          toonToast={toonToast}
          onNavigeer={setPagina}
          initieleDatum={agendaInitieleDatum}
          onInitieleDatumGeconsumeerd={wisAgendaInitieleDatum}
        />
      );
    case 'dashboard': return <DashboardPagina />;
    default: return null;
  }
}

export default function App() {
  const [pagina, setPaginaState] = useState(() => leesLokaal('actieve_pagina', 'snelkeuze'));
  const [agendaInitieleDatum, setAgendaInitieleDatum] = useState(null);
  const { toasts, toonToast } = useToast();
  const auth = useAuth();
  const isDesktop = useIsDesktop();
  const appUpdate = useAppUpdate();

  function naarAgendaDag(datum) {
    setAgendaInitieleDatum(datum);
    setPagina('agenda');
  }

  function setPagina(nieuwePagina) {
    setPaginaState(nieuwePagina);
    schrijfLokaal('actieve_pagina', nieuwePagina);
    // Snelkeuze is de 'wortel' — daarnaartoe navigeren vervangt de huidige
    // history-entry (voorkomt dat je meerdere keren terug moet om 'm te
    // passeren); elke module krijgt een eigen entry erbovenop, zodat de
    // mobiele terugknop/-gebaar daarvandaan altijd terug naar snelkeuze
    // gaat in plaats van de hele PWA te sluiten (er was voorheen maar één
    // history-entry ooit, dus 'terug' had nergens heen te gaan).
    if (nieuwePagina === 'snelkeuze') {
      window.history.replaceState({ pagina: nieuwePagina }, '');
    } else {
      window.history.pushState({ pagina: nieuwePagina }, '');
    }
  }

  useEffect(() => {
    window.history.replaceState({ pagina }, '');
    function opPopState(e) {
      const doel = e.state?.pagina ?? 'snelkeuze';
      setPaginaState(doel);
      schrijfLokaal('actieve_pagina', doel);
    }
    window.addEventListener('popstate', opPopState);
    return () => window.removeEventListener('popstate', opPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij mount: zet de initiële entry één keer, latere wijzigingen lopen via setPagina.
  }, []);

  if (auth.enabled && !auth.laden && !auth.ingelogd) {
    return (
      <>
        <UpdateBanner actief={appUpdate.nieuweVersieBeschikbaar} onBijwerken={appUpdate.bijwerken} onNegeren={appUpdate.negeren} />
        <InstallBanner />
        <InlogScherm login={auth.login} signup={auth.signup} />
      </>
    );
  }

  if (isDesktop) {
    // Snelkeuze is ook op desktop bereikbaar (via de 'Start'-knop bovenaan de
    // zijbalk of het logo) — toont daar hetzelfde vandaag-/weekoverzicht als
    // op mobiel, i.p.v. altijd geforceerd op de eerste module te starten.
    return (
      <>
        <UpdateBanner actief={appUpdate.nieuweVersieBeschikbaar} onBijwerken={appUpdate.bijwerken} onNegeren={appUpdate.negeren} />
        <InstallBanner />
        <DesktopShell pagina={pagina} setPagina={setPagina} auth={auth}>
          <ErrorBoundary key={pagina}>
            {pagina === 'snelkeuze'
              ? <SnelkeuzeScherm onKies={setPagina} onKiesAgendaDag={naarAgendaDag} />
              : renderModule(pagina, toonToast, setPagina, agendaInitieleDatum, () => setAgendaInitieleDatum(null))}
          </ErrorBoundary>
        </DesktopShell>
        <Toast toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <UpdateBanner actief={appUpdate.nieuweVersieBeschikbaar} onBijwerken={appUpdate.bijwerken} onNegeren={appUpdate.negeren} />
      <AppHeader auth={auth} setPagina={setPagina} />
      <ErrorBoundary key={pagina}>
        <main className="app-main">
          {pagina === 'snelkeuze' && <SnelkeuzeScherm onKies={setPagina} onKiesAgendaDag={naarAgendaDag} />}
          {renderModule(pagina, toonToast, setPagina, agendaInitieleDatum, () => setAgendaInitieleDatum(null))}
        </main>
      </ErrorBoundary>
      <BottomNav pagina={pagina} setPagina={setPagina} />
      <Toast toasts={toasts} />
    </>
  );
}
