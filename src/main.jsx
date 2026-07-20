import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { SubstapProvider } from './contexts/SubstapContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Laatste redmiddel: vangt crashes op in chrome-componenten (header,
        navigatie) die buiten de route-specifieke ErrorBoundary in App.jsx
        vallen — zonder deze bleef een crash daar de app permanent blanco. */}
    <ErrorBoundary>
      <SubstapProvider>
        <App />
      </SubstapProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
