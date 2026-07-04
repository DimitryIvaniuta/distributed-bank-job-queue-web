import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useTheme } from '../../hooks/useTheme';
import { NetworkStatusBanner } from '../system/NetworkStatusBanner';
import { RouteMeta } from '../system/RouteMeta';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigationTriggerRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <RouteMeta />
      <Header
        navigationTriggerRef={navigationTriggerRef}
        navigationOpen={navigationOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenNavigation={() => setNavigationOpen(true)}
      />
      <Sidebar
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        returnFocusRef={navigationTriggerRef}
      />
      <NetworkStatusBanner />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
