import { useState } from 'react';
import AppHeader from './components/layout/AppHeader.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import Toast from './components/ui/Toast.jsx';
import OchtendFlow from './components/ochtend/OchtendFlow.jsx';
import WaardenPagina from './components/act/WaardenPagina.jsx';
import WelzijnPagina from './components/welzijn/WelzijnPagina.jsx';
import MindfulnessPagina from './components/mindfulness/MindfulnessPagina.jsx';
import TrainingPagina from './components/training/TrainingPagina.jsx';
import InlogScherm from './components/auth/InlogScherm.jsx';
import { useToast } from './hooks/useToast.js';
import { useAuth } from './hooks/useAuth.js';
import { leesLokaal, schrijfLokaal } from './lib/storage/lokaal.js';

export default function App() {
  const [pagina, setPaginaState] = useState(() => leesLokaal('actieve_pagina', 'ochtend'));
  const { toasts, toonToast } = useToast();
  const auth = useAuth();

  function setPagina(nieuwePagina) {
    setPaginaState(nieuwePagina);
    schrijfLokaal('actieve_pagina', nieuwePagina);
  }

  if (auth.enabled && !auth.laden && !auth.ingelogd) {
    return <InlogScherm login={auth.login} signup={auth.signup} />;
  }

  return (
    <>
      <AppHeader auth={auth} />
      <ErrorBoundary key={pagina}>
        <main>
          {pagina === 'ochtend' && <OchtendFlow toonToast={toonToast} />}
          {pagina === 'waarden' && <WaardenPagina />}
          {pagina === 'welzijn' && <WelzijnPagina />}
          {pagina === 'mindfulness' && <MindfulnessPagina toonToast={toonToast} />}
          {pagina === 'training' && <TrainingPagina />}
        </main>
      </ErrorBoundary>
      <BottomNav pagina={pagina} setPagina={setPagina} />
      <Toast toasts={toasts} />
    </>
  );
}
