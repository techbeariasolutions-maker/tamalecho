import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import Button from './Button.jsx';

export const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/biblioteca', label: 'Biblioteca' },
  { to: '/historial', label: 'Historial' },
  { to: '/progreso', label: 'Progreso' },
  { to: '/ajustes', label: 'Ajustes' },
  { to: '/ayuda', label: 'Ayuda' },
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
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
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
