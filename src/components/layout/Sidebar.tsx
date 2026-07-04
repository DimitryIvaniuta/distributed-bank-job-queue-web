import { X } from 'lucide-react';
import { useEffect, useRef, type RefObject } from 'react';
import { NavLink } from 'react-router-dom';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import { navigationGroups } from './navigation';

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sidebar({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const asideRef = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width: 920px)');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false;
        returnFocusRef.current?.focus();
      }
      return undefined;
    }

    wasOpen.current = true;
    closeButtonRef.current?.focus();
    document.body.classList.add('navigation-open');

    const onDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }

      const focusable = Array.from(
        asideRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (first === undefined || last === undefined) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onDocumentKeyDown);
    return () => {
      document.body.classList.remove('navigation-open');
      document.removeEventListener('keydown', onDocumentKeyDown);
    };
  }, [onClose, open, returnFocusRef]);

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${open ? 'sidebar-backdrop--open' : ''}`}
        aria-label="Close navigation"
        onClick={onClose}
        hidden={!open}
      />
      <aside
        ref={asideRef}
        id="primary-navigation"
        className={`sidebar ${open ? 'sidebar--open' : ''}`}
        aria-label="Primary navigation"
        aria-hidden={isMobile && !open ? true : undefined}
        aria-modal={isMobile && open ? true : undefined}
        role={isMobile ? 'dialog' : undefined}
      >
        <div className="sidebar__mobile-header">
          <strong>Navigation</strong>
          <button
            ref={closeButtonRef}
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <nav>
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group__label">{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? item.end : false}
                    onClick={onClose}
                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
                  >
                    <Icon size={19} aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar__environment">
          <span className="sidebar__environment-dot" aria-hidden="true" />
          <div>
            <strong>Operations workspace</strong>
            <small>Production-safe client</small>
          </div>
        </div>
      </aside>
    </>
  );
}
