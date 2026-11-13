import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import Button from './Button.jsx';

// Rediseño D-24 (DISEÑO_UI_UX §3): primero lo que se hace hoy (Inicio, Explorar, Mi progreso);
// después lo secundario (Historial, Ajustes, Ayuda), separado visualmente.
export const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/biblioteca', label: 'Explorar' },
  { to: '/progreso', label: 'Mi progreso' },
  { to: '/historial', label: 'Historial', secondary: true },
  { to: '/ajustes', label: 'Ajustes', secondary: true },
  { to: '/ayuda', label: 'Ayuda', secondary: true },
];

const LIST_ID = 'menu-principal';

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <nav className="nav-menu" aria-label="Principal">
      <Button
        ref={toggleRef}
        variant="secondary"
        className="nav-menu__toggle"
        aria-expanded={open}
        aria-controls={LIST_ID}
        onClick={() => setOpen((value) => !value)}
      >
        Menú
      </Button>
      <ul id={LIST_ID} className={open ? 'nav-menu__list nav-menu__list--open' : 'nav-menu__list'}>
        {NAV_ITEMS.map((item, index) => (
          <li
            key={item.to}
            className={item.secondary && !NAV_ITEMS[index - 1]?.secondary ? 'nav-menu__item--group' : undefined}
          >
            <NavLink
              to={item.to}
              end={item.end}
              className="nav-menu__link"
              onClick={() => {
                if (open) close();
              }}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
