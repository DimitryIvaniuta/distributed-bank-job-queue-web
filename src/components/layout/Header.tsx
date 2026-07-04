import { Menu, Moon, Sun } from 'lucide-react';
import type { RefObject } from 'react';
import { Link } from 'react-router-dom';

import { runtimeConfig } from '../../config/runtimeConfig';

export function Header({
  navigationTriggerRef,
  navigationOpen,
  theme,
  onToggleTheme,
  onOpenNavigation,
}: {
  navigationTriggerRef: RefObject<HTMLButtonElement | null>;
  navigationOpen: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenNavigation: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          ref={navigationTriggerRef}
          type="button"
          className="icon-button topbar__menu"
          onClick={onOpenNavigation}
          aria-label="Open navigation"
          aria-controls="primary-navigation"
          aria-expanded={navigationOpen}
        >
          <Menu size={22} />
        </button>
        <Link to="/" className="brand" aria-label="BankFlow home">
          <span className="brand__mark" aria-hidden="true">
            BF
          </span>
          <span>
            <strong>BankFlow</strong>
            <small>Queue Console</small>
          </span>
        </Link>
      </div>
      <div className="topbar__right">
        <div className="environment-pill" title="Configured frontend environment">
          <span aria-hidden="true" />
          <div>
            <small>Environment</small>
            <strong>{runtimeConfig.environmentName}</strong>
          </div>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="operator-avatar" title={`Console release ${runtimeConfig.release}`}>
          <span aria-hidden="true">OP</span>
          <span className="sr-only">Operations console release {runtimeConfig.release}</span>
        </div>
      </div>
    </header>
  );
}
