import { useState } from 'react';
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
import DashboardPagina from './components/dashboard/DashboardPagina.jsx';
import AlgemeneInstellingen from './components/instellingen/AlgemeneInstellingen.jsx';
import InlogScherm from './components/auth/InlogScherm.jsx';
import { useToast } from './hooks/useToast.js';
import { useAuth } from './hooks/useAuth.js';
import { useIsDesktop } from './hooks/useIsDesktop.js';
import { useAppUpdate } from './hooks/useAppUpdate.js';
import { leesLokaal, schrijfLokaal } from './lib/storage/lokaal.js';

// Modules die hun eigen 'Instellingen'-tab/paneel hebben — voor deze modules
// stuurt het tandwiel-icoon een signaal naar de actieve pagina in plaats van
// te navigeren naar de losse, algemene instellingenpagina.
const MODULES_MET_EIGEN_INSTELLINGEN = new Set(['training', 'adhd', 'mindfulness', 'ochtend']);

function renderModule(paginaId, toonToast, onTerug, instellingenSignaal) {
  switch (paginaId) {
    case 'ochtend': return <OchtendFlow toonToast={toonToast} instellingenSignaal={instellingenSignaal} />;
    case 'waarden': return <WaardenPagina />;
    case 'welzijn': return <WelzijnPagina />;
    case 'mindfulness': return <MindfulnessPagina toonToast={toonToast} instellingenSignaal={instellingenSignaal} />;
    case 'training': return <TrainingPagina toonToast={toonToast} instellingenSignaal={instellingenSignaal} />;
    case 'cardio': return <CardioPagina toonToast={toonToast} />;
    case 'adhd': return <AdhdPagina toonToast={toonToast} instellingenSignaal={instellingenSignaal} />;
    case 'werk': return <WerkPagina toonToast={toonToast} />;
    case 'dashboard': return <DashboardPagina />;
    case 'instellingen': return <AlgemeneInstellingen onTerug={onTerug} />;
    default: return null;
  }
}

export default function App() {
  const [pagina, setPaginaState] = useState(() => leesLokaal('actieve_pagina', 'snelkeuze'));
  const [instellingenSignaal, setInstellingenSignaal] = useState(0);
  const { toasts, toonToast } = useToast();
  const auth = useAuth();
  const isDesktop = useIsDesktop();
  const appUpdate = useAppUpdate();

  function setPagina(nieuwePagina) {
    setPaginaState(nieuwePagina);
    schrijfLokaal('actieve_pagina', nieuwePagina);
  }

  function naarInstellingen(actievePagina) {
    if (MODULES_MET_EIGEN_INSTELLINGEN.has(actievePagina)) {
      setInstellingenSignaal((n) => n + 1);
    } else {
      setPagina('instellingen');
    }
  }

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
    // Snelkeuze bestaat alleen als mobiel startscherm — op desktop toont de
    // zijbalk alle modules altijd, dus valt een 'snelkeuze'-pagina terug op
    // de eerste module.
    const desktopPagina = pagina === 'snelkeuze' ? 'ochtend' : pagina;
    return (
      <>
        <UpdateBanner actief={appUpdate.nieuweVersieBeschikbaar} onBijwerken={appUpdate.bijwerken} onNegeren={appUpdate.negeren} />
        <InstallBanner />
        <DesktopShell
          pagina={desktopPagina}
          setPagina={setPagina}
          auth={auth}
          onInstellingen={() => naarInstellingen(desktopPagina)}
        >
          <ErrorBoundary key={desktopPagina}>
            {renderModule(desktopPagina, toonToast, () => setPagina('ochtend'), instellingenSignaal)}
          </ErrorBoundary>
        </DesktopShell>
        <Toast toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <UpdateBanner actief={appUpdate.nieuweVersieBeschikbaar} onBijwerken={appUpdate.bijwerken} onNegeren={appUpdate.negeren} />
      <AppHeader auth={auth} onInstellingen={() => naarInstellingen(pagina)} />
      <ErrorBoundary key={pagina}>
        <main className="app-main">
          {pagina === 'snelkeuze' && <SnelkeuzeScherm onKies={setPagina} />}
          {renderModule(pagina, toonToast, () => setPagina('snelkeuze'), instellingenSignaal)}
        </main>
      </ErrorBoundary>
      <BottomNav pagina={pagina} setPagina={setPagina} />
      <Toast toasts={toasts} />
    </>
  );
}
