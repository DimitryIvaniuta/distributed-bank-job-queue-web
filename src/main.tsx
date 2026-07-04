import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { AppProviders } from './app/AppProviders';
import { ErrorBoundary } from './app/ErrorBoundary';
import './styles/index.css';

const root = document.getElementById('root');
if (root === null) {
  throw new Error('Root element was not found');
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
